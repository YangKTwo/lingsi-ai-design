/**
 * 个人中心
 */
import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { showToast, showModal, navigateTo } from '@tarojs/taro'
import { checkHealth } from '../../services/api'
import { APP_NAME } from '../../services/types'
import './index.scss'

interface MenuItem {
  icon: string
  title: string
  desc?: string
  action: () => void
}

export default function ProfilePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    checkHealth().then(ok => setApiStatus(ok ? 'online' : 'offline'))
  }, [])

  const menuItems: MenuItem[] = [
    {
      icon: '🖼️',
      title: '我的作品',
      desc: '查看已保存的设计作品',
      action: () => showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      icon: '❤️',
      title: '我的收藏',
      desc: '收藏的灵感与设计',
      action: () => showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      icon: '⚙️',
      title: '设置',
      desc: '主题、通知、缓存管理',
      action: () => showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      icon: '💬',
      title: '意见反馈',
      desc: '告诉我们你的想法',
      action: () => showToast({ title: '感谢反馈！', icon: 'success' }),
    },
  ]

  return (
    <View className='page-container'>
      {/* 用户信息卡片 */}
      <View className='profile-header'>
        <View className='profile-avatar'>🧑‍🎨</View>
        <Text className='profile-name'>设计师</Text>
        <Text className='profile-bio'>用 AI 重新定义设计工作流</Text>

        {/* API 状态 */}
        <View className={`api-status api-status--${apiStatus}`}>
          <View className='api-dot' />
          <Text className='api-text'>
            {apiStatus === 'checking' && '检测中...'}
            {apiStatus === 'online' && `✅ ${APP_NAME} API 已连接`}
            {apiStatus === 'offline' && '⚠️ API 离线，使用本地模式'}
          </Text>
        </View>
      </View>

      {/* 菜单列表 */}
      <View className='menu-list'>
        {menuItems.map((item, i) => (
          <View key={i} className='menu-item' onClick={item.action}>
            <Text className='menu-icon'>{item.icon}</Text>
            <View className='menu-content'>
              <Text className='menu-title'>{item.title}</Text>
              {item.desc && <Text className='menu-desc'>{item.desc}</Text>}
            </View>
            <Text className='menu-arrow'>›</Text>
          </View>
        ))}
      </View>

      {/* 底部 */}
      <View className='profile-footer'>
        <Text className='footer-text'>{APP_NAME} v0.1.0</Text>
        <Text className='footer-text'>AI 驱动的设计工具平台</Text>
      </View>
    </View>
  )
}
