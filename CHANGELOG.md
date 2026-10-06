# Changelog

## 2026-10-06

### Added
- Entry Gate (`/`): SVG 눈 로고, 입장 연출, `ACCESS` 버튼.
- 인증 UI: Login / Signup(프론트 검증) / Verify email(mock) / Forgot password. 백엔드 없음.
- Entry 전환 애니메이션: eye blink → pyramid grow → brick form → brick open(3D 회전, 중앙부터 stagger) → camera push → `/home`.
- 공통 `TopNavigation`(HOME/DATA/DESIGN/TOOLS + 검색 input UI), 페이지 `/home` `/data` `/design` `/tools`.
- `lib/sites.ts` 임시 사이트 데이터.
- `skills/` 개발자 문서(architecture, design, animation, auth, navigation, data, troubleshooting, conventions), `PROJECT_STATUS.md`, `CHANGELOG.md`.
- `styles/tokens.css` (디자인 토큰).

### Changed
- 코드 구조 정리 (기능/디자인 변경 없음):
  - `components/` → `entry/`, `auth/`, `navigation/`, `directory/` 로 분류.
  - `app/globals.css` → `styles/globals.css`, Entry 전환 규칙/keyframes → `styles/animations.css`, 색·치수 → `styles/tokens.css` 의 CSS 변수. `app/layout.tsx` 의 CSS import 순서 지정.
  - 이전/이후 화면을 1440×900 에서 비교해 `/home` `/data` `/design` `/tools` 와 `/` 의 idle/login/signup 이 픽셀 단위로 동일함을 확인.
- `app/layout.tsx`: 제목 "Archive", `lang="ko"`.

### Fixed
- (해당 없음)
