
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { getTranslation } from '../../localization/strings';

export class MenuScene extends Phaser.Scene {
  public add!: Phaser.GameObjects.GameObjectFactory;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public scene!: Phaser.Scenes.ScenePlugin;
  public input!: Phaser.Input.InputPlugin;

  private title?: Phaser.GameObjects.Text;
  private startBtn?: Phaser.GameObjects.Text;
  private langBtn?: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
  }

  create() {
    this.createUI();
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

  onResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.main.setSize(width, height);
    if (this.title) this.title.setPosition(width / 2, height / 3);
    if (this.startBtn) this.startBtn.setPosition(width / 2, height / 2 + 50);
    if (this.langBtn) this.langBtn.setPosition(width / 2, height / 2 + 130);
  }

  shutdown() {
    this.scale.off('resize', this.onResize, this);
  }
}
