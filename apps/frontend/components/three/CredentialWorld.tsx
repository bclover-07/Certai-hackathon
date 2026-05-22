"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import StarsField from "./StarsField";
import HolographicGrid from "./HolographicGrid";
import CredentialCard3D from "./CredentialCard3D";
import { useWorldStore } from "../../store/worldStore";

interface Credential {
  _id: string;
  title: string;
  issuerName: string;
  credentialType: string;
}

interface CredentialWorldProps {
  credentials: Credential[];
}

// Custom local LERP helper
const lerp = (start: number, end: number, amt: number) => {
  return (1 - amt) * start + amt * end;
};

// Holographic Concentric Core
function HolographicCore({ layoutMode }: { layoutMode: string }) {
  const innerRef = useRef<any>();
  const outerRef = useRef<any>();
  const groupRef = useRef<any>();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (innerRef.current) {
      innerRef.current.rotation.x = time * 0.45;
      innerRef.current.rotation.y = time * 0.6;
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = -time * 0.25;
      outerRef.current.rotation.y = -time * 0.35;
    }
    if (groupRef.current) {
      // Smoothly LERP scale down in grid mode to prevent card blockage
      const targetScale = layoutMode === "grid" ? 0.0 : 1.0;
      groupRef.current.scale.x = lerp(groupRef.current.scale.x, targetScale, 0.08);
      groupRef.current.scale.y = lerp(groupRef.current.scale.y, targetScale, 0.08);
      groupRef.current.scale.z = groupRef.current.scale.x;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Light glow at core */}
      <pointLight distance={6} intensity={2.5} color="#00d4ff" />

      {/* Inner Glowing Wireframe icosahedron */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial
          color="#00d4ff"
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Outer Rotating Lattice */}
      <mesh ref={outerRef}>
        <dodecahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Glowing Orbit Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.02, 8, 48]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

export default function CredentialWorld({ credentials }: CredentialWorldProps) {
  const { selectedCredentialId, selectCredential } = useWorldStore();
  const [layoutMode, setLayoutMode] = useState<"orbit" | "helix" | "sphere" | "grid">("orbit");
  const [filterType, setFilterType] = useState<"all" | "degree" | "certification" | "license">("all");

  // Filter checker matching backend credential Types
  const matchesFilter = (cred: Credential) => {
    if (filterType === "all") return true;
    const type = cred.credentialType.toLowerCase();
    
    if (filterType === "degree") {
      return type.includes("academic") || type.includes("degree") || type.includes("rotation");
    }
    if (filterType === "certification") {
      return type.includes("certification") || type.includes("training") || type.includes("education") || type.includes("publication") || type.includes("seminar");
    }
    if (filterType === "license") {
      return type.includes("license") || type.includes("renewal");
    }
    return true;
  };

  const filteredCredentials = credentials.filter(matchesFilter);

  // Layout calculations
  const getTargetPosition = (
    credId: string,
    filteredIndex: number,
    totalFiltered: number
  ): [number, number, number] => {
    if (totalFiltered === 0) return [0, 0, 0];

    const i = filteredIndex;
    const N = totalFiltered;

    switch (layoutMode) {
      case "orbit": {
        const angle = (i / N) * Math.PI * 2;
        const radius = 4.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = i % 2 === 0 ? 0.35 : -0.35;
        return [x, y, z];
      }
      case "helix": {
        const angle = (i / N) * Math.PI * 4; // 2 rotations
        const radius = 4.0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (i / N) * 4.0 - 2.0; // scales vertically from -2.0 to 2.0
        return [x, y, z];
      }
      case "sphere": {
        if (N === 1) return [0, 0, 4.0];
        const y = (1 - (i / (N - 1)) * 2) * 3.8;
        const radiusAtY = Math.sqrt(Math.max(0, 3.8 * 3.8 - y * y));
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const theta = 2 * Math.PI * i / goldenRatio;
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;
        return [x, y, z];
      }
      case "grid": {
        const cols = Math.ceil(Math.sqrt(N));
        const col = i % cols;
        const row = Math.floor(i / cols);
        const totalRows = Math.ceil(N / cols);
        
        const spacingX = 2.8;
        const spacingY = 1.8;
        
        const x = (col - (cols - 1) / 2) * spacingX;
        const y = ((totalRows - 1) / 2 - row) * spacingY;
        const z = -1.5 - (Math.abs(x) * 0.1); // curve wall slightly
        return [x, y, z];
      }
      default:
        return [0, 0, 0];
    }
  };

  return (
    <div className="h-full w-full bg-[#030616] relative flex flex-col items-center">
      {/* 3D Orbit Canvas */}
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
          
          {/* Lights */}
          <ambientLight intensity={0.9} />
          <pointLight position={[10, 10, 10]} intensity={1.8} color="#00d4ff" />
          <pointLight position={[-10, -10, -10]} intensity={1.2} color="#7c3aed" />

          {/* Scenic Background */}
          <StarsField />
          <HolographicGrid />

          {/* Core quantum node anchor */}
          <HolographicCore layoutMode={layoutMode} />

          {/* Dynamic SBT Cards List with animated coordinate LERPing */}
          {credentials.map((cred, index) => {
            const isFilteredOut = !matchesFilter(cred);
            // Calculate coordinates based on filtered index or dummy target
            const filteredIndex = filteredCredentials.findIndex((c) => c._id === cred._id);
            const targetPos = getTargetPosition(
              cred._id,
              filteredIndex >= 0 ? filteredIndex : index,
              filteredCredentials.length
            );

            return (
              <CredentialCard3D
                key={cred._id}
                id={cred._id}
                position={targetPos}
                title={cred.title}
                issuer={cred.issuerName}
                type={cred.credentialType}
                isSelected={selectedCredentialId === cred._id}
                isFilteredOut={isFilteredOut}
                onSelect={selectCredential}
              />
            );
          })}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            maxDistance={12}
            minDistance={3.5}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Floating Instructions (Top Left) */}
      <div className="absolute top-4 left-4 z-10 hidden sm:block rounded-xl border border-slate-800/80 bg-[#070b1e]/75 p-3.5 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <p className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          🔮 Credentials Gallery Space
        </p>
        <p className="text-[9px] text-slate-400 font-semibold mt-1">
          Drag to rotate. Scroll to zoom. Click cards to inspect.
        </p>
      </div>

      {/* Layout Switcher Dashboard (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex gap-1 rounded-xl border border-slate-800/80 bg-[#070b1e]/75 p-1.5 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        {(["orbit", "helix", "sphere", "grid"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setLayoutMode(mode)}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              layoutMode === mode
                ? "text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-450 border border-transparent hover:text-white hover:bg-slate-850"
            }`}
          >
            {mode === "orbit" && "🪐 Orbit"}
            {mode === "helix" && "🧬 Helix"}
            {mode === "sphere" && "🌐 Sphere"}
            {mode === "grid" && "📊 Grid"}
          </button>
        ))}
      </div>

      {/* Category Type Filter Bar (Bottom Center) */}
      <div className="absolute bottom-4 z-10 flex gap-1.5 rounded-2xl border border-slate-800/80 bg-[#070b1e]/75 p-2 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)] max-w-[90%] overflow-x-auto scrollbar-none">
        {(["all", "degree", "certification", "license"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`whitespace-nowrap rounded-xl px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 ${
              filterType === type
                ? "text-cyan-300 bg-cyan-500/10 border border-cyan-500/35 shadow-[0_0_12px_rgba(6,182,212,0.18)]"
                : "text-slate-400 border border-transparent hover:text-white hover:bg-slate-850"
            }`}
          >
            {type === "all" && "✨ All"}
            {type === "degree" && "🎓 Degrees"}
            {type === "certification" && "📜 Certifications"}
            {type === "license" && "🛡️ Licenses"}
          </button>
        ))}
      </div>
    </div>
  );
}
