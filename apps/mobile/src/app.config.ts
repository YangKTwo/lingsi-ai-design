/**
 * Taro App 配置 — 页面路由 + 窗口样式 + TabBar
 */
export default defineAppConfig({
  pages: [
    'pages/index/index',    // 灵感广场
    'pages/detail/index',   // 作品详情
    'pages/profile/index',  // 个人中心
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#7c3aed',
    navigationBarTitleText: '灵思AI设计',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f3ff',
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#7c3aed',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '灵感广场',
        iconPath: 'assets/tab-inspiration.png',
        selectedIconPath: 'assets/tab-inspiration-active.png',
      },
      {
        pagePath: 'pages/detail/index',
        text: '作品详情',
        iconPath: 'assets/tab-detail.png',
        selectedIconPath: 'assets/tab-detail-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-profile.png',
        selectedIconPath: 'assets/tab-profile-active.png',
      },
    ],
  },
})
