"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import StarsField from "./StarsField";
import HolographicGrid from "./HolographicGrid";
import * as THREE from "three";

// Mouse state tracker inside the WebGL canvas context
const mouse = { x: 0, y: 0 };

function MouseTracker() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse positions between -1 and 1
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return null;
}

/* ─── Volumetric Glass Soul Crystal ─── */
function SoulCrystal() {
  const crystalRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (crystalRef.current && outerRef.current) {
      // Base continuous rotation
      crystalRef.current.rotation.y = t * 0.25;
      crystalRef.current.rotation.x = t * 0.15;

      outerRef.current.rotation.y = -t * 0.15;
      outerRef.current.rotation.x = -t * 0.2;

      // Cursor pull reactivity (subtle tilt towards normalized mouse coords)
      crystalRef.current.rotation.x += (mouse.y * 0.3 - crystalRef.current.rotation.x) * 0.05;
      crystalRef.current.rotation.y += (mouse.x * 0.3 - crystalRef.current.rotation.y) * 0.05;
      
      outerRef.current.rotation.x += (mouse.y * 0.3 - outerRef.current.rotation.x) * 0.05;
      outerRef.current.rotation.y += (mouse.x * 0.3 - outerRef.current.rotation.y) * 0.05;

      // Volumetric breathing effect
      const scale = 1.0 + Math.sin(t * 1.5) * 0.03;
      crystalRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Inner physical transparent crystal */}
      <mesh ref={crystalRef}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshPhysicalMaterial
          color="#00d4ff"
          roughness={0.08}
          metalness={0.15}
          transmission={0.88}
          thickness={1.8}
          ior={1.65}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer spinning wireframe shield */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.32, 0]} />
        <meshBasicMaterial
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ─── Orbiting Blockchain Double-Helix Node Thread ─── */
function HelixOrbit() {
  const groupRef = useRef<THREE.Group>(null);
  const nodeCount = 20;
  const radius = 2.0;

  // Generate node coordinates along circular waves
  const { nodesA, nodesB } = useMemo(() => {
    const arrA = [];
    const arrB = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      
      // Helix thread A
      const xA = Math.cos(angle) * radius;
      const zA = Math.sin(angle) * radius;
      const yA = Math.sin(angle * 4) * 0.4;
      arrA.push(new THREE.Vector3(xA, yA, zA));

      // Helix thread B (offset phase by PI)
      const xB = Math.cos(angle + Math.PI) * radius;
      const zB = Math.sin(angle + Math.PI) * radius;
      const yB = Math.sin((angle + Math.PI) * 4) * 0.4;
      arrB.push(new THREE.Vector3(xB, yB, zB));
    }
    return { nodesA: arrA, nodesB: arrB };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotates the entire helix node array
      groupRef.current.rotation.y = -state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Thread A Nodes */}
      {nodesA.map((pos, idx) => (
        <mesh key={`node-a-${idx}`} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#00d4ff" />
        </mesh>
      ))}

      {/* Thread B Nodes */}
      {nodesB.map((pos, idx) => (
        <mesh key={`node-b-${idx}`} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Swirling Blockchain Data Dust (Particle Swarm) ─── */
function ParticleVortex() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 350;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Circular vortex coordinates
      const angle = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 1.4; // between 1.6 and 3.0
      const y = (Math.random() - 0.5) * 1.5;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#00d4ff"
        size={0.035}
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function LandingScene() {
  return (
    <div className="h-full w-full relative">
      <MouseTracker />
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0.4, 4.8]} fov={45} />
        
        {/* Cinematic Volumetric Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[3, 3, 3]} intensity={2.0} color="#00d4ff" />
        <pointLight position={[-3, -3, -3]} intensity={1.5} color="#7c3aed" />
        <spotLight position={[0, 5, 0]} intensity={3} color="#00d4ff" angle={0.6} penumbra={1} />

        {/* Scenic environment */}
        <StarsField />
        <HolographicGrid />

        {/* Cinematic WebGL Assets */}
        <SoulCrystal />
        <HelixOrbit />
        <ParticleVortex />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
