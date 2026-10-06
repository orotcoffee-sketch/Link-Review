"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SecretEyeLogo from "./SecretEyeLogo";
import PyramidGate from "./PyramidGate";
import {
  ForgotPanel,
  LoginPanel,
  ResetPasswordPanel,
  SignupPanel,
  VerifyPanel,
} from "@/components/auth/AuthPanels";
import type { AuthView } from "@/components/auth/AuthPanels";

type Phase =
  | "idle"
  | "eyeBlink"
  | "pyramidGrow"
  | "brickForm"
  | "brickOpen"
  | "cameraPush"
  | "exiting";

// 각 단계 길이(ms). styles/animations.css의 [data-phase] 애니메이션/transition 길이와 맞춰야 한다.
// 합계 3200ms. (벽돌 개별 애니메이션은 brickOpen 이후 cameraPush 중에도 이어서 끝난다.)
const STEP_MS: Record<Exclude<Phase, "idle">, number> = {
  eyeBlink: 300,
  pyramidGrow: 500,
  brickForm: 350,
  brickOpen: 1050,
  cameraPush: 650,
  exiting: 350,
};

const ORDER: Phase[] = [
  "idle",
  "eyeBlink",
  "pyramidGrow",
  "brickForm",
  "brickOpen",
  "cameraPush",
  "exiting",
];

// reduced motion에서는 eyeBlink 뒤 바로 exiting(짧은 fade)으로 건너뛴다.
function nextPhase(phase: Phase, reduced: boolean): Phase {
  if (reduced && phase === "eyeBlink") return "exiting";
  return ORDER[ORDER.indexOf(phase) + 1];
}

// view 전환(fade out → fade in) 중 이전 view가 사라지는 시간(ms)
const VIEW_OUT_MS = 120;

export default function EntryGate({
  initialView = "entry",
  initialError = "",
}: {
  initialView?: AuthView;
  initialError?: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [view, setView] = useState<AuthView>(initialView);
  const [viewLeaving, setViewLeaving] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const reduced = useRef(false);
  const viewTimer = useRef<number | undefined>(undefined);
  const isTransitioning = phase !== "idle";

  // 로그인 성공 이후의 eye / pyramid gate 애니메이션 시작점.
  // LoginPanel이 signInWithPassword 성공 후에만 호출한다.
  function handleEnter() {
    if (isTransitioning) return;
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPhase("eyeBlink");
  }

  // 단계 전환은 이 effect 하나에서만 관리한다. exiting이 끝나면 /home으로 이동.
  useEffect(() => {
    if (phase === "idle") return;
    const t = window.setTimeout(() => {
      if (phase === "exiting") {
        router.push("/home");
      } else {
        setPhase(nextPhase(phase, reduced.current));
      }
    }, STEP_MS[phase]);
    return () => window.clearTimeout(t);
  }, [phase, router]);

  useEffect(() => () => window.clearTimeout(viewTimer.current), []);

  // 현재 view를 fade out 한 뒤 다음 view로 바꾼다 (새 view는 마운트 시 fade in).
  function go(next: AuthView) {
    if (isTransitioning || viewLeaving) return;
    setViewLeaving(true);
    viewTimer.current = window.setTimeout(() => {
      setView(next);
      setViewLeaving(false);
    }, VIEW_OUT_MS);
  }

  const out = viewLeaving ? " is-out" : "";

  return (
    <main className="gate" data-phase={phase} data-view={view}>
      <div className="gate-logo">
        <div className="gate-logo-inner">
          <SecretEyeLogo />
          <PyramidGate />
        </div>
      </div>

      {view === "entry" && (
        <div className={`gate-lower${out}`}>
          <div className="gate-label">
            <p className="gate-title">CLASSIFIED ARCHIVE</p>
            <p className="gate-sub">ACCESS REQUIRED</p>
          </div>

          <div className="gate-form">
            <button
              className="gate-enter"
              type="button"
              disabled={isTransitioning}
              onClick={() => go("login")}
            >
              ACCESS
            </button>
          </div>
        </div>
      )}

      {view !== "entry" && (
        <div className={`gate-panel${out}`} key={view}>
          {view === "login" && (
            <LoginPanel
              go={go}
              onLogin={handleEnter}
              initialError={initialError}
            />
          )}
          {view === "signup" && (
            <SignupPanel
              go={go}
              onSubmitted={(email) => {
                setVerifyEmail(email);
                go("verify");
              }}
            />
          )}
          {view === "verify" && <VerifyPanel go={go} email={verifyEmail} />}
          {view === "forgot-password" && <ForgotPanel go={go} />}
          {view === "reset-password" && <ResetPasswordPanel go={go} />}
        </div>
      )}

      <p className="gate-footer">AUTHORIZED ACCESS ONLY</p>
      <div className="gate-void" aria-hidden="true" />
    </main>
  );
}
