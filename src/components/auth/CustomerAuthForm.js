"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import GoogleSignInButton from "./GoogleSignInButton";

const PASSWORD_MESSAGE = "Use 8+ characters with uppercase, lowercase, and a number.";

function validate({ mode, fullName, email, password, confirmPassword }) {
  const errors = {};
  if (mode === "register" && fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  if (mode === "register") {
    if (password && (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || password.length < 8)) {
      errors.password = PASSWORD_MESSAGE;
    }
    if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

function PasswordField({ id, label, value, onChange, error, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-stone-200">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full rounded-lg border border-stone-700 bg-[#120f1d] px-4 py-3 pr-16 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-3 text-xs font-medium text-stone-400 hover:text-[#d4af37]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-300" role="alert">{error}</p> : null}
    </div>
  );
}

export default function CustomerAuthForm({ mode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, register, signInWithGoogle } = useCustomerAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const isRegistration = mode === "register";
  const requestedReturnTo = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("returnTo") || "";
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//") ? requestedReturnTo : "/account";
  const returnToQuery = returnTo === "/account" ? "" : `?returnTo=${encodeURIComponent(returnTo)}`;

  const title = isRegistration ? "Create your account" : "Welcome back";
  const supportingText = isRegistration
    ? "Save your details for a more personal Sagunthala experience."
    : "Sign in to continue your Sagunthala journey.";

  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, isLoading, returnTo, router]);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate({ mode, ...form });
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length > 0 || submissionInFlight.current) return;

    submissionInFlight.current = true;
    setIsSubmitting(true);
    try {
      if (isRegistration) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      router.replace(returnTo);
    } catch (error) {
      setServerError(error?.message || "We could not complete that request. Please try again.");
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = useCallback(async (idToken) => {
    if (submissionInFlight.current) return;
    setServerError("");
    submissionInFlight.current = true;
    setIsSubmitting(true);
    try {
      await signInWithGoogle(idToken);
      router.replace(returnTo);
    } catch (error) {
      setServerError(error?.message || "We could not complete that request. Please try again.");
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  }, [returnTo, router, signInWithGoogle]);

  const alternate = useMemo(() => (
    isRegistration
      ? { href: `/login${returnToQuery}`, label: "Already have an account? Sign in" }
      : { href: `/register${returnToQuery}`, label: "New to Sagunthala? Create an account" }
  ), [isRegistration, returnToQuery]);

  return (
    <main className="min-h-screen bg-[#0f0a1a] px-4 py-20 text-stone-200 sm:px-6">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-stone-800 bg-[#161022] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">Sagunthala Dance Jewellery</p>
        <h1 className="mt-4 font-serif text-3xl text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-400">{supportingText}</p>

        <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
          {isRegistration ? (
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-stone-200">Full name</label>
              <input id="fullName" value={form.fullName} onChange={(event) => setField("fullName")(event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.fullName)} className="w-full rounded-lg border border-stone-700 bg-[#120f1d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20" />
              {errors.fullName ? <p className="mt-1.5 text-sm text-rose-300" role="alert">{errors.fullName}</p> : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-200">Email address</label>
            <input id="email" type="email" value={form.email} onChange={(event) => setField("email")(event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} className="w-full rounded-lg border border-stone-700 bg-[#120f1d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20" />
            {errors.email ? <p className="mt-1.5 text-sm text-rose-300" role="alert">{errors.email}</p> : null}
          </div>

          <PasswordField id="password" label="Password" value={form.password} onChange={setField("password")} error={errors.password} autoComplete={isRegistration ? "new-password" : "current-password"} />
          {isRegistration ? <PasswordField id="confirmPassword" label="Confirm password" value={form.confirmPassword} onChange={setField("confirmPassword")} error={errors.confirmPassword} autoComplete="new-password" /> : null}
          {isRegistration ? <p className="-mt-2 text-xs text-stone-500">{PASSWORD_MESSAGE}</p> : null}

          {serverError ? <p className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-sm text-rose-200" role="alert">{serverError}</p> : null}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-bold text-[#0f0a1a] transition hover:bg-[#edca65] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Please wait…" : isRegistration ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-stone-500"><span className="h-px flex-1 bg-stone-800" />or<span className="h-px flex-1 bg-stone-800" /></div>
        <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isSubmitting} />
        <Link href={alternate.href} className="mt-7 block text-center text-sm text-[#d4af37] hover:text-[#edca65] focus:outline-none focus:underline">{alternate.label}</Link>
      </div>
    </main>
  );
}
