import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface World3DProps {
    onClose?: () => void;
}

export const World3D: React.FC<World3DProps> = ({ onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const playerRef = useRef<THREE.Group | null>(null);
    const partnerRef = useRef<THREE.Group | null>(null);
    const animationIdRef = useRef<number | null>(null);

    const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
    const [cameraAngle, setCameraAngle] = useState({ azimuth: 0, polar: Math.PI / 3 });
    const [cameraDistance, setCameraDistance] = useState(15);

    // Movement state
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const playerVelocity = useRef(new THREE.Vector3());
    const partnerPosition = useRef(new THREE.Vector3(-2, 0, 2));

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 15);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.4);
        scene.add(hemisphereLight);

        // Ground with height variation
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
        const positions = groundGeometry.attributes.position;

        // Add height variation (simple noise)
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            const height =
                Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 +
                Math.sin(x * 0.1) * 0.5 +
                Math.cos(z * 0.1) * 0.5;
            positions.setZ(i, height);
        }
        groundGeometry.computeVertexNormals();

        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c3e,
            roughness: 0.9,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Water plane
        const waterGeometry = new THREE.PlaneGeometry(200, 200);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488cc,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.8
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.5;
        scene.add(water);

        // Grid
        const gridHelper = new THREE.GridHelper(200, 100, 0x444444, 0x888888);
        scene.add(gridHelper);

        // Player (improved capsule with arms)
        const player = new THREE.Group();

        // Body
        const bodyGeom = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            roughness: 0.7,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        player.add(body);

        // Head
        const headGeom = new THREE.SphereGeometry(0.45, 16, 16);
        const head = new THREE.Mesh(headGeom, bodyMat);
        head.position.y = 2.7;
        head.castShadow = true;
        player.add(head);

        // Eyes
        const eyeGeom = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.15, 2.8, 0.4);
        player.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.15, 2.8, 0.4);
        player.add(rightEye);

        // Arms
        const armGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
        const leftArm = new THREE.Mesh(armGeom, bodyMat);
        leftArm.position.set(-0.7, 1.5, 0);
        leftArm.castShadow = true;
        player.add(leftArm);
        const rightArm = new THREE.Mesh(armGeom, bodyMat);
        rightArm.position.set(0.7, 1.5, 0);
        rightArm.castShadow = true;
        player.add(rightArm);

        // Feet
        const feetGeom = new THREE.SphereGeometry(0.4, 16, 16);
        const feet = new THREE.Mesh(feetGeom, bodyMat);
        feet.position.y = 0.5;
        feet.castShadow = true;
        player.add(feet);

        scene.add(player);
        playerRef.current = player;

        // Partner (cute monster with ears and tail)
        const partner = new THREE.Group();
        const partnerMat = new THREE.MeshStandardMaterial({
            color: 0xff4488,
            roughness: 0.6,
            metalness: 0.2
        });

        // Body
        const partnerBodyGeom = new THREE.CylinderGeometry(0.35, 0.4, 1.2, 16);
        const partnerBody = new THREE.Mesh(partnerBodyGeom, partnerMat);
        partnerBody.position.y = 1.0;
        partnerBody.castShadow = true;
        partner.add(partnerBody);

        // Head
        const partnerHeadGeom = new THREE.SphereGeometry(0.4, 16, 16);
        const partnerHead = new THREE.Mesh(partnerHeadGeom, partnerMat);
        partnerHead.position.y = 1.8;
        partnerHead.castShadow = true;
        partner.add(partnerHead);

        // Ears
        const earGeom = new THREE.ConeGeometry(0.15, 0.4, 8);
        const leftEar = new THREE.Mesh(earGeom, partnerMat);
        leftEar.position.set(-0.25, 2.2, 0);
        leftEar.rotation.z = -0.3;
        partner.add(leftEar);
        const rightEar = new THREE.Mesh(earGeom, partnerMat);
        rightEar.position.set(0.25, 2.2, 0);
        rightEar.rotation.z = 0.3;
        partner.add(rightEar);

        // Eyes
        const partnerEyeGeom = new THREE.SphereGeometry(0.08, 8, 8);
        const partnerEyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const partnerLeftEye = new THREE.Mesh(partnerEyeGeom, partnerEyeMat);
        partnerLeftEye.position.set(-0.12, 1.9, 0.35);
        partner.add(partnerLeftEye);
        const partnerRightEye = new THREE.Mesh(partnerEyeGeom, partnerEyeMat);
        partnerRightEye.position.set(0.12, 1.9, 0.35);
        partner.add(partnerRightEye);

        // Tail
        const tailGeom = new THREE.CylinderGeometry(0.08, 0.05, 0.8, 8);
        const tail = new THREE.Mesh(tailGeom, partnerMat);
        tail.position.set(0, 0.8, -0.4);
        tail.rotation.x = Math.PI / 4;
        partner.add(tail);

        partner.position.copy(partnerPosition.current);
        scene.add(partner);
        partnerRef.current = partner;

        // Trees
        for (let i = 0; i < 30; i++) {
            const tree = new THREE.Group();
            const trunkGeom = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
            const trunk = new THREE.Mesh(trunkGeom, trunkMat);
            trunk.position.y = 1.5;
            trunk.castShadow = true;
            tree.add(trunk);

            const foliageGeom = new THREE.ConeGeometry(1.5, 3, 8);
            const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
            const foliage = new THREE.Mesh(foliageGeom, foliageMat);
            foliage.position.y = 4;
            foliage.castShadow = true;
            tree.add(foliage);

            tree.position.set(
                (Math.random() - 0.5) * 180,
                0,
                (Math.random() - 0.5) * 180
            );
            scene.add(tree);
        }

        // Rocks
        for (let i = 0; i < 20; i++) {
            const rockGeom = new THREE.DodecahedronGeometry(0.5, 0);
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
            const rock = new THREE.Mesh(rockGeom, rockMat);
            rock.position.set(
                (Math.random() - 0.5) * 180,
                0.5,
                (Math.random() - 0.5) * 180
            );
            rock.castShadow = true;
            scene.add(rock);
        }

        console.log('[World3D] Scene initialized with', scene.children.length, 'objects');

        // Input
        const handleKeyDown = (e: KeyboardEvent) => {
            keysRef.current[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current[e.key.toLowerCase()] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Mouse controls
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                isDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
                renderer.domElement.style.cursor = 'grabbing';
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;

                setCameraAngle(prev => ({
                    azimuth: prev.azimuth - deltaX * 0.005,
                    polar: Math.max(0.1, Math.min(Math.PI / 2.2, prev.polar + deltaY * 0.005))
                }));

                lastX = e.clientX;
                lastY = e.clientY;
            }
        };

        const handleMouseUp = () => {
            isDragging = false;
            renderer.domElement.style.cursor = 'grab';
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1 : -1;
            setCameraDistance(prev => Math.max(5, Math.min(30, prev + delta * 0.5)));
        };

        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
        renderer.domElement.style.cursor = 'grab';

        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            const delta = clock.getDelta();

            if (playerRef.current) {
                // Movement
                const moveDir = new THREE.Vector3();
                if (keysRef.current['w']) moveDir.z -= 1;
                if (keysRef.current['s']) moveDir.z += 1;
                if (keysRef.current['a']) moveDir.x -= 1;
                if (keysRef.current['d']) moveDir.x += 1;

                if (moveDir.length() > 0) {
                    moveDir.normalize();
                    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle.azimuth);

                    playerVelocity.current.x = moveDir.x * 5;
                    playerVelocity.current.z = moveDir.z * 5;

                    // Calculate new position
                    const newX = playerRef.current.position.x + playerVelocity.current.x * delta;
                    const newZ = playerRef.current.position.z + playerVelocity.current.z * delta;

                    // Boundary collision (keep player within -95 to 95)
                    const boundary = 95;
                    if (Math.abs(newX) < boundary) {
                        playerRef.current.position.x = newX;
                    }
                    if (Math.abs(newZ) < boundary) {
                        playerRef.current.position.z = newZ;
                    }

                    // Rotate player
                    const targetRot = Math.atan2(moveDir.x, moveDir.z);
                    playerRef.current.rotation.y = targetRot;

                    // Bob animation
                    playerRef.current.position.y = Math.sin(Date.now() * 0.01) * 0.1;

                    setPlayerPos({ x: playerRef.current.position.x, z: playerRef.current.position.z });
                } else {
                    playerRef.current.position.y = 0;
                }

                // Partner follows
                if (partnerRef.current) {
                    const targetPos = new THREE.Vector3(
                        playerRef.current.position.x + Math.sin(playerRef.current.rotation.y) * -3,
                        0,
                        playerRef.current.position.z + Math.cos(playerRef.current.rotation.y) * -3
                    );

                    partnerPosition.current.lerp(targetPos, 5 * delta);
                    partnerRef.current.position.copy(partnerPosition.current);

                    const partnerDir = new THREE.Vector3()
                        .subVectors(targetPos, partnerPosition.current);
                    if (partnerDir.length() > 0.1) {
                        partnerRef.current.rotation.y = Math.atan2(partnerDir.x, partnerDir.z);
                        partnerRef.current.position.y = Math.sin(Date.now() * 0.015) * 0.15;
                    } else {
                        partnerRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.05;
                    }
                }

                // Update camera
                if (cameraRef.current) {
                    const camX = playerRef.current.position.x +
                        cameraDistance * Math.sin(cameraAngle.polar) * Math.sin(cameraAngle.azimuth);
                    const camY = playerRef.current.position.y +
                        cameraDistance * Math.cos(cameraAngle.polar);
                    const camZ = playerRef.current.position.z +
                        cameraDistance * Math.sin(cameraAngle.polar) * Math.cos(cameraAngle.azimuth);

                    cameraRef.current.position.set(camX, camY, camZ);
                    cameraRef.current.lookAt(
                        playerRef.current.position.x,
                        playerRef.current.position.y + 2,
                        playerRef.current.position.z
                    );
                }
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate();

        // Resize
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            renderer.domElement.removeEventListener('wheel', handleWheel);

            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, [cameraAngle, cameraDistance]);

    return (
        <div className="fixed inset-0 z-50">
            <div ref={containerRef} className="w-full h-full" />

            {/* HUD */}
            <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">🌍 3D World</h3>
                <div className="text-sm space-y-1">
                    <p>🎮 WASD - Move</p>
                    <p>🖱️ Drag - Rotate</p>
                    <p>🔍 Scroll - Zoom</p>
                    <p>📍 Position: {playerPos.x.toFixed(1)}, {playerPos.z.toFixed(1)}</p>
                    <p>🐾 Partner: ✅ Following</p>
                </div>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition"
                >
                    Exit 3D Mode
                </button>
            )}

            <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg max-w-md">
                <h4 className="font-bold mb-2">🎉 3D MMORPG World</h4>
                <p className="text-sm text-gray-300">
                    디지몬 마스터즈 스타일의 3D 오픈월드입니다.
                    WASD로 이동하고 마우스로 카메라를 회전하세요!
                </p>
            </div>
        </div>
    );
};
