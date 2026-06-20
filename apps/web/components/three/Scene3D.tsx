'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Grid, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useState, useCallback } from 'react'
import * as THREE from 'three'
import { MugModel, PosterModel, TShirtModel, PhoneCaseModel } from './Models'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

export type ProductType = 'mug' | 'poster' | 'tshirt' | 'phonecase'

interface Scene3DProps {
  activeModel: ProductType
  modelColor: string
  designUrl?: string
}

function ModelRenderer({ activeModel, modelColor, designUrl }: Scene3DProps) {
  switch (activeModel) {
    case 'mug':
      return <MugModel color={modelColor} designUrl={designUrl} />
    case 'poster':
      return <PosterModel color={modelColor} designUrl={designUrl} />
    case 'tshirt':
      return <TShirtModel color={modelColor} designUrl={designUrl} />
    case 'phonecase':
      return <PhoneCaseModel color={modelColor} designUrl={designUrl} />
    default:
      return <MugModel color={modelColor} designUrl={designUrl} />
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

export function Scene3D({ activeModel, modelColor, designUrl }: Scene3DProps) {
  const [contextLost, setContextLost] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    // 修复 PCFSoftShadowMap 弃用 → 使用 PCFShadowMap
    gl.shadowMap.type = THREE.PCFShadowMap

    // WebGL 上下文丢失 / 恢复处理
    const onLost = (e: Event) => { e.preventDefault(); setContextLost(true) }
    const onRestored = () => { setContextLost(false) }
    gl.domElement.addEventListener('webglcontextlost', onLost)
    gl.domElement.addEventListener('webglcontextrestored', onRestored)
  }, [])

  const handleRetry = () => {
    setContextLost(false)
    setCanvasKey(k => k + 1)
  }

  return (
    <div className="relative w-full h-full">
      {/* WebGL 上下文丢失提示 */}
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/90 z-20">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xl">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
            <div className="text-center">
              <p className="font-semibold text-[var(--text-primary)]">3D 渲染引擎中断</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                可能是显存不足或标签页被挂起
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重新加载
            </button>
          </div>
        </div>
      )}

      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          key={canvasKey}
          shadows="pcf"
          dpr={[1, 2]}
          gl={{ antialias: true, toneMappingExposure: 1.2 }}
          onCreated={handleCreated}
        >
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
          <ModelRenderer activeModel={activeModel} modelColor={modelColor} designUrl={designUrl} />

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
