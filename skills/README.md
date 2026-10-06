# Skills — 프로젝트 유지보수 안내

이 폴더는 **실행 코드가 아니라 개발자용 기술 문서**다. 프로젝트를 수정하기 전에 여기서 수정 위치를 찾는다.

## 프로젝트 개요

"비밀 아카이브" 콘셉트의 큐레이션 사이트 디렉터리(Next.js App Router, TypeScript).

- `/` 에서 시네마틱 **Entry Gate**를 보고 ACCESS → 로그인 UI → (mock 로그인) → 전환 애니메이션 → `/home`.
- `/home`, `/data`, `/design`, `/tools` 는 사이트 목록을 보여주는 디렉터리 페이지.
- 인증은 **UI만** 있다(백엔드 없음). 검색도 **UI만** 있다. DB/API 없음.

## 주요 route

| route | 파일 | 역할 |
| --- | --- | --- |
| `/` | `app/page.tsx` → `components/entry/EntryGate.tsx` | Entry Gate + 인증 UI + 전환 애니메이션 |
| `/home` | `app/home/page.tsx` → `components/directory/HomeIntro.tsx` | 소개 문구 + DATA/DESIGN/TOOLS 3열 미리보기 |
| `/data` | `app/data/page.tsx` → `components/directory/CategoryPage.tsx` | DATA 전체 목록 |
| `/design` | `app/design/page.tsx` → 〃 | DESIGN 전체 목록 |
| `/tools` | `app/tools/page.tsx` → 〃 | TOOLS 전체 목록 |

## 주요 component

| 폴더 | 파일 | 역할 |
| --- | --- | --- |
| `components/entry/` | `EntryGate.tsx`, `SecretEyeLogo.tsx`, `PyramidGate.tsx` | Entry Gate 상태, SVG 로고, 벽돌 벽 |
| `components/auth/` | `AuthPanels.tsx` | Login / Signup / Verify / Forgot 패널 (UI 전용) |
| `components/navigation/` | `TopNavigation.tsx` | 모든 디렉터리 페이지 공통 상단 메뉴 + 검색 input(UI 전용) |
| `components/directory/` | `HomeIntro.tsx`, `CategoryPage.tsx` | HOME / 카테고리 목록 레이아웃 |
| `lib/` | `sites.ts` | 사이트 목록 데이터(임시) + 카테고리 소개 문구 |
| `styles/` | `tokens.css`, `globals.css`, `animations.css` | 디자인 토큰 / 레이아웃·컴포넌트 스타일 / Entry 전환 애니메이션 |

## 어디를 수정하면 무엇이 바뀌는가

| 바꾸고 싶은 것 | 수정 위치 |
| --- | --- |
| 색, 선 두께용 투명도, 공통 치수 | `styles/tokens.css` |
| 사이트 목록(이름/URL/설명/태그) | `lib/sites.ts` |
| 카테고리 소개 headline | `lib/sites.ts` 의 `INTROS` |
| 상단 메뉴 항목 | `components/navigation/TopNavigation.tsx` 의 `LINKS` |
| HOME 문구 / 3열 구조 | `components/directory/HomeIntro.tsx` + `styles/globals.css` 의 `/* ----- home ----- */` |
| 카테고리 페이지 row 구조 | `components/directory/CategoryPage.tsx` + `styles/globals.css` 의 `/* ----- detail pages ----- */` |
| Entry 전환 단계 길이 | `components/entry/EntryGate.tsx` 의 `STEP_MS` **+** `styles/animations.css` |
| 벽돌 회전 각도/속도/stagger | `components/entry/PyramidGate.tsx` 상단 상수, `styles/animations.css` 의 `brick-open` |
| 로그인/가입 폼 문구·검증 | `components/auth/AuthPanels.tsx` |
| 로그인 후 전환 시작 시점 | `EntryGate.tsx` 의 `handleEnter()` |

## SKILL 문서

- [architecture](architecture/SKILL.md) — 구조, route, component 관계, 이동 흐름
- [design](design/SKILL.md) — 색/타이포/간격/스타일 규칙, 금지 디자인
- [animation](animation/SKILL.md) — Entry Gate 전환 애니메이션 상세
- [auth](auth/SKILL.md) — 인증 UI 현황 (STATUS: UI ONLY)
- [navigation](navigation/SKILL.md) — 공통 상단 메뉴
- [data](data/SKILL.md) — 사이트 목록 데이터 구조
- [troubleshooting](troubleshooting/SKILL.md) — 확인된 문제 기록
- [conventions](conventions/SKILL.md) — 작업 규칙

프로젝트 현황은 루트의 [`PROJECT_STATUS.md`](../PROJECT_STATUS.md), 변경 내역은 [`CHANGELOG.md`](../CHANGELOG.md).

## 처음 읽는 순서

1. architecture
2. design
3. animation
4. auth
5. navigation / data
6. troubleshooting
7. conventions

> 주의: 이 프로젝트의 Next.js는 학습 데이터와 다른 버전이다(`AGENTS.md`). 코드를 쓰기 전에 `node_modules/next/dist/docs/` 의 관련 문서를 확인한다.
