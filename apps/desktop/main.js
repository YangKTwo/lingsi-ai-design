/**
 * 灵思AI设计工作台 — Electron 主进程
 *
 * 职责：
 *   1. 创建桌面窗口，加载 Next.js 页面
 *   2. 注册全局快捷键 Ctrl+Shift+L 唤起窗口
 *   3. 系统托盘（最小化到托盘）
 *   4. 提供本地文件读写能力（通过 preload 暴露给渲染进程）
 */

const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  dialog,
  ipcMain,
  shell,
} = require("electron");
const path = require("path");
const fs = require("fs");

// ==========================================
// 配置
// ==========================================

const isDev =
  process.env.NODE_ENV === "development" ||
  process.argv.includes("--dev") ||
  !app.isPackaged;

const WEB_URL = process.env.WEB_URL || (isDev ? "http://localhost:3000" : "http://localhost:3000");
// 生产环境建议：先执行 pnpm build:web && pnpm start:web，再启动桌面端
// 或者设置环境变量 WEB_URL 指向远程/本地服务地址

const WIN_CONFIG = {
  width: 1400,
  height: 900,
  minWidth: 900,
  minHeight: 600,
  title: "灵思AI设计工作台",
  icon: path.join(__dirname, "public", "icon.png"),
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
    spellcheck: false,
  },
  // 隐藏默认标题栏（配合前端自定义标题栏，可选）
  // titleBarStyle: 'hidden',
  show: false, // 先不显示，等 ready 后再显示（避免白屏闪烁）
};

// ==========================================
// 全局状态
// ==========================================

let mainWindow = null;
let tray = null;
let isQuitting = false;

// ==========================================
// 窗口创建
// ==========================================

function createWindow() {
  mainWindow = new BrowserWindow(WIN_CONFIG);

  // 加载页面
  console.log(`[Main] 加载地址: ${WEB_URL}`);

  mainWindow.loadURL(WEB_URL).catch((err) => {
    console.error("[Main] 加载失败:", err.message);
    // 如果 Next.js 没启动，显示提示页
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`
        <html>
          <body style="
            font-family: system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #0b0b1a;
            color: #eeecf5;
          ">
            <h1 style="color: #a78bfa">灵思AI设计工作台</h1>
            <p style="color: #9ca3af; margin-top: 8px;">
              前端服务未启动，请在终端执行：
            </p>
            <code style="
              background: #1f1f45;
              padding: 12px 24px;
              border-radius: 12px;
              margin-top: 12px;
              font-size: 14px;
              color: #eeecf5;
            ">cd apps/web && pnpm dev</code>
            <p style="color: #6b7280; margin-top: 24px; font-size: 13px;">
              启动后再按 <kbd style="
                background: #1f1f45;
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid #333;
              ">Ctrl+R</kbd> 刷新此窗口
            </p>
          </body>
        </html>
    `)}`
    );
  });

  // 就绪后显示
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    // 开发模式下打开 DevTools
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  // 窗口关闭 → 最小化到托盘（而不是退出）
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // 外部链接用系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWindow;
}

// ==========================================
// 系统托盘
// ==========================================

function createTray() {
  // 用一个 16x16 的 data URL 做托盘图标（无外部文件依赖）
  const iconPath = path.join(__dirname, "public", "icon.png");
  if (!fs.existsSync(iconPath)) {
    // 创建一个简单托盘图标
    const { nativeImage } = require("electron");
    // 16x16 紫色方块作为临时图标
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      buffer[i * 4] = 124;     // R
      buffer[i * 4 + 1] = 58;  // G
      buffer[i * 4 + 2] = 237; // B
      buffer[i * 4 + 3] = 255; // A
    }
    const img = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    tray = new Tray(img);
  } else {
    tray = new Tray(iconPath);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示窗口",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("灵思AI设计工作台");
  tray.setContextMenu(contextMenu);

  // 双击托盘图标显示窗口
  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ==========================================
// 全局快捷键
// ==========================================

function registerShortcuts() {
  // Ctrl+Shift+L 唤起窗口
  const registered = globalShortcut.register("CommandOrControl+Shift+L", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  if (!registered) {
    console.warn("[Main] 全局快捷键注册失败（可能已被占用）");
  } else {
    console.log("[Main] 全局快捷键 Ctrl+Shift+L 已注册");
  }
}

// ==========================================
// IPC 通信（主进程 ↔ 渲染进程）
// ==========================================

function registerIPC() {
  // 打开文件选择对话框
  ipcMain.handle("dialog:openFile", async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: options?.filters || [
        { name: "图片文件", extensions: ["png", "jpg", "jpeg", "webp", "gif"] },
        { name: "所有文件", extensions: ["*"] },
      ],
    });
    if (result.canceled) return null;

    const filePath = result.filePaths[0];
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    return {
      name: fileName,
      path: filePath,
      data: fileBuffer.toString("base64"),
      size: fileBuffer.length,
    };
  });

  // 保存文件
  ipcMain.handle("dialog:saveFile", async (event, { fileName, data, filters }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: fileName,
      filters: filters || [
        { name: "PNG 图片", extensions: ["png"] },
        { name: "所有文件", extensions: ["*"] },
      ],
    });
    if (result.canceled || !result.filePath) return false;

    const buffer = Buffer.from(data, "base64");
    fs.writeFileSync(result.filePath, buffer);
    return true;
  });

  // 读取本地文件
  ipcMain.handle("fs:readFile", async (event, filePath) => {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 写入本地文件
  ipcMain.handle("fs:writeFile", async (event, { filePath, data }) => {
    try {
      fs.writeFileSync(filePath, data, "utf-8");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 获取应用版本
  ipcMain.handle("app:getVersion", () => {
    return app.getVersion();
  });

  // 获取平台信息
  ipcMain.handle("app:getPlatform", () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      isDev,
    };
  });
}

// ==========================================
// 应用生命周期
// ==========================================

app.whenReady().then(() => {
  registerIPC();
  createWindow();
  createTray();
  registerShortcuts();

  // macOS: 点击 Dock 图标重新创建窗口
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// 所有窗口关闭时退出（macOS 除外）
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    isQuitting = true;
    app.quit();
  }
});

// 退出前清理
app.on("before-quit", () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});

// 防止多实例
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
