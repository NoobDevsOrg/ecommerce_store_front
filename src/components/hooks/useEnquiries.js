// hooks/useEnquiries.js
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Request failed");
    return json;
}

export function useEnquiries() {
    const [enquiries, setEnquiries] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // Reset to page 1 whenever filters change
    useEffect(() => { setPage(1); }, [debouncedSearch, status, limit]);

    const fetchEnquiries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page,
                limit,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(status !== "all" && { status }),
            });
            const json = await apiFetch(`/enquiries?${params}`);
            setEnquiries(json.data);
            setPagination(json.pagination);
        } catch (err) {
            setError(err.message || "Failed to load enquiries");
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, debouncedSearch, status]);

    useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

    // Optimistic status update
    const updateStatus = useCallback(async (id, newStatus) => {
        // Optimistic: update local state immediately
        setEnquiries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
        try {
            await apiFetch(`/enquiries/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            // Rollback on failure — refetch
            console.error("[useEnquiries] Status update failed:", err);
            fetchEnquiries();
        }
    }, [fetchEnquiries]);

    return {
        enquiries,
        pagination,
        isLoading,
        error,
        // filter state
        search, setSearch,
        status, setStatus,
        page, setPage,
        limit, setLimit,
        // actions
        updateStatus,
        refresh: fetchEnquiries,
    };
}