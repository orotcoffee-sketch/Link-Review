# Architecture

## 스택

- Next.js 16.3.8 (App Router), React 19.2.8, TypeScript, ESLint. Tailwind v4가 설치되어 있고 `styles/globals.css` 에서 `@import "tailwindcss"` 하지만 **클래스는 거의 쓰지 않고 일반 CSS 클래스**로 스타일링한다.
- 추가 라이브러리 없음 (애니메이션 라이브러리, Three.js, Supabase 등 모두 미사용).
- path alias: `@/*` → 프로젝트 root (`tsconfig.json`).

## 디렉터리

```
app/
  layout.tsx          # 폰트(Geist), metadata, CSS import 순서(tokens → globals → animations)
  page.tsx            # "/"      → EntryGate
  home/page.tsx       # "/home"  → HomeIntro
  data/page.tsx       # "/data"  → CategoryPage category="data"
  design/page.tsx     # "/design"
  tools/page.tsx      # "/tools"
components/
  entry/              # EntryGate, SecretEyeLogo, PyramidGate
  auth/               # AuthPanels
  navigation/         # TopNavigation
  directory/          # HomeIntro, CategoryPage
lib/sites.ts          # 목록 데이터
styles/               # tokens.css, globals.css, animations.css
skills/               # 이 문서들
```

`app/*/page.tsx` 는 얇은 파일이다(컴포넌트 하나를 렌더링).

## component 관계

```
app/page.tsx ── EntryGate (client, 상태: phase / view / verifyEmail)
                 ├─ SecretEyeLogo     (SVG: 삼각형, 눈, 눈꺼풀, 피라미드 면)
                 ├─ PyramidGate       (벽돌 28개 + 검은 판; 서버/클라이언트 어느 쪽에서도 렌더 가능)
                 └─ AuthPanels        (LoginPanel / SignupPanel / VerifyPanel / ForgotPanel)

app/home/page.tsx ── HomeIntro ─┬─ TopNavigation (client, usePathname)
app/{data,design,tools}/page.tsx ─ CategoryPage ─┘
HomeIntro, CategoryPage ── lib/sites.ts (SITES, INTROS)
```

- `TopNavigation` 은 `HomeIntro` 와 `CategoryPage` 가 각각 렌더링한다(공유 layout 파일은 없다).
- `EntryGate` 만 `"use client"` 상태 머신을 가진다. 디렉터리 페이지는 서버 컴포넌트(`TopNavigation` 만 client).

## 페이지 이동 흐름

```
/  (view=entry)
 └ ACCESS ─────────────▶ view=login
      ├ CREATE ACCOUNT ─▶ view=signup ── (검증 통과) ─▶ view=verify ── BACK TO LOGIN ─▶ login
      ├ FORGOT PASSWORD ▶ view=forgot-password ── BACK TO LOGIN ─▶ login
      └ LOGIN(mock) ─▶ handleEnter() ─▶ phase 전환(약 3.2초) ─▶ router.push("/home")

/home ⇄ /data ⇄ /design ⇄ /tools   (TopNavigation 의 <Link>, 항상 서로 이동 가능)
/home 의 "VIEW DATA →" 등 ─▶ /data, /design, /tools
```

- `/home` 등에서 `/` 로 돌아가는 링크는 없다.
- 목록의 사이트 항목은 외부 URL 을 새 탭(`target="_blank"`)으로 연다.

## 상태 두 개 (EntryGate)

- `view: AuthView` — 어떤 화면인지(`entry | login | signup | verify | forgot-password`). 전환은 `go(next)`.
- `phase: Phase` — 로그인 성공 후 전환 애니메이션 단계. 자세한 내용은 [animation](../animation/SKILL.md).

두 상태는 `<main className="gate" data-phase data-view>` 속성으로 CSS 에 전달된다.

## CSS 로딩 순서 (중요)

`app/layout.tsx` 에서 `tokens.css` → `globals.css` → `animations.css` 순서로 import 한다.
`animations.css` 는 `globals.css` 의 같은 specificity 규칙을 **덮어쓰도록 뒤에 와야** 한다 (reduced-motion 규칙 포함). 순서를 바꾸지 않는다.
