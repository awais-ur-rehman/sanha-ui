import React, { useState, useEffect } from 'react'
import { FiEdit, FiTrash2, FiMapPin } from 'react-icons/fi'
import Sheet from './ui/sheet'
import { Switch } from './ui/switch'
import type { Product } from '../types/entities'

interface ProductDetailSheetProps {
  product: Product | null
  open: boolean
  onClose: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
  hasUpdatePermission: boolean
  hasDeletePermission: boolean
}

const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({
  product,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  hasUpdatePermission,
  hasDeletePermission,
}) => {
  const [localIsActive, setLocalIsActive] = useState(Boolean(product?.isActive))

  // Update local state when product changes
  useEffect(() => {
    setLocalIsActive(Boolean(product?.isActive))
  }, [product?.isActive])

  const handleToggleChange = async (checked: boolean) => {
    if (!product) return
    
    // Optimistically update the local state
    setLocalIsActive(checked)
    
    try {
      // Call the API
      await onToggleStatus({ ...product, isActive: checked })
    } catch (error) {
      // If API call fails, revert the local state
      setLocalIsActive(!checked)
    }
  }



  if (!product) return null

  return (
    <Sheet open={open} close={onClose} title={`Product Details - ${product.name}`}>
      <div className="flex flex-col h-full p-6">
        {/* Product Image */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 overflow-hidden rounded-lg">
            {product.image ? (
              <img
                draggable={false}
                className="w-full h-full object-cover"
                src={product.image}
                alt={`${product.name} image`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="text-left flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-xl text-gray-900 mb-2">
                {product.name}
              </h2>
              <p className="text-base text-gray-700 mb-1">
                Manufacturer: {product.manufacturer}
              </p>
              <p className="text-sm text-gray-600">
                Made in: {product.madeIn}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={localIsActive}
                  onCheckedChange={handleToggleChange}
                />
                <span className="text-sm text-gray-700">
                  {localIsActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  product.status === 'Halaal' 
                    ? 'bg-green-100 text-green-800'
                    : product.status === 'Haraam'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {product.status}
              </span>
            </div>
          </div>

          {/* Contains/Ingredients */}
          {product.contains.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-900">Contains/Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.contains.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}


          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Product Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Product Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="text-gray-400 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Manufacturer</p>
                    <p className="text-sm text-gray-900">{product.manufacturer}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiMapPin className="text-gray-400 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Country of Origin</p>
                    <p className="text-sm text-gray-900">{product.madeIn}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex gap-3 mt-4 flex-shrink-0">
          {hasDeletePermission && (
            <button
              onClick={() => onDelete(product)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:text-white border border-red-400 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          )}
          
          {hasUpdatePermission && (
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiEdit size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}

export default ProductDetailSheet
