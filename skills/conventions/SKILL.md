# Conventions

Claude Code 와 개발자가 지키는 규칙.

## 작업 순서

1. `skills/README.md` 확인
2. 작업과 관련된 `skills/<name>/SKILL.md` 확인 (디자인 → design, 애니메이션 → animation, 인증 → auth, 오류 → troubleshooting)
3. 현재 코드 확인 (`components/`, `styles/`, `lib/`)
4. 작업
5. 검증: `npm run lint`, `npx tsc --noEmit`, 필요하면 `npm run build`, 관련 route 접근
6. 관련 SKILL 문서, `PROJECT_STATUS.md`, `CHANGELOG.md` 갱신

Next.js 코드를 쓰기 전에는 `node_modules/next/dist/docs/` 의 관련 문서를 확인한다 (`AGENTS.md`).

## 코드

- 한 component 는 가능하면 하나의 역할만 가진다. 폴더는 역할별: `entry/`, `auth/`, `navigation/`, `directory/`.
- 같은 UI 코드를 여러 페이지에 복붙하지 않는다. 공통 메뉴는 `components/navigation/TopNavigation.tsx` 를 쓴다.
- `app/**/page.tsx` 는 얇게 유지한다 (컴포넌트 하나를 렌더링하는 layout 역할).
- 사이트 목록 같은 데이터는 component 안에 쓰지 않고 `lib/` 에 둔다.
- 색/치수를 component 나 CSS 안에 반복 hard-code 하지 않는다. `styles/tokens.css` 에 토큰을 추가하고 `var(--…)` 를 쓴다. (SVG 속성 색은 예외, [design](../design/SKILL.md) 참고)
- 새 라이브러리는 꼭 필요할 때만 설치한다. 현재 애니메이션/인증/DB 라이브러리는 없다.
- React state 와 강하게 연결된 애니메이션은 `data-phase`/`data-view` 속성 + CSS 로 구동하고, 타이머는 `EntryGate.tsx` 한 곳에서만 관리한다.
- CSS import 순서(`tokens` → `globals` → `animations`)를 바꾸지 않는다.

## 범위

- 대규모 rewrite 전에 현재 기능을 먼저 확인한다 (route 접근, 스크린샷 비교).
- 기존 정상 기능과 디자인 결과를 임의로 바꾸지 않는다.
- 요청받지 않은 기능을 추가하지 않는다. 구현하지 않은 기능을 구현했다고 쓰지 않는다 (문서에서도: UI ONLY 는 UI ONLY 로 적는다).
- 현재 상태와 미래 계획을 문서에서 섞지 않는다 (미래 계획은 `PROJECT_STATUS.md` 의 PLANNED).

## 문서

- 동작/구조를 바꾸면 해당 SKILL 문서를 같은 작업에서 갱신한다. 파일 경로, component 이름, state 이름, CSS 변수 이름을 구체적으로 적는다.
- 문제를 해결하거나 알려진 한계를 발견하면 `skills/troubleshooting/SKILL.md` 에 추가한다.
- 모든 주요 변경은 `CHANGELOG.md` 에 날짜별로 기록한다.
