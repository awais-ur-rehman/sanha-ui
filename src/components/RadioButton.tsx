import React from 'react';

interface RadioButtonProps {
    label: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({
    label,
    name,
    value,
    checked,
    onChange,
    error,
    required = false,
}) => {
    return (
        <div className="flex flex-col">
            <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={checked}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only peer"
                        required={required}
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-[#2D5B19] peer-checked:border-[6px] transition-all duration-200 peer-focus:ring-2 peer-focus:ring-[#2D5B19] peer-focus:ring-offset-2 group-hover:border-gray-400"></div>
                </div>
                <span className="ml-2 font-playfair text-sm text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </span>
            </label>
            {error && (
                <p className="mt-1 text-sm text-red-600 font-playfair">{error}</p>
            )}
        </div>
    );
};

export default RadioButton;
