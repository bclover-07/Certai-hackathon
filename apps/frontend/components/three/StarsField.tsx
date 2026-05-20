"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// @ts-expect-error
import * as random from "maath/random/dist/maath-random.esm";

export default function StarsField(props: any) {
  const ref = useRef<any>();
  
  // Create 1200 points inside a sphere of radius 1.2
  const sphere = random.inSphere(new Float32Array(1500), { radius: 1.5 }) as Float32Array;

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 18;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color="#00d4ff"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}
