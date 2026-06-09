/**
 * 灵感广场 — 首页
 *
 * 功能：
 *  - 瀑布流展示设计作品
 *  - 下拉刷新
 *  - 点击进入详情
 */
import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { usePullDownRefresh, useDidShow, navigateTo } from '@tarojs/taro'
import DesignCard from '../../components/DesignCard'
import { getInspirations } from '../../services/api'
import type { DesignProject } from '../../services/types'
import './index.scss'

export default function IndexPage() {
  const [projects, setProjects] = useState<DesignProject[]>([])
  const [loading, setLoading] = useState(true)
  const [leftCol, setLeftCol] = useState<DesignProject[]>([])
  const [rightCol, setRightCol] = useState<DesignProject[]>([])

  const loadData = async () => {
    setLoading(true)
    const data = await getInspirations()
    setProjects(data)
    // 瀑布流分栏：奇偶交替
    const left: DesignProject[] = []
    const right: DesignProject[] = []
    data.forEach((p, i) => {
      i % 2 === 0 ? left.push(p) : right.push(p)
    })
    setLeftCol(left)
    setRightCol(right)
    setLoading(false)
  }

  useDidShow(() => {
    if (projects.length === 0) loadData()
  })

  usePullDownRefresh(() => {
    loadData().then(() => {
      // Taro 4.x 下拉刷新回调
      if (typeof wx !== 'undefined') wx.stopPullDownRefresh()
    })
  })

  const goDetail = (id: string) => {
    navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  return (
    <View className='page-container'>
      {/* 顶部标题区 */}
      <View className='hero'>
        <Text className='hero__title'>灵感广场</Text>
        <Text className='hero__subtitle'>发现优秀设计 · 激发创作灵感</Text>
      </View>

      {/* 作品瀑布流 */}
      {loading ? (
        <View className='loading-hint'>
          <Text>加载中...</Text>
        </View>
      ) : (
        <View className='waterfall'>
          <View className='waterfall-column'>
            {leftCol.map(p => (
              <DesignCard key={p.id} project={p} onTap={goDetail} />
            ))}
          </View>
          <View className='waterfall-column'>
            {rightCol.map(p => (
              <DesignCard key={p.id} project={p} onTap={goDetail} />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
