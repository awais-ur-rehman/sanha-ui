import { FiAlertTriangle } from 'react-icons/fi'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isLoading?: boolean
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex flex-col items-start space-x-3 p-6">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900">{title}</h3>
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
            className="px-10 py-[10px] text-xs border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-10 py-[10px] text-xs bg-red-600 text-white rounded-sm hover:bg-red-700 border border-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
