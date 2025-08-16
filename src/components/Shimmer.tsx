interface ShimmerProps {
  rows?: number
  columns?: number
  className?: string
}

const Shimmer = ({ rows = 5, columns = 4, className = '' }: ShimmerProps) => {
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