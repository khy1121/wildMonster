# 🛠️ 이온테이머(EonTamers) 트러블슈팅 및 버그 수정 보고서

이 문서는 프로젝트 개발 과정에서 발생한 주요 문제점들과 그에 대한 원인 분석, 그리고 해결 방법을 정리한 보고서입니다.

---

## 1. 3D 오버레이 및 클린업 이슈 (Visual & Memory)

### 🔴 문제: 장면 전환 시 3D 모델 잔상 및 중첩 발생
- **현상**: 메인 메뉴에서 월드로 진입할 때 3D 보석 모델이 사라지지 않거나, 배틀 장면에서 메뉴의 3D 몬스터가 중첩되어 나타남.
- **원인**: Phaser의 장면 전환 시 Three.js 캔버스와 오버레이 요소들이 명시적으로 파괴되지 않아 메모리에 남아있는 현상.
- **해결 방법**: `ThreeOverlayRenderer`에 정적 `forceCleanup` 메서드를 구현하여 장면이 시작될 때마다 기존 오버레이를 강제로 제거함.

```typescript
// engine/ThreeOverlayRenderer.ts
static forceCleanup(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const overlays = container.querySelectorAll('.three-overlay-canvas');
  overlays.forEach(el => el.remove()); // 기존 캔버스 제거
}
```

---

## 2. 배틀 시스템 시각 효과 고도화 (VFX)

### 🔴 문제: 단조로운 스킬 이펙트 및 3D/2D 혼선
- **현상**: 스킬 사용 시 이펙트가 단순하고, 3D 트로피 등이 2D 배경과 어색하게 어우러짐.
- **원인**: 초기 설계의 3D 투사체 방식이 성능 및 가시성 측면에서 2D 픽셀 아트 스타일과 맞지 않음.
- **해결 방법**: 3D 요소를 완전 제거하고, Phaser의 입자 시스템(Particle System)을 멀티 레이어로 구성하여 화려한 2D VFX로 전면 개편함.

```typescript
// engine/scenes/BattleScene.ts (VFX 예시)
const emitter = this.add.particles(0, 0, 'flare', {
  speed: { min: 100, max: 200 },
  scale: { start: 1, end: 0 },
  blendMode: 'ADD',
  lifespan: 600
});
```

---

## 3. RPG 시스템 및 데이터 무결성 (Logic & Data)

### 🔴 문제: 상업 시스템 및 내비게이션 기능 결함
- **현상**: 설정 버튼이 작동하지 않고, 게임 중 로비로 돌아가는 방법이 없으며, 상점의 아이템 정보가 다국어 환경에서 누락됨.
- **원인**: `GameStateManager`의 세이브/로드 메서드 누락 및 `App.tsx`의 과도하게 제한적인 UI 렌더링 조건.
- **해결 방법**: 
  - GMS에 세이브/로드 및 타이틀 복귀 로직 추가.
  - `App.tsx`에서 `activeScene` 조건을 완화하여 로비에서도 HUD 메뉴가 표시되도록 수정.
  - `strings.ts` 파일의 데이터 구조를 동기화하여 다국어 데이터 무결성 확보.

---

## 4. 빌드 및 타입 안정성 (Build & Types)

### 🔴 문제: TypeScript 타입 미지정 및 모듈 인식 오류
- **현상**: `ShopUI`에서 평판 계산 시 `unknown` 타입 에러 발생, `useTranslation` 훅을 찾지 못하는 빌드 에러 발생.
- **원인**: `Object.values()`가 기본적으로 `unknown[]`을 반환하며, `.ts` 확장자가 React의 훅 생명주기와 엮일 때 인식 오류 발생 가능성.
- **해결 방법**: 
  - 명시적 타입 캐스팅(`as number[]`)을 통해 타입 안정성 확보.
  - `useTranslation.ts`를 `.tsx`로 변경하고 경로 별칭(`@/`)을 사용하여 모듈 인식 신뢰도 향상.

```tsx
// ui/ShopUI.tsx (타입 수정)
const repValues: number[] = Object.values(state.reputation);
repValues.forEach(val => {
  maxDiscount = Math.max(maxDiscount, getFactionDiscount(val));
});
```

---

## 5. 사용자 인터페이스(UI) 접근성 개선

### 🔴 문제: 특정 상황에서 UI 사라짐 및 데이터 누락
- **현상**: 스타터 와일더 선택 후 스킬 트리를 열면 빈 화면이 나옴.
- **원인**: 초기 3종 와일더(Ignis, Aqualo, Voltwing)에 대한 스킬 트리 데이터(`SKILL_TREES`) 정의 누락.
- **해결 방법**: 각 스타터의 특징에 맞는 스킬 트리와 분기 진화 조건을 포함한 노드 데이터를 `data/skills.ts`에 추가.

---

### 💡 요약
| 구분 | 주요 문제 | 해결 핵심 |
| :--- | :--- | :--- |
| **Graphic** | 3D 잔상 및 중첩 | 강제 클린업 로직 및 Stop 메서드 호출 |
| **System** | 세이브/로드 & 내비게이션 | GMS API 보강 및 App UI 조건부 렌더링 수정 |
| **Data** | 스킬 트리 데이터 누락 | 신규 스타터 전용 SKILL_TREES 정의 및 다국어 지원 |
| **Code** | TS 빌드 에러 | 명시적 타입 정의 및 확장자(.tsx) 최적화 |

---
*본 보고서는 프로젝트의 안정성과 유지보수성을 높이기 위해 작성되었습니다.*
