/**
 * 设计作品卡片 — 瀑布流展示
 */
import { View, Image, Text } from '@tarojs/components'
import type { DesignProject } from '../services/types'
import './DesignCard.scss'

interface Props {
  project: DesignProject
  onTap: (id: string) => void
}

export default function DesignCard({ project, onTap }: Props) {
  return (
    <View className='design-card' onClick={() => onTap(project.id)}>
      <Image
        className='design-card__image'
        src={project.imageUrl}
        mode='widthFix'
        lazyLoad
      />
      <View className='design-card__body'>
        <Text className='design-card__title'>{project.title}</Text>
        {project.description && (
          <Text className='design-card__desc'>{project.description.slice(0, 60)}...</Text>
        )}
        <View className='design-card__meta'>
          <Text className='design-card__author'>{project.author}</Text>
          <Text className='design-card__likes'>❤ {project.likes}</Text>
        </View>
        <View className='design-card__tags'>
          {project.tags.map(tag => (
            <Text key={tag} className='tag'>{tag}</Text>
          ))}
        </View>
      </View>
    </View>
  )
}
