import * as THREE from 'three';

export interface ThreeConfig {
    container: HTMLElement;
    width: number;
    height: number;
    antialias?: boolean;
    shadows?: boolean;
}

export class ThreeRenderer {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    private animationFrameId: number | null = null;
    private updateCallbacks: ((delta: number) => void)[] = [];

    constructor(config: ThreeConfig) {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            config.width / config.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: config.antialias !== false,
            alpha: false
        });
        this.renderer.setSize(config.width, config.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (config.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        config.container.appendChild(this.renderer.domElement);

        // Lighting
        this.setupLighting();

        // Start render loop
        this.start();
    }

    private setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;

        // Shadow camera settings
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;

        this.scene.add(directionalLight);

        // Hemisphere light for better ambient
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.4);
        this.scene.add(hemisphereLight);
    }

    public onUpdate(callback: (delta: number) => void) {
        this.updateCallbacks.push(callback);
    }

    private clock = new THREE.Clock();

    private animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();

        // Call all update callbacks
        this.updateCallbacks.forEach(callback => callback(delta));

        // Render
        this.renderer.render(this.scene, this.camera);
    };

    public start() {
        if (!this.animationFrameId) {
            this.clock.start();
            this.animate();
        }
    }

    public stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    public resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    public dispose() {
        this.stop();
        this.renderer.dispose();
        this.scene.clear();
    }

    // Helper: Add grid for debugging
    public addGrid(size: number = 100, divisions: number = 100) {
        const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x888888);
        this.scene.add(gridHelper);
    }

    // Helper: Add axes for debugging
    public addAxes(size: number = 5) {
        const axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
    }
}
