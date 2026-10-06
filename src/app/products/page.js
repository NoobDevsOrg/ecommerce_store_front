"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Select from "react-select";
import { api } from "../../lib/api";
import { addToCart } from "../../store/cartStore";
import ReviewsModal from "../../components/product/ReviewModal";
import CategoryHierarchy, { selectedCategoryIds } from "../../components/product/CategoryHierarchy";
import { productHref } from "../../lib/productUrl";

// ─── Enquiry Modal ────────────────────────────────────────────────────────────

function FloatingInput({ id, label, type = "text", value, onChange, required, error, disabled, autoComplete }) {
    const [focused, setFocused] = useState(false);
    const floated = focused || value.length > 0;
    return (
        <div style={{ position: "relative" }}>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
                style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${error ? "#ef4444" : focused ? "#b48a3c" : "#3a3530"}`,
                    borderRadius: 0,
                    outline: "none",
                    width: "100%",
                    padding: "22px 0 8px",
                    color: "#f5f0e8",
                    fontSize: "16px",
                    letterSpacing: "0.3px",
                    transition: "border-color 0.25s ease",
                    opacity: disabled ? 0.5 : 1,
                    boxSizing: "border-box",
                }}
            />
            <label
                htmlFor={id}
                style={{
                    position: "absolute",
                    left: 0,
                    top: floated ? "4px" : "50%",
                    transform: floated ? "none" : "translateY(-50%)",
                    fontSize: floated ? "10px" : "13px",
                    letterSpacing: floated ? "3px" : "1px",
                    textTransform: "uppercase",
                    color: error ? "#ef4444" : floated ? "#b48a3c" : "#7a7068",
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                }}
            >
                {label}{required && <span style={{ color: "#b48a3c", marginLeft: 2 }}>*</span>}
            </label>
            {error && <p style={{ margin: "5px 0 0", fontSize: "11px", color: "#ef4444" }}>{error}</p>}
        </div>
    );
}

function FloatingTextarea({ id, label, value, onChange, disabled }) {
    const [focused, setFocused] = useState(false);
    const floated = focused || value.length > 0;
    return (
        <div style={{ position: "relative" }}>
            <textarea
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={3}
                disabled={disabled}
                style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${focused ? "#b48a3c" : "#3a3530"}`,
                    borderRadius: 0,
                    outline: "none",
                    width: "100%",
                    padding: "22px 0 8px",
                    color: "#f5f0e8",
                    fontSize: "16px",
                    resize: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.25s ease",
                    opacity: disabled ? 0.5 : 1,
                    boxSizing: "border-box",
                }}
            />
            <label
                htmlFor={id}
                style={{
                    position: "absolute",
                    left: 0,
                    top: floated ? "4px" : "20px",
                    fontSize: floated ? "10px" : "13px",
                    letterSpacing: floated ? "3px" : "1px",
                    textTransform: "uppercase",
                    color: floated ? "#b48a3c" : "#7a7068",
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                }}
            >
                {label}
            </label>
        </div>
    );
}

const EMPTY_FORM = {
    name: "", email: "", phone: "", message: "", useWhatsApp: false, whatsappNumber: "", useWhatsApp: false,
    whatsappNumber: "",
    products: [],
};

function EnquiryModal({ isOpen, onClose, productId, productName, products = [],
    onRemove,
    onSuccess, }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [fieldErrors, setFieldErrors] = useState({});
    const [globalError, setGlobalError] = useState("");
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const overlayRef = useRef(null);

    // Animation lifecycle
    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            requestAnimationFrame(() =>
                requestAnimationFrame(() => setVisible(true))
            );
            document.body.style.overflow = "hidden";
        } else {
            setVisible(false);

            const t = setTimeout(() => {
                setMounted(false);
                document.body.style.overflow = "";
                setForm(EMPTY_FORM);
                setStatus("idle");
                setFieldErrors({});
                setGlobalError("");
            }, 320);

            return () => clearTimeout(t);
        }
    }, [isOpen]);
    useEffect(() => {
        if (!isOpen) return;

        if (productId) {
            setForm({
                ...EMPTY_FORM,
                products: [
                    {
                        id: productId,
                        name: productName,
                        quantity: 1,
                    },
                ],
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [isOpen, productId, productName]);
    // ESC to close
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    function setField(key) {
        return (val) => setForm((prev) => ({ ...prev, [key]: val }));
    }

    function validate() {
        const errors = {};
        if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address";
        if (!form.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (form.phone.length !== 10) {
            errors.phone = "Phone number must be 10 digits";
        }

        if (form.useWhatsApp) {
            if (!form.whatsappNumber.trim()) {
                errors.whatsappNumber =
                    "WhatsApp number is required";
            } else if (form.whatsappNumber.length !== 10) {
                errors.whatsappNumber =
                    "WhatsApp number must be 10 digits";
            }
        }
        return errors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (status === "loading" || status === "success") return;

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setStatus("loading");
        setFieldErrors({});
        setGlobalError("");


        try {
            const enqData = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                message: form.message,
                products: form.products.map((item) => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                })),
                whatsapp_number: form.useWhatsApp
                    ? (form.whatsappNumber || form.phone)
                    : null,
                tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || "t1",    
            };
            const res = await api.post("/products/enquiry", enqData);

            const responseData = res;

            if (!responseData) {
                throw new Error("Invalid server response");
            }

            if (responseData.statusCode !== 201) {
                throw new Error(responseData.message);
            }

            setStatus("success");

            onSuccess?.();

        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;

                if (status === 422) {
                    const mapped = {};

                    if (Array.isArray(data?.errors)) {
                        data.errors.forEach((e) => {
                            mapped[e.field] = e.message;
                        });
                    }

                    setFieldErrors(mapped);
                    setStatus("idle");
                    return;
                }

                setGlobalError(data?.message || "We could not send your enquiry. Please try again.");
            } else {
                setGlobalError("We could not send your enquiry. Please check your connection and try again.");
            }

            setStatus("error");
        }
    }

    if (!mounted) return null;

    const isLoading = status === "loading";
    const onlyDigits = (value) =>
        value.replace(/\D/g, "").slice(0, 10);
    return (
        <>
            <style>{`
                @keyframes enq-in  { from { opacity:0 } to { opacity:1 } }
                @keyframes enq-out { from { opacity:1 } to { opacity:0 } }
                @keyframes panel-in  { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
                @keyframes panel-out { from { opacity:1; transform:translateY(0) scale(1) }   to { opacity:0; transform:translateY(12px) scale(0.98) } }
                @keyframes wa-in  { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
                @keyframes spin   { to { transform:rotate(360deg) } }
                @keyframes chk    { from { stroke-dashoffset:50 } to { stroke-dashoffset:0 } }
                .enq-overlay { animation:${visible ? "enq-in .28s ease forwards" : "enq-out .32s ease forwards"}; }
                .enq-panel   { animation:${visible ? "panel-in .32s cubic-bezier(.22,1,.36,1) forwards" : "panel-out .28s ease forwards"}; }
                .enq-wa      { animation:wa-in .22s ease forwards; }
                .enq-spin    { animation:spin .75s linear infinite; }
                .enq-chk     { stroke-dasharray:50; stroke-dashoffset:50; animation:chk .5s ease .1s forwards; }
                .enq-panel::-webkit-scrollbar { display:none; }
                .enq-submit:hover:not(:disabled) { background:#c9a050 !important; letter-spacing:4px; }
                .enq-submit:active:not(:disabled) { transform:scale(.98); }
                .enq-close:hover { color:#b48a3c !important; transform:rotate(90deg); }
            `}</style>

            {/* Overlay — clicks outside close the modal */}
            <div
                ref={overlayRef}
                className="enq-overlay"
                onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
                role="dialog"
                aria-modal="true"
                aria-label={`Enquire about ${productName}`}
                style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(6, 4, 2, 0.82)",
                    backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "20px",
                }}
            >
                {/* Panel */}
                <div
                    className="enq-panel"
                    style={{
                        background: "#0f0d0b",
                        border: "1px solid #2a2520",
                        borderRadius: "3px",
                        width: "100%", maxWidth: "500px",
                        maxHeight: "85vh", overflowY: "auto",
                        position: "relative", scrollbarWidth: "none",
                        padding: "20px"
                    }}
                >
                    {/* Gold top bar */}
                    <div style={{ height: "2px", background: "linear-gradient(90deg,#b48a3c,#d4af37,#b48a3c)" }} />

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="enq-close"
                        aria-label="Close"
                        style={{
                            position: "absolute", top: 18, right: 22,
                            background: "none", border: "none", cursor: "pointer",
                            color: "#5a5048", fontSize: 18, lineHeight: 1, width: 44, height: 44, padding: 0, zIndex: 1,
                            transition: "color .2s, transform .2s",
                        }}
                    >✕</button>

                    {/* Header */}
                    <div style={{ padding: "32px 36px 24px" }}>
                        <p style={{ margin: "0 0 5px", color: "#b48a3c", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase" }}>
                            Sagunthala Jewellers
                        </p>
                        <h2 style={{ margin: "0 0 5px", color: "#f5f0e8", fontSize: "20px", fontWeight: 400, letterSpacing: ".5px", fontFamily: "Georgia, serif" }}>
                            Product Enquiry
                        </h2>
                        <p style={{ margin: 0, color: "#6a6058", fontSize: "12px", letterSpacing: ".3px" }}>{productName}</p>
                    </div>

                    <div style={{ height: 1, background: "#1e1c18", margin: "0 36px" }} />

                    {/* ── SUCCESS ── */}
                    {status === "success" ? (
                        <div style={{ padding: "44px 36px 48px", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                                    <circle cx="26" cy="26" r="25" stroke="#b48a3c" strokeWidth="1" opacity=".3" />
                                    <circle cx="26" cy="26" r="25" stroke="#b48a3c" strokeWidth="1"
                                        strokeDasharray="157" strokeDashoffset="0"
                                        style={{ animation: "chk .6s ease forwards" }} />
                                    <polyline points="15,26 22,33 37,18" stroke="#b48a3c" strokeWidth="1.5"
                                        fill="none" strokeLinecap="round" strokeLinejoin="round"
                                        className="enq-chk" />
                                </svg>
                            </div>
                            <p style={{ margin: "0 0 8px", color: "#b48a3c", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase" }}>Received</p>
                            <h3 style={{ margin: "0 0 12px", color: "#f5f0e8", fontSize: "18px", fontWeight: 400, fontFamily: "Georgia, serif" }}>Thank You</h3>
                            <p style={{ margin: "0 0 28px", color: "#7a7068", fontSize: "13px", lineHeight: 1.8 }}>
                                We&apos;ve received your enquiry for
                                <strong>
                                    {" "}
                                    {form.products.length} product
                                    {form.products.length > 1 ? "s" : ""}
                                </strong>.<br />
                                Our team will reach out within 24 hours.
                            </p>
                            <button
                                onClick={onClose}
                                style={{
                                    background: "none", border: "1px solid #3a3530", color: "#9a9088",
                                    fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
                                    padding: "11px 26px", cursor: "pointer", transition: "border-color .2s, color .2s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#b48a3c"; e.currentTarget.style.color = "#b48a3c"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3a3530"; e.currentTarget.style.color = "#9a9088"; }}
                            >Close</button>
                        </div>
                    ) : (
                        /* ── FORM ── */
                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ padding: "28px 36px 0", display: "flex", flexDirection: "column", gap: "26px" }}>
                                <FloatingInput id="enq-name" label="Full Name" value={form.name} onChange={setField("name")} required error={fieldErrors.name} disabled={isLoading} autoComplete="name" />
                                <FloatingInput id="enq-email" label="Email Address" type="email" value={form.email} onChange={setField("email")} required error={fieldErrors.email} disabled={isLoading} autoComplete="email" />
                                <FloatingInput
                                    id="enq-phone"
                                    label="Phone Number"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(value) => {
                                        const phone = onlyDigits(value);

                                        setForm((prev) => ({
                                            ...prev,
                                            phone,
                                            whatsappNumber: prev.useWhatsApp
                                                ? phone
                                                : prev.whatsappNumber,
                                        }));
                                    }}
                                    required
                                    error={fieldErrors.phone}
                                    disabled={isLoading}
                                    autoComplete="tel"
                                />
                                <FloatingTextarea id="enq-msg" label="Message (Optional)" value={form.message} onChange={setField("message")} disabled={isLoading} />

                                {/* WhatsApp checkbox */}
                                {/* WhatsApp checkbox */}
                                <div>
                                    <div
                                        onClick={() => {
                                            if (isLoading) return;

                                            const checked = !form.useWhatsApp;

                                            setForm((prev) => ({
                                                ...prev,
                                                useWhatsApp: checked,
                                                whatsappNumber: checked ? prev.phone : "",
                                            }));
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            cursor: isLoading ? "not-allowed" : "pointer",
                                            opacity: isLoading ? 0.5 : 1,
                                            userSelect: "none",
                                        }}
                                    >
                                        <div
                                            role="checkbox"
                                            aria-checked={form.useWhatsApp}
                                            tabIndex={0}
                                            style={{
                                                width: 15,
                                                height: 15,
                                                flexShrink: 0,
                                                border: `1px solid ${form.useWhatsApp ? "#b48a3c" : "#3a3530"
                                                    }`,
                                                background: form.useWhatsApp
                                                    ? "#b48a3c"
                                                    : "transparent",
                                                borderRadius: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "border-color .18s, background .18s",
                                            }}
                                        >
                                            {form.useWhatsApp && (
                                                <svg
                                                    width="9"
                                                    height="7"
                                                    viewBox="0 0 9 7"
                                                    fill="none"
                                                >
                                                    <polyline
                                                        points=".8,3.5 3.2,6 8.2,.8"
                                                        stroke="#0f0d0b"
                                                        strokeWidth="1.4"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        <span
                                            style={{
                                                color: "#7a7068",
                                                fontSize: "12px",
                                                letterSpacing: ".4px",
                                            }}
                                        >
                                            Use this number for WhatsApp updates
                                        </span>
                                    </div>

                                    {form.useWhatsApp && (
                                        <div className="enq-wa" style={{ marginTop: 18 }}>
                                            <FloatingInput
                                                id="enq-wa"
                                                label="WhatsApp Number"
                                                type="tel"
                                                value={form.whatsappNumber}
                                                onChange={(value) => {
                                                    const whatsapp = onlyDigits(value);

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        whatsappNumber: whatsapp,
                                                    }));
                                                }}
                                                required
                                                error={fieldErrors.whatsappNumber}
                                                disabled={isLoading}
                                                autoComplete="tel"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Global error */}
                                {status === "error" && globalError && (
                                    <div style={{ padding: "11px 14px", border: "1px solid #4a1515", background: "#180808", borderRadius: 2 }}>
                                        <p style={{ margin: 0, color: "#ef4444", fontSize: "12px" }}>{globalError}</p>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div style={{ padding: "32px 36px 36px" }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="enq-submit"
                                    style={{
                                        width: "100%", background: isLoading ? "#6a5a3a" : "#b48a3c",
                                        border: "none", color: "#0f0a1a",
                                        fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
                                        padding: "16px 20px", cursor: isLoading ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                        fontFamily: "inherit", fontWeight: 600,
                                        transition: "background .2s, letter-spacing .2s, transform .15s",
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="enq-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <circle cx="6.5" cy="6.5" r="5.5" stroke="#0f0a1a" strokeWidth="1.4" strokeDasharray="28" strokeDashoffset="9" strokeLinecap="round" />
                                            </svg>
                                            Sending…
                                        </>
                                    ) : "Send Enquiry"}
                                </button>
                                <p style={{ margin: "13px 0 0", textAlign: "center", color: "#3a3530", fontSize: "10px", letterSpacing: ".4px" }}>
                                    Your details are kept strictly confidential
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { id: "newest", label: "Newest First" },
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
    { id: "rating", label: "Highest Rated" },
    { id: "popularity", label: "Most Popular" },
    { id: "name-asc", label: "Name A-Z" },
    { id: "name-desc", label: "Name Z-A" },
];

const RatingStars = ({ value, size = "sm" }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    const sizeClass = size === "lg" ? "text-lg" : "text-xs";
    return (
        <div className={`flex items-center gap-1 ${sizeClass} text-amber-300`}>
            {stars.map((star) => (
                <span key={star} className="transition-colors duration-200">
                    {star <= value ? "★" : "☆"}
                </span>
            ))}
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Build the list of page numbers/ellipses to render, e.g. 1 … 4 5 [6] 7 8 … 20
    const pages = useMemo(() => {
        const delta = 1; // pages to show on each side of current
        const range = [];
        const withDots = [];
        let lastPage = 0;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((page) => {
            if (lastPage) {
                if (page - lastPage === 2) {
                    withDots.push(lastPage + 1);
                } else if (page - lastPage > 2) {
                    withDots.push("…");
                }
            }
            withDots.push(page);
            lastPage = page;
        });

        return withDots;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    const baseBtn =
        "min-w-11 h-11 px-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center";

    return (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${baseBtn} border border-stone-700 text-stone-300 hover:border-[#b48a3c] hover:text-[#b48a3c] disabled:opacity-30 disabled:hover:border-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed`}
                aria-label="Previous page"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {pages.map((page, idx) =>
                page === "…" ? (
                    <span key={`dots-${idx}`} className="min-w-11 h-11 flex items-center justify-center text-stone-500">
                        …
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                        className={`${baseBtn} ${
                            page === currentPage
                                ? "bg-[#b48a3c] text-[#0f0a1a] shadow-lg shadow-[#b48a3c]/30"
                                : "border border-stone-700 text-stone-300 hover:border-[#b48a3c] hover:text-[#b48a3c]"
                        }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${baseBtn} border border-stone-700 text-stone-300 hover:border-[#b48a3c] hover:text-[#b48a3c] disabled:opacity-30 disabled:hover:border-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed`}
                aria-label="Next page"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </nav>
    );
};

const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border border-stone-800 bg-[#11101a] p-4 shadow-lg">
        <div className="aspect-square bg-stone-800 rounded-xl mb-4" />
        <div className="h-4 bg-stone-800 rounded w-3/4 mb-2" />
        <div className="h-4 bg-stone-800 rounded w-1/2 mb-2" />
        <div className="h-4 bg-stone-800 rounded w-2/3 mb-4" />
        <div className="flex gap-2">
            <div className="h-8 bg-stone-800 rounded flex-1" />
            <div className="h-8 bg-stone-800 rounded flex-1" />
        </div>
    </div>
);

const ProductCard = ({ product, index, onEnquiry }) => {
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);

    const imageUrl =
        product.image_urls?.[0]?.url ||
        product.images?.[0]?.url ||
        product.image ||
        "/images/placeholder.jpg";

    const price = Number(product.price || product.price_in_cents || 0);

    const oldPrice = Number(
        product.originalPrice ||
        product.compare_price ||
        product.mrp ||
        price
    );

    const discount =
        oldPrice > price
            ? Math.round(((oldPrice - price) / oldPrice) * 100)
            : 0;

    const inStock =
        Number(
            product.stock_qty ||
            product.stock ||
            product.inventory ||
            0
        ) > 0;
    const canBuy = Boolean(product.isPurchasable);
    const canEnquire = Boolean(product.isEnquiryEnabled);

    return <><article className="group relative overflow-hidden rounded-2xl border border-stone-800/90 bg-[#161022] shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition duration-500 hover:-translate-y-1 hover:border-[#b48a3c]/55 hover:shadow-[0_24px_50px_rgba(0,0,0,0.42)] animate-fade-in" style={{ animationDelay: `${index * 45}ms` }}>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#120f1d]"><Link href={productHref(product)} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#d4af37]"><img src={imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" onError={(e) => { e.currentTarget.src = "/images/placeholder.jpg"; }} /></Link><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/65 via-transparent to-transparent opacity-70" />
        {product.category_name || product.category ? <span className="absolute left-3 top-3 rounded-full border border-[#d4af37]/35 bg-black/45 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#f0d984] backdrop-blur">{product.category_name || product.category}</span> : null}{discount > 0 ? <span className="absolute right-3 top-3 rounded-full bg-[#b48a3c] px-2.5 py-1 text-[10px] font-bold text-[#0f0a1a]">Save {discount}%</span> : null}
        {!inStock && canBuy ? <span className="absolute bottom-3 left-3 rounded-full border border-stone-600 bg-black/60 px-3 py-1 text-xs font-medium text-stone-100 backdrop-blur">Out of stock</span> : null}
        <div className="absolute inset-x-3 bottom-3 flex translate-y-0 gap-2 transition duration-300 sm:translate-y-16 sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0"><Link href={productHref(product)} className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-white/95 px-3 text-xs font-bold text-[#17111e] transition hover:bg-[#f6e2a1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">View piece</Link>{canBuy && inStock ? <button type="button" onClick={() => addToCart(product)} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[#b48a3c] px-3 text-[#0f0a1a] transition hover:bg-[#e4c46a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]" aria-label={`Add ${product.name} to cart`}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l2 12h10l2-8H7"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></button> : null}</div></div>
        <div className="p-4 sm:p-5"><Link href={productHref(product)} className="line-clamp-2 min-h-11 font-serif text-base leading-snug text-white transition hover:text-[#d4af37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4af37]">{product.name}</Link><div className="mt-3 flex items-end justify-between gap-3"><div><p className="text-lg font-semibold text-[#d4af37]">{canBuy ? `₹${price.toLocaleString("en-IN")}` : "Price on request"}</p>{discount > 0 ? <p className="mt-0.5 text-xs text-stone-500 line-through">₹{oldPrice.toLocaleString("en-IN")}</p> : null}</div><button type="button" onClick={() => setIsReviewsOpen(true)} className="min-h-11 rounded-md px-2 text-right text-xs text-stone-400 transition hover:text-[#f0d984] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4af37]" aria-label={`See reviews for ${product.name}`}><RatingStars value={Number(product.average_rating)} /><span className="mt-1 block">{product.review_count ? `${Number(product.average_rating || 0).toFixed(1)} · ${product.review_count}` : "No reviews"}</span></button></div>{canEnquire ? <button type="button" onClick={() => onEnquiry(product.id, product.name)} className="mt-4 min-h-11 text-xs font-semibold text-stone-300 underline decoration-stone-600 underline-offset-4 transition hover:text-[#d4af37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4af37]">Need help choosing?</button> : null}</div>
    </article>{isReviewsOpen ? <ReviewsModal product={product} onClose={() => setIsReviewsOpen(false)} /> : null}</>;
};

export default function ProductsListingPage() {
    // Server-driven: the current page of products plus the pagination
    // metadata the API returns alongside it. No client-side slicing.
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sidebar facets (category list + price bounds) — fetched once,
    // independent of the current page/filters, so the filter UI itself
    // doesn't shift around as the user paginates or filters.
    const [categories, setCategories] = useState([]);
    const [priceBounds, setPriceBounds] = useState([0, 1000000]);

    // Enquiry modal
    const [enquiryModal, setEnquiryModal] = useState({ open: false, productId: "", productName: "" });
    const openEnquiry = useCallback((productId, productName) => {
        setEnquiryModal({ open: true, productId, productName });
    }, []);
    const closeEnquiry = useCallback(() => {
        setEnquiryModal((prev) => ({ ...prev, open: false }));
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategoryValue, setSelectedCategoryValue] = useState("");
    const [ratingFilter, setRatingFilter] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 1000000]);

    const [sortOption, setSortOption] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [portalTarget, setPortalTarget] = useState(null);
    const productsTopRef = useRef(null);

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 40,
            borderRadius: 12,
            borderColor: state.isFocused ? "#b48a3c" : "#44403c",
            backgroundColor: "#12101b",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(180,138,60,0.2)" : "none",
            ":hover": { borderColor: "#b48a3c" },
        }),
        menu: (base) => ({ ...base, backgroundColor: "#12101b", border: "1px solid #44403c", zIndex: 1200 }),
        singleValue: (base) => ({ ...base, color: "#ffffff" }),
        option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#292524" : "#12101b", color: "#ffffff" }),
        input: (base) => ({ ...base, color: "#ffffff" }),
        placeholder: (base) => ({ ...base, color: "#a8a29e" }),
        indicatorSeparator: (base) => ({ ...base, backgroundColor: "#57534e" }),
        dropdownIndicator: (base) => ({ ...base, color: "#a8a29e" }),
        menuPortal: (base) => ({ ...base, zIndex: 1300 }),
    };

    const sortSelectOptions = SORT_OPTIONS.map((option) => ({ value: option.id, label: option.label }));
    const itemsPerPageOptions = [12, 24, 36, 48].map((count) => ({ value: count, label: String(count) }));
    const ratingOptions = [
        { value: 0, label: "All Ratings" },
        { value: 4, label: "4+ Stars" },
        { value: 3, label: "3+ Stars" },
        { value: 2, label: "2+ Stars" },
        { value: 1, label: "1+ Star" },
    ];

    // The category URL is the shareable source of truth. Listening for
    // popstate keeps browser Back/Forward aligned with the selected node.
    useEffect(() => {
        const syncFromLocation = () => {
            const params = new URLSearchParams(window.location.search);
            setSelectedCategoryValue(params.get("category") || "");
            setSearchQuery(params.get("search") || "");
        };
        syncFromLocation();
        window.addEventListener("popstate", syncFromLocation);
        return () => window.removeEventListener("popstate", syncFromLocation);
    }, []);

    // Debounce search — reset to page 1 in the same tick so the fetch effect
    // below only runs once per debounce cycle, not once for the search change
    // and again for the page reset.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const search = debouncedSearch.trim();
        if (search) params.set("search", search);
        else params.delete("search");
        params.delete("page");
        const query = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    }, [debouncedSearch]);

    // Same idea for the price slider: don't fire a request on every pixel of
    // drag, only once the user pauses.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPriceRange(priceRange);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [priceRange]);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === selectedCategoryValue || category.slug === selectedCategoryValue) || null,
        [categories, selectedCategoryValue]
    );
    const selectedCategoryId = selectedCategory?.id || "";
    const categoryFilter = useMemo(
        () => selectedCategory ? selectedCategoryIds(categories, selectedCategory.id) : [],
        [categories, selectedCategory]
    );

    // Sidebar facets — fetched once on mount. Independent of page/filters so
    // the category list and price slider bounds don't shift as the user
    // paginates or narrows their search.
    useEffect(() => {
        let cancelled = false;

        const fetchFilters = async () => {
            try {
                const { data } = await api.get("/products/public/products/filters");
                if (cancelled) return;
                setCategories(Array.isArray(data?.categories) ? data?.categories : []);
                const bounds = data?.priceRange;
                if (Array.isArray(bounds) && bounds.length === 2) {
                    setPriceBounds(bounds);
                    setPriceRange(bounds);
                    setDebouncedPriceRange(bounds);
                }
            } catch (err) {
                console.error("Failed to fetch product filters:", err);
            }
        };

        fetchFilters();
        return () => { cancelled = true; };
    }, []);

    // The actual product fetch. Runs whenever page, items-per-page, or any
    // (debounced) filter/sort value changes — search and price already come
    // in debounced so this doesn't fire on every keystroke/drag tick.
    // An AbortController cancels any in-flight request that gets superseded
    // by a newer one, so a slow stale response can never overwrite fresher
    // data (and no unnecessary state updates/renders happen for it).
    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
              const response = await api.get("/products/public/products", {
    signal: controller.signal,
    params: {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch.trim() || undefined,
        category: categoryFilter.length ? categoryFilter.join(",") : undefined,
        rating: ratingFilter || undefined,
        inStock: inStockOnly || undefined,
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
        sort: sortOption,
    },
});

setProducts(
    Array.isArray(response.data?.products)
        ? response.data.products
        : []
);

setPagination(response.data?.pagination || null);

                // setProducts(Array.isArray(data?.data?.products) ? data.data.products : []);
                // setPagination(data?.data?.pagination || null);
            } catch (err) {
                if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
                console.error("Failed to fetch products:", err);
                setError(err?.response?.data?.message || err?.message || "Failed to load products");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchProducts();
        return () => controller.abort();
    }, [currentPage, itemsPerPage, debouncedSearch, categoryFilter, ratingFilter, inStockOnly, debouncedPriceRange, sortOption]);

    // If a filter change makes the current page fall past the end of the
    // new result set (e.g. user was on page 5, a filter now only has 2
    // pages), snap back to the last valid page.
    useEffect(() => {
        if (pagination && pagination.totalPages > 0 && currentPage > pagination.totalPages) {
            setCurrentPage(pagination.totalPages);
        }
    }, [pagination, currentPage]);

    const totalPages = pagination?.totalPages || 1;

    const selectCategory = useCallback((category) => {
        const params = new URLSearchParams(window.location.search);
        if (category) params.set("category", category.slug || category.id);
        else params.delete("category");
        params.delete("page");
        const query = params.toString();
        window.history.pushState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
        setSelectedCategoryValue(category?.slug || category?.id || "");
        setCurrentPage(1);
        setShowFilters(false);
    }, []);

    const clearFilters = useCallback(() => {
        setSearchQuery("");
        setDebouncedSearch("");
        const params = new URLSearchParams(window.location.search);
        params.delete("category");
        params.delete("search");
        params.delete("page");
        const query = params.toString();
        window.history.pushState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
        setSelectedCategoryValue("");
        setRatingFilter(0);
        setInStockOnly(false);
        setPriceRange(priceBounds);
        setDebouncedPriceRange(priceBounds);
        setSortOption("newest");
        setCurrentPage(1);
    }, [priceBounds]);

    const goToPage = useCallback(
        (page) => {
            const clamped = Math.min(Math.max(page, 1), totalPages);
            if (clamped === currentPage) return;
            setCurrentPage(clamped);
            // Wait a tick so the new page has rendered before scrolling
            requestAnimationFrame(() => {
                productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        },
        [currentPage, totalPages]
    );

    useEffect(() => {
        if (!showFilters) return undefined;
        const originalOverflow = document.body.style.overflow;
        const originalRootOverflow = document.documentElement.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setShowFilters(false);
        };
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = originalOverflow;
            document.documentElement.style.overflow = originalRootOverflow;
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [showFilters]);

    return (
        <main className="bg-[#0f0a1a] min-h-screen pb-10">
            {/* Header Section */}
            <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0f0a1a] to-[#1a1525]">
                <div className="mx-auto max-w-[1440px] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">Discover Our Collection</h1>
                            <p className="text-sm text-stone-400">{pagination?.totalProducts ?? 0} exquisite pieces found</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="relative flex-1 sm:flex-initial">
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    type="search"
                                    placeholder="Search jewelry, diamonds, gold..."
                                    className="w-full max-w-sm rounded-xl border border-stone-700 bg-[#12101b] px-4 py-3 pl-10 text-sm text-white outline-none focus:border-[#b48a3c] focus:ring-2 focus:ring-[#b48a3c]/20 transition-all"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                onClick={clearFilters}
                                className="rounded-xl border border-stone-700 px-4 py-3 text-xs uppercase tracking-wider text-stone-300 hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all duration-200"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters((prev) => !prev)}
                                className="min-h-11 lg:hidden rounded-xl border border-stone-700 bg-[#12101b] px-4 py-2 text-sm text-stone-200 hover:border-[#b48a3c] transition-all"
                                aria-expanded={showFilters}
                                aria-controls="mobile-product-filters"
                            >
                                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filter / Categories{selectedCategory ? `: ${selectedCategory.name}` : ""}
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-stone-500">View:</span>
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${viewMode === "grid" ? "bg-[#b48a3c] text-[#0f0a1a]" : "text-stone-400 hover:text-white"}`}
                                    aria-label="Grid view"
                                    aria-pressed={viewMode === "grid"}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${viewMode === "list" ? "bg-[#b48a3c] text-[#0f0a1a]" : "text-stone-400 hover:text-white"}`}
                                    aria-label="List view"
                                    aria-pressed={viewMode === "list"}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-auto">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 text-xs uppercase tracking-wider text-stone-500">Sort:</span>
                                <div className="min-w-0 flex-1 sm:min-w-[220px] sm:flex-none">
                                    <Select
                                        instanceId="sort-select"
                                        value={sortSelectOptions.find((option) => option.value === sortOption) || null}
                                        options={sortSelectOptions}
                                        styles={selectStyles}
                                        menuPortalTarget={portalTarget}
                                        onChange={(option) => {
                                            setSortOption(option?.value || "newest");
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="shrink-0 text-xs uppercase tracking-wider text-stone-500">Show:</span>
                                <div className="w-[100px]">
                                    <Select
                                        instanceId="items-per-page-select"
                                        value={itemsPerPageOptions.find((option) => option.value === itemsPerPage) || null}
                                        options={itemsPerPageOptions}
                                        styles={selectStyles}
                                        menuPortalTarget={portalTarget}
                                        onChange={(option) => {
                                            setItemsPerPage(Number(option?.value || 12));
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">    {/* Filters Sidebar */}
                <aside className="hidden rounded-2xl border border-stone-800 bg-[#11101a] p-6 shadow-xl lg:block">
                    <h2 className="text-lg font-semibold uppercase text-stone-200 tracking-wider mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Categories
                    </h2>

                    <div className="space-y-6">
                        <CategoryHierarchy categories={categories} selectedCategoryId={selectedCategoryId} onSelect={selectCategory} />

                        {/* Price Range */}
                        {/* <div>
                            <p className="text-sm uppercase tracking-wider text-stone-400 mb-3 font-medium">Price Range</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-stone-200">
                                    <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
                                    <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="range"
                                        min={priceBounds[0]}
                                        max={priceBounds[1]}
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                    <input
                                        type="range"
                                        min={priceBounds[0]}
                                        max={priceBounds[1]}
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                </div>
                            </div>
                        </div> */}

                        {/* Rating */}
                        <div>
                            <p className="text-sm uppercase tracking-wider text-stone-400 mb-3 font-medium">Minimum Rating</p>
                            <Select
                                instanceId="rating-select"
                                value={ratingOptions.find((option) => option.value === ratingFilter) || null}
                                options={ratingOptions}
                                styles={selectStyles}
                                menuPortalTarget={portalTarget}
                                onChange={(option) => {
                                    setRatingFilter(Number(option?.value || 0));
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* In Stock */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="inStock"
                                checked={inStockOnly}
                                onChange={(e) => {
                                    setInStockOnly(e.target.checked);
                                    setCurrentPage(1);
                                }}
                                className="h-5 w-5 accent-[#b48a3c] rounded"
                            />
                            <label htmlFor="inStock" className="text-sm text-stone-200 hover:text-white cursor-pointer">In Stock Only</label>
                        </div>
                    </div>
                </aside>

                {showFilters ? <div id="mobile-product-filters" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter products by category">
                    <button type="button" aria-label="Close category filters" onClick={() => setShowFilters(false)} className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm" />
                    <aside className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border border-stone-700 bg-[#11101a] p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between border-b border-stone-800 pb-4">
                            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Browse</p><h2 className="mt-1 font-serif text-xl text-white">Categories</h2></div>
                            <button type="button" onClick={() => setShowFilters(false)} className="min-h-11 rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:border-[#d4af37] hover:text-[#d4af37]">Close</button>
                        </div>
                        <CategoryHierarchy categories={categories} selectedCategoryId={selectedCategoryId} onSelect={selectCategory} />
                    </aside>
                </div> : null}

                {/* Products Grid */}
                <section className="space-y-6" ref={productsTopRef}>
                    {isLoading && (
                        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                            {Array.from({ length: itemsPerPage }).map((_, idx) => <SkeletonCard key={idx} />)}
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="rounded-2xl border border-rose-800 bg-rose-950/30 p-8 text-center text-rose-200">
                            <svg className="w-12 h-12 mx-auto mb-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="font-semibold text-lg mb-2">{error}</p>
                            <p className="text-sm text-rose-300">Please refresh the page or try again later.</p>
                        </div>
                    )}

                    {!isLoading && !error && products.length === 0 && (
                        <div className="rounded-2xl border border-stone-800 bg-[#11101a] p-12 text-center text-stone-300">
                            <svg className="w-16 h-16 mx-auto mb-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold text-white mb-2">{selectedCategoryId ? "No products found in this category." : "No products found"}</h2>
                            <p className="text-sm text-stone-400 mb-4">Try adjusting your filters or search terms.</p>
                            <button onClick={clearFilters} className="rounded-xl border border-[#b48a3c] px-6 py-3 text-[#b48a3c] hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all">
                                View all products
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && products.length > 0 && (
                        <>
                            <div
                                key={currentPage}
                                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
                            >
                                {products.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} onEnquiry={openEnquiry} />
                                ))}
                            </div>

                            {/* Page Info */}
                            <div className="text-center text-sm text-stone-400">
                                Showing {(pagination.page - 1) * pagination.limit + 1}–
                                {Math.min(pagination.page * pagination.limit, pagination.totalProducts)} of {pagination.totalProducts} products
                            </div>

                            {/* Numbered Pagination */}
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                        </>
                    )}
                </section>
            </section>

            <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #b48a3c;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #b48a3c;
          cursor: pointer;
          border: none;
        }
      `}</style>

            {/* Enquiry Modal — rendered at page level so it overlays everything */}
            <EnquiryModal
                isOpen={enquiryModal.open}
                onClose={closeEnquiry}
                productId={enquiryModal.productId}
                productName={enquiryModal.productName}
            />
        </main>
    );
}
