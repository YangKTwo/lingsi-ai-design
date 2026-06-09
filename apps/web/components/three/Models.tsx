'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ==================== 杯子模型 ====================
export function MugModel({ color = '#ffffff', designUrl }: { color?: string; designUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 杯身 */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1, 0.95, 1.5, 64]} />
        <meshStandardMaterial
          color={color}
          metalness={0.05}
          roughness={0.35}
          envMapIntensity={hovered ? 1.2 : 0.8}
        />
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
      {/* 画布 */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.5, 2.1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.02}
          roughness={0.5}
          envMapIntensity={hovered ? 1.2 : 0.8}
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

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 身体 */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.6, 0.3]} />
        <meshStandardMaterial
          color={color}
          metalness={0.02}
          roughness={0.7}
          envMapIntensity={hovered ? 1.2 : 0.8}
        />
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

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.13
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 机身 */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.6, 0.08]} />
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.3}
          envMapIntensity={hovered ? 1.2 : 0.8}
        />
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
