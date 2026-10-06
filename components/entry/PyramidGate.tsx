import type { CSSProperties } from "react";

// 피라미드 표면을 이루는 벽돌 벽.
// 위에서부터 r번째 줄에 r+1개의 벽돌을 두면, 줄마다 이음새가 반 칸씩 엇갈려
// 돌벽처럼 staggered 패턴이 된다 (1+2+...+7 = 28개).
const ROWS = 7;
const CENTER_ROW = (ROWS - 1) / 2;
const MAX_OFFSET = (ROWS - 1) / 2; // 맨 아랫줄 가장 바깥 벽돌의 중심 오프셋
const STAGGER_MS = 115; // 중앙에서 한 칸 멀어질 때마다 늘어나는 delay
const FORM_STEP_MS = 28; // 아랫줄부터 차례로 생성되는 간격

type Kind = "left" | "right" | "up" | "down";

function buildBricks() {
  const size = 100 / ROWS;
  const bricks: { key: string; style: CSSProperties }[] = [];

  for (let r = 0; r < ROWS; r++) {
    const n = r + 1;
    for (let c = 0; c < n; c++) {
      const xoff = c - (n - 1) / 2; // 중앙 기준 가로 오프셋(벽돌 단위)
      const ax = Math.abs(xoff) / MAX_OFFSET; // 0(중앙) ~ 1(가장 바깥)
      const jitter = (r * 5 + c * 3) % 4; // 0..3, 결정적 변주

      // 맨 윗줄은 위로, 맨 아랫줄은 아래로, 나머지는 좌/우로 회전한다.
      let kind: Kind;
      if (r === 0) kind = "up";
      else if (r === ROWS - 1) kind = "down";
      else if (xoff < 0) kind = "left";
      else if (xoff > 0) kind = "right";
      else kind = r % 2 ? "right" : "left";

      // 중앙 → 좌우 → 바깥 → 위/아래 순서로 열린다.
      const dist =
        Math.abs(xoff) +
        0.35 * Math.abs(r - CENTER_ROW) +
        (kind === "up" || kind === "down" ? 1.2 : 0);

      let rx = 0;
      let ry = 0;
      let tx = 0;
      let ty = 0;
      if (kind === "left" || kind === "right") {
        const dir = kind === "left" ? -1 : 1;
        ry = dir * (76 + 22 * (1 - ax) + jitter * 0.7); // 76 ~ 100deg
        tx = dir * (24 + 34 * ax); // 24 ~ 58px
      } else {
        const dir = kind === "up" ? -1 : 1;
        rx = -dir * (62 + jitter * 9); // 62 ~ 89deg
        ty = dir * (22 + jitter * 8); // 22 ~ 46px
      }

      bricks.push({
        key: `${r}-${c}`,
        style: {
          "--l": `${50 + (xoff - 0.5) * size}%`,
          "--t": `${r * size}%`,
          "--a": (0.1 + ((r * 7 + c * 13) % 5) * 0.025).toFixed(3),
          "--rx": `${rx.toFixed(1)}deg`,
          "--ry": `${ry.toFixed(1)}deg`,
          "--tx": `calc(${tx.toFixed(1)}px * var(--u))`,
          "--ty": `calc(${ty.toFixed(1)}px * var(--u))`,
          "--delay": `${Math.round(dist * STAGGER_MS)}ms`,
          "--in": `${(ROWS - 1 - r) * FORM_STEP_MS}ms`,
        } as CSSProperties,
      });
    }
  }
  return bricks;
}

const BRICKS = buildBricks();

// 애니메이션은 EntryGate의 data-phase(brickForm / brickOpen ...)로 구동된다.
export default function PyramidGate() {
  return (
    <div className="pg" aria-hidden="true">
      <div className="pg-plane" />
      {BRICKS.map((b) => (
        <span key={b.key} className="brick" style={b.style} />
      ))}
    </div>
  );
}
