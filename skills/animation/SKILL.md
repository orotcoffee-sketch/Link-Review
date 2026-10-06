# Animation — Entry Gate

대상: `/` 에서 **mock LOGIN 성공 후** 실행되는 전환 (eye blink → 피라미드 → 벽돌 → 통로 → `/home`). 입장 시의 로고 등장 연출(로고 fade-in, 선 그리기)도 여기서 다룬다.

## 관련 파일

| 파일 | 역할 |
| --- | --- |
| `components/entry/EntryGate.tsx` | `phase` 상태 머신, `STEP_MS`, `handleEnter()`, `router.push("/home")` |
| `components/entry/SecretEyeLogo.tsx` | SVG: 삼각형, 눈, 동공, 눈꺼풀(`.lid-up/.lid-down`), 피라미드 면(`.pyr-faces`) |
| `components/entry/PyramidGate.tsx` | 벽돌 28개 생성, 회전 방향/각도/이동량/delay 계산 |
| `styles/animations.css` | `[data-phase]` 규칙, keyframes, reduced-motion |
| `styles/globals.css` | 입장 연출(`logo-in` 사용 규칙, `.eye-draw` 등), 로고 위치(`--logo-top`), `--u` |

## 상태 흐름

`EntryGate.tsx`: `type Phase = "idle" | "eyeBlink" | "pyramidGrow" | "brickForm" | "brickOpen" | "cameraPush" | "exiting"`

```
idle ─handleEnter()─▶ eyeBlink ─▶ pyramidGrow ─▶ brickForm ─▶ brickOpen ─▶ cameraPush ─▶ exiting ─▶ router.push("/home")
```

- `useEffect([phase])` 하나가 `STEP_MS[phase]` 후 다음 단계로 넘긴다(`nextPhase()`). `exiting` 이 끝나면 `router.push("/home")`.
- `phase` 는 `<main className="gate" data-phase={phase}>` 로 CSS 에 전달된다. **모든 시각 효과는 `data-phase` 선택자로 구동**되고 JS 는 타이머만 관리한다.
- `/home` 은 `exiting` 타이머가 끝난 **뒤에만** 열린다 (전환 시작 후 약 3.2초; 실측 약 3.3~3.4초).
- 중복 실행 방지: `isTransitioning = phase !== "idle"` 이면 `handleEnter()` 가 즉시 return.
- reduced motion: `nextPhase()` 가 `eyeBlink` 다음에 바로 `exiting` 으로 건너뛴다.

## 단계별 타이밍 (`STEP_MS`, 합계 3200ms)

| 단계 | ms | 누적 시작 | 무엇이 보이는가 | 구동 위치 (`styles/animations.css`) |
| --- | --- | --- | --- | --- |
| `eyeBlink` | 300 | 0 | 위/아래 눈꺼풀이 눈을 덮었다 열림, 동공 opacity 1→0→1, 입력 UI fade out(150ms) | `.eye-eye .lid`, `@keyframes lid-blink`, `pupil-blink` |
| `pyramidGrow` | 500 | 300 | 로고 1→1.45배, 좌/우/하단 면과 중앙 depth line fade in | `.gate[data-phase="pyramidGrow"] .gate-logo-inner` (scale + transition), `.pyr-faces` |
| `brickForm` | 350 | 800 | SVG 가 사라지고 벽돌이 아랫줄부터 생성, 검은 판 fade in | `.brick` `brick-in`, `.pg-plane`, `.eye-logo` opacity |
| `brickOpen` | 1050 | 1150 | 중앙부터 벽돌이 pivot 회전하며 열림 + 장면 1.45→2.6배 | `.brick` `brick-open`, `.gate-logo-inner` scale |
| `cameraPush` | 650 | 2200 | 2.6→2.91배(×1.12), 검은 타원(`.gate-void`)이 화면 전체로 확대 | `.gate-logo-inner` transition, `.gate-void` `void-grow` |
| `exiting` | 350 | 2850 | `.gate` 전체 opacity 1→0 | `.gate[data-phase="exiting"]` |

벽돌 개별 `brick-open` 은 `delay(0~약 650ms) + 800ms` 이므로 `brickOpen` 이 끝난 뒤 `cameraPush` 도중에 끝난다 (같은 animation 선택자가 `brickOpen|cameraPush|exiting` 에 걸려 있어 이어서 재생된다).

## 벽돌 구조 (`PyramidGate.tsx`)

- `ROWS = 7`: 위에서 r번째 줄에 r+1개 → 28개. 줄마다 이음새가 반 칸씩 엇갈려 돌벽처럼 보인다. 위치는 `--l`, `--t`(%) CSS 변수.
- 각 벽돌의 CSS 변수: `--rx --ry`(회전), `--tx --ty`(이동, `calc(Npx * var(--u))`), `--delay`(열림 시작), `--in`(생성 시작), `--a`(면 투명도 0.10~0.20).
- 방향: 맨 윗줄 → 위로(rotateX), 맨 아랫줄 → 아래로(rotateX), 나머지 → 좌/우로(rotateY). 중앙 열(xoff=0)은 줄 번호 홀짝으로 좌우 번갈아.
- 열리는 순서(`dist`): `|가로 오프셋| + 0.35·|줄 − 중앙줄| + (위/아래 벽돌이면 +1.2)` → 중앙 → 좌우 → 바깥 → 위/아래.
- 두께: `.brick::before`(오른쪽 면), `.brick::after`(윗면), `transform-style: preserve-3d`, `.pg { perspective: 1000px }`.
- `--u`(= 로고 크기 비율: desktop 1, ≤640px 0.706)는 `styles/globals.css` 의 `.gate` 에 정의되어 이동량을 모바일에서 줄인다.

## 무엇을 바꾸려면 어디를 수정하나

| 하고 싶은 것 | 수정 위치 |
| --- | --- |
| **벽돌 회전 속도만 변경** | `styles/animations.css` 의 `.gate:is([data-phase="brickOpen"], …) .brick { animation: brick-open 800ms … }` 의 `800ms` (그리고 아래 주의 참고) |
| 벽돌이 열리는 간격(파동 속도) | `PyramidGate.tsx` 의 `STAGGER_MS` (현재 115) |
| 회전 각도 / 이동 거리 | `PyramidGate.tsx` 의 `ry`, `tx`(좌우), `rx`, `ty`(위아래) 수식 |
| 벽돌 개수 / 모양 | `PyramidGate.tsx` 의 `ROWS` (CSS `.brick` 의 `calc(100% / 7 - 1px)` 의 `7` 도 같이) |
| 벽돌 생성 속도 | `FORM_STEP_MS`(줄 간격), `animations.css` 의 `brick-in 170ms` |
| 벽돌 색/두께 | `animations.css` 의 `.brick`, `.brick::before/::after`; 투명도는 `PyramidGate.tsx` 의 `--a` |
| 전체 길이/단계 길이 | `EntryGate.tsx` 의 `STEP_MS` **그리고** `animations.css` 의 해당 duration (아래 주의) |
| 피라미드 확대 배율 | `animations.css` `scale(1.45)` (grow), `scale(2.6)` (open 중 dolly), `scale(2.91)` (push) |
| 통로가 얼마나 넓게 열리나 | `PyramidGate.tsx` 의 `tx`(바깥 벽돌 이동량), `animations.css` 의 `scale(2.6)` |
| 어둠이 퍼지는 속도/크기 | `animations.css` 의 `.gate-void`, `@keyframes void-grow` (끝 scale 4.2) |
| 눈 깜빡임 속도 | `animations.css` 의 `lid-blink 300ms`, `pupil-blink 300ms` + `STEP_MS.eyeBlink` |
| 피라미드 면 모양/색 | `SecretEyeLogo.tsx` 의 `.pyr-faces` polygon / fill |
| 전환 시작 시점(로그인 성공) | `EntryGate.tsx` 의 `handleEnter()` 호출부 (`LoginPanel onLogin`) |
| 입장 연출(로고 등장, 선 그리기) | `styles/globals.css` 의 `.gate-logo-inner`, `.eye-draw`, `.eye-rays`, `.eye-pupil`, `.gate-label`, `.gate-form` 과 `animations.css` 의 `logo-in/draw/fade-in/rise-in` keyframes |

### 주의: 시간이 두 곳에 있다

단계 길이는 JS(`STEP_MS`)와 CSS(duration/transition)에 **각각** 적혀 있다. CSS 만 바꾸면 효과가 다음 단계에 잘리거나 남는다. 단계를 늘리면 `STEP_MS` 도 같이 늘린다. `brickOpen` 구간의 벽돌 개별 애니메이션은 `STEP_MS.brickOpen` 보다 길어도 되지만(이어서 재생), `exiting` 이 끝나기 전에 끝나야 한다.

## reduced motion

`styles/animations.css` 맨 아래 `@media (prefers-reduced-motion: reduce)`: 로고 scale 없음, 입장 연출은 단순 fade, `.gate-void` 숨김. JS 쪽은 `eyeBlink`(300) → `exiting`(350, CSS 는 200ms fade) → `/home`. 이 블록은 같은 specificity 의 앞선 규칙을 덮어쓰므로 파일 맨 뒤에 있어야 한다.

## 인증 전환 애니메이션 (view 전환, 별개)

`ACCESS` / 패널 간 이동은 `phase` 가 아니라 `view` 상태. `go(next)` 가 현재 view 를 120ms(`VIEW_OUT_MS`) fade out(`.is-out`) 후 교체하고 새 패널은 `panel-in` 220ms 로 나타난다 (`styles/globals.css` Auth 블록, `animations.css` 의 `@keyframes panel-in`). 로고는 `.gate:not([data-view="entry"])` 규칙으로 위로 올라가 0.72배 / opacity 0.8, 전환 시작(`data-phase` ≠ idle)하면 다시 중앙으로 복귀한다.
