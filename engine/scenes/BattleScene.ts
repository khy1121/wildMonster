
import Phaser from 'phaser';
import { gameEvents } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { MONSTER_DATA } from '../../data/monsters';
import { SKILL_DATA, SKILL_TREES } from '../../data/skills';
import { SUPPORT_SKILLS } from '../../data/tamer';
import { CombatEntity, calculateDamage, updateCooldowns } from '../../domain/combat';

export interface BattleInitData {
  enemyId: string;
  enemyLevel: number;
}

export class BattleScene extends Phaser.Scene {
  public add!: Phaser.GameObjects.GameObjectFactory;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public scene!: Phaser.Scenes.ScenePlugin;
  public time!: Phaser.Time.Clock;
  public tweens!: Phaser.Tweens.TweenManager;

  private playerEntity!: CombatEntity;
  private enemyEntity!: CombatEntity;
  
  private playerHpBar!: Phaser.GameObjects.Rectangle;
  private enemyHpBar!: Phaser.GameObjects.Rectangle;
  private enemyVisual!: Phaser.GameObjects.Container;
  private skillButtons: Phaser.GameObjects.Container[] = [];
  private tamerButtons: Phaser.GameObjects.Container[] = [];
  private captureButton!: Phaser.GameObjects.Container;
  private battleEnded = false;

  private tamerCooldowns: Record<string, number> = {};

  constructor() {
    super('BattleScene');
  }

  create(data: BattleInitData) {
    const { enemyId = 'droplet', enemyLevel = 5 } = data;
    const { width, height } = this.cameras.main;
    this.battleEnded = false;
    this.tamerCooldowns = {};
    
    // Crucial: Clear button arrays on every scene start to prevent stale references
    this.skillButtons = [];
    this.tamerButtons = [];

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.95);
    this.add.circle(width / 2, height / 2, 250, 0x1e293b, 0.5).setStrokeStyle(2, 0x6366f1, 0.3);

    const state = gameStateManager.getState();
    const activeMonster = state.tamer.party[0];
    
    // Defensive check for missing monster
    if (!activeMonster) {
        console.error("No active monster in party for battle");
        this.scene.stop();
        this.scene.resume('OverworldScene');
        return;
    }

    const playerSpecies = MONSTER_DATA[activeMonster.speciesId];
    const enemySpecies = MONSTER_DATA[enemyId];

    const activeSkills = [...(playerSpecies.learnableSkills || [])];
    const tree = SKILL_TREES[activeMonster.speciesId];
    if (tree) {
      activeMonster.unlockedNodes.forEach(nodeId => {
        const node = tree.nodes.find(n => n.id === nodeId);
        if (node && node.effect.type === 'skill') {
          activeSkills.push(node.effect.value as string);
        }
      });
    }

    this.playerEntity = {
      uid: activeMonster.uid,
      name: playerSpecies.name,
      level: activeMonster.level,
      hp: activeMonster.currentHp,
      maxHp: activeMonster.currentStats.maxHp,
      stats: activeMonster.currentStats,
      skills: activeSkills,
      cooldowns: {}
    };

    const enemyBaseStats = enemySpecies.baseStats;
    const enemyGrowth = 1 + (enemyLevel - 1) * 0.15;
    this.enemyEntity = {
      uid: 'wild-enemy',
      name: enemySpecies.name,
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
      skills: enemySpecies.learnableSkills || [],
      cooldowns: {}
    };

    const pContainer = this.add.container(width * 0.25, height * 0.4);
    pContainer.add(this.add.text(0, 0, playerSpecies.icon, { fontSize: '100px' }).setOrigin(0.5));
    this.playerHpBar = this.createHpBar(pContainer, 0, 80, this.playerEntity.name);

    this.enemyVisual = this.add.container(width * 0.75, height * 0.4);
    this.enemyVisual.add(this.add.text(0, 0, enemySpecies.icon, { fontSize: '100px' }).setOrigin(0.5));
    this.enemyHpBar = this.createHpBar(this.enemyVisual, 0, 80, `Wild ${this.enemyEntity.name}`);

    // Command Bars
    this.createMonsterSkillButtons(width / 2, height - 160);
    this.createTamerCommandBar(width / 2, height - 80);
    this.createCaptureButton(width / 2, height - 25);

    // AI Loop
    this.time.addEvent({
      delay: 2000,
      callback: this.enemyAIAction,
      callbackScope: this,
      loop: true
    });
  }

  update(time: number, delta: number) {
    if (this.battleEnded) return;
    
    // Ensure entities are initialized before processing
    if (!this.playerEntity || !this.enemyEntity) return;

    this.playerEntity = updateCooldowns(this.playerEntity, delta);
    this.enemyEntity = updateCooldowns(this.enemyEntity, delta);
    
    // Update Tamer Cooldowns
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

  createMonsterSkillButtons(centerX: number, y: number) {
    const skills = this.playerEntity.skills;
    const spacing = 140;
    const startX = centerX - ((skills.length - 1) * spacing) / 2;

    skills.forEach((sId, i) => {
      const skill = SKILL_DATA[sId];
      if (!skill) return;

      const btn = this.add.container(startX + i * spacing, y);
      const bg = this.add.rectangle(0, 0, 130, 50, 0x4338ca, 1).setInteractive({ useHandCursor: true });
      const label = this.add.text(0, -8, skill.name, { fontSize: '14px', fontStyle: 'bold' }).setOrigin(0.5);
      const cdText = this.add.text(0, 12, 'READY', { fontSize: '10px' }).setOrigin(0.5);
      
      btn.add([bg, label, cdText]);
      bg.on('pointerdown', () => this.useSkill(sId));
      this.skillButtons.push(btn);
    });
  }

  createTamerCommandBar(centerX: number, y: number) {
    const tamer = gameStateManager.getState().tamer;
    const skills = tamer.unlockedSupportSkills || [];
    const spacing = 120;
    const startX = centerX - ((skills.length - 1) * spacing) / 2;

    this.add.text(centerX, y - 45, 'TAMER COMMANDS', { fontSize: '12px', fontStyle: 'bold', color: '#6366f1' }).setOrigin(0.5);

    skills.forEach((sId, i) => {
      const skill = SUPPORT_SKILLS[sId];
      if (!skill) return;

      const btn = this.add.container(startX + i * spacing, y);
      const bg = this.add.rectangle(0, 0, 110, 40, 0x312e81, 1).setInteractive({ useHandCursor: true });
      const label = this.add.text(0, 0, `${skill.icon} ${skill.name}`, { fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5);
      
      btn.add([bg, label]);
      bg.on('pointerdown', () => this.useTamerSkill(sId));
      this.tamerButtons.push(btn);
    });
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

  createCaptureButton(centerX: number, y: number) {
    const state = gameStateManager.getState();
    const orb = state.tamer.inventory.find(i => i.itemId === 'capture_orb');
    const quantity = orb ? orb.quantity : 0;
    this.captureButton = this.add.container(centerX, y);
    const bg = this.add.rectangle(0, 0, 200, 30, 0x059669, 1).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, `🧿 CAPTURE (x${quantity})`, { fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5);
    this.captureButton.add([bg, text]);
    bg.on('pointerdown', () => this.useCaptureOrb());
    if (quantity <= 0) {
      bg.setFillStyle(0x374151);
      this.captureButton.alpha = 0.5;
      bg.disableInteractive();
    }
  }

  updateUI() {
    // Defensive check: Ensure bars exist before updating
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
    this.showVfx(this.cameras.main.width * 0.75, this.cameras.main.height * 0.4, `-${damage}`, 0xef4444);
    this.checkEndConditions();
  }

  useCaptureOrb() {
    if (this.battleEnded) return;
    const success = gameStateManager.attemptCapture(this.enemyEntity.name.toLowerCase().replace("wild ", ""), this.enemyEntity.level, this.enemyEntity.hp, this.enemyEntity.maxHp);
    this.battleEnded = true;
    this.tweens.add({
      targets: this.enemyVisual, scale: 0.1, alpha: 0, duration: 500, ease: 'Power2',
      onComplete: () => {
        const { width, height } = this.cameras.main;
        const msg = success ? 'CAPTURED!' : 'ESCAPED!';
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
    this.checkEndConditions();
  }

  showVfx(x: number, y: number, text: string, color: number) {
    const vfx = this.add.text(x, y - 50, text, { fontSize: '32px', color: '#' + color.toString(16), fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: vfx, y: y - 120, alpha: 0, duration: 800, onComplete: () => vfx.destroy() });
  }

  checkEndConditions() {
    if (this.enemyEntity.hp <= 0) this.endBattle('PLAYER');
    else if (this.playerEntity.hp <= 0) this.endBattle('ENEMY');
  }

  endBattle(winner: 'PLAYER' | 'ENEMY') {
    if (this.battleEnded) return;
    this.battleEnded = true;
    const { width, height } = this.cameras.main;
    const msg = winner === 'PLAYER' ? 'VICTORY!' : 'DEFEATED';
    const color = winner === 'PLAYER' ? '#22c55e' : '#ef4444';
    this.add.text(width / 2, height / 2, msg, { fontSize: '80px', color, fontStyle: 'bold' }).setOrigin(0.5);
    
    const state = gameStateManager.getState();
    if (state.tamer.party.length > 0 && this.playerEntity) {
        // Find the matching monster in the real state
        const idx = state.tamer.party.findIndex(m => m.uid === this.playerEntity.uid);
        if (idx !== -1) state.tamer.party[idx].currentHp = this.playerEntity.hp;
    }

    this.time.delayedCall(2000, () => {
      if (winner === 'PLAYER' && this.enemyEntity) {
        gameStateManager.grantRewards(this.enemyEntity.name.toLowerCase().replace("wild ", ""), this.enemyEntity.level);
      }
      gameEvents.emitEvent({ type: 'BATTLE_END', winner });
      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
