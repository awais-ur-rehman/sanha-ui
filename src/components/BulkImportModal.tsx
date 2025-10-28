import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import type { BulkImportState } from '../types'

interface BulkImportModalProps {
    isOpen: boolean
    onClose: () => void
    importState: BulkImportState
    entityType: string
}

const BulkImportModal = ({ isOpen, onClose, importState, entityType }: BulkImportModalProps) => {
    if (!isOpen) return null

    const { status, progress, totalRows, processedRows, successful, failed } = importState

    const canClose = status === 'completed' || status === 'failed' || status === 'idle'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Import {entityType}</h2>
                    {canClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    )}
                </div>

                <div className="px-6 py-6">
                    {status === 'uploading' && (
                        <div className="py-8">
                            <div className="flex items-center mb-6">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0c684b] mr-3">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Uploading CSV file</p>
                                    <p className="text-xs text-gray-500">Validating file format...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="py-4">
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center">
                                    <FiCheckCircle className="text-[#0c684b] mr-3 flex-shrink-0" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">File Upload</p>
                                        <p className="text-xs text-gray-500">CSV file validated successfully</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0c684b] mr-3 flex-shrink-0">
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Processing Data</p>
                                        <p className="text-xs text-gray-500">Importing records to database...</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                    <div
                                        className="bg-[#0c684b] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{processedRows} of {totalRows} rows processed</span>
                                    <span className="font-medium">{successful} successful, {failed} failed</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="py-4">
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center">
                                    <FiCheckCircle className="text-[#0c684b] mr-3 flex-shrink-0" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">File Upload</p>
                                        <p className="text-xs text-gray-500">CSV file validated successfully</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <FiCheckCircle className="text-[#0c684b] mr-3 flex-shrink-0" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Data Processing</p>
                                        <p className="text-xs text-gray-500">All records processed</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <FiCheckCircle className="text-[#0c684b] mr-3 flex-shrink-0" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Import Results</p>
                                        <p className="text-xs text-gray-500">
                                            {successful} Successful{failed > 0 ? `, ${failed} Failed` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="py-4">
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center">
                                    <FiCheckCircle className="text-[#0c684b] mr-3 flex-shrink-0" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">File Upload</p>
                                        <p className="text-xs text-gray-500">CSV file validated successfully</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <FiAlertCircle className="text-gray-600 mr-3 flex-shrink-0" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Import Results</p>
                                        <p className="text-xs text-gray-500">{importState.message || 'Import process completed'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {canClose && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-[#0c684b] text-white text-sm font-medium rounded-sm hover:bg-green-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BulkImportModal
