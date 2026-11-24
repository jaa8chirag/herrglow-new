"use client";

import { Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

/**
 * ONE subtle 3D element for the home hero: soft glossy pearls floating in a shimmer of gold particles.
 * Lazy-loaded (see HeroGlowLazy), desktop only, paused when off-screen. The environment lighting is generated locally
 * (Lightformers), so there is NO network request for an HDR map.
 */
const PEARLS: { p: [number, number, number]; s: number; c: string; speed: number }[] = [
  { p: [-1.6, 0.9, 0], s: 0.95, c: "#f6e3e1", speed: 1.3 },
  { p: [1.5, -0.2, -0.6], s: 1.35, c: "#efcfcb", speed: 1.0 },
  { p: [-0.2, -1.5, 0.3], s: 0.6, c: "#e3cb98", speed: 1.6 },
  { p: [2.2, 1.7, -1.2], s: 0.55, c: "#c9727e", speed: 1.2 },
  { p: [-2.4, -0.8, -1], s: 0.45, c: "#fbf7f4", speed: 1.8 },
];

export default function HeroGlow({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 7], fov: 38 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff3e6" />
      <Environment resolution={64} environmentIntensity={0.9}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 4, -4]}
          scale={[10, 3, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[-5, 0, 2]}
          scale={[3, 6, 1]}
          color="#f6c9c4"
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[5, -1, 2]}
          scale={[3, 6, 1]}
          color="#e3cb98"
        />
      </Environment>
      {PEARLS.map((m, i) => (
        <Float key={i} speed={m.speed} rotationIntensity={0.5} floatIntensity={1.4}>
          <mesh position={m.p} scale={m.s}>
            <sphereGeometry args={[1, 48, 48]} />
            <meshPhysicalMaterial
              color={m.c}
              roughness={0.14}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.08}
              iridescence={1}
              iridescenceIOR={1.35}
              sheen={1}
              sheenColor="#fff"
            />
          </mesh>
        </Float>
      ))}
      <Sparkles
        count={46}
        scale={[9, 6, 3]}
        size={3.2}
        speed={0.25}
        opacity={0.9}
        color="#c8a15a"
      />
    </Canvas>
  );
}
