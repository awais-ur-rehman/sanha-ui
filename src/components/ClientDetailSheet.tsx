import React, { useState, useEffect } from 'react'
import { FiEdit, FiTrash2, FiMail, FiPhone, FiGlobe, FiMapPin, FiCalendar } from 'react-icons/fi'
import Sheet from './ui/sheet'
import { Switch } from './ui/switch'
import type { Client } from '../types/entities'

interface ClientDetailSheetProps {
  client: Client | null
  open: boolean
  onClose: () => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onToggleStatus: (client: Client) => void
  hasUpdatePermission: boolean
  hasDeletePermission: boolean
}

const ClientDetailSheet: React.FC<ClientDetailSheetProps> = ({
  client,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  hasUpdatePermission,
  hasDeletePermission,
}) => {
  const [localIsActive, setLocalIsActive] = useState(Boolean(client?.isActive))

  // Update local state when client changes
  useEffect(() => {
    setLocalIsActive(Boolean(client?.isActive))
  }, [client?.isActive])

  const handleToggleChange = async (checked: boolean) => {
    if (!client) return
    
    // Optimistically update the local state
    setLocalIsActive(checked)
    
    try {
      // Call the API
      await onToggleStatus({ ...client, isActive: checked })
    } catch (error) {
      // If API call fails, revert the local state
      setLocalIsActive(!checked)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (!client) return null

  return (
    <Sheet open={open} close={onClose} title={`Client Details - ${client.name}`}>
      <div className="flex flex-col h-full p-6">
        {/* Client Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 overflow-hidden rounded-lg">
            {client.logoUrl ? (
              <img
                draggable={false}
                className="w-full h-full object-cover"
                src={client.logoUrl}
                alt={`${client.name} logo`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No Logo</span>
              </div>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="text-left">
            <h2 className="font-semibold text-xl text-gray-900 mb-2">
              {client.name}
            </h2>
            <p className="text-base text-gray-700 mb-1">
              Client Code: {client.clientCode && client.clientCode.length > 0 ? client.clientCode.join(', ') : '—'}
            </p>
            <p className="text-sm text-gray-600">
              Standard: {client.standard}
            </p>
          </div>


          {/* Categories */}
          {client.category.length > 0 && (
            <div className="flex justify-start items-center space-x-2">
              <h3 className="font-medium text-sm text-gray-900">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {client.category.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scopes */}
          {client.scope.length > 0 && (
            <div className="flex justify-start items-center space-x-2">
              <h3 className="font-medium text-sm text-gray-900">Certification Scopes</h3>
              <div className="flex flex-wrap gap-2">
                {client.scope.map((scope, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {client.products.length > 0 && (
            <div className="flex justify-start items-center space-x-2">
              <h3 className="font-medium text-sm text-gray-900">Products</h3>
              <div className="flex flex-wrap gap-2">
                {client.products.map((product, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active Status</span>
            <Switch
              checked={localIsActive}
              onCheckedChange={handleToggleChange}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <FiMail className="text-gray-400 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{client.email}</p>
                </div>
              </div>

              {client.fax && (
                <div className="flex items-start space-x-3">
                  <FiPhone className="text-gray-400 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fax</p>
                    <p className="text-sm text-gray-900">{client.fax}</p>
                  </div>
                </div>
              )}

              {client.website && (
                <div className="flex items-start space-x-3">
                  <FiGlobe className="text-gray-400 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Website</p>
                    <a 
                      href={client.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#0c684b] hover:underline"
                    >
                      {client.website}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone Numbers */}
              {client.phone.length > 0 && (
                <div className="flex items-start space-x-3">
                  <FiPhone className="text-gray-400 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone Numbers</p>
                    <div className="space-y-1">
                      {client.phone.map((phone, index) => (
                        <p key={index} className="text-sm text-gray-900">{phone}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses */}
              {client.address.length > 0 && (
                <div className="flex items-start space-x-3">
                  <FiMapPin className="text-gray-400 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Addresses</p>
                    <div className="space-y-1">
                      {client.address.map((address, index) => (
                        <p key={index} className="text-sm text-gray-900">{address}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certification Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Certification Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <FiCalendar className="text-gray-400 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Certified Since</p>
                  <p className="text-sm text-gray-900">{formatDate(client.certifiedSince)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FiCalendar className="text-gray-400 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm ${isExpired(client.expiryDate) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(client.expiryDate)}
                    </p>
                    {isExpired(client.expiryDate) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Expired
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {hasUpdatePermission && (
            <button
              onClick={() => onEdit(client)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiEdit size={16} />
              <span>Edit</span>
            </button>
          )}
          
          {hasDeletePermission && (
            <button
              onClick={() => onDelete(client)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:text-white border border-red-400 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}

export default ClientDetailSheet
