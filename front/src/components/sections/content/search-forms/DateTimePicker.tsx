// File: src/components/DateTimePicker.tsx
// Artifact: Fixed DateTimePicker with logs to debug value transfer issues
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDateTime = useCallback((date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, []);

  const handleDateChange = useCallback((newDate: Date) => {
    const updatedDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      selectedDate.getHours(),
      selectedDate.getMinutes()
    );
    console.log('[DateTimePicker] handleDateChange:', { newDate, updatedDate, min, max });
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
  }, [selectedDate, onChange, min, max, formatDateTime]);

  const handleTimeChange = useCallback((timeString: string) => {
    console.log('[DateTimePicker] handleTimeChange received:', timeString);
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn('[DateTimePicker] Invalid time string:', timeString);
      return;
    }
    const updatedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );
    console.log('[DateTimePicker] New time:', { hours, minutes, updatedDate, min, max });
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
      if (inputRef.current) {
        inputRef.current.value = formatDateTime(newDate);
        console.log('[DateTimePicker] Initial input value set:', inputRef.current.value);
      }
    }
  }, [value]);

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
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              min={min}
              max={max}
            />
            <TimePicker
              value={`${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`}
              onChange={handleTimeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimePicker;