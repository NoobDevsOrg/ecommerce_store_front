// hooks/useNewEnquiryCount.js
<<<<<<< HEAD
import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useNewEnquiryCount() {
    const [count, setCount] = useState(0);

    const fetchCount = useCallback(async () => {
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
        fetchCount();
    }, [fetchCount]);
=======
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const POLL_INTERVAL_MS = 10_000; // 10 seconds

export function useNewEnquiryCount() {
    console.log("hey I am here hooks")
    const [count, setCount] = useState(0);
    const intervalRef = useRef(null);

    const fetchCount = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/enquiries/count?status=new`);
            console.log("res anbsanab", res)
            if (!res.ok) return;
            const json = await res.json();
            console.log("aaaaa json", json)
            // setCount(json.count ?? 0);
            setCount(json.data?.count ?? 0);
        } catch {
            // Silently fail — badge just won't update
        }
    }, []);

    useEffect(() => {
        fetchCount(); // immediate first fetch
        intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, [fetchCount]);
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774

    // Call this from the enquiries page after a status change
    // so the badge stays in sync without waiting for next poll
    const invalidate = useCallback(() => fetchCount(), [fetchCount]);

    return { count, invalidate };
<<<<<<< HEAD
}
=======
}
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
