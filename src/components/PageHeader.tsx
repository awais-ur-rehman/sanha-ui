import { type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[18px] md:text-[20px] lg:text-[20px] xl:text-[22px] font-semibold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px] text-gray-600">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

export default PageHeader


