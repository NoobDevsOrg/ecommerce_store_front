"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

const EVENT = "notificationCountUpdated";
const counts = { customer: 0, admin: 0 };
const emit = (audience) => window.dispatchEvent(new CustomEvent(EVENT, { detail: { audience, count: counts[audience] || 0 } }));

export function publishNotificationCount(audience, count) {
  if (typeof window === "undefined") return;
  counts[audience] = Math.max(0, Number(count) || 0); emit(audience);
}

export function clearNotificationCount(audience) { publishNotificationCount(audience, 0); }

export async function refreshNotificationCount(audience) {
  const request = audience === "admin" ? api.notifications.admin.list : api.notifications.mine;
  const response = await request({ page: 1, limit: 1 });
  publishNotificationCount(audience, response?.data?.unreadCount || 0);
  return counts[audience];
}

export function useNotificationCount(audience, enabled) {
  const [count, setCount] = useState(0);
  const refresh = useCallback(async () => {
    if (!enabled) { clearNotificationCount(audience); return 0; }
    try { return await refreshNotificationCount(audience); } catch { publishNotificationCount(audience, 0); return 0; }
  }, [audience, enabled]);
  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (event) => { if (event.detail?.audience === audience) setCount(event.detail.count); };
    window.addEventListener(EVENT, listener);
    void refresh();
    return () => window.removeEventListener(EVENT, listener);
  }, [audience, enabled, refresh]);
  return { count: enabled ? count : 0, refresh };
}
