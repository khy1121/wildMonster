# Damage Formula Specification
**Project**: WildMonster  
**Author**: Lead Gameplay Engineer  
**Date**: 2025-12-30  
**Version**: 1.0

---

## Overview

This document defines the **standardized damage calculation formula** for WildMonster's combat system. The formula balances competitive gameplay while maintaining clarity and extensibility.

---

## Core Damage Formula

### Base Formula

```
FinalDamage = floor(
  (AttackStat × SkillPower / DefenseStat) 
  × TypeEffectiveness 
  × WeatherModifier 
  × TerrainModifier
  × CriticalMultiplier 
  × STABBonus 
  × RandomFactor
)
```

### Variable Definitions

| Variable | Type | Range | Description |
|----------|------|-------|-------------|
| `AttackStat` | number | 1-999 | Attacker's Attack (physical) or Special Attack (special) |
| `SkillPower` | number | 1-999 | Base power of the skill being used |
| `DefenseStat` | number | 1-999 | Defender's Defense (physical) or Skill Resistance (special) |
| `TypeEffectiveness` | number | 0.0-2.0 | Type matchup multiplier (see Type Chart) |
| `WeatherModifier` | number | 0.5-1.5 | Weather effect on skill type |
| `TerrainModifier` | number | 0.5-1.5 | Terrain effect on skill type |
| `CriticalMultiplier` | number | 1.0 or 1.5 | Critical hit bonus |
| `STABBonus` | number | 1.0 or 1.5 | Same-Type Attack Bonus |
| `RandomFactor` | number | 0.85-1.15 | Random variance (±15%) |

---

## Detailed Calculation Steps

### Step 1: Determine Attack and Defense Stats

```typescript
function getEffectiveStats(
  attacker: CombatEntity,
  defender: CombatEntity,
  skill: Skill
): { attackStat: number; defenseStat: number } {
  
  const isSpecial = skill.category === 'SPECIAL' || skill.category === 'ULTIMATE';
  
  // Base stats
  let attackStat = isSpecial 
    ? attacker.stats.specialAttack 
    : attacker.stats.attack;
    
  let defenseStat = isSpecial 
    ? defender.stats.skillResistance 
    : defender.stats.defense;
  
  // Apply buffs/debuffs
  attacker.buffs.forEach(buff => {
    if (buff.effect === 'BUFF_ATK' && !isSpecial) {
      attackStat += buff.power;
    }
    if (buff.effect === 'BUFF_SPATK' && isSpecial) {
      attackStat += buff.power;
    }
  });
  
  defender.buffs.forEach(buff => {
    if (buff.effect === 'BUFF_DEF' && !isSpecial) {
      defenseStat += buff.power;
    }
    if (buff.effect === 'DEBUFF_DEF' && !isSpecial) {
      defenseStat -= buff.power;
    }
    if (buff.effect === 'BUFF_SPDEF' && isSpecial) {
      defenseStat += buff.power;
    }
  });
  
  // Apply status effects
  if (attacker.status?.type === 'BURN' && !isSpecial) {
    attackStat = Math.floor(attackStat * 0.5); // Burn halves physical attack
  }
  
  // Minimum stat floor
  attackStat = Math.max(1, attackStat);
  defenseStat = Math.max(1, defenseStat);
  
  return { attackStat, defenseStat };
}
```

### Step 2: Calculate Raw Damage

```typescript
function calculateRawDamage(
  attackStat: number,
  skillPower: number,
  defenseStat: number
): number {
  return (attackStat * skillPower) / defenseStat;
}
```

### Step 3: Apply Type Effectiveness

**Type Chart** (Attacker Type → Defender Type):

| Attacker ↓ / Defender → | FIRE | WATER | GRASS | ELECTRIC | DARK | LIGHT | ICE | NEUTRAL | VOID |
|-------------------------|------|-------|-------|----------|------|-------|-----|---------|------|
| **FIRE**                | 0.5  | 0.5   | 2.0   | 1.0      | 1.0  | 1.0   | 2.0 | 1.0     | 1.0  |
| **WATER**               | 2.0  | 0.5   | 0.5   | 0.5      | 1.0  | 1.0   | 0.5 | 1.0     | 1.0  |
| **GRASS**               | 0.5  | 2.0   | 0.5   | 0.5      | 1.0  | 1.0   | 2.0 | 1.0     | 1.0  |
| **ELECTRIC**            | 1.0  | 2.0   | 1.0   | 0.5      | 1.0  | 1.0   | 1.0 | 1.0     | 1.0  |
| **DARK**                | 1.0  | 1.0   | 1.0   | 1.0      | 0.5  | 2.0   | 1.0 | 1.0     | 2.0  |
| **LIGHT**               | 1.0  | 1.0   | 1.0   | 1.0      | 2.0  | 0.5   | 1.0 | 1.0     | 0.5  |
| **ICE**                 | 0.5  | 1.0   | 2.0   | 1.0      | 1.0  | 1.0   | 0.5 | 1.0     | 1.0  |
| **NEUTRAL**             | 1.0  | 1.0   | 1.0   | 1.0      | 1.0  | 1.0   | 1.0 | 1.0     | 1.0  |
| **VOID**                | 1.0  | 1.0   | 1.0   | 1.0      | 0.5  | 2.0   | 1.0 | 1.0     | 0.5  |

**Legend**:
- `2.0` = Super Effective
- `1.0` = Neutral
- `0.5` = Not Very Effective
- `0.0` = Immune (not used in WildMonster)

```typescript
type TypeChart = Record<ElementType, Record<ElementType, number>>;

function getTypeEffectiveness(
  skillType: ElementType,
  defenderType: ElementType,
  typeChart: TypeChart
): number {
  return typeChart[skillType]?.[defenderType] ?? 1.0;
}
```

### Step 4: Apply Weather Modifier

```typescript
type Weather = 'CLEAR' | 'RAIN' | 'SUNNY' | 'SANDSTORM' | 'HAIL' | 'FOG';

function getWeatherModifier(skill: Skill, weather: Weather): number {
  switch (weather) {
    case 'RAIN':
      if (skill.type === ElementType.WATER) return 1.5;
      if (skill.type === ElementType.FIRE) return 0.5;
      break;
      
    case 'SUNNY':
      if (skill.type === ElementType.FIRE) return 1.5;
      if (skill.type === ElementType.WATER) return 0.5;
      break;
      
    case 'HAIL':
      if (skill.type === ElementType.ICE) return 1.5;
      break;
      
    case 'SANDSTORM':
      // No direct damage modifiers, but could add chip damage
      break;
      
    case 'FOG':
      if (skill.type === ElementType.DARK) return 1.2;
      break;
  }
  
  return 1.0; // CLEAR or no effect
}
```

### Step 5: Apply Terrain Modifier

```typescript
type Terrain = 'NORMAL' | 'VOLCANIC' | 'AQUATIC' | 'FOREST' | 'ELECTRIC' | 'FROZEN';

function getTerrainModifier(skill: Skill, terrain: Terrain): number {
  switch (terrain) {
    case 'VOLCANIC':
      if (skill.type === ElementType.FIRE) return 1.3;
      if (skill.type === ElementType.WATER) return 0.7;
      break;
      
    case 'AQUATIC':
      if (skill.type === ElementType.WATER) return 1.3;
      if (skill.type === ElementType.ELECTRIC) return 1.5; // Water conducts electricity
      if (skill.type === ElementType.FIRE) return 0.5;
      break;
      
    case 'FOREST':
      if (skill.type === ElementType.GRASS) return 1.3;
      if (skill.type === ElementType.FIRE) return 1.2; // Fire spreads in forests
      break;
      
    case 'ELECTRIC':
      if (skill.type === ElementType.ELECTRIC) return 1.3;
      break;
      
    case 'FROZEN':
      if (skill.type === ElementType.ICE) return 1.3;
      if (skill.type === ElementType.FIRE) return 0.8;
      break;
  }
  
  return 1.0; // NORMAL or no effect
}
```

### Step 6: Calculate Critical Hit

```typescript
function calculateCritical(attacker: CombatEntity, skill: Skill): number {
  // Base critical rate: 6.25% (1/16)
  let critRate = 0.0625;
  
  // High crit skills
  if (skill.highCritRatio) {
    critRate = 0.125; // 12.5%
  }
  
  // Speed-based crit bonus (fast monsters crit more)
  if (attacker.stats.speed > 100) {
    critRate += 0.05;
  }
  
  // Crit buffs
  attacker.buffs.forEach(buff => {
    if (buff.effect === 'BUFF_CRIT') {
      critRate += 0.1;
    }
  });
  
  // Roll for crit
  const isCrit = Math.random() < critRate;
  return isCrit ? 1.5 : 1.0;
}
```

### Step 7: Apply STAB (Same-Type Attack Bonus)

```typescript
function getSTABBonus(attacker: CombatEntity, skill: Skill): number {
  const attackerSpecies = MONSTER_DATA[attacker.speciesId];
  
  // If skill type matches attacker's type, apply STAB
  if (attackerSpecies.type === skill.type) {
    return 1.5;
  }
  
  return 1.0;
}
```

### Step 8: Apply Random Variance

```typescript
function getRandomFactor(): number {
  // Random variance: 85% to 115%
  return 0.85 + Math.random() * 0.3;
}
```

### Step 9: Floor and Return

```typescript
function finalizeDamage(rawDamage: number): number {
  // Floor to integer
  let damage = Math.floor(rawDamage);
  
  // Minimum damage: 1
  damage = Math.max(1, damage);
  
  // Maximum damage cap (prevent overflow)
  damage = Math.min(9999, damage);
  
  return damage;
}
```

---

## DamageCalculator Static Class

### Interface

```typescript
class DamageCalculator {
  private static typeChart: TypeChart;
  
  /**
   * Initialize the damage calculator with a type chart.
   * This allows external injection for testing and balance tweaks.
   */
  static Initialize(typeChart: TypeChart): void {
    this.typeChart = typeChart;
  }
  
  /**
   * Calculate final damage for an attack.
   */
  static Calculate(
    attacker: CombatEntity,
    defender: CombatEntity,
    skill: Skill,
    weather: Weather = 'CLEAR',
    terrain: Terrain = 'NORMAL'
  ): number {
    
    // Step 1: Get effective stats
    const { attackStat, defenseStat } = this.getEffectiveStats(attacker, defender, skill);
    
    // Step 2: Calculate raw damage
    let damage = this.calculateRawDamage(attackStat, skill.power, defenseStat);
    
    // Step 3: Type effectiveness
    const typeMultiplier = this.getTypeEffectiveness(skill.type, defender);
    damage *= typeMultiplier;
    
    // Step 4: Weather modifier
    const weatherMultiplier = this.getWeatherModifier(skill, weather);
    damage *= weatherMultiplier;
    
    // Step 5: Terrain modifier
    const terrainMultiplier = this.getTerrainModifier(skill, terrain);
    damage *= terrainMultiplier;
    
    // Step 6: Critical hit
    const critMultiplier = this.calculateCritical(attacker, skill);
    damage *= critMultiplier;
    
    // Step 7: STAB
    const stabBonus = this.getSTABBonus(attacker, skill);
    damage *= stabBonus;
    
    // Step 8: Random variance
    const randomFactor = this.getRandomFactor();
    damage *= randomFactor;
    
    // Step 9: Finalize
    return this.finalizeDamage(damage);
  }
  
  /**
   * Get type effectiveness from injected type chart.
   */
  static ApplyTypeChart(attackType: ElementType, defenderType: ElementType): number {
    if (!this.typeChart) {
      console.warn('[DamageCalculator] Type chart not initialized! Using neutral (1.0)');
      return 1.0;
    }
    
    return this.typeChart[attackType]?.[defenderType] ?? 1.0;
  }
  
  // ... (private helper methods from steps above)
}
```

### Dependency Injection Example

```typescript
// In game initialization
const typeChart: TypeChart = {
  [ElementType.FIRE]: {
    [ElementType.FIRE]: 0.5,
    [ElementType.WATER]: 0.5,
    [ElementType.GRASS]: 2.0,
    [ElementType.ELECTRIC]: 1.0,
    [ElementType.DARK]: 1.0,
    [ElementType.LIGHT]: 1.0,
    [ElementType.ICE]: 2.0,
    [ElementType.NEUTRAL]: 1.0,
    [ElementType.VOID]: 1.0
  },
  // ... (rest of type chart)
};

DamageCalculator.Initialize(typeChart);

// Now all damage calculations use the injected type chart
const damage = DamageCalculator.Calculate(player, enemy, skill, weather, terrain);
```

---

## Calculation Examples

### Example 1: Basic Attack (No Modifiers)

**Scenario**:
- Attacker: Pyrocat (Attack: 50)
- Defender: Droplet (Defense: 40)
- Skill: Scratch (Power: 15, Type: NEUTRAL)
- Weather: CLEAR
- Terrain: NORMAL
- No Crit, No STAB

**Calculation**:
```
RawDamage = (50 × 15) / 40 = 750 / 40 = 18.75
TypeEffectiveness = 1.0 (NEUTRAL vs WATER)
WeatherModifier = 1.0
TerrainModifier = 1.0
CritMultiplier = 1.0
STABBonus = 1.0
RandomFactor = 1.0 (assume exact)

FinalDamage = floor(18.75 × 1.0 × 1.0 × 1.0 × 1.0 × 1.0 × 1.0) = 18
```

**Result**: **18 damage**

---

### Example 2: Super Effective + STAB

**Scenario**:
- Attacker: Ignis (Special Attack: 80, Type: FIRE)
- Defender: Aqualo (Skill Resistance: 60, Type: WATER)
- Skill: Fire Blast (Power: 110, Type: FIRE)
- Weather: SUNNY
- Terrain: NORMAL
- No Crit

**Calculation**:
```
RawDamage = (80 × 110) / 60 = 8800 / 60 = 146.67
TypeEffectiveness = 0.5 (FIRE vs WATER - Not Very Effective)
WeatherModifier = 1.5 (FIRE in SUNNY weather)
TerrainModifier = 1.0
CritMultiplier = 1.0
STABBonus = 1.5 (FIRE attacker using FIRE skill)
RandomFactor = 1.0

FinalDamage = floor(146.67 × 0.5 × 1.5 × 1.0 × 1.0 × 1.5 × 1.0)
            = floor(146.67 × 1.125)
            = floor(165.0)
            = 165
```

**Result**: **165 damage**

> **Note**: Even though FIRE is weak against WATER (0.5×), the SUNNY weather (1.5×) and STAB (1.5×) compensate, resulting in decent damage.

---

### Example 3: Critical Hit + All Modifiers

**Scenario**:
- Attacker: Voltwing (Attack: 70, Type: ELECTRIC, Speed: 120)
- Defender: Aqualo (Defense: 50, Type: WATER)
- Skill: Sonic Blade (Power: 30, Type: ELECTRIC, High Crit Ratio)
- Weather: RAIN
- Terrain: AQUATIC
- Critical Hit!

**Calculation**:
```
RawDamage = (70 × 30) / 50 = 2100 / 50 = 42
TypeEffectiveness = 2.0 (ELECTRIC vs WATER - Super Effective)
WeatherModifier = 1.0 (RAIN doesn't affect ELECTRIC)
TerrainModifier = 1.5 (ELECTRIC in AQUATIC terrain)
CritMultiplier = 1.5 (Critical Hit!)
STABBonus = 1.5 (ELECTRIC attacker using ELECTRIC skill)
RandomFactor = 1.1 (assume high roll)

FinalDamage = floor(42 × 2.0 × 1.0 × 1.5 × 1.5 × 1.5 × 1.1)
            = floor(42 × 7.4625)
            = floor(313.425)
            = 313
```

**Result**: **313 damage** (massive!)

---

## Edge Cases

### 1. Zero Defense

**Problem**: Division by zero if defense is reduced to 0.

**Solution**: Enforce minimum defense of 1.

```typescript
defenseStat = Math.max(1, defenseStat);
```

### 2. Stat Overflow

**Problem**: Very high stats could cause integer overflow.

**Solution**: Cap final damage at 9999.

```typescript
damage = Math.min(9999, damage);
```

### 3. NaN or Infinity

**Problem**: Invalid calculations could produce NaN or Infinity.

**Solution**: Validate before returning.

```typescript
if (isNaN(damage) || !isFinite(damage)) {
  console.error('[DamageCalculator] Invalid damage calculated!', { attacker, defender, skill });
  return 1; // Fallback to minimum damage
}
```

### 4. Negative Damage (Healing)

**Problem**: Extreme debuffs could result in negative damage.

**Solution**: Enforce minimum damage of 1.

```typescript
damage = Math.max(1, damage);
```

---

## Balance Considerations

### Damage Ranges by Skill Category

| Category | Power Range | Expected Damage (Neutral) |
|----------|-------------|---------------------------|
| BASIC    | 15-35       | 10-30                     |
| SPECIAL  | 40-120      | 30-100                    |
| ULTIMATE | 250-700     | 150-500                   |

### Type Effectiveness Impact

- **Super Effective (2.0×)**: Encourages strategic team building
- **Not Very Effective (0.5×)**: Punishes poor matchups
- **Neutral (1.0×)**: Baseline for balance

### Weather/Terrain Stacking

- **Max Boost**: 1.5 (weather) × 1.5 (terrain) × 1.5 (STAB) × 1.5 (crit) = **5.0625×**
- **Max Penalty**: 0.5 (type) × 0.5 (weather) × 0.7 (terrain) = **0.175×**

This creates meaningful strategic depth without extreme variance.

---

## Testing Checklist

- [ ] Test basic damage calculation (no modifiers)
- [ ] Test type effectiveness (all 81 combinations)
- [ ] Test weather modifiers (6 weather types × 9 element types)
- [ ] Test terrain modifiers (6 terrain types × 9 element types)
- [ ] Test critical hit calculation
- [ ] Test STAB bonus
- [ ] Test random variance (min/max bounds)
- [ ] Test edge case: zero defense
- [ ] Test edge case: stat overflow
- [ ] Test edge case: NaN/Infinity
- [ ] Test edge case: negative damage
- [ ] Test buff/debuff stacking
- [ ] Test status effect penalties (burn)
- [ ] Integration test: full battle simulation

---

## References

- Current Implementation: [`combat.ts:calculateDamage()`](file:///c:/wildMonster/domain/combat.ts#L32-L68)
- Type Definitions: [`types.ts:ElementType`](file:///c:/wildMonster/domain/types.ts#L2-L12)
- Skill Data: [`skills.ts:SKILL_DATA`](file:///c:/wildMonster/data/skills.ts#L4-L32)
- Battle System Design: [Battle_System_Design.md](file:///C:/Users/rlagj/.gemini/antigravity/brain/6b6ad7cb-99fc-4230-81aa-b2c88afdbb4e/Battle_System_Design.md)
