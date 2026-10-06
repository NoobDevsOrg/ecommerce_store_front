"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import { getToken } from "../../../lib/auth";

const EMPTY_CONFIGURATION = { isEnabled: false, mode: "ONE_TAP", clientId: "" };
const EMPTY_RAZORPAY_CONFIGURATION = { isEnabled: false, mode: "TEST" };

function RazorpaySettings() {
  const [configuration, setConfiguration] = useState(EMPTY_RAZORPAY_CONFIGURATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    api.integrations.razorpay.get()
      .then((response) => {
        if (!active) return;
        const data = response?.data || EMPTY_RAZORPAY_CONFIGURATION;
        setConfiguration({ isEnabled: Boolean(data.isEnabled), mode: data.mode || "TEST" });
      })
      .catch((error) => {
        if (!active) return;
        setIsError(true);
        setMessage(error?.message || "Razorpay settings could not be loaded.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const save = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setIsError(false);
    setMessage("");
    try {
      const response = await api.integrations.razorpay.update(configuration);
      const data = response?.data || configuration;
      setConfiguration({ isEnabled: Boolean(data.isEnabled), mode: data.mode || "TEST" });
      setMessage("Razorpay settings have been saved.");
    } catch (error) {
      setIsError(true);
      setMessage(error?.message || "Razorpay settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-stone-800 bg-[#161022] p-6 text-stone-200 sm:p-8">
    <h2 className="font-serif text-3xl text-white">Razorpay payments</h2>
    <p className="mt-3 text-sm leading-6 text-stone-400">Enable Standard Checkout for this store. Only the safe enabled state and Test/Live mode are managed here; keys and webhook secrets remain deployment secrets.</p>
    {isLoading ? <p className="mt-5 text-sm text-stone-400">Loading Razorpay settings…</p> : <form className="mt-6 space-y-6" onSubmit={save}>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-800 bg-[#120f1d] p-4"><input type="checkbox" checked={configuration.isEnabled} onChange={(event) => setConfiguration((current) => ({ ...current, isEnabled: event.target.checked }))} className="mt-1 h-4 w-4 accent-[#d4af37]" /><span><span className="block text-sm font-semibold text-white">Enable Razorpay payments</span><span className="mt-1 block text-sm text-stone-400">Disabling prevents new payment starts while preserving verification of already pending payments.</span></span></label>
      <div><label htmlFor="razorpay-mode" className="mb-2 block text-sm font-medium text-stone-200">Provider mode</label><select id="razorpay-mode" value={configuration.mode} onChange={(event) => setConfiguration((current) => ({ ...current, mode: event.target.value }))} className="w-full rounded-lg border border-stone-700 bg-[#120f1d] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"><option value="TEST">Test mode</option><option value="LIVE">Live mode</option></select></div>
      {message ? <p className={isError ? "text-sm text-rose-300" : "text-sm text-emerald-300"} role="status">{message}</p> : null}
      <button type="submit" disabled={isSaving} className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f0a1a] disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Saving…" : "Save Razorpay settings"}</button>
    </form>}
  </section>;
}

function IntegrationsContent() {
  const [configuration, setConfiguration] = useState(EMPTY_CONFIGURATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loadConfiguration = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await api.integrations.google.get();
      const data = response?.data || EMPTY_CONFIGURATION;
      setConfiguration({
        isEnabled: Boolean(data.isEnabled),
        mode: data.mode || "ONE_TAP",
        clientId: data.clientId || "",
      });
    } catch (error) {
      setIsError(true);
      setMessage(error?.message || "Google integration settings could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) loadConfiguration();
  }, [loadConfiguration]);

  const save = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    if (configuration.isEnabled && !configuration.clientId.trim()) {
      setIsError(true);
      setMessage("A Google OAuth web client ID is required before enabling sign-in.");
      return;
    }

    setIsSaving(true);
    setIsError(false);
    setMessage("");
    try {
      const response = await api.integrations.google.update({
        isEnabled: configuration.isEnabled,
        mode: configuration.mode,
        clientId: configuration.clientId.trim() || null,
      });
      const data = response?.data || configuration;
      setConfiguration({
        isEnabled: Boolean(data.isEnabled),
        mode: data.mode || "ONE_TAP",
        clientId: data.clientId || "",
      });
      setMessage("Google sign-in settings have been saved.");
    } catch (error) {
      setIsError(true);
      setMessage(error?.message || "Google integration settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-[300px] animate-pulse rounded-2xl bg-[#161022]" aria-label="Loading integration settings" />;

  return (
    <>
    <section className="mx-auto max-w-2xl rounded-2xl border border-stone-800 bg-[#161022] p-6 text-stone-200 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">Integrations</p>
      <h1 className="mt-3 font-serif text-3xl text-white">Google sign-in</h1>
      <p className="mt-3 text-sm leading-6 text-stone-400">
        Control whether customers can use Google sign-in for this store. OAuth secrets and application security settings are not managed here.
      </p>

      <form className="mt-8 space-y-6" onSubmit={save}>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-800 bg-[#120f1d] p-4">
          <input
            type="checkbox"
            checked={configuration.isEnabled}
            onChange={(event) => setConfiguration((current) => ({ ...current, isEnabled: event.target.checked }))}
            className="mt-1 h-4 w-4 accent-[#d4af37]"
          />
          <span>
            <span className="block text-sm font-semibold text-white">Enable Google sign-in</span>
            <span className="mt-1 block text-sm text-stone-400">Disabled providers cannot be used by customers, even if a browser has a previous configuration.</span>
          </span>
        </label>

        <div>
          <label htmlFor="google-mode" className="mb-2 block text-sm font-medium text-stone-200">Sign-in mode</label>
          <select
            id="google-mode"
            value={configuration.mode}
            onChange={(event) => setConfiguration((current) => ({ ...current, mode: event.target.value }))}
            className="w-full rounded-lg border border-stone-700 bg-[#120f1d] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
          >
            <option value="ONE_TAP">Google Identity Services</option>
          </select>
        </div>

        <div>
          <label htmlFor="google-client-id" className="mb-2 block text-sm font-medium text-stone-200">Google OAuth web client ID</label>
          <input
            id="google-client-id"
            value={configuration.clientId}
            onChange={(event) => setConfiguration((current) => ({ ...current, clientId: event.target.value }))}
            placeholder="…apps.googleusercontent.com"
            autoComplete="off"
            spellCheck="false"
            className="w-full rounded-lg border border-stone-700 bg-[#120f1d] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
          />
          <p className="mt-2 text-xs leading-5 text-stone-500">This identifier is public and is sent to the storefront only when Google sign-in is enabled. Never enter an OAuth client secret here.</p>
        </div>

        {message ? <p className={isError ? "text-sm text-rose-300" : "text-sm text-emerald-300"} role="status">{message}</p> : null}
        <button type="submit" disabled={isSaving} className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#0f0a1a] disabled:cursor-not-allowed disabled:opacity-60">
          {isSaving ? "Saving…" : "Save Google settings"}
        </button>
      </form>
    </section>
    <RazorpaySettings />
    </>
  );
}

export default function IntegrationsPage() {
  return <AdminLayout><IntegrationsContent /></AdminLayout>;
}
