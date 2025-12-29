import * as THREE from 'three';

export interface Partner3DConfig {
    scene: THREE.Scene;
    targetPosition: THREE.Vector3;
    color?: number;
    speciesId?: string;
}

export class Partner3D {
    public mesh: THREE.Group;
    public position: THREE.Vector3;
    private targetPosition: THREE.Vector3;

    private followDistance: number = 3;
    private followSpeed: number = 6;
    private rotationSpeed: number = 8;
    private currentRotation: number = 0;

    constructor(config: Partner3DConfig) {
        // Start at a visible position (slightly behind and to the side)
        this.position = new THREE.Vector3(-2, 0, 2);
        this.targetPosition = config.targetPosition.clone();

        // Create partner mesh (smaller than player)
        this.mesh = this.createPartnerMesh(config.color || 0xff4488, config.speciesId);
        this.mesh.position.copy(this.position);

        config.scene.add(this.mesh);

        console.log('[Partner3D] Created at position:', this.position);
    }

    private createPartnerMesh(color: number, speciesId?: string): THREE.Group {
        const group = new THREE.Group();

        // Body (smaller capsule)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.6,
            metalness: 0.4,
            emissive: color,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head (cute sphere)
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.7;
        head.castShadow = true;
        group.add(head);

        // Eyes (white spheres)
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 1.75, 0.25);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 1.75, 0.25);
        group.add(rightEye);

        // Pupils
        const pupilGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.15, 1.75, 0.3);
        group.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.15, 1.75, 0.3);
        group.add(rightPupil);

        // Feet
        const feetGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const feet = new THREE.Mesh(feetGeometry, bodyMaterial);
        feet.position.y = 0.4;
        feet.castShadow = true;
        group.add(feet);

        // Tail (small cone)
        const tailGeometry = new THREE.ConeGeometry(0.15, 0.6, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 1.0, -0.4);
        tail.rotation.x = Math.PI / 4;
        group.add(tail);

        return group;
    }

    public update(delta: number, playerPosition: THREE.Vector3, playerRotation: number) {
        // Calculate follow position (behind player)
        const followOffset = new THREE.Vector3(
            Math.sin(playerRotation) * -this.followDistance,
            0,
            Math.cos(playerRotation) * -this.followDistance
        );

        this.targetPosition.copy(playerPosition).add(followOffset);

        // Calculate distance to target
        const distance = this.position.distanceTo(this.targetPosition);

        // Only move if far enough from target
        if (distance > 0.5) {
            // Direction to target
            const direction = new THREE.Vector3()
                .subVectors(this.targetPosition, this.position)
                .normalize();

            // Move towards target
            const moveSpeed = Math.min(this.followSpeed, distance * 3); // Speed up when far
            this.position.add(direction.multiplyScalar(moveSpeed * delta));

            // Rotate to face movement direction
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.currentRotation = this.lerpAngle(
                this.currentRotation,
                targetRotation,
                this.rotationSpeed * delta
            );

            // Animate (bounce when moving)
            const bounceAmount = Math.sin(Date.now() * 0.015) * 0.15;
            this.mesh.position.y = bounceAmount;
        } else {
            // Idle animation (gentle bob)
            const idleBob = Math.sin(Date.now() * 0.005) * 0.05;
            this.mesh.position.y = idleBob;
        }

        // Update mesh position and rotation
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.z;
        this.mesh.rotation.y = this.currentRotation;
    }

    private lerpAngle(a: number, b: number, t: number): number {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * t;
    }

    public setTargetPosition(position: THREE.Vector3) {
        this.targetPosition.copy(position);
    }

    public getPosition(): THREE.Vector3 {
        return this.position.clone();
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
