"use client";

export default function HolographicGrid() {
  return (
    <group position={[0, -2.5, 0]}>
      {/* Floor Grid */}
      <gridHelper
        args={[30, 30, "#7c3aed", "#1e1b4b"]}
        position={[0, 0, 0]}
      />
      
      {/* Soft floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial
          color="#001133"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
