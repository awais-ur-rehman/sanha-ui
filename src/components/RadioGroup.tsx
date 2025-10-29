import React from 'react';

interface RadioOption {
    label: string;
    value: string;
}

interface RadioGroupProps {
    label: string;
    name: string;
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    name,
    options,
    value,
    onChange,
    error,
    required = false,
}) => {
    return (
        <div className="space-y-2">
            <label className="block font-playfair text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-6">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={value === option.value}
                                onChange={(e) => onChange(e.target.value)}
                                className="sr-only peer"
                            />
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-[#2D5B19] peer-checked:border-[6px] transition-all duration-200 peer-focus:ring-2 peer-focus:ring-[#2D5B19] peer-focus:ring-offset-2 group-hover:border-gray-400"></div>
                        </div>
                        <span className="ml-2 font-playfair text-sm text-gray-700">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 font-playfair">{error}</p>
            )}
        </div>
    );
};

export default RadioGroup;
