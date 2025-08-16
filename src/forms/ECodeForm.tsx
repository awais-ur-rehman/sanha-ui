import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiPlus, FiX } from 'react-icons/fi';
import CustomDropdown from '../components/CustomDropdown';
import type { ECode } from '../types/entities';

interface ECodeFormProps {
  ecode?: ECode | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const schema = yup.object({
  code: yup.string().required('Code is required'),
  name: yup.string().required('Name is required'),
  alternateName: yup.array().of(yup.string()),
  function: yup.array().of(yup.string()),
  status: yup.string().required('Status is required'),
  source: yup.array().of(yup.string()),
  healthInfo: yup.array().of(yup.string()),
  uses: yup.array().of(yup.string()),
}).required();

const ECodeForm: React.FC<ECodeFormProps> = ({ ecode, onSubmit, onCancel, isLoading = false }) => {
  const [alternateNames, setAlternateNames] = useState<string[]>(ecode?.alternateName || []);
  const [functions, setFunctions] = useState<string[]>(ecode?.function || []);
  const [sources, setSources] = useState<string[]>(ecode?.source || []);
  const [healthInfos, setHealthInfos] = useState<string[]>(ecode?.healthInfo || []);
  const [uses, setUses] = useState<string[]>(ecode?.uses || []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,

  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      code: ecode?.code || '',
      name: ecode?.name || '',
      status: ecode?.status || 'doubtful',
    },
  });

  // Update form values when ecode changes (for edit mode)
  useEffect(() => {
    if (ecode) {
      setValue('code', ecode.code || '');
      setValue('name', ecode.name || '');
      setValue('status', ecode.status || 'doubtful');
      setAlternateNames(ecode.alternateName || []);
      setFunctions(ecode.function || []);
      setSources(ecode.source || []);
      setHealthInfos(ecode.healthInfo || []);
      setUses(ecode.uses || []);
    }
  }, [ecode, setValue]);

  // Update form values when arrays change
  useEffect(() => {
    setValue('alternateName', alternateNames);
    setValue('function', functions);
    setValue('source', sources);
    setValue('healthInfo', healthInfos);
    setValue('uses', uses);
  }, [alternateNames, functions, sources, healthInfos, uses, setValue]);

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      alternateName: alternateNames,
      function: functions,
      source: sources,
      healthInfo: healthInfos,
      uses: uses,
    };
    onSubmit(formData);
  };

  // Helper function to add item to array
  const addItemToArray = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, newItem: string) => {
    if (newItem.trim() && !array.includes(newItem.trim())) {
      setArray([...array, newItem.trim()]);
    }
  };

  // Helper function to remove item from array
  const removeItemFromArray = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setArray(array.filter((_, i) => i !== index));
  };

  // Array input component
  const ArrayInput = ({ 
    label, 
    items, 
    setItems, 
    placeholder 
  }: { 
    label: string; 
    items: string[]; 
    setItems: React.Dispatch<React.SetStateAction<string[]>>; 
    placeholder: string; 
  }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
      addItemToArray(items, setItems, inputValue);
      setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-2 py-1.5 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiPlus size={14} />
          </button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {items.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeItemFromArray(items, setItems, index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <FiX size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 px-2">
        {/* Code and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., E100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., Curcumin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <CustomDropdown
                  placeholder="Select Status"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  options={[
                    { value: 'halaal', label: 'Halaal' },
                    { value: 'haraam', label: 'Haraam' },
                    { value: 'doubtful', label: 'Doubtful' },
                  ]}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Array Inputs in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ArrayInput
            label="Alternate Names"
            items={alternateNames}
            setItems={setAlternateNames}
            placeholder="Add alternate name"
          />

          <ArrayInput
            label="Functions"
            items={functions}
            setItems={setFunctions}
            placeholder="Add function"
          />

          <ArrayInput
            label="Sources"
            items={sources}
            setItems={setSources}
            placeholder="Add source"
          />

          <ArrayInput
            label="Health Information"
            items={healthInfos}
            setItems={setHealthInfos}
            placeholder="Add health info"
          />

          <ArrayInput
            label="Uses"
            items={uses}
            setItems={setUses}
            placeholder="Add use"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (ecode ? 'Updating...' : 'Creating...') 
              : (ecode ? 'Update E-Code' : 'Create E-Code')
            }
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ECodeForm;
