import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function Headphones() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Headband - Main Arc */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <torusGeometry args={[1.2, 0.08, 16, 100, Math.PI]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Headband - Inner Padding */}
        <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.2, 0.05, 16, 100, Math.PI]} />
          <meshStandardMaterial
            color="#4f46e5"
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>

        {/* Left Ear Cup - Outer */}
        <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Left Ear Cup - Inner Cushion */}
        <mesh position={[-1.2, 0, 0.12]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
          <meshStandardMaterial
            color="#6366f1"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>

        {/* Left Ear Cup - Speaker Grill */}
        <mesh position={[-1.2, 0, 0.16]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshStandardMaterial
            color="#374151"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Right Ear Cup - Outer */}
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Right Ear Cup - Inner Cushion */}
        <mesh position={[1.2, 0, 0.12]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
          <meshStandardMaterial
            color="#6366f1"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>

        {/* Right Ear Cup - Speaker Grill */}
        <mesh position={[1.2, 0, 0.16]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshStandardMaterial
            color="#374151"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Left Connector */}
        <mesh position={[-1.2, 0.5, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Right Connector */}
        <mesh position={[1.2, 0.5, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Accent Rings on Ear Cups */}
        <mesh position={[-1.2, 0, 0.18]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.32, 0.02, 16, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.9}
            roughness={0.1}
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
          />
        </mesh>

        <mesh position={[1.2, 0, 0.18]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.32, 0.02, 16, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.9}
            roughness={0.1}
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

export const Hero3D = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.8} />
        <pointLight position={[0, 5, 5]} intensity={0.5} color="#8b5cf6" />

        <Headphones />

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.5}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};
