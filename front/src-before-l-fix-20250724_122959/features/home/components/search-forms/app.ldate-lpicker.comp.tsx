// File: src/features/home/components/search-forms/app.ldate-lpicker.comp.tsx
// Last change: Fixed Today button and allowed past date selection

import React, { useState, useCallback, useEffect } from 'react';

interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  allowPastDates?: boolean;
}

const pad = (num: number) => num.toString().padStart(2, '0'); // Utility to pad numbers with leading zero

export const DatePicker: React.FC<datePickerProps> = ({
  value = null,
  onChange,
  min,
  max,
  allowPastDates = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // current month state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // current year state
  const [selectedDate, setSelectedDate] = useState<string | null>(
    value ? formatDate(value) : null
  );
  const today = new Date();
  const todayDateString = formatDate(today);

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

  const handleDaySelect = useCallback((day: number) => { // handles day selection
    const newDate = new Date(currentYear, currentMonth, day);
    
    // Check constraints, but allow past dates if specified
    if (!allowPastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate < today) {
        console.warn('Selected date is in the past and allowPastDates=false');
        return;
      }
    }
    
    if ((min && newDate < min) || (max && newDate > max)) {
      console.warn('Selected date is out of allowed range');
      return;
    }
    
    const formattedDate = formatDate(newDate);
    setSelectedDate(formattedDate);
    onChange?.(newDate);
  }, [currentYear, currentMonth, onChange, min, max, allowPastDates]);

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

  // If value prop changes, update the selected date
  useEffect(() => {
    if (value) {
      const newDate = value instanceof Date ? value : new Date(value);
      setSelectedDate(formatDate(newDate));
    }
  }, [value]);

  const monthNames = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];
  const weekdays = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

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
        {generateCalendarDays().map((day, index) => {
          const isDisabled = day === null;
          const dateString = day !== null ? `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}` : '';
          const isSelectedDay = dateString === selectedDate;
          const isTodayDay = dateString === todayDateString;
          
          let dayClasses = 'date-picker-day';
          if (isDisabled) dayClasses += ' date-picker-day-disabled';
          if (isSelectedDay) dayClasses += ' date-picker-day-selected';
          else if (isTodayDay) dayClasses += ' date-picker-day-today';
          
          return (
            <button
              key={index}
              type="button"
              disabled={isDisabled}
              onClick={() => day !== null && handleDaySelect(day)}
              className={dayClasses}
            >
              {day || ''}
            </button>
          );
        })}
      </div>
      <div className="date-picker-footer">
        <button 
          type="button" 
          className="date-picker-today-button" 
          onClick={setToday}
        >
          Dnes
        </button>
      </div>
    </div>
  );
};

export default DatePicker;