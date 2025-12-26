
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { WORLD_ZONES } from '../../data/zones';
import { MONSTER_DATA } from '../../data/monsters';
import { validateSpawn } from '../../domain/logic';

export class OverworldScene extends Phaser.Scene {
  public physics!: Phaser.Physics.Arcade.ArcadePhysics;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public input!: Phaser.Input.InputPlugin;
  public add!: Phaser.GameObjects.GameObjectFactory;
  public scene!: Phaser.Scenes.ScenePlugin;
  public time!: Phaser.Time.Clock;

  private player!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private wildMonsters!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('OverworldScene');
  }

  create() {
    const worldWidth = 3200;
    const worldHeight = 3200;

    const graphics = this.add.graphics();
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRect(0, 0, worldWidth, worldHeight);

    graphics.fillStyle(0x14532d, 0.4);
    for (let i = 0; i < 20; i++) {
      const rx = Phaser.Math.Between(0, worldWidth - 400);
      const ry = Phaser.Math.Between(0, worldHeight - 400);
      graphics.fillRect(rx, ry, 400, 400);
    }

    graphics.lineStyle(1, 0x334155, 0.2);
    for (let i = 0; i <= worldWidth; i += 64) graphics.lineBetween(i, 0, i, worldHeight);
    for (let j = 0; j <= worldHeight; j += 64) graphics.lineBetween(0, j, worldWidth, j);

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.obstacles = this.physics.add.staticGroup();
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(100, worldWidth - 100);
      const y = Phaser.Math.Between(100, worldHeight - 100);
      const rock = this.add.rectangle(x, y, 64, 64, 0x475569);
      this.obstacles.add(rock);
      this.add.text(x - 12, y - 20, '🪨', { fontSize: '24px' });
    }

    this.wildMonsters = this.physics.add.group();

    const state = gameStateManager.getState();
    this.player = this.add.container(state.worldPosition.x, state.worldPosition.y);
    const playerRect = this.add.rectangle(0, 0, 40, 40, 0x6366f1).setStrokeStyle(2, 0xffffff);
    const playerEmoji = this.add.text(-12, -18, '👤', { fontSize: '24px' });
    this.player.add([playerRect, playerEmoji]);
    
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setCircle(20, -20, -20);

    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.overlap(this.player, this.wildMonsters, (p, m) => {
      this.handleMonsterEncounter(m as Phaser.GameObjects.GameObject);
    });

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      });
    }

    this.time.addEvent({
      delay: 3000,
      callback: this.spawnWildMonster,
      callbackScope: this,
      loop: true
    });
  }

  update(time: number, delta: number) {
    const speed = 350;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    
    body.setVelocity(0);

    const left = this.cursors?.left?.isDown || this.wasd?.A?.isDown;
    const right = this.cursors?.right?.isDown || this.wasd?.D?.isDown;
    const up = this.cursors?.up?.isDown || this.wasd?.W?.isDown;
    const down = this.cursors?.down?.isDown || this.wasd?.S?.isDown;

    if (left) body.setVelocityX(-speed);
    else if (right) body.setVelocityX(speed);

    if (up) body.setVelocityY(-speed);
    else if (down) body.setVelocityY(speed);

    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      gameStateManager.updateState({ 
        worldPosition: { x: this.player.x, y: this.player.y } 
      });
    }

    // Tick game time (1 unit = roughly 1 second in game time scale)
    gameStateManager.updateTime(delta * 0.01);

    this.wildMonsters.children.entries.forEach((monster: any) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, monster.x, monster.y);
      if (dist > 1000) monster.destroy();
    });
  }

  spawnWildMonster() {
    if (this.wildMonsters.getLength() > 15) return;

    const angle = Math.random() * Math.PI * 2;
    const dist = Phaser.Math.Between(500, 800);
    const spawnX = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 100, 3100);
    const spawnY = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 100, 3100);

    const zone = WORLD_ZONES['starter_fields'];
    const state = gameStateManager.getState();
    
    // Filter species by conditions
    const validPool = zone.spawnPool.filter(id => {
      const species = MONSTER_DATA[id];
      return validateSpawn(species, state);
    });

    if (validPool.length === 0) return;

    const speciesId = Phaser.Utils.Array.GetRandom(validPool);
    const species = MONSTER_DATA[speciesId];
    const level = Phaser.Math.Between(zone.levelRange[0], zone.levelRange[1]);

    const monster = this.add.container(spawnX, spawnY);
    
    // Aura visual for specials
    if (species.isSpecial) {
      const aura = this.add.circle(0, 0, 30, species.auraColor || 0xffffff, 0.3);
      this.tweens.add({
        targets: aura,
        scale: 1.5,
        alpha: 0,
        duration: 1000,
        loop: -1
      });
      monster.add(aura);
    }

    const color = species.isSpecial ? 0xfacc15 : 0xef4444;
    const bg = this.add.rectangle(0, 0, 40, 40, color, 0.3).setStrokeStyle(2, color);
    const icon = this.add.text(-12, -18, species.icon, { fontSize: '24px' });
    const lvlText = this.add.text(-15, 22, `Lv.${level}`, { 
        fontSize: '10px', 
        fontStyle: 'bold', 
        color: species.isSpecial ? '#facc15' : '#ffffff' 
    });
    
    monster.add([bg, icon, lvlText]);
    monster.setData('payload', { speciesId, level });

    this.wildMonsters.add(monster);
    const body = monster.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!monster.active) return;
        this.physics.moveToObject(monster, this.player, 50);
      },
      loop: true
    });
  }

  handleMonsterEncounter(monster: Phaser.GameObjects.GameObject) {
    const payload = monster.getData('payload');
    monster.destroy();
    this.startBattle(payload.speciesId, payload.level);
  }

  startBattle(enemyId: string, enemyLevel: number) {
    gameEvents.emitEvent({ 
      type: 'BATTLE_START', 
      enemySpeciesId: enemyId 
    });
    
    this.scene.pause();
    this.scene.launch('BattleScene', { enemyId, enemyLevel });
  }
}
