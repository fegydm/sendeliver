// File: src/components/sections/content/search-forms/DatePicker.tsx
// Last change: Created standalone DatePicker component

import React, { useState, useCallback, useEffect } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
}

// Utility pro přidání nuly před jednociferná čísla
const pad = (num: number) => num.toString().padStart(2, '0');

export const DatePicker: React.FC<DatePickerProps> = ({
  value = null,
  onChange,
  min,
  max
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    value ? formatDate(value) : null
  );

  // Formátování data
  function formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // Generování dnů v měsíci
  const generateCalendarDays = useCallback(() => {
    const days: (number | null)[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Přidání prázdných dnů před začátkem měsíce
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }

    // Přidání dnů měsíce
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth, currentYear]);

  // Výběr dne
  const handleDaySelect = useCallback((day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    
    // Kontrola min/max dat
    if ((min && newDate < min) || (max && newDate > max)) {
      console.warn('Vybraný dátum je mimo povolený rozsah');
      return;
    }

    const formattedDate = formatDate(newDate);
    setSelectedDate(formattedDate);
    onChange?.(newDate);
  }, [currentYear, currentMonth, onChange, min, max]);

  // Navigace měsíci
  const changeMonth = useCallback((delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }, [currentMonth, currentYear]);

  // Nastavení aktuálního dne
  const setToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    handleDaySelect(today.getDate());
  }, [handleDaySelect]);

  // Měsíce a dny v týdnu
  const monthNames = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];
  const weekdays = ['P', 'U', 'S', 'Š', 'P', 'S', 'N'];

  return (
    <div className="date-picker">
      <div className="date-picker-header">
        <button 
          type="button" 
          className="date-picker-nav-button"
          onClick={() => changeMonth(-1)}
        >
          &lt;
        </button>
        
        <div className="date-picker-month-year">
          {`${monthNames[currentMonth]} ${currentYear}`}
        </div>
        
        <button 
          type="button" 
          className="date-picker-nav-button"
          onClick={() => changeMonth(1)}
        >
          &gt;
        </button>
      </div>

      <div className="date-picker-weekdays">
        {weekdays.map(day => (
          <div key={day} className="date-picker-weekday">{day}</div>
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
              ${selectedDate === `${currentYear}-${pad(currentMonth + 1)}-${pad(day || 0)}` 
                ? 'date-picker-day-selected' 
                : ''
              }
            `}
          >
            {day || ''}
          </button>
        ))}
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