
import Phaser from 'phaser';

/**
 * @deprecated Use OverworldScene instead. 
 * This file is kept to satisfy existing references if any, but simplified to avoid syntax errors.
 */
export class WorldScene extends Phaser.Scene {
  public add!: any;
  public physics!: any;
  public cameras!: any;
  public input!: any;

  constructor() {
    super('WorldScene');
  }
  create() {
    console.warn("WorldScene is deprecated. Use OverworldScene.");
  }
}
