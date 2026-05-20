"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface CredentialCard3DProps {
  position: [number, number, number];
  title: string;
  issuer: string;
  type: string;
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function CredentialCard3D({
  position,
  title,
  issuer,
  type,
  id,
  isSelected,
  onSelect,
}: CredentialCard3DProps) {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  // Floating micro-animation
  useFrame((state) => {
    if (meshRef.current) {
      // Slow float
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time + parseFloat(id.substring(0, 3) || "0")) * 0.15;
      // Slow spin
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.15 + (isSelected ? Math.PI : 0);
    }
  });

  // Pick type emoji
  const getEmoji = (t: string) => {
    if (t.includes("degree")) return "🎓";
    if (t.includes("cert")) return "📜";
    if (t.includes("license")) return "🛡️";
    return "🔬";
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Front Face Glass Card */}
      <mesh>
        <boxGeometry args={[2.2, 1.4, 0.08]} />
        <meshPhysicalMaterial
          color={isSelected ? "#00d4ff" : hovered ? "#7c3aed" : "#111638"}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.85}
          transmission={0.6}
          thickness={1.2}
          clearcoat={1.0}
        />
      </mesh>

      {/* Outer Glow Border Frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[2.26, 1.46, 0.04]} />
        <meshBasicMaterial
          color={isSelected ? "#00d4ff" : hovered ? "#a78bfa" : "#312e81"}
          wireframe
        />
      </mesh>

      {/* Emoji Graphic */}
      <Text
        position={[-0.8, 0.3, 0.06]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {getEmoji(type)}
      </Text>

      {/* Title Text */}
      <Text
        position={[0.1, 0.25, 0.06]}
        fontSize={0.12}
        color="#ffffff"
        maxWidth={1.4}
        font="https://fonts.gstatic.com/s/outfit/v11/q3u9o56pGDoF4dPD2H92.woff2"
        anchorX="left"
        anchorY="middle"
      >
        {title.length > 22 ? `${title.substring(0, 22)}...` : title}
      </Text>

      {/* Issuer Text */}
      <Text
        position={[0.1, -0.05, 0.06]}
        fontSize={0.09}
        color="#22d3ee"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2bo.woff2"
        anchorX="left"
        anchorY="middle"
      >
        {issuer}
      </Text>

      {/* SoulBound label */}
      <Text
        position={[0, -0.45, 0.06]}
        fontSize={0.08}
        color="#7c3aed"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2bo.woff2"
        anchorX="center"
        anchorY="middle"
      >
        🔒 SBT permanently LOCKED
      </Text>
    </group>
  );
}
