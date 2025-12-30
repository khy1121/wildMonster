
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

interface InputState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    run: boolean;
    jump: boolean;
}

export function useInputSystem() {
    const [input, setInput] = useState<InputState>({
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        jump: false
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    setInput(i => ({ ...i, forward: true }));
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    setInput(i => ({ ...i, backward: true }));
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    setInput(i => ({ ...i, left: true }));
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    setInput(i => ({ ...i, right: true }));
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    setInput(i => ({ ...i, run: true }));
                    break;
                case 'Space':
                    setInput(i => ({ ...i, jump: true }));
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    setInput(i => ({ ...i, forward: false }));
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    setInput(i => ({ ...i, backward: false }));
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    setInput(i => ({ ...i, left: false }));
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    setInput(i => ({ ...i, right: false }));
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    setInput(i => ({ ...i, run: false }));
                    break;
                case 'Space':
                    setInput(i => ({ ...i, jump: false }));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const movementVector = useMemo(() => {
        const vector = new THREE.Vector3();
        if (input.forward) vector.z -= 1;
        if (input.backward) vector.z += 1;
        if (input.left) vector.x -= 1;
        if (input.right) vector.x += 1;

        if (vector.length() > 0) vector.normalize();

        return vector;
    }, [input]);

    return {
        input,
        movementVector,
        isMoving: movementVector.length() > 0
    };
}
