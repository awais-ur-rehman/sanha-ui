export interface BulkImportProgress {
    importId: string
    totalRows: number
    processedRows: number
    successful: number
    failed: number
    progress: number
    status: 'processing' | 'completed' | 'failed'
    timestamp: string
}

export interface BulkImportCompleted {
    importId: string
    totalRows: number
    successful: number
    failed: number
    errors: Array<{ row: number; error: string }>
    status: 'completed' | 'failed'
    message?: string
    timestamp: string
}

export interface BulkImportState {
    isImporting: boolean
    importId: string | null
    progress: number
    totalRows: number
    processedRows: number
    successful: number
    failed: number
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'
    errors: Array<{ row: number; error: string }>
    message?: string
}

