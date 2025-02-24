// File: src/components/sections/content/search-forms/DateTimePicker.tsx
// Last change: Added onHourChange and onMinuteChange props to pass framed hour and minute values from TimePicker
import React, { useState, useCallback, useRef, useEffect } from 'react';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import './DateTimePicker.css';

interface DateTimePickerProps {
  value?: Date | string | null; // Initial value for the picker
  onChange?: (date: Date) => void; // Callback when date changes
  label?: string; // Label for the picker
  className?: string; // Additional CSS class
  min?: Date; // Minimum allowed date
  max?: Date; // Maximum allowed date
  required?: boolean; // Whether the field is required
  disabled?: boolean; // Whether the field is disabled
  onHourChange?: (hour: number) => void; // Callback for hour value in frame
  onMinuteChange?: (minute: number) => void; // Callback for minute value in frame
}

const pad = (num: number) => num.toString().padStart(2, '0'); // Utility to pad single-digit numbers with a leading zero

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value = null,
  onChange,
  label = 'Select Date and Time',
  className = '',
  min,
  max,
  required = false,
  disabled = false,
  onHourChange,
  onMinuteChange,
}) => {
  // Initialize the date value { if value is a Date, use it; else, if string then convert; otherwise use current date }
  const initialDate = value instanceof Date ? value : value ? new Date(value) : new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate); // State for the selected date
  const [isPickerOpen, setIsPickerOpen] = useState(false); // State whether the picker dropdown is open
  
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the container element
  const inputRef = useRef<HTMLInputElement>(null); // Reference to the input element

  // Format the date and time into a string "YYYY-MM-DD HH:mm"
  const formatDateTime = useCallback((date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, []);

  // Handler for date change { updates the date part while preserving the time }
  const handleDateChange = useCallback((newDate: Date) => {
    const updatedDate = new Date(
      newDate.getFullYear(), 
      newDate.getMonth(), 
      newDate.getDate(), 
      selectedDate.getHours(), 
      selectedDate.getMinutes()
    );
    if ((min && updatedDate < min) || (max && updatedDate > max)) {
      console.warn('Selected date is out of allowed range');
      return;
    }
    setSelectedDate(updatedDate);
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max]);

  // Handler for time change { updates the time part of the selected date }
  const handleTimeChange = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const updatedDate = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth(), 
      selectedDate.getDate(), 
      hours, 
      minutes
    );
    if ((min && updatedDate < min) || (max && updatedDate > max)) {
      console.warn('Selected date and time are out of allowed range');
      return;
    }
    setSelectedDate(updatedDate);
    onChange?.(updatedDate);
  }, [selectedDate, onChange, min, max]);

  // Close the picker when clicking outside { adds event listener to document and cleans up on unmount }
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
    <div ref={containerRef} className="datetime-picker-wrapper">
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
          placeholder="Select date and time"
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
              onHourChange={onHourChange} // Pass hour callback
              onMinuteChange={onMinuteChange} // Pass minute callback
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimePicker;