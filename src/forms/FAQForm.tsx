import { useState, useEffect } from 'react'
import { useToast } from '../components/CustomToast/ToastContext'
import CustomCheckbox from '../components/CustomCheckbox'
import SearchableDropdown from '../components/SearchableDropdown'
import type { FAQ, FAQType } from '../types/entities'

interface FAQFormProps {
  faq?: FAQ | null
  onSubmit: (formData: { question: string; answer: string; faqType: FAQType; isActive?: boolean }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  showActiveCheckbox?: boolean
  willBeInactive?: boolean
}

const FAQForm = ({ faq, onSubmit, onCancel, isLoading = false, showActiveCheckbox = true, willBeInactive = false }: FAQFormProps) => {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    faqType: 'Business' as FAQType,
    isActive: true,
  })

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        faqType: faq.faqType,
        isActive: faq.isActive,
      })
    }
  }, [faq])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.question.trim()) {
      showToast('error', 'Please enter a question')
      return
    }
    
    if (!formData.answer.trim()) {
      showToast('error', 'Please enter an answer')
      return
    }

    if (!formData.faqType) {
      showToast('error', 'Please select a FAQ type')
      return
    }

    try {
      // Auto-set isActive based on props if not showing checkbox
      const finalFormData = showActiveCheckbox ? formData : {
        ...formData,
        isActive: !willBeInactive
      }
      
      await onSubmit(finalFormData)
    } catch (error) {
      console.error('Error submitting FAQ:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Form content - scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2">
      {/* Question */}
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
          Question *
        </label>
        <textarea
          id="question"
          value={formData.question}
          onChange={(e) => handleInputChange('question', e.target.value)}
          placeholder="Enter the question..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent resize-none"
          rows={3}
          required
        />
      </div>

      {/* Answer */}
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
          Answer *
        </label>
        <textarea
          id="answer"
          value={formData.answer}
          onChange={(e) => handleInputChange('answer', e.target.value)}
          placeholder="Enter the answer..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent resize-none"
          rows={5}
          required
        />
      </div>

      {/* FAQ Type */}
      <div>
        <label htmlFor="faqType" className="block text-sm font-medium text-gray-700 mb-2">
          FAQ Type *
        </label>
        <SearchableDropdown
          placeholder="Select FAQ type"
          value={formData.faqType}
          onChange={(value) => handleInputChange('faqType', value as FAQType)}
          options={[
            { value: 'Business', label: 'Business' },
            { value: 'Consumer', label: 'Consumer' },
          ]}
          allowCustomValue={false}
        />
      </div>

        </div>

        {/* Form Actions - fixed bottom within modal content */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-10 py-[10px] text-xs bg-[#0c684b] text-white rounded-sm hover:bg-green-700 border border-[#0c684b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Saving...' : (faq ? 'Update FAQ' : 'Add FAQ')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default FAQForm
