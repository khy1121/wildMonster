import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { World3DHUD } from './World3DHUD';
import { NPC3D, QuestMarker3D } from '../../engine/Three/NPCAndMarkers';
import { gameStateManager } from '../../engine/GameStateManager';
import { gameEvents } from '../../engine/EventBus';
import { eventManager } from '../../engine/EventManager';
import { MonsterDetailUI } from '../../ui/MonsterDetailUI';
import ShopUI from '../../ui/ShopUI';
import { FactionUI } from '../../ui/AppOverlays';
import { MenuUI } from '../../ui/MenuUI';
import InventoryUI from '../../components/InventoryUI';
import IncubatorUI from '../../ui/IncubatorUI';
import { AchievementsUI } from '../../ui/AchievementsUI';
import { ExpeditionUI } from '../../ui/ExpeditionUI';
import { WorldMapUI } from '../../ui/WorldMapUI';
import { EnhancedQuestLogUI } from '../../ui/EnhancedQuestLogUI';
import { EquipmentUI } from '../../ui/EquipmentUI';
import { SaveManagementUI } from '../../ui/SaveManagementUI';
import { saveManager } from '../../engine/SaveManager';

type OverlayType = 'SKILLS' | 'SHOP' | 'QUESTS' | 'FACTIONS' | 'MENU' | 'INVENTORY' | 'INCUBATOR' | 'ACHIEVEMENTS' | 'EXPEDITIONS' | 'WORLDMAP' | 'ENHANCED_QUESTS' | 'EQUIPMENT' | 'SAVES';

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
    const collidableObjects = useRef<Array<{ position: THREE.Vector3; radius: number }>>([]);
    const npcsRef = useRef<NPC3D[]>([]);
    const questMarkersRef = useRef<QuestMarker3D[]>([]);

    const partnerPosition = useRef(new THREE.Vector3(-2, 0, 2));
    const buildingLocations = useRef<Array<{ x: number; z: number; radius: number }>>([]);

    const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
    const [partnerPos, setPartnerPos] = useState({ x: -2, z: 2 });
    const cameraAngle = useRef({ azimuth: 0, polar: Math.PI / 3 });
    const cameraDistance = useRef(15);

    // Movement state
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const playerVelocity = useRef(new THREE.Vector3());

    // Internal overlay management
    const [activeOverlay, setActiveOverlay] = useState<OverlayType | null>(null);
    const [activeMonsterUid, setActiveMonsterUid] = useState<string | null>(null);
    const [gameState, setGameState] = useState(gameStateManager.getState());

    // Subscribe to game state updates
    useEffect(() => {
        const unsubscribe = gameEvents.subscribe('STATE_UPDATED', (event) => {
            if (event.type === 'STATE_UPDATED') {
                setGameState({ ...event.state });
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

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
        const playerParts = { leftArm: null as THREE.Mesh | null, rightArm: null as THREE.Mesh | null, body: null as THREE.Mesh | null };

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
        playerParts.leftArm = leftArm;

        const rightArm = new THREE.Mesh(armGeom, bodyMat);
        rightArm.position.set(0.7, 1.5, 0);
        rightArm.castShadow = true;
        player.add(rightArm);
        playerParts.rightArm = rightArm;
        playerParts.body = body;

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
        const partnerParts = { ears: [] as THREE.Mesh[], tail: null as THREE.Mesh | null, body: null as THREE.Mesh | null };
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
        partnerParts.body = partnerBody;

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
        partnerParts.ears.push(leftEar);

        const rightEar = new THREE.Mesh(earGeom, partnerMat);
        rightEar.position.set(0.25, 2.2, 0);
        rightEar.rotation.z = 0.3;
        partner.add(rightEar);
        partnerParts.ears.push(rightEar);

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
        partnerParts.tail = tail;

        partner.position.copy(partnerPosition.current);
        scene.add(partner);
        partnerRef.current = partner;

        // Buildings
        const createBuilding = (x: number, z: number, width: number, depth: number, height: number, color: number) => {
            const building = new THREE.Group();

            // Main structure
            const wallGeom = new THREE.BoxGeometry(width, height, depth);
            const wallMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
            const walls = new THREE.Mesh(wallGeom, wallMat);
            walls.position.y = height / 2;
            walls.castShadow = true;
            walls.receiveShadow = true;
            building.add(walls);

            // Roof
            const roofGeom = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, height * 0.3, 4);
            const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const roof = new THREE.Mesh(roofGeom, roofMat);
            roof.position.y = height + height * 0.15;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            building.add(roof);

            // Door
            const doorGeom = new THREE.BoxGeometry(width * 0.3, height * 0.4, 0.1);
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
            const door = new THREE.Mesh(doorGeom, doorMat);
            door.position.set(0, height * 0.2, depth / 2 + 0.05);
            building.add(door);

            building.position.set(x, 0, z);
            scene.add(building);

            // Add collision
            collidableObjects.current.push({
                position: new THREE.Vector3(x, 0, z),
                radius: Math.max(width, depth) / 2 + 0.5
            });

            // Add to building locations for minimap
            buildingLocations.current.push({
                x,
                z,
                radius: Math.max(width, depth) / 2 + 0.5
            });
        };

        // Create village
        createBuilding(-30, -30, 8, 6, 5, 0xd4a574);
        createBuilding(-30, -15, 6, 6, 4, 0xc9a66b);
        createBuilding(-15, -30, 7, 5, 4.5, 0xdeb887);
        createBuilding(-15, -15, 5, 5, 3.5, 0xd2b48c);

        // Tower
        const tower = new THREE.Group();
        const towerGeom = new THREE.CylinderGeometry(2, 2.5, 12, 8);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
        const towerBody = new THREE.Mesh(towerGeom, towerMat);
        towerBody.position.y = 6;
        towerBody.castShadow = true;
        tower.add(towerBody);

        const towerRoofGeom = new THREE.ConeGeometry(3, 4, 8);
        const towerRoof = new THREE.Mesh(towerRoofGeom, new THREE.MeshStandardMaterial({ color: 0x4a4a4a }));
        towerRoof.position.y = 14;
        towerRoof.castShadow = true;
        tower.add(towerRoof);

        tower.position.set(30, 0, -30);
        scene.add(tower);
        collidableObjects.current.push({ position: new THREE.Vector3(30, 0, -30), radius: 3 });

        // Trees (with collision)
        for (let i = 0; i < 40; i++) {
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

            const treeX = (Math.random() - 0.5) * 180;
            const treeZ = (Math.random() - 0.5) * 180;
            tree.position.set(treeX, 0, treeZ);
            scene.add(tree);

            // Add collision
            collidableObjects.current.push({
                position: new THREE.Vector3(treeX, 0, treeZ),
                radius: 0.6
            });
        }

        // Rocks (with collision)
        for (let i = 0; i < 25; i++) {
            const rockGeom = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0);
            const rockMat = new THREE.MeshStandardMaterial({
                color: 0x666666 + Math.random() * 0x222222,
                roughness: 0.9
            });
            const rock = new THREE.Mesh(rockGeom, rockMat);
            const rockX = (Math.random() - 0.5) * 180;
            const rockZ = (Math.random() - 0.5) * 180;
            rock.position.set(rockX, 0.5, rockZ);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            scene.add(rock);

            // Add collision
            collidableObjects.current.push({
                position: new THREE.Vector3(rockX, 0, rockZ),
                radius: 0.8
            });
        }

        // Path markers (decorative stones)
        for (let i = -40; i <= 40; i += 5) {
            const markerGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 6);
            const markerMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const marker = new THREE.Mesh(markerGeom, markerMat);
            marker.position.set(i, 0.25, 0);
            marker.castShadow = true;
            scene.add(marker);
        }

        // NPCs
        const npc1 = new NPC3D('Village Elder', new THREE.Vector3(-25, 0, -22), 0x8b7355);
        scene.add(npc1.mesh);
        npcsRef.current.push(npc1);
        collidableObjects.current.push({ position: npc1.position, radius: 0.6 });

        const npc2 = new NPC3D('Merchant', new THREE.Vector3(-20, 0, -25), 0x4169e1);
        scene.add(npc2.mesh);
        npcsRef.current.push(npc2);
        collidableObjects.current.push({ position: npc2.position, radius: 0.6 });

        const npc3 = new NPC3D('Quest Giver', new THREE.Vector3(-12, 0, -22), 0xff6347);
        scene.add(npc3.mesh);
        npcsRef.current.push(npc3);
        collidableObjects.current.push({ position: npc3.position, radius: 0.6 });

        // Quest Markers
        const questMarker1 = new QuestMarker3D(new THREE.Vector3(-12, 0, -22), 'quest_1', 0xffff00);
        scene.add(questMarker1.mesh);
        questMarkersRef.current.push(questMarker1);

        const questMarker2 = new QuestMarker3D(new THREE.Vector3(25, 0, 25), 'quest_2', 0x00ff00);
        scene.add(questMarker2.mesh);
        questMarkersRef.current.push(questMarker2);

        console.log('[World3D] Scene initialized with', scene.children.length, 'objects');

        // Input
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // Movement keys
            keysRef.current[key] = true;

            // UI shortcuts
            switch (key) {
                case 'i':
                    setActiveOverlay('INVENTORY');
                    break;
                case 'q':
                    setActiveOverlay('ENHANCED_QUESTS');
                    break;
                case 'm':
                    setActiveOverlay('WORLDMAP');
                    break;
                case 'c':
                    setActiveOverlay('EQUIPMENT');
                    break;
                case 'k':
                    setActiveOverlay('SKILLS');
                    break;
                case 'f':
                    setActiveOverlay('FACTIONS');
                    break;
                case 'b':
                    setActiveOverlay('SHOP');
                    break;
                case 'p':
                    setActiveOverlay('ACHIEVEMENTS');
                    break;
                case 'e':
                    setActiveOverlay('EXPEDITIONS');
                    break;
                case 'o':
                    setActiveOverlay('INCUBATOR');
                    break;
                case 'escape':
                    setActiveOverlay('MENU');
                    break;
            }
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

                cameraAngle.current = {
                    azimuth: cameraAngle.current.azimuth - deltaX * 0.005,
                    polar: Math.max(0.1, Math.min(Math.PI / 2.2, cameraAngle.current.polar + deltaY * 0.005))
                };

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
            cameraDistance.current = Math.max(5, Math.min(30, cameraDistance.current + e.deltaY * 0.01));
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
                    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle.current.azimuth);

                    playerVelocity.current.x = moveDir.x * 5;
                    playerVelocity.current.z = moveDir.z * 5;

                    // Calculate new position
                    let newX = playerRef.current.position.x + playerVelocity.current.x * delta;
                    let newZ = playerRef.current.position.z + playerVelocity.current.z * delta;

                    // Boundary collision (keep player within -95 to 95)
                    const boundary = 95;
                    newX = Math.max(-boundary, Math.min(boundary, newX));
                    newZ = Math.max(-boundary, Math.min(boundary, newZ));

                    // Object collision detection
                    let canMove = true;
                    const playerRadius = 0.5;

                    for (const obj of collidableObjects.current) {
                        const dx = newX - obj.position.x;
                        const dz = newZ - obj.position.z;
                        const distance = Math.sqrt(dx * dx + dz * dz);

                        if (distance < obj.radius + playerRadius) {
                            canMove = false;

                            // Push player away from collision
                            const pushAngle = Math.atan2(dz, dx);
                            const pushDistance = (obj.radius + playerRadius) - distance + 0.1;
                            newX += Math.cos(pushAngle) * pushDistance;
                            newZ += Math.sin(pushAngle) * pushDistance;
                            break;
                        }
                    }

                    playerRef.current.position.x = newX;
                    playerRef.current.position.z = newZ;

                    // Rotate player
                    const targetRot = Math.atan2(moveDir.x, moveDir.z);
                    playerRef.current.rotation.y = targetRot;

                    // Walking animation
                    const walkCycle = Date.now() * 0.008; // Walking speed

                    // Bob animation (up and down)
                    playerRef.current.position.y = Math.abs(Math.sin(walkCycle)) * 0.15;

                    // Arm swing animation
                    if (playerParts.leftArm && playerParts.rightArm) {
                        const armSwing = Math.sin(walkCycle) * 0.5; // Swing angle
                        playerParts.leftArm.rotation.x = armSwing;
                        playerParts.rightArm.rotation.x = -armSwing; // Opposite direction
                    }

                    // Slight body tilt forward when walking
                    if (playerParts.body) {
                        playerParts.body.rotation.x = Math.sin(walkCycle) * 0.05;
                    }

                    setPlayerPos({ x: playerRef.current.position.x, z: playerRef.current.position.z });

                    // Emit for Global HUD
                    eventManager.emit({
                        type: 'PLAYER_MOVE',
                        position: { x: playerRef.current.position.x, y: playerRef.current.position.y, z: playerRef.current.position.z },
                        rotation: playerRef.current.rotation.y
                    });
                } else {
                    // Idle state - reset animations
                    playerRef.current.position.y = 0;

                    if (playerParts.leftArm && playerParts.rightArm) {
                        playerParts.leftArm.rotation.x = 0;
                        playerParts.rightArm.rotation.x = 0;
                    }

                    if (playerParts.body) {
                        playerParts.body.rotation.x = 0;
                    }
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

                    // Update partner position for HUD
                    setPartnerPos({
                        x: partnerPosition.current.x,
                        z: partnerPosition.current.z
                    });

                    const partnerDir = new THREE.Vector3()
                        .subVectors(targetPos, partnerPosition.current);

                    const isMoving = partnerDir.length() > 0.1;

                    if (isMoving) {
                        // Moving animation
                        partnerRef.current.rotation.y = Math.atan2(partnerDir.x, partnerDir.z);

                        const moveCycle = Date.now() * 0.012;

                        // Bouncy movement
                        partnerRef.current.position.y = Math.abs(Math.sin(moveCycle)) * 0.2;

                        // Tail wag when moving
                        if (partnerParts.tail) {
                            partnerParts.tail.rotation.y = Math.sin(moveCycle * 1.5) * 0.6;
                        }

                        // Ears wiggle
                        if (partnerParts.ears.length === 2) {
                            const earWiggle = Math.sin(moveCycle * 2) * 0.15;
                            partnerParts.ears[0].rotation.z = -0.3 + earWiggle;
                            partnerParts.ears[1].rotation.z = 0.3 - earWiggle;
                        }

                        // Body tilt
                        if (partnerParts.body) {
                            partnerParts.body.rotation.z = Math.sin(moveCycle) * 0.1;
                        }
                    } else {
                        // Idle animation
                        const idleCycle = Date.now() * 0.005;
                        partnerRef.current.position.y = Math.sin(idleCycle) * 0.05;

                        // Gentle tail sway when idle
                        if (partnerParts.tail) {
                            partnerParts.tail.rotation.y = Math.sin(idleCycle * 2) * 0.2;
                        }

                        // Reset ears
                        if (partnerParts.ears.length === 2) {
                            partnerParts.ears[0].rotation.z = -0.3;
                            partnerParts.ears[1].rotation.z = 0.3;
                        }

                        // Reset body tilt
                        if (partnerParts.body) {
                            partnerParts.body.rotation.z = 0;
                        }
                    }
                }

                let interactionTarget = null;
                // Update NPCs
                for (const npc of npcsRef.current) {
                    npc.update(delta);

                    // Make NPCs look at player if nearby
                    if (npc.isPlayerNear(playerRef.current.position, 5)) {
                        npc.lookAt(playerRef.current.position);
                    }

                    if (npc.isPlayerNear(playerRef.current.position, 2)) {
                        interactionTarget = npc;
                    }
                }

                if (interactionTarget) {
                    eventManager.emit({ type: 'INTERACTION_SHOW', label: `Talk to ${interactionTarget.name}`, targetId: interactionTarget.name }); // using name as ID for now
                } else {
                    eventManager.emit({ type: 'INTERACTION_HIDE' });
                }

                // Update quest markers
                for (const marker of questMarkersRef.current) {
                    marker.update(delta);
                }

                // Update camera
                if (cameraRef.current) {
                    const camX = playerRef.current.position.x +
                        cameraDistance.current * Math.sin(cameraAngle.current.polar) * Math.sin(cameraAngle.current.azimuth);
                    const camY = playerRef.current.position.y +
                        cameraDistance.current * Math.cos(cameraAngle.current.polar);
                    const camZ = playerRef.current.position.z +
                        cameraDistance.current * Math.sin(cameraAngle.current.polar) * Math.cos(cameraAngle.current.azimuth);

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
    }, []); // Empty dependency array - initialize once

    return (
        <div className="fixed inset-0 z-50">
            <div ref={containerRef} className="w-full h-full" />

            {/* <World3DHUD
                playerPos={playerPos}
                partnerPos={partnerPos}
                buildings={buildingLocations.current}
                onOpenOverlay={(type) => {
                    if (type === 'SKILLS' && gameState.tamer.party.length > 0) {
                        setActiveMonsterUid(gameState.tamer.party[0].uid);
                    }
                    setActiveOverlay(type);
                }}
                onClose={onClose}
            /> */}

            {/* Overlay UIs - DISABLED: Managed by App.tsx Layer 20 */}
            {/*
            {activeOverlay === 'SKILLS' && activeMonsterUid && (
                <MonsterDetailUI
                    gsm={gameStateManager}
                    monsterUid={activeMonsterUid}
                    language={gameState.language}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'SHOP' && (
                <ShopUI
                    state={gameState}
                    onBuy={(id, q) => gameStateManager.buyItem(id, q)}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'FACTIONS' && (
                <FactionUI
                    state={gameState}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'MENU' && (
                <MenuUI
                    state={gameState}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'INVENTORY' && (
                <InventoryUI
                    state={gameState}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'INCUBATOR' && (
                <IncubatorUI
                    state={gameState}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'ACHIEVEMENTS' && (
                <AchievementsUI
                    gsm={gameStateManager}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'EXPEDITIONS' && (
                <ExpeditionUI
                    gsm={gameStateManager}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'WORLDMAP' && (
                <WorldMapUI
                    gsm={gameStateManager}
                    onClose={() => setActiveOverlay(null)}
                    onTravelToRegion={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'ENHANCED_QUESTS' && (
                <EnhancedQuestLogUI
                    gsm={gameStateManager}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'EQUIPMENT' && (
                <EquipmentUI
                    gsm={gameStateManager}
                    onClose={() => setActiveOverlay(null)}
                />
            )}

            {activeOverlay === 'SAVES' && (
                <SaveManagementUI
                    onClose={() => setActiveOverlay(null)}
                    onLoadSave={(slotId) => {
                        const loadedState = saveManager.loadFromSlot(slotId);
                        if (loadedState) {
                            gameStateManager.setState(loadedState);
                            setGameState(loadedState);
                            setActiveOverlay(null);
                        }
                    }}
                />
            )}
            */}
        </div>
    );
};
