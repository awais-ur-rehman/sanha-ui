import React from 'react';

interface ChipProps {
  label: string;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ label, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center px-2 py-1
        rounded-full text-xs font-medium whitespace-nowrap
        ${className}
      `}
    >
      {label}
    </span>
  );
};

export default Chip;
