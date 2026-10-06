# GLOBAL VIDEO BACKGROUND

사용자가 제공한 dark fog MP4를
사이트 전체의 고정 background video로 사용한다.

중요:
각 페이지마다 video를 따로 렌더링하지 않는다.

영상은 root layout 수준에서 한 번만 mount되어야 한다.

즉:

/home
/data
/design
/tools
/account

등으로 이동해도
background video가 처음부터 다시 재생되면 안 된다.

---

## COMPONENT

공통 component:

components/background/BackgroundVideo.tsx

형태로 분리한다.

root app/layout.tsx에서
모든 page content 뒤에 한 번만 렌더링한다.

---

## VIDEO

파일 경로 예:

public/media/dark-fog-loop.mp4

video 설정:

autoPlay
muted
playsInline
loop
preload="auto"

audio는 사용하지 않는다.

---

## POSITION

background video:

position: fixed
inset: 0
width: 100vw
height: 100vh
object-fit: cover
z-index: -2
pointer-events: none

페이지 scroll과 무관하게
viewport 전체를 항상 채운다.

---

## DARK OVERLAY

영상 바로 위에 dark overlay를 둔다.

예:

background:
rgba(0,0,0,0.45)

또는 현재 페이지 가독성에 맞게
0.35 ~ 0.55 범위에서 조정.

overlay:

position: fixed
inset: 0
z-index: -1
pointer-events: none

기존 텍스트 가독성을 유지해야 한다.

---

## SEAMLESS LOOP

중요:

단순 HTML video loop만으로
30초 끝에서 시작으로 순간적으로 튀어 보이면 안 된다.

원본 영상의:

마지막 약 1.5~2초
+
처음 약 1.5~2초

를 crossfade한
seamless loop용 mp4를 사용한다.

최종 결과에서:

영상 끝
→ 영상 시작

전환이 육안으로 거의 느껴지지 않아야 한다.

단순 cut 방식 금지.

---

## ROUTE CHANGE

Next.js 페이지 이동 시
video element를 remount하지 않는다.

route별 component 안에 video를 넣지 않는다.

root layout의 persistent background로 유지한다.

페이지를 이동해도
현재 video playback time이 계속 이어져야 한다.

---

## PERFORMANCE

영상이 UI보다 무거워지지 않게 한다.

- muted
- preload="auto"
- object-fit cover
- background only
- unnecessary React state 금지
- requestAnimationFrame 기반 효과 금지
- canvas/WebGL 금지

가능하면 web용으로 압축된 MP4 사용.

1080p 이상 원본이 너무 무겁다면
1920x1080 이하로 최적화 가능.

---

## MOBILE

모바일에서도 playsInline 사용.

모바일 성능이 너무 떨어질 경우에만
poster image fallback을 고려한다.

기본은 desktop/mobile 모두 video background.

---

## ACCESSIBILITY

prefers-reduced-motion 환경에서는
video를 정지시키거나 poster frame을 보여주는 fallback을 적용한다.

---

## IMPORTANT

기존:

- Entry Gate
- Auth
- Navigation
- card design
- admin mode
- search

기능을 수정하지 않는다.

이번 변경은
GLOBAL BACKGROUND VIDEO 시스템만 추가한다.