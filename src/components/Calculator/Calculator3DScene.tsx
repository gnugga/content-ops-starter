'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Float, MeshWobbleMaterial, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

type OperationType = 'add' | 'subtract' | 'multiply' | 'divide' | 'equals' | 'idle';

interface Calculator3DSceneProps {
    operation: OperationType;
    result: string;
    isAnimating: boolean;
}

// Floating number particles for addition
function AdditionAnimation({ count = 20 }: { count?: number }) {
    const mesh = useRef<THREE.Group>(null);
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            position: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 3],
            scale: Math.random() * 0.5 + 0.3,
            speed: Math.random() * 0.5 + 0.5,
        }));
    }, [count]);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.3;
            mesh.current.children.forEach((child, i) => {
                child.position.y += Math.sin(state.clock.elapsedTime * particles[i].speed + i) * 0.01;
            });
        }
    });

    return (
        <group ref={mesh}>
            {particles.map((particle, i) => (
                <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
                    <mesh position={particle.position as [number, number, number]} scale={particle.scale}>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <MeshWobbleMaterial color="#4ade80" factor={0.4} speed={2} />
                    </mesh>
                </Float>
            ))}
            <Sparkles count={50} scale={6} size={3} speed={0.4} color="#86efac" />
        </group>
    );
}

// Imploding cubes for subtraction
function SubtractionAnimation() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
            group.current.scale.set(scale, scale, scale);
            group.current.rotation.x = state.clock.elapsedTime;
            group.current.rotation.z = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <group ref={group}>
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const x = Math.cos(angle) * 2;
                const y = Math.sin(angle) * 2;
                return (
                    <Float key={i} speed={3} rotationIntensity={2}>
                        <RoundedBox key={i} position={[x, y, 0]} args={[0.5, 0.5, 0.5]} radius={0.1}>
                            <meshStandardMaterial color="#f87171" metalness={0.5} roughness={0.2} />
                        </RoundedBox>
                    </Float>
                );
            })}
            <Sparkles count={30} scale={5} size={4} speed={0.8} color="#fca5a5" />
        </group>
    );
}

// Spinning torus knots for multiplication
function MultiplicationAnimation() {
    const group = useRef<THREE.Group>(null);
    const torus1 = useRef<THREE.Mesh>(null);
    const torus2 = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
        if (torus1.current) {
            torus1.current.rotation.x = state.clock.elapsedTime * 2;
            torus1.current.rotation.z = state.clock.elapsedTime;
        }
        if (torus2.current) {
            torus2.current.rotation.x = -state.clock.elapsedTime * 2;
            torus2.current.rotation.y = state.clock.elapsedTime;
        }
    });

    return (
        <group ref={group}>
            <mesh ref={torus1} position={[-1, 0, 0]}>
                <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />
                <MeshWobbleMaterial color="#a78bfa" factor={0.3} speed={3} metalness={0.8} roughness={0.1} />
            </mesh>
            <mesh ref={torus2} position={[1, 0, 0]}>
                <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />
                <MeshWobbleMaterial color="#c4b5fd" factor={0.3} speed={3} metalness={0.8} roughness={0.1} />
            </mesh>
            <Sparkles count={40} scale={6} size={5} speed={1} color="#ddd6fe" />
        </group>
    );
}

// Slicing planes for division
function DivisionAnimation() {
    const group = useRef<THREE.Group>(null);
    const plane1 = useRef<THREE.Mesh>(null);
    const plane2 = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.3;
        }
        if (plane1.current && plane2.current) {
            const offset = Math.sin(state.clock.elapsedTime * 2) * 1.5;
            plane1.current.position.y = offset;
            plane2.current.position.y = -offset;
        }
    });

    return (
        <group ref={group}>
            <mesh ref={plane1} position={[0, 1, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[3, 0.5, 2]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <torusGeometry args={[1.2, 0.1, 16, 50]} />
                <meshStandardMaterial color="#0ea5e9" metalness={0.8} roughness={0.1} />
            </mesh>
            <mesh ref={plane2} position={[0, -1, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[3, 0.5, 2]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.2} />
            </mesh>
            <Sparkles count={35} scale={5} size={4} speed={0.6} color="#7dd3fc" />
        </group>
    );
}

// Celebration animation for equals/result
function EqualsAnimation({ result }: { result: string }) {
    const group = useRef<THREE.Group>(null);
    const rings = useRef<THREE.Mesh[]>([]);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
        rings.current.forEach((ring, i) => {
            if (ring) {
                ring.rotation.x = state.clock.elapsedTime * (0.5 + i * 0.2);
                ring.rotation.z = state.clock.elapsedTime * (0.3 + i * 0.1);
                const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
                ring.scale.set(scale, scale, scale);
            }
        });
    });

    const colors = ['#fbbf24', '#f59e0b', '#d97706'];

    return (
        <group ref={group}>
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                <Text
                    fontSize={1.2}
                    color="#fbbf24"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Inter-Bold.woff"
                >
                    {result}
                    <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
                </Text>
            </Float>
            {colors.map((color, i) => (
                <mesh
                    key={i}
                    ref={(el) => {
                        if (el) rings.current[i] = el;
                    }}
                    position={[0, 0, 0]}
                >
                    <torusGeometry args={[1.5 + i * 0.4, 0.05, 16, 50]} />
                    <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} transparent opacity={0.7} />
                </mesh>
            ))}
            <Sparkles count={100} scale={8} size={6} speed={0.5} color="#fde68a" />
        </group>
    );
}

// Idle floating animation
function IdleAnimation() {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={mesh}>
                <icosahedronGeometry args={[1.5, 1]} />
                <MeshWobbleMaterial
                    color="#64748b"
                    factor={0.2}
                    speed={1}
                    metalness={0.3}
                    roughness={0.7}
                    wireframe
                />
            </mesh>
            <Sparkles count={20} scale={5} size={2} speed={0.2} color="#94a3b8" />
        </Float>
    );
}

function Scene({ operation, result, isAnimating }: Calculator3DSceneProps) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />

            {operation === 'add' && isAnimating && <AdditionAnimation />}
            {operation === 'subtract' && isAnimating && <SubtractionAnimation />}
            {operation === 'multiply' && isAnimating && <MultiplicationAnimation />}
            {operation === 'divide' && isAnimating && <DivisionAnimation />}
            {operation === 'equals' && isAnimating && <EqualsAnimation result={result} />}
            {operation === 'idle' && <IdleAnimation />}

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </>
    );
}

export default function Calculator3DScene({ operation, result, isAnimating }: Calculator3DSceneProps) {
    return (
        <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <Scene operation={operation} result={result} isAnimating={isAnimating} />
            </Canvas>
        </div>
    );
}
