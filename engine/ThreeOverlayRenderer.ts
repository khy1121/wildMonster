import * as THREE from 'three';

/**
 * ThreeOverlayRenderer - Monster RPG themed 3D overlay
 * Manages gem, walking monsters, projectiles, and victory trophy
 */
export class ThreeOverlayRenderer {
    private renderer: THREE.WebGLRenderer | null = null;
    private scene: THREE.Scene | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private gem: THREE.Mesh | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private animationId: number | null = null;

    // Monster RPG elements
    private walkingMonsters: Array<{ mesh: THREE.Group; direction: number; speed: number }> = [];
    private victoryTrophy: THREE.Group | null = null;

    /**
     * static 메서드로 모든 오버레이 캔버스 강제 제거
     */
    static forceCleanup(containerId: string = 'game-root') {
        const container = document.getElementById(containerId);
        if (!container) return;
        const existingCanvases = container.querySelectorAll('canvas[id^="three-overlay-"]');
        existingCanvases.forEach(canvas => {
            console.log(`[3D] Force removing stray canvas: ${canvas.id}`);
            canvas.remove();
        });
    }

    /**
     * Initialize the Three.js overlay
     * @param container - parent element to append canvas to
     * @param sceneId - unique ID for this scene (e.g., 'menu', 'battle')
     */
    init(container: HTMLElement, sceneId: string = 'default'): boolean {
        try {
            // Remove any existing three-overlay canvases from this container
            const existingCanvases = container.querySelectorAll('canvas[id^="three-overlay-"]');
            existingCanvases.forEach(canvas => {
                console.log(`[3D] Removing old canvas: ${canvas.id}`);
                canvas.remove();
            });

            this.canvas = document.createElement('canvas');
            this.canvas.id = `three-overlay-${sceneId}`;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '1';

            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true
            });

            const rect = container.getBoundingClientRect();
            this.renderer.setSize(rect.width, rect.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.scene = new THREE.Scene();

            this.camera = new THREE.PerspectiveCamera(
                45,
                rect.width / rect.height,
                0.1,
                1000
            );
            this.camera.position.z = 200;

            // Only create gem for menu scenes (not for battle scenes)
            if (sceneId === 'menu') {
                this.createGem();
            }

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 7.5);
            this.scene.add(directionalLight);

            container.appendChild(this.canvas);

            console.log(`[3D] ThreeOverlayRenderer initialized for scene: ${sceneId}`);
            return true;

        } catch (error) {
            console.warn('[3D] Failed to initialize:', error);
            this.cleanup();
            return false;
        }
    }

    private createGem() {
        if (!this.scene) return;

        const geometry = new THREE.IcosahedronGeometry(40, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            emissive: 0x9333ea,
            emissiveIntensity: 0.4,
            metalness: 0.8,
            roughness: 0.2
        });

        this.gem = new THREE.Mesh(geometry, material);
        this.scene.add(this.gem);
    }

    /**
     * Add walking monster at bottom of screen
     */
    addWalkingMonster(startX: number, color: number) {
        if (!this.scene) return;

        const monster = new THREE.Group();

        // Body
        const bodyGeo = new THREE.SphereGeometry(8, 12, 12);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 0.8, 1);
        monster.add(body);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-3, 2, 6);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(3, 2, 6);
        monster.add(leftEye, rightEye);

        // Pupils
        const pupilGeo = new THREE.SphereGeometry(0.7, 6, 6);
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-3, 2, 7);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(3, 2, 7);
        monster.add(leftPupil, rightPupil);

        monster.position.set(startX, -80, -20);
        this.scene.add(monster);

        const direction = Math.random() > 0.5 ? 1 : -1;
        const speed = 20 + Math.random() * 20;

        this.walkingMonsters.push({ mesh: monster, direction, speed });
    }

    /**
     * Add multiple walking monsters
     */
    addWalkingMonsters(count: number) {
        const colors = [0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xf59e0b];

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 180;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.addWalkingMonster(x, color);
        }
    }

    /**
     * Show victory trophy
     */
    showVictoryTrophy() {
        if (!this.scene || this.victoryTrophy) return;

        const cupGeo = new THREE.CylinderGeometry(8, 5, 20, 16);
        const cupMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 1.0,
            roughness: 0.2,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        const cup = new THREE.Mesh(cupGeo, cupMat);

        const baseGeo = new THREE.CylinderGeometry(10, 10, 3, 16);
        const base = new THREE.Mesh(baseGeo, cupMat);
        base.position.y = -12;

        const trophy = new THREE.Group();
        trophy.add(cup, base);
        trophy.position.set(0, 0, 0);
        trophy.scale.set(0, 0, 0);

        this.scene.add(trophy);
        this.victoryTrophy = trophy;

        // Animate in
        const startTime = Date.now();
        const animate = () => {
            if (!this.victoryTrophy) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 1000, 1);

            const scale = progress * 2;
            this.victoryTrophy.scale.set(scale, scale, scale);
            this.victoryTrophy.rotation.y += 0.05;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Create 3D projectile
     */
    createProjectile(type: string, startX: number, startY: number): THREE.Mesh | null {
        if (!this.scene) return null;

        let geometry: THREE.BufferGeometry;
        let material: THREE.Material;

        switch (type) {
            case 'fire':
                geometry = new THREE.SphereGeometry(15, 12, 12);
                material = new THREE.MeshStandardMaterial({
                    color: 0xff4400,
                    emissive: 0xff6600,
                    emissiveIntensity: 0.8
                });
                break;

            case 'ice':
                geometry = new THREE.ConeGeometry(10, 25, 6);
                material = new THREE.MeshStandardMaterial({
                    color: 0x60a5fa,
                    emissive: 0x93c5fd,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.8
                });
                break;

            case 'dark':
                geometry = new THREE.OctahedronGeometry(12, 0);
                material = new THREE.MeshStandardMaterial({
                    color: 0x6b21a8,
                    emissive: 0x9333ea,
                    emissiveIntensity: 0.6
                });
                break;

            default:
                geometry = new THREE.SphereGeometry(10, 8, 8);
                material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: 0xcccccc,
                    emissiveIntensity: 0.3
                });
        }

        const projectile = new THREE.Mesh(geometry, material);

        const centerX = (startX / window.innerWidth) * 2 - 1;
        const centerY = -(startY / window.innerHeight) * 2 + 1;
        projectile.position.set(centerX * 100, centerY * 100, 0);

        this.scene.add(projectile);
        return projectile;
    }

    /**
     * Animate projectile to target
     */
    animateProjectile(projectile: THREE.Mesh, endX: number, endY: number, duration: number, onComplete?: () => void) {
        const targetX = (endX / window.innerWidth) * 2 - 1;
        const targetY = -(endY / window.innerHeight) * 2 + 1;

        const startPos = projectile.position.clone();
        const endPos = new THREE.Vector3(targetX * 100, targetY * 100, 0);

        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            projectile.position.lerpVectors(startPos, endPos, progress);
            projectile.rotation.x += 0.1;
            projectile.rotation.y += 0.1;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (this.scene) {
                    this.scene.remove(projectile);
                }
                projectile.geometry.dispose();
                if (Array.isArray(projectile.material)) {
                    projectile.material.forEach(m => m.dispose());
                } else {
                    projectile.material.dispose();
                }

                if (onComplete) onComplete();
            }
        };

        animate();
    }

    resize(width: number, height: number) {
        if (!this.renderer || !this.camera) return;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    update(delta: number) {
        if (!this.renderer || !this.scene || !this.camera) return;

        const deltaSeconds = delta / 1000;

        // Rotate gem
        if (this.gem) {
            this.gem.rotation.y += 0.5 * deltaSeconds;
            this.gem.rotation.x += 0.2 * deltaSeconds;
        }

        // Update walking monsters
        this.walkingMonsters.forEach(monster => {
            // Move horizontally
            monster.mesh.position.x += monster.direction * monster.speed * deltaSeconds;

            // Bounce animation (walking bobble)
            const time = Date.now() / 500;
            monster.mesh.position.y = -80 + Math.sin(time + monster.mesh.position.x / 10) * 3;

            // Reverse direction at edges
            if (Math.abs(monster.mesh.position.x) > 200) {
                monster.direction *= -1;
                monster.mesh.scale.x *= -1; // Flip sprite
            }
        });

        // Rotate victory trophy
        if (this.victoryTrophy) {
            this.victoryTrophy.rotation.y += 0.02;
        }

        this.renderer.render(this.scene, this.camera);
    }

    setGemPosition(x: number, y: number) {
        if (!this.gem) return;

        const centerX = (x / window.innerWidth) * 2 - 1;
        const centerY = -(y / window.innerHeight) * 2 + 1;

        this.gem.position.x = centerX * 100;
        this.gem.position.y = centerY * 100;
    }

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

    show() {
        if (this.canvas) {
            this.canvas.style.display = 'block';
        }
    }

    hide() {
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }

    /**
     * Hide menu-specific elements (gem and monsters) during battle
     */
    hideMenuElements() {
        if (this.gem) {
            this.gem.visible = false;
        }
        this.walkingMonsters.forEach(m => {
            m.mesh.visible = false;
        });
    }

    /**
     * Show menu elements again after battle
     */
    showMenuElements() {
        if (this.gem) {
            this.gem.visible = true;
        }
        this.walkingMonsters.forEach(m => {
            m.mesh.visible = true;
        });
    }

    private cleanup() {
        // Dispose gem
        if (this.gem) {
            this.gem.geometry.dispose();
            if (Array.isArray(this.gem.material)) {
                this.gem.material.forEach(m => m.dispose());
            } else {
                this.gem.material.dispose();
            }
        }

        // Dispose walking monsters
        this.walkingMonsters.forEach(monster => {
            monster.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            if (this.scene) {
                this.scene.remove(monster.mesh);
            }
        });
        this.walkingMonsters = [];

        // Dispose victory trophy
        if (this.victoryTrophy) {
            this.victoryTrophy.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            if (this.scene) {
                this.scene.remove(this.victoryTrophy);
            }
            this.victoryTrophy = null;
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
}
