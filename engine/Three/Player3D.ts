import * as THREE from 'three';

export interface Player3DConfig {
    scene: THREE.Scene;
    position?: THREE.Vector3;
    color?: number;
}

export class Player3D {
    public mesh: THREE.Group;
    public position: THREE.Vector3;
    public rotation: number = 0;
    public velocity: THREE.Vector3 = new THREE.Vector3();

    private moveSpeed: number = 5;
    private rotationSpeed: number = 5;
    private isMoving: boolean = false;

    // Input state
    private keys: { [key: string]: boolean } = {};

    constructor(config: Player3DConfig) {
        this.position = config.position || new THREE.Vector3(0, 0, 0);

        // Create player mesh (capsule-like character)
        this.mesh = this.createPlayerMesh(config.color || 0x4488ff);
        this.mesh.position.copy(this.position);

        config.scene.add(this.mesh);

        // Setup input listeners
        this.setupInput();
    }

    private createPlayerMesh(color: number): THREE.Group {
        const group = new THREE.Group();

        // Body (capsule = cylinder + 2 spheres)
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.7,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 2.5;
        head.castShadow = true;
        group.add(head);

        // Feet
        const feetGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const feet = new THREE.Mesh(feetGeometry, bodyMaterial);
        feet.position.y = 0.5;
        feet.castShadow = true;
        group.add(feet);

        // Direction indicator (small cone)
        const coneGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.position.set(0, 1.5, 0.6);
        cone.rotation.x = Math.PI / 2;
        group.add(cone);

        return group;
    }

    private setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    public update(delta: number) {
        // Movement input
        const moveDirection = new THREE.Vector3();

        if (this.keys['w']) moveDirection.z -= 1;
        if (this.keys['s']) moveDirection.z += 1;
        if (this.keys['a']) moveDirection.x -= 1;
        if (this.keys['d']) moveDirection.x += 1;

        // Normalize to prevent faster diagonal movement
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }

        // Apply rotation to movement direction
        moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);

        // Update velocity
        this.velocity.x = moveDirection.x * this.moveSpeed;
        this.velocity.z = moveDirection.z * this.moveSpeed;

        // Update position
        this.position.x += this.velocity.x * delta;
        this.position.z += this.velocity.z * delta;

        // Update mesh position
        this.mesh.position.copy(this.position);

        // Rotate player to face movement direction
        if (this.isMoving) {
            const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
            this.rotation = this.lerpAngle(this.rotation, targetRotation, this.rotationSpeed * delta);
        }

        this.mesh.rotation.y = this.rotation;

        // Simple animation (bob up and down when moving)
        if (this.isMoving) {
            const bobAmount = Math.sin(Date.now() * 0.01) * 0.1;
            this.mesh.position.y = bobAmount;
        } else {
            this.mesh.position.y = 0;
        }
    }

    private lerpAngle(a: number, b: number, t: number): number {
        // Shortest path rotation
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * t;
    }

    public getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    public getForwardDirection(): THREE.Vector3 {
        return new THREE.Vector3(
            Math.sin(this.rotation),
            0,
            Math.cos(this.rotation)
        );
    }

    public dispose() {
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
}
