import { type ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (item: T, index?: number) => ReactNode
  width?: string
}

interface StyledTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

const StyledTable = <T extends { id?: number }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
}: StyledTableProps<T>) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                {
                  ...({} as any)
                }>
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 lg:px-4 py-2 whitespace-nowrap text-sm text-black/80">
                      {column.render ? column.render(item, index) : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StyledTable


