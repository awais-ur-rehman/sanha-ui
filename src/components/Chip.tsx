import React from 'react';

interface ChipProps {
  label: string;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ label, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 
        bg-gray-100 text-gray-700 
        rounded-full text-xs font-medium
        ${className}
      `}
    >
      {label}
    </span>
  );
};

export default Chip;
