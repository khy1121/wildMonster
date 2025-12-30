# WildMonster Architecture Documentation

이 폴더는 WildMonster 프로젝트의 아키텍처 설계 문서를 포함합니다.

## 📚 문서 목록

### 전투 시스템
- **[Battle_System_Design.md](./Battle_System_Design.md)** - 턴제 전투 시스템 설계
  - State Pattern 기반 전투 상태 관리
  - Stack Machine 아키텍처
  - Command Pattern을 통한 액션 처리
  - 데미지 계산 및 엣지 케이스 처리

- **[Damage_Formula_Spec.md](./Damage_Formula_Spec.md)** - 데미지 계산 공식 명세
  - 표준화된 데미지 공식
  - 타입 상성표 (9×9)
  - 날씨/지형 보정
  - DamageCalculator 클래스 설계

### 오픈월드 시스템
- **[Data_Manager_Design.md](./Data_Manager_Design.md)** - 데이터 관리 시스템
  - Region 기반 스트리밍 로딩
  - LRU 캐싱 전략
  - 데이터 변경 감지 (Observable)
  - 모드 시스템 설계

- **[Refactoring_Plan.md](./Refactoring_Plan.md)** - 오픈월드 RPG 리팩토링 계획
  - Region/Zone 시스템
  - 와일더 AI 상태 머신 (IDLE/AGGRO/CHASE/ATTACK/RETURN)
  - 스폰 시스템 (밀도 제어, 리스폰)
  - Camera3D 통합

### UI/이벤트 시스템
- **[UI_Event_Architecture.md](./UI_Event_Architecture.md)** - UI 이벤트 아키텍처
  - 타입 안전 EventBus
  - React ↔ Phaser 통신
  - 이벤트 우선순위 시스템
  - 에러 핸들링 및 디버깅

---

## 🎯 구현 우선순위

### Phase 1: 기반 구조 (1주)
- [ ] RegionManager 구현
- [ ] Region 데이터 정의
- [ ] Portal 시스템

### Phase 2: AI 시스템 (1주)
- [ ] WilderAI 상태 머신
- [ ] 선공/비선공 로직
- [ ] 복귀 메커니즘

### Phase 3: 이벤트 시스템 (3일)
- [ ] TypedEventBus 구현
- [ ] useGameEvent Hook
- [ ] 상태 동기화 개선

### Phase 4: 전투 시스템 (1주)
- [ ] BattleState 클래스
- [ ] BattleStateStack 구현
- [ ] Command Pattern 구현
- [ ] DamageCalculator 구현

---

## 📖 참고 자료

- 프로젝트 루트: `c:\wildMonster`
- 엔진 코드: `c:\wildMonster\engine`
- 도메인 로직: `c:\wildMonster\domain`
- 데이터 파일: `c:\wildMonster\data`

---

**작성일**: 2025-12-30  
**버전**: 2.0 (오픈월드 RPG 전환)
