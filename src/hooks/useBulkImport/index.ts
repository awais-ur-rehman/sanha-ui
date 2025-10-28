import { useState, useCallback, useEffect } from 'react'
import { API_CONFIG, getAuthHeaders } from '../../config/api'
import type { BulkImportState } from '../../types'

interface UseBulkImportOptions {
    endpoint: string
    onSuccess?: () => void
    onError?: (error: string) => void
}

export const useBulkImport = ({ endpoint, onSuccess, onError }: UseBulkImportOptions) => {
    const [importState, setImportState] = useState<BulkImportState>({
        isImporting: false,
        importId: null,
        progress: 0,
        totalRows: 0,
        processedRows: 0,
        successful: 0,
        failed: 0,
        status: 'idle',
        errors: [],
        message: undefined,
    })

    const startImport = useCallback(async (file: File) => {
        try {
            setImportState(prev => ({
                ...prev,
                isImporting: true,
                status: 'uploading',
                progress: 0,
                totalRows: 0,
                processedRows: 0,
                successful: 0,
                failed: 0,
                errors: [],
                message: undefined,
            }))

            const formData = new FormData()
            formData.append('file', file)

            const token = localStorage.getItem('token')
            const headers: Record<string, string> = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Upload failed')
            }

            const result = await response.json()

            if (result.success && result.data?.importId) {
                setImportState(prev => ({
                    ...prev,
                    importId: result.data.importId,
                    status: 'processing',
                }))
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (error) {
            setImportState(prev => ({
                ...prev,
                isImporting: false,
                status: 'failed',
                message: error instanceof Error ? error.message : 'Upload failed',
            }))
            onError?.(error instanceof Error ? error.message : 'Upload failed')
        }
    }, [endpoint, onError])

    const handleProgress = useCallback((data: any) => {
        if (data.importId === importState.importId) {
            setImportState(prev => ({
                ...prev,
                progress: data.progress || 0,
                totalRows: data.totalRows || 0,
                processedRows: data.processedRows || 0,
                successful: data.successful || 0,
                failed: data.failed || 0,
                status: 'processing',
            }))
        }
    }, [importState.importId])

    const handleCompleted = useCallback((data: any) => {
        if (data.importId === importState.importId) {
            setImportState(prev => ({
                ...prev,
                isImporting: false,
                progress: 100,
                totalRows: data.totalRows || 0,
                processedRows: data.totalRows || 0,
                successful: data.successful || 0,
                failed: data.failed || 0,
                status: data.status === 'completed' ? 'completed' : 'failed',
                errors: data.errors || [],
                message: data.message,
            }))

            if (data.status === 'completed') {
                onSuccess?.()
            } else {
                onError?.(data.message || 'Import failed')
            }
        }
    }, [importState.importId, onSuccess, onError])

    useEffect(() => {
        const handleBulkImportProgress = (event: CustomEvent) => {
            handleProgress(event.detail)
        }

        const handleBulkImportCompleted = (event: CustomEvent) => {
            handleCompleted(event.detail)
        }

        window.addEventListener('bulkImportProgress', handleBulkImportProgress as EventListener)
        window.addEventListener('bulkImportCompleted', handleBulkImportCompleted as EventListener)

        return () => {
            window.removeEventListener('bulkImportProgress', handleBulkImportProgress as EventListener)
            window.removeEventListener('bulkImportCompleted', handleBulkImportCompleted as EventListener)
        }
    }, [handleProgress, handleCompleted])

    const reset = useCallback(() => {
        setImportState({
            isImporting: false,
            importId: null,
            progress: 0,
            totalRows: 0,
            processedRows: 0,
            successful: 0,
            failed: 0,
            status: 'idle',
            errors: [],
            message: undefined,
        })
    }, [])

    return {
        importState,
        startImport,
        reset,
    }
}

