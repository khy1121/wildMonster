import * as THREE from 'three';

/**
 * Simple NPC class for 3D world
 */
export class NPC3D {
    public mesh: THREE.Group;
    public name: string;
    public position: THREE.Vector3;
    private idleAnimation: number = 0;
    private bobSpeed: number;

    constructor(
        name: string,
        position: THREE.Vector3,
        color: number = 0xffaa44
    ) {
        this.name = name;
        this.position = position.clone();
        this.bobSpeed = 0.003 + Math.random() * 0.002;

        // Create NPC mesh
        this.mesh = new THREE.Group();

        // Body
        const bodyGeom = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 12);
        const bodyMat = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.6,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        this.mesh.add(body);

        // Head
        const headGeom = new THREE.SphereGeometry(0.35, 12, 12);
        const head = new THREE.Mesh(headGeom, bodyMat);
        head.position.y = 2.2;
        head.castShadow = true;
        this.mesh.add(head);

        // Eyes
        const eyeGeom = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.12, 2.25, 0.3);
        this.mesh.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.12, 2.25, 0.3);
        this.mesh.add(rightEye);

        // Pupils
        const pupilGeom = new THREE.SphereGeometry(0.04, 6, 6);
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftPupil = new THREE.Mesh(pupilGeom, pupilMat);
        leftPupil.position.set(-0.12, 2.25, 0.35);
        this.mesh.add(leftPupil);
        const rightPupil = new THREE.Mesh(pupilGeom, pupilMat);
        rightPupil.position.set(0.12, 2.25, 0.35);
        this.mesh.add(rightPupil);

        // Name tag (floating text would require canvas texture, simplified here)
        const nameTagGeom = new THREE.PlaneGeometry(1.5, 0.3);
        const nameTagMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const nameTag = new THREE.Mesh(nameTagGeom, nameTagMat);
        nameTag.position.y = 3;
        this.mesh.add(nameTag);

        this.mesh.position.copy(position);
    }

    /**
     * Update NPC (idle animation)
     */
    public update(delta: number): void {
        this.idleAnimation += delta;

        // Gentle bobbing
        this.mesh.position.y = this.position.y + Math.sin(this.idleAnimation * this.bobSpeed) * 0.05;

        // Slight rotation
        this.mesh.rotation.y = Math.sin(this.idleAnimation * this.bobSpeed * 0.5) * 0.1;
    }

    /**
     * Make NPC look at a position
     */
    public lookAt(target: THREE.Vector3): void {
        const direction = new THREE.Vector3().subVectors(target, this.position);
        const angle = Math.atan2(direction.x, direction.z);
        this.mesh.rotation.y = angle;
    }

    /**
     * Check if player is near NPC
     */
    public isPlayerNear(playerPos: THREE.Vector3, distance: number = 3): boolean {
        return this.position.distanceTo(playerPos) < distance;
    }
}

/**
 * Quest marker class
 */
export class QuestMarker3D {
    public mesh: THREE.Group;
    public position: THREE.Vector3;
    public questId: string;
    private rotationSpeed: number = 2;

    constructor(position: THREE.Vector3, questId: string, color: number = 0xffff00) {
        this.position = position.clone();
        this.questId = questId;

        this.mesh = new THREE.Group();

        // Exclamation mark (simplified as a cylinder + sphere)
        const stemGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const markerMat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.7
        });
        const stem = new THREE.Mesh(stemGeom, markerMat);
        stem.position.y = 0.4;
        this.mesh.add(stem);

        const dotGeom = new THREE.SphereGeometry(0.15, 8, 8);
        const dot = new THREE.Mesh(dotGeom, markerMat);
        dot.position.y = -0.2;
        this.mesh.add(dot);

        // Glow ring
        const ringGeom = new THREE.TorusGeometry(0.5, 0.05, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.5;
        this.mesh.add(ring);

        this.mesh.position.copy(position);
        this.mesh.position.y += 3; // Float above ground
    }

    /**
     * Update quest marker (rotation animation)
     */
    public update(delta: number): void {
        this.mesh.rotation.y += this.rotationSpeed * delta;

        // Gentle bobbing
        this.mesh.position.y = this.position.y + 3 + Math.sin(Date.now() * 0.002) * 0.3;
    }

    /**
     * Check if player is near marker
     */
    public isPlayerNear(playerPos: THREE.Vector3, distance: number = 2): boolean {
        const markerGroundPos = new THREE.Vector3(
            this.position.x,
            0,
            this.position.z
        );
        const playerGroundPos = new THREE.Vector3(playerPos.x, 0, playerPos.z);
        return markerGroundPos.distanceTo(playerGroundPos) < distance;
    }
}
