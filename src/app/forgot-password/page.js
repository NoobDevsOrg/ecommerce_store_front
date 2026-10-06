"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";
import {
  FORGOT_PASSWORD_STEPS,
  maskEmail,
  PASSWORD_POLICY_MESSAGE,
  resetErrorField,
  resetFieldErrors,
  resetPayload,
  transitionForgotPasswordStep,
} from "../../lib/forgotPassword";
import { safeReturnTo } from "../login/page";

const FieldError = ({ message }) => message ? <p className="mt-1 text-sm text-rose-300" role="alert">{message}</p> : null;
const FORGOT_PASSWORD_RESUME_KEY = "sagunthala_forgot_password_reset";
const validEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || ""));
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const readForgotPasswordResume = () => {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(FORGOT_PASSWORD_RESUME_KEY) || "null");
    const email = normalizeEmail(saved?.email);
    if (saved?.step !== FORGOT_PASSWORD_STEPS.RESET || !validEmail(email)) return null;
    const resendUntil = Date.parse(saved?.resendAvailableAt || "");
    return {
      email,
      resendUntil: Number.isFinite(resendUntil) ? resendUntil : 0,
    };
  } catch {
    return null;
  }
};

const clearForgotPasswordResume = () => {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(FORGOT_PASSWORD_RESUME_KEY);
};

const persistForgotPasswordResume = ({ step, email, resendUntil }) => {
  if (typeof window === "undefined") return;
  const normalizedEmail = normalizeEmail(email);
  if (step !== FORGOT_PASSWORD_STEPS.RESET || !validEmail(normalizedEmail)) {
    clearForgotPasswordResume();
    return;
  }
  const timestamp = Number(resendUntil);
  const resendAvailableAt = Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp).toISOString() : null;
  window.sessionStorage.setItem(FORGOT_PASSWORD_RESUME_KEY, JSON.stringify({
    email: normalizedEmail,
    step: FORGOT_PASSWORD_STEPS.RESET,
    resendAvailableAt,
  }));
};

function ResetContent() {
  const router = useRouter();
  const query = useSearchParams();
  const target = useMemo(() => safeReturnTo(query.get("returnTo")), [query]);
  const loginHref = `/login${target === "/account" ? "" : `?returnTo=${encodeURIComponent(target)}`}`;
  const [step, setStep] = useState(FORGOT_PASSWORD_STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendUntil, setResendUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [restored, setRestored] = useState(false);
  const sendInFlight = useRef(false);

  useEffect(() => {
    const saved = readForgotPasswordResume();
    if (saved) {
      setEmail(saved.email);
      setStep(FORGOT_PASSWORD_STEPS.RESET);
      setResendUntil(saved.resendUntil);
      setNow(Date.now());
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    persistForgotPasswordResume({ step, email, resendUntil });
  }, [email, resendUntil, restored, step]);

  useEffect(() => {
    if (!resendUntil || resendUntil <= Date.now()) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendUntil]);

  const secondsUntilResend = Math.max(0, Math.ceil((resendUntil - now) / 1000));
  const canSubmit = Object.keys(resetFieldErrors({ code, newPassword, confirmPassword })).length === 0;

  const send = async ({ resend = false } = {}) => {
    const normalizedEmail = normalizeEmail(email);
    if (!validEmail(normalizedEmail)) {
      setFieldErrors({ email: "Enter a valid email address." });
      return;
    }
    if (sendInFlight.current || busy || (resend && secondsUntilResend > 0)) return;
    sendInFlight.current = true;
    setBusy(true); setError(""); setFieldErrors({});
    try {
      const response = await api.customerAuth.passwordForgot(normalizedEmail);
      setEmail(normalizedEmail);
      setStep((current) => transitionForgotPasswordStep(current, "SEND_SUCCEEDED"));
      const resendAvailableAt = Date.parse(response?.data?.resendAvailableAt || "");
      setResendUntil(Number.isFinite(resendAvailableAt) ? resendAvailableAt : 0);
      setNow(Date.now());
      if (resend) setCode("");
    } catch (requestError) {
      setError(requestError?.message || "We could not send a verification code.");
    } finally {
      sendInFlight.current = false;
      setBusy(false);
    }
  };

  const changeEmail = () => {
    setStep((current) => transitionForgotPasswordStep(current, "CHANGE_EMAIL"));
    setCode(""); setNewPassword(""); setConfirmPassword("");
    setFieldErrors({}); setError(""); setResendUntil(0);
    clearForgotPasswordResume();
  };

  const reset = async (event) => {
    event.preventDefault();
    const localErrors = resetFieldErrors({ code, newPassword, confirmPassword });
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors); setError("");
      return;
    }
    setBusy(true); setError(""); setFieldErrors({});
    try {
      await api.customerAuth.passwordReset(resetPayload({ email, code, newPassword, confirmPassword }));
      clearForgotPasswordResume();
      setStep((current) => transitionForgotPasswordStep(current, "RESET_SUCCEEDED"));
    } catch (requestError) {
      const field = resetErrorField(requestError);
      if (field) setFieldErrors({ [field]: requestError?.message || "Please correct this field." });
      else setError(requestError?.message || "We could not reset your password.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="min-h-screen bg-[#0f0a1a] px-4 py-16 text-stone-200"><section className="mx-auto max-w-md rounded-2xl border border-stone-800 bg-[#161022] p-6"><Link href={loginHref} className="font-serif text-xl text-[#edca65]">Sagunthala</Link><h1 className="mt-8 font-serif text-3xl text-white">{step === FORGOT_PASSWORD_STEPS.SUCCESS ? "Password updated" : "Reset your password"}</h1>{error ? <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p> : null}{step === FORGOT_PASSWORD_STEPS.EMAIL ? <div className="mt-6 space-y-4"><label className="block text-sm" htmlFor="forgot-email">Email address<input id="forgot-email" autoFocus type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setFieldErrors({}); }} className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] p-3 text-white" /></label><FieldError message={fieldErrors.email} /><button type="button" onClick={() => send()} disabled={busy} className="w-full rounded-xl bg-[#d4af37] p-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Sending…" : "Send verification code"}</button></div> : null}{step === FORGOT_PASSWORD_STEPS.RESET ? <form onSubmit={reset} className="mt-6 space-y-4" noValidate><p className="text-sm text-stone-400">We sent a verification code to <span className="text-stone-200">{maskEmail(email)}</span>.</p><label className="block text-sm" htmlFor="forgot-code">Verification code<input id="forgot-code" autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength="6" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "")); setFieldErrors((current) => ({ ...current, code: undefined })); }} className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] p-3 text-center text-xl tracking-[0.4em] text-white" /></label><FieldError message={fieldErrors.code} /><p className="text-sm text-stone-400">{PASSWORD_POLICY_MESSAGE}</p><label className="block text-sm" htmlFor="forgot-new-password">New password<input id="forgot-new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setFieldErrors((current) => ({ ...current, newPassword: undefined })); }} className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] p-3 text-white" /></label><FieldError message={fieldErrors.newPassword} /><label className="block text-sm" htmlFor="forgot-confirm-password">Confirm password<input id="forgot-confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFieldErrors((current) => ({ ...current, confirmPassword: undefined })); }} className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] p-3 text-white" /></label><FieldError message={fieldErrors.confirmPassword} /><button disabled={busy || !canSubmit} className="w-full rounded-xl bg-[#d4af37] p-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Updating…" : "Update password"}</button><button type="button" disabled={busy || secondsUntilResend > 0} onClick={() => send({ resend: true })} className="w-full text-sm text-[#edca65] disabled:text-stone-600" aria-live="polite">{secondsUntilResend > 0 ? `Resend code in ${secondsUntilResend}s` : "Resend code"}</button><button type="button" disabled={busy} onClick={changeEmail} className="w-full text-sm text-stone-400">Change email</button></form> : null}{step === FORGOT_PASSWORD_STEPS.SUCCESS ? <div className="mt-6"><p>Your password has been reset successfully.</p><button type="button" onClick={() => router.push(loginHref)} className="mt-6 w-full rounded-xl bg-[#d4af37] p-3 font-bold text-[#0f0a1a]">Sign in</button></div> : null}</section></main>;
}

export default function ForgotPassword() {
  return <Suspense fallback={<main className="min-h-screen bg-[#0f0a1a]" />}><ResetContent /></Suspense>;
}
