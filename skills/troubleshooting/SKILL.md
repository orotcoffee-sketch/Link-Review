# Troubleshooting

확인된 문제만 기록한다. 새 문제를 만나면 아래 형식으로 **맨 아래에 추가**한다.

```
## Issue: <한 줄 제목>

증상:
재현 방법:
관련 파일:
원인:
현재 상태:
해결 방법:

---
```

---

## Issue: `next dev` 를 두 번 실행하면 시작되지 않음

증상: 두 번째 `next dev` 가 서버를 띄우지 않고 "You can access the existing server at http://localhost:3001 …" 와 같은 안내를 출력하고 종료. 지정한 포트(`-p`)로는 접속되지 않음.

재현 방법: 이미 `npm run dev` 가 실행 중인 상태에서 다른 터미널에서 `npx next dev -p <다른 포트>` 실행. (같은 포트를 지정하면 `EADDRINUSE`.)

관련 파일: `package.json` (`"dev": "next dev"`), `.next/dev/logs/next-development.log`.

원인: 같은 프로젝트에 dev 서버가 이미 떠 있으면 Next 가 새 서버를 만들지 않고 기존 서버 주소를 알려 준다.

현재 상태: 정상 동작(제약).

해결 방법: 기존 서버 주소(이 프로젝트에서는 `http://localhost:3001`)를 그대로 사용하거나, 안내에 나온 `taskkill /PID <pid> /F` 로 종료 후 다시 실행.

---

## Issue: Entry 전환에서 열린 통로가 기대(화면 30~45%)보다 좁음

증상: 벽돌이 열린 뒤 검은 통로의 폭이 1440px 화면 기준 대략 20~25% (이후 검은 타원이 화면 전체로 확대되어 가려짐).

재현 방법: `/` → ACCESS → LOGIN 후 `brickOpen` 단계(전환 시작 약 1.2~2.2초)를 관찰.

관련 파일: `components/entry/PyramidGate.tsx` (`tx`), `styles/animations.css` (`scale(2.6)`, `.pg`).

원인: 벽돌 벽이 로고 크기(약 112px 폭, `--logo` 기준)에서 시작하고, 열리는 폭은 벽돌 이동량(`tx`)과 장면 dolly 배율에 의해 결정된다. 회전 각도 90°를 넘는 벽돌은 `backface-visibility: hidden` 때문에 사라지고 얇은 선만 남는다.

현재 상태: 알려진 한계. 기능은 정상(전환 후 `/home` 이동).

해결 방법: 더 넓히려면 `PyramidGate.tsx` 에서 바깥 벽돌 `tx` 를 키우거나 `animations.css` 의 `brickOpen` 단계 `scale(2.6)` 을 키운다. 수정 후 `skills/animation/SKILL.md` 의 값도 갱신한다.

---

## Issue: 애니메이션 시간이 JS 와 CSS 두 곳에 있어 어긋나기 쉬움

증상: CSS duration 만 바꾸면 단계 사이에 어색하게 끊기거나 효과가 다음 단계 시작 때 잘림.

재현 방법: `styles/animations.css` 의 duration 만 수정하고 `EntryGate.tsx` 의 `STEP_MS` 는 그대로 둔다.

관련 파일: `components/entry/EntryGate.tsx` (`STEP_MS`), `styles/animations.css`.

원인: 단계 전환 타이머는 JS(`STEP_MS`), 실제 효과 길이는 CSS 에 따로 정의되어 있다.

현재 상태: 구조상 제약. 값은 현재 서로 일치한다.

해결 방법: 단계 길이를 바꿀 때는 `STEP_MS` 와 CSS 를 함께 수정한다 ([animation](../animation/SKILL.md) 참고).

---

## Issue: Windows 에서 git 이 "LF will be replaced by CRLF" 경고

증상: `git diff`/`git add` 시 `warning: in the working copy of '<file>', LF will be replaced by CRLF the next time Git touches it`.

재현 방법: Windows 환경에서 파일 수정 후 git 명령 실행.

관련 파일: 전체 소스 (줄바꿈 설정; `.gitattributes` 없음).

원인: `core.autocrlf` 설정과 LF 로 저장된 파일 사이의 줄바꿈 차이.

현재 상태: 경고일 뿐 동작에는 영향 없음.

해결 방법: 필요하면 `.gitattributes` 로 줄바꿈 정책을 통일한다 (현재는 미적용).

---
