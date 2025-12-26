
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { MONSTER_DATA } from '../../data/monsters';
import { SKILL_DATA, SKILL_TREES } from '../../data/skills';
import { SUPPORT_SKILLS } from '../../data/tamer';
import { CombatEntity, calculateDamage, updateCooldowns } from '../../domain/combat';
import { getAvailableSkillIds } from '../../domain/logic';
import { getTranslation } from '../../localization/strings';

export interface BattleInitData {
  enemyId: string;
  enemyLevel: number;
  isBoss?: boolean;
}

export class BattleScene extends Phaser.Scene {
  public add!: Phaser.GameObjects.GameObjectFactory;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public scene!: Phaser.Scenes.ScenePlugin;
  public time!: Phaser.Time.Clock;
  public tweens!: Phaser.Tweens.TweenManager;

  private playerEntity!: CombatEntity;
  private enemyEntity!: CombatEntity;
  private enemySpeciesId!: string;

  private playerHpBar!: Phaser.GameObjects.Rectangle;
  private enemyHpBar!: Phaser.GameObjects.Rectangle;
  private enemyVisual!: Phaser.GameObjects.Container;
  private skillButtons: Phaser.GameObjects.Container[] = [];
  private tamerButtons: Phaser.GameObjects.Container[] = [];
  private captureButton!: Phaser.GameObjects.Container;
  private battleEnded = false;
  private isBossBattle = false;

  private tamerCooldowns: Record<string, number> = {};
  private particleTextureCreated = false;

  constructor() {
    super('BattleScene');
  }

  create(data: BattleInitData) {
    const { enemyId = 'droplet', enemyLevel = 5, isBoss = false } = data;
    this.enemySpeciesId = enemyId;
    this.isBossBattle = isBoss;
    const { width, height } = this.cameras.main;
    this.battleEnded = false;
    this.tamerCooldowns = {};

    this.skillButtons = [];
    this.tamerButtons = [];

    const state = gameStateManager.getState();
    const t = getTranslation(state.language);

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.95);
    this.add.circle(width / 2, height / 2, 250, 0x1e293b, 0.5).setStrokeStyle(2, 0x6366f1, 0.3);

    const activeMonster = state.tamer.party[0];

    if (!activeMonster) {
      this.scene.stop();
      this.scene.resume('OverworldScene');
      return;
    }

    const playerSpecies = MONSTER_DATA[activeMonster.speciesId];
    const enemySpecies = MONSTER_DATA[enemyId];

    if (!enemySpecies) {
      this.scene.stop();
      this.scene.resume('OverworldScene');
      return;
    }

    const activeSkills = getAvailableSkillIds(activeMonster, playerSpecies);

    this.playerEntity = {
      uid: activeMonster.uid,
      name: t.species[activeMonster.speciesId as keyof typeof t.species] || playerSpecies.name,
      level: activeMonster.level,
      hp: activeMonster.currentHp,
      maxHp: activeMonster.currentStats.maxHp,
      stats: activeMonster.currentStats,
      skills: activeSkills,
      cooldowns: {}
    };

    const enemyBaseStats = enemySpecies.baseStats;
    const bossMult = isBoss ? 2.0 : 1.0;
    const enemyGrowth = (1 + (enemyLevel - 1) * 0.15) * bossMult;

    this.enemyEntity = {
      uid: 'wild-enemy',
      name: t.species[enemyId as keyof typeof t.species] || enemySpecies.name,
      level: enemyLevel,
      hp: Math.floor(enemyBaseStats.hp * enemyGrowth),
      maxHp: Math.floor(enemyBaseStats.maxHp * enemyGrowth),
      stats: {
        hp: Math.floor(enemyBaseStats.hp * enemyGrowth),
        maxHp: Math.floor(enemyBaseStats.maxHp * enemyGrowth),
        attack: Math.floor(enemyBaseStats.attack * enemyGrowth),
        defense: Math.floor(enemyBaseStats.defense * enemyGrowth),
        speed: Math.floor(enemyBaseStats.speed * enemyGrowth),
      },
      skills: getAvailableSkillIds({ level: enemyLevel, unlockedNodes: [] }, enemySpecies),
      cooldowns: {}
    };

    const pContainer = this.add.container(width * 0.25, height * 0.4);
    pContainer.add(this.add.text(0, 0, playerSpecies.icon, { fontSize: '100px' }).setOrigin(0.5));
    this.playerHpBar = this.createHpBar(pContainer, 0, 80, this.playerEntity.name);

    this.enemyVisual = this.add.container(width * 0.75, height * 0.4);
    this.enemyVisual.add(this.add.text(0, 0, enemySpecies.icon, { fontSize: '100px' }).setOrigin(0.5));

    if (isBoss) {
      const bossAura = this.add.circle(0, 0, 60, 0xfacc15, 0.3);
      this.enemyVisual.addAt(bossAura, 0);
      this.tweens.add({ targets: bossAura, scale: 1.5, alpha: 0, duration: 800, loop: -1 });
    }

    this.enemyHpBar = this.createHpBar(this.enemyVisual, 0, 80, isBoss ? `BOSS ${this.enemyEntity.name}` : `Wild ${this.enemyEntity.name}`);
    this.createMonsterSkillButtons(width / 2, height - 160, t);
    this.createTamerCommandBar(width / 2, height - 80, t);
    this.createCaptureButton(width / 2, height - 25, t);

    // handle resize events so UI reflows
    this.scale.on('resize', this.onResize, this);

    this.time.addEvent({
      delay: isBoss ? 1500 : 2000,
      callback: this.enemyAIAction,
      callbackScope: this,
      loop: true
    });

    // Create particle texture for VFX (do once)
    this.createParticleTexture();
  }

  update(time: number, delta: number) {
    if (this.battleEnded) return;
    if (!this.playerEntity || !this.enemyEntity) return;

    this.playerEntity = updateCooldowns(this.playerEntity, delta);
    this.enemyEntity = updateCooldowns(this.enemyEntity, delta);

    for (const key in this.tamerCooldowns) {
      this.tamerCooldowns[key] = Math.max(0, this.tamerCooldowns[key] - delta);
    }

    this.updateUI();
  }

  createHpBar(container: Phaser.GameObjects.Container, x: number, y: number, name: string) {
    container.add(this.add.text(x, y - 25, name, { fontSize: '18px', fontStyle: 'bold' }).setOrigin(0.5));
    const bg = this.add.rectangle(x, y, 160, 12, 0x334155).setOrigin(0.5);
    const bar = this.add.rectangle(x - 80, y, 160, 12, 0x22c55e).setOrigin(0, 0.5);
    container.add([bg, bar]);
    return bar;
  }

  createMonsterSkillButtons(centerX: number, y: number, t: any) {
    const skills = this.playerEntity.skills;
    const spacing = 140;
    const startX = centerX - ((skills.length - 1) * spacing) / 2;
    // clear any previous buttons
    this.skillButtons.forEach(b => b.destroy());
    this.skillButtons = [];

    skills.forEach((sId, i) => {
      const skill = SKILL_DATA[sId];
      if (!skill) return;

      const btn = this.add.container(startX + i * spacing, y);
      const bg = this.add.rectangle(0, 0, 130, 50, 0x4338ca, 1).setInteractive({ useHandCursor: true });
      const label = this.add.text(0, -8, t.skills[sId] || skill.name, { fontSize: '14px', fontStyle: 'bold' }).setOrigin(0.5);
      const cdText = this.add.text(0, 12, 'READY', { fontSize: '10px' }).setOrigin(0.5);

      btn.add([bg, label, cdText]);
      bg.on('pointerdown', () => this.useSkill(sId));
      this.skillButtons.push(btn);
    });
  }

  createTamerCommandBar(centerX: number, y: number, t: any) {
    const state = gameStateManager.getState();
    const skills = state.tamer.unlockedSupportSkills || [];
    const spacing = 120;
    const startX = centerX - ((skills.length - 1) * spacing) / 2;

    this.add.text(centerX, y - 45, t.ui.tamer_commands.toUpperCase(), { fontSize: '12px', fontStyle: 'bold', color: '#6366f1' }).setOrigin(0.5);

    skills.forEach((sId, i) => {
      const skill = SUPPORT_SKILLS[sId];
      if (!skill) return;

      const btn = this.add.container(startX + i * spacing, y);
      const bg = this.add.rectangle(0, 0, 110, 40, 0x312e81, 1).setInteractive({ useHandCursor: true });
      const label = this.add.text(0, 0, `${skill.icon} ${t.skills[sId] || skill.name}`, { fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5);

      btn.add([bg, label]);
      bg.on('pointerdown', () => this.useTamerSkill(sId));
      this.tamerButtons.push(btn);
    });
  }

  onResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.main.setSize(width, height);
    // Recreate skill buttons and reposition UI
    const t = getTranslation(gameStateManager.getState().language);
    this.createMonsterSkillButtons(width / 2, height - 160, t);
    this.createTamerCommandBar(width / 2, height - 80, t);
    this.createCaptureButton(width / 2, height - 25, t);
    // reposition player/enemy visuals
    // player visual positions are anchored relative to camera center in create
  }

  shutdown() {
    this.scale.off('resize', this.onResize, this);
  }

  useTamerSkill(skillId: string) {
    if (this.battleEnded || (this.tamerCooldowns[skillId] || 0) > 0) return;
    const skill = SUPPORT_SKILLS[skillId];
    if (!skill) return;

    this.tamerCooldowns[skillId] = skill.cooldown;

    if (skill.effect === 'HEAL') {
      const healAmt = skill.power;
      this.playerEntity.hp = Math.min(this.playerEntity.maxHp, this.playerEntity.hp + healAmt);
      this.showVfx(this.cameras.main.width * 0.25, this.cameras.main.height * 0.4, `+${healAmt}`, 0x22c55e);
    } else if (skill.effect === 'BUFF_ATK') {
      this.playerEntity.stats.attack += skill.power;
      this.showVfx(this.cameras.main.width * 0.25, this.cameras.main.height * 0.4, `ATK UP!`, 0xf59e0b);
      this.time.delayedCall(10000, () => {
        if (this.playerEntity) this.playerEntity.stats.attack -= skill.power;
      });
    } else if (skill.effect === 'CLEANSE') {
      this.playerEntity.cooldowns = {};
      this.showVfx(this.cameras.main.width * 0.25, this.cameras.main.height * 0.4, `READY!`, 0x6366f1);
    }
  }

  createCaptureButton(centerX: number, y: number, t: any) {
    const state = gameStateManager.getState();
    const orb = state.tamer.inventory.find(i => i.itemId === 'capture_orb');
    const quantity = orb ? orb.quantity : 0;
    this.captureButton = this.add.container(centerX, y);
    const bg = this.add.rectangle(0, 0, 200, 30, 0x059669, 1).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, `🧿 ${t.ui.capture} (x${quantity})`, { fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5);
    this.captureButton.add([bg, text]);
    bg.on('pointerdown', () => this.useCaptureOrb());

    if (quantity <= 0 || this.isBossBattle) {
      bg.setFillStyle(0x374151);
      this.captureButton.alpha = 0.5;
      bg.disableInteractive();
    }
  }

  updateUI() {
    if (!this.playerHpBar || !this.enemyHpBar || !this.playerEntity || !this.enemyEntity) return;

    const pPct = Math.max(0, Math.min(1, this.playerEntity.hp / this.playerEntity.maxHp)) || 0;
    const ePct = Math.max(0, Math.min(1, this.enemyEntity.hp / this.enemyEntity.maxHp)) || 0;

    this.playerHpBar.width = 160 * pPct;
    this.enemyHpBar.width = 160 * ePct;
    this.playerHpBar.setFillStyle(pPct > 0.5 ? 0x22c55e : pPct > 0.2 ? 0xeab308 : 0xef4444);
    this.enemyHpBar.setFillStyle(ePct > 0.5 ? 0x22c55e : ePct > 0.2 ? 0xeab308 : 0xef4444);

    this.playerEntity.skills.forEach((sId, i) => {
      const btn = this.skillButtons[i];
      if (!btn) return;
      const cd = this.playerEntity.cooldowns[sId] || 0;
      const bg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
      const cdText = btn.getAt(2) as Phaser.GameObjects.Text;

      if (bg && bg.setFillStyle) {
        if (cd > 0) {
          bg.setFillStyle(0x312e81);
          cdText.setText(`${(cd / 1000).toFixed(1)}s`);
        } else {
          bg.setFillStyle(0x4338ca);
          cdText.setText('READY');
        }
      }
    });

    const tamerSkills = gameStateManager.getState().tamer.unlockedSupportSkills || [];
    tamerSkills.forEach((sId, i) => {
      const btn = this.tamerButtons[i];
      if (!btn) return;
      const cd = this.tamerCooldowns[sId] || 0;
      const bg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
      if (bg) {
        if (cd > 0) bg.alpha = 0.4;
        else bg.alpha = 1;
      }
    });
  }

  useSkill(skillId: string) {
    if (this.battleEnded || (this.playerEntity.cooldowns[skillId] || 0) > 0) return;
    const damage = calculateDamage(this.playerEntity, this.enemyEntity, skillId);
    this.enemyEntity.hp = Math.max(0, this.enemyEntity.hp - damage);
    this.playerEntity.cooldowns[skillId] = SKILL_DATA[skillId].cooldown;

    const attackerX = this.cameras.main.width * 0.25;
    const attackerY = this.cameras.main.height * 0.4;
    const targetX = this.cameras.main.width * 0.75;
    const targetY = this.cameras.main.height * 0.4;

    // Trigger element-specific VFX
    switch (skillId) {
      case 'fire_blast':
        this.playFireBlastVfx(attackerX, attackerY);
        this.playHitFlash(targetX, targetY);
        this.cameras.main.shake(200, 0.004);
        break;
      case 'ember':
        this.playEmberVfx(attackerX, attackerY);
        this.playHitFlash(targetX, targetY);
        this.cameras.main.shake(100, 0.002);
        break;
      case 'bubble':
        this.playBubbleVfx(attackerX, attackerY);
        break;
      case 'scratch':
        this.playScratchVfx(targetX, targetY);
        this.cameras.main.shake(80, 0.0025);
        break;
      case 'tackle':
        this.playTackleVfx(targetX, targetY);
        this.cameras.main.shake(150, 0.003);
        break;
      case 'dark_pulse':
        this.playDarkPulseVfx(attackerX, attackerY);
        this.cameras.main.shake(120, 0.0025);
        break;
      case 'ice_shard':
        this.playIceShardVfx(attackerX, attackerY);
        this.playHitFlash(targetX, targetY);
        this.cameras.main.shake(100, 0.002);
        break;
    }

    this.showVfx(targetX, targetY, `-${damage}`, 0xef4444);

    // Delay end condition check to allow HP UI to update first
    this.time.delayedCall(50, () => {
      this.checkEndConditions();
    });
  }

  useCaptureOrb() {
    if (this.battleEnded || this.isBossBattle) return;
    const success = gameStateManager.attemptCapture(this.enemySpeciesId, this.enemyEntity.level, this.enemyEntity.hp, this.enemyEntity.maxHp);
    this.battleEnded = true;

    const state = gameStateManager.getState();
    const t = getTranslation(state.language);

    this.tweens.add({
      targets: this.enemyVisual, scale: 0.1, alpha: 0, duration: 500, ease: 'Power2',
      onComplete: () => {
        const { width, height } = this.cameras.main;
        const msg = success ? t.ui.captured : t.ui.escaped;
        const color = success ? '#10b981' : '#f59e0b';
        this.add.text(width / 2, height / 2, msg, { fontSize: '64px', color, fontStyle: 'bold' }).setOrigin(0.5);
        this.time.delayedCall(1500, () => {
          gameEvents.emitEvent({ type: 'BATTLE_END', winner: success ? 'CAPTURED' : 'ENEMY' });
          this.scene.stop();
          this.scene.resume('OverworldScene');
        });
      }
    });
  }

  enemyAIAction() {
    if (this.battleEnded || !this.enemyEntity || !this.playerEntity) return;
    const skillId = Phaser.Utils.Array.GetRandom(this.enemyEntity.skills);
    if (!skillId) return;

    const damage = calculateDamage(this.enemyEntity, this.playerEntity, skillId);
    this.playerEntity.hp = Math.max(0, this.playerEntity.hp - damage);
    this.showVfx(this.cameras.main.width * 0.25, this.cameras.main.height * 0.4, `-${damage}`, 0xef4444);

    // Delay end condition check to allow HP UI to update first
    this.time.delayedCall(50, () => {
      this.checkEndConditions();
    });
  }

  showVfx(x: number, y: number, text: string, color: number) {
    const vfx = this.add.text(x, y - 50, text, { fontSize: '32px', color: '#' + color.toString(16), fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: vfx, y: y - 120, alpha: 0, duration: 800, onComplete: () => vfx.destroy() });
  }

  /**
   * Create procedural particle textures for all element effects
   */
  private createParticleTexture() {
    if (this.particleTextureCreated) return;

    const size = 8;

    // Fire particle (yellow-orange-red)
    if (!this.textures.exists('fireParticle')) {
      const canvas = this.textures.createCanvas('fireParticle', size, size);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 120, 50, 0.9)');
        gradient.addColorStop(0.7, 'rgba(255, 50, 20, 0.6)');
        gradient.addColorStop(1, 'rgba(100, 20, 10, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();
      }
    }

    // Water particle (blue-cyan)
    if (!this.textures.exists('waterParticle')) {
      const canvas = this.textures.createCanvas('waterParticle', size, size);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(50, 150, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(20, 100, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();
      }
    }

    // Dark particle (purple-black)
    if (!this.textures.exists('darkParticle')) {
      const canvas = this.textures.createCanvas('darkParticle', size, size);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(150, 100, 200, 1)');
        gradient.addColorStop(0.5, 'rgba(100, 50, 150, 0.8)');
        gradient.addColorStop(1, 'rgba(50, 20, 80, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();
      }
    }

    // Ice particle (cyan-white)
    if (!this.textures.exists('iceParticle')) {
      const canvas = this.textures.createCanvas('iceParticle', size, size);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(200, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(150, 220, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 180, 220, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();
      }
    }

    // Impact particle (white-gray for physical attacks)
    if (!this.textures.exists('impactParticle')) {
      const canvas = this.textures.createCanvas('impactParticle', size, size);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.7)');
        gradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();
      }
    }

    // Glow particle (soft white edge)
    if (!this.textures.exists('glowParticle')) {
      const canvas = this.textures.createCanvas('glowParticle', 16, 16);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        canvas.refresh();
      }
    }

    // Smoke particle (gray-translucent)
    if (!this.textures.exists('smokeParticle')) {
      const canvas = this.textures.createCanvas('smokeParticle', 16, 16);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(100, 100, 100, 0.6)');
        gradient.addColorStop(1, 'rgba(50, 50, 50, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        canvas.refresh();
      }
    }

    // Spark particle (long thin white line)
    if (!this.textures.exists('sparkParticle')) {
      const canvas = this.textures.createCanvas('sparkParticle', 4, 12);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, 12);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 4, 12);
        canvas.refresh();
      }
    }

    this.particleTextureCreated = true;
  }

  /**
   * Play fire blast particle VFX at origin position - ACTION RPG STYLE
   */
  private playFireBlastVfx(x: number, y: number) {
    if (!this.textures.exists('fireParticle')) return;

    // Layer 1: Core Explosion (Bright White/Yellow)
    const core = this.add.particles(x, y, 'glowParticle', {
      scale: { start: 0.5, end: 2.5 },
      alpha: { start: 1, end: 0 },
      tint: 0xffffff,
      lifespan: 300,
      quantity: 1,
      emitting: false
    });

    // Layer 2: Main Fire Burst (Orange/Red)
    const burst = this.add.particles(x, y, 'fireParticle', {
      speed: { min: 150, max: 350 },
      angle: { min: 0, max: 360 },
      scale: { start: 2.0, end: 0.5 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 40,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });

    // Layer 3: Smoke (Dark Gray)
    const smoke = this.add.particles(x, y, 'smokeParticle', {
      speed: { min: 20, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 3 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 800,
      quantity: 15,
      emitting: false
    });

    // Layer 4: Distant Sparks
    const sparks = this.add.particles(x, y, 'sparkParticle', {
      speed: { min: 200, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 20,
      rotate: { min: 0, max: 360 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });

    core.explode();
    burst.explode();
    smoke.explode();
    sparks.explode();

    // Shockwave ring
    const ring = this.add.circle(x, y, 10, 0xffaa00, 0.4);
    this.tweens.add({
      targets: ring,
      scale: 15,
      alpha: 0,
      duration: 500,
      ease: 'Expo.out',
      onComplete: () => ring.destroy()
    });

    this.cameras.main.flash(150, 255, 100, 0, true);

    this.time.delayedCall(800, () => {
      core.destroy();
      burst.destroy();
      smoke.destroy();
      sparks.destroy();
    });
  }

  /**
   * Play white flash effect on hit
   */
  private playHitFlash(x: number, y: number) {
    // Sharp white bloom
    const flash = this.add.circle(x, y, 10, 0xffffff, 1);
    this.tweens.add({
      targets: flash,
      scale: 12,
      alpha: 0,
      duration: 150,
      ease: 'Expo.out',
      onComplete: () => flash.destroy()
    });

    // Radial sparks on hit
    if (this.textures.exists('sparkParticle')) {
      const sparks = this.add.particles(x, y, 'sparkParticle', {
        speed: { min: 300, max: 600 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 300,
        quantity: 15,
        rotate: { min: 0, max: 360 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false
      });
      sparks.explode();
      this.time.delayedCall(400, () => sparks.destroy());
    }
  }

  /** Ember: Small fire sparks - ENHANCED */
  private playEmberVfx(x: number, y: number) {
    if (!this.textures.exists('fireParticle')) return;

    // Small popping sparks
    const particles = this.add.particles(x, y, 'fireParticle', {
      speed: { min: 40, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 300, max: 600 },
      gravityY: -40,
      quantity: 20,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });

    // Heat glow
    const glow = this.add.particles(x, y, 'glowParticle', {
      scale: { start: 1, end: 2 },
      alpha: { start: 0.5, end: 0 },
      tint: 0xffaa00,
      lifespan: 400,
      quantity: 2,
      emitting: false
    });

    particles.explode();
    glow.explode();

    this.time.delayedCall(600, () => {
      particles.destroy();
      glow.destroy();
    });
  }

  /** Bubble: Water bubbles - ENHANCED */
  private playBubbleVfx(x: number, y: number) {
    if (!this.textures.exists('waterParticle')) return;

    // Layer 1: Bubbles rising (various sizes)
    const bubbles = this.add.particles(x, y, 'waterParticle', {
      speed: { min: 50, max: 150 },
      angle: { min: 240, max: 300 },
      scale: { start: 1, end: 2 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      gravityY: -100,
      quantity: 30,
      emitting: false
    });

    // Layer 2: Splash (lateral)
    const splash = this.add.particles(x, y, 'waterParticle', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 20,
      emitting: false
    });

    // Layer 3: Ring pulse (Blue)
    const ring = this.add.circle(x, y, 10, 0x60a5fa, 0.5);
    this.tweens.add({
      targets: ring,
      scale: 10,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.out',
      onComplete: () => ring.destroy()
    });

    bubbles.explode();
    splash.explode();

    this.time.delayedCall(1000, () => {
      bubbles.destroy();
      splash.destroy();
    });
  }

  /** Scratch: Quick slash - ENHANCED */
  private playScratchVfx(x: number, y: number) {
    if (!this.textures.exists('impactParticle')) return;

    // Layer 1: Triple slashes
    for (let i = -1; i <= 1; i++) {
      const offset = i * 20;
      const slash = this.add.rectangle(x + offset, y, 4, 120, 0xffffff, 1);
      slash.setRotation(0.5);
      this.tweens.add({
        targets: slash,
        scaleY: 0,
        alpha: 0,
        duration: 200,
        delay: Math.abs(i) * 50,
        ease: 'Power2',
        onComplete: () => slash.destroy()
      });
    }

    // Layer 2: White streaks
    const streaks = this.add.particles(x, y, 'impactParticle', {
      speed: { min: 200, max: 400 },
      angle: { min: -45, max: 45 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 15,
      emitting: false
    });

    streaks.explode();
    this.time.delayedCall(400, () => streaks.destroy());
  }

  /** Tackle: Impact shockwave - ENHANCED */
  private playTackleVfx(x: number, y: number) {
    if (!this.textures.exists('impactParticle')) return;

    // Intense impact shockwave
    const burst = this.add.particles(x, y, 'impactParticle', {
      speed: { min: 200, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 40,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });

    // Dust/Shock smoke
    const smoke = this.add.particles(x, y, 'smokeParticle', {
      speed: { min: 30, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 4 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 700,
      quantity: 20,
      emitting: false
    });

    burst.explode();
    smoke.explode();

    this.cameras.main.flash(100, 255, 255, 255, true);

    this.time.delayedCall(800, () => {
      burst.destroy();
      smoke.destroy();
    });
  }

  /** Dark Pulse: Shadow wave - ENHANCED */
  private playDarkPulseVfx(x: number, y: number) {
    if (!this.textures.exists('darkParticle')) return;

    // Layer 1: Concentric rings (Dark purple)
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 100, () => {
        const ring = this.add.circle(x, y, 20, 0x4c1d95, 0.6);
        this.tweens.add({
          targets: ring,
          scale: 15,
          alpha: 0,
          duration: 600,
          ease: 'Sine.Out',
          onComplete: () => ring.destroy()
        });
      });
    }

    // Layer 2: Swirling dark particles
    const swirl = this.add.particles(x, y, 'darkParticle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      alpha: { start: 1, end: 0 },
      rotate: { min: 0, max: 360 },
      lifespan: 800,
      quantity: 40,
      emitting: false
    });

    // Layer 3: Central void (Black/Purple glow)
    const voidGlow = this.add.particles(x, y, 'glowParticle', {
      scale: { start: 0.5, end: 3.0 },
      alpha: { start: 1, end: 0 },
      tint: 0x2e1065,
      lifespan: 500,
      quantity: 2,
      emitting: false
    });

    swirl.explode();
    voidGlow.explode();

    this.cameras.main.flash(200, 50, 0, 100, true);

    this.time.delayedCall(1000, () => {
      swirl.destroy();
      voidGlow.destroy();
    });
  }

  /** Ice Shard: Frozen crystals - ENHANCED */
  private playIceShardVfx(x: number, y: number) {
    if (!this.textures.exists('iceParticle')) return;

    // Layer 1: Crystalline shards (Cyan/White)
    const shards = this.add.particles(x, y, 'iceParticle', {
      speed: { min: 150, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 30,
      rotate: { min: 0, max: 360 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });

    // Layer 2: Frozen Mist
    const mist = this.add.particles(x, y, 'glowParticle', {
      speed: { min: 20, max: 60 },
      scale: { start: 1, end: 4 },
      alpha: { start: 0.4, end: 0 },
      tint: 0xdcfce7,
      lifespan: 1000,
      quantity: 15,
      emitting: false
    });

    // Layer 3: Frost expansion (Ring)
    const ring = this.add.circle(x, y, 5, 0xffffff, 0.3);
    this.tweens.add({
      targets: ring,
      scale: 12,
      alpha: 0,
      duration: 500,
      ease: 'Expo.Out',
      onComplete: () => ring.destroy()
    });

    shards.explode();
    mist.explode();

    this.cameras.main.flash(100, 200, 240, 255, true);

    this.time.delayedCall(1200, () => {
      shards.destroy();
      mist.destroy();
    });
  }

  checkEndConditions() {
    if (this.enemyEntity.hp <= 0) this.endBattle('PLAYER');
    else if (this.playerEntity.hp <= 0) this.endBattle('ENEMY');
  }

  endBattle(winner: 'PLAYER' | 'ENEMY') {
    if (this.battleEnded) return;
    this.battleEnded = true;
    const { width, height } = this.cameras.main;

    const state = gameStateManager.getState();
    const t = getTranslation(state.language);

    const msg = winner === 'PLAYER' ? t.ui.victory : t.ui.defeated;
    const color = winner === 'PLAYER' ? '#22c55e' : '#ef4444';
    this.add.text(width / 2, height / 2, msg, { fontSize: '80px', color, fontStyle: 'bold' }).setOrigin(0.5);

    if (state.tamer.party.length > 0 && this.playerEntity) {
      const idx = state.tamer.party.findIndex(m => m.uid === this.playerEntity.uid);
      if (idx !== -1) state.tamer.party[idx].currentHp = this.playerEntity.hp;
    }

    this.time.delayedCall(2000, () => {
      if (winner === 'PLAYER' && this.enemyEntity) {
        gameStateManager.grantRewards(this.enemySpeciesId, this.enemyEntity.level, this.isBossBattle);
      }
      gameEvents.emitEvent({ type: 'BATTLE_END', winner });

      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
