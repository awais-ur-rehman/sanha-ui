import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import CustomTextarea from '../CustomTextarea'
import Button from '../Button'

interface ProductListFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
}

interface Product {
    name: string
    description: string
}

interface ProductListData {
    products: Product[]
}

const ProductListForm: React.FC<ProductListFormProps> = ({
    userId,
    applicationId,
    onSaveAndNext,
    isLoading = false
}) => {
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [originalData, setOriginalData] = useState<any>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [products, setProducts] = useState<Product[]>([])
    const [newProduct, setNewProduct] = useState<Product>({ name: '', description: '' })
    const [showNewProductRow, setShowNewProductRow] = useState(false)

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ProductListData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing product list data
    const { data: productListData } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.productList}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data && data.data.length > 0) {
                    const formData = data.data[0] // API returns array, take first item
                    setOriginalData(formData)

                    const productsList = formData.products || []
                    setProducts(productsList)
                    setValue('products', productsList)

                    // Mark initial load as complete after a short delay
                    setTimeout(() => {
                        setIsInitialLoad(false)
                    }, 200)
                } else {
                    // No data exists, initialize with empty array
                    setOriginalData({ products: [] })
                    setProducts([])
                    setValue('products', [])
                    setTimeout(() => {
                        setIsInitialLoad(false)
                    }, 200)
                }
                setIsLoadingData(false)
            },
            onError: () => {
                setIsLoadingData(false)
            }
        }
    )

    // Handle data when it arrives
    useEffect(() => {
        if (productListData?.data && isLoadingData) {
            if (productListData.data.length > 0) {
                const formData = productListData.data[0] // API returns array, take first item
                setOriginalData(formData)

                const productsList = formData.products || []
                setProducts(productsList)
                setValue('products', productsList)
            } else {
                // No data exists, initialize with empty array
                setOriginalData({ products: [] })
                setProducts([])
                setValue('products', [])
            }

            // Mark initial load as complete after a short delay
            setTimeout(() => {
                setIsInitialLoad(false)
            }, 200)

            setIsLoadingData(false)
        }
    }, [productListData, isLoadingData, setValue])

    // Handle product field changes
    const handleProductChange = (index: number, field: keyof Product, value: string) => {
        const updatedProducts = [...products]
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value
        }
        setProducts(updatedProducts)
        setValue('products', updatedProducts)
    }

    // Handle new product field changes
    const handleNewProductChange = (field: keyof Product, value: string) => {
        const updatedNewProduct = {
            ...newProduct,
            [field]: value
        }
        setNewProduct(updatedNewProduct)
    }

    // Add new product to the list
    const addNewProduct = () => {
        if (newProduct.name.trim() || newProduct.description.trim()) {
            const updatedProducts = [...products, { ...newProduct }]
            setProducts(updatedProducts)
            setValue('products', updatedProducts)
            setNewProduct({ name: '', description: '' }) // Reset new product form
            setShowNewProductRow(false) // Hide the new product row after adding
        }
    }

    // Show new product row
    const showAddProductRow = () => {
        setShowNewProductRow(true)
    }

    // Cancel adding new product
    const cancelAddProduct = () => {
        setNewProduct({ name: '', description: '' })
        setShowNewProductRow(false)
    }

    // Remove product from the list
    const removeProduct = (index: number) => {
        const updatedProducts = products.filter((_, i) => i !== index)
        setProducts(updatedProducts)
        setValue('products', updatedProducts)
    }

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues && !isInitialLoad) {
            // Add a small delay to ensure form values are properly set
            const timeoutId = setTimeout(() => {
                const changes: string[] = []

                // Check if products array has changed
                const currentProducts = watchedValues.products || []
                const originalProducts = originalData.products || []

                const hasProductsChanged = JSON.stringify(currentProducts) !== JSON.stringify(originalProducts)

                // Check if new product has any content (indicates user is adding a new product)
                const hasNewProductContent = (newProduct.name.trim() !== '' || newProduct.description.trim() !== '') && showNewProductRow

                const hasFormChanges = hasProductsChanged || hasNewProductContent

                if (hasProductsChanged) {
                    changes.push('products array changed')
                }
                if (hasNewProductContent) {
                    changes.push('new product being added')
                }

                console.log('ProductList Change detection:', {
                    hasFormChanges,
                    changes,
                    currentProducts,
                    originalProducts,
                    newProduct,
                    hasNewProductContent
                })
                setHasChanges(hasFormChanges)
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [watchedValues, originalData, isInitialLoad, newProduct, showNewProductRow])

    const onSubmit = (_data: ProductListData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // If there's content in new product, add it first
        if ((newProduct.name.trim() || newProduct.description.trim()) && showNewProductRow) {
            addNewProduct()
        }

        // Prepare payload for API
        const payload = {
            products: products
        }

        onSaveAndNext(payload)
    }

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c684b]"></div>
            </div>
        )
    }

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='min-h-[calc(100vh-300px)] max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 px-4'>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
                            {!showNewProductRow && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={showAddProductRow}
                                >
                                    Add Product
                                </Button>
                            )}
                        </div>

                        {/* Products Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                                Product Name *
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                                                Description *
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {/* Existing Products */}
                                        {products.map((product, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-2 whitespace-nowrap">
                                                    <CustomInput
                                                        value={product.name}
                                                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                        placeholder="Enter product name"
                                                        className="border-0 p-0 focus:ring-0 focus:border-0"
                                                        error={errors.products?.[index]?.name?.message}
                                                    />
                                                </td>
                                                <td className="px-6 py-2">
                                                    <CustomTextarea
                                                        value={product.description}
                                                        onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                                                        placeholder="Enter product description"
                                                        rows={2}
                                                        className="border-0 p-0 focus:ring-0 text-start palceholder:text-start focus:border-0 resize-none"
                                                        error={errors.products?.[index]?.description?.message}
                                                    />
                                                </td>
                                                <td className="px-6 py-2 whitespace-nowrap text-start text-sm font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(index)}
                                                        className="text-red-600 hover:text-red-900 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* New Product Row - Only show when showNewProductRow is true */}
                                        {showNewProductRow && (
                                            <tr>
                                                <td className="px-6 py-2 whitespace-nowrap">
                                                    <CustomInput
                                                        value={newProduct.name}
                                                        onChange={(e) => handleNewProductChange('name', e.target.value)}
                                                        placeholder="Enter new product name"
                                                        className="border-0 p-0 focus:ring-0 focus:border-0 bg-transparent"
                                                    />
                                                </td>
                                                <td className="px-6 py-2">
                                                    <CustomTextarea
                                                        value={newProduct.description}
                                                        onChange={(e) => handleNewProductChange('description', e.target.value)}
                                                        placeholder="Enter new product description"
                                                        rows={2}
                                                        className="border-0 p-0 focus:ring-0 focus:border-0 resize-none bg-transparent"
                                                    />
                                                </td>
                                                <td className="px-6 py-2 whitespace-nowrap text-start text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={addNewProduct}
                                                            className="text-[#0c684b] hover:text-[#0a5a3f] text-sm font-medium"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={cancelAddProduct}
                                                            className="text-gray-600 hover:text-gray-800 text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>

                {hasChanges && (
                    <div className="absolute -bottom-16 right-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center text-sm text-amber-600">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                You have unsaved changes
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}

export default ProductListForm
