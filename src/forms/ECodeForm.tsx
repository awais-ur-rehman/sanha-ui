import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiPlus, FiX } from 'react-icons/fi';
import StatusSelect from '../components/StatusSelect';
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
  const [sources, setSources] = useState<string[]>(ecode?.source || []);
  const [functions, setFunctions] = useState<Array<{ value: string }>>([]);
  const [healthInfos, setHealthInfos] = useState<Array<{ value: string }>>([]);
  const [uses, setUses] = useState<Array<{ value: string }>>([]);

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
      setSources(ecode.source || []);
      
      // Initialize dynamic arrays
      setFunctions(ecode.function?.map(item => ({ value: item })) || [{ value: '' }]);
      setHealthInfos(ecode.healthInfo?.map(item => ({ value: item })) || [{ value: '' }]);
      setUses(ecode.uses?.map(item => ({ value: item })) || [{ value: '' }]);
    } else {
      // Initialize with one empty field for new ecode
      setFunctions([{ value: '' }]);
      setHealthInfos([{ value: '' }]);
      setUses([{ value: '' }]);
    }
  }, [ecode, setValue]);

  // Update form values when arrays change
  useEffect(() => {
    setValue('alternateName', alternateNames);
    setValue('source', sources);
    setValue('function', functions.map(f => f.value).filter(v => v.trim()));
    setValue('healthInfo', healthInfos.map(h => h.value).filter(v => v.trim()));
    setValue('uses', uses.map(u => u.value).filter(v => v.trim()));
  }, [alternateNames, sources, functions, healthInfos, uses, setValue]);

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      alternateName: alternateNames,
      source: sources,
      function: functions.map(f => f.value).filter(v => v.trim()),
      healthInfo: healthInfos.map(h => h.value).filter(v => v.trim()),
      uses: uses.map(u => u.value).filter(v => v.trim()),
    };
    onSubmit(formData);
  };

  // Helper function to add item to pills array
  const addItemToPillsArray = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, newItem: string) => {
    if (newItem.trim() && !array.includes(newItem.trim())) {
      setArray([...array, newItem.trim()]);
    }
  };

  // Helper function to remove item from pills array
  const removeItemFromPillsArray = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setArray(array.filter((_, i) => i !== index));
  };

  // Helper function to update dynamic array field
  const updateDynamicField = (array: Array<{ value: string }>, setArray: React.Dispatch<React.SetStateAction<Array<{ value: string }>>>, index: number, value: string) => {
    const updated = [...array];
    updated[index] = { value };
    setArray(updated);
  };

  // Helper function to add new dynamic field
  const addDynamicField = (array: Array<{ value: string }>, setArray: React.Dispatch<React.SetStateAction<Array<{ value: string }>>>) => {
    setArray([...array, { value: '' }]);
  };

  // Helper function to remove dynamic field
  const removeDynamicField = (array: Array<{ value: string }>, setArray: React.Dispatch<React.SetStateAction<Array<{ value: string }>>>, index: number) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index));
    }
  };

  // Pills input component for Alternate Names and Sources
  const PillsInput = ({ 
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
      addItemToPillsArray(items, setItems, inputValue);
      setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-normal text-gray-700">{label}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 bg-[#0c684b] text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FiPlus size={14} />
          </button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {items.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeItemFromPillsArray(items, setItems, index)}
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

  // Dynamic input component for other fields
  const DynamicInput = ({ 
    label, 
    items, 
    setItems, 
    placeholder 
  }: { 
    label: string; 
    items: Array<{ value: string }>; 
    setItems: React.Dispatch<React.SetStateAction<Array<{ value: string }>>>; 
    placeholder: string; 
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-normal text-gray-700">{label}</label>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateDynamicField(items, setItems, index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-sm"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDynamicField(items, setItems, index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => addDynamicField(items, setItems)}
            className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-[#0c684b] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors"
          >
            <FiPlus size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
        {/* Form content - scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Code and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-normal text-gray-700 mb-1">
                      Code *
                    </label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., E100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
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
                    <label className="block text-sm font-normal text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Curcumin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
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
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Status *
                  </label>
                  <StatusSelect
                    placeholder="Select Status"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    caseType="lowercase"
                  />
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Alternate Names and Sources - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PillsInput
              label="Alternate Names"
              items={alternateNames}
              setItems={setAlternateNames}
              placeholder="Add alternate name"
            />

            <PillsInput
              label="Sources"
              items={sources}
              setItems={setSources}
              placeholder="Add source"
            />
          </div>

          {/* Other Fields - Dynamic Inputs */}
          <div className="space-y-4">
            <DynamicInput
              label="Functions"
              items={functions}
              setItems={setFunctions}
              placeholder="Add function"
            />

            <DynamicInput
              label="Health Information"
              items={healthInfos}
              setItems={setHealthInfos}
              placeholder="Add health info"
            />

            <DynamicInput
              label="Uses"
              items={uses}
              setItems={setUses}
              placeholder="Add use"
            />
          </div>
        </div>

        {/* Fixed footer with buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#0c684b] text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (ecode ? 'Updating...' : 'Creating...') 
              : (ecode ? 'Update E-Code' : 'Create E-Code')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ECodeForm;