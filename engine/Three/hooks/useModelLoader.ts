
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import { Group } from 'three';

/**
 * Custom hook to load GLTF models with error handling and ease of use.
 */
export function useModelLoader(path: string) {
    // useGLTF handles caching internally via suspense-cache
    const { scene, animations } = useGLTF(path, true) as any;

    // Clone the scene to allow multiple instances of the same model with different transforms
    // useMemo ensures we clone only when the cached scene changes
    const model = useMemo(() => {
        return scene ? (scene.clone() as Group) : null;
    }, [scene]);

    return {
        model,
        animations,
        scene // original scene if needed
    };
}

/**
 * Preload a model to avoid suspense fallback on first render
 */
export function preloadModel(path: string) {
    useGLTF.preload(path);
}

/**
 * Clear cached model
 */
export function clearModelCache(path: string) {
    useGLTF.clear(path);
}
