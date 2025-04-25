// File: front/src/components/shared/elements/pin-form.element.tsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/components/pin-form.component.css";
interface PinFormProps {
  domain: string;                // napr. "hauler"
  onCorrectPin: () => void;
}

const PinForm: React.FC<PinFormProps> = ({ domain, onCorrectPin }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const verifyPin = async (value: string) => {
    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain, pin: value }),
      });
      const body = await res.json();
      if (body.success) {
        onCorrectPin();
      } else {
        throw new Error("Invalid PIN");
      }
    } catch {
      setError("Nesprávny PIN");
      setPin("");
      setTimeout(() => setError(""), 1500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^\d{0,4}$/.test(v)) {
      setPin(v);
      if (v.length === 4) {
        verifyPin(v);
      }
    }
  };

  return (
    <div className="pin-form-container" onClick={() => inputRef.current?.focus()}>
      <form onSubmit={(e) => e.preventDefault()} className={`pin-form ${error ? "error" : ""}`}>
        <h2 className="pin-form-title">Enter PIN for {domain}</h2>
        <div className="pin-inputs">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`pin-input ${pin.length === i && !error ? "pin-input-active" : ""}`}>
              {pin[i] || ""}
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          type="tel"
          value={pin}
          onChange={handleChange}
          className="hidden-input"
          maxLength={4}
          autoComplete="off"
          inputMode="numeric"
        />
        {error && <p className="error-message">{error}</p>}

        <div className="pin-form-footer">
          <Link to="/" className="pin-form-home-link">Späť na domovskú stránku</Link>
          <button type="button" className="pin-form-close-btn" onClick={() => navigate(-1)}>
            Zatvoriť
          </button>
        </div>
      </form>
    </div>
  );
};

export default PinForm;
