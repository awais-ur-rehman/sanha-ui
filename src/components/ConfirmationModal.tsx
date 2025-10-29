import { FiInfo } from 'react-icons/fi'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  type?: 'info' | 'warning' | 'success'
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'info'
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'success':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-[#0c684b] bg-[#0c684b]/10'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'success':
        return 'bg-[#0c684b] hover:bg-[#0c684b]/80'
      default:
        return 'bg-[#0c684b] hover:bg-[#0c684b]/80'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex flex-col items-start space-x-3 p-6">
          <div className="flex justify-center items-center space-x-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor()}`}>
              <FiInfo className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
          <div className='mt-2'>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>



        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 pb-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
