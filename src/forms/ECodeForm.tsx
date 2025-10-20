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
  const [functions, setFunctions] = useState<string[]>(ecode?.function || []);
  const [healthInfos, setHealthInfos] = useState<string[]>(ecode?.healthInfo || []);
  const [uses, setUses] = useState<string[]>(ecode?.uses || []);
  const [healthInfoInput, setHealthInfoInput] = useState('');

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
      
      setFunctions(ecode.function || []);
      setHealthInfos(ecode.healthInfo || []);
      setUses(ecode.uses || []);
    } else {
      setFunctions([]);
      setHealthInfos([]);
      setUses([]);
    }
  }, [ecode, setValue]);

  // Update form values when arrays change
  useEffect(() => {
    setValue('alternateName', alternateNames);
    setValue('source', sources);
    setValue('function', functions);
    setValue('healthInfo', healthInfos);
    setValue('uses', uses);
  }, [alternateNames, sources, functions, healthInfos, uses, setValue]);

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      alternateName: alternateNames.filter(name => name.trim() !== ''),
      source: sources.filter(source => source.trim() !== ''),
      function: functions.filter(f => f.trim() !== ''),
      healthInfo: healthInfos.filter(h => h.trim() !== ''),
      uses: uses.filter(u => u.trim() !== ''),
    };
    onSubmit(formData);
  };

  // Helper functions for health information (matching ClientForm pattern)
  const removeField = (_field: string, setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const updateField = (_field: string, setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item))
  }


  // Simple chip input component like ProductForm
  const ChipInput = ({ 
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
      const value = inputValue.trim();
      if (!value) return;
      if (!items.includes(value)) setItems(prev => [...prev, value]);
      setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    const handleRemove = (idx: number) => {
      setItems(prev => prev.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-[#0c684b] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors"
          >
            <FiPlus size={16} />
          </button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {items.map((val, idx) => (
              <span key={`${val}-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                {val}
                <button type="button" onClick={() => handleRemove(idx)} className="text-gray-500 hover:text-red-600">
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
        {/* Form content - scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2">
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
            <ChipInput
              label="Alternate Names"
              items={alternateNames}
              setItems={setAlternateNames}
              placeholder="Add alternate name"
            />

            <ChipInput
              label="Sources"
              items={sources}
              setItems={setSources}
              placeholder="Add source"
            />
          </div>

          {/* Functions and Uses - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChipInput
              label="Functions"
              items={functions}
              setItems={setFunctions}
              placeholder="Add function"
            />

            <ChipInput
              label="Uses"
              items={uses}
              setItems={setUses}
              placeholder="Add use"
            />
          </div>

          {/* Health Information - At the bottom like addresses in ClientForm */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Health Information</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={healthInfoInput}
                onChange={(e) => setHealthInfoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = healthInfoInput.trim();
                    if (val) {
                      setHealthInfos(prev => [...prev, val]);
                      setHealthInfoInput('');
                    }
                  }
                }}
                placeholder="Enter health information and press Enter or + to add"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => { const val = healthInfoInput.trim(); if (val) { setHealthInfos(prev => [...prev, val]); setHealthInfoInput(''); } }}
                className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-[#0c684b] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors"
              >
                <FiPlus size={16} />
              </button>
            </div>
            {healthInfos.length > 0 && (
              <div className="space-y-2 p-1">
                {healthInfos.map((healthInfo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={healthInfo}
                      onChange={(e) => updateField('healthInfos', setHealthInfos, index, e.target.value)}
                      placeholder="Enter health information"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                    />
                    <button type="button" onClick={() => removeField('healthInfos', setHealthInfos, index)} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions - fixed bottom within modal content */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onCancel}
            className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Saving...' : ecode ? 'Update E-Code' : 'Add E-Code'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ECodeForm;