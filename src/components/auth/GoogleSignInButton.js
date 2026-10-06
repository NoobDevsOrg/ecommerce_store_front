"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";

const GOOGLE_SCRIPT_ID = "google-identity-services";

export default function GoogleSignInButton({ onCredential, disabled }) {
  const containerRef = useRef(null);
  const [error, setError] = useState("");
  const [configuration, setConfiguration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const clientId = configuration?.clientId;

  useEffect(() => {
    let cancelled = false;

    const loadConfiguration = async () => {
      try {
        const response = await api.customerAuth.googleConfiguration();
        if (!cancelled) setConfiguration(response?.data || null);
      } catch {
        // Keep email/password sign-in fully usable when Google has not been
        // configured yet or the provider configuration cannot be read.
        if (!cancelled) setConfiguration({ isEnabled: false });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadConfiguration();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!clientId || !containerRef.current) return undefined;

    let cancelled = false;
    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (credential) onCredential(credential);
          else setError("Google sign-in did not return a credential. Please try again.");
        },
      });
      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: containerRef.current.clientWidth || 320,
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", render);
      render();
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", render);
      };
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    script.onerror = () => setError("Google sign-in is unavailable right now.");
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.onload = null;
      script.onerror = null;
    };
  }, [clientId, onCredential]);

  if (isLoading) return <div className="h-10 w-full animate-pulse rounded-lg bg-stone-800" aria-hidden="true" />;
  if (!configuration?.isEnabled || !clientId) return error ? <p className="text-sm text-rose-300" role="alert">{error}</p> : null;

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div ref={containerRef} className="min-h-10 w-full overflow-hidden rounded-lg" />
      {error ? <p className="mt-2 text-sm text-rose-300" role="alert">{error}</p> : null}
    </div>
  );
}
