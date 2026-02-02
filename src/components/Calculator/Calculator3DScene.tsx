'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Text,
    OrbitControls,
    Float,
    MeshWobbleMaterial,
    MeshDistortMaterial,
    RoundedBox,
    Sparkles,
    Stars,
    Trail,
    MeshTransmissionMaterial,
    Environment,
    Sphere,
    Box,
    Torus,
    Icosahedron,
} from '@react-three/drei';
import * as THREE from 'three';

type OperationType = 'add' | 'subtract' | 'multiply' | 'divide' | 'equals' | 'idle' | 'magic';

interface Calculator3DSceneProps {
    operation: OperationType;
    result: string;
    isAnimating: boolean;
    isMagicNumber?: boolean;
}

// Exploding meteors merging together for addition
function AdditionAnimation() {
    const groupRef = useRef<THREE.Group>(null);
    const meteors = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            startPos: [
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5,
            ] as [number, number, number],
            speed: Math.random() * 2 + 1,
            scale: Math.random() * 0.3 + 0.1,
            color: ['#4ade80', '#22c55e', '#86efac', '#bbf7d0'][Math.floor(Math.random() * 4)],
        }));
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            groupRef.current.children.forEach((child, i) => {
                if (i < meteors.length) {
                    const t = (state.clock.elapsedTime * meteors[i].speed) % 3;
                    const progress = Math.min(t / 2, 1);
                    const start = meteors[i].startPos;
                    child.position.x = start[0] * (1 - progress);
                    child.position.y = start[1] * (1 - progress);
                    child.position.z = start[2] * (1 - progress);
                    child.scale.setScalar(meteors[i].scale * (1 + progress * 2));
                }
            });
        }
    });

    return (
        <group ref={groupRef}>
            {meteors.map((meteor, i) => (
                <Trail
                    key={i}
                    width={1}
                    length={6}
                    color={meteor.color}
                    attenuation={(t) => t * t}
                >
                    <mesh position={meteor.startPos} scale={meteor.scale}>
                        <dodecahedronGeometry args={[1, 0]} />
                        <meshStandardMaterial
                            color={meteor.color}
                            emissive={meteor.color}
                            emissiveIntensity={2}
                        />
                    </mesh>
                </Trail>
            ))}
            <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
                <MeshDistortMaterial
                    color="#4ade80"
                    emissive="#22c55e"
                    emissiveIntensity={3}
                    distort={0.5}
                    speed={5}
                />
            </Sphere>
            <Sparkles count={200} scale={8} size={4} speed={2} color="#4ade80" />
            <pointLight position={[0, 0, 0]} intensity={5} color="#4ade80" distance={10} />
        </group>
    );
}

// Vortex black hole sucking things in for subtraction
function SubtractionAnimation() {
    const vortexRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const blackHoleRef = useRef<THREE.Mesh>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(500 * 3);
        const colors = new Float32Array(500 * 3);
        for (let i = 0; i < 500; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 4;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.3 + Math.random() * 0.3;
            colors[i * 3 + 2] = 0.3 + Math.random() * 0.3;
        }
        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (vortexRef.current) {
            vortexRef.current.rotation.y = state.clock.elapsedTime * 2;
        }
        if (blackHoleRef.current) {
            blackHoleRef.current.rotation.z = state.clock.elapsedTime * 3;
            const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
            blackHoleRef.current.scale.set(scale, scale, scale);
        }
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < 500; i++) {
                const x = positions[i * 3];
                const z = positions[i * 3 + 2];
                const angle = Math.atan2(z, x) + 0.05;
                const radius = Math.sqrt(x * x + z * z) * 0.99;
                positions[i * 3] = Math.cos(angle) * radius;
                positions[i * 3 + 2] = Math.sin(angle) * radius;
                if (radius < 0.3) {
                    const newRadius = 4 + Math.random() * 2;
                    const newAngle = Math.random() * Math.PI * 2;
                    positions[i * 3] = Math.cos(newAngle) * newRadius;
                    positions[i * 3 + 2] = Math.sin(newAngle) * newRadius;
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group ref={vortexRef}>
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={500}
                        array={particles.positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={500}
                        array={particles.colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} />
            </points>
            <mesh ref={blackHoleRef}>
                <torusGeometry args={[1, 0.4, 16, 100]} />
                <meshStandardMaterial
                    color="#000000"
                    emissive="#ef4444"
                    emissiveIntensity={2}
                    metalness={1}
                    roughness={0}
                />
            </mesh>
            <Sphere args={[0.5, 32, 32]}>
                <meshBasicMaterial color="#000000" />
            </Sphere>
            <Sparkles count={100} scale={6} size={3} speed={3} color="#f87171" />
            <pointLight position={[0, 0, 0]} intensity={3} color="#ef4444" distance={8} />
        </group>
    );
}

// DNA double helix spinning for multiplication
function MultiplicationAnimation() {
    const helixRef = useRef<THREE.Group>(null);
    const spheres = useMemo(() => {
        const items: { pos1: [number, number, number]; pos2: [number, number, number]; color: string }[] = [];
        for (let i = 0; i < 30; i++) {
            const y = (i - 15) * 0.25;
            const angle1 = i * 0.4;
            const angle2 = i * 0.4 + Math.PI;
            items.push({
                pos1: [Math.cos(angle1) * 1.5, y, Math.sin(angle1) * 1.5],
                pos2: [Math.cos(angle2) * 1.5, y, Math.sin(angle2) * 1.5],
                color: i % 2 === 0 ? '#a78bfa' : '#c4b5fd',
            });
        }
        return items;
    }, []);

    useFrame((state) => {
        if (helixRef.current) {
            helixRef.current.rotation.y = state.clock.elapsedTime * 1.5;
            helixRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
        }
    });

    return (
        <group ref={helixRef}>
            {spheres.map((sphere, i) => (
                <group key={i}>
                    <Trail width={0.5} length={4} color={sphere.color} attenuation={(t) => t}>
                        <Sphere args={[0.15, 16, 16]} position={sphere.pos1}>
                            <meshStandardMaterial
                                color={sphere.color}
                                emissive={sphere.color}
                                emissiveIntensity={1}
                                metalness={0.8}
                            />
                        </Sphere>
                    </Trail>
                    <Trail width={0.5} length={4} color="#e879f9" attenuation={(t) => t}>
                        <Sphere args={[0.15, 16, 16]} position={sphere.pos2}>
                            <meshStandardMaterial
                                color="#e879f9"
                                emissive="#e879f9"
                                emissiveIntensity={1}
                                metalness={0.8}
                            />
                        </Sphere>
                    </Trail>
                    {i % 3 === 0 && (
                        <mesh position={[(sphere.pos1[0] + sphere.pos2[0]) / 2, sphere.pos1[1], (sphere.pos1[2] + sphere.pos2[2]) / 2]}>
                            <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
                            <meshStandardMaterial color="#f0abfc" transparent opacity={0.5} />
                        </mesh>
                    )}
                </group>
            ))}
            <Sparkles count={150} scale={5} size={3} speed={1.5} color="#c4b5fd" />
            <pointLight position={[0, 2, 0]} intensity={3} color="#a78bfa" distance={6} />
            <pointLight position={[0, -2, 0]} intensity={3} color="#e879f9" distance={6} />
        </group>
    );
}

// Laser sword slicing through a cube for division
function DivisionAnimation() {
    const groupRef = useRef<THREE.Group>(null);
    const laserRef = useRef<THREE.Mesh>(null);
    const cube1Ref = useRef<THREE.Mesh>(null);
    const cube2Ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.3;
        }
        if (laserRef.current) {
            laserRef.current.rotation.z = t * 5;
            laserRef.current.position.x = Math.sin(t * 2) * 0.5;
            const intensity = 2 + Math.sin(t * 10) * 0.5;
            (laserRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        }
        if (cube1Ref.current && cube2Ref.current) {
            const split = Math.abs(Math.sin(t)) * 1.5;
            cube1Ref.current.position.y = split;
            cube2Ref.current.position.y = -split;
            cube1Ref.current.rotation.x = t * 0.5;
            cube2Ref.current.rotation.x = -t * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            <RoundedBox ref={cube1Ref} args={[2, 1, 2]} radius={0.1} position={[0, 1, 0]}>
                <MeshTransmissionMaterial
                    color="#38bdf8"
                    transmission={0.9}
                    thickness={0.5}
                    roughness={0.1}
                    chromaticAberration={0.5}
                />
            </RoundedBox>
            <RoundedBox ref={cube2Ref} args={[2, 1, 2]} radius={0.1} position={[0, -1, 0]}>
                <MeshTransmissionMaterial
                    color="#0ea5e9"
                    transmission={0.9}
                    thickness={0.5}
                    roughness={0.1}
                    chromaticAberration={0.5}
                />
            </RoundedBox>
            <mesh ref={laserRef} position={[0, 0, 0]}>
                <boxGeometry args={[5, 0.05, 0.05]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#38bdf8"
                    emissiveIntensity={3}
                />
            </mesh>
            <Trail width={2} length={8} color="#38bdf8" attenuation={(t) => t * t}>
                <mesh position={[2.5, 0, 0]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#38bdf8" />
                </mesh>
            </Trail>
            <Sparkles count={80} scale={6} size={4} speed={2} color="#7dd3fc" />
            <pointLight position={[0, 0, 2]} intensity={5} color="#38bdf8" distance={8} />
        </group>
    );
}

// Epic fireworks and confetti celebration for equals
function EqualsAnimation({ result }: { result: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const fireworks = useMemo(() => {
        return Array.from({ length: 5 }, () => ({
            position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2] as [number, number, number],
            color: ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'][Math.floor(Math.random() * 6)],
            delay: Math.random() * 2,
        }));
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
                <Text
                    fontSize={1.5}
                    color="#fbbf24"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {result}
                    <MeshDistortMaterial
                        color="#fbbf24"
                        emissive="#f59e0b"
                        emissiveIntensity={2}
                        distort={0.1}
                        speed={3}
                        metalness={1}
                        roughness={0}
                    />
                </Text>
            </Float>
            {fireworks.map((fw, i) => (
                <group key={i} position={fw.position}>
                    <Sparkles
                        count={50}
                        scale={2}
                        size={6}
                        speed={3}
                        color={fw.color}
                        opacity={0.8}
                    />
                    <pointLight intensity={2} color={fw.color} distance={3} />
                </group>
            ))}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <Trail key={i} width={1} length={5} color="#fbbf24" attenuation={(t) => t}>
                        <Icosahedron
                            args={[0.1, 0]}
                            position={[Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0]}
                        >
                            <meshStandardMaterial
                                color="#fbbf24"
                                emissive="#f59e0b"
                                emissiveIntensity={3}
                            />
                        </Icosahedron>
                    </Trail>
                );
            })}
            <Sparkles count={300} scale={10} size={5} speed={1} color="#fde68a" />
            <pointLight position={[0, 0, 2]} intensity={8} color="#fbbf24" distance={10} />
        </group>
    );
}

// Special magic number animation (for 42, 69, 420, 1337, pi, etc.)
function MagicAnimation({ result }: { result: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={3} rotationIntensity={1} floatIntensity={2}>
                <Text
                    fontSize={2}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="#000000"
                >
                    {result}
                    <MeshDistortMaterial
                        color="#ffffff"
                        emissive="#a855f7"
                        emissiveIntensity={3}
                        distort={0.3}
                        speed={5}
                    />
                </Text>
            </Float>
            {rainbowColors.map((color, i) => (
                <Torus
                    key={i}
                    args={[1.5 + i * 0.3, 0.05, 16, 100]}
                    rotation={[Math.PI / 2 + i * 0.1, 0, 0]}
                >
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={2}
                        transparent
                        opacity={0.7}
                    />
                </Torus>
            ))}
            {[...Array(20)].map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                const radius = 3;
                return (
                    <Trail key={i} width={1} length={8} color={rainbowColors[i % 7]} attenuation={(t) => t}>
                        <Sphere
                            args={[0.15, 16, 16]}
                            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                        >
                            <meshStandardMaterial
                                color={rainbowColors[i % 7]}
                                emissive={rainbowColors[i % 7]}
                                emissiveIntensity={2}
                            />
                        </Sphere>
                    </Trail>
                );
            })}
            <Sparkles count={400} scale={12} size={8} speed={2} color="#ffffff" />
            {rainbowColors.map((color, i) => (
                <pointLight
                    key={i}
                    position={[Math.cos((i / 7) * Math.PI * 2) * 3, Math.sin((i / 7) * Math.PI * 2) * 3, 2]}
                    intensity={3}
                    color={color}
                    distance={5}
                />
            ))}
        </group>
    );
}

// Morphing geometric idle animation
function IdleAnimation() {
    const meshRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
        if (outerRef.current) {
            outerRef.current.rotation.x = -state.clock.elapsedTime * 0.2;
            outerRef.current.rotation.z = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <group>
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                <mesh ref={meshRef}>
                    <icosahedronGeometry args={[1.2, 1]} />
                    <MeshDistortMaterial
                        color="#6366f1"
                        emissive="#4f46e5"
                        emissiveIntensity={0.5}
                        distort={0.4}
                        speed={2}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </mesh>
            </Float>
            <mesh ref={outerRef}>
                <icosahedronGeometry args={[2, 1]} />
                <meshStandardMaterial
                    color="#818cf8"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>
            <Sparkles count={50} scale={6} size={2} speed={0.5} color="#a5b4fc" />
            <pointLight position={[0, 0, 3]} intensity={2} color="#6366f1" distance={8} />
        </group>
    );
}

function Scene({ operation, result, isAnimating, isMagicNumber }: Calculator3DSceneProps) {
    return (
        <>
            <color attach="background" args={['#0f0f23']} />
            <fog attach="fog" args={['#0f0f23', 5, 20]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />

            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0.5} fade speed={1} />

            {operation === 'magic' && isAnimating && <MagicAnimation result={result} />}
            {operation === 'add' && isAnimating && <AdditionAnimation />}
            {operation === 'subtract' && isAnimating && <SubtractionAnimation />}
            {operation === 'multiply' && isAnimating && <MultiplicationAnimation />}
            {operation === 'divide' && isAnimating && <DivisionAnimation />}
            {operation === 'equals' && isAnimating && !isMagicNumber && <EqualsAnimation result={result} />}
            {operation === 'idle' && <IdleAnimation />}

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 3}
            />
            <Environment preset="night" />
        </>
    );
}

export default function Calculator3DScene({ operation, result, isAnimating, isMagicNumber }: Calculator3DSceneProps) {
    return (
        <div className="w-full h-72 md:h-96 lg:h-[28rem] rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-pink-900/50" />
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
                <Scene operation={operation} result={result} isAnimating={isAnimating} isMagicNumber={isMagicNumber} />
            </Canvas>
            <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="text-xs text-white/40 font-mono">
                    {isAnimating && operation !== 'idle' && (
                        <span className="inline-flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            {operation === 'add' && 'FUSION MERGE'}
                            {operation === 'subtract' && 'BLACK HOLE ACTIVE'}
                            {operation === 'multiply' && 'DNA REPLICATION'}
                            {operation === 'divide' && 'QUANTUM SPLIT'}
                            {operation === 'equals' && 'CELEBRATION MODE'}
                            {operation === 'magic' && 'MAGIC NUMBER DETECTED'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
