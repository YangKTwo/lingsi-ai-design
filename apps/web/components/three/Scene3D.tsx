'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Grid, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { MugModel, PosterModel, TShirtModel, PhoneCaseModel } from './Models'
import { Loader2 } from 'lucide-react'

export type ProductType = 'mug' | 'poster' | 'tshirt' | 'phonecase'

interface Scene3DProps {
  activeModel: ProductType
  modelColor: string
}

function ModelRenderer({ activeModel, modelColor }: Scene3DProps) {
  switch (activeModel) {
    case 'mug':
      return <MugModel color={modelColor} />
    case 'poster':
      return <PosterModel color={modelColor} />
    case 'tshirt':
      return <TShirtModel color={modelColor} />
    case 'phonecase':
      return <PhoneCaseModel color={modelColor} />
    default:
      return <MugModel color={modelColor} />
  }
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/50 z-10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <span className="text-sm text-[var(--text-secondary)]">加载 3D 场景…</span>
      </div>
    </div>
  )
}

export function Scene3D({ activeModel, modelColor }: Scene3DProps) {
  return (
    <div className="relative w-full h-full">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMappingExposure: 1.2 }}>
          {/* 相机 */}
          <PerspectiveCamera makeDefault position={[0, 0.8, 5.5]} fov={45} />

          {/* 光照 */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-radius={4}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.8} />
          <spotLight position={[0, 5, 3]} intensity={1} angle={0.3} penumbra={0.5} />

          {/* 模型 */}
          <ModelRenderer activeModel={activeModel} modelColor={modelColor} />

          {/* 地面阴影 */}
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.45}
            scale={8}
            blur={2.5}
            far={4}
          />

          {/* 网格参考线 */}
          <Grid
            position={[0, -2, 0]}
            infiniteGrid
            cellSize={0.5}
            cellThickness={0.5}
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#7c3aed"
            fadeDistance={20}
            fadeStrength={1.5}
          />

          {/* 轨道控制 */}
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={2.5}
            maxDistance={10}
            maxPolarAngle={Math.PI / 1.8}
            target={[0, -0.1, 0]}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}
