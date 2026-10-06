"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { useCustomerAuth } from "../../components/hooks/useCustomerAuth";
import { api } from "../../lib/api";

export const safeReturnTo = (value) => typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !/\\|:\/\//.test(value) ? value : "/account";

const mask = (email) => {
  const [name, host] = email.split("@");
  return name && host ? `${name[0]}***@${host}` : "your email";
};

function LoginContent() {
  const router = useRouter();
  const query = useSearchParams();
  const { customer, isLoading, establishSession, login, signInWithGoogle } = useCustomerAuth();
  const target = useMemo(() => safeReturnTo(query.get("returnTo")), [query]);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("otp");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!isLoading && customer) router.replace(target); }, [customer, isLoading, router, target]);
  const done = (session) => { establishSession(session); router.replace(target); router.refresh(); };
  const send = async () => { setBusy(true); setError(""); try { await api.customerAuth.emailOtpSend(email); setSent(true); } catch (e) { setError(e.message || "We could not send a code."); } finally { setBusy(false); } };
  const verify = async () => { setBusy(true); setError(""); try { done((await api.customerAuth.emailOtpVerify(email, code)).data); } catch (e) { setError(e.message || "Invalid or expired verification code."); } finally { setBusy(false); } };
  const passwordSignIn = async () => { setBusy(true); setError(""); try { await login({ email, password }); router.replace(target); router.refresh(); } catch (e) { setError(e.message || "Invalid email or password."); } finally { setBusy(false); } };
  const google = async (token) => { setBusy(true); setError(""); try { await signInWithGoogle(token); router.replace(target); router.refresh(); } catch (e) { setError(e.message || "Google sign-in could not be completed."); } finally { setBusy(false); } };

  if (isLoading) return null;
  return <main className="min-h-screen bg-[#0f0a1a] px-4 py-16 text-stone-200"><section className="mx-auto max-w-md rounded-2xl border border-stone-800 bg-[#161022] p-6"><Link href="/" className="font-serif text-xl text-[#edca65]">Sagunthala</Link><h1 className="mt-8 font-serif text-3xl text-white">Welcome back</h1>{error ? <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p> : null}{!sent ? <div className="mt-6 space-y-4"><label className="block text-sm">Email address<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] p-3 text-white" /></label>{mode === "otp" ? <><p className="text-sm text-stone-400">We&apos;ll send you a secure verification code.</p><button onClick={send} disabled={busy} className="w-full rounded-xl bg-[#d4af37] p-3 font-bold text-[#0f0a1a]">Continue with email</button><p className="text-center text-sm text-stone-500">or</p><GoogleSignInButton onCredential={google} disabled={busy} /><button onClick={() => setMode("password")} className="w-full text-sm text-[#edca65]">Use password instead</button></> : <><label className="block text-sm">Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] p-3 text-white" /></label><button onClick={passwordSignIn} disabled={busy} className="w-full rounded-xl bg-[#d4af37] p-3 font-bold text-[#0f0a1a]">Sign in</button><Link href={`/forgot-password?returnTo=${encodeURIComponent(target)}`} className="block text-center text-sm text-[#edca65]">Forgot password?</Link><button onClick={() => setMode("otp")} className="w-full text-sm text-[#edca65]">Use email instead</button></>}</div> : <div className="mt-6 space-y-4"><h2 className="font-serif text-2xl text-white">Check your email</h2><p className="text-sm text-stone-400">We sent a verification code to {mask(email)}.</p><input inputMode="numeric" autoComplete="one-time-code" maxLength="6" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="w-full rounded-xl border border-stone-700 bg-[#120f1d] p-3 text-center text-xl text-white" /><button onClick={verify} disabled={busy} className="w-full rounded-xl bg-[#d4af37] p-3 font-bold text-[#0f0a1a]">Verify & continue</button><button onClick={() => setSent(false)} className="w-full text-sm text-stone-400">Change email</button></div>}</section></main>;
}

export default function Login() {
  return <Suspense fallback={<main className="min-h-screen bg-[#0f0a1a]" />}><LoginContent /></Suspense>;
}
