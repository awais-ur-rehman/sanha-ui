import { FiX, FiMail, FiUser, FiHome, FiGlobe, FiMessageSquare, FiSend, FiCalendar } from 'react-icons/fi'
import { type ContactUs } from '../types/entities'

interface ContactUsDetailSheetProps {
  contactUs: ContactUs | null
  open: boolean
  onClose: () => void
  onReply: (contactUs: ContactUs) => void
  hasUpdatePermission: boolean
}

const ContactUsDetailSheet: React.FC<ContactUsDetailSheetProps> = ({
  contactUs,
  open,
  onClose,
  onReply,
  hasUpdatePermission,
}) => {
  if (!open || !contactUs) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'General Inquiry': 'bg-blue-100 text-blue-800',
      'Certification Inquiry (Businesses)': 'bg-green-100 text-green-800',
      'Verification and Consumer Complaints': 'bg-red-100 text-red-800',
      'Media and Press Inquiries': 'bg-purple-100 text-purple-800',
      'Partnerships and Collaborations': 'bg-yellow-100 text-yellow-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Contact Details</h2>
              <p className="text-sm text-gray-600">View and manage contact information</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(contactUs.type)}`}>
                {contactUs.type}
              </span>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  <span>{contactUs.firstName} {contactUs.lastName}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span>{contactUs.email}</span>
                </div>
              </div>

              {contactUs.orgName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <FiHome className="w-4 h-4 text-gray-400" />
                    <span>{contactUs.orgName}</span>
                  </div>
                </div>
              )}

              {contactUs.orgWebsite && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <FiGlobe className="w-4 h-4 text-gray-400" />
                    <a 
                      href={contactUs.orgWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {contactUs.orgWebsite}
                    </a>
                  </div>
                </div>
              )}

              {contactUs.title && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <p className="text-gray-900">{contactUs.title}</p>
                </div>
              )}
            </div>

            {/* Original Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-start space-x-2">
                  <FiMessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-900 whitespace-pre-wrap">{contactUs.message}</p>
                </div>
              </div>
            </div>

            {/* Reply Message */}
            {contactUs.replyMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-2">
                    <FiSend className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-900 whitespace-pre-wrap">{contactUs.replyMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatDate(contactUs.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatDate(contactUs.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end space-x-3">
              {hasUpdatePermission && !contactUs.replyMessage && (
                <button
                  onClick={() => onReply(contactUs)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUsDetailSheet
