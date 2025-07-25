// File: front/src/components/shared/elements/pin-form.element.tsx
// Last change: Added close button with X symbol in the top-right corner

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logger } from "@sendeliver/logger";
import { Button }  from "@/components/shared/ui/button.ui";
import "@/styles/components/pin-form.component.css";

interface PinFormProps {
  domain: string;                // e.g. "hauler"
  onCorrectPin: () => void;
}

const PinForm: React.FC<PinFormProps> = ({ domain, onCorrectPin }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // For measuring typing speed
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
      
      // Log PIN verification attempt (metadata only, no PIN value)
      logger.info(`PIN verification attempt`, {
        domain,
        attemptNumber: attempts + 1,
        timestamp: new Date().toISOString(),
        typingSpeed: typingPatternRef.current,
        hasTypingPattern: typingPatternRef.current.length > 0,
      });
      
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          domain, 
          pin: value,
          deviceInfo // Sending device information for security
        }),
      });
      
      const body = await res.json();
      
      if (body.success) {
        // Log successful verification
        logger.info(`PIN verification successful`, {
          domain,
          timestamp: new Date().toISOString(),
          attemptNumber: attempts + 1
        });
        onCorrectPin();
      } else {
        throw new Error("Invalid PIN");
      }
    } catch (err) {
      // Log failed verification
      logger.warn(`PIN verification failed`, {
        domain,
        timestamp: new Date().toISOString(),
        attemptNumber: attempts + 1,
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      });
      
      setError("Incorrect PIN");
      setPin("");
      
      // Reset typing pattern tracking
      typingPatternRef.current = [];
      lastKeyTimeRef.current = null;
      
      setTimeout(() => setError(""), 1500);
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
      <form onSubmit={e => e.preventDefault()} className={`pin-form ${error ? "error" : ""}`}>
        <Button 
          variant="close" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="pin-form-close-btn"
          aria-label="Close"
        >
          ×
        </Button>
        
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
          <Link to="/" className="pin-form-home-link">Back to Home Page</Link>
        </div>

        <p className="security-notice"></p>
      </form>
    </div>
  );
};

export default PinForm;