# Data

DB/API 가 없다. 사이트 목록은 **임시(mock) 데이터** 이며 `lib/sites.ts` 한 파일에 있다. 설명/태그는 임의로 채운 값이다.

## 구조 (`lib/sites.ts`)

```ts
type Site = { name: string; url: string; desc: string; tag: string };
type CategoryKey = "data" | "design" | "tools";
SITES: Record<CategoryKey, Site[]>          // 카테고리별 목록 (현재 각 6개)
INTROS: Record<CategoryKey, [string, string]> // 카테고리 페이지 headline 두 줄
```

## 어디에서 쓰이나

| 사용처 | 사용 방식 |
| --- | --- |
| `components/directory/HomeIntro.tsx` | 각 카테고리 `SITES[key].slice(0, 5)` — HOME 에는 **앞의 5개만** 표시. 번호는 배열 순서 |
| `components/directory/CategoryPage.tsx` | `SITES[category]` 전부, `INTROS[category]` 로 headline, 개수로 `NN SOURCES`. 10개 초과면 `.dir-list-2`(≥1100px 2열) |

## 수정 방법

- 사이트 추가: 해당 카테고리 배열에 객체 추가. 순서가 곧 번호이고 HOME 에는 앞 5개가 보인다.
- 필드 이름: `name` 은 대문자 표기, `desc` 는 한 줄 영어, `tag` 는 오른쪽 라벨(대문자 한 단어).
- 카테고리 추가: `CategoryKey`, `SITES`, `INTROS` 에 키 추가 + `app/<key>/page.tsx` + `TopNavigation` 의 `LINKS` + `HomeIntro` 의 `SECTIONS`.
- 항목 링크는 외부 URL 을 새 탭으로 연다 (`target="_blank" rel="noopener noreferrer"`).
- 이름은 React `key` 로 쓰이므로 같은 카테고리 안에서 중복되지 않게 한다.

## 아직 없는 것

DB, API, 검색/필터, 정렬, 즐겨찾기, 관리자 편집 기능. 추가하려면 먼저 이 문서와 `PROJECT_STATUS.md` 를 갱신한다.
