# Project Status

마지막 갱신: 2026-10-06. (구조/동작은 `skills/` 문서 참고)

## DONE

- Entry Gate (`/`): 로고 등장 연출, `CLASSIFIED ARCHIVE / ACCESS REQUIRED`, `ACCESS` 버튼
- Eye of Providence SVG 로고 (`components/entry/SecretEyeLogo.tsx`)
- 인증 **UI** 흐름: Login / Signup(프론트 검증) / Verify(mock) / Forgot password (`components/auth/AuthPanels.tsx`) — 백엔드 없음
- Entry 전환 애니메이션: eye blink → 피라미드 확대 → 벽돌 구성 → 벽돌 회전 열림 → 카메라 push → `/home` (약 3.2초, `phase` 상태 머신)
- reduced-motion 대응 (eye blink → fade → `/home`)
- 공통 상단 navigation + 검색 input **UI** (`components/navigation/TopNavigation.tsx`)
- HOME (`/home`): 소개 문구 + DATA/DESIGN/TOOLS 3열 미리보기
- DATA / DESIGN / TOOLS (`/data`, `/design`, `/tools`): intro + 전체 폭 목록 (항목당 설명/태그)
- 사이트 목록 mock 데이터 (`lib/sites.ts`, 카테고리당 6개)
- 코드 구조 정리 (components 역할별 폴더, `styles/` 분리), `skills/` 문서, `CHANGELOG.md`

## IN PROGRESS

- (없음) — 단, 알려진 한계: 열린 통로 폭이 기대보다 좁음 (`skills/troubleshooting/SKILL.md`)

## PLANNED (미구현)

- 실제 인증 (Supabase Auth), 이메일 인증, 비밀번호 재설정, 세션 관리, route 보호
- 로그인 성공 시에만 Entry 전환 실행 (현재 mock LOGIN 은 입력과 무관하게 실행)
- 데이터베이스 / 실제 사이트 데이터 (현재는 임시 데이터)
- 검색 기능 (현재 input 은 동작하지 않음)

## 정리 대상 (미처리)

- `public/` 의 create-next-app 기본 svg (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)와 루트 `README.md` 는 기본 템플릿 그대로이며 코드에서 사용하지 않음.
