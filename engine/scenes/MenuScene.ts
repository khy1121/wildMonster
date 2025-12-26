
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { getTranslation } from '../../localization/strings';
import { ThreeOverlayRenderer } from '../ThreeOverlayRenderer';

export class MenuScene extends Phaser.Scene {
  public add!: Phaser.GameObjects.GameObjectFactory;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public scene!: Phaser.Scenes.ScenePlugin;
  public input!: Phaser.Input.InputPlugin;

  private title?: Phaser.GameObjects.Text;
  private startBtn?: Phaser.GameObjects.Text;
  private langBtn?: Phaser.GameObjects.Text;

  // 3D Elements
  private threeOverlay: ThreeOverlayRenderer | null = null;
  private fallbackGem: Phaser.GameObjects.Text | null = null;
  private buttonParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor() {
    super('MenuScene');
  }

  create() {
    this.createUI();
    this.init3DGem();
    this.createFloatingParticles();
    this.scale.on('resize', this.onResize, this);
  }

  createUI() {
    const mainCamera = this.cameras.main;
    const width = mainCamera.width;
    const height = mainCamera.height;

    const state = gameStateManager.getState();
    let t = getTranslation(state.language);

    this.title = this.add.text(width / 2, height / 3, 'EONTAMERS', {
      fontSize: '64px',
      color: '#6366f1',
      fontStyle: 'bold italic'
    }).setOrigin(0.5);

    this.startBtn = this.add.text(width / 2, height / 2 + 50, t.ui.start_game, {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#4338ca',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('OverworldScene');
        gameEvents.emitEvent({ type: 'SCENE_CHANGED', sceneKey: 'OverworldScene' });
      });

    this.startBtn.on('pointerover', () => this.startBtn?.setStyle({ backgroundColor: '#4f46e5' }));
    this.startBtn.on('pointerout', () => this.startBtn?.setStyle({ backgroundColor: '#4338ca' }));

    // Language Toggle
    this.langBtn = this.add.text(width / 2, height / 2 + 130, `${t.ui.language}: ${state.language.toUpperCase()}`, {
      fontSize: '16px',
      color: '#94a3b8',
      backgroundColor: '#1e293b',
      padding: { x: 15, y: 5 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nextLang = state.language === 'ko' ? 'en' : 'ko';
        gameStateManager.setLanguage(nextLang);
        // Refresh scene
        this.scene.restart();
      });
  }

  /**
   * Initialize 3D gem with Three.js overlay or 2D fallback
   */
  init3DGem() {
    const gameContainer = document.getElementById('game-root');
    if (!gameContainer) {
      console.warn('[3D] Game container not found');
      this.create2DFallbackGem();
      return;
    }

    this.threeOverlay = new ThreeOverlayRenderer();
    const success = this.threeOverlay.init(gameContainer);

    if (success) {
      // Position gem at center-top
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      this.threeOverlay.setGemPosition(width / 2, height * 0.15);
    } else {
      console.warn('[3D] WebGL unavailable, using 2D fallback gem');
      this.threeOverlay = null;
      this.create2DFallbackGem();
    }
  }

  /**
   * Create 2D fallback gem if 3D fails
   */
  create2DFallbackGem() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.fallbackGem = this.add.text(
      width / 2,
      height * 0.15,
      '💎',
      { fontSize: '80px' }
    ).setOrigin(0.5);

    // Glow effect with tweens
    this.tweens.add({
      targets: this.fallbackGem,
      scale: 1.2,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.fallbackGem,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  /**
   * Create floating particles above buttons
   */
  createFloatingParticles() {
    if (!this.startBtn || !this.langBtn) return;

    // Create particle texture if not exists (already exists from BattleScene)
    const textureKey = 'menuParticle';
    if (!this.textures.exists(textureKey)) {
      const canvas = this.textures.createCanvas(textureKey, 6, 6);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(3, 3, 0, 3, 3, 3);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 1)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 6, 6);
        canvas.refresh();
      }
    }

    // Particles above start button
    const startParticles = this.add.particles(this.startBtn.x, this.startBtn.y - 40, textureKey, {
      speed: { min: 10, max: 30 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 3000,
      gravityY: -15,
      frequency: 200,
      blendMode: Phaser.BlendModes.ADD,
      maxParticles: 15
    });
    this.buttonParticles.push(startParticles);

    // Particles above language button
    const langParticles = this.add.particles(this.langBtn.x, this.langBtn.y - 30, textureKey, {
      speed: { min: 8, max: 20 },
      angle: { min: 265, max: 275 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 2500,
      gravityY: -10,
      frequency: 250,
      blendMode: Phaser.BlendModes.ADD,
      maxParticles: 10
    });
    this.buttonParticles.push(langParticles);
  }

  /**
   * Update 3D gem animation
   */
  update(time: number, delta: number) {
    if (this.threeOverlay) {
      this.threeOverlay.update(delta);
    }
  }

  onResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.main.setSize(width, height);

    // Update UI positions
    if (this.title) this.title.setPosition(width / 2, height / 3);
    if (this.startBtn) this.startBtn.setPosition(width / 2, height / 2 + 50);
    if (this.langBtn) this.langBtn.setPosition(width / 2, height / 2 + 130);

    // Update 3D overlay
    if (this.threeOverlay) {
      this.threeOverlay.resize(width, height);
      this.threeOverlay.setGemPosition(width / 2, height * 0.15);
    }

    // Update fallback gem
    if (this.fallbackGem) {
      this.fallbackGem.setPosition(width / 2, height * 0.15);
    }

    // Update particle positions
    if (this.buttonParticles.length >= 1 && this.startBtn) {
      this.buttonParticles[0].setPosition(this.startBtn.x, this.startBtn.y - 40);
    }
    if (this.buttonParticles.length >= 2 && this.langBtn) {
      this.buttonParticles[1].setPosition(this.langBtn.x, this.langBtn.y - 30);
    }
  }

  shutdown() {
    this.scale.off('resize', this.onResize, this);

    // Cleanup 3D overlay
    if (this.threeOverlay) {
      this.threeOverlay.destroy();
      this.threeOverlay = null;
    }

    // Cleanup particles
    this.buttonParticles.forEach(p => p.destroy());
    this.buttonParticles = [];
  }
}
