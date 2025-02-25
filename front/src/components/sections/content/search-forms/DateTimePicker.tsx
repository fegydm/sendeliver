// File: src/components/DateTimePicker.tsx
// Last change: Fixed "Today" selection, allowed past dates with warning, made time selection independent

import React, { useState, useCallback, useRef, useEffect } from 'react';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import './DateTimePicker.css';

interface DateTimePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date) => void;
  label?: string;
  className?: string;
  min?: Date;
  max?: Date;
  required?: boolean;
  disabled?: boolean;
}

const pad = (num: number): string => num.toString().padStart(2, '0');

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value = null,
  onChange,
  label = 'Select Date and Time',
  className = '',
  min,
  max,
  required = false,
  disabled = false,
}) => {
  const getInitialDate = (): Date => {
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return !isNaN(parsed.getTime()) ? parsed : new Date();
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pastDateWarning, setPastDateWarning] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDateTime = useCallback((date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, []);

  // Check if a date is in the past
  const checkPastDate = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate < today) {
      setPastDateWarning("Selected date is in the past");
    } else {
      setPastDateWarning(null);
    }
  }, []);

  const handleDateChange = useCallback((newDate: Date) => {
    // We'll allow past dates but show a warning
    const updatedDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      selectedDate.getHours(),
      selectedDate.getMinutes()
    );
    
    console.log('[DateTimePicker] handleDateChange:', { newDate, updatedDate, min, max });
    
    // Check for past date and show warning if needed
    checkPastDate(updatedDate);
    
    // Check min/max constraints
    if ((min && updatedDate < min) || (max && updatedDate > max)) {
      console.warn('[DateTimePicker] Selected date is out of allowed range', { updatedDate, min, max });
      return;
    }
    
    setSelectedDate(updatedDate);
    if (inputRef.current) {
      inputRef.current.value = formatDateTime(updatedDate);
      console.log('[DateTimePicker] Updated input value:', inputRef.current.value);
    }
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max, formatDateTime, checkPastDate]);

  const handleTimeChange = useCallback((timeString: string) => {
    console.log('[DateTimePicker] handleTimeChange received:', timeString);
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn('[DateTimePicker] Invalid time string:', timeString);
      return;
    }
    
    // Create new date with updated time
    const updatedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );
    
    console.log('[DateTimePicker] New time:', { hours, minutes, updatedDate, min, max });
    
    // Check min/max but still allow past dates
    if ((min && updatedDate < min) || (max && updatedDate > max)) {
      console.warn('[DateTimePicker] Selected date and time are out of allowed range', { updatedDate, min, max });
      return;
    }
    
    setSelectedDate(updatedDate);
    if (inputRef.current) {
      inputRef.current.value = formatDateTime(updatedDate);
      console.log('[DateTimePicker] Updated input value:', inputRef.current.value);
    }
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max, formatDateTime]);

  useEffect(() => {
    const newDate = getInitialDate();
    if (newDate.getTime() !== selectedDate.getTime()) {
      setSelectedDate(newDate);
      checkPastDate(newDate);
      if (inputRef.current) {
        inputRef.current.value = formatDateTime(newDate);
        console.log('[DateTimePicker] Initial input value set:', inputRef.current.value);
      }
    }
  }, [value, formatDateTime, checkPastDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`datetime-picker-wrapper ${disabled ? 'disabled' : ''}`}>
      {label && (
        <label className="datetime-picker-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      <div className="datetime-picker-input-container">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formatDateTime(selectedDate)}
          onClick={() => !disabled && setIsPickerOpen(!isPickerOpen)}
          className={`datetime-picker-input ${className}`}
          placeholder="Select date and time"
          disabled={disabled}
          required={required}
        />
        {isPickerOpen && !disabled && (
          <div className="datetime-picker-dropdown">
            <div className="date-time-container">
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                min={min}
                max={max}
                allowPastDates={true}
              />
              <TimePicker
                value={`${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`}
                onChange={handleTimeChange}
              />
            </div>
            {pastDateWarning && (
              <div className="datetime-warning-message">{pastDateWarning}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimePicker;