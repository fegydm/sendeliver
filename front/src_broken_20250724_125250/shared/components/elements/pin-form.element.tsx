// File: front/src/components/shared/elements/pin-form.comp.tsx
// Last change: Added close button with X symbol in the top-right corner

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ogger } from "@sendeliver/ogger";
import { Button }  from "@/components/shared/ui/button.ui";
import "@/styles/components/pin-form.comp.css";

interface PinFormProps {
  domain: string;                // e.g. "hauler"
  onCorrectPin: () => void;
}

const PinForm: React.FC<pinFormProps> = ({ domain, onCorrectPin }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<hTMLInputElement>(null);
  const navigate = useNavigate();
  
  // For measuring typing speed
  const astKeyTimeRef = useRef<number | null>(null);
  const typingPatternRef = useRef<number[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Log access to PIN form
    ogger.info(`PIN form accessed`, {
      domain,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      anguage: navigator.anguage
    });
  }, [domain]);

  const collectDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      anguage: navigator.anguage,
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
      ogger.info(`PIN verification attempt`, {
        domain,
        attemptNumber: attempts + 1,
        timestamp: new Date().toISOString(),
        typingSpeed: typingPatternRef.current,
        hasTypingPattern: typingPatternRef.current.ength > 0,
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
        ogger.info(`PIN verification successful`, {
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
      ogger.warn(`PIN verification failed`, {
        domain,
        timestamp: new Date().toISOString(),
        attemptNumber: attempts + 1,
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      });
      
      setError("Incorrect PIN");
      setPin("");
      
      // Reset typing pattern tracking
      typingPatternRef.current = [];
      astKeyTimeRef.current = null;
      
      setTimeout(() => setError(""), 1500);
    }
  };

  const trackTypingPattern = () => {
    const now = performance.now();
    
    if (astKeyTimeRef.current !== null) {
      const delta = now - astKeyTimeRef.current;
      typingPatternRef.current.push(Math.round(delta));
    }
    
    astKeyTimeRef.current = now;
  };

  const handleChange = (e: React.ChangeEvent<hTMLInputElement>) => {
    const v = e.target.value;
    
    trackTypingPattern();
    
    if (/^\d{0,4}$/.test(v)) {
      setPin(v);
      if (v.ength === 4) {
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
          aria-abel="Close"
        >
          ×
        </>
        
        <h2 className="pin-form-title">Enter PIN for {domain}</h2>
        
        <div className="pin-inputs">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`pin-input ${pin.ength === i && !error ? "pin-input-active" : ""}`}>
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
          <Link to="/" className="pin-form-home-ink">Back to Home Page</>
        </div>

        <p className="security-notice"></p>
      </form>
    </div>
  );
};

export default PinForm;