import * as THREE from 'three';

export interface Terrain3DConfig {
    scene: THREE.Scene;
    size?: number;
    segments?: number;
    heightScale?: number;
}

export class Terrain3D {
    public mesh: THREE.Mesh;
    private size: number;
    private segments: number;

    constructor(config: Terrain3DConfig) {
        this.size = config.size || 200;
        this.segments = config.segments || 100;

        this.mesh = this.createTerrain(config.heightScale || 3);
        config.scene.add(this.mesh);
    }

    private createTerrain(heightScale: number): THREE.Mesh {
        // Create plane geometry
        const geometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            this.segments,
            this.segments
        );

        // Rotate to be horizontal
        geometry.rotateX(-Math.PI / 2);

        // Apply height map using Perlin-like noise
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];

            // Simple noise function (replace with Perlin noise for better results)
            const height = this.simpleNoise(x * 0.02, z * 0.02) * heightScale;
            vertices[i + 1] = height;
        }

        // Recompute normals for proper lighting
        geometry.computeVertexNormals();

        // Create material with grass texture
        const material = new THREE.MeshStandardMaterial({
            color: 0x4a7c3e, // Grass green
            roughness: 0.9,
            metalness: 0.1,
            flatShading: false
        });

        // Add texture variation
        const texture = this.createGrassTexture();
        material.map = texture;
        material.needsUpdate = true;

        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.position.y = 0;

        return mesh;
    }

    private simpleNoise(x: number, y: number): number {
        // Very basic noise - replace with proper Perlin/Simplex noise
        const n = Math.sin(x * 1.5) * Math.cos(y * 1.5) * 0.5 +
            Math.sin(x * 3.0 + y * 2.0) * 0.3 +
            Math.sin(x * 5.0 - y * 4.0) * 0.2;
        return n;
    }

    private createGrassTexture(): THREE.Texture {
        // Create a simple procedural grass texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        // Base grass color
        ctx.fillStyle = '#4a7c3e';
        ctx.fillRect(0, 0, 256, 256);

        // Add some variation
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const shade = Math.random() * 40 - 20;
            const r = 74 + shade;
            const g = 124 + shade;
            const b = 62 + shade;

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 2, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);

        return texture;
    }

    public addTrees(count: number, scene: THREE.Scene) {
        const treeGeometry = this.createTreeGeometry();
        const treeMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.8
        });

        for (let i = 0; i < count; i++) {
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);

            // Random position within terrain bounds
            const x = (Math.random() - 0.5) * this.size * 0.9;
            const z = (Math.random() - 0.5) * this.size * 0.9;

            // Get height at this position
            const y = this.getHeightAt(x, z);

            tree.position.set(x, y, z);
            tree.scale.set(
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4
            );
            tree.castShadow = true;
            tree.receiveShadow = true;

            scene.add(tree);
        }
    }

    private createTreeGeometry(): THREE.BufferGeometry {
        const group = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunk = new THREE.Mesh(trunkGeometry);
        trunk.position.y = 1.5;
        group.add(trunk);

        // Foliage (cone)
        const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const foliage = new THREE.Mesh(foliageGeometry);
        foliage.position.y = 4;
        group.add(foliage);

        // Merge into single geometry
        const mergedGeometry = new THREE.BufferGeometry();
        // Note: This is simplified - in production, use BufferGeometryUtils.mergeGeometries
        return foliageGeometry;
    }

    private getHeightAt(x: number, z: number): number {
        // Simple height calculation - matches terrain generation
        return this.simpleNoise(x * 0.02, z * 0.02) * 3;
    }

    public addRocks(count: number, scene: THREE.Scene) {
        for (let i = 0; i < count; i++) {
            const rock = this.createRock();

            const x = (Math.random() - 0.5) * this.size * 0.9;
            const z = (Math.random() - 0.5) * this.size * 0.9;
            const y = this.getHeightAt(x, z);

            rock.position.set(x, y, z);
            rock.rotation.y = Math.random() * Math.PI * 2;
            rock.scale.setScalar(0.5 + Math.random() * 1.5);

            scene.add(rock);
        }
    }

    private createRock(): THREE.Mesh {
        const geometry = new THREE.DodecahedronGeometry(0.5, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    public dispose() {
        if (this.mesh.geometry) {
            this.mesh.geometry.dispose();
        }
        if (this.mesh.material) {
            if (Array.isArray(this.mesh.material)) {
                this.mesh.material.forEach(m => m.dispose());
            } else {
                this.mesh.material.dispose();
            }
        }
    }
}
