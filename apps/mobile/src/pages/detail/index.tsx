/**
 * 作品详情页
 *
 * 路由参数: ?id=xxx
 */
import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { useRouter, showToast, setClipboardData, previewImage } from '@tarojs/taro'
import { getProjectDetail } from '../../services/api'
import type { DesignProject } from '../../services/types'
import './index.scss'

export default function DetailPage() {
  const router = useRouter()
  const id = router.params?.id ?? ''
  const [project, setProject] = useState<DesignProject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProjectDetail(id).then(data => {
      setProject(data)
      setLoading(false)
    })
  }, [id])

  const handleShare = () => {
    setClipboardData({
      data: `灵思AI设计 — ${project?.title}\n${project?.description}`,
    }).then(() => showToast({ title: '已复制分享文案', icon: 'success' }))
  }

  const handlePreview = () => {
    if (project?.imageUrl) {
      previewImage({
        urls: [project.imageUrl],
        current: project.imageUrl,
      })
    }
  }

  if (loading) {
    return (
      <View className='page-container'>
        <View className='loading-hint'><Text>加载中...</Text></View>
      </View>
    )
  }

  if (!project) {
    return (
      <View className='page-container'>
        <View className='loading-hint'><Text>作品不存在或已下架</Text></View>
      </View>
    )
  }

  return (
    <View className='page-container'>
      {/* 作品大图 */}
      <Image
        className='detail-image'
        src={project.imageUrl}
        mode='widthFix'
        onClick={handlePreview}
      />

      {/* 作品信息 */}
      <View className='detail-body card'>
        <Text className='detail-title'>{project.title}</Text>

        <View className='detail-meta'>
          <Text className='detail-author'>👤 {project.author}</Text>
          <Text className='detail-date'>{project.createdAt}</Text>
          <Text className='detail-likes'>❤ {project.likes}</Text>
        </View>

        <View className='detail-tags'>
          {project.tags.map(tag => (
            <Text key={tag} className='tag'>{tag}</Text>
          ))}
        </View>

        {project.description && (
          <Text className='detail-desc'>{project.description}</Text>
        )}
      </View>

      {/* 操作按钮 */}
      <View className='detail-actions'>
        <Button className='btn-primary' onClick={handleShare}>
          分享作品
        </Button>
      </View>
    </View>
  )
}
