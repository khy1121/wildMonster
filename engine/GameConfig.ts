
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';

export const createGameConfig = (containerId: string): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent: containerId,
    width: '100%',
    height: '100%',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [BootScene, MenuScene, OverworldScene, BattleScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#0f172a'
  };
};
