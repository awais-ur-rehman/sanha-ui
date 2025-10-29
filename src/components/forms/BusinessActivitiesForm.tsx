import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import CustomTextarea from '../CustomTextarea'
import RadioGroup from '../RadioGroup'
import Button from '../Button'

interface BusinessActivitiesFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
}

interface BusinessActivitiesData {
    brandNames: string
    totalNumberOfProducts: string
    totalNumberOfRawMaterials: string
    numberOfProductVariety: string
    numberOfHACCPStudies: string
    exportLocations: string
    isProducerDistributorSupplierOfWineOrPork: string
    hasSeparateFacilityForWineOrPork: string
    numberOfWarehouses: string
    warehouseAddresses: string[]
}

const BusinessActivitiesForm: React.FC<BusinessActivitiesFormProps> = ({
    userId,
    applicationId,
    onSaveAndNext,
    isLoading = false
}) => {
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [originalData, setOriginalData] = useState<any>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [numberOfWarehouses, setNumberOfWarehouses] = useState(1)
    const [warehouseAddresses, setWarehouseAddresses] = useState<string[]>([''])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<BusinessActivitiesData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing business activities data
    const { data: businessActivitiesData } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.businessActivities}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data) {
                    const formData = data.data
                    setOriginalData(formData)

                    setValue('brandNames', formData.brandsName || '') // API uses brandsName
                    setValue('totalNumberOfProducts', formData.totalNoOfProducts || '') // API uses totalNoOfProducts
                    setValue('totalNumberOfRawMaterials', formData.totalNoOfRawMaterials || '') // API uses totalNoOfRawMaterials
                    setValue('numberOfProductVariety', formData.noOfProductVariety || '') // API uses noOfProductVariety
                    setValue('numberOfHACCPStudies', formData.noOfHaccpStudies || '') // API uses noOfHaccpStudies
                    setValue('exportLocations', formData.exportLocations || '')
                    setValue('isProducerDistributorSupplierOfWineOrPork', formData.isProducerDistributorSupplierOfWineOrPork || 'No')
                    setValue('hasSeparateFacilityForWineOrPork', formData.hasSeparateFacilityForWineOrPork || 'No')
                    setValue('numberOfWarehouses', formData.numberOfWarehouses || '1')

                    // Handle warehouse addresses - API uses warehouses array
                    const warehouses = formData.warehouses || []
                    const warehouseCount = parseInt(formData.numberOfWarehouses || '1')
                    const warehouseAddresses = warehouses.map((w: any) => w.physicalAddress || '').slice(0, warehouseCount)
                    setNumberOfWarehouses(warehouseCount)
                    setWarehouseAddresses(warehouseAddresses.length > 0 ? warehouseAddresses : Array(warehouseCount).fill(''))
                    setValue('warehouseAddresses', warehouseAddresses.length > 0 ? warehouseAddresses : Array(warehouseCount).fill(''))

                    // Mark initial load as complete after a short delay
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
        if (businessActivitiesData?.data && isLoadingData) {
            const formData = businessActivitiesData.data
            setOriginalData(formData)

            setValue('brandNames', formData.brandsName || '') // API uses brandsName
            setValue('totalNumberOfProducts', formData.totalNoOfProducts || '') // API uses totalNoOfProducts
            setValue('totalNumberOfRawMaterials', formData.totalNoOfRawMaterials || '') // API uses totalNoOfRawMaterials
            setValue('numberOfProductVariety', formData.noOfProductVariety || '') // API uses noOfProductVariety
            setValue('numberOfHACCPStudies', formData.noOfHaccpStudies || '') // API uses noOfHaccpStudies
            setValue('exportLocations', formData.exportLocations || '')
            setValue('isProducerDistributorSupplierOfWineOrPork', formData.isProducerDistributorSupplierOfWineOrPork || 'No')
            setValue('hasSeparateFacilityForWineOrPork', formData.hasSeparateFacilityForWineOrPork || 'No')
            setValue('numberOfWarehouses', formData.numberOfWarehouses || '1')

            // Handle warehouse addresses - API uses warehouses array
            const warehouses = formData.warehouses || []
            const warehouseCount = parseInt(formData.numberOfWarehouses || '1')
            const warehouseAddresses = warehouses.map((w: any) => w.physicalAddress || '').slice(0, warehouseCount)
            setNumberOfWarehouses(warehouseCount)
            setWarehouseAddresses(warehouseAddresses.length > 0 ? warehouseAddresses : Array(warehouseCount).fill(''))
            setValue('warehouseAddresses', warehouseAddresses.length > 0 ? warehouseAddresses : Array(warehouseCount).fill(''))

            // Mark initial load as complete after a short delay
            setTimeout(() => {
                setIsInitialLoad(false)
            }, 200)

            setIsLoadingData(false)
        }
    }, [businessActivitiesData, isLoadingData, setValue])

    // Handle warehouse count change
    const handleWarehouseCountChange = (count: number) => {
        setNumberOfWarehouses(count)
        const newAddresses = Array(count).fill('').map((_, index) => warehouseAddresses[index] || '')
        setWarehouseAddresses(newAddresses)
        setValue('warehouseAddresses', newAddresses)
    }

    // Handle warehouse address change
    const handleWarehouseAddressChange = (index: number, value: string) => {
        const newAddresses = [...warehouseAddresses]
        newAddresses[index] = value
        setWarehouseAddresses(newAddresses)
        setValue('warehouseAddresses', newAddresses)
    }

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues && !isInitialLoad) {
            // Add a small delay to ensure form values are properly set
            const timeoutId = setTimeout(() => {
                const changes: string[] = []
                const hasFormChanges = Object.keys(watchedValues).some(key => {
                    const currentValue = watchedValues[key as keyof BusinessActivitiesData]

                    // Handle field name mapping for API response
                    let originalValue
                    if (key === 'brandNames') {
                        originalValue = originalData.brandsName
                    } else if (key === 'totalNumberOfProducts') {
                        originalValue = originalData.totalNoOfProducts
                    } else if (key === 'totalNumberOfRawMaterials') {
                        originalValue = originalData.totalNoOfRawMaterials
                    } else if (key === 'numberOfProductVariety') {
                        originalValue = originalData.noOfProductVariety
                    } else if (key === 'numberOfHACCPStudies') {
                        originalValue = originalData.noOfHaccpStudies
                    } else if (key === 'warehouseAddresses') {
                        // Handle warehouse addresses - API uses warehouses array
                        const warehouses = originalData.warehouses || []
                        const warehouseCount = parseInt(originalData.numberOfWarehouses || '1')
                        const originalAddresses = warehouses.map((w: any) => w.physicalAddress || '').slice(0, warehouseCount)
                        const currentArray = Array.isArray(currentValue) ? currentValue : []
                        return JSON.stringify([...originalAddresses].sort()) !== JSON.stringify([...currentArray].sort())
                    } else {
                        originalValue = originalData[key]
                    }

                    // Handle array comparison for warehouseAddresses
                    if (key === 'warehouseAddresses') {
                        return false // Already handled above
                    }

                    // Normalize values for comparison
                    const curr = (currentValue ?? '').toString().trim()
                    const orig = (originalValue ?? '').toString().trim()
                    const hasChange = curr !== orig

                    if (hasChange) {
                        changes.push(`${key}: "${originalValue}" -> "${currentValue}"`)
                    }

                    return hasChange
                })

                console.log('BusinessActivities Change detection:', { hasFormChanges, changes, originalData, watchedValues })
                setHasChanges(hasFormChanges)
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [watchedValues, originalData, isInitialLoad])

    const onSubmit = (data: BusinessActivitiesData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // Prepare payload for API - map field names to API format
        const {
            brandNames,
            totalNumberOfProducts,
            totalNumberOfRawMaterials,
            numberOfProductVariety,
            numberOfHACCPStudies,
            warehouseAddresses: formWarehouseAddresses,
            ...restData
        } = data

        const payload = {
            ...restData,
            brandsName: brandNames, // API uses brandsName
            totalNoOfProducts: totalNumberOfProducts, // API uses totalNoOfProducts
            totalNoOfRawMaterials: totalNumberOfRawMaterials, // API uses totalNoOfRawMaterials
            noOfProductVariety: numberOfProductVariety, // API uses noOfProductVariety
            noOfHaccpStudies: numberOfHACCPStudies, // API uses noOfHaccpStudies
            warehouses: warehouseAddresses
                .filter(addr => addr.trim() !== '')
                .map((address, index) => ({
                    warehouseNumber: index + 1,
                    physicalAddress: address
                }))
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
            <form onSubmit={handleSubmit(onSubmit)} >
                <div className='min-h-[calc(100vh-350px)] max-h-[calc(100vh-300px)] overflow-y-auto space-y-4 px-4'>
                    <h2 className="text-xl font-semibold text-gray-900">Business Activities</h2>
                    {/* Brand Names */}
                    <div>
                        <CustomTextarea
                            label="Brand Names *"
                            placeholder="Enter brand names separated by commas (e.g., Brand A, Brand B, Brand C)"
                            rows={3}
                            {...register('brandNames', { required: 'Brand names are required' })}
                            error={errors.brandNames?.message}
                        />
                    </div>

                    {/* Product and Material Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomInput
                            label="Total Number of Products *"
                            placeholder="Enter total number of products (1-10000)"
                            type="number"
                            {...register('totalNumberOfProducts', {
                                required: 'Total number of products is required',
                                min: { value: 1, message: 'Must be at least 1' },
                                max: { value: 10000, message: 'Must be at most 10000' }
                            })}
                            error={errors.totalNumberOfProducts?.message}
                        />

                        <CustomInput
                            label="Total Number of Raw Materials *"
                            placeholder="Enter total number of raw materials (1-10000)"
                            type="number"
                            {...register('totalNumberOfRawMaterials', {
                                required: 'Total number of raw materials is required',
                                min: { value: 1, message: 'Must be at least 1' },
                                max: { value: 10000, message: 'Must be at most 10000' }
                            })}
                            error={errors.totalNumberOfRawMaterials?.message}
                        />

                        <CustomInput
                            label="Number of Product Variety *"
                            placeholder="Enter number of product variety (1-10000)"
                            type="number"
                            {...register('numberOfProductVariety', {
                                required: 'Number of product variety is required',
                                min: { value: 1, message: 'Must be at least 1' },
                                max: { value: 10000, message: 'Must be at most 10000' }
                            })}
                            error={errors.numberOfProductVariety?.message}
                        />

                        <CustomInput
                            label="Number of HACCP Studies *"
                            placeholder="Enter number of HACCP studies (1-10000)"
                            type="number"
                            {...register('numberOfHACCPStudies', {
                                required: 'Number of HACCP studies is required',
                                min: { value: 1, message: 'Must be at least 1' },
                                max: { value: 10000, message: 'Must be at most 10000' }
                            })}
                            error={errors.numberOfHACCPStudies?.message}
                        />
                    </div>

                    {/* Export Locations */}
                    <div>
                        <CustomTextarea
                            label="Export Locations *"
                            placeholder="Enter export locations separated by commas (e.g., USA, UK, UAE, Malaysia, Indonesia)"
                            rows={3}
                            {...register('exportLocations', { required: 'Export locations are required' })}
                            error={errors.exportLocations?.message}
                        />
                    </div>

                    {/* Wine or Pork Related Questions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RadioGroup
                            label="Is Producer/Distributor/Supplier of Wine or Pork? *"
                            name="isProducerDistributorSupplierOfWineOrPork"
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' }
                            ]}
                            value={watch('isProducerDistributorSupplierOfWineOrPork') || 'No'}
                            onChange={(value) => setValue('isProducerDistributorSupplierOfWineOrPork', value)}
                            error={errors.isProducerDistributorSupplierOfWineOrPork?.message}
                            required
                        />

                        <RadioGroup
                            label="Has Separate Facility for Wine or Pork? *"
                            name="hasSeparateFacilityForWineOrPork"
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' }
                            ]}
                            value={watch('hasSeparateFacilityForWineOrPork') || 'No'}
                            onChange={(value) => setValue('hasSeparateFacilityForWineOrPork', value)}
                            error={errors.hasSeparateFacilityForWineOrPork?.message}
                            required
                        />
                    </div>

                    {/* Warehouse Information Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Warehouse Information</h3>

                        {/* Number of Warehouses */}
                        <div>
                            <CustomInput
                                label="Number of Warehouses *"
                                placeholder="Enter number of warehouses"
                                type="number"
                                value={numberOfWarehouses.toString()}
                                onChange={(e) => handleWarehouseCountChange(parseInt(e.target.value) || 1)}
                                error={errors.numberOfWarehouses?.message}
                            />
                        </div>

                        {/* Dynamic Warehouse Address Fields */}
                        {Array.from({ length: numberOfWarehouses }, (_, index) => (
                            <div key={index} className="space-y-2">
                                <h4 className="text-md font-semibold text-gray-800">Warehouse {index + 1}</h4>
                                <CustomTextarea
                                    label="Physical Address *"
                                    placeholder="Enter warehouse physical address"
                                    rows={3}
                                    value={warehouseAddresses[index] || ''}
                                    onChange={(e) => handleWarehouseAddressChange(index, e.target.value)}
                                    error={errors.warehouseAddresses?.[index]?.message}
                                />
                            </div>
                        ))}
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

export default BusinessActivitiesForm
