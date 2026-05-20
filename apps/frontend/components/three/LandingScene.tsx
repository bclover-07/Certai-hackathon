"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import StarsField from "./StarsField";
import HolographicGrid from "./HolographicGrid";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function FloatingPyramid() {
  const meshRef = useRef<any>();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.4;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.5, 0]} />
      <meshPhysicalMaterial
        color="#00d4ff"
        roughness={0.1}
        metalness={0.3}
        transparent
        opacity={0.6}
        transmission={0.6}
        thickness={1.5}
        clearcoat={1.0}
      />
    </mesh>
  );
}

export default function LandingScene() {
  return (
    <div className="h-full w-full relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00d4ff" />
        <pointLight position={[-5, -5, -5]} intensity={1.0} color="#7c3aed" />

        {/* Scenic Starfield and grid */}
        <StarsField />
        <HolographicGrid />

        {/* Dynamic Holographic Badge object */}
        <FloatingPyramid />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.0} />
      </Canvas>
    </div>
  );
}
