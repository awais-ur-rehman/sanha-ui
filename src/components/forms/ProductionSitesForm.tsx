import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import CustomTextarea from '../CustomTextarea'
import Button from '../Button'

interface ProductionSitesFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
}

interface ProductionSitesData {
    numberOfProductionSites: string
    siteNumber: string
    numberOfProcessingLines: string
    facilitySize: string
    physicalAddress: string
    telephone: string
    email: string
    numberOfShifts: string
    numberOfEmployees: string
}

const ProductionSitesForm: React.FC<ProductionSitesFormProps> = ({
    userId,
    applicationId,
    onSaveAndNext,
    isLoading = false
}) => {
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [originalData, setOriginalData] = useState<any>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ProductionSitesData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing production sites data
    const { data: productionSitesData } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.productionSites}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data) {
                    const formData = data.data
                    setOriginalData(formData)

                    setValue('numberOfProductionSites', formData.numberOfProductionSites || '1')
                    setValue('siteNumber', formData.siteNumber || '1')
                    setValue('numberOfProcessingLines', formData.numberOfProcessingLines || '')
                    setValue('facilitySize', formData.facilitySize || '')
                    setValue('physicalAddress', formData.physicalAddress || '')
                    setValue('telephone', formData.telephone || '')
                    setValue('email', formData.email || '')
                    setValue('numberOfShifts', formData.numberOfShift || '1') // API uses numberOfShift
                    setValue('numberOfEmployees', formData.numberOfEmployees || '1')

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
        if (productionSitesData?.data && isLoadingData) {
            const formData = productionSitesData.data
            setOriginalData(formData)

            setValue('numberOfProductionSites', formData.numberOfProductionSites || '1')
            setValue('siteNumber', formData.siteNumber || '1')
            setValue('numberOfProcessingLines', formData.numberOfProcessingLines || '')
            setValue('facilitySize', formData.facilitySize || '')
            setValue('physicalAddress', formData.physicalAddress || '')
            setValue('telephone', formData.telephone || '')
            setValue('email', formData.email || '')
            setValue('numberOfShifts', formData.numberOfShift || '1') // API uses numberOfShift
            setValue('numberOfEmployees', formData.numberOfEmployees || '1')

            // Mark initial load as complete after a short delay
            setTimeout(() => {
                setIsInitialLoad(false)
            }, 200)

            setIsLoadingData(false)
        }
    }, [productionSitesData, isLoadingData, setValue])

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues && !isInitialLoad) {
            // Add a small delay to ensure form values are properly set
            const timeoutId = setTimeout(() => {
                const changes: string[] = []
                const hasFormChanges = Object.keys(watchedValues).some(key => {
                    const currentValue = watchedValues[key as keyof ProductionSitesData]

                    // Handle field name mapping for API response
                    let originalValue
                    if (key === 'numberOfShifts') {
                        originalValue = originalData.numberOfShift // API uses numberOfShift
                    } else {
                        originalValue = originalData[key]
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

                console.log('ProductionSites Change detection:', { hasFormChanges, changes, originalData, watchedValues })
                setHasChanges(hasFormChanges)
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [watchedValues, originalData, isInitialLoad])

    const onSubmit = (data: ProductionSitesData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // Prepare payload for API - map numberOfShifts to numberOfShift
        const { numberOfShifts, ...restData } = data
        const payload = {
            ...restData,
            numberOfShift: numberOfShifts // API expects numberOfShift
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
                    <h2 className="text-xl font-semibold text-gray-900">Production Sites & Facilities</h2>
                    {/* Production Sites and Facilities Details */}
                    <div className="space-y-6">
                        {/* Row 1: Number of Production Sites and Site Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                                label="Number of Production Sites *"
                                placeholder="Enter number of production sites"
                                type="number"
                                {...register('numberOfProductionSites', {
                                    required: 'Number of production sites is required',
                                    min: { value: 1, message: 'Must be at least 1' }
                                })}
                                error={errors.numberOfProductionSites?.message}
                            />

                            <CustomInput
                                label="Site Number *"
                                placeholder="Enter site number"
                                type="number"
                                {...register('siteNumber', {
                                    required: 'Site number is required',
                                    min: { value: 1, message: 'Must be at least 1' }
                                })}
                                error={errors.siteNumber?.message}
                            />
                        </div>

                        {/* Row 2: Number of Processing Lines and Facility Size */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                                label="Number of Processing Lines *"
                                placeholder="Enter number of processing lines (1-100)"
                                type="number"
                                {...register('numberOfProcessingLines', {
                                    required: 'Number of processing lines is required',
                                    min: { value: 1, message: 'Must be at least 1' },
                                    max: { value: 100, message: 'Must be at most 100' }
                                })}
                                error={errors.numberOfProcessingLines?.message}
                            />

                            <CustomInput
                                label="Facility Size *"
                                placeholder="e.g., 5000 sq ft"
                                {...register('facilitySize', { required: 'Facility size is required' })}
                                error={errors.facilitySize?.message}
                            />
                        </div>

                        {/* Row 3: Physical Address (Full Width) */}
                        <div>
                            <CustomTextarea
                                label="Physical Address *"
                                placeholder="Enter physical address"
                                rows={3}
                                {...register('physicalAddress', { required: 'Physical address is required' })}
                                error={errors.physicalAddress?.message}
                            />
                        </div>

                        {/* Row 4: Telephone and Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                                label="Telephone *"
                                placeholder="e.g., 923001234567"
                                type="tel"
                                {...register('telephone', {
                                    required: 'Telephone is required',
                                    pattern: {
                                        value: /^[0-9+\-\s()]+$/,
                                        message: 'Please enter a valid telephone number'
                                    }
                                })}
                                error={errors.telephone?.message}
                            />

                            <CustomInput
                                label="Email *"
                                placeholder="e.g., production@company.com"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Please enter a valid email address'
                                    }
                                })}
                                error={errors.email?.message}
                            />
                        </div>
                    </div>

                    {/* Employees in Each Shift Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Employees in Each Shift</h3>

                        {/* Row 1: Number of Shifts and Number of Employees */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                                label="Number of Shifts *"
                                placeholder="Enter number of shifts"
                                type="number"
                                {...register('numberOfShifts', {
                                    required: 'Number of shifts is required',
                                    min: { value: 1, message: 'Must be at least 1' }
                                })}
                                error={errors.numberOfShifts?.message}
                            />

                            <CustomInput
                                label="Number of Employees *"
                                placeholder="Enter number of employees"
                                type="number"
                                {...register('numberOfEmployees', {
                                    required: 'Number of employees is required',
                                    min: { value: 1, message: 'Must be at least 1' }
                                })}
                                error={errors.numberOfEmployees?.message}
                            />
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

export default ProductionSitesForm
