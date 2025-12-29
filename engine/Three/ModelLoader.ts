import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

/**
 * Model cache to avoid reloading same models
 */
const modelCache = new Map<string, THREE.Group>();

/**
 * Animation cache
 */
const animationCache = new Map<string, THREE.AnimationClip[]>();

/**
 * GLTF Model Loader with caching and animation support
 */
export class ModelLoader {
    private loader: GLTFLoader;
    private dracoLoader: DRACOLoader;

    constructor() {
        // Setup GLTF Loader
        this.loader = new GLTFLoader();

        // Setup Draco Loader for compressed models
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.loader.setDRACOLoader(this.dracoLoader);
    }

    /**
     * Load a GLTF model
     * @param path Path to the GLTF/GLB file
     * @param options Loading options
     * @returns Promise with loaded model and animations
     */
    public async loadModel(
        path: string,
        options: {
            scale?: number;
            castShadow?: boolean;
            receiveShadow?: boolean;
            useCache?: boolean;
        } = {}
    ): Promise<{
        model: THREE.Group;
        animations: THREE.AnimationClip[];
        mixer?: THREE.AnimationMixer;
    }> {
        const {
            scale = 1,
            castShadow = true,
            receiveShadow = true,
            useCache = true
        } = options;

        // Check cache
        if (useCache && modelCache.has(path)) {
            const cachedModel = modelCache.get(path)!.clone();
            const cachedAnimations = animationCache.get(path) || [];

            return {
                model: cachedModel,
                animations: cachedAnimations,
                mixer: cachedAnimations.length > 0 ? new THREE.AnimationMixer(cachedModel) : undefined
            };
        }

        try {
            // Load model
            const gltf = await this.loader.loadAsync(path);
            const model = gltf.scene;
            const animations = gltf.animations;

            // Apply scale
            if (scale !== 1) {
                model.scale.setScalar(scale);
            }

            // Setup shadows
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = castShadow;
                    child.receiveShadow = receiveShadow;

                    // Fix color space for materials
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
                            });
                        } else {
                            if (child.material.map) {
                                child.material.map.colorSpace = THREE.SRGBColorSpace;
                            }
                        }
                    }
                }
            });

            // Cache model and animations
            if (useCache) {
                modelCache.set(path, model.clone());
                animationCache.set(path, animations);
            }

            // Create animation mixer if animations exist
            const mixer = animations.length > 0 ? new THREE.AnimationMixer(model) : undefined;

            console.log(`[ModelLoader] Loaded: ${path}`, {
                animations: animations.length,
                meshes: model.children.length
            });

            return { model, animations, mixer };
        } catch (error) {
            console.error(`[ModelLoader] Failed to load: ${path}`, error);
            throw error;
        }
    }

    /**
     * Load multiple models in parallel
     */
    public async loadModels(
        paths: string[],
        options?: Parameters<typeof this.loadModel>[1]
    ): Promise<Map<string, Awaited<ReturnType<typeof this.loadModel>>>> {
        const results = new Map();

        await Promise.all(
            paths.map(async (path) => {
                try {
                    const result = await this.loadModel(path, options);
                    results.set(path, result);
                } catch (error) {
                    console.error(`[ModelLoader] Failed to load ${path}:`, error);
                }
            })
        );

        return results;
    }

    /**
     * Clear cache
     */
    public clearCache(): void {
        modelCache.clear();
        animationCache.clear();
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.clearCache();
        this.dracoLoader.dispose();
    }
}

/**
 * Helper function to play animation
 */
export function playAnimation(
    mixer: THREE.AnimationMixer,
    animations: THREE.AnimationClip[],
    animationName: string,
    options: {
        loop?: THREE.AnimationActionLoopStyles;
        timeScale?: number;
        fadeIn?: number;
    } = {}
): THREE.AnimationAction | null {
    const clip = animations.find(a => a.name === animationName);

    if (!clip) {
        console.warn(`[ModelLoader] Animation not found: ${animationName}`);
        return null;
    }

    const action = mixer.clipAction(clip);

    if (options.loop !== undefined) {
        action.setLoop(options.loop, Infinity);
    }

    if (options.timeScale !== undefined) {
        action.timeScale = options.timeScale;
    }

    if (options.fadeIn) {
        action.fadeIn(options.fadeIn);
    }

    action.play();

    return action;
}

/**
 * Helper function to transition between animations
 */
export function transitionAnimation(
    mixer: THREE.AnimationMixer,
    animations: THREE.AnimationClip[],
    fromAction: THREE.AnimationAction | null,
    toAnimationName: string,
    duration: number = 0.3
): THREE.AnimationAction | null {
    const toClip = animations.find(a => a.name === toAnimationName);

    if (!toClip) {
        console.warn(`[ModelLoader] Animation not found: ${toAnimationName}`);
        return null;
    }

    const toAction = mixer.clipAction(toClip);

    if (fromAction && fromAction !== toAction) {
        fromAction.fadeOut(duration);
    }

    toAction.reset().fadeIn(duration).play();

    return toAction;
}
