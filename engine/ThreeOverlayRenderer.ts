import * as THREE from 'three';

/**
 * ThreeOverlayRenderer - manages a transparent Three.js canvas overlay
 * for displaying 3D elements (gem) above the Phaser game canvas
 */
export class ThreeOverlayRenderer {
    private renderer: THREE.WebGLRenderer | null = null;
    private scene: THREE.Scene | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private gem: THREE.Mesh | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private animationId: number | null = null;

    /**
     * Initialize the Three.js overlay
     * @param container - parent element to append canvas to
     * @returns true if successful, false if WebGL unavailable
     */
    init(container: HTMLElement): boolean {
        try {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'three-overlay';
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.pointerEvents = 'none'; // Allow clicks through
            this.canvas.style.zIndex = '1'; // Above Phaser (0), below React UI (10)

            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true, // Transparent background
                antialias: true
            });

            const rect = container.getBoundingClientRect();
            this.renderer.setSize(rect.width, rect.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for mobile

            // Create scene
            this.scene = new THREE.Scene();

            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                45, // FOV
                rect.width / rect.height, // aspect
                0.1, // near
                1000 // far
            );
            this.camera.position.z = 200;

            // Create gem
            this.createGem();

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 7.5);
            this.scene.add(directionalLight);

            // Append to DOM
            container.appendChild(this.canvas);

            console.log('[3D] ThreeOverlayRenderer initialized successfully');
            return true;

        } catch (error) {
            console.warn('[3D] Failed to initialize Three.js:', error);
            this.cleanup();
            return false;
        }
    }

    /**
     * Create the 3D gem
     */
    private createGem() {
        if (!this.scene) return;

        // Icosahedron geometry (20-sided gem)
        const geometry = new THREE.IcosahedronGeometry(40, 1);

        // Material with emissive glow
        const material = new THREE.MeshStandardMaterial({
            color: 0x60a5fa, // Cyan
            emissive: 0x9333ea, // Purple glow
            emissiveIntensity: 0.4,
            metalness: 0.8,
            roughness: 0.2,
            flatShading: false
        });

        this.gem = new THREE.Mesh(geometry, material);
        this.scene.add(this.gem);
    }

    /**
     * Resize the overlay canvas
     */
    resize(width: number, height: number) {
        if (!this.renderer || !this.camera) return;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Update animation (call from game loop)
     */
    update(delta: number) {
        if (!this.gem || !this.renderer || !this.scene || !this.camera) return;

        // Rotate gem (delta in milliseconds)
        const deltaSeconds = delta / 1000;
        this.gem.rotation.y += 0.5 * deltaSeconds; // Y-axis rotation
        this.gem.rotation.x += 0.2 * deltaSeconds; // X-axis rotation

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Set gem position in 3D space
     */
    setGemPosition(x: number, y: number) {
        if (!this.gem || !this.camera) return;

        // Convert screen coordinates to 3D world coordinates
        // Center gem at x,y position (relative to camera)
        const centerX = (x / window.innerWidth) * 2 - 1;
        const centerY = -(y / window.innerHeight) * 2 + 1;

        this.gem.position.x = centerX * 100;
        this.gem.position.y = centerY * 100;
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }

        this.cleanup();

        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }

        console.log('[3D] ThreeOverlayRenderer destroyed');
    }

    private cleanup() {
        // Dispose geometry and materials
        if (this.gem) {
            this.gem.geometry.dispose();
            if (Array.isArray(this.gem.material)) {
                this.gem.material.forEach(m => m.dispose());
            } else {
                this.gem.material.dispose();
            }
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
        }

        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.gem = null;
    }

    /**
     * Show the overlay
     */
    show() {
        if (this.canvas) {
            this.canvas.style.display = 'block';
        }
    }

    /**
     * Hide the overlay
     */
    hide() {
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }
}
