
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThirdPersonCameraProps {
    target: React.MutableRefObject<THREE.Object3D | null> | React.MutableRefObject<THREE.Group | null>;
    offset?: [number, number, number];
    lookAtOffset?: [number, number, number];
}

export const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({
    target,
    offset = [0, 8, 12],
    lookAtOffset = [0, 2, 0]
}) => {
    const { camera, gl } = useThree();
    const currentAngle = useRef({ azimuth: 0, polar: Math.PI / 3 });
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                isDragging.current = true;
                lastMouse.current = { x: e.clientX, y: e.clientY };
                gl.domElement.style.cursor = 'grabbing';
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                const deltaX = e.clientX - lastMouse.current.x;
                const deltaY = e.clientY - lastMouse.current.y;

                currentAngle.current.azimuth -= deltaX * 0.005;
                currentAngle.current.polar = Math.max(0.1, Math.min(Math.PI / 2.2, currentAngle.current.polar + deltaY * 0.005));

                lastMouse.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            gl.domElement.style.cursor = 'grab';
        };

        gl.domElement.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            gl.domElement.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [gl]);

    useFrame(() => {
        if (target.current) {
            const t = target.current.position;

            // Calculate desired position based on angles
            const distance = 15; // Could make this adjustable
            const camX = t.x + distance * Math.sin(currentAngle.current.polar) * Math.sin(currentAngle.current.azimuth);
            const camY = t.y + distance * Math.cos(currentAngle.current.polar);
            const camZ = t.z + distance * Math.sin(currentAngle.current.polar) * Math.cos(currentAngle.current.azimuth);

            const desiredPos = new THREE.Vector3(camX, camY, camZ);

            // Smooth Camera Movement (Lerp)
            camera.position.lerp(desiredPos, 0.1);

            // Look At Target
            const lookTarget = new THREE.Vector3(
                t.x + lookAtOffset[0],
                t.y + lookAtOffset[1],
                t.z + lookAtOffset[2]
            );
            camera.lookAt(lookTarget);
        }
    });

    return null;
};
