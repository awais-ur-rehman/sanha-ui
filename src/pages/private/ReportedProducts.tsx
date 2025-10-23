import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSearch, FiImage } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { useGetApi } from '../../hooks'
import { useToast } from '../../components/CustomToast/ToastContext'
import DateRangePicker from '../../components/DateRangePicker'
import CustomDropdown from '../../components/CustomDropdown'
import { API_CONFIG, REPORTED_PRODUCT_ENDPOINTS, getAuthHeaders } from '../../config/api'
import type { ReportProduct } from '../../types/entities'

const ReportedProducts = () => {
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  const location = useLocation()

  const hasReadPermission = hasPermission('Reported Products', 'read')
  const hasUpdatePermission = hasPermission('Reported Products', 'update')

  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending')

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  const queryParams = new URLSearchParams({
    page: pagination.currentPage.toString(),
    limit: pagination.itemsPerPage.toString(),
    status: activeTab === 'pending' ? 'Pending' : 'Resolved',
    ...(searchTerm && { search: searchTerm }),
    ...(filters.reportType && { reportType: filters.reportType }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })

  const { data, isLoading, refetch } = useGetApi<any>(
    `${REPORTED_PRODUCT_ENDPOINTS.getAll}?${queryParams}`,
    { requireAuth: true, staleTime: 0 }
  )

  const exportParams = new URLSearchParams({
    status: activeTab === 'pending' ? 'Pending' : 'Resolved',
    ...(searchTerm && { search: searchTerm }),
    ...(filters.reportType && { reportType: filters.reportType }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  })
  const exportCsvQuery = useGetApi<Blob>(
    `${REPORTED_PRODUCT_ENDPOINTS.exportCsv}?${exportParams.toString()}`,
    { requireAuth: true, enabled: false, staleTime: 0, responseType: 'blob' }
  )

  const handleExport = async () => {
    try {
      const result = await exportCsvQuery.refetch()
      const blob = result.data as Blob
      if (!blob) return
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reported-products-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {}
  }

  const pageItems: ReportProduct[] = data?.data?.data || []
  const [items, setItems] = useState<ReportProduct[]>([])
  const [tabCache, setTabCache] = useState<{
    pending: { list: ReportProduct[]; pagination: { currentPage: number; totalPages: number; totalItems: number } },
    resolved: { list: ReportProduct[]; pagination: { currentPage: number; totalPages: number; totalItems: number } },
  }>({
    pending: { list: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
    resolved: { list: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
  })
  const [selected, setSelected] = useState<ReportProduct | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [isReplyingPanel, setIsReplyingPanel] = useState(false)
  const [panelReplyText, setPanelReplyText] = useState('')
  const panelReplyTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { 
    setItems([])
    setTabCache({
      pending: { list: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
      resolved: { list: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
    })
  }, [location.pathname])

  // Handle navigation from notification to select a specific report
  useEffect(() => {
    const state = location.state as any
    if (state?.fromNotification && state?.notificationId && state?.notificationType === 'report_product') {
      const targetId = Number(state.notificationId)

      // Try to select if already in current items; otherwise fetch it and select
      const selectIfPresent = () => {
        const found = items.find(e => e.id === targetId)
        if (found) {
          setSelected(found)
          return true
        }
        return false
      }

      if (!selectIfPresent()) {
        // Fetch the specific reported product and select it
        fetch(`${API_CONFIG.baseURL}${REPORTED_PRODUCT_ENDPOINTS.getById}/${targetId}`, {
          headers: getAuthHeaders()
        })
          .then(async resp => {
            if (!resp.ok) return
            const data = await resp.json()
            const item = data?.data as ReportProduct | undefined
            if (!item) return
            setItems(prev => {
              const exists = prev.some(r => r.id === item.id)
              const next = exists ? prev : [item, ...prev]
              return next
            })
            setSelected(item)
            // Ensure the correct tab is active based on status
            setActiveTab(item.status === 'Resolved' ? 'resolved' : 'pending')
          })
          .catch(() => {})
      }

      // Clear navigation state to avoid reprocessing
      window.history.replaceState({}, document.title, location.pathname)
    }
  }, [location.state, items])

  useEffect(() => {
    if (data?.data?.pagination) {
      const nextTotalPages = Number(data.data.pagination.totalPages) || 1
      const nextTotalItems = Number(data.data.pagination.total) || 0
      setPagination(prev => ({ ...prev, totalPages: nextTotalPages, totalItems: nextTotalItems }))

      // Keep tab-specific list cached; merge/dedupe for current tab only
      const base = pagination.currentPage === 1 ? [] : tabCache[activeTab].list
      const merged = [...base, ...pageItems]
      const uniqueById = Array.from(new Map(merged.map(e => [e.id, e])).values())
      setItems(uniqueById)
      setTabCache(cache => ({
        ...cache,
        [activeTab]: {
          list: uniqueById,
          pagination: { currentPage: pagination.currentPage, totalPages: nextTotalPages, totalItems: nextTotalItems },
        },
      }))
    }
  }, [data, pageItems, pagination.currentPage, activeTab])

  useEffect(() => {
    if (items.length === 0) setSelected(null)
    else if (!selected || !items.find(e => e.id === selected.id)) setSelected(items[0])
  }, [items])

  // Reset reply state when selection changes
  useEffect(() => {
    setIsReplyingPanel(false)
    setPanelReplyText('')
  }, [selected])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setItems([])
    // clear cache for current tab when filters change
    setTabCache(cache => ({
      ...cache,
      [activeTab]: { list: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
    }))
    setSelected(null)
  }

  const handleDateFilterApply = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setItems([])
    setTabCache(cache => ({
      ...cache,
      [activeTab]: { list: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
    }))
    setSelected(null)
  }

  const handleTypeFilterChange = (value: string | number) => {
    setFilters(prev => ({ ...prev, reportType: value.toString() }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    setItems([])
    setTabCache(cache => ({
      ...cache,
      [activeTab]: { list: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } },
    }))
    setSelected(null)
  }

  const handleLeftScroll = () => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    const hasMore = pagination.currentPage < pagination.totalPages
    if (nearBottom && hasMore && !isLoading) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
    }
  }

  // Hydrate from cache on tab change
  useEffect(() => {
    const cached = tabCache[activeTab]
    if (cached.list.length > 0) {
      setItems(cached.list)
      setPagination(prev => ({ ...prev, currentPage: cached.pagination.currentPage, totalPages: cached.pagination.totalPages, totalItems: cached.pagination.totalItems }))
    } else {
      setItems([])
      setPagination(prev => ({ ...prev, currentPage: 1 }))
      refetch()
    }
  }, [activeTab])

  const filteredItems = items

  if (!hasReadPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-[14px] md:text-[15px] lg:text-[15px] xl:text-[16px]">You don't have permission to view reported products</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] px-6 py-10'>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[18px] md:text-[20px] lg:text-[20px] xl:text-[22px] font-semibold text-gray-900">Reported Products</h1>
          <p className="text-gray-600">View & manage reported products.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('pending'); setSelected(null) }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => { setActiveTab('resolved'); setSelected(null) }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'resolved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className='py-6'>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-72">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, product or message..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
              />
            </div>

            <div className='w-[220px]'>
              {/* Type Filter */}
            <CustomDropdown
              options={[
                { value: '', label: 'All Types' },
                { value: 'Incorrect Certification', label: 'Incorrect Certification' },
                { value: 'Suspicious Ingredients', label: 'Suspicious Ingredients' },
                { value: 'Expired Certificate', label: 'Expired Certificate' },
                { value: 'Counterfeit Product', label: 'Counterfeit Product' },
                { value: 'Misleading Information', label: 'Misleading Information' },
                { value: 'Other', label: 'Other' },
              ]}
              value={filters.reportType}
              onChange={handleTypeFilterChange}
              placeholder="Filter by type"
              className="text-xs"
            />
            </div>

            {/* Date Range Picker */}
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onDateRangeChange={handleDateFilterApply}
              placeholder="Filter by date range"
              className="w-[250px] text-xs"
              includeTime={true}
            />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-10 py-[10px] text-xs border border-[#0c684b] text-[#0c684b] rounded-sm hover:bg-gray-50 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="flex gap-6 h-[calc(100vh-350px)]">
          {/* Left Panel - List */}
          <div className="w-1/5 h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-xs text-gray-500">Total Reports: {pagination.totalItems}</h3>
            </div>
            <div ref={listRef} onScroll={handleLeftScroll} className="overflow-y-auto flex-1">
              {isLoading && filteredItems.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No reports found</p>
                </div>
              ) : (
                filteredItems.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selected?.id === r.id ? 'bg-[#0c684b]/5 border-l-4 border-l-[#0c684b]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{r.firstName} {r.lastName}</h4>
                        <p className="text-xs text-gray-600 mt-1">{r.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{r.productName} • {r.manufacturer}</p>
                      </div>
                      <div className="text-right space-y-1">
            
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            {selected ? (
              <div className="h-full flex flex-col">
                <div className="px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">{selected.productName}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#0c684b]/10 text-[#0c684b]">{selected.reportType}</span>
                      </div>
                      <p className="text-sm text-gray-600">Reported Product Details</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-6 py-2 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Main Content Row - Reporter, Product, and Image */}
                    <div className="flex gap-6">
                      {/* Left Side - Reporter and Product Info */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 mb-2">Reporter</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                              <p className="text-sm text-gray-900 mt-1 font-medium">{selected.firstName} {selected.lastName}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                              <p className="text-sm text-gray-900 mt-1">{selected.email}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-semibold text-gray-900 mb-2">Product</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                              <p className="text-sm text-gray-900 mt-1 font-medium">{selected.productName}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Manufacturer</label>
                              <p className="text-sm text-gray-900 mt-1">{selected.manufacturer}</p>
                            </div>
                            {selected.purchaseLocation && (
                              <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Purchase Location</label>
                                <p className="text-sm text-gray-900 mt-1">{selected.purchaseLocation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Product Image */}
                      <div className="w-48 flex-shrink-0">
                        {selected.productImage ? (
                          <div className="relative">
                            <img
                              src={selected.productImage}
                              alt={`${selected.productName} - Product Image`}
                              className="w-full h-full rounded-lg object-contain"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-48 rounded-lg border border-gray-200 shadow-sm bg-gray-50 flex-col items-center justify-center p-4">
                              <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500 text-center">Image not available</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 rounded-lg border border-gray-200 shadow-sm bg-gray-50 flex flex-col items-center justify-center p-4">
                            <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 text-center">No image submitted</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Report Section */}
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-2">Report</h4>
                      <div className="rounded-lg max-h-[168px] overflow-y-auto">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.reportMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply only on pending */}
                {activeTab === 'pending' && selected.status === 'Pending' && (
                  <div className="px-6 py-3 border-t border-gray-200">
                    {!isReplyingPanel ? (
                      <div className="flex justify-start">
                        <button
                          onClick={() => setIsReplyingPanel(true)}
                          disabled={!hasUpdatePermission}
                          className="flex items-center space-x-2 px-6 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>Reply</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <textarea
                          ref={panelReplyTextareaRef}
                          value={panelReplyText}
                          onChange={(e) => setPanelReplyText(e.target.value)}
                          placeholder={'Write your reply...'}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent resize-none"
                          rows={3}
                          maxLength={1000}
                        />
                        <div className="flex items-center justify-end mt-2 gap-2">
                          <button
                            onClick={() => { setIsReplyingPanel(false); setPanelReplyText('') }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <SubmitReplyButton
                            id={selected.id}
                            text={panelReplyText}
                            onSuccess={() => { setIsReplyingPanel(false); setPanelReplyText(''); showToast('success', 'Response sent successfully'); setSelected(null); setItems([]); setPagination(prev => ({ ...prev, currentPage: 1 })); refetch() }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg font-medium">Select a report</p>
                  <p className="text-sm">Choose a report from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportedProducts

const SubmitReplyButton = ({ id, text, onSuccess }: { id: number; text: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const resp = await fetch(`${API_CONFIG.baseURL}${REPORTED_PRODUCT_ENDPOINTS.respond}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, message: text.trim() })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to send response')
      }
      onSuccess()
    } catch (e) {
      // handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={loading || !text.trim()}
      className="px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Sending...' : 'Submit Reply'}
    </button>
  )
}


