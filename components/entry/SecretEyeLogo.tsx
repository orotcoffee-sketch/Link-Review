const RAYS = [0, 35, -35, 70, -70].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  const [cx, cy] = [70, 26];
  const [r1, r2] = [13, 25];
  return {
    x1: cx + Math.sin(rad) * r1,
    y1: cy - Math.cos(rad) * r1,
    x2: cx + Math.sin(rad) * r2,
    y2: cy - Math.cos(rad) * r2,
  };
});

const EYE = "M44 84 Q70 66 96 84 Q70 102 44 84 Z";

// 전환 연출용 요소(eyelid / pyramid faces)는 EntryGate의 data-phase로 구동된다.
export default function SecretEyeLogo() {
  return (
    <svg
      className="eye-logo"
      viewBox="0 0 140 140"
      fill="none"
      stroke="#C8A96A"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="eye-clip">
          <path d={EYE} />
        </clipPath>
      </defs>

      <g className="eye-rays" strokeWidth="0.8">
        {RAYS.map((r, i) => (
          <line key={i} {...r} />
        ))}
      </g>

      {/* pyramid grow: 정면 삼각형에 좌/우/하단 면과 중앙 깊이선을 더해 입체로 보이게 한다 */}
      <g className="pyr-faces" strokeWidth="0.9">
        <polygon
          className="face-left"
          points="70,26 24,106 70,116"
          fill="rgba(200,169,106,0.10)"
        />
        <polygon
          className="face-right"
          points="70,26 70,116 116,106"
          fill="rgba(200,169,106,0.04)"
        />
        <polygon
          className="face-bottom"
          points="24,106 70,116 116,106"
          fill="rgba(200,169,106,0.02)"
        />
        <line className="face-ridge" x1="70" y1="26" x2="70" y2="116" />
      </g>
      <path
        className="eye-draw"
        pathLength={1}
        d="M70 26 L116 106 L24 106 Z"
        strokeWidth="1.2"
      />

      <g className="eye-eye">
        <path className="eye-draw" pathLength={1} d={EYE} strokeWidth="1" />
        <g className="eye-pupil">
          <circle cx="70" cy="84" r="8.5" strokeWidth="0.9" />
          <circle cx="70" cy="84" r="3.2" fill="#C8A96A" stroke="none" />
        </g>
        {/* eye blink: 위/아래 눈꺼풀이 눈 중앙을 덮었다가 열린다 */}
        <g clipPath="url(#eye-clip)">
          <g className="lid lid-up">
            <rect
              x="40"
              y="68"
              width="60"
              height="16"
              fill="#090908"
              stroke="none"
            />
            <line x1="40" y1="84" x2="100" y2="84" strokeWidth="1" />
          </g>
          <g className="lid lid-down">
            <rect
              x="40"
              y="84"
              width="60"
              height="16"
              fill="#090908"
              stroke="none"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
