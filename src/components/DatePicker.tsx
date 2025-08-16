import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from 'react-icons/fi';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  min,
  max,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Add previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isWeekend: false
      });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dayOfWeek = dayDate.getDay();
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: isToday(dayDate),
        isSelected: selectedDate ? isSameDay(dayDate, selectedDate) : false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }
    
    // Add next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i);
      const dayOfWeek = dayDate.getDay();
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Fix timezone issue by using local date formatting
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Disable future dates
    if (date > today) return true;
    
    // Check min date constraint
    if (min) {
      const minDate = new Date(min);
      minDate.setHours(0, 0, 0, 0);
      if (date < minDate) return true;
    }
    
    // Check max date constraint
    if (max) {
      const maxDate = new Date(max);
      maxDate.setHours(23, 59, 59, 999);
      if (date > maxDate) return true;
    }
    
    return false;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent cursor-pointer"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {selectedDate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 mr-2"
            >
              <FiX size={16} />
            </button>
          )}
          <FiCalendar className="text-gray-400" size={16} />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 px-4 pt-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 px-4 pb-4">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day.isCurrentMonth && !isDateDisabled(day.date) && handleDateSelect(day.date)}
                disabled={!day.isCurrentMonth || isDateDisabled(day.date)}
                className={`
                  w-8 h-8 rounded text-sm font-medium transition-colors
                  ${!day.isCurrentMonth 
                    ? 'text-gray-300 cursor-default' 
                    : isDateDisabled(day.date)
                      ? 'text-gray-300 cursor-not-allowed'
                      : day.isSelected
                        ? 'bg-[#0c684b] text-white'
                        : day.isToday
                          ? 'bg-green-100 text-[#0c684b] border border-[#0c684b]'
                          : day.isWeekend
                            ? 'text-[#0c684b] hover:bg-green-50'
                            : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DatePicker;
