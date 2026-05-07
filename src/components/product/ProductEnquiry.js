"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useEnquiry } from "@/hooks/useEnquiry";

// ─── FloatingInput ────────────────────────────────────────────────────────────

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
                    borderBottom: `1px solid ${error ? "#c0392b" : focused ? "#c9a96e" : "#3a3530"}`,
                    borderRadius: 0,
                    outline: "none",
                    width: "100%",
                    padding: "22px 0 8px",
                    color: "#f5f0e8",
                    fontSize: "14px",
                    letterSpacing: "0.3px",
                    transition: "border-color 0.25s ease",
                    cursor: disabled ? "not-allowed" : "text",
                    opacity: disabled ? 0.5 : 1,
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
                    color: error ? "#c0392b" : floated ? "#c9a96e" : "#7a7068",
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                    fontFamily: "inherit",
                }}
            >
                {label}
                {required && <span style={{ color: "#c9a96e", marginLeft: "3px" }}>*</span>}
            </label>
            {error && (
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#c0392b", letterSpacing: "0.5px" }}>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── FloatingTextarea ─────────────────────────────────────────────────────────

function FloatingTextarea({ id, label, value, onChange, error, disabled }) {
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
                    borderBottom: `1px solid ${error ? "#c0392b" : focused ? "#c9a96e" : "#3a3530"}`,
                    borderRadius: 0,
                    outline: "none",
                    width: "100%",
                    padding: "22px 0 8px",
                    color: "#f5f0e8",
                    fontSize: "14px",
                    letterSpacing: "0.3px",
                    resize: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.25s ease",
                    opacity: disabled ? 0.5 : 1,
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
                    color: error ? "#c0392b" : floated ? "#c9a96e" : "#7a7068",
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                }}
            >
                {label}
            </label>
        </div>
    );
}

// ─── EnquiryModal ─────────────────────────────────────────────────────────────

const INITIAL_FORM = {
    name: "",
    email: "",
    phone: "",
    message: "",
    productId: "",
    productName: "",
    useWhatsApp: false,
    whatsappNumber: "",
};

export default function EnquiryModal({ isOpen, onClose, productId, productName }) {
    const { status, errorMessage, fieldErrors, submit, reset } = useEnquiry();

    const [form, setForm] = useState({ ...INITIAL_FORM, productId, productName });
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const overlayRef = useRef(null);
    const firstInputRef = useRef(null);

    // Sync product info when props change
    useEffect(() => {
        if (isOpen) {
            setForm((prev) => ({ ...prev, productId, productName }));
        }
    }, [isOpen, productId, productName]);

    // Animation lifecycle
    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
            document.body.style.overflow = "hidden";
        } else {
            setVisible(false);
            const t = setTimeout(() => {
                setMounted(false);
                document.body.style.overflow = "";
                setForm({ ...INITIAL_FORM, productId, productName });
                reset();
            }, 350);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // ESC key to close
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape" && isOpen) onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    // Auto-focus first input
    useEffect(() => {
        if (visible) {
            setTimeout(() => firstInputRef.current && firstInputRef.current.focus(), 100);
        }
    }, [visible]);

    const handleOverlayClick = useCallback(
        (e) => {
            if (e.target === overlayRef.current) onClose();
        },
        [onClose]
    );

    function setField(key) {
        return (value) => setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (status === "loading" || status === "success") return;
        await submit(form);
    }

    function getFieldError(field) {
        return fieldErrors[field] ? fieldErrors[field][0] : undefined;
    }

    if (!mounted) return null;

    return (
        <>
            <style>{`
        @keyframes eq-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes eq-fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes eq-slide-up { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes eq-slide-down { from { opacity: 1; transform: translateY(0) scale(1) } to { opacity: 0; transform: translateY(16px) scale(0.98) } }
        @keyframes eq-wa-reveal { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes eq-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes eq-check { from { stroke-dashoffset: 50 } to { stroke-dashoffset: 0 } }
        .eq-overlay { animation: ${visible ? "eq-fade-in 0.3s ease forwards" : "eq-fade-out 0.35s ease forwards"}; }
        .eq-panel { animation: ${visible ? "eq-slide-up 0.35s cubic-bezier(0.22,1,0.36,1) forwards" : "eq-slide-down 0.3s ease forwards"}; }
        .eq-wa-field { animation: eq-wa-reveal 0.25s ease forwards; }
        .eq-spinner { animation: eq-spin 0.8s linear infinite; }
        .eq-checkmark { stroke-dasharray: 50; stroke-dashoffset: 50; animation: eq-check 0.5s ease 0.1s forwards; }
        .eq-submit-btn { transition: background 0.2s ease, transform 0.15s ease, letter-spacing 0.2s ease; }
        .eq-submit-btn:hover:not(:disabled) { background: #d4b07a !important; letter-spacing: 4px; }
        .eq-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .eq-close-btn { transition: color 0.2s ease, transform 0.2s ease; }
        .eq-close-btn:hover { color: #c9a96e !important; transform: rotate(90deg); }
        .eq-panel::-webkit-scrollbar { display: none; }
      `}</style>

            {/* Overlay */}
            <div
                ref={overlayRef}
                onClick={handleOverlayClick}
                className="eq-overlay"
                role="dialog"
                aria-modal="true"
                aria-label={`Enquire about ${productName}`}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    background: "rgba(8, 6, 4, 0.85)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                }}
            >
                {/* Panel */}
                <div
                    className="eq-panel"
                    style={{
                        background: "#0f0d0b",
                        border: "1px solid #2a2520",
                        borderRadius: "2px",
                        width: "100%",
                        maxWidth: "520px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        position: "relative",
                        scrollbarWidth: "none",
                    }}
                >
                    {/* Gold top bar */}
                    <div style={{ height: "2px", background: "linear-gradient(90deg, #c9a96e, #e8d5a3, #c9a96e)" }} />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="eq-close-btn"
                        aria-label="Close modal"
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "24px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#5a5048",
                            fontSize: "20px",
                            lineHeight: 1,
                            padding: "4px",
                            zIndex: 1,
                        }}
                    >
                        ✕
                    </button>

                    {/* Header */}
                    <div style={{ padding: "36px 40px 28px" }}>
                        <p style={{ margin: "0 0 6px", color: "#c9a96e", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase" }}>
                            Sagunthala Jewellers
                        </p>
                        <h2 style={{ margin: "0 0 6px", color: "#f5f0e8", fontSize: "22px", fontWeight: 400, letterSpacing: "0.5px", fontFamily: "Georgia, serif" }}>
                            Request an Enquiry
                        </h2>
                        <p style={{ margin: 0, color: "#6a6058", fontSize: "12px", letterSpacing: "0.5px" }}>
                            {productName}
                        </p>
                    </div>

                    <div style={{ height: "1px", background: "#1e1c18", margin: "0 40px" }} />

                    {/* ── SUCCESS STATE ── */}
                    {status === "success" ? (
                        <div style={{ padding: "48px 40px 52px", textAlign: "center" }}>
                            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
                                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                                    <circle cx="28" cy="28" r="27" stroke="#c9a96e" strokeWidth="1" opacity="0.3" />
                                    <circle cx="28" cy="28" r="27" stroke="#c9a96e" strokeWidth="1"
                                        strokeDasharray="170" strokeDashoffset="0"
                                        style={{ animation: "eq-check 0.6s ease forwards" }}
                                    />
                                    <polyline
                                        points="17,28 24,35 39,20"
                                        stroke="#c9a96e"
                                        strokeWidth="1.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="eq-checkmark"
                                    />
                                </svg>
                            </div>
                            <p style={{ margin: "0 0 10px", color: "#c9a96e", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase" }}>Received</p>
                            <h3 style={{ margin: "0 0 14px", color: "#f5f0e8", fontSize: "20px", fontWeight: 400, fontFamily: "Georgia, serif" }}>Thank You</h3>
                            <p style={{ margin: "0 0 32px", color: "#7a7068", fontSize: "13px", lineHeight: 1.8 }}>
                                We've received your enquiry for{" "}
                                <span style={{ color: "#c9a96e" }}>{productName}</span>.
                                <br />Our team will reach out within 24 hours.
                            </p>
                            <button
                                onClick={onClose}
                                style={{
                                    background: "none",
                                    border: "1px solid #3a3530",
                                    color: "#9a9088",
                                    fontSize: "10px",
                                    letterSpacing: "3px",
                                    textTransform: "uppercase",
                                    padding: "12px 28px",
                                    cursor: "pointer",
                                    transition: "border-color 0.2s, color 0.2s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a96e"; e.currentTarget.style.color = "#c9a96e"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3a3530"; e.currentTarget.style.color = "#9a9088"; }}
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        /* ── FORM ── */
                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ padding: "32px 40px 0", display: "flex", flexDirection: "column", gap: "28px" }}>
                                <FloatingInput
                                    id="eq-name"
                                    label="Full Name"
                                    value={form.name}
                                    onChange={setField("name")}
                                    required
                                    error={getFieldError("name")}
                                    disabled={status === "loading"}
                                    autoComplete="name"
                                />
                                <FloatingInput
                                    id="eq-email"
                                    label="Email Address"
                                    type="email"
                                    value={form.email}
                                    onChange={setField("email")}
                                    required
                                    error={getFieldError("email")}
                                    disabled={status === "loading"}
                                    autoComplete="email"
                                />
                                <FloatingInput
                                    id="eq-phone"
                                    label="Phone Number"
                                    type="tel"
                                    value={form.phone}
                                    onChange={setField("phone")}
                                    required
                                    error={getFieldError("phone")}
                                    disabled={status === "loading"}
                                    autoComplete="tel"
                                />
                                <FloatingTextarea
                                    id="eq-message"
                                    label="Message (Optional)"
                                    value={form.message}
                                    onChange={setField("message")}
                                    error={getFieldError("message")}
                                    disabled={status === "loading"}
                                />

                                {/* WhatsApp section */}
                                <div>
                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            cursor: status === "loading" ? "not-allowed" : "pointer",
                                            opacity: status === "loading" ? 0.5 : 1,
                                            userSelect: "none",
                                        }}
                                    >
                                        <div
                                            onClick={() => setField("useWhatsApp")(!form.useWhatsApp)}
                                            role="checkbox"
                                            aria-checked={form.useWhatsApp}
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === " " && setField("useWhatsApp")(!form.useWhatsApp)}
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                border: `1px solid ${form.useWhatsApp ? "#c9a96e" : "#3a3530"}`,
                                                background: form.useWhatsApp ? "#c9a96e" : "transparent",
                                                borderRadius: "1px",
                                                flexShrink: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                transition: "border-color 0.2s, background 0.2s",
                                            }}
                                        >
                                            {form.useWhatsApp && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <polyline points="1,4 3.5,6.5 9,1" stroke="#0f0d0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span style={{ color: "#7a7068", fontSize: "12px", letterSpacing: "0.5px" }}>
                                            Use this number for WhatsApp updates
                                        </span>
                                    </label>

                                    {form.useWhatsApp && (
                                        <div className="eq-wa-field" style={{ marginTop: "20px" }}>
                                            <FloatingInput
                                                id="eq-whatsapp"
                                                label="WhatsApp Number"
                                                type="tel"
                                                value={form.whatsappNumber}
                                                onChange={setField("whatsappNumber")}
                                                required
                                                error={getFieldError("whatsapp_number")}
                                                disabled={status === "loading"}
                                                autoComplete="tel"
                                            />
                                            <p style={{ margin: "8px 0 0", fontSize: "10px", color: "#4a4540", letterSpacing: "0.5px" }}>
                                                Include country code, e.g. +91 98765 43210
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Global error */}
                                {status === "error" && errorMessage && (
                                    <div style={{ padding: "12px 16px", border: "1px solid #4a1a1a", background: "#1a0a0a", borderRadius: "1px" }}>
                                        <p style={{ margin: 0, color: "#c0392b", fontSize: "12px", letterSpacing: "0.3px" }}>
                                            {errorMessage}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div style={{ padding: "36px 40px 40px" }}>
                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="eq-submit-btn"
                                    style={{
                                        width: "100%",
                                        background: status === "loading" ? "#6a5a3a" : "#c9a96e",
                                        border: "none",
                                        color: "#0f0d0b",
                                        fontSize: "10px",
                                        letterSpacing: "3px",
                                        textTransform: "uppercase",
                                        padding: "17px 24px",
                                        cursor: status === "loading" ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        fontFamily: "inherit",
                                        fontWeight: 500,
                                    }}
                                >
                                    {status === "loading" ? (
                                        <>
                                            <svg className="eq-spinner" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <circle cx="7" cy="7" r="6" stroke="#0f0d0b" strokeWidth="1.5" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round" />
                                            </svg>
                                            Sending
                                        </>
                                    ) : (
                                        "Send Enquiry"
                                    )}
                                </button>
                                <p style={{ margin: "16px 0 0", textAlign: "center", color: "#3a3530", fontSize: "11px", letterSpacing: "0.5px" }}>
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