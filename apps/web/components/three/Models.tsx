'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 手动加载纹理（避免 useTexture + fallback URL 带来的 Suspense 挂死问题）。
 * 只在有 designUrl 时才加载，无贴图时返回 null。
 */
function useDesignTexture(designUrl?: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!designUrl) {
      setTexture(null)
      return
    }
    console.log('[贴图] 开始加载:', designUrl.slice(0, 50))
    const loader = new THREE.TextureLoader()
    let cancelled = false
    loader.load(
      designUrl,
      (tex) => {
        if (cancelled) return
        console.log('[贴图] 加载成功, 尺寸:', tex.image?.width, 'x', tex.image?.height)
        tex.needsUpdate = true
        setTexture(tex)
      },
      undefined,
      (err) => console.error('[贴图] 加载失败:', err)
    )
    return () => { cancelled = true }
  }, [designUrl])

  return texture
}

/**
 * 将纹理通过 ref 直接写入材质的 map 属性。
 * 绕过 R3F props diffing 对 THREE.Texture 对象更新检测不完善的问题。
 */
function useApplyTexture(texture: THREE.Texture | null) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  useEffect(() => {
    if (matRef.current) {
      matRef.current.map = texture
      matRef.current.needsUpdate = true
    }
  }, [texture])

  return matRef
}

// ==================== 杯子模型 ====================
export function MugModel({ color = '#ffffff', designUrl }: { color?: string; designUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useDesignTexture(designUrl)
  const bodyMatRef = useApplyTexture(texture)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 杯身（贴图区域） */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1, 0.95, 1.5, 64]} />
        <meshStandardMaterial ref={bodyMatRef} color={color} metalness={0.05} roughness={0.35} />
      </mesh>
      {/* 杯柄 */}
      <mesh position={[1.05, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.35, 0.08, 16, 32]} />
        <meshStandardMaterial color={color} metalness={0.05} roughness={0.35} />
      </mesh>
      {/* 杯内 */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.05, 64]} />
        <meshStandardMaterial color="#111111" metalness={0.1} roughness={0.2} />
      </mesh>
    </group>
  )
}

// ==================== 海报/画框模型 ====================
export function PosterModel({ color = '#f5f5f5', designUrl }: { color?: string; designUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useDesignTexture(designUrl)
  const canvasMatRef = useApplyTexture(texture)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 画框 */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 2.4, 0.06]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* 画布（贴图区域） */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.5, 2.1]} />
        <meshStandardMaterial
          ref={canvasMatRef}
          color={texture ? '#ffffff' : color}
          metalness={0.02}
          roughness={0.5}
        />
      </mesh>
      {/* 玻璃 */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1.5, 2.1]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.1}
          transparent
          opacity={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  )
}

// ==================== T恤模型（几何近似） ====================
export function TShirtModel({ color = '#ffffff', designUrl }: { color?: string; designUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useDesignTexture(designUrl)
  const bodyMatRef = useApplyTexture(texture)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 身体（贴图区域） */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.6, 0.3]} />
        <meshStandardMaterial ref={bodyMatRef} color={color} metalness={0.02} roughness={0.7} />
      </mesh>
      {/* 左袖 */}
      <mesh position={[-0.8, 0.3, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.25]} />
        <meshStandardMaterial color={color} metalness={0.02} roughness={0.7} />
      </mesh>
      {/* 右袖 */}
      <mesh position={[0.8, 0.3, 0]} rotation={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.25]} />
        <meshStandardMaterial color={color} metalness={0.02} roughness={0.7} />
      </mesh>
      {/* 领口 */}
      <mesh position={[0, 1.0, 0.05]}>
        <torusGeometry args={[0.3, 0.06, 8, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

// ==================== 手机壳模型 ====================
export function PhoneCaseModel({ color = '#333333', designUrl }: { color?: string; designUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useDesignTexture(designUrl)
  const backMatRef = useApplyTexture(texture)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.13
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 机身（贴图区域 — 背面可见） */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.6, 0.08]} />
        <meshStandardMaterial ref={backMatRef} color={color} metalness={0.1} roughness={0.3} />
      </mesh>
      {/* 屏幕 */}
      <mesh position={[0, 0.1, 0.05]}>
        <planeGeometry args={[0.65, 1.3]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* 摄像头 */}
      <mesh position={[-0.15, 0.9, 0.06]}>
        <circleGeometry args={[0.06, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  )
}
