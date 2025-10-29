import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { useGetApi } from '../../hooks'
import { USERS_ENDPOINTS } from '../../config/api'
import StyledTable from '../../components/StyledTable'
import Chip from '../../components/Chip'
import DateRangePicker from '../../components/DateRangePicker'
import { Pagination } from '../../components'
import { useToast } from '../../components/CustomToast/ToastContext'

interface ApplicationEntry {
    id: number
    companyName?: string
    certificationStatus?: string
    createdAt?: string
}

interface UserRow {
    id: number
    firstName: string
    lastName: string
    email: string
    isFirstLogin?: number | boolean
    isActive?: number | boolean
    createdAt: string
    updatedAt?: string
    applications?: ApplicationEntry[]
}

const Applications = () => {
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
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
        ...(searchTerm && { search: searchTerm }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
    })

    const { data: usersResponse, isLoading: loading } = useGetApi<any>(
        `${USERS_ENDPOINTS.getAll}?${queryParams.toString()}`,
        { requireAuth: true, staleTime: 0 }
    )

    const users: UserRow[] = useMemo(() => {
        return usersResponse?.data?.data?.map((u: UserRow) => ({
            ...u,
            applications: Array.isArray(u.applications) ? u.applications : [],
        })) || []
    }, [usersResponse?.data?.data])

    useEffect(() => {
        if (usersResponse?.data?.pagination) {
            setPagination(prev => ({
                ...prev,
                totalPages: Number(usersResponse.data.pagination.totalPages) || 1,
                totalItems: Number(usersResponse.data.pagination.total) || 0,
            }))
        }
    }, [usersResponse?.data?.pagination])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPagination(prev => ({ ...prev, currentPage: 1 }))
    }

    const handleDateFilterApply = (startDate: string, endDate: string) => {
        setFilters({ startDate, endDate })
        setPagination(prev => ({ ...prev, currentPage: 1 }))
    }

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }))
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getApplicationStatus = (row: UserRow) => {
        if (!row.applications || row.applications.length === 0) return 'Pending'
        return row.applications[0]?.certificationStatus || 'Pending'
    }

    const renderStatusChip = (statusRaw: string) => {
        const status = (statusRaw || 'Pending').toString().trim().toLowerCase()
        let classes = 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
        let label = statusRaw || 'Pending'

        if (status === 'approved') {
            classes = 'bg-green-50 text-green-700 ring-1 ring-green-200'
        } else if (status === 'rejected') {
            classes = 'bg-red-50 text-red-700 ring-1 ring-red-200'
        } else if (status.includes('progress')) {
            classes = 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
            label = 'In Progress'
        } else if (status.includes('review')) {
            classes = 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            label = 'Review Needed'
        } else if (status === 'pending') {
            classes = 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
        }

        return (
            <Chip
                label={label}
                className={`min-w-[128px] ${classes}`}
            />
        )
    }

    const handleRowClick = (row: UserRow) => {
        const statusRaw = getApplicationStatus(row)
        const status = (statusRaw || '').toString().trim().toLowerCase()

        if (status === 'pending') {
            showToast('info', 'This user has not started the certification application yet.')
        } else if (status.includes('progress')) {
            showToast('info', 'This user is currently filling the certification application.')
        } else if (status.includes('review') || status.includes('approved') || status.includes('rejected')) {
            // Navigate to application detail page
            const applicationId = row.applications?.[0]?.id
            if (applicationId) {
                navigate(`/certification/application/${row.id}/${applicationId}`, {
                    state: { status: getApplicationStatus(row) }
                })
            } else {
                showToast('error', 'Application ID not found.')
            }
        }
    }

    return (
        <div className="py-4">
            <div className='bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] p-6'>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
                        <p className="text-gray-600 text-sm">View certification applications by users</p>
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
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-[10px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-xs"
                            />
                        </div>

                        {/* Date Range Picker */}
                        <DateRangePicker
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            onDateRangeChange={handleDateFilterApply}
                            placeholder="Filter by date range"
                            className="w-72 text-xs"
                            includeTime={true}
                        />
                    </div>
                </div>

                {/* Content */}
                {loading || users.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200">
                        {loading ? (
                            <div className="p-6">
                                <div className="animate-pulse space-y-4">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="h-16 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="text-gray-500">
                                    <p className="text-lg font-medium">No users found</p>
                                    <p className="text-sm">Try adjusting your search or filters</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <StyledTable<UserRow>
                            data={users}
                            columns={[
                                {
                                    key: 'fullName',
                                    header: 'Full Name',
                                    render: (row: UserRow) => (
                                        <span className="text-sm font-medium text-gray-900 cursor-pointer hover:underline text-[#0c684b]">
                                            {`${row.firstName || ''} ${row.lastName || ''}`.trim() || '—'}
                                        </span>
                                    )
                                },
                                {
                                    key: 'email',
                                    header: 'Email',
                                    render: (row: UserRow) => (
                                        <span className="text-sm text-gray-900 cursor-pointer hover:underline text-[#0c684b]">{row.email || '—'}</span>
                                    )
                                },
                                {
                                    key: 'createdAt',
                                    header: 'Registered',
                                    render: (row: UserRow) => (
                                        <span className="text-sm text-gray-900">{formatDate(row.createdAt)}</span>
                                    )
                                },
                                {
                                    key: 'applicationStatus',
                                    header: 'Application Status',
                                    render: (row: UserRow) => (
                                        <div className="text-sm flex justify-start">
                                            {renderStatusChip(getApplicationStatus(row))}
                                        </div>
                                    )
                                },
                            ]}
                            onRowClick={handleRowClick}
                        />

                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            itemsPerPage={pagination.itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default Applications


