import * as THREE from 'three';

/**
 * Simple test scene to verify Three.js rendering
 */
export class TestScene {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    private cube: THREE.Mesh;
    private animationId: number | null = null;

    constructor(container: HTMLElement) {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c3e,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Test cube (player)
        const cubeGeometry = new THREE.BoxGeometry(1, 2, 1);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff });
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.cube.position.y = 1;
        this.cube.castShadow = true;
        this.scene.add(this.cube);

        // Partner cube
        const partnerGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
        const partnerMaterial = new THREE.MeshStandardMaterial({ color: 0xff4488 });
        const partner = new THREE.Mesh(partnerGeometry, partnerMaterial);
        partner.position.set(-2, 0.75, 2);
        partner.castShadow = true;
        this.scene.add(partner);

        // Grid helper
        const gridHelper = new THREE.GridHelper(50, 50);
        this.scene.add(gridHelper);

        // Axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        console.log('[TestScene] Initialized with cube at:', this.cube.position);
        console.log('[TestScene] Camera at:', this.camera.position);
        console.log('[TestScene] Scene children:', this.scene.children.length);

        this.animate();
    }

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        // Rotate cube for visual feedback
        this.cube.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);
    };

    public dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.renderer.dispose();
    }
}
