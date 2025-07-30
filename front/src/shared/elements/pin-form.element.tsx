// File: front/src/shared/elements/pin-form.element.tsx
// Last change: Refactored to be a pure form element, modal logic removed

import React, { useState, useEffect, useRef } from "react";
import { logger } from "@sendeliver/logger";
import "./pin-form.element.css";

// Interface for device information collected for security purposes
interface DeviceInfo {
  userAgent: string;
  language: string;
  screenSize: string;
  timeZone: string;
  platform: string;
  doNotTrack: string | null;
  cookieEnabled: boolean;
  typingPattern: number[];
}

interface PinFormProps {
  // The parent component is now responsible for the verification logic
  onVerify: (pin: string, deviceInfo: DeviceInfo) => Promise<boolean>;
}

const PinForm: React.FC<PinFormProps> = ({ onVerify }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const lastKeyTimeRef = useRef<number | null>(null);
  const typingPatternRef = useRef<number[]>([]);

  useEffect(() => {
    // Focus the hidden input when the component mounts
    inputRef.current?.focus();
  }, []);

  const collectDeviceInfo = (): DeviceInfo => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      doNotTrack: navigator.doNotTrack,
      cookieEnabled: navigator.cookieEnabled,
      typingPattern: typingPatternRef.current
    };
  };

  const handleVerify = async (value: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    
    const deviceInfo = collectDeviceInfo();
    
    try {
      const isSuccess = await onVerify(value, deviceInfo);
      if (!isSuccess) {
        throw new Error("PIN verification failed by parent");
      }
      // On success, the parent is responsible for what happens next.
      // This component's job is done.
    } catch (err) {
      logger.warn(`PIN verification failed`, {
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      });
      
      setError("Incorrect PIN");
      setPin("");
      typingPatternRef.current = [];
      lastKeyTimeRef.current = null;
      
      setTimeout(() => setError(""), 1500);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const trackTypingPattern = () => {
    const now = performance.now();
    if (lastKeyTimeRef.current !== null) {
      const delta = now - lastKeyTimeRef.current;
      typingPatternRef.current.push(Math.round(delta));
    }
    lastKeyTimeRef.current = now;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    trackTypingPattern();
    
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
      if (value.length === 4) {
        handleVerify(value);
      }
    }
  };

  // The component now only renders the form itself, without any modal wrappers
  return (
    <form onSubmit={e => e.preventDefault()} className={`pin-form ${error ? "error" : ""}`}>
      <div className="pin-inputs" onClick={() => inputRef.current?.focus()}>
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
        disabled={isLoading}
      />
      
      {<p className="error-message">{error || " "}</p>}
    </form>
  );
};

export default PinForm;
