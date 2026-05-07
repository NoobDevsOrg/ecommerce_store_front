"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  new: {
    label: "New",
    row: "bg-yellow-500/[0.04]",
    badge: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    dot: "bg-yellow-400",
    btn: "hover:bg-yellow-500/10 hover:text-yellow-400",
  },
  contacted: {
    label: "Contacted",
    row: "bg-blue-500/[0.04]",
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    dot: "bg-blue-400",
    btn: "hover:bg-blue-500/10 hover:text-blue-400",
  },
  closed: {
    label: "Closed",
    row: "bg-stone-500/[0.03]",
    badge: "bg-stone-700/30 text-stone-400 border border-stone-600/20",
    dot: "bg-stone-400",
    btn: "hover:bg-stone-600/20 hover:text-stone-300",
  },
};

const ALL_STATUSES = ["new", "contacted", "closed"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Pure string slice — identical on server and client, no hydration issues
function formatDate(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ─── DetailField ──────────────────────────────────────────────────────────────

function DetailField({ label, value, copyable, suffix }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">{label}</p>
      <div className="flex items-center gap-1.5 group">
        <span className="text-sm text-stone-200">{value || "—"}</span>
        {suffix}
        {copyable && value && (
          <button
            onClick={copy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-600 hover:text-[#b48a3c]"
            title="Copy"
          >
            {copied ? (
              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── EnquiryDetailModal ───────────────────────────────────────────────────────

function EnquiryDetailModal({ enquiry, onClose }) {
  const overlayRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  const s = STATUS_MAP[enquiry.status] || STATUS_MAP.new;

  return (
    <>
      <style>{`
        @keyframes mdl-in  { from { opacity:0 } to { opacity:1 } }
        @keyframes mdl-out { from { opacity:1 } to { opacity:0 } }
        @keyframes pnl-in  { from { opacity:0; transform:translateY(16px) scale(.97) } to { opacity:1; transform:none } }
        @keyframes pnl-out { from { opacity:1; transform:none } to { opacity:0; transform:translateY(10px) scale(.98) } }
        .mdl-ov { animation: ${visible ? "mdl-in .22s ease forwards" : "mdl-out .25s ease forwards"} }
        .mdl-pn { animation: ${visible ? "pnl-in .28s cubic-bezier(.22,1,.36,1) forwards" : "pnl-out .22s ease forwards"} }
        .mdl-pn::-webkit-scrollbar { width:4px }
        .mdl-pn::-webkit-scrollbar-thumb { background:#3a3550; border-radius:4px }
      `}</style>

      <div
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
        className="mdl-ov fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style={{ background: "rgba(6,4,14,0.87)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="mdl-pn relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl border border-stone-800 bg-[#110e1c] shadow-2xl">
          {/* Gold bar */}
          <div className="h-[2px] rounded-t-2xl" style={{ background: "linear-gradient(90deg,#b48a3c,#d4af37,#b48a3c)" }} />

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-stone-800/70">
            <div>
              <p className="text-[10px] tracking-[3px] uppercase text-[#b48a3c] mb-1">Enquiry Details</p>
              <h3 className="text-lg font-semibold text-white">{enquiry.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${s.badge}`}>{s.label}</span>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-stone-500 hover:text-white hover:bg-stone-800 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Email" value={enquiry.email} copyable />
              <DetailField label="Phone" value={enquiry.phone} copyable />
              {enquiry.whatsapp_number && (
                <DetailField
                  label="WhatsApp"
                  value={enquiry.whatsapp_number}
                  suffix={
                    <span className="text-[9px] text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded-full">WA</span>
                  }
                />
              )}
              <DetailField label="Date" value={formatDate(enquiry.created_at)} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1.5">Product</p>
              <div className="rounded-lg bg-[#1b1728] border border-stone-800 px-4 py-3 text-sm text-stone-200">
                {enquiry.product_name || "—"}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1.5">Message</p>
              <div className="rounded-lg bg-[#1b1728] border border-stone-800 px-4 py-3 text-sm text-stone-300 leading-relaxed min-h-[60px] whitespace-pre-wrap break-words">
                {enquiry.message || <span className="text-stone-600 italic">No message provided</span>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5">
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl border border-stone-700 text-stone-400 text-sm hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ActionMenu ───────────────────────────────────────────────────────────────

function ActionMenu({ enquiry, onViewDetails, onStatusChange, isUpdating }) {
  const [open, setOpen] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
        setShowStatus(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function toggle() {
    if (open) { setOpen(false); setShowStatus(false); }
    else setOpen(true);
  }

  function handleStatusPick(s) {
    setOpen(false);
    setShowStatus(false);
    if (s !== enquiry.status) onStatusChange(enquiry.id, s);
  }

  function handleViewDetails() {
    setOpen(false);
    setShowStatus(false);
    onViewDetails(enquiry);
  }

  return (
    <div className="relative" style={{ isolation: "isolate" }}>
      <button
        ref={btnRef}
        onClick={toggle}
        disabled={isUpdating}
        className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150
          ${open ? "bg-[#b48a3c]/10 border-[#b48a3c]/30 text-[#b48a3c]" : "border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300"}
          ${isUpdating ? "opacity-40 cursor-not-allowed" : ""}
        `}
        aria-label="Row actions"
      >
        {isUpdating ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1.5 z-[999] w-48 rounded-xl border border-stone-800 bg-[#161022] overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
        >
          {/* View Details */}
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-stone-300 hover:bg-[#1f1a30] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>

          <div className="border-t border-stone-800/60 mx-2" />

          {/* Change Status toggle */}
          <button
            onClick={() => setShowStatus((v) => !v)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-stone-300 hover:bg-[#1f1a30] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Change Status
            </span>
            <svg className={`w-3.5 h-3.5 text-stone-600 transition-transform ${showStatus ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStatus && (
            <div className="pb-1.5 px-1.5 space-y-0.5">
              {ALL_STATUSES.map((s) => {
                const cfg = STATUS_MAP[s];
                const isCurrent = enquiry.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusPick(s)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all
                      ${isCurrent ? "bg-[#b48a3c]/10 text-[#b48a3c] cursor-default" : `text-stone-400 ${cfg.btn}`}
                    `}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    {cfg.label}
                    {isCurrent && (
                      <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EnquiryRow ───────────────────────────────────────────────────────────────

function EnquiryRow({ item, onViewDetails, onStatusChange, isUpdating }) {
  const s = STATUS_MAP[item.status] || STATUS_MAP.new;
  return (
    <tr className={`border-t border-stone-800/60 transition-colors duration-150 group ${s.row} hover:bg-[#1b1630]`}>
      <td className="px-4 py-3.5 font-medium text-stone-200 group-hover:text-white transition-colors">
        {item.name}
      </td>
      <td className="px-4 py-3.5">
        <a href={`mailto:${item.email}`} onClick={(e) => e.stopPropagation()} className="text-stone-400 hover:text-[#b48a3c] transition-colors text-xs">
          {item.email}
        </a>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-stone-300 text-xs">{item.phone}</div>
        {item.whatsapp_number && (
          <div className="mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px] text-green-400">WhatsApp</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3.5 max-w-[140px]">
        <span className="text-stone-300 text-xs block truncate" title={item.product_name}>
          {item.product_name || "—"}
        </span>
      </td>
      <td className="px-4 py-3.5 max-w-[200px]">
        {item.message ? (
          <button onClick={() => onViewDetails(item)} className="text-left text-stone-400 text-xs leading-relaxed hover:text-stone-200 transition-colors group/msg">
            <span className="line-clamp-2 break-all whitespace-normal">
              {item.message}
            </span>
            {item.message.length > 80 && (
              <span className="text-[10px] text-[#b48a3c] opacity-0 group-hover/msg:opacity-100 transition-opacity">Read more</span>
            )}
          </button>
        ) : (
          <span className="text-stone-600 text-xs italic">—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs text-stone-500 tabular-nums">{formatDate(item.created_at)}</span>
      </td>
      <td className="px-4 py-3.5">
        <ActionMenu enquiry={item} onViewDetails={onViewDetails} onStatusChange={onStatusChange} isUpdating={isUpdating} />
      </td>
    </tr>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="border-t border-stone-800/60">
      {Array.from({ length: 8 }).map((_, j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-3 rounded-full bg-stone-800 animate-pulse" style={{ width: `${55 + (i * j) % 35}%` }} />
        </td>
      ))}
    </tr>
  ));
}

// ─── PaginationBtn ────────────────────────────────────────────────────────────

function PaginationBtn({ onClick, disabled, label, active, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-medium border transition-all duration-150
        ${active
          ? "bg-[#b48a3c] text-[#0c0816] border-[#b48a3c] shadow-lg shadow-[#b48a3c]/20"
          : "border-stone-800 text-stone-400 hover:border-stone-600 hover:text-white"
        }
        disabled:opacity-30 disabled:cursor-not-allowed
      `}
    >
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// KEY INSIGHT: All filter state is stored in ONE ref object.
// ONE useEffect reads from that ref and fires the API call.
// State setters only update the ref + trigger the effect via a single counter.
// This eliminates ALL stale-closure, competing-effect, and re-render-loop bugs.

function AdminEnquiriesPageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  // ── Single source of truth for filters
  const [filters, setFilters] = useState({
    search: sp.get("search") || "",
    status: sp.get("status") || "all",
    page: Number(sp.get("page")) || 1,
    limit: Number(sp.get("limit")) || 20,
  });

  // Local search input (drives the debounce, NOT the filter directly)
  const [searchInput, setSearchInput] = useState(filters.search);

  // ── Debounce search input → update filters.search + reset page
  // This is the ONLY place filters.search and page change from search
  const debounceRef = useRef(null);
  function handleSearchChange(value) {
    setSearchInput(value);

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: value.trim(),
        page: 1,
      }));
    }, 400);
  }

  // Clear search
  function clearSearch() {
    setSearchInput("");
    clearTimeout(debounceRef.current);
    setFilters((prev) => ({ ...prev, search: "", page: 1 }));
  }

  // Status change → reset page to 1
  function handleStatusChange(value) {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  }

  // Limit change → reset page to 1
  function handleLimitChange(value) {
    setFilters((prev) => ({ ...prev, limit: value, page: 1 }));
  }

  // Page change
  function handlePageChange(value) {
    setFilters((prev) => ({ ...prev, page: value }));
  }

  // ── Data state
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── THE ONE FETCH EFFECT
  // Deps: filters object. Runs exactly once per filter change. No race conditions.
  useEffect(() => {
    let cancelled = false;

    // Sync URL
    const q = new URLSearchParams();
    if (filters.search) q.set("search", filters.search);
    if (filters.status !== "all") q.set("status", filters.status);
    q.set("page", String(filters.page));
    q.set("limit", String(filters.limit));
    router.replace("/admin/enquiries?" + q.toString(), { scroll: false });

    // Fetch
    setLoading(true);
    setError(null);

    const params = {
      page: filters.page,
      limit: filters.limit,
      ...(filters.search?.trim() && { search: filters.search.trim() }),
      ...(filters.status !== "all" && { status: filters.status }),
    };
    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.status !== "all") params.status = filters.status;

    api.get("/products/enquiries", { params })
      .then((res) => {
        if (cancelled) return;

        console.log("API RESPONSE:", res.data); // debug

        const payload = res?.data;
        console.log("payload data", payload)
        // Step 1: basic validation
        if (!payload || !payload.data) {
          throw new Error("Invalid response structure");
        }

        const d = payload.data;
        console.log("gahgsvhgac data d", d)
        // Step 2: safe extraction
        const rows = d || [];
        const pagination = payload.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
        };

        setRows(rows);
        setPagination(pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[enquiries] fetch failed:", err);
        setError(err?.response?.data?.message || err.message || "Failed to load enquiries");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    console.log("PARAMS", params)
    return () => { cancelled = true; };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // <-- Only fires when filters object reference changes
  useEffect(() => {
    console.log("FILTERS:", filters)
  }, [filters])
  // ── Manual refresh — creates new filters reference to re-trigger effect
  const refresh = useCallback(() => {
    setFilters((prev) => ({ ...prev }));
  }, []);

  // ── Optimistic status update
  const [updatingId, setUpdatingId] = useState(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows; // always current, no stale closure

  const updateStatus = useCallback(async (id, nextStatus) => {
    if (updatingId) return;
    setUpdatingId(id);

    const snapshot = rowsRef.current;
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: nextStatus } : r));

    try {
      await api.put("/products/enquiries/" + id + "/status", { status: nextStatus });
      window.dispatchEvent(new Event("enquiryUpdated"));
    } catch (err) {
      console.error("[enquiries] status update failed:", err?.message);
      setRows(snapshot);
    } finally {
      setUpdatingId(null);
    }
  }, [updatingId]);

  // ── Modal
  const [modalEnquiry, setModalEnquiry] = useState(null);

  // ── Pagination numbers
  const totalPages = pagination?.totalPages || 1;
  const pageNumbers = useMemo(() => {
    const arr = [];
    const start = Math.max(1, filters.page - 2);
    const end = Math.min(totalPages, filters.page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [filters.page, totalPages]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0c0816] text-stone-200">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 md:px-10 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-white tracking-tight">Enquiries</h1>
            <p className="text-sm text-stone-500 mt-1">
              {pagination.total > 0
                ? `${pagination.total} total enquiries`
                : "Manage customer product enquiries"}
            </p>
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name, email, product…"
                className="pl-9 pr-8 py-2 w-56 sm:w-72 bg-[#1b1728] border border-stone-800 rounded-xl text-sm placeholder-stone-600 focus:outline-none focus:border-[#b48a3c]/50 focus:ring-1 focus:ring-[#b48a3c]/20 transition-all"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-300 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-[#1b1728] border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 focus:outline-none focus:border-[#b48a3c]/50 transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>

            {/* Limit */}
            <select
              value={filters.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="bg-[#1b1728] border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 focus:outline-none focus:border-[#b48a3c]/50 transition-all cursor-pointer"
            >
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>

            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-xl border border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600 transition-all disabled:opacity-40"
              title="Refresh"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={refresh} className="ml-auto underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="rounded-2xl border border-stone-800 overflow-hidden shadow-xl shadow-black/30">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#13101f] border-b border-stone-800">
                  {["Name", "Email", "Phone", "Product", "Message", "Status", "Date", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-[2px] uppercase text-stone-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <LoadingSkeleton />
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-stone-600">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No enquiries found</p>
                        {(filters.search || filters.status !== "all") && (
                          <button
                            onClick={() => { setSearchInput(""); setFilters((prev) => ({ ...prev, search: "", status: "all", page: 1 })); }}
                            className="text-xs text-[#b48a3c] hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((item) => (
                    <EnquiryRow
                      key={item.id}
                      item={item}
                      onViewDetails={setModalEnquiry}
                      onStatusChange={updateStatus}
                      isUpdating={updatingId === item.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {!loading && rows.length > 0 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-500 tabular-nums">
              Showing{" "}
              <span className="text-stone-300 font-medium">
                {(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, pagination.total)}
              </span>
              {" "}of{" "}
              <span className="text-stone-300 font-medium">{pagination.total}</span> enquiries
            </p>

            <div className="flex items-center gap-1.5">
              <PaginationBtn onClick={() => handlePageChange(Math.max(1, filters.page - 1))} disabled={filters.page === 1} label="←" title="Previous" />

              {pageNumbers[0] > 1 && (
                <>
                  <PaginationBtn onClick={() => handlePageChange(1)} label="1" active={false} />
                  {pageNumbers[0] > 2 && <span className="px-1 text-stone-600 text-sm">…</span>}
                </>
              )}

              {pageNumbers.map((p) => (
                <PaginationBtn key={p} onClick={() => handlePageChange(p)} label={String(p)} active={p === filters.page} />
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-stone-600 text-sm">…</span>
                  )}
                  <PaginationBtn onClick={() => handlePageChange(totalPages)} label={String(totalPages)} active={false} />
                </>
              )}

              <PaginationBtn onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))} disabled={filters.page === totalPages} label="→" title="Next" />
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {modalEnquiry && (
        <EnquiryDetailModal enquiry={modalEnquiry} onClose={() => setModalEnquiry(null)} />
      )}
    </div>
  );
}
// ─── Suspense wrapper (required for useSearchParams in Next.js App Router) ────

export default function AdminEnquiriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c0816] flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500 text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading enquiries…
        </div>
      </div>
    }>
      <AdminEnquiriesPageInner />
    </Suspense>
  );
}