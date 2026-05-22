"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import VerificationBeam from "./VerificationBeam";

interface CredentialCard3DProps {
  position: [number, number, number];
  title: string;
  issuer: string;
  type: string;
  id: string;
  isSelected: boolean;
  isFilteredOut?: boolean;
  onSelect: (id: string) => void;
}

export default function CredentialCard3D({
  position,
  title,
  issuer,
  type,
  id,
  isSelected,
  isFilteredOut = false,
  onSelect,
}: CredentialCard3DProps) {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  // Track the current animated positions for smooth LERP transitions
  const currentPos = useRef<[number, number, number]>([...position]);

  // Linear interpolation helper
  const lerp = (start: number, end: number, amt: number) => {
    return (1 - amt) * start + amt * end;
  };

  // Floating micro-animation and smooth interpolation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();

      // Smoothly interpolate current coordinates towards target coords
      currentPos.current[0] = lerp(currentPos.current[0], position[0], 0.08);
      currentPos.current[1] = lerp(currentPos.current[1], position[1], 0.08);
      currentPos.current[2] = lerp(currentPos.current[2], position[2], 0.08);

      // Compute dynamic floating wave offset (sink cards to abyss if filtered out)
      const floatOffset = isFilteredOut
        ? -6.0
        : Math.sin(time * 1.5 + parseFloat(id.substring(0, 3) || "0")) * 0.12;

      meshRef.current.position.x = currentPos.current[0];
      meshRef.current.position.y = lerp(meshRef.current.position.y, currentPos.current[1] + floatOffset, 0.08);
      meshRef.current.position.z = currentPos.current[2];

      // Smooth scaling (completely shrink cards to 0 when filtered out)
      const targetScale = isFilteredOut
        ? 0.0
        : isSelected
        ? 1.25
        : hovered
        ? 1.12
        : 1.0;

      meshRef.current.scale.x = lerp(meshRef.current.scale.x, targetScale, 0.12);
      meshRef.current.scale.y = lerp(meshRef.current.scale.y, targetScale, 0.12);
      meshRef.current.scale.z = lerp(meshRef.current.scale.z, targetScale, 0.12);

      // Smooth rotation (preserve original spin offset but LERP it)
      const targetRotY = Math.sin(time * 0.2) * 0.15 + (isSelected ? Math.PI : 0);
      meshRef.current.rotation.y = lerp(meshRef.current.rotation.y, targetRotY, 0.1);
    }
  });

  // Pick type emoji
  const getEmoji = (t: string) => {
    const lower = t.toLowerCase();
    if (lower.includes("degree") || lower.includes("academic")) return "🎓";
    if (lower.includes("cert")) return "📜";
    if (lower.includes("license")) return "🛡️";
    if (lower.includes("medical")) return "🩺";
    if (lower.includes("research")) return "🔬";
    if (lower.includes("volunteer")) return "🤝";
    return "💡";
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (!isFilteredOut) {
          onSelect(id);
        }
      }}
      onPointerOver={() => {
        if (!isFilteredOut) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Dynamic light glowing on active/hovered cards */}
      {(hovered || isSelected) && !isFilteredOut && (
        <pointLight
          position={[0, 0, 0.25]}
          distance={3}
          intensity={isSelected ? 2.0 : 0.8}
          color={isSelected ? "#00d4ff" : "#7c3aed"}
        />
      )}

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
        anchorX="center"
        anchorY="middle"
      >
        🔒 SBT permanently LOCKED
      </Text>

      {/* Verification Beam shooting down to ground grid from card center */}
      <VerificationBeam active={isSelected && !isFilteredOut} />
    </group>
  );
}
