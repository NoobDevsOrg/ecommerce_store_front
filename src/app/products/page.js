"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Select from "react-select";
import { getPublicProducts } from "../../lib/publicApi";
import { api } from "../../lib/api";

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
                    fontSize: "14px",
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
                    fontSize: "14px",
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

const EMPTY_FORM = { name: "", email: "", phone: "", message: "", useWhatsApp: false, whatsappNumber: "" };

function EnquiryModal({ isOpen, onClose, productId, productName }) {
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
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
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
                product_id: productId,
                use_whatsapp: form.useWhatsApp,
                whatsapp_number: form.useWhatsApp
                    ? (form.whatsappNumber || form.phone)
                    : null
            };
            const res = await api.post("/products/enquiry", enqData);

            console.log("FULL RESPONSE:", res);

            const responseData = res;

            if (!responseData) {
                throw new Error("Invalid server response");
            }

            const { success, message, data } = responseData;
            console.log("success", success);
            console.log("message", message);
            console.log("data", data)

            if (!success) {
                throw new Error(message || "Submission failed");
            }

            console.log("Enquiry ID:", data?.id);

            setStatus("success");

        } catch (err) {
            console.error("ERROR:", err);

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

                setGlobalError(data?.message || "Submission failed");
            } else {
                console.error("Network/JS Error:", err.message);
                setGlobalError(err.message || "Something went wrong");
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
                            color: "#5a5048", fontSize: 18, lineHeight: 1, padding: 4, zIndex: 1,
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
                                We've received your enquiry for <span style={{ color: "#b48a3c" }}>{productName}</span>.<br />
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
    const imageUrl =
        product.image_urls?.[0]?.url ||
        product.images?.[0]?.url ||
        product.image ||
        "/images/placeholder.jpg";

    const price = Number(product.price || product.price_in_cents || 0);
    const oldPrice = Number(product.originalPrice || product.compare_price || product.mrp || price);
    const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    const rating = Math.min(5, Math.max(0, Number(product.rating || product.star_rating || 0)));
    const inStock = Number(product.stock_qty || product.stock || product.inventory || 0) > 0;

    return (
        <article
            className="group overflow-hidden rounded-2xl border border-stone-800 bg-[#11101a] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#b48a3c]/20 hover:border-[#b48a3c]/50 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.name || "Product"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(event) => { event.currentTarget.src = "/images/placeholder.jpg"; }}
                />
                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discount}%
                    </div>
                )}
                {!inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm bg-stone-800 px-3 py-1 rounded-full">Out of Stock</span>
                    </div>
                )}
            </Link>
            <div className="p-4 space-y-3">
                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white leading-snug group-hover:text-[#b48a3c] transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-[#d4af37]">₹{price.toLocaleString("en-IN")}</span>
                        {discount > 0 && (
                            <span className="text-sm text-stone-400 line-through">₹{oldPrice.toLocaleString("en-IN")}</span>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        <RatingStars value={rating} />
                        <span className="text-xs text-stone-400">{product.reviewCount || 0} reviews</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {/* "Add to Cart" replaced with "Add Enquiry" */}
                    <button
                        onClick={() => onEnquiry(product.id, product.name)}
                        className="flex-1 rounded-lg border border-[#b48a3c] px-3 py-2 text-sm text-[#b48a3c] hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-200 font-medium"
                    >
                        Enquiry Now
                    </button>
                    <button className="flex-1 rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all duration-200">
                        Wishlist
                    </button>
                </div>
            </div>
        </article>
    );
};

export default function ProductsListingPage() {
    const [rawProducts, setRawProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1000000]);

    const [sortOption, setSortOption] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getPublicProducts(1, 500);
                const products = Array.isArray(data?.products) ? data.products : [];
                setRawProducts(products);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError(err?.message || "Failed to load products");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = useMemo(() => {
        const set = new Set();
        rawProducts.forEach((product) => {
            if (product.category_name) set.add(product.category_name);
            if (product.category) set.add(product.category);
        });
        return Array.from(set).sort();
    }, [rawProducts]);

    const priceBounds = useMemo(() => {
        const prices = rawProducts.map((p) => Number(p.price || p.originalPrice || p.compare_price || 0)).filter(Boolean);
        if (!prices.length) return [0, 1000000];
        return [Math.min(...prices), Math.max(...prices)];
    }, [rawProducts]);

    useEffect(() => {
        if (priceBounds[0] !== 0 && priceBounds[1] !== 1000000) {
            setPriceRange(priceBounds);
        }
    }, [priceBounds]);

    const filteredProducts = useMemo(() => {
        let items = [...rawProducts];

        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase();
            items = items.filter((p) =>
                (p.name || "").toLowerCase().includes(query) ||
                (p.slug || "").toLowerCase().includes(query) ||
                (p.description || "").toLowerCase().includes(query)
            );
        }

        if (categoryFilter.length) {
            items = items.filter((p) => categoryFilter.includes(p.category_name || p.category));
        }

        if (ratingFilter > 0) {
            items = items.filter((p) => Number(p.rating || p.star_rating || 0) >= ratingFilter);
        }

        if (inStockOnly) {
            items = items.filter((p) => Number(p.stock_qty || p.stock || p.inventory || 0) > 0);
        }

        items = items.filter((p) => {
            const price = Number(p.price || p.originalPrice || p.compare_price || 0);
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Sorting
        switch (sortOption) {
            case "price-asc":
                items.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)));
                break;
            case "price-desc":
                items.sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)));
                break;
            case "rating":
                items.sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)));
                break;
            case "popularity":
                items.sort((a, b) => (Number(b.reviewCount || 0) - Number(a.reviewCount || 0)));
                break;
            case "name-asc":
                items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case "name-desc":
                items.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            default: // newest
                items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        return items;
    }, [rawProducts, debouncedSearch, categoryFilter, ratingFilter, inStockOnly, priceRange, sortOption]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const displayedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const clearFilters = useCallback(() => {
        setSearchQuery("");
        setCategoryFilter([]);
        setRatingFilter(0);
        setInStockOnly(false);
        setPriceRange(priceBounds);
        setSortOption("newest");
        setCurrentPage(1);
    }, [priceBounds]);

    const toggleCategory = useCallback((category) => {
        setCategoryFilter((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    }, []);

    const loadMore = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, totalPages]);

    return (
        <main className="bg-[#0f0a1a] min-h-screen pb-10">
            {/* Header Section */}
            <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0f0a1a] to-[#1a1525]">
                <div className="mx-auto max-w-[1440px] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">Discover Our Collection</h1>
                            <p className="text-sm text-stone-400">{filteredProducts.length} exquisite pieces found</p>
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
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters((prev) => !prev)}
                                className="lg:hidden rounded-xl border border-stone-700 bg-[#12101b] px-4 py-2 text-sm text-stone-200 hover:border-[#b48a3c] transition-all"
                            >
                                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-stone-500">View:</span>
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#b48a3c] text-[#0f0a1a]" : "text-stone-400 hover:text-white"}`}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#b48a3c] text-[#0f0a1a]" : "text-stone-400 hover:text-white"}`}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-stone-500">Sort:</span>
                                <div className="min-w-[220px]">
                                    <Select
                                        value={sortSelectOptions.find((option) => option.value === sortOption) || null}
                                        options={sortSelectOptions}
                                        styles={selectStyles}
                                        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                        onChange={(option) => setSortOption(option?.value || "newest")}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-stone-500">Show:</span>
                                <div className="w-[100px]">
                                    <Select
                                        value={itemsPerPageOptions.find((option) => option.value === itemsPerPage) || null}
                                        options={itemsPerPageOptions}
                                        styles={selectStyles}
                                        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
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
            <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8 py-8">
                {/* Filters Sidebar */}
                <aside className={`${showFilters ? "block" : "hidden"} lg:block rounded-2xl border border-stone-800 bg-[#11101a] p-6 shadow-xl`}>
                    <h2 className="text-lg font-semibold uppercase text-stone-200 tracking-wider mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </h2>

                    <div className="space-y-6">
                        {/* Categories */}
                        <div>
                            <p className="text-sm uppercase tracking-wider text-stone-400 mb-3 font-medium">Categories</p>
                            <div className="space-y-2 max-h-48 overflow-auto pr-2">
                                {categories.length === 0 ? (
                                    <p className="text-sm text-stone-500">No categories available</p>
                                ) : (
                                    categories.map((category) => (
                                        <label key={category} className="flex items-center gap-3 text-sm text-stone-200 hover:text-white cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={categoryFilter.includes(category)}
                                                onChange={() => toggleCategory(category)}
                                                className="h-4 w-4 accent-[#b48a3c] rounded"
                                            />
                                            <span className="group-hover:text-[#b48a3c] transition-colors">{category}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
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
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                    <input
                                        type="range"
                                        min={priceBounds[0]}
                                        max={priceBounds[1]}
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <p className="text-sm uppercase tracking-wider text-stone-400 mb-3 font-medium">Minimum Rating</p>
                            <Select
                                value={ratingOptions.find((option) => option.value === ratingFilter) || null}
                                options={ratingOptions}
                                styles={selectStyles}
                                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                onChange={(option) => setRatingFilter(Number(option?.value || 0))}
                            />
                        </div>

                        {/* In Stock */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="inStock"
                                checked={inStockOnly}
                                onChange={(e) => setInStockOnly(e.target.checked)}
                                className="h-5 w-5 accent-[#b48a3c] rounded"
                            />
                            <label htmlFor="inStock" className="text-sm text-stone-200 hover:text-white cursor-pointer">In Stock Only</label>
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <section className="space-y-6">
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

                    {!isLoading && !error && filteredProducts.length === 0 && (
                        <div className="rounded-2xl border border-stone-800 bg-[#11101a] p-12 text-center text-stone-300">
                            <svg className="w-16 h-16 mx-auto mb-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold text-white mb-2">No products found</h2>
                            <p className="text-sm text-stone-400 mb-4">Try adjusting your filters or search terms.</p>
                            <button onClick={clearFilters} className="rounded-xl border border-[#b48a3c] px-6 py-3 text-[#b48a3c] hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all">
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && filteredProducts.length > 0 && (
                        <>
                            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                                {displayedProducts.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} onEnquiry={openEnquiry} />
                                ))}
                            </div>

                            {/* Load More Button */}
                            {currentPage < totalPages && (
                                <div className="text-center">
                                    <button
                                        onClick={loadMore}
                                        className="rounded-xl border border-[#b48a3c] px-8 py-4 text-[#b48a3c] hover:bg-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-200 font-medium"
                                    >
                                        Load More Products
                                    </button>
                                </div>
                            )}

                            {/* Page Info */}
                            <div className="text-center text-sm text-stone-400">
                                Showing {displayedProducts.length} of {filteredProducts.length} products
                            </div>
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