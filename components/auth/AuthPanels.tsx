"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

// 인증 패널들. Supabase Auth 호출과 입력 검증을 담당한다.

export type AuthView =
  | "entry"
  | "login"
  | "signup"
  | "verify"
  | "forgot-password"
  | "reset-password";
type Go = (view: AuthView) => void;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 8~16자, 영문 대문자 최소 1개
function passwordError(password: string) {
  if (password.length < 8 || password.length > 16)
    return "Password must be 8-16 characters.";
  if (!/[A-Z]/.test(password))
    return "Password needs at least one uppercase letter.";
  return "";
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
}: FieldProps) {
  const errId = `${id}-error`;
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="auth-input"
        type={type}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
      />
      <p id={errId} className="auth-error" role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}

function TextAction({
  onClick,
  children,
  accent,
}: {
  onClick: () => void;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      className={`auth-action${accent ? " is-accent" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function LoginPanel({
  go,
  onLogin,
  initialError = "",
}: {
  go: Go;
  onLogin: () => void;
  initialError?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (!EMAIL_RE.test(email.trim()) || !password) {
      setError("Invalid email or password.");
      return;
    }
    setBusy(true);
    setError("");
    const { data, error } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.session) {
      setError(
        error?.code === "email_not_confirmed"
          ? "Verify your email before logging in."
          : "Invalid email or password.",
      );
      setBusy(false);
      return;
    }
    onLogin(); // 성공 후에만 Entry animation -> /home
  }

  async function onKakao() {
    if (busy) return;
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  return (
    <form className="auth-panel" onSubmit={onSubmit} noValidate>
      <h2 className="auth-title">LOGIN</h2>
      <Field
        id="login-email"
        label="EMAIL"
        type="email"
        placeholder="EMAIL ADDRESS"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        autoFocus
      />
      <Field
        id="login-password"
        label="PASSWORD"
        type="password"
        placeholder="PASSWORD"
        value={password}
        onChange={setPassword}
        error={error}
        autoComplete="current-password"
      />
      <button type="submit" className="auth-submit" disabled={busy}>
        LOGIN
      </button>
      <div className="auth-row">
        <TextAction onClick={() => go("forgot-password")}>
          FORGOT PASSWORD
        </TextAction>
        <TextAction onClick={() => go("signup")}>CREATE ACCOUNT</TextAction>
      </div>
      <div className="auth-row is-center">
        <TextAction onClick={onKakao}>CONTINUE WITH KAKAO</TextAction>
      </div>
    </form>
  );
}

export function SignupPanel({
  go,
  onSubmitted,
}: {
  go: Go;
  onSubmitted: (email: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = {
    name: name.trim() ? "" : "Name is required.",
    email: EMAIL_RE.test(email.trim()) ? "" : "Enter a valid email address.",
    password: passwordError(password),
    confirm: confirm && confirm === password ? "" : "Passwords do not match.",
  };
  const show = (key: keyof typeof errors) => (submitted ? errors[key] : "");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setServerError("");
    if (Object.values(errors).some(Boolean)) return; // signUp 호출 금지
    setBusy(true);
    const { error } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    onSubmitted(email.trim()); // 실제 signUp 성공 후에만 verify 화면
  }

  return (
    <form className="auth-panel" onSubmit={onSubmit} noValidate>
      <h2 className="auth-title">CREATE ACCOUNT</h2>
      <Field
        id="signup-name"
        label="NAME"
        placeholder="NAME"
        value={name}
        onChange={setName}
        error={show("name")}
        autoComplete="name"
        autoFocus
      />
      <Field
        id="signup-email"
        label="EMAIL"
        type="email"
        placeholder="EMAIL ADDRESS"
        value={email}
        onChange={setEmail}
        error={show("email")}
        autoComplete="email"
      />
      <Field
        id="signup-password"
        label="PASSWORD"
        type="password"
        placeholder="PASSWORD"
        value={password}
        onChange={setPassword}
        error={show("password")}
        autoComplete="new-password"
      />
      <Field
        id="signup-confirm"
        label="CONFIRM PASSWORD"
        type="password"
        placeholder="CONFIRM PASSWORD"
        value={confirm}
        onChange={setConfirm}
        error={show("confirm") || serverError}
        autoComplete="new-password"
      />
      <button type="submit" className="auth-submit" disabled={busy}>
        CREATE ACCOUNT
      </button>
      <div className="auth-row is-center">
        <span className="auth-hint">ALREADY HAVE AN ACCOUNT?</span>
        <TextAction accent onClick={() => go("login")}>
          LOGIN
        </TextAction>
      </div>
    </form>
  );
}

export function VerifyPanel({ go, email }: { go: Go; email: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    // 인증만 완료한다. 로그인 처리는 하지 않는다.
    await supabase.auth.signOut({ scope: "local" });
    go("login");
  }

  async function onResend() {
    if (busy) return;
    setBusy(true);
    setError("");
    setSent(false);
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true); // 실제 요청 성공 후에만 SENT
  }

  return (
    <form className="auth-panel" onSubmit={onSubmit} noValidate>
      <h2 className="auth-title">VERIFICATION CODE</h2>
      <p className="auth-copy">Enter the 6-digit code sent to {email}</p>
      <Field
        id="verify-code"
        label="VERIFICATION CODE"
        placeholder="000000"
        value={code}
        onChange={(v) => {
          setCode(v.replace(/\D/g, "").slice(0, 6));
          setError("");
        }}
        error={error}
        autoComplete="one-time-code"
        autoFocus
      />
      <button type="submit" className="auth-submit" disabled={busy}>
        VERIFY
      </button>
      <div className="auth-row is-center">
        <TextAction onClick={onResend}>RESEND CODE</TextAction>
        {sent && <span className="auth-hint">SENT</span>}
      </div>
      <div className="auth-row is-center">
        <TextAction onClick={() => go("login")}>BACK TO LOGIN</TextAction>
      </div>
    </form>
  );
}

export function ForgotPanel({ go }: { go: Go }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  const error =
    (submitted && !EMAIL_RE.test(email.trim())
      ? "Enter a valid email address."
      : "") || serverError;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setServerError("");
    if (!EMAIL_RE.test(email.trim())) return;
    setBusy(true);
    const { error } = await createClient().auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/?view=reset")}`,
      },
    );
    setBusy(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <form className="auth-panel" onSubmit={onSubmit} noValidate>
      <h2 className="auth-title">RESET PASSWORD</h2>
      <Field
        id="reset-email"
        label="EMAIL"
        type="email"
        placeholder="EMAIL ADDRESS"
        value={email}
        onChange={(v) => {
          setEmail(v);
          setSent(false);
          setServerError("");
        }}
        error={error}
        autoComplete="email"
        autoFocus
      />
      <button type="submit" className="auth-submit" disabled={busy}>
        SEND RESET LINK
      </button>
      <p className="auth-notice is-quiet" aria-live="polite">
        {sent
          ? "If this address is registered, a reset link will be sent."
          : ""}
      </p>
      <div className="auth-row is-center">
        <TextAction onClick={() => go("login")}>BACK TO LOGIN</TextAction>
      </div>
    </form>
  );
}

// reset 링크의 /auth/callback 이 recovery session 을 만든 뒤 도달하는 새 비밀번호 화면.
export function ResetPasswordPanel({ go }: { go: Go }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = {
    password: passwordError(password),
    confirm: confirm && confirm === password ? "" : "Passwords do not match.",
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setServerError("");
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setServerError(error.message);
      setBusy(false);
      return;
    }
    await supabase.auth.signOut();
    go("login");
  }

  return (
    <form className="auth-panel" onSubmit={onSubmit} noValidate>
      <h2 className="auth-title">NEW PASSWORD</h2>
      <Field
        id="reset-password"
        label="NEW PASSWORD"
        type="password"
        placeholder="NEW PASSWORD"
        value={password}
        onChange={setPassword}
        error={submitted ? errors.password : ""}
        autoComplete="new-password"
        autoFocus
      />
      <Field
        id="reset-confirm"
        label="CONFIRM PASSWORD"
        type="password"
        placeholder="CONFIRM PASSWORD"
        value={confirm}
        onChange={setConfirm}
        error={(submitted ? errors.confirm : "") || serverError}
        autoComplete="new-password"
      />
      <button type="submit" className="auth-submit" disabled={busy}>
        UPDATE PASSWORD
      </button>
      <div className="auth-row is-center">
        <TextAction onClick={() => go("login")}>BACK TO LOGIN</TextAction>
      </div>
    </form>
  );
}
