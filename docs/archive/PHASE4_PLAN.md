# Phase 4: Social & Engagement Systems

> Focusing on player retention and engagement through progression rewards and idle mechanics.

---

## 1. Achievement System
A milestone-based reward system that tracks player progress.

### Features:
- **Achievement Types**:
  - Combat: "Defeat 100 monsters", "Win without taking damage"
  - Collection: "Collect 10 unique species", "Hatch 5 eggs"
  - Progression: "Reach Tamer Level 10", "Enhance a monster to +5"
  - Economy: "Earn 10,000 gold", "Buy 50 items"

### Data Model (domain/types.ts):
- Add Achievement interface with id, name, description, category, target, reward, icon
- Add to Tamer: achievementProgress (Record), unlockedAchievements (string[])

### Implementation:
1. Create data/achievements.ts with achievement definitions
2. Add tracking logic in GameStateManager for relevant actions
3. Create ui/AchievementsUI.tsx to display progress and claim rewards
4. Add achievement notification popup

---

## 2. Daily Login Rewards
Consecutive login bonuses to encourage daily engagement.

### Features:
- 7-day reward cycle (resets after day 7)
- Progressive rewards (Day 1: 100G, Day 7: Rare Egg)
- Streak bonus for consecutive logins

### Data Model:
- Add to GameState: dailyLogin object with lastLoginDate, consecutiveDays, claimedToday

### Rewards Table:
- Day 1: 100 Gold
- Day 2: 2x Potion
- Day 3: 300 Gold
- Day 4: 1x Fire Data
- Day 5: 500 Gold
- Day 6: 1x Power Clone D
- Day 7: 1x Normal Egg + 1000 Gold

### Implementation:
1. Add checkDailyLogin() method to GameStateManager
2. Create ui/DailyLoginUI.tsx popup
3. Trigger check on game start

---

## 3. Expedition System (Idle Mechanic)
Send monsters on auto-missions to earn rewards while offline.

### Features:
- Expedition Slots: Start with 1 slot, expandable via shop
- Duration: 1hr, 4hr, 8hr expeditions with increasing rewards
- Requirements: Monster level, specific element, etc.
- Rewards: Gold, items, XP for deployed monsters

### Data Model:
- Expedition interface: id, name, duration, requirements, rewards
- ActiveExpedition interface: expeditionId, monsterUids, startTime, endTime
- Add to Tamer: activeExpeditions, expeditionSlots

### Implementation:
1. Create data/expeditions.ts with expedition definitions
2. Add expedition logic in GameStateManager
3. Create ui/ExpeditionUI.tsx
4. Add HUD button for Expeditions

---

## Priority Order
1. Achievement System - Adds immediate engagement, low complexity
2. Daily Login Rewards - Quick to implement, high retention impact
3. Expedition System - Most complex, requires offline time calculation
