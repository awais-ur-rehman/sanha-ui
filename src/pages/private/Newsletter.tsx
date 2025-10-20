import { useState } from 'react'
import { FiPlus, FiTrash2, FiSend } from 'react-icons/fi'
import { usePostApi } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import CustomInput from '../../components/CustomInput'
import CustomTextarea from '../../components/CustomTextarea'
import CustomDropdown from '../../components/CustomDropdown'
import Button from '../../components/Button'
import NewsletterTemplate from '../../components/NewsletterTemplate'
import { NEWSLETTER_ENDPOINTS } from '../../config/api'
import type { NewsletterSection, NewsletterData } from '../../types/entities'

const Newsletter = () => {
  const { showToast } = useToast()
  
  // State for newsletter form
  const [newsletterData, setNewsletterData] = useState<NewsletterData>({
    mainHeading: '',
    sections: [
      {
        heading: '',
        description: '',
        linkStyle: 'button'
      }
    ]
  })
  
  // State for sending
  const [isSendingBulk, setIsSendingBulk] = useState(false)

  // Send bulk newsletter
  const { mutate: sendBulkNewsletter } = usePostApi(
    NEWSLETTER_ENDPOINTS.sendBulk,
    { requireAuth: true }
  )

  // Handle newsletter form changes
  const handleMainHeadingChange = (value: string) => {
    setNewsletterData(prev => ({ ...prev, mainHeading: value }))
  }

  const handleSectionChange = (index: number, field: keyof NewsletterSection, value: string) => {
    setNewsletterData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  const addSection = () => {
    setNewsletterData(prev => ({
      ...prev,
      sections: [...prev.sections, {
        heading: '',
        description: '',
        linkStyle: 'button'
      }]
    }))
  }

  const removeSection = (index: number) => {
    if (newsletterData.sections.length > 1) {
      setNewsletterData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }))
    }
  }

  const validateNewsletterData = (): boolean => {
    if (!newsletterData.mainHeading.trim()) {
      showToast('error', 'Main heading is required')
      return false
    }

    for (let i = 0; i < newsletterData.sections.length; i++) {
      const section = newsletterData.sections[i]
      if (!section.heading.trim()) {
        showToast('error', `Section ${i + 1} heading is required`)
        return false
      }
      if (!section.description.trim()) {
        showToast('error', `Section ${i + 1} description is required`)
        return false
      }
    }
    return true
  }

  const handleSendNewsletter = async () => {
    if (!validateNewsletterData()) return

    setIsSendingBulk(true)
    try {
      await sendBulkNewsletter({
        newsletterData
      })
      showToast('success', 'Newsletter sent successfully to all subscribers')
      // Clear the form after successful send
      setNewsletterData({
        mainHeading: '',
        sections: [{ heading: '', description: '', linkStyle: 'button' }]
      })
    } catch (error) {
      showToast('error', 'Failed to send newsletter')
    } finally {
      setIsSendingBulk(false)
    }
  }


  return (
    <div className="py-4">
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Create and send newsletters to subscribers.</p>
        </div>

        {/* Send Button */}
        <div className='py-6'>
          <div className="flex items-center justify-end">
            <button
              onClick={handleSendNewsletter}
              disabled={isSendingBulk}
              className="px-4 py-[10px] text-xs bg-[#0c684b] text-white w-28 flex justify-center items-center rounded-sm hover:bg-[#0a5a3f] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-4 h-4" />
              {isSendingBulk ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="flex gap-6 h-[calc(100vh-250px)]">
          {/* Left Panel - Newsletter Form */}
          <div className="w-1/2 h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Newsletter Content</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Main Heading */}
                <CustomInput
                  label="Main Heading"
                  value={newsletterData.mainHeading}
                  onChange={(e) => handleMainHeadingChange(e.target.value)}
                  placeholder="e.g., January 2024 Updates"
                />

                {/* Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Sections</label>
                    <Button
                      onClick={addSection}
                      size="sm"
                      className="flex items-center gap-1 bg-[#0c684b] text-white hover:bg-[#0a5a3f]"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Section
                    </Button>
                  </div>

                  {newsletterData.sections.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Section {index + 1}</span>
                        {newsletterData.sections.length > 1 && (
                          <Button
                            onClick={() => removeSection(index)}
                            variant="danger"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <CustomInput
                        label="Heading"
                        value={section.heading}
                        onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                        placeholder="e.g., New Certification Services"
                      />

                      <CustomTextarea
                        label="Description"
                        value={section.description}
                        onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                        placeholder="Describe the content..."
                        rows={3}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <CustomInput
                          label="Link URL (optional)"
                          value={section.link || ''}
                          onChange={(e) => handleSectionChange(index, 'link', e.target.value)}
                          placeholder="https://example.com"
                        />

                        <CustomInput
                          label="Link Text (optional)"
                          value={section.linkText || ''}
                          onChange={(e) => handleSectionChange(index, 'linkText', e.target.value)}
                          placeholder="Learn More"
                        />
                      </div>

                      <CustomDropdown
                        label="Link Style"
                        value={section.linkStyle}
                        onChange={(value) => handleSectionChange(index, 'linkStyle', value as 'button' | 'link')}
                        options={[
                          { value: 'button', label: 'Button' },
                          { value: 'link', label: 'Link' }
                        ]}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Newsletter Preview */}
          <div className="w-1/2 h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Newsletter Preview</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <NewsletterTemplate newsletterData={newsletterData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Newsletter