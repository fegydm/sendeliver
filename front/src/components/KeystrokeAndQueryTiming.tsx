// File: src/components/KeystrokeAndQueryTiming.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const KeystrokeAndQueryTiming = () => {
  // State for input value and measured intervals between key presses
  const [inputValue, setInputValue] = useState('');
  const [keystrokeIntervals, setKeystrokeIntervals] = useState<number[]>([]);
  const lastKeyTimeRef = useRef<number | null>(null);

  // State for simulated SQL query execution time
  const [queryTime, setQueryTime] = useState<number | null>(null);

  // Use debounce hook to wait 300ms after the last key press
  const debouncedValue = useDebounce(inputValue, 300);

  // Handler pre keyDown – meria interval medzi stlačeniami
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = performance.now();
    if (lastKeyTimeRef.current !== null) {
      const interval = now - lastKeyTimeRef.current;
      setKeystrokeIntervals(prev => [...prev, interval]);
      console.log(`Interval since last key: ${interval.toFixed(2)} ms`);
    }
    lastKeyTimeRef.current = now;
  };

  // useEffect spustí "SQL dotaz" (simulovaný fetch) po uplynutí debounce delay
  useEffect(() => {
    if (debouncedValue === '') {
      // Ak je vstup prázdny, zresetujeme meranie query
      setQueryTime(null);
      return;
    }
    console.log(`Debounced value updated: "${debouncedValue}" at ${performance.now().toFixed(2)} ms`);
    const start = performance.now();
    // Simulujeme SQL dotaz – nahraďte túto časť reálnym fetchom na vaše API
    setTimeout(() => {
      const end = performance.now();
      const elapsed = end - start;
      setQueryTime(elapsed);
      console.log(`SQL query executed in ${elapsed.toFixed(2)} ms for value: "${debouncedValue}"`);
    }, 100); // Simulácia dotazu s oneskorením 100 ms (prispôsobte podľa potreby)
  }, [debouncedValue]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Keystroke and SQL Query Timing</h1>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type something..."
        style={{ width: '300px', padding: '8px', fontSize: '16px' }}
      />
      <div style={{ marginTop: '20px' }}>
        <h2>Keystroke Intervals (ms):</h2>
        <ul>
          {keystrokeIntervals.map((interval, idx) => (
            <li key={idx}>{interval.toFixed(2)} ms</li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Latest SQL Query Execution Time:</h2>
        <p>{queryTime !== null ? `${queryTime.toFixed(2)} ms` : 'No query executed yet'}</p>
      </div>
    </div>
  );
};

export default KeystrokeAndQueryTiming;
