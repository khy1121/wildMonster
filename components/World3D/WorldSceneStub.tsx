
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { PlayerController } from './PlayerController';
import { ThirdPersonCamera } from './ThirdPersonCamera';

export const WorldSceneStub: React.FC = () => {
    // Player Target State (lifted up to link Camera and Player)
    const [playerTarget, setPlayerTarget] = useState<THREE.Object3D | null>(null);
    const playerRef = useRef<THREE.Object3D | null>(null);

    // Callbacks to sync ref
    const handleSetPlayer = (obj: THREE.Object3D) => {
        playerRef.current = obj;
        setPlayerTarget(obj);
    };

    return (
        <>
            {/* Environment Settings */}
            <color attach="background" args={['#87CEEB']} />
            <fog attach="fog" args={['#87CEEB', 50, 200]} />

            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[50, 100, 50]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
            />
            <hemisphereLight args={['#87CEEB', '#545454', 0.4]} />

            {/* Ground (Physics Enabled) */}
            <RigidBody type="fixed" colliders="cuboid" friction={2}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial color="#4a7c3e" roughness={0.9} metalness={0.1} />
                </mesh>
            </RigidBody>

            {/* Debug Objects */}
            <RigidBody type="fixed" position={[-5, 1, -5]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            </RigidBody>

            {/* Player Controller */}
            <PlayerController setTarget={handleSetPlayer} />

            {/* Camera Controller */}
            {/* We pass a mutable ref object to ThirdPersonCamera */}
            <ThirdPersonCamera target={playerRef as any} />
        </>
    );
};
