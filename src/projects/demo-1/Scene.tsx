import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three/webgpu'

export default function Scene() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => { ref.current.rotation.x += dt * 0.3; ref.current.rotation.y += dt * 0.5 })
  return (
    <group position={[0, 0, 0]}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.3, 220, 32]} />
        {/* @ts-ignore */}
        <meshStandardNodeMaterial color="#5ab0ff" metalness={0.6} roughness={0.2} />
      </mesh>
      <pointLight position={[3, 3, 3]} intensity={40} />
    </group>
  )
}
