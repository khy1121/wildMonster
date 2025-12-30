
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, SoftShadows, Stats } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { WorldSceneStub } from './WorldSceneStub';

interface R3FWorldProps {
    onClose?: () => void;
}

export const R3FWorld: React.FC<R3FWorldProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[60] bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
            >
                Close 3D
            </button>

            {/* Hint */}
            <div className="absolute top-4 left-4 z-[60] bg-black/50 text-white px-4 py-2 rounded pointer-events-none">
                WASD to Move • Mouse Drag to Rotate Camera
            </div>

            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: false }}
            >
                <Stats />
                <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={75} />

                {/* Physics World */}
                <Physics gravity={[0, -9.81, 0]}>
                    <SoftShadows size={10} samples={10} focus={0} />

                    <Suspense fallback={null}>
                        <WorldSceneStub />
                    </Suspense>
                </Physics>
            </Canvas>
        </div>
    );
};
