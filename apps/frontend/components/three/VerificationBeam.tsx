"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function VerificationBeam({ active }: { active: boolean }) {
  const ref = useRef<any>();

  useFrame((state) => {
    if (ref.current && active) {
      // Pulsing scanning scale
      ref.current.scale.x = 1.0 + Math.sin(state.clock.getElapsedTime() * 8) * 0.15;
      ref.current.scale.z = 1.0 + Math.sin(state.clock.getElapsedTime() * 8) * 0.15;
    }
  });

  if (!active) return null;

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.08, 0.4, 6, 16, 1, true]} />
      <meshBasicMaterial
        color="#00d4ff"
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
}
