# Design

값의 출처는 `styles/tokens.css`. 새 색/치수를 컴포넌트에 직접 쓰지 말고 토큰을 추가해서 `var(--...)` 로 쓴다.

## 색상 토큰 (현재 코드 값)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-bg` | `#080808` | 배경 |
| `--color-text` | `#f2efe7` | primary text |
| `--color-muted` | `rgba(242,239,231,0.48)` | secondary text, 비활성 메뉴, 번호 |
| `--color-placeholder` / `-strong` | `rgba(242,239,231,0.25)` / `0.35` | placeholder |
| `--color-accent` | `#c8a96a` | gold accent |
| `--color-accent-rgb` | `200 169 106` | 알파가 필요할 때: `rgb(var(--color-accent-rgb) / 0.4)` |
| `--color-divider` | `rgba(255,255,255,0.09)` | 목록/상단바 구분선 |
| `--color-border` | `rgba(255,255,255,0.12)` | 검색 input 테두리 |
| `--color-border-focus` | `rgba(255,255,255,0.28)` | 검색 input focus |
| `--color-line-strong` | `rgba(255,255,255,0.18)` | auth input 밑줄 |
| `--color-hover` | `rgba(255,255,255,0.025)` | 목록 row hover 배경 |
| `--color-error` | `#c9786a` | 검증 오류 문구/밑줄 |
| `--color-void` | `#000` | Entry 전환의 검은 통로 |

예외: `components/entry/SecretEyeLogo.tsx` 의 SVG 속성(`stroke="#C8A96A"`, 눈꺼풀 `fill="#090908"` 등)은 `var()` 를 쓸 수 없어 리터럴이다. 색을 바꾸면 이 파일도 같이 바꾼다. `styles/globals.css` 의 vignette(`rgba(0,0,0,0.55)`)도 리터럴이다.

## Typography

- 폰트: Geist Sans (`--font-geist-sans`, `app/layout.tsx`), fallback Arial.
- 토큰: `--font-nav` 14px, `--font-home-lead` 48px, `--font-home-name` 20px, `--font-cat-headline` 40px, `--font-dir-name` 22px. 나머지 크기는 해당 규칙 안에 직접 적혀 있다.
- 대문자 + letter-spacing 이 기본 어조. 메뉴 0.1em, 제목류 0.3em, 버튼 0.22em, 목록 이름 0.05~0.06em.
- 작은 라벨은 10~12px, 목록 이름 20~22px, 소개 문구 40~48px. **tiny typography 금지** (본문성 텍스트는 13px 미만으로 줄이지 않는다).

## Spacing / layout

- 콘텐츠 폭: `.wrap` = `calc(100% - var(--content-gutter))` (64px), `max-width: var(--content-max)` (1520px), 가운데 정렬. 모바일(≤760px)은 `calc(100% - 32px)`.
- 상단바 높이 `--nav-height` 60px, 아래 1px divider.
- 목록 row: HOME 54px, 카테고리 페이지 min-height 92px. row 사이에는 divider 만 사용.
- 세로 여백은 `clamp(…vh…)` 로 화면 높이에 비례 (`.page-body`, `.home-lead`, `.cat-intro`).

## Navigation 스타일

`.nav`, `.nav-link`, `.nav-search-*` (`styles/globals.css`). 비활성 `--color-muted`, hover `--color-text`, 현재 페이지 `--color-accent` (`aria-current="page"`). 밑줄 애니메이션/버튼 배경 없음. 검색 input 240×38px, radius 2px, 돋보기 SVG 포함.

## HOME 스타일

`.home-lead` (최대 760px, 48px, line-height 1.12) 아래 `.home-cols` 3열 동일 폭. 열 사이 세로 divider 만, 카드 없음. 항목은 번호(muted) + 이름(text, hover 시 accent). 하단 `VIEW … →` 링크.

## DATA / DESIGN / TOOLS 상세

`.cat-intro` (제목 14px 자간 0.3em, headline 40px, 우측 `NN SOURCES`) + 전체 폭 `.dir-list`. row 는 grid `72px | 1fr | 160px | 28px` = 번호 / 이름+설명 / 태그 / hover 화살표. 10개 초과 시 ≥1100px 에서 `.dir-list-2` 2열.

## Input 스타일 (auth)

`.auth-input`: 투명 배경, border 없음, `border-bottom: 1px solid var(--color-line-strong)`, 높이 44px, focus 시 밑줄 accent, 오류 시 `--color-error`. 라벨 `.auth-label` 10px. 버튼은 박스가 아닌 텍스트(`.auth-submit`, gold, hover 시 opacity .65 + letter-spacing 증가). 크롬 autofill 배경은 `:-webkit-autofill` 로 덮어쓴다.

## 사용 금지 디자인

neon, glitch, Matrix 코드, glassmorphism, 큰 rounded card, dashboard 스타일, 과한 gradient(현재 gradient 는 Entry 배경의 아주 약한 radial/vignette 뿐), 거대한 빈 hero, tiny typography, 흰색 card, 아이콘 남발(돋보기 하나만 사용), 화면 흔들림, 일반 SaaS 로그인 카드.
