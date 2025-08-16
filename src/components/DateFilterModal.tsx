import React, { useState } from 'react';
import { FiCalendar, FiX } from 'react-icons/fi';
import DatePicker from './DatePicker';

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  currentStartDate?: string;
  currentEndDate?: string;
}

const DateFilterModal: React.FC<DateFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentStartDate = '',
  currentEndDate = ''
}) => {
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onApply('', '');
    onClose();
  };

  const isApplyDisabled = !startDate && !endDate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiCalendar className="text-[#0c684b]" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Select a date range to filter resources by published date
          </p>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Select start date"
              max={endDate || undefined}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Select end date"
              min={startDate || undefined}
            />
          </div>

          {/* Date Range Preview */}
          {(startDate || endDate) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Filter Range:</span>
              </p>
              <p className="text-sm text-gray-800">
                {startDate && endDate 
                  ? `${startDate} to ${endDate}`
                  : startDate 
                    ? `From ${startDate}`
                    : `Until ${endDate}`
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            disabled={isApplyDisabled}
            className="px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilterModal;
