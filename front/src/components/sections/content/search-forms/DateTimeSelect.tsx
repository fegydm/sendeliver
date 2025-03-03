// File: src/components/DateTimeSelect.tsx
// Last change: Renamed from DateTimePicker to DateTimeSelect for naming consistency and updated class names for BEM

import React, { useState, useCallback, useRef, useEffect } from 'react';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
// import './DateTimeSelect.css'; 

interface DateTimeSelectProps {
  value?: Date | string | null;
  onChange?: (date: Date) => void;
  className?: string;
  min?: Date;
  max?: Date;
  required?: boolean;
  disabled?: boolean;
  locationType?: 'pickup' | 'delivery'; // Added locationType prop
}

const pad = (num: number): string => num.toString().padStart(2, '0');

export const DateTimeSelect: React.FC<DateTimeSelectProps> = ({
  value = null,
  onChange,
  className = '',
  min,
  max,
  required = false,
  disabled = false,
  locationType = 'pickup', // Default to pickup if not specified
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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const formatDate = useCallback((date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }, []);

  const formatTime = useCallback((date: Date): string => {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, []);

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

  const handleDateChange = useCallback(
    (newDate: Date) => {
      const updatedDate = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );

      console.log('[DateTimeSelect] handleDateChange:', { newDate, updatedDate, min, max });

      checkPastDate(updatedDate);

      if ((min && updatedDate < min) || (max && updatedDate > max)) {
        console.warn('[DateTimeSelect] Selected date is out of allowed range', { updatedDate, min, max });
        return;
      }

      setSelectedDate(updatedDate);
      if (dateInputRef.current) {
        dateInputRef.current.value = formatDate(updatedDate);
      }
      if (timeInputRef.current) {
        timeInputRef.current.value = formatTime(updatedDate);
      }
      onChange?.(updatedDate);
    },
    [selectedDate, onChange, min, max, formatDate, formatTime, checkPastDate]
  );

  const handleTimeChange = useCallback(
    (timeString: string) => {
      console.log('[DateTimeSelect] handleTimeChange received:', timeString);
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn('[DateTimeSelect] Invalid time string:', timeString);
        return;
      }

      const updatedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        minutes
      );

      console.log('[DateTimeSelect] New time:', { hours, minutes, updatedDate, min, max });

      if ((min && updatedDate < min) || (max && updatedDate > max)) {
        console.warn('[DateTimeSelect] Selected date and time are out of allowed range', { updatedDate, min, max });
        return;
      }

      setSelectedDate(updatedDate);
      if (dateInputRef.current) {
        dateInputRef.current.value = formatDate(updatedDate);
      }
      if (timeInputRef.current) {
        timeInputRef.current.value = formatTime(updatedDate);
      }
      onChange?.(updatedDate);
    },
    [selectedDate, onChange, min, max, formatDate, formatTime]
  );

  const handleInputClick = useCallback(() => {
    if (!disabled) {
      setIsPickerOpen(true);
    }
  }, [disabled]);

  useEffect(() => {
    const newDate = getInitialDate();
    if (newDate.getTime() !== selectedDate.getTime()) {
      setSelectedDate(newDate);
      checkPastDate(newDate);
      if (dateInputRef.current) {
        dateInputRef.current.value = formatDate(newDate);
      }
      if (timeInputRef.current) {
        timeInputRef.current.value = formatTime(newDate);
      }
    }
  }, [value, formatDate, formatTime, checkPastDate, selectedDate]);

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

  // Construct class names according to BEM methodology
  const containerClassName = disabled ? 'date-time date-time--disabled' : 'date-time';
  const dateInputClassName = `date-time__date-input date-time__date-input--${locationType} ${className}`;
  const timeInputClassName = `date-time__time-input date-time__time-input--${locationType} ${className}`;

  return (
    <div ref={containerRef} className={containerClassName}>
      <input
        ref={dateInputRef}
        type="text"
        readOnly
        value={formatDate(selectedDate)}
        onClick={handleInputClick}
        className={dateInputClassName}
        placeholder="YYYY-MM-DD"
        disabled={disabled}
        required={required}
      />
      <input
        ref={timeInputRef}
        type="text"
        readOnly
        value={formatTime(selectedDate)}
        onClick={handleInputClick}
        className={timeInputClassName}
        placeholder="HH:MM"
        disabled={disabled}
        required={required}
      />
      {isPickerOpen && !disabled && (
        <div className="date-time__dropdown">
          <div className="date-time__container">
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
            <div className="date-time__warning">{pastDateWarning}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimeSelect;