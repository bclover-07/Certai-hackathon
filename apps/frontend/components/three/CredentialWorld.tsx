"use client";

import { Canvas } from "@react-three/fiber";
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

export default function CredentialWorld({ credentials }: CredentialWorldProps) {
  const { selectedCredentialId, selectCredential } = useWorldStore();

  return (
    <div className="h-full w-full bg-[#030616] relative">
      {/* 3D Orbit Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        
        {/* Lights */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#7c3aed" />

        {/* Scenic Background */}
        <StarsField />
        <HolographicGrid />

        {/* 3D Glass Cards list in Orbit layout */}
        {credentials.map((cred, index) => {
          // Circular orbit coordinates
          const angle = (index / credentials.length) * Math.PI * 2 || 0;
          const radius = 4.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = (index % 2 === 0 ? 0.3 : -0.3);

          return (
            <CredentialCard3D
              key={cred._id}
              id={cred._id}
              position={[x, y, z]}
              title={cred.title}
              issuer={cred.issuerName}
              type={cred.credentialType}
              isSelected={selectedCredentialId === cred._id}
              onSelect={selectCredential}
            />
          );
        })}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxDistance={12}
          minDistance={3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Floating Instructions */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <p className="text-xs font-bold text-white uppercase tracking-wider">
          🔮 Credentials Gallery Space
        </p>
        <p className="text-[10px] text-slate-400 font-semibold mt-1">
          Drag to rotate. Scroll to zoom. Click cards to inspect.
        </p>
      </div>
    </div>
  );
}
