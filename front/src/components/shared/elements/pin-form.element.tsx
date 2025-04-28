// File: front/src/components/shared/elements/pin-form.element.tsx
// Last change: Added security logging for PIN attempts

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logger } from "@sendeliver/logger";
import "@/styles/components/pin-form.component.css";

interface PinFormProps {
  domain: string;                // napr. "hauler"
  onCorrectPin: () => void;
}

const PinForm: React.FC<PinFormProps> = ({ domain, onCorrectPin }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Pre meranie rýchlosti zadávania
  const lastKeyTimeRef = useRef<number | null>(null);
  const typingPatternRef = useRef<number[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Log access to PIN form
    logger.info(`PIN form accessed`, {
      domain,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    });
  }, [domain]);

  const collectDeviceInfo = () => {
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

  const verifyPin = async (value: string) => {
    try {
      const deviceInfo = collectDeviceInfo();
      setAttempts(prev => prev + 1);
      
      // Log PIN attempt before verification
      logger.info(`PIN verification attempt`, {
        domain,
        attemptNumber: attempts + 1,
        timestamp: new Date().toISOString(),
        typingSpeed: typingPatternRef.current,
        hasTypingPattern: typingPatternRef.current.length > 0,
        // Nelogujeme samotný PIN, iba metadáta
      });
      
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          domain, 
          pin: value,
          deviceInfo // Posielame informácie o zariadení na server
        }),
      });
      
      const body = await res.json();
      
      if (body.success) {
        // Log successful PIN
        logger.info(`PIN verification successful`, {
          domain,
          timestamp: new Date().toISOString(),
          attemptNumber: attempts + 1
        });
        onCorrectPin();
      } else {
        throw new Error("Invalid PIN");
      }
    } catch (error) {
      // Log failed PIN
      logger.warn(`PIN verification failed`, {
        domain,
        timestamp: new Date().toISOString(),
        attemptNumber: attempts + 1,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      setError("Nesprávny PIN");
      setPin("");
      
      // Reset pattern tracking
      typingPatternRef.current = [];
      lastKeyTimeRef.current = null;
      
      setTimeout(() => setError(""), 1500);
    }
  };

  const trackTypingPattern = () => {
    const now = performance.now();
    
    if (lastKeyTimeRef.current !== null) {
      const timeSinceLastKey = now - lastKeyTimeRef.current;
      typingPatternRef.current.push(Math.round(timeSinceLastKey));
    }
    
    lastKeyTimeRef.current = now;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    
    trackTypingPattern();
    
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
        
        <p className="security-notice">Z bezpečnostných dôvodov monitorujeme prístupové pokusy.</p>
      </form>
    </div>
  );
};

export default PinForm;