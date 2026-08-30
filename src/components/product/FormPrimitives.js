"use client";

import { Children, useMemo } from "react";
import Select from "react-select";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function FormSection({ title, description, children, tone = "default" }) {
  return (
    <section
      className={cx(
        "rounded-lg border bg-[#0c0816] p-5 shadow-sm md:p-6",
        tone === "accent"
          ? "border-[#b48a3c]/50 shadow-[#b48a3c]/20"
          : "border-stone-800",
      )}
    >
      <header className="mb-5 space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
        {description ? <p className="text-sm text-stone-400">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function FormField({ id, label, required = false, helperText, error, children }) {
  const helperId = helperText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-stone-300">
        {label}
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </label>
      {typeof children === "function" ? children({ describedBy, error: Boolean(error) }) : children}
      {helperText ? (
        <p id={helperId} className="text-xs text-stone-500">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-start gap-1 text-xs font-medium text-red-400">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, error, ...props }) {
  return (
    <input
      {...props}
      className={cx(
        "block w-full rounded-lg border border-stone-800 bg-[#161022] px-3 py-2 text-sm text-white placeholder:text-stone-500 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500",
        error && "border-red-500 focus:border-red-500 focus:ring-red-300",
        className
      )}
    />
  );
}

export function TextareaInput({ className, error, ...props }) {
  return (
    <textarea
      {...props}
      className={cx(
        "block w-full rounded-lg border border-stone-800 bg-[#161022] px-3 py-2 text-sm text-white placeholder:text-stone-500 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500",
        error && "border-red-500 focus:border-red-500 focus:ring-red-300",
        className
      )}
    />
  );
}

export function SelectInput({ className, error, children, ...props }) {
  const { value, onChange, onBlur, disabled, id } = props;

  const { options, placeholder } = useMemo(() => {
    let derivedPlaceholder = "Select an option";
    const derivedOptions = [];

    Children.forEach(children, (child) => {
      if (!child || child.type !== "option") return;
      const optionValue = child.props?.value;
      const optionLabel = child.props?.children;

      if (optionValue === "") {
        derivedPlaceholder = String(optionLabel || derivedPlaceholder);
        return;
      }

      derivedOptions.push({ value: String(optionValue), label: String(optionLabel || optionValue) });
    });

    return { options: derivedOptions, placeholder: derivedPlaceholder };
  }, [children]);

  const selectedOption = options.find((option) => option.value === String(value ?? "")) || null;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 40,
      borderRadius: 8,
      borderColor: error ? "#ef4444" : state.isFocused ? "#57534e" : "#292524",
      backgroundColor: "#161022",
      boxShadow: state.isFocused ? `0 0 0 2px ${error ? "rgba(252,165,165,0.35)" : "rgba(168,162,158,0.35)"}` : "none",
      ":hover": { borderColor: error ? "#ef4444" : "#57534e" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#161022",
      border: "1px solid #292524",
      borderRadius: 8,
      overflow: "hidden",
      zIndex: 1200,
    }),
    singleValue: (base) => ({ ...base, color: "#ffffff" }),
    placeholder: (base) => ({ ...base, color: "#78716c" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#292524" : "#161022",
      color: "#ffffff",
      cursor: "pointer",
    }),
    input: (base) => ({ ...base, color: "#ffffff" }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: "#44403c" }),
    dropdownIndicator: (base) => ({ ...base, color: "#a8a29e", ":hover": { color: "#ffffff" } }),
    menuPortal: (base) => ({ ...base, zIndex: 1300 }),
  };

  return (
    <Select
      inputId={id}
      value={selectedOption}
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
      className={className}
      classNamePrefix="react-select"
      styles={selectStyles}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      onChange={(option) => onChange?.({ target: { value: option?.value || "" } })}
      onBlur={() => onBlur?.()}
    />
  );
}

export function ToggleField({ id, label, description, checked, onChange, disabled = false }) {
  return (
    <label
      htmlFor={id}
      className={cx(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-stone-800 bg-[#161022] p-3 transition hover:border-stone-600",
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-stone-600 text-[#b48a3c] focus:ring-2 focus:ring-stone-500"
      />
      <span>
        <span className="block text-sm font-medium text-stone-300">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-stone-400">{description}</span> : null}
      </span>
    </label>
  );
}

export function PrimaryButton({ className, children, ...props }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[#b48a3c] px-5 py-2.5 text-sm font-semibold text-white transition duration-150 hover:bg-[#d4af37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48a3c] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ className, children, ...props }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center rounded-lg border border-stone-800 bg-[#161022] px-4 py-2.5 text-sm font-medium text-stone-300 transition hover:border-stone-600 hover:bg-[#0c0816] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500",
        className,
      )}
    >
      {children}
    </button>
  );
}
