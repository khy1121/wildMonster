import React, { useEffect, useRef } from 'react';
import { TestScene } from '../../engine/Three/TestScene';

interface TestWorld3DProps {
    onClose?: () => void;
}

export const TestWorld3D: React.FC<TestWorld3DProps> = ({ onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<TestScene | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        console.log('[TestWorld3D] Initializing test scene...');
        const testScene = new TestScene(containerRef.current);
        sceneRef.current = testScene;

        return () => {
            console.log('[TestWorld3D] Cleaning up...');
            if (sceneRef.current) {
                sceneRef.current.dispose();
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* 3D Canvas Container */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Test HUD */}
            <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">🧪 3D Test Scene</h3>
                <div className="text-sm space-y-1">
                    <p>✅ Three.js Renderer</p>
                    <p>✅ Basic Cube (rotating)</p>
                    <p>✅ Ground Plane</p>
                    <p>✅ Lighting</p>
                    <p>✅ Grid & Axes</p>
                </div>
            </div>

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition"
                >
                    Close Test
                </button>
            )}

            {/* Info */}
            <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-md">
                <p className="text-sm">
                    이 테스트 씬은 Three.js가 제대로 렌더링되는지 확인합니다.
                    회전하는 파란색 큐브와 분홍색 파트너 큐브가 보여야 합니다.
                </p>
            </div>
        </div>
    );
};
