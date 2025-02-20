// File: src/components/sections/content/search-forms/DateTimePicker.tsx
// Last change: Created complete DateTimePicker with DatePicker and TimePicker

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

// Utility pro formátování
const pad = (num: number) => num.toString().padStart(2, '0');

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value = null,
  onChange,
  label = 'Select Date and Time',
  className = '',
  min,
  max,
  required = false,
  disabled = false
}) => {
  // Počáteční hodnoty
  const initialDate = value instanceof Date 
    ? value 
    : value 
      ? new Date(value) 
      : new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Formátování data a času
  const formatDateTime = useCallback((date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, []);

  // Handler změny data
  const handleDateChange = useCallback((newDate: Date) => {
    const updatedDate = new Date(
      newDate.getFullYear(), 
      newDate.getMonth(), 
      newDate.getDate(), 
      selectedDate.getHours(), 
      selectedDate.getMinutes()
    );

    // Validace min/max dat
    if ((min && updatedDate < min) || (max && updatedDate > max)) {
      console.warn('Vybraný dátum je mimo povolený rozsah');
      return;
    }

    setSelectedDate(updatedDate);
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max]);

  // Handler změny času
  const handleTimeChange = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const updatedDate = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth(), 
      selectedDate.getDate(), 
      hours, 
      minutes
    );

    // Validace min/max dat
    if ((min && updatedDate < min) || (max && updatedDate > max)) {
      console.warn('Vybraný dátum a čas sú mimo povolený rozsah');
      return;
    }

    setSelectedDate(updatedDate);
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max]);

  // Zavírání pickeru po kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="datetime-picker-wrapper"
    >
      {label && (
        <label className="datetime-picker-label">
          {label}
        </label>
      )}
      
      <div className="datetime-picker-input-container">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formatDateTime(selectedDate)}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className={`datetime-picker-input ${className}`}
          placeholder="Vyberte dátum a čas"
        />

        {isPickerOpen && (
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