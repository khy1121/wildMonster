
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { WORLD_ZONES } from '../../data/zones';
import { MONSTER_DATA } from '../../data/monsters';
import { validateSpawn } from '../../domain/logic';
import { getTranslation } from '../../localization/strings';
import { ThreeOverlayRenderer } from '../ThreeOverlayRenderer';

export class OverworldScene extends Phaser.Scene {
  public physics!: Phaser.Physics.Arcade.ArcadePhysics;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public input!: Phaser.Input.InputPlugin;
  public add!: Phaser.GameObjects.GameObjectFactory;
  public scene!: Phaser.Scenes.ScenePlugin;
  public time!: Phaser.Time.Clock;
  public tweens!: Phaser.Tweens.TweenManager;

  private player!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private wildMonsters!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  private isBossActive: boolean = false;
  private bossInstance?: Phaser.GameObjects.Container;

  constructor() {
    super('OverworldScene');
  }

  create() {
    // Force cleanup any stray 3D overlays from previous scenes
    ThreeOverlayRenderer.forceCleanup('game-root');

    this.scale.on('resize', this.onResize, this);
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
      callback: this.spawnLoop,
      callbackScope: this,
      loop: true
    });

    gameEvents.onEvent('RETURN_TO_TITLE', () => {
      this.scene.stop();
      this.scene.start('MenuScene');
      gameEvents.emitEvent({ type: 'SCENE_CHANGED', sceneKey: 'MenuScene' });
    });
  }

  onResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.main.setSize(width, height);
    // ensure camera follow still valid
    if (this.cameras.main.followOffset) {
      // keep follow as-is, camera will adapt
    }
  }

  shutdown() {
    this.scale.off('resize', this.onResize, this);
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

    gameStateManager.updateTime(delta * 0.01);

    this.wildMonsters.children.entries.forEach((monster: any) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, monster.x, monster.y);
      if (dist > 1000) monster.destroy();
    });

    this.checkBossConditions();
  }

  spawnLoop() {
    if (this.isBossActive) return;
    this.spawnWildMonster();
  }

  checkBossConditions() {
    if (this.isBossActive) return;

    const state = gameStateManager.getState();
    const hour = state.gameTime / 100;
    const isNight = hour < 6 || hour > 18;

    // Condition for Thunderhoof Boss: Level 10+ AND it's "midnight" window AND not yet defeated as boss
    if (state.tamer.level >= 10 && (hour > 22 || hour < 2) && !state.flags['boss_thunderhoof_defeated']) {
      this.spawnBoss('thunderhoof');
    }
  }

  spawnBoss(speciesId: string) {
    this.isBossActive = true;

    // Clear normal mobs
    this.wildMonsters.clear(true, true);

    const angle = Math.random() * Math.PI * 2;
    const dist = 600;
    const spawnX = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 200, 3000);
    const spawnY = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 200, 3000);

    const species = MONSTER_DATA[speciesId];
    if (!species) {
      this.isBossActive = false;
      return;
    }
    const level = 15; // Boss level

    this.bossInstance = this.add.container(spawnX, spawnY);

    // Extra dramatic Boss Aura
    const aura1 = this.add.circle(0, 0, 50, species.auraColor || 0xffffff, 0.4);
    const aura2 = this.add.circle(0, 0, 80, species.auraColor || 0xffffff, 0.2);
    this.tweens.add({ targets: aura1, scale: 2, alpha: 0, duration: 1500, loop: -1 });
    this.tweens.add({ targets: aura2, scale: 1.5, alpha: 0, duration: 2000, loop: -1, delay: 500 });

    const bg = this.add.rectangle(0, 0, 60, 60, 0x000000, 0.6).setStrokeStyle(4, 0xfacc15);
    const icon = this.add.text(-20, -25, species.icon, { fontSize: '40px' });
    const lvlText = this.add.text(-25, 35, `BOSS Lv.${level}`, {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#facc15',
      backgroundColor: '#000000'
    });

    this.bossInstance.add([aura1, aura2, bg, icon, lvlText]);
    this.bossInstance.setData('payload', { speciesId, level, isBoss: true });
    this.bossInstance.setData('isBoss', true);

    this.wildMonsters.add(this.bossInstance);
    const body = this.bossInstance.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);

    // Show Boss Banner
    this.showBossBanner();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.bossInstance?.active) return;
        this.physics.moveToObject(this.bossInstance, this.player, 80);
      },
      loop: true
    });
  }

  showBossBanner() {
    const { width, height } = this.cameras.main;
    const state = gameStateManager.getState();
    const t = getTranslation(state.language);

    const bannerBg = this.add.rectangle(width / 2, 100, width, 60, 0x000000, 0.8).setScrollFactor(0).setDepth(1000);
    const bannerText = this.add.text(width / 2, 100, t.ui.boss_appeared, {
      fontSize: '28px',
      fontStyle: 'black italic',
      color: '#facc15'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    bannerBg.alpha = 0;
    bannerText.alpha = 0;

    this.tweens.add({
      targets: [bannerBg, bannerText],
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 3000,
      onComplete: () => {
        bannerBg.destroy();
        bannerText.destroy();
      }
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

    const validPool = zone.spawnPool.filter(id => {
      const species = MONSTER_DATA[id];
      return validateSpawn(species, state);
    });

    if (validPool.length === 0) return;

    const speciesId = Phaser.Utils.Array.GetRandom(validPool);
    const species = MONSTER_DATA[speciesId];
    if (!species) return; // Guard against undefined species

    const level = Phaser.Math.Between(zone.levelRange[0], zone.levelRange[1]);

    const monster = this.add.container(spawnX, spawnY);

    if (species.isSpecial) {
      const aura = this.add.circle(0, 0, 30, species.auraColor || 0xffffff, 0.3);
      this.tweens.add({ targets: aura, scale: 1.5, alpha: 0, duration: 1000, loop: -1 });
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
    const isBoss = monster.getData('isBoss');

    monster.destroy();

    if (isBoss) {
      this.isBossActive = false;
      this.bossInstance = undefined;
    }

    this.startBattle(payload.speciesId, payload.level, !!payload.isBoss);
  }

  startBattle(enemyId: string, enemyLevel: number, isBoss: boolean = false) {
    gameEvents.emitEvent({
      type: 'BATTLE_START',
      enemySpeciesId: enemyId
    });

    this.scene.pause();
    this.scene.launch('BattleScene', { enemyId, enemyLevel, isBoss });
  }
}
