import { type ReactNode } from 'react'

import Shimmer from './Shimmer'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  width?: string
}

interface ActionButton {
  label: string
  icon: ReactNode
  onClick: (item: any) => void
  variant?: 'primary' | 'danger' | 'secondary'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading: boolean
  selectedRows: number[]
  onRowSelect: (id: number) => void
  onSelectAll: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddClick: () => void
  addButtonText: string
  addButtonIcon?: ReactNode
  actions?: ActionButton[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
  }
}

const DataTable = <T extends { id?: number }>({
  data,
  columns,
  loading,
  selectedRows,
  onRowSelect,
  onSelectAll,
  searchTerm,
  onSearchChange,
  onAddClick,
  addButtonText,
  addButtonIcon,
  actions,
  pagination
}: DataTableProps<T>) => {
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onAddClick}
              className="flex items-center space-x-2 px-4 cursor-pointer py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {addButtonIcon}
              <span>{addButtonText}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-[#0c684b] focus:ring-[#0c684b]"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <Shimmer rows={5} columns={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id || 0)}
                      onChange={() => onRowSelect(item.id || 0)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-black/80">
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              action.variant === 'danger'
                                ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                : action.variant === 'primary'
                                ? 'text-[#0c684b] hover:bg-green-50 hover:text-green-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedRows.length} of {data.length} row(s) selected
            {pagination && (
              <span className="ml-4">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </span>
            )}
          </div>
          {pagination && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataTable 