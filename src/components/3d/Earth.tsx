import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function NeuralLattice() {
  const pointsRef = useRef<THREE.Points>(null);

  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05;
      pointsRef.current.rotation.x = time * 0.02;
    }
  });

  return (
    <>
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#39FF14" />
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
         <Points ref={pointsRef} positions={positions} stride={3}>
          <PointMaterial
            transparent
            color="#39FF14"
            size={0.05}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.6}
          />
        </Points>

        {/* Central Core */}
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial
            color="#10B981"
            wireframe
            transparent
            opacity={0.1}
          />
        </mesh>
        
        <mesh>
          <sphereGeometry args={[1.9, 32, 32]} />
          <meshStandardMaterial
            color="#050505"
            metalness={1}
            roughness={0}
          />
        </mesh>
      </Float>
    </>
  );
}

export function BackgroundParticles() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.0005;
      group.current.rotation.x += 0.0002;
    }
  });

  const particles = useMemo(() => {
    return Array.from({ length: 60 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      ] as [number, number, number],
      scale: Math.random() * 0.08 + 0.02
    }));
  }, []);

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.scale, 8, 8]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#39FF14" : "#00FFFF"} 
            emissive={i % 2 === 0 ? "#39FF14" : "#00FFFF"} 
            emissiveIntensity={1.5} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      ))}
    </group>
  );
}
