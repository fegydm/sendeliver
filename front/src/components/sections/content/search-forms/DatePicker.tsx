// File: src/components/sections/content/search-forms/DatePicker.tsx
// Last change: Created standalone DatePicker component; fixed duplicate keys by appending index; comments in English with braces content in one line

import React, { useState, useCallback } from 'react';

interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
}

const pad = (num: number) => num.toString().padStart(2, '0'); // Utility to pad numbers with leading zero

export const DatePicker: React.FC<DatePickerProps> = ({
  value = null,
  onChange,
  min,
  max
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // current month state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // current year state
  const [selectedDate, setSelectedDate] = useState<string | null>(
    value ? formatDate(value) : null
  );

  function formatDate(date: Date | string | null): string { // formats date as "YYYY-MM-DD"
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const generateCalendarDays = useCallback(() => { // generates days for the current month with empty cells at start
    const days: (number | null)[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) { days.push(null); } 
    for (let i = 1; i <= daysInMonth; i++) { days.push(i); }
    return days;
  }, [currentMonth, currentYear]);

  const handleDaySelect = useCallback((day: number) => { // handles day selection and validates against min/max dates
    const newDate = new Date(currentYear, currentMonth, day);
    if ((min && newDate < min) || (max && newDate > max)) {
      console.warn('Selected date is out of allowed range');
      return;
    }
    const formattedDate = formatDate(newDate);
    setSelectedDate(formattedDate);
    onChange?.(newDate);
  }, [currentYear, currentMonth, onChange, min, max]);

  const changeMonth = useCallback((delta: number) => { // changes current month by delta and adjusts year accordingly
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; } else if (newMonth > 11) { newMonth = 0; newYear += 1; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }, [currentMonth, currentYear]);

  const setToday = useCallback(() => { // sets today's date as selected date
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    handleDaySelect(today.getDate());
  }, [handleDaySelect]);

  const monthNames = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];
  const weekdays = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']; // Note: duplicates exist, so we append index to key

  return (
    <div className="date-picker">
      <div className="date-picker-header">
        <button type="button" className="date-picker-nav-button" onClick={() => changeMonth(-1)}>&lt;</button>
        <div className="date-picker-month-year">{`${monthNames[currentMonth]} ${currentYear}`}</div>
        <button type="button" className="date-picker-nav-button" onClick={() => changeMonth(1)}>&gt;</button>
      </div>
      <div className="date-picker-weekdays">
        {weekdays.map((day, index) => (
          <div key={`${day}-${index}`} className="date-picker-weekday">{day}</div>
        ))}
      </div>
      <div className="date-picker-days">
        {generateCalendarDays().map((day, index) => (
          <button
            key={index}
            type="button"
            disabled={day === null}
            onClick={() => day !== null && handleDaySelect(day)}
            className={`
              date-picker-day
              ${day === null ? 'date-picker-day-disabled' : ''}
              ${selectedDate === `${currentYear}-${pad(currentMonth + 1)}-${pad(day || 0)}` ? 'date-picker-day-selected' : ''}
            `}
          >
            {day || ''}
          </button>
        ))}
      </div>
      <div className="date-picker-footer">
        <button type="button" className="date-picker-today-button" onClick={setToday}>Dnes</button>
      </div>
    </div>
  );
};

export default DatePicker;
