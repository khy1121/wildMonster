# Data Manager 설계 문서
**프로젝트**: WildMonster  
**작성자**: Lead Gameplay Engineer  
**날짜**: 2025-12-30  
**버전**: 2.0 (오픈월드 RPG 전환)

---

## 개요

WildMonster가 턴제 전투에서 **오픈월드 와일더 RPG**로 전환됨에 따라, DataManager는 다음 요구사항을 충족해야 합니다:

1. **스트리밍 로딩**: 플레이어가 이동하는 Region/Zone에 따라 동적으로 데이터 로드
2. **메모리 효율성**: 모바일 환경을 고려한 캐싱 및 언로드 전략
3. **실시간 데이터 변경 감지**: 오픈월드 이벤트, 스폰, 퀘스트 상태 변화 추적
4. **모드 시스템**: 커뮤니티 콘텐츠 지원

---

## 현재 구조 분석

### 기존 DataManager ([DataManager.ts](file:///c:/wildMonster/engine/DataManager.ts))

**장점**:
- ✅ Singleton 패턴으로 중앙 집중식 관리
- ✅ JSON 로딩 + TypeScript 폴백 시스템
- ✅ DataValidator를 통한 데이터 검증
- ✅ Map 기반 캐싱으로 빠른 조회

**한계**:
- ❌ **Eager Loading**: 모든 데이터를 한 번에 로드 (메모리 낭비)
- ❌ **정적 데이터만 지원**: 런타임 데이터 변경 감지 없음
- ❌ **Region/Zone 개념 부재**: 오픈월드 구조에 맞지 않음
- ❌ **캐시 무효화 전략 없음**: 메모리 누수 가능성

---

## 오픈월드를 위한 개선 사항

### 1. 스트리밍 로딩 시스템

#### Region-Based Loading

```typescript
interface RegionData {
  id: string;
  monsters: string[];      // 이 Region에서 스폰되는 몬스터 ID 목록
  npcs: string[];          // 이 Region의 NPC ID 목록
  quests: string[];        // 이 Region의 퀘스트 ID 목록
  bosses: string[];        // 이 Region의 보스 ID 목록
  adjacentRegions: string[]; // 인접 Region (프리로드용)
}

class DataManager {
  private loadedRegions: Set<string> = new Set();
  private currentRegion: string | null = null;
  
  /**
   * 플레이어가 새로운 Region에 진입할 때 호출
   */
  async loadRegion(regionId: string): Promise<void> {
    if (this.loadedRegions.has(regionId)) {
      console.log(`Region ${regionId} already loaded`);
      return;
    }
    
    console.log(`Loading region: ${regionId}`);
    const region = await this.fetchRegionData(regionId);
    
    // 병렬로 필요한 데이터 로드
    await Promise.all([
      this.loadMonstersBatch(region.monsters),
      this.loadNPCsBatch(region.npcs),
      this.loadQuestsBatch(region.quests),
      this.loadBossesBatch(region.bosses)
    ]);
    
    this.loadedRegions.add(regionId);
    this.currentRegion = regionId;
    
    // 인접 Region 프리로드 (백그라운드)
    this.preloadAdjacentRegions(region.adjacentRegions);
  }
  
  /**
   * 플레이어가 Region을 떠날 때 호출 (메모리 정리)
   */
  unloadRegion(regionId: string): void {
    if (!this.loadedRegions.has(regionId)) return;
    
    // 현재 Region과 인접 Region은 유지
    if (regionId === this.currentRegion) return;
    const currentRegionData = this.regions.get(this.currentRegion!);
    if (currentRegionData?.adjacentRegions.includes(regionId)) return;
    
    console.log(`Unloading region: ${regionId}`);
    const region = this.regions.get(regionId);
    
    // 해당 Region의 데이터만 캐시에서 제거
    region?.monsters.forEach(id => this.monsters.delete(id));
    region?.npcs.forEach(id => this.npcs.delete(id));
    region?.quests.forEach(id => this.quests.delete(id));
    region?.bosses.forEach(id => this.bosses.delete(id));
    
    this.loadedRegions.delete(regionId);
  }
  
  /**
   * 백그라운드에서 인접 Region 프리로드
   */
  private async preloadAdjacentRegions(regionIds: string[]): Promise<void> {
    for (const regionId of regionIds) {
      if (!this.loadedRegions.has(regionId)) {
        // 낮은 우선순위로 로드 (requestIdleCallback 사용)
        requestIdleCallback(() => {
          this.loadRegion(regionId);
        });
      }
    }
  }
}
```

#### 배치 로딩 최적화

```typescript
/**
 * 여러 몬스터를 한 번에 로드 (네트워크 요청 최소화)
 */
private async loadMonstersBatch(monsterIds: string[]): Promise<void> {
  // 이미 캐시된 것은 제외
  const uncached = monsterIds.filter(id => !this.monsters.has(id));
  if (uncached.length === 0) return;
  
  try {
    // 단일 요청으로 여러 몬스터 데이터 가져오기
    const response = await fetch(`/data/json/monsters_batch.json?ids=${uncached.join(',')}`);
    const data = await response.json();
    
    for (const [id, monster] of Object.entries(data)) {
      this.monsters.set(id, monster as MonsterSpecies);
    }
    
    console.log(`Loaded ${uncached.length} monsters in batch`);
  } catch (error) {
    console.error('Batch load failed, falling back to individual loads:', error);
    // 폴백: 개별 로드
    await Promise.all(uncached.map(id => this.loadMonsterIndividual(id)));
  }
}
```

---

### 2. 캐싱 전략

#### LRU (Least Recently Used) 캐시

```typescript
class LRUCache<K, V> {
  private cache: Map<K, V> = new Map();
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 최근 사용으로 갱신 (Map은 삽입 순서 유지)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log(`[LRU] Evicted: ${firstKey}`);
    }
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

class DataManager {
  // 기존 Map 대신 LRU 캐시 사용
  private monsters: LRUCache<string, MonsterSpecies> = new LRUCache(200);
  private npcs: LRUCache<string, NPC> = new LRUCache(50);
  private quests: LRUCache<string, Quest> = new LRUCache(100);
}
```

#### 메모리 사용량 모니터링

```typescript
class DataManager {
  /**
   * 현재 캐시 메모리 사용량 추정 (MB)
   */
  getMemoryUsage(): number {
    const estimate = 
      this.monsters.size * 2 +  // 몬스터당 ~2KB
      this.skills.size * 0.5 +   // 스킬당 ~0.5KB
      this.items.size * 1 +      // 아이템당 ~1KB
      this.npcs.size * 1.5;      // NPC당 ~1.5KB
    
    return estimate / 1024; // KB -> MB
  }
  
  /**
   * 메모리 압박 시 자동 정리
   */
  private checkMemoryPressure(): void {
    const usage = this.getMemoryUsage();
    const threshold = 50; // 50MB
    
    if (usage > threshold) {
      console.warn(`[DataManager] Memory usage: ${usage.toFixed(2)}MB (threshold: ${threshold}MB)`);
      this.performGarbageCollection();
    }
  }
  
  private performGarbageCollection(): void {
    // 현재 Region과 인접 Region 외의 모든 데이터 언로드
    const regionsToKeep = new Set([
      this.currentRegion,
      ...this.getAdjacentRegions(this.currentRegion!)
    ]);
    
    for (const regionId of this.loadedRegions) {
      if (!regionsToKeep.has(regionId)) {
        this.unloadRegion(regionId);
      }
    }
  }
}
```

---

### 3. 데이터 변경 감지 시스템

#### Observable Pattern

```typescript
type DataChangeListener<T> = (id: string, newData: T, oldData?: T) => void;

class DataManager {
  private monsterListeners: Set<DataChangeListener<MonsterSpecies>> = new Set();
  private questListeners: Set<DataChangeListener<Quest>> = new Set();
  
  /**
   * 데이터 변경 구독
   */
  onMonsterChange(listener: DataChangeListener<MonsterSpecies>): () => void {
    this.monsterListeners.add(listener);
    return () => this.monsterListeners.delete(listener); // Unsubscribe
  }
  
  /**
   * 몬스터 데이터 업데이트 (변경 감지 포함)
   */
  updateMonster(id: string, newData: MonsterSpecies): void {
    const oldData = this.monsters.get(id);
    this.monsters.set(id, newData);
    
    // 모든 리스너에게 알림
    this.monsterListeners.forEach(listener => {
      listener(id, newData, oldData || undefined);
    });
  }
  
  /**
   * 퀘스트 상태 변경 감지
   */
  onQuestChange(listener: DataChangeListener<Quest>): () => void {
    this.questListeners.add(listener);
    return () => this.questListeners.delete(listener);
  }
  
  updateQuest(id: string, newData: Quest): void {
    const oldData = this.quests.get(id);
    this.quests.set(id, newData);
    
    this.questListeners.forEach(listener => {
      listener(id, newData, oldData || undefined);
    });
  }
}
```

#### 사용 예시

```typescript
// OverworldScene에서 몬스터 스폰 데이터 변경 감지
dataManager.onMonsterChange((id, newData, oldData) => {
  if (newData.spawnConditions !== oldData?.spawnConditions) {
    console.log(`Monster ${id} spawn conditions changed, refreshing spawns`);
    this.refreshMonsterSpawns();
  }
});

// QuestUI에서 퀘스트 진행도 변경 감지
dataManager.onQuestChange((id, newData, oldData) => {
  if (newData.status !== oldData?.status) {
    console.log(`Quest ${id} status changed: ${oldData?.status} -> ${newData.status}`);
    this.updateQuestDisplay(id, newData);
  }
});
```

---

### 4. 모드 시스템 설계

#### Mod 로딩 구조

```typescript
interface Mod {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  priority: number; // 낮을수록 먼저 로드
  overrides: {
    monsters?: Record<string, Partial<MonsterSpecies>>;
    skills?: Record<string, Partial<Skill>>;
    items?: Record<string, Partial<Item>>;
    regions?: Record<string, Partial<Region>>;
  };
  additions: {
    monsters?: Record<string, MonsterSpecies>;
    skills?: Record<string, Skill>;
    items?: Record<string, Item>;
    regions?: Record<string, Region>;
  };
}

class DataManager {
  private activeMods: Mod[] = [];
  
  /**
   * 모드 로드 및 적용
   */
  async loadMod(modPath: string): Promise<void> {
    try {
      const response = await fetch(modPath);
      const mod: Mod = await response.json();
      
      // 모드 검증
      if (!this.validateMod(mod)) {
        throw new Error(`Invalid mod: ${mod.id}`);
      }
      
      this.activeMods.push(mod);
      this.activeMods.sort((a, b) => a.priority - b.priority);
      
      // 모드 데이터 적용
      this.applyMod(mod);
      
      console.log(`✅ Mod loaded: ${mod.name} v${mod.version} by ${mod.author}`);
    } catch (error) {
      console.error(`Failed to load mod from ${modPath}:`, error);
    }
  }
  
  /**
   * 모드 데이터 적용 (오버라이드 + 추가)
   */
  private applyMod(mod: Mod): void {
    // 1. 오버라이드 적용
    if (mod.overrides.monsters) {
      for (const [id, override] of Object.entries(mod.overrides.monsters)) {
        const base = this.monsters.get(id);
        if (base) {
          this.monsters.set(id, { ...base, ...override });
          console.log(`[Mod] Overridden monster: ${id}`);
        }
      }
    }
    
    // 2. 새 콘텐츠 추가
    if (mod.additions.monsters) {
      for (const [id, monster] of Object.entries(mod.additions.monsters)) {
        if (!this.monsters.has(id)) {
          this.monsters.set(id, monster);
          console.log(`[Mod] Added new monster: ${id}`);
        } else {
          console.warn(`[Mod] Monster ${id} already exists, skipping`);
        }
      }
    }
    
    // Skills, Items, Regions도 동일하게 처리
  }
  
  /**
   * 모드 검증
   */
  private validateMod(mod: Mod): boolean {
    // 필수 필드 확인
    if (!mod.id || !mod.name || !mod.version) {
      console.error('[Mod] Missing required fields');
      return false;
    }
    
    // 버전 호환성 확인
    const gameVersion = '1.0.0';
    if (!this.isVersionCompatible(mod.version, gameVersion)) {
      console.error(`[Mod] Incompatible version: ${mod.version} (game: ${gameVersion})`);
      return false;
    }
    
    return true;
  }
}
```

---

## 성능 최적화

### 1. 인덱싱

```typescript
class DataManager {
  // 타입별 몬스터 인덱스 (빠른 필터링)
  private monstersByType: Map<ElementType, Set<string>> = new Map();
  
  // Region별 몬스터 인덱스
  private monstersByRegion: Map<string, Set<string>> = new Map();
  
  /**
   * 인덱스 빌드 (데이터 로드 후 한 번만 실행)
   */
  private buildIndices(): void {
    this.monsters.forEach((monster, id) => {
      // 타입별 인덱스
      if (!this.monstersByType.has(monster.type)) {
        this.monstersByType.set(monster.type, new Set());
      }
      this.monstersByType.get(monster.type)!.add(id);
    });
    
    this.regions.forEach((region, regionId) => {
      this.monstersByRegion.set(regionId, new Set(region.encounterPool.common));
    });
  }
  
  /**
   * 타입으로 몬스터 빠르게 조회
   */
  getMonstersByType(type: ElementType): MonsterSpecies[] {
    const ids = this.monstersByType.get(type) || new Set();
    return Array.from(ids).map(id => this.monsters.get(id)!).filter(Boolean);
  }
  
  /**
   * Region으로 몬스터 빠르게 조회
   */
  getMonstersByRegion(regionId: string): MonsterSpecies[] {
    const ids = this.monstersByRegion.get(regionId) || new Set();
    return Array.from(ids).map(id => this.monsters.get(id)!).filter(Boolean);
  }
}
```

### 2. 압축 및 직렬화

```typescript
/**
 * 데이터 압축 (선택적)
 */
async function loadCompressedData(url: string): Promise<any> {
  const response = await fetch(url);
  const compressed = await response.arrayBuffer();
  
  // pako 라이브러리 사용 (gzip 압축)
  const decompressed = pako.inflate(compressed, { to: 'string' });
  return JSON.parse(decompressed);
}
```

---

## 마이그레이션 가이드

### 기존 코드 → 새 DataManager

**Before**:
```typescript
import { MONSTER_DATA } from '../data/monsters';

const monster = MONSTER_DATA['pyrocat'];
```

**After**:
```typescript
import { dataManager } from '../engine/DataManager';

// Region 로드 (OverworldScene에서)
await dataManager.loadRegion('starter_fields');

// 몬스터 조회
const monster = dataManager.getMonsterSpecies('pyrocat');
```

---

## 구현 체크리스트

- [ ] LRU 캐시 구현
- [ ] Region-based 스트리밍 로딩
- [ ] 배치 로딩 API 엔드포인트 생성
- [ ] 데이터 변경 감지 (Observable)
- [ ] 메모리 사용량 모니터링
- [ ] 자동 가비지 컬렉션
- [ ] 모드 시스템 구현
- [ ] 인덱싱 시스템
- [ ] 압축 데이터 로딩 (선택)
- [ ] OverworldScene과 통합
- [ ] 성능 테스트 (모바일)

---

## 참조

- 현재 구현: [DataManager.ts](file:///c:/wildMonster/engine/DataManager.ts)
- 관련 Scene: [OverworldScene.ts](file:///c:/wildMonster/engine/scenes/OverworldScene.ts)
- 타입 정의: [types.ts](file:///c:/wildMonster/domain/types.ts)
