
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';

export class MenuScene extends Phaser.Scene {
  public add!: Phaser.GameObjects.GameObjectFactory;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public scene!: Phaser.Scenes.ScenePlugin;
  public input!: Phaser.Input.InputPlugin;

  constructor() {
    super('MenuScene');
  }

  create() {
    const mainCamera = this.cameras.main;
    const width = mainCamera.width;
    const height = mainCamera.height;

    this.add.text(width / 2, height / 3, 'EONTAMERS', {
      fontSize: '64px',
      color: '#6366f1',
      fontStyle: 'bold italic'
    }).setOrigin(0.5);

    const startBtn = this.add.text(width / 2, height / 2 + 50, 'START GAME', {
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

    startBtn.on('pointerover', () => startBtn.setStyle({ backgroundColor: '#4f46e5' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ backgroundColor: '#4338ca' }));
  }
}
