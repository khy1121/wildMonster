
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';

export class BootScene extends Phaser.Scene {
  public add!: Phaser.GameObjects.GameObjectFactory;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public make!: Phaser.GameObjects.GameObjectCreator;
  public load!: Phaser.Loader.LoaderPlugin;
  public scene!: Phaser.Scenes.ScenePlugin;

  constructor() {
    super('BootScene');
  }

  preload() {
    // Placeholder for loading assets
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading EonTamers...',
      style: { font: '20px monospace', color: '#ffffff' }
    }).setOrigin(0.5, 0.5);

    this.load.on('complete', () => {
      loadingText.destroy();
    });
  }

  create() {
    this.scene.start('MenuScene');
    gameEvents.emitEvent({ type: 'SCENE_CHANGED', sceneKey: 'MenuScene' });
  }
}
