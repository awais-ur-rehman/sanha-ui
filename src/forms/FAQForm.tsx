import { useState, useEffect } from 'react'
import { useToast } from '../components/CustomToast/ToastContext'
import CustomCheckbox from '../components/CustomCheckbox'
import type { FAQ } from '../types/entities'

interface FAQFormProps {
  faq?: FAQ | null
  onSubmit: (formData: { question: string; answer: string; isActive?: boolean }) => Promise<void>
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
    isActive: true,
  })

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Active Status */}
      {showActiveCheckbox ? (
        <div>
          <CustomCheckbox
            checked={Boolean(formData.isActive)}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            label="Active"
          />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            {willBeInactive 
              ? `This FAQ will be saved as inactive because there are already ${7} active FAQs.`
              : 'This FAQ will be saved as active.'
            }
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (faq ? 'Update FAQ' : 'Create FAQ')}
        </button>
      </div>
    </form>
  )
}

export default FAQForm
