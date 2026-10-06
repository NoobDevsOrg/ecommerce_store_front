// hooks/useNewEnquiryCount.js
import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
    || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

export function useNewEnquiryCount() {
    const [count, setCount] = useState(0);

    const fetchCount = useCallback(async () => {
        if (!API_BASE) return;
        try {
            const res = await fetch(`${API_BASE}/enquiries/count?status=new`);
            if (!res.ok) return;
            const json = await res.json();
            setCount(json.data?.count ?? 0);
        } catch {
            // Silently fail — badge just won't update
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchCount();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchCount]);

    // Call this from the enquiries page after a status change
    // so the badge stays in sync without waiting for next poll
    const invalidate = useCallback(() => fetchCount(), [fetchCount]);

    return { count, invalidate };
}
