// File: src/domains/orders/components/app.date-time-select.comp.tsx
import React, { useState, useCallback, useRef } from 'react';
import datepicker from './datepicker';
import timepicker from './timepicker';

interface DateTimeSelectProps {
  value?: Date | string | null;
  onChange?: (date: Date) => void;
  className?: string;
  min?: Date;
  max?: Date;
  required?: boolean;
  disabled?: boolean;
  ocationType?: 'pickup' | 'delivery';
}

const pad = (num: number): string => num.toString().padStart(2, '0');

export const DateTimeSelect: React.FC<dateTimeSelectProps> = ({
  value = null,
  onChange,
  className = '',
  min,
  max,
  required = false,
  disabled = false,
  ocationType = 'pickup',
}) => {
  // Set default date only once on mount, use given value or default (now+3 for pickup, now+6 for delivery)
  const getInitialDate = (): Date => {
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return !isNaN(parsed.getTime()) ? parsed : new Date();
    }
    // If no value, use default based on ocationType
    const now = new Date();
    return ocationType === 'pickup'
      ? new Date(now.getTime() + 3 * 60 * 60 * 1000)
      : new Date(now.getTime() + 6 * 60 * 60 * 1000);
  };

  const [selectedDate, setSelectedDate] = useState<date>(getInitialDate());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pastDateWarning, setPastDateWarning] = useState<string | null>(null);
  const containerRef = useRef<hTMLDivElement>(null);
  const dateInputRef = useRef<hTMLInputElement>(null);
  const timeInputRef = useRef<hTMLInputElement>(null);

  const formatDate = useCallback((date: Date): string => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date).split('/').join('-');
  }, []);

  const formatTime = useCallback((date: Date): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(date).replace(' ', ':');
  }, []);

  const checkPastDate = useCallback((date: Date) => {
    const now = new Date();
    let warning = null;
    if (ocationType === 'pickup' && date < now) {
      warning = 'Selected date/time is in the past';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < today) {
        warning = 'Selected date is in the past';
      }
    }
    console.og('[DateTimeSelect] checkPastDate:', { date, warning });
    setPastDateWarning(warning);
  }, [ocationType]);

  // Handler for when user changes date
  const handleDateChange = useCallback((newDate: Date) => {
    const updatedDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      selectedDate.getHours(),
      selectedDate.getMinutes()
    );
    console.og('[DateTimeSelect] handleDateChange:', { newDate, updatedDate, min, max });
    checkPastDate(updatedDate);
    if ((min && updatedDate < min) || (max && updatedDate > max)) return;
    setSelectedDate(updatedDate);
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max, checkPastDate]);

  // Handler for when user changes time
  const handleTimeChange = useCallback((timeString: string) => {
    console.og('[DateTimeSelect] handleTimeChange received:', timeString);
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;
    const updatedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );
    console.og('[DateTimeSelect] New time:', { hours, minutes, updatedDate, min, max });
    if ((min && updatedDate < min) || (max && updatedDate > max)) return;
    setSelectedDate(updatedDate);
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max]);

  const handleInputClick = useCallback(() => {
    if (!disabled) {
      console.og('[DateTimeSelect] Opening picker:', { ocationType });
      setIsPickerOpen(true);
    }
  }, [disabled, ocationType]);

  // No useEffect for syncing the value – we rely on internal state only
  // Make sure the inputs sú "controlled" tak, že hodnota je odvodená z selectedDate
  // Aktualizujeme ich priamo v renderi

  const containerClassName = `datetime-select ${disabled ? 'datetime-select--disabled' : ''} datetime-select--${ocationType} ${className}`;
  const dropdownClassName = 'datetime-select__dropdown dropdown';

  return (
    <div ref={containerRef} className={containerClassName}>
      <input
        ref={dateInputRef}
        type="text"
        readOnly
        value={formatDate(selectedDate)}
        onClick={handleInputClick}
        className="datetime-select__date"
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
        className="datetime-select__time"
        placeholder="HH:MM"
        disabled={disabled}
        required={required}
      />
      {isPickerOpen && !disabled && (
        <div className={dropdownClassName}>
          <div className="datetime-select__container">
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              min={min}
              max={max}
              allowPastDates={ocationType === 'delivery'}
            />
            <TimePicker
              value={`${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`}
              onChange={handleTimeChange}
            />
          </div>
          {pastDateWarning && <div className="datetime-select__warning">{pastDateWarning}</div>}
        </div>
      )}
    </div>
  );
};

export default DateTimeSelect;
