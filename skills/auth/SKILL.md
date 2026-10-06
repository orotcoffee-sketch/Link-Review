# Auth

## STATUS: UI ONLY

백엔드 인증이 없다. 계정 생성, 로그인 검증, 이메일 발송, 세션이 **전혀 없다**. 화면 흐름과 입력 검증 UI 만 동작한다.

## 현재 구현

파일: `components/auth/AuthPanels.tsx` (패널), `components/entry/EntryGate.tsx` (view 전환), `styles/globals.css` 의 `/* ---------- Auth views … */` 블록.

| 화면 | component | 동작 |
| --- | --- | --- |
| Entry | `EntryGate` (`view="entry"`) | `ACCESS` 버튼 → `go("login")` |
| Login | `LoginPanel` | EMAIL(`type="email"`) + PASSWORD. LOGIN 은 **입력값을 검사하지 않고** `onLogin` 호출 → `EntryGate.handleEnter()` → Entry 전환 애니메이션 → `/home`. 하단 `FORGOT PASSWORD`, `CREATE ACCOUNT` |
| Signup | `SignupPanel` | NAME / EMAIL / PASSWORD / CONFIRM PASSWORD. 제출 시 프론트 검증, 통과하면 `onSubmitted(email)` → `view="verify"` |
| Verify | `VerifyPanel` | `VERIFY YOUR EMAIL`, 입력한 이메일 표시, `CHECK YOUR EMAIL`, `BACK TO LOGIN`. **메일은 보내지 않는다** |
| Forgot | `ForgotPanel` | EMAIL 검증 후 안내 문구만 표시. **전송 없음** |

- `AuthView = "entry" | "login" | "signup" | "verify" | "forgot-password"` (`AuthPanels.tsx` 에서 export).
- view 전환: `EntryGate.go(next)` (120ms fade out → view 교체 → 새 패널 `panel-in`). 전환 애니메이션 중에는 `go()` 가 무시된다.

### 프론트 검증 규칙 (SignupPanel, ForgotPanel)

| 필드 | 규칙 | 메시지 |
| --- | --- | --- |
| NAME | 공백 제외 1자 이상 | `Name is required.` |
| EMAIL | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `Enter a valid email address.` |
| PASSWORD | 8자 이상 | `Password must be at least 8 characters.` |
| CONFIRM | PASSWORD 와 동일 | `Passwords do not match.` |

오류는 첫 제출 후부터 표시되고(`submitted` state), 이후엔 입력할 때마다 다시 계산된다. 표시 위치는 `Field` 의 `.auth-error` (입력 바로 아래).

## 아직 구현 안 됨

- Supabase Auth (설치/연결 없음)
- 실제 이메일 인증 메일
- 실제 password reset
- 세션 관리 / 로그인 상태 유지 / 보호된 route (`/home` 등은 누구나 직접 접근 가능)
- username 로그인, 소셜 로그인, 휴대폰 인증, 관리자 기능

## 수정 위치

| 하고 싶은 것 | 위치 |
| --- | --- |
| 문구/라벨/placeholder | `AuthPanels.tsx` 각 패널 |
| 검증 규칙 | `AuthPanels.tsx` 의 `SignupPanel` `errors`, `EMAIL_RE` |
| 새 화면 추가 | `AuthView` 에 값 추가 → 패널 컴포넌트 작성 → `EntryGate.tsx` 의 렌더 분기 추가 |
| 로그인 성공 시 동작 | `EntryGate.tsx` 의 `handleEnter()` — 지금은 mock 이 직접 호출. 실제 인증을 붙일 때는 인증 성공 콜백에서 이 함수를 호출하는 위치(`LoginPanel` 의 `onLogin`)를 교체한다 |
| 스타일 | `styles/globals.css` Auth 블록 (`.auth-*`, `.gate-panel`) |
