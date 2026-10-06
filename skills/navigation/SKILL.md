# Navigation

파일: `components/navigation/TopNavigation.tsx` (client component). 스타일: `styles/globals.css` 의 `.nav*`.

## 구조

```
<header class="nav">                       ← 전체 폭 + 아래 divider
  <div class="wrap nav-inner">             ← 높이 --nav-height(60px), 콘텐츠 폭 안
    <nav class="nav-links"> HOME DATA DESIGN TOOLS
    <div class="nav-search"> SEARCH + [🔍 Search...]
```

## 메뉴

`TopNavigation.tsx` 상단의 `LINKS` 배열: `HOME → /home`, `DATA → /data`, `DESIGN → /design`, `TOOLS → /tools`.
항목을 추가/변경하려면 이 배열만 고친다 (해당 route 의 `app/<name>/page.tsx` 도 필요).
현재 페이지는 `usePathname()` 이 `href` 와 같을 때 `aria-current="page"` → CSS 가 gold 로 표시 (`.nav-link[aria-current="page"]`).

## 사용하는 곳

`components/directory/HomeIntro.tsx`, `components/directory/CategoryPage.tsx` 가 각각 `<TopNavigation />` 을 렌더링한다. Entry Gate(`/`)에는 없다. 새 디렉터리형 페이지를 만들면 같은 컴포넌트를 쓰고 메뉴 코드를 복사하지 않는다.

## 검색 (UI ONLY)

- `SEARCH` 라벨 + 돋보기 SVG 가 들어간 `<input type="text" aria-label="Search">`.
- **form/submit/filter/API 가 없다.** 입력해도 아무 일도 일어나지 않는다. state 도 저장하지 않는다.
- 실제 검색을 만들 때는 이 컴포넌트 안에서 input 을 제어 컴포넌트로 바꾸고 검색 로직은 별도 모듈(예: `lib/`)로 분리한다. 데이터 출처는 [data](../data/SKILL.md).

## 스타일 수정

- 글자 크기: `--font-nav` (`styles/tokens.css`), 간격 `.nav-links { gap: 32px }`, 높이 `--nav-height`.
- 검색창 크기: `.nav-search-box` (240×38px). 모바일(≤760px)에서는 줄바꿈되고 170px.
