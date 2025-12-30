
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInputSystem } from '../../engine/Three/hooks/useInputSystem';

interface PlayerControllerProps {
    setTarget: (target: THREE.Object3D) => void;
}

export const PlayerController: React.FC<PlayerControllerProps> = ({ setTarget }) => {
    const { movementVector, isMoving } = useInputSystem();
    const groupRef = useRef<THREE.Group>(null);
    const speed = 10;

    // Notify parent about the target immediately or inside useEffect
    React.useEffect(() => {
        if (groupRef.current) setTarget(groupRef.current);
    }, [setTarget]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (isMoving) {
            // Get camera direction (azimuth)
            // Ideally we get this from the camera controller or calculate from camera position
            // But simple "relative to camera" logic:

            const camera = state.camera;
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            right.y = 0;
            right.normalize();

            // Map WASD to Camera Space
            // movementVector is local (z- is forward, x+ is right) if we map strictly to keys
            // W -> z-1 (forward)
            // S -> z+1
            // A -> x-1
            // D -> x+1

            // Correct mapping:
            const moveDir = new THREE.Vector3();
            // movementVector.z is -1 for W (Forward)
            // So we want to move along 'forward' when z is -1
            moveDir.addScaledVector(forward, -movementVector.z);
            moveDir.addScaledVector(right, movementVector.x);

            if (moveDir.length() > 0) moveDir.normalize();

            // Apply movement
            groupRef.current.position.addScaledVector(moveDir, speed * delta);

            // Rotate character to face movement
            const angle = Math.atan2(moveDir.x, moveDir.z);
            groupRef.current.rotation.y = angle;
        }
    });

    return (
        <group ref={groupRef} position={[0, 2, 0]}>
            <mesh castShadow position={[0, 1, 0]}>
                <capsuleGeometry args={[0.5, 2, 8, 16]} />
                <meshStandardMaterial color="#4488ff" />
            </mesh>
            {/* Eyes for orientation */}
            <mesh position={[0.2, 1.8, 0.4]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.2, 1.8, 0.4]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
};
