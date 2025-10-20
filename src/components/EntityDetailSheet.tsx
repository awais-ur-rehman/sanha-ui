import React, { useEffect, useMemo, useState } from 'react'
import Sheet from './ui/sheet'
import Tooltip from './Tooltip'
import { Switch } from './ui/switch'
import { FiEdit, FiTrash2 } from 'react-icons/fi'

type BadgeColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray'

interface TextItem {
  label: string
  value: string
  icon?: React.ReactNode
  link?: boolean
  tooltip?: string
  truncateWidth?: string
}

interface ChipSection {
  title: string
  items: string[]
  limit?: number
}

interface DescriptionSection {
  title: string
  text: string
  maxHeightClass?: string
}

interface LinkItem {
  url: string
  typeTag?: string
}

interface LinkSection {
  title: string
  links: LinkItem[]
  maxHeightClass?: string
}

interface DateItem {
  label: string
  date: string
  isExpired?: boolean
  showExpiredBadge?: boolean
}

interface StatusToggleConfig {
  checked: boolean
  onChange: (checked: boolean) => Promise<void> | void
  enabled?: boolean
  labelActive?: string
  labelInactive?: string
}

interface StatusBadgeConfig {
  text: string
  color: BadgeColor
}

interface ImageConfig {
  src?: string
  alt?: string
}

interface FooterActions<T> {
  onEdit?: (entity: T) => void
  onDelete?: (entity: T) => void
  hasUpdatePermission?: boolean
  hasDeletePermission?: boolean
}

interface SectionItem {
  label: string
  value: string
}

interface Section {
  title: string
  items?: SectionItem[] | string[]
  type?: 'chips'
}

interface StatusAccessor {
  isActive: boolean
  badge?: {
    text: string
    colorClass: string
  }
}

export interface EntityDetailSheetProps<T> {
  entity: T | null
  open: boolean
  onClose: () => void
  dense?: boolean
  // New interface props
  titleAccessor?: (entity: T) => string
  imageAccessor?: (entity: T) => string
  statusAccessor?: (entity: T) => StatusAccessor
  sections?: Section[]
  onEdit?: (entity: T) => void
  onDelete?: (entity: T) => void
  onToggleStatus?: (entity: T) => void
  hasUpdatePermission?: boolean
  hasDeletePermission?: boolean
  // Legacy interface props (for backward compatibility)
  title?: string
  headerTitle?: string
  headerRows?: TextItem[]
  image?: ImageConfig
  statusToggle?: StatusToggleConfig
  statusBadge?: StatusBadgeConfig
  chipSections?: ChipSection[]
  descriptionSections?: DescriptionSection[]
  infoGrid?: TextItem[]
  infoGridTitle?: string
  dateGrid?: DateItem[]
  dateGridTitle?: string
  linkSection?: LinkSection
  footerActions?: FooterActions<T>
}

const badgeColorToClasses = (color: BadgeColor) => {
  switch (color) {
    case 'green':
      return 'bg-green-100 text-green-800'
    case 'red':
      return 'bg-red-100 text-red-800'
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800'
    case 'blue':
      return 'bg-blue-100 text-blue-800'
    case 'purple':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const EntityDetailSheet = <T,>({
  entity,
  open,
  onClose,
  dense = false,
  // New interface props
  titleAccessor,
  imageAccessor,
  statusAccessor,
  sections = [],
  onEdit,
  onDelete,
  onToggleStatus,
  hasUpdatePermission,
  hasDeletePermission,
  // Legacy interface props
  title,
  headerTitle,
  headerRows = [],
  image,
  statusToggle,
  statusBadge,
  chipSections = [],
  descriptionSections = [],
  infoGrid = [],
  infoGridTitle = 'Contact Information',
  dateGrid = [],
  dateGridTitle = 'Certification Information',
  linkSection,
  footerActions,
}: EntityDetailSheetProps<T>) => {
  const [localChecked, setLocalChecked] = useState<boolean>(Boolean(statusToggle?.checked))

  useEffect(() => {
    setLocalChecked(Boolean(statusToggle?.checked))
  }, [statusToggle?.checked])

  const statusLabel = useMemo(() => {
    if (!statusToggle) return ''
    return localChecked ? (statusToggle.labelActive || 'Active') : (statusToggle.labelInactive || 'Inactive')
  }, [statusToggle, localChecked])

  // Compute values for new interface
  const computedTitle = useMemo(() => {
    if (titleAccessor && entity) return titleAccessor(entity)
    return title || 'Details'
  }, [titleAccessor, entity, title])

  const computedHeaderTitle = useMemo(() => {
    if (titleAccessor && entity) return titleAccessor(entity)
    return headerTitle || 'Details'
  }, [titleAccessor, entity, headerTitle])

  const computedImage = useMemo(() => {
    if (imageAccessor && entity) {
      const imageSrc = imageAccessor(entity)
      return imageSrc ? { src: imageSrc, alt: computedHeaderTitle } : undefined
    }
    return image
  }, [imageAccessor, entity, image, computedHeaderTitle])

  const computedStatus = useMemo(() => {
    if (statusAccessor && entity) {
      return statusAccessor(entity)
    }
    return undefined
  }, [statusAccessor, entity])

  if (!entity) return null

  return (
    <Sheet open={open} close={onClose} title={computedTitle}>
      <div className={`flex flex-col h-full ${dense ? 'p-4 text-xs' : 'p-6 text-sm'}`}>
        {computedImage && (
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 overflow-hidden rounded-lg">
              {computedImage.src ? (
                <img
                  draggable={false}
                  className="w-full h-full object-cover"
                  src={computedImage.src}
                  alt={computedImage.alt || ''}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    // Show fallback placeholder
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) {
                      fallback.style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full bg-gray-200 flex items-center justify-center absolute inset-0"
                style={{ display: computedImage.src ? 'none' : 'flex' }}
              >
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            </div>
          </div>
        )}

        <div className={`flex flex-col ${dense ? 'gap-3 pt-4' : 'gap-4 pt-8'} flex-1`}>
          <div className={`flex items-start justify-between gap-4 ${dense ? 'mb-2' : 'mb-4'}`}>
            <div className="min-w-0 flex-1">
              <h2 className={`font-semibold ${dense ? 'text-base mb-1' : 'text-lg mb-2'} text-gray-900 truncate`} title={computedHeaderTitle}>
                {computedHeaderTitle}
              </h2>
              {/* Status display for products and ecodes only (not for books and resources) */}
              {(computedStatus?.badge || statusBadge) && !computedStatus?.badge?.text?.includes('Active') && !computedStatus?.badge?.text?.includes('Inactive') && (
                <div className={`${dense ? 'mb-1' : 'mb-2'}`}>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${computedStatus?.badge?.colorClass || badgeColorToClasses(statusBadge?.color || 'gray')}`}>
                    {computedStatus?.badge?.text || statusBadge?.text}
                  </span>
                </div>
              )}
              {headerRows.length > 0 && (
                <div className={`${dense ? 'space-y-0.5' : 'space-y-1'}`}>
                  {headerRows.map((row, idx) => (
                    <div key={`${row.label}-${idx}`} className="text-gray-700">
                      <span className="font-medium">{row.label}:</span>{' '}
                      {row.tooltip ? (
                        <Tooltip content={row.tooltip}>
                          <span className={`truncate inline-block ${row.truncateWidth || 'max-w-[420px]'} align-bottom`}>
                            {row.link ? (
                              <a href={row.value} target="_blank" rel="noopener noreferrer" className="text-[#0c684b] hover:underline">
                                {row.value}
                              </a>
                            ) : (
                              row.value
                            )}
                          </span>
                        </Tooltip>
                      ) : row.link ? (
                        <a href={row.value} target="_blank" rel="noopener noreferrer" className="text-[#0c684b] hover:underline">
                          {row.value}
                        </a>
                      ) : (
                        <span>{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {(statusToggle || statusBadge || computedStatus) && (
              <div className={`flex flex-col items-end ${dense ? 'gap-1' : 'gap-2'} flex-shrink-0 ml-4`}>
                {statusToggle && (
                  <div className={`flex items-center ${dense ? 'gap-1' : 'gap-2'}`}>
                    <span className={`${dense ? 'text-[10px]' : 'text-xs'} text-gray-600`}>{statusLabel}</span>
                    <Switch
                      checked={localChecked}
                      onCheckedChange={async (checked) => {
                        setLocalChecked(checked)
                        try {
                          await statusToggle.onChange(checked)
                        } catch {
                          setLocalChecked(!checked)
                        }
                      }}
                      size="sm"
                      disabled={statusToggle.enabled === false}
                    />
                  </div>
                )}
                {computedStatus && (
                  <div className={`flex flex-col items-end ${dense ? 'gap-1' : 'gap-2'}`}>
                    <div className={`flex items-center ${dense ? 'gap-1' : 'gap-2'}`}>
                      <span className={`${dense ? 'text-[10px]' : 'text-xs'} text-gray-600`}>{computedStatus.isActive ? 'Active' : 'Inactive'}</span>
                      <Switch
                        checked={computedStatus.isActive}
                      onCheckedChange={async () => {
                        if (onToggleStatus) {
                          try {
                            await onToggleStatus(entity)
                          } catch (error) {
                            console.error('Error toggling status:', error)
                          }
                        }
                      }}
                        size="sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {descriptionSections.map((sec, idx) => (
            sec.text ? (
              <div key={`${sec.title}-${idx}`}>
                <h3 className={`font-semibold text-gray-900 ${dense ? 'mb-1 text-sm' : 'mb-2'}`}>{sec.title}</h3>
                <div className={`${sec.maxHeightClass || (dense ? 'max-h-[2.4rem]' : 'max-h-[3.2rem]')} overflow-y-auto bg-gray-50 ${dense ? 'p-2' : 'p-3'} rounded-lg`}>
                  <p className={`${dense ? 'text-xs leading-snug' : 'text-sm leading-relaxed'} text-gray-600`}>{sec.text}</p>
                </div>
              </div>
            ) : null
          ))}

          {chipSections.map((section, idx) => (
            section.items && section.items.length > 0 ? (
              <div key={`${section.title}-${idx}`}>
                <h3 className={`font-medium ${dense ? 'text-xs mb-0.5' : 'text-sm mb-1'} text-gray-900`}>{section.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {section.items.slice(0, section.limit ?? 3).map((item, i) => (
                    <span key={`${item}-${i}`} className={`px-2 py-0.5 bg-gray-100 text-gray-800 ${dense ? 'text-[10px]' : 'text-xs'} rounded-full`}>{item}</span>
                  ))}
                  {section.items.length > (section.limit ?? 3) && (
                    <Tooltip content={section.items.join(', ')}>
                      <span className={`px-2 py-0.5 bg-gray-100 text-gray-700 ${dense ? 'text-[10px]' : 'text-xs'} rounded-full cursor-default`}>
                        +{section.items.length - (section.limit ?? 3)} more
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            ) : null
          ))}

          {/* New sections rendering */}
          {sections.map((section, idx) => (
            <div key={`${section.title}-${idx}`}>
              <h3 className={`font-semibold text-gray-900 ${dense ? 'mb-1 text-sm' : 'mb-2'}`}>{section.title}</h3>
              {section.type === 'chips' ? (
                <div className="flex flex-wrap gap-1">
                  {(section.items as string[])?.filter(item => item && item.trim() !== '').map((item, i) => (
                    <span key={`${item}-${i}`} className={`px-2 py-0.5 bg-gray-100 text-gray-800 ${dense ? 'text-[10px]' : 'text-xs'} rounded-full`}>{item}</span>
                  ))}
                  {(!section.items || (section.items as string[]).length === 0 || (section.items as string[]).every(item => !item || item.trim() === '')) && (
                    <span className="text-sm text-gray-500 italic">No items available</span>
                  )}
                </div>
              ) : section.title.toLowerCase().includes('description') ? (
                <div className={`${dense ? 'max-h-[2.4rem] p-2' : 'max-h-[2.6rem] p-3'} overflow-y-auto bg-gray-50 rounded-lg`}>
                  {(section.items as SectionItem[])?.filter(item => item && item.label && item.value).map((item, i) => (
                    <div key={`${item.label}-${i}`} className="mb-2 last:mb-0">
                      <p className={`${dense ? 'text-xs mb-0.5' : 'text-sm mb-1'} font-medium text-gray-700`}>{item.label}</p>
                      <p className={`${dense ? 'text-xs leading-snug' : 'text-sm leading-relaxed'} text-gray-900`}>{item.value || 'N/A'}</p>
                    </div>
                  ))}
                  {(!section.items || (section.items as SectionItem[]).length === 0 || (section.items as SectionItem[]).every(item => !item || !item.label || !item.value)) && (
                    <span className="text-sm text-gray-500 italic">No information available</span>
                  )}
                </div>
              ) : (
                <div className={`${dense ? 'space-y-1' : 'space-y-2'}`}>
                  {(section.items as SectionItem[])?.filter(item => item && item.label && item.value).map((item, i) => (
                    <div key={`${item.label}-${i}`} className="flex items-start space-x-3">
                      <div>
                        <p className={`${dense ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>{item.label}</p>
                        <p className={`${dense ? 'text-xs' : 'text-sm'} text-gray-900`}>{item.value || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                  {(!section.items || (section.items as SectionItem[]).length === 0 || (section.items as SectionItem[]).every(item => !item || !item.label || !item.value)) && (
                    <span className="text-sm text-gray-500 italic">No information available</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {infoGrid.length > 0 && (
            <div className="space-y-3">
              <h3 className={`font-semibold text-gray-900 ${dense ? 'text-sm' : ''}`}>{infoGridTitle}</h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 ${dense ? 'gap-3' : 'gap-4'}`}>
                {infoGrid.map((item, idx) => (
                  <div key={`${item.label}-${idx}`} className="flex items-start space-x-3 min-w-0">
                    {item.icon}
                    <div>
                      <p className={`${dense ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>{item.label}</p>
                      {item.tooltip ? (
                        <Tooltip content={item.tooltip}>
                          <p className={`${dense ? 'text-xs' : 'text-sm'} text-gray-900 truncate ${item.truncateWidth || 'max-w-[200px]'}`}>
                            {item.link ? (
                              <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-[#0c684b] hover:underline">
                                {item.value}
                              </a>
                            ) : (
                              item.value
                            )}
                          </p>
                        </Tooltip>
                      ) : (
                        <p className={`${dense ? 'text-xs' : 'text-sm'} text-gray-900`}>
                          {item.link ? (
                            <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-[#0c684b] hover:underline">
                              {item.value}
                            </a>
                          ) : (
                            item.value
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dateGrid.length > 0 && (
            <div className="space-y-3">
              <h3 className={`font-semibold text-gray-900 ${dense ? 'text-sm' : ''}`}>{dateGridTitle}</h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 ${dense ? 'gap-3' : 'gap-4'}`}>
                {dateGrid.map((d, idx) => (
                  <div key={`${d.label}-${idx}`} className="flex items-start space-x-3">
                    <div>
                      <p className={`${dense ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>{d.label}</p>
                      <div className={`flex items-center ${dense ? 'space-x-1' : 'space-x-2'}`}>
                        <p className={`${dense ? 'text-xs' : 'text-sm'} ${d.isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(d.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {d.showExpiredBadge && d.isExpired && (
                          <span className={`px-2 py-1 bg-red-100 text-red-800 ${dense ? 'text-[10px]' : 'text-xs'} rounded-full`}>Expired</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {linkSection && linkSection.links && linkSection.links.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{linkSection.title}</h3>
              <div className={`space-y-2 bg-gray-50 p-2 rounded-lg overflow-y-auto ${linkSection.maxHeightClass || 'max-h-[120px] min-h-[60px]'}`}>
                {linkSection.links.map((link, idx) => (
                  <div key={`${link.url}-${idx}`} className="flex items-center gap-2 p-2">
                    {link.typeTag && (
                      <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">{link.typeTag}</span>
                    )}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#0c684b] hover:text-green-700 flex-1 truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`flex ${dense ? 'gap-2 mt-3' : 'gap-3 mt-4'} flex-shrink-0`}>
          {(footerActions?.hasDeletePermission && footerActions.onDelete) || (hasDeletePermission && onDelete) ? (
            <button
              onClick={() => {
                if (footerActions?.onDelete) {
                  footerActions.onDelete(entity)
                } else if (onDelete) {
                  onDelete(entity)
                }
              }}
              className={`flex-1 flex items-center justify-center ${dense ? 'space-x-1 px-3 py-2 text-xs' : 'space-x-2 px-4 py-3'} text-red-400 hover:text-white border border-red-400 rounded-lg hover:bg-red-700 transition-colors`}
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          ) : null}
          {(footerActions?.hasUpdatePermission && footerActions.onEdit) || (hasUpdatePermission && onEdit) ? (
            <button
              onClick={() => {
                if (footerActions?.onEdit) {
                  footerActions.onEdit(entity)
                } else if (onEdit) {
                  onEdit(entity)
                }
              }}
              className={`flex-1 flex items-center justify-center ${dense ? 'space-x-1 px-3 py-2 text-xs' : 'space-x-2 px-4 py-3'} bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors`}
            >
              <FiEdit size={16} />
              <span>Edit</span>
            </button>
          ) : null}
        </div>
      </div>
    </Sheet>
  )
}

export default EntityDetailSheet



