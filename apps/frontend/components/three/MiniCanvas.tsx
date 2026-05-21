'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function OrbitingCard({ color, radius, speed, offset, yOffset }: { color: string; radius: number; speed: number; offset: number; yOffset: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset;
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
      meshRef.current.position.y = yOffset + Math.sin(t * 2) * 0.2;
      meshRef.current.rotation.y = -t + Math.PI / 2;
      meshRef.current.rotation.x = Math.sin(t) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.8, 1.2, 0.05]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function MiniCanvas() {
  return (
    <div className="h-[200px] w-full relative bg-[#030508]/60 rounded-xl overflow-hidden border border-white/5">
      <Canvas camera={{ position: [0, 2, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        <OrbitingCard color="#00d4ff" radius={1.5} speed={0.4} offset={0} yOffset={0} />
        <OrbitingCard color="#a855f7" radius={1.6} speed={0.3} offset={Math.PI * 0.67} yOffset={0.2} />
        <OrbitingCard color="#fbbf24" radius={1.4} speed={0.5} offset={Math.PI * 1.33} yOffset={-0.2} />

        <Stars radius={100} depth={50} count={150} factor={4} saturation={0.5} fade speed={1} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
