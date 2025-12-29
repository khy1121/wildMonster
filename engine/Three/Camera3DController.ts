import * as THREE from 'three';

export interface Camera3DConfig {
    camera: THREE.PerspectiveCamera;
    target: THREE.Vector3;
    canvas: HTMLElement;
}

export class Camera3DController {
    private camera: THREE.PerspectiveCamera;
    private target: THREE.Vector3;
    private canvas: HTMLElement;

    // Camera settings
    private distance: number = 15;
    private minDistance: number = 5;
    private maxDistance: number = 30;
    private height: number = 8;
    private minHeight: number = 2;
    private maxHeight: number = 20;

    // Rotation
    private azimuthAngle: number = 0; // Horizontal rotation
    private polarAngle: number = Math.PI / 3; // Vertical angle (60 degrees - looking down)
    private minPolarAngle: number = 0.1;
    private maxPolarAngle: number = Math.PI / 2.2;

    // Mouse state
    private isDragging: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private rotationSpeed: number = 0.005;
    private zoomSpeed: number = 0.5;

    constructor(config: Camera3DConfig) {
        this.camera = config.camera;
        this.target = config.target;
        this.canvas = config.canvas;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Mouse down
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        // Mouse move
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;

                // Rotate camera
                this.azimuthAngle -= deltaX * this.rotationSpeed;
                this.polarAngle += deltaY * this.rotationSpeed;

                // Clamp polar angle
                this.polarAngle = Math.max(
                    this.minPolarAngle,
                    Math.min(this.maxPolarAngle, this.polarAngle)
                );

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        // Mouse up
        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.canvas.style.cursor = 'grab';
            }
        });

        // Mouse wheel (zoom)
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const delta = e.deltaY > 0 ? 1 : -1;
            this.distance += delta * this.zoomSpeed;

            // Clamp distance
            this.distance = Math.max(
                this.minDistance,
                Math.min(this.maxDistance, this.distance)
            );
        }, { passive: false });

        // Set initial cursor
        this.canvas.style.cursor = 'grab';
    }

    public update(targetPosition: THREE.Vector3, smoothing: number = 0.1) {
        // Update target position with smoothing
        this.target.lerp(targetPosition, smoothing);

        // Calculate camera position based on spherical coordinates
        const x = this.target.x + this.distance * Math.sin(this.polarAngle) * Math.sin(this.azimuthAngle);
        const y = this.target.y + this.distance * Math.cos(this.polarAngle) + this.height;
        const z = this.target.z + this.distance * Math.sin(this.polarAngle) * Math.cos(this.azimuthAngle);

        // Update camera position
        this.camera.position.set(x, y, z);
        this.camera.lookAt(this.target.x, this.target.y + 2, this.target.z);
    }

    public setDistance(distance: number) {
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
    }

    public setHeight(height: number) {
        this.height = Math.max(this.minHeight, Math.min(this.maxHeight, height));
    }

    public resetRotation() {
        this.azimuthAngle = 0;
        this.polarAngle = Math.PI / 3;
    }

    public dispose() {
        // Remove event listeners if needed
    }
}
