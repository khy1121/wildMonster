# UI Event Architecture 설계 문서
**프로젝트**: WildMonster  
**작성자**: Lead Gameplay Engineer  
**날짜**: 2025-12-30  
**버전**: 2.0 (오픈월드 RPG 전환)

---

## 개요

WildMonster는 **Phaser (게임 엔진)**와 **React (UI 레이어)**로 구성됩니다. 이 문서는 두 시스템 간의 이벤트 통신 아키텍처를 정의합니다.

---

## 현재 구조 분석

### 기존 EventBus ([EventBus.ts](file:///c:/wildMonster/engine/EventBus.ts))

```typescript
export class EventBus extends Phaser.Events.EventEmitter {
  emitEvent(event: GameEvent) {
    this.emit(event.type, event);
  }

  onEvent(type: GameEvent['type'], callback: (event: any) => void) {
    this.on(type, callback);
  }

  subscribe(type: GameEvent['type'], callback: (event: any) => void) {
    this.on(type, callback);
    return () => this.off(type, callback);
  }
}

export const gameEvents = new EventBus();
```

**장점**:
- ✅ Phaser EventEmitter 기반으로 안정적
- ✅ Subscribe 패턴으로 React에서 사용 가능
- ✅ 타입 정의된 GameEvent 사용

**한계**:
- ❌ **타입 안전성 부족**: `callback: (event: any)`로 타입 손실
- ❌ **우선순위 없음**: 이벤트 처리 순서 제어 불가
- ❌ **에러 핸들링 부재**: 리스너 에러가 전파되지 않음
- ❌ **디버깅 어려움**: 이벤트 흐름 추적 불가

---

## 목표 아키텍처

### 이벤트 분류

```typescript
// 게임 로직 이벤트 (Phaser → Phaser)
type GameEvent =
  | { type: 'BATTLE_START'; enemySpeciesId: string }
  | { type: 'BATTLE_END'; winner: 'PLAYER' | 'ENEMY' | 'CAPTURED' }
  | { type: 'MONSTER_CAPTURED'; monster: MonsterInstance }
  | { type: 'EVOLUTION_READY'; monsterUid: string; options: EvolutionOption[] }
  | { type: 'REGION_CHANGED'; regionId: string; regionName: string };

// UI 업데이트 이벤트 (Phaser → React)
type UIEvent =
  | { type: 'STATE_UPDATED'; state: GameState }
  | { type: 'REWARD_EARNED'; rewards: BattleRewards }
  | { type: 'LOG_MESSAGE'; message: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'QUEST_COMPLETED'; questId: string };

// 시스템 이벤트 (양방향)
type SystemEvent =
  | { type: 'SCENE_CHANGED'; sceneKey: string }
  | { type: 'RETURN_TO_TITLE' }
  | { type: 'LANGUAGE_CHANGED'; language: Language }
  | { type: 'SETTINGS_UPDATED'; settings: GameSettings };

// 사용자 액션 이벤트 (React → Phaser)
type UserActionEvent =
  | { type: 'UI_BUTTON_CLICKED'; buttonId: string }
  | { type: 'INVENTORY_ITEM_USED'; itemId: string; targetUid?: string }
  | { type: 'MONSTER_SWITCHED'; fromUid: string; toUid: string }
  | { type: 'SKILL_TREE_NODE_UNLOCKED'; monsterUid: string; nodeId: string };

type AllEvents = GameEvent | UIEvent | SystemEvent | UserActionEvent;
```

---

## 개선된 EventBus

### 타입 안전 EventBus

```typescript
type EventCallback<T extends AllEvents> = (event: T) => void;
type EventType = AllEvents['type'];

interface EventPriority {
  CRITICAL: number;  // 0 (가장 먼저 실행)
  HIGH: number;      // 1
  NORMAL: number;    // 2
  LOW: number;       // 3
}

const PRIORITY: EventPriority = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3
};

interface EventListener<T extends AllEvents = AllEvents> {
  callback: EventCallback<T>;
  priority: number;
  once: boolean;
}

class TypedEventBus {
  private listeners: Map<EventType, EventListener[]> = new Map();
  private eventHistory: AllEvents[] = [];
  private maxHistorySize = 100;
  private debugMode = false;
  
  /**
   * 디버그 모드 활성화
   */
  enableDebug(): void {
    this.debugMode = true;
    console.log('[EventBus] Debug mode enabled');
  }
  
  /**
   * 이벤트 발행 (타입 안전)
   */
  emit<T extends AllEvents>(event: T): void {
    const { type } = event;
    
    if (this.debugMode) {
      console.log(`[EventBus] Emit: ${type}`, event);
    }
    
    // 이벤트 히스토리 저장
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    const listeners = this.listeners.get(type);
    if (!listeners || listeners.length === 0) {
      if (this.debugMode) {
        console.warn(`[EventBus] No listeners for: ${type}`);
      }
      return;
    }
    
    // 우선순위 순으로 정렬
    const sortedListeners = [...listeners].sort((a, b) => a.priority - b.priority);
    
    // 리스너 실행
    for (const listener of sortedListeners) {
      try {
        listener.callback(event as any);
        
        // once 리스너는 실행 후 제거
        if (listener.once) {
          this.off(type, listener.callback);
        }
      } catch (error) {
        console.error(`[EventBus] Error in listener for ${type}:`, error);
        
        // 에러 이벤트 발행
        this.emit({
          type: 'EVENT_ERROR',
          originalEvent: event,
          error: error instanceof Error ? error.message : String(error)
        } as any);
      }
    }
  }
  
  /**
   * 이벤트 구독 (타입 안전)
   */
  on<T extends AllEvents>(
    type: T['type'],
    callback: EventCallback<T>,
    priority: number = PRIORITY.NORMAL
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    const listener: EventListener<T> = {
      callback: callback as any,
      priority,
      once: false
    };
    
    this.listeners.get(type)!.push(listener);
    
    if (this.debugMode) {
      console.log(`[EventBus] Listener added: ${type} (priority: ${priority})`);
    }
    
    // Unsubscribe 함수 반환
    return () => this.off(type, callback);
  }
  
  /**
   * 일회성 이벤트 구독
   */
  once<T extends AllEvents>(
    type: T['type'],
    callback: EventCallback<T>,
    priority: number = PRIORITY.NORMAL
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    const listener: EventListener<T> = {
      callback: callback as any,
      priority,
      once: true
    };
    
    this.listeners.get(type)!.push(listener);
    
    return () => this.off(type, callback);
  }
  
  /**
   * 이벤트 구독 해제
   */
  off<T extends AllEvents>(
    type: T['type'],
    callback: EventCallback<T>
  ): void {
    const listeners = this.listeners.get(type);
    if (!listeners) return;
    
    const index = listeners.findIndex(l => l.callback === callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      
      if (this.debugMode) {
        console.log(`[EventBus] Listener removed: ${type}`);
      }
    }
  }
  
  /**
   * 특정 타입의 모든 리스너 제거
   */
  removeAllListeners(type?: EventType): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }
  
  /**
   * 이벤트 히스토리 조회
   */
  getHistory(type?: EventType): AllEvents[] {
    if (type) {
      return this.eventHistory.filter(e => e.type === type);
    }
    return [...this.eventHistory];
  }
  
  /**
   * 마지막 이벤트 조회
   */
  getLastEvent(type: EventType): AllEvents | undefined {
    const history = this.getHistory(type);
    return history[history.length - 1];
  }
}

// Export singleton
export const gameEvents = new TypedEventBus();
```

---

## React 통합 패턴

### useGameEvent Hook

```typescript
import { useEffect, useRef } from 'react';
import { gameEvents } from '../engine/EventBus';
import type { AllEvents } from '../domain/types';

/**
 * React Hook for subscribing to game events
 */
export function useGameEvent<T extends AllEvents>(
  type: T['type'],
  callback: (event: T) => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback);
  
  // 최신 콜백 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const unsubscribe = gameEvents.on(
      type,
      (event) => callbackRef.current(event as T)
    );
    
    return unsubscribe;
  }, [type, ...deps]);
}

/**
 * React Hook for one-time event subscription
 */
export function useGameEventOnce<T extends AllEvents>(
  type: T['type'],
  callback: (event: T) => void
): void {
  useEffect(() => {
    const unsubscribe = gameEvents.once(
      type,
      (event) => callback(event as T)
    );
    
    return unsubscribe;
  }, [type, callback]);
}
```

### 사용 예시

```typescript
// components/BattleArena.tsx
import { useGameEvent } from '../hooks/useGameEvent';

export function BattleArena() {
  const [rewards, setRewards] = useState<BattleRewards | null>(null);
  
  // 보상 획득 이벤트 구독
  useGameEvent('REWARD_EARNED', (event) => {
    setRewards(event.rewards);
    // 보상 UI 표시
  });
  
  // 전투 종료 이벤트 구독 (일회성)
  useGameEventOnce('BATTLE_END', (event) => {
    if (event.winner === 'PLAYER') {
      showVictoryAnimation();
    }
  });
  
  return (
    <div className="battle-arena">
      {rewards && <RewardDisplay rewards={rewards} />}
    </div>
  );
}
```

---

## 상태 동기화 전략

### GameState 변경 감지

```typescript
class GameStateManager {
  private previousState: GameState | null = null;
  
  updateState(partial: Partial<GameState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...partial };
    
    // 변경된 필드만 감지
    const changes = this.detectChanges(oldState, this.state);
    
    // 전체 상태 업데이트 이벤트
    gameEvents.emit({
      type: 'STATE_UPDATED',
      state: this.state
    });
    
    // 세분화된 변경 이벤트
    if (changes.tamer) {
      gameEvents.emit({
        type: 'TAMER_UPDATED',
        tamer: this.state.tamer
      });
    }
    
    if (changes.inventory) {
      gameEvents.emit({
        type: 'INVENTORY_UPDATED',
        inventory: this.state.tamer.inventory
      });
    }
    
    if (changes.party) {
      gameEvents.emit({
        type: 'PARTY_UPDATED',
        party: this.state.tamer.party
      });
    }
    
    this.autoSave();
  }
  
  /**
   * 변경 감지 (얕은 비교)
   */
  private detectChanges(oldState: GameState, newState: GameState): Record<string, boolean> {
    return {
      tamer: oldState.tamer !== newState.tamer,
      inventory: oldState.tamer.inventory !== newState.tamer.inventory,
      party: oldState.tamer.party !== newState.tamer.party,
      worldPosition: oldState.worldPosition !== newState.worldPosition,
      currentScene: oldState.currentScene !== newState.currentScene
    };
  }
}
```

### React에서 세분화된 구독

```typescript
// components/InventoryUI.tsx
export function InventoryUI() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // 전체 STATE_UPDATED 대신 INVENTORY_UPDATED만 구독 (성능 향상)
  useGameEvent('INVENTORY_UPDATED', (event) => {
    setInventory(event.inventory);
  });
  
  return (
    <div className="inventory">
      {inventory.map(item => (
        <ItemSlot key={item.itemId} item={item} />
      ))}
    </div>
  );
}
```

---

## 이벤트 우선순위 활용

### 예시: 전투 종료 처리

```typescript
// BattleScene.ts
class BattleScene extends Phaser.Scene {
  endBattle(winner: 'PLAYER' | 'ENEMY') {
    gameEvents.emit({
      type: 'BATTLE_END',
      winner
    });
  }
}

// GameStateManager.ts (CRITICAL 우선순위)
gameEvents.on('BATTLE_END', (event) => {
  this.handleBattleEnd(event.winner, ...);
  // 상태 업데이트, 보상 지급 등
}, PRIORITY.CRITICAL);

// UI Component (NORMAL 우선순위)
gameEvents.on('BATTLE_END', (event) => {
  if (event.winner === 'PLAYER') {
    showVictoryScreen();
  }
}, PRIORITY.NORMAL);

// Analytics (LOW 우선순위)
gameEvents.on('BATTLE_END', (event) => {
  trackBattleEnd(event.winner);
}, PRIORITY.LOW);
```

**실행 순서**:
1. GameStateManager (CRITICAL) - 상태 업데이트
2. UI Component (NORMAL) - 화면 표시
3. Analytics (LOW) - 로깅

---

## 에러 핸들링

### 전역 에러 리스너

```typescript
// App.tsx
useGameEvent('EVENT_ERROR', (event) => {
  console.error('[EventBus Error]', {
    originalEvent: event.originalEvent,
    error: event.error
  });
  
  // Sentry 등 에러 추적 서비스로 전송
  Sentry.captureException(new Error(event.error), {
    contexts: {
      event: {
        type: event.originalEvent.type,
        data: event.originalEvent
      }
    }
  });
  
  // 사용자에게 에러 알림
  toast.error('An error occurred. Please try again.');
});
```

---

## 성능 최적화

### 1. 이벤트 배칭

```typescript
class EventBatcher {
  private queue: AllEvents[] = [];
  private batchTimeout: number | null = null;
  
  /**
   * 이벤트를 큐에 추가하고 배치 처리
   */
  enqueue(event: AllEvents): void {
    this.queue.push(event);
    
    if (this.batchTimeout === null) {
      this.batchTimeout = window.setTimeout(() => {
        this.flush();
      }, 16); // 1 프레임 (60fps)
    }
  }
  
  /**
   * 큐의 모든 이벤트 처리
   */
  private flush(): void {
    const events = [...this.queue];
    this.queue = [];
    this.batchTimeout = null;
    
    // 배치 이벤트 발행
    gameEvents.emit({
      type: 'EVENTS_BATCHED',
      events
    });
  }
}

const eventBatcher = new EventBatcher();

// 사용 예시
for (let i = 0; i < 100; i++) {
  eventBatcher.enqueue({
    type: 'LOG_MESSAGE',
    message: `Message ${i}`
  });
}
// 16ms 후 한 번에 처리
```

### 2. 메모이제이션

```typescript
// React 컴포넌트에서 불필요한 리렌더링 방지
export function PartyUI() {
  const [party, setParty] = useState<MonsterInstance[]>([]);
  
  useGameEvent('PARTY_UPDATED', useCallback((event) => {
    setParty(event.party);
  }, [])); // 빈 deps로 콜백 고정
  
  // 메모이제이션된 렌더링
  const partySlots = useMemo(() => {
    return party.map(monster => (
      <MonsterSlot key={monster.uid} monster={monster} />
    ));
  }, [party]);
  
  return <div className="party">{partySlots}</div>;
}
```

---

## 디버깅 도구

### Event Inspector

```typescript
class EventInspector {
  /**
   * 이벤트 흐름 시각화
   */
  visualizeFlow(): void {
    const history = gameEvents.getHistory();
    
    console.group('Event Flow');
    history.forEach((event, index) => {
      console.log(`${index + 1}. ${event.type}`, event);
    });
    console.groupEnd();
  }
  
  /**
   * 특정 타입 이벤트 필터링
   */
  filterByType(type: EventType): AllEvents[] {
    return gameEvents.getHistory(type);
  }
  
  /**
   * 이벤트 통계
   */
  getStatistics(): Record<EventType, number> {
    const history = gameEvents.getHistory();
    const stats: Record<string, number> = {};
    
    history.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    
    return stats as Record<EventType, number>;
  }
}

// 개발 모드에서만 활성화
if (process.env.NODE_ENV === 'development') {
  (window as any).eventInspector = new EventInspector();
  gameEvents.enableDebug();
}
```

**사용법** (브라우저 콘솔):
```javascript
// 이벤트 흐름 확인
window.eventInspector.visualizeFlow();

// 특정 타입 필터링
window.eventInspector.filterByType('BATTLE_END');

// 통계
window.eventInspector.getStatistics();
// { BATTLE_START: 5, BATTLE_END: 5, STATE_UPDATED: 20, ... }
```

---

## 마이그레이션 가이드

### 기존 코드 → 새 EventBus

**Before**:
```typescript
gameEvents.onEvent('BATTLE_END', (event: any) => {
  console.log(event.winner);
});
```

**After**:
```typescript
gameEvents.on('BATTLE_END', (event) => {
  console.log(event.winner); // 타입 안전!
});
```

**React Before**:
```typescript
useEffect(() => {
  const handler = (event: any) => {
    setRewards(event.rewards);
  };
  
  gameEvents.onEvent('REWARD_EARNED', handler);
  
  return () => {
    // 수동 cleanup 필요
  };
}, []);
```

**React After**:
```typescript
useGameEvent('REWARD_EARNED', (event) => {
  setRewards(event.rewards);
});
// 자동 cleanup!
```

---

## 구현 체크리스트

- [ ] TypedEventBus 구현
- [ ] 이벤트 타입 정의 확장
- [ ] 우선순위 시스템
- [ ] 에러 핸들링
- [ ] useGameEvent Hook
- [ ] 상태 동기화 개선
- [ ] 이벤트 배칭
- [ ] Event Inspector
- [ ] 기존 코드 마이그레이션
- [ ] 성능 테스트

---

## 참조

- 현재 구현: [EventBus.ts](file:///c:/wildMonster/engine/EventBus.ts)
- 타입 정의: [types.ts](file:///c:/wildMonster/domain/types.ts)
- GameStateManager: [GameStateManager.ts](file:///c:/wildMonster/engine/GameStateManager.ts)
