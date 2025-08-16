import React from 'react';

interface Button3dProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button3d: React.FC<Button3dProps> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 bg-green-600 text-white font-semibold rounded-lg
        transform transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        boxShadow: '0 4px 0 #0c684b, 0 8px 16px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </button>
  );
};

export default Button3d;
