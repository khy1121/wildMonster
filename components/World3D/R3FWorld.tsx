import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Stats } from '@react-three/drei';
import { Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

interface R3FWorldProps {
    onClose?: () => void;
}

// Player Cube Component with Physics and WASD Controls
const PlayerCube = React.forwardRef<RapierRigidBody>((props, ref) => {
    const [keys, setKeys] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key]: true }));
        const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key]: false }));

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame(() => {
        if (!ref || typeof ref === 'function' || !ref.current) return;

        const speed = 5;
        const velocity = { x: 0, y: 0, z: 0 };

        if (keys['w'] || keys['ArrowUp']) velocity.z -= speed;
        if (keys['s'] || keys['ArrowDown']) velocity.z += speed;
        if (keys['a'] || keys['ArrowLeft']) velocity.x -= speed;
        if (keys['d'] || keys['ArrowRight']) velocity.x += speed;

        // Get current Y velocity to preserve gravity
        const currentVel = ref.current.linvel();
        ref.current.setLinvel({ x: velocity.x, y: currentVel.y, z: velocity.z }, true);
    });

    return (
        <RigidBody ref={ref} type="dynamic" colliders="cuboid" position={[0, 2, 0]}>
            <mesh castShadow>
                <boxGeometry args={[1, 2, 1]} />
                <meshStandardMaterial color="#4488ff" />
            </mesh>
        </RigidBody>
    );
});

// Camera Follow Component
function CameraFollow({ target }: { target: React.RefObject<RapierRigidBody> }) {
    const { camera } = useThree();

    useFrame(() => {
        if (!target.current) return;

        const playerPos = target.current.translation();
        const offset = new THREE.Vector3(0, 10, 15);
        const targetPos = new THREE.Vector3(
            playerPos.x + offset.x,
            playerPos.y + offset.y,
            playerPos.z + offset.z
        );

        camera.position.lerp(targetPos, 0.1);
        camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z);
    });

    return null;
}

export const R3FWorld: React.FC<R3FWorldProps> = ({ onClose }) => {
    const playerRef = useRef<RapierRigidBody>(null);

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[60] bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
            >
                Close 3D
            </button>

            {/* Controls Hint */}
            <div className="absolute top-4 left-4 z-[60] bg-black/50 text-white px-4 py-2 rounded pointer-events-none">
                WASD to Move • Mouse Drag to Look Around
            </div>

            <Canvas
                shadows
                camera={{ position: [0, 10, 15], fov: 75 }}
                gl={{ antialias: true }}
            >
                {/* Performance Stats */}
                <Stats />

                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />

                {/* Environment */}
                <Sky sunPosition={[100, 20, 100]} />
                <fog attach="fog" args={['#87CEEB', 50, 200]} />

                {/* Physics World */}
                <Physics gravity={[0, -9.81, 0]}>
                    {/* Player */}
                    <PlayerCube ref={playerRef} />

                    {/* Ground with Physics */}
                    <RigidBody type="fixed" colliders="cuboid">
                        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
                            <planeGeometry args={[200, 200]} />
                            <meshStandardMaterial color="#2d5016" />
                        </mesh>
                    </RigidBody>
                </Physics>

                {/* Camera Follow */}
                <CameraFollow target={playerRef} />
            </Canvas>
        </div>
    );
};
