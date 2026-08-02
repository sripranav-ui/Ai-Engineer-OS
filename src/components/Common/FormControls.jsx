import React, { useState, useId, useRef, useEffect } from "react";
import Button from "./Button";
import Badge from "./Badge";

/**
 * Enterprise Form Controls Library
 * Theme-aware suite of form control components.
 */

// --- 1. FormInput ---
export function FormInput({ label, type = "text", placeholder, value, onChange, error, success, className = "", ...props }) {
  const id = useId();
  return (
    <div className={`input-group ${className}`} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && <label htmlFor={id} className="input-label" style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>{label}</label>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? "input-error" : ""} ${success ? "input-success" : ""}`}
        style={{
          background: "var(--surface-1)",
          border: `1px solid ${error ? "var(--danger)" : success ? "var(--success)" : "var(--border-default)"}`,
          borderRadius: "8px",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: "13.5px",
          outline: "none"
        }}
        {...props}
      />
      {error && <span style={{ color: "var(--danger)", fontSize: "11px", marginTop: "2px" }}>⚠️ {error}</span>}
      {success && <span style={{ color: "var(--success)", fontSize: "11px", marginTop: "2px" }}>✓ {success}</span>}
    </div>
  );
}

// --- 2. FormTextarea ---
export function FormTextarea({ label, placeholder, value, onChange, error, success, rows = 3, className = "", ...props }) {
  const id = useId();
  return (
    <div className={`input-group ${className}`} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && <label htmlFor={id} className="input-label" style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>{label}</label>}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? "input-error" : ""} ${success ? "input-success" : ""}`}
        style={{
          background: "var(--surface-1)",
          border: `1px solid ${error ? "var(--danger)" : success ? "var(--success)" : "var(--border-default)"}`,
          borderRadius: "8px",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: "13.5px",
          outline: "none",
          resize: "vertical"
        }}
        {...props}
      />
      {error && <span style={{ color: "var(--danger)", fontSize: "11px", marginTop: "2px" }}>⚠️ {error}</span>}
    </div>
  );
}

// --- 3. FormCheckbox ---
export function FormCheckbox({ label, checked, onChange, error, className = "", ...props }) {
  const id = useId();
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent)" }}
        {...props}
      />
      {label && <label htmlFor={id} style={{ color: "var(--text-primary)", fontSize: "13px", cursor: "pointer" }}>{label}</label>}
      {error && <span style={{ color: "var(--danger)", fontSize: "11px" }}>⚠️ {error}</span>}
    </div>
  );
}

// --- 4. FormSwitch ---
export function FormSwitch({ label, checked, onChange, className = "" }) {
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
      {label && <span style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>{label}</span>}
      <label style={{ position: "relative", display: "inline-block", width: "44px", height: "22px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? "var(--accent)" : "var(--surface-3)",
            transition: "0.2s",
            borderRadius: "34px",
            border: "1px solid var(--border-default)"
          }}
        />
        <span
          style={{
            position: "absolute",
            content: '""',
            height: "16px",
            width: "16px",
            left: checked ? "24px" : "3px",
            bottom: "2px",
            backgroundColor: "var(--surface-1)",
            boxShadow: "var(--shadow-xs)",
            transition: "0.2s",
            borderRadius: "50%"
          }}
        />
      </label>
    </div>
  );
}

// --- 5. FormDatePicker ---
export function FormDatePicker({ label, value, onChange, error, className = "", ...props }) {
  return (
    <FormInput
      label={label}
      type="date"
      value={value}
      onChange={onChange}
      error={error}
      className={className}
      {...props}
    />
  );
}

// --- 6. FormDropdown ---
export function FormDropdown({ label, options = [], value, onChange, error, className = "" }) {
  const id = useId();
  return (
    <div className={`input-group ${className}`} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && <label htmlFor={id} className="input-label" style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>{label}</label>}
      <select
        id={id}
        value={value}
        onChange={onChange}
        style={{
          background: "var(--surface-1)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border-default)"}`,
          borderRadius: "8px",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: "13.5px",
          outline: "none",
          cursor: "pointer"
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "var(--surface-1)", color: "var(--text-primary)" }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ color: "var(--danger)", fontSize: "11px" }}>⚠️ {error}</span>}
    </div>
  );
}

// --- 7. FormSearch ---
export function FormSearch({ placeholder = "Search properties...", value, onChange, className = "" }) {
  return (
    <div className={className} style={{ position: "relative", width: "100%" }}>
      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", fontSize: "13px" }}>
        🔍
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          background: "var(--surface-1)",
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
          padding: "10px 14px 10px 36px",
          color: "var(--text-primary)",
          fontSize: "13.5px",
          outline: "none"
        }}
      />
    </div>
  );
}

// --- 8. FormAutocomplete ---
export function FormAutocomplete({ label, options = [], value, onChange, placeholder, error, className = "" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className={`input-group ${className}`} style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
      {label && <label className="input-label" style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        value={open ? query : options.find(o => o.value === value)?.label || query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        style={{
          background: "var(--surface-1)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border-default)"}`,
          borderRadius: "8px",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: "13.5px",
          outline: "none"
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "var(--surface-1)",
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
          zIndex: 10,
          maxHeight: "150px",
          overflowY: "auto",
          marginTop: "4px",
          boxShadow: "var(--shadow-md)"
        }}>
          {filtered.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setQuery(opt.label);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
                borderBottom: "1px solid var(--border-subtle)"
              }}
              onMouseEnter={(e) => e.target.style.background = "var(--surface-3)"}
              onMouseLeave={(e) => e.target.style.background = "none"}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {error && <span style={{ color: "var(--danger)", fontSize: "11px" }}>⚠️ {error}</span>}
    </div>
  );
}

// --- 9. FormPassword ---
export function FormPassword({ label, placeholder, value, onChange, error, className = "" }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`input-group ${className}`} style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
      {label && <label className="input-label" style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            background: "var(--surface-1)",
            border: `1px solid ${error ? "var(--danger)" : "var(--border-default)"}`,
            borderRadius: "8px",
            padding: "10px 42px 10px 14px",
            color: "var(--text-primary)",
            fontSize: "13.5px",
            outline: "none"
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          {show ? "👁️" : "🙈"}
        </button>
      </div>
      {error && <span style={{ color: "var(--danger)", fontSize: "11px" }}>⚠️ {error}</span>}
    </div>
  );
}

// --- 10. FormOTP ---
export function FormOTP({ length = 6, value = "", onChange, error, className = "" }) {
  const inputsRef = useRef([]);

  const handleChange = (val, idx) => {
    const nextArr = value.split("");
    nextArr[idx] = val.slice(-1);
    const combined = nextArr.join("");
    onChange(combined);

    if (val && idx < length - 1) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const filledValue = value.padEnd(length, " ").split("");

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {filledValue.map((char, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            value={char.trim()}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            style={{
              width: "40px",
              height: "44px",
              textAlign: "center",
              background: "var(--surface-1)",
              border: `1.5px solid ${error ? "var(--danger)" : "var(--border-default)"}`,
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "18px",
              fontWeight: "700",
              outline: "none"
            }}
          />
        ))}
      </div>
      {error && <span style={{ color: "var(--danger)", fontSize: "11.5px" }}>⚠️ {error}</span>}
    </div>
  );
}

// --- 11. LoadingButton ---
export function LoadingButton({ children, loading, onClick, type = "primary", disabled, style = {}, ...props }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...style
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: "14px",
            height: "14px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.9s linear infinite"
          }}
        />
      )}
      {children}
    </Button>
  );
}
export default FormInput;
