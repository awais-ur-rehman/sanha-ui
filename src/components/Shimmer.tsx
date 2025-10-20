interface ShimmerProps {
  rows?: number
  columns?: number
  className?: string
  isTableRow?: boolean
}

const Shimmer = ({ rows = 5, columns = 4, className = '', isTableRow = false }: ShimmerProps) => {
  if (isTableRow) {
    return (
      <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex} className="animate-pulse">
            {/* Checkbox column */}
            <td className="px-6 py-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </td>
            {/* Data columns */}
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                <div
                  className={`h-4 bg-gray-200 rounded ${
                    colIndex === 0 ? 'w-12' : 
                    colIndex === 1 ? 'w-24' : 
                    colIndex === 2 ? 'w-32' : 
                    colIndex === 3 ? 'w-20' : 'w-28'
                  }`}
                />
              </td>
            ))}
            {/* Actions column */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </td>
          </tr>
        ))}
      </>
    )
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4 py-4 border-b border-gray-200">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`h-4 bg-gray-200 rounded ${
                colIndex === 0 ? 'w-12' : 
                colIndex === 1 ? 'w-16' : 
                colIndex === 2 ? 'flex-1' : 'w-24'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Shimmer 