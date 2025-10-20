import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiPlus, FiTrash2, FiSend, FiEye, FiEdit } from 'react-icons/fi'
import { useGetApi, usePostApi } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import CustomInput from '../../components/CustomInput'
import CustomTextarea from '../../components/CustomTextarea'
import CustomDropdown from '../../components/CustomDropdown'
import Button from '../../components/Button'
import { NEWSLETTER_ENDPOINTS } from '../../config/api'
import type { NewsletterSubscriber, NewsletterSection, NewsletterData } from '../../types/entities'

const Newsletter = () => {
  const { showToast } = useToast()
  
  // State for subscribers list
  const [searchEmail, setSearchEmail] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [subscribersList, setSubscribersList] = useState<NewsletterSubscriber[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  
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
  
  // State for preview mode
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Query params for subscribers
  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    ...(searchEmail && { email: searchEmail }),
  })

  // Fetch subscribers
  const { data: subscribersData, isLoading: isLoadingSubscribers } = useGetApi(
    `${NEWSLETTER_ENDPOINTS.getAll}?${queryParams.toString()}`,
    { requireAuth: true, staleTime: 0 }
  )

  // Send bulk newsletter
  const { mutate: sendBulkNewsletter } = usePostApi(
    NEWSLETTER_ENDPOINTS.sendBulk,
    { requireAuth: true }
  )

  const subscribers: NewsletterSubscriber[] = (subscribersData as any)?.data?.data || []

  // Update pagination and list when data changes
  useEffect(() => {
    if ((subscribersData as any)?.data?.pagination) {
      const nextTotalPages = Number((subscribersData as any).data.pagination.totalPages) || 1
      const nextTotalItems = Number((subscribersData as any).data.pagination.totalItems) || 0
      setPagination(prev => ({ ...prev, totalPages: nextTotalPages, totalItems: nextTotalItems }))
      setSubscribersList(prev => (pagination.currentPage === 1 ? subscribers : [...prev, ...subscribers]))
    }
  }, [subscribersData, subscribers, pagination.currentPage])


  // Handle search
  const handleSearch = (term: string) => {
    setSearchEmail(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setSubscribersList([])
  }

  // Infinite scroll for left pane
  const handleLeftScroll = () => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    const hasMore = pagination.currentPage < pagination.totalPages
    if (nearBottom && hasMore && !isLoadingSubscribers) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }


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

  // Validate newsletter data
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

  // Send newsletter
  const handleSendNewsletter = async () => {
    if (!validateNewsletterData()) return

    setIsSendingBulk(true)
    try {
      await sendBulkNewsletter({
        newsletterData
      })
      showToast('success', 'Newsletter sent successfully to all subscribers')
      // Clear form after successful send
      setNewsletterData({
        mainHeading: '',
        sections: [
          {
            heading: '',
            description: '',
            linkStyle: 'button'
          }
        ]
      })
    } catch (error) {
      showToast('error', 'Failed to send newsletter')
    } finally {
      setIsSendingBulk(false)
    }
  }

  // Generate preview HTML (simplified version of the backend template)
  const generatePreviewHTML = () => {
    const sectionsHTML = newsletterData.sections.map(section => {
      const linkHTML = section.link
        ? (section.linkStyle === 'button'
          ? `<a href="${section.link}" style="background-color: #2D5B19; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 14px;">${section.linkText || 'Learn More'}</a>`
          : `<a href="${section.link}" style="color: #2D5B19; text-decoration: underline; font-size: 14px;">${section.linkText || 'Learn More'}</a>`)
        : ''

      return `
        <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
          <div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: #2D5B19; margin-bottom: 10px;">${section.heading}</div>
          <div style="font-size: 14px; line-height: 1.6; color: #666666; margin-bottom: 10px;">${section.description}</div>
          ${linkHTML ? `<div style="margin-top: 10px;">${linkHTML}</div>` : ''}
        </div>
      `
    }).join('')

    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2D5B19; font-size: 24px; margin: 0;">${newsletterData.mainHeading || 'Newsletter Title'}</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
            We're excited to share the latest updates and insights from SANHA. Stay informed about halal certification trends, industry news, and educational opportunities.
          </p>
        </div>

        ${sectionsHTML}

        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #666666;">
          Thank you for being part of the SANHA community!<br>
          <strong>Sanha Team</strong>
        </p>
      </div>
    `
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Manage newsletter subscriptions and send newsletters to subscribers.</p>
        </div>

        {/* Filters */}
        <div className='py-6'>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-72">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="px-4 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {isPreviewMode ? <FiEdit className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSendNewsletter}
                disabled={isSendingBulk}
                className="px-4 py-[10px] text-xs bg-[#0c684b] text-white w-28 flex justify-center item-center rounded-sm hover:bg-[#0a5a3f] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
                {isSendingBulk ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="flex gap-6 h-[calc(100vh-250px)]">
          {/* Left Panel - Subscribers List */}
          <div className="w-1/5 h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-xs text-gray-500">Total Subscribers: {subscribersList.length}</h3>
            </div>
            <div ref={listRef} onScroll={handleLeftScroll} className="overflow-y-auto flex-1">
              {isLoadingSubscribers && subscribersList.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              ) : subscribersList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No subscribers found</p>
                </div>
              ) : (
                subscribersList.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="p-4 border-b border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{subscriber.email}</h4>
                        <p className="text-xs text-gray-600 mt-1">Subscribed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(subscriber.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Newsletter Form or Preview */}
          <div className="flex-1 h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
            {isPreviewMode ? (
              /* Preview Mode */
              <div className="h-full flex flex-col">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Newsletter Preview</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div 
                    className="max-w-4xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
                  />
                </div>
              </div>
            ) : (
              /* Form Mode */
              <div className="h-full flex flex-col">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Newsletter Content</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
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

                          <div className="w-full">
                            <CustomDropdown
                              options={[
                                { value: 'button', label: 'Button' },
                                { value: 'link', label: 'Link' }
                              ]}
                              value={section.linkStyle}
                              onChange={(val) => handleSectionChange(index, 'linkStyle', String(val))}
                              placeholder="Select link style"
                              className="w-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Newsletter
