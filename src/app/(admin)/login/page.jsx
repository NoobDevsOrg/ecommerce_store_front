"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { getToken, setAuthSession } from "../../../lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/admin/products");
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.auth.login({
        email: form.email.trim(),
        password: form.password,
      });

      const accessToken = response?.data?.accessToken || response?.data?.token;
      const refreshToken = response?.data?.refreshToken;

      if (!accessToken) {
        throw new Error("Token was not returned from login endpoint");
      }

      setAuthSession({ accessToken, refreshToken, tenantId: response?.data?.tenantId });
      
      // Store user info if available
      if (response?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        // Fallback: create user object from email
        const user = { name: form.email.split("@")[0], email: form.email };
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Notify other components that user state has changed
      window.dispatchEvent(new Event("userUpdated"));
      
      router.replace("/admin/products");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-4 py-10 md:px-8">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[radial-gradient(circle_at_20%_20%,#facc1550,transparent_45%),radial-gradient(circle_at_80%_65%,#0ea5e940,transparent_55%),linear-gradient(140deg,#0f172a,#111827)] p-8 text-white md:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/90">Admin Console</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">Manage products across tenants</h1>
          </div>
          <p className="text-sm text-slate-200/90">Secure JWT login with tenant-aware API isolation.</p>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Login</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage products.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="input"
                placeholder="user@example.com"
                required
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="input"
                required
              />
            </Field>

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      {children}
    </div>
  );
}