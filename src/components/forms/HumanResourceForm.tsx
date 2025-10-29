import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import CustomTextarea from '../CustomTextarea'
import RadioGroup from '../RadioGroup'
import Button from '../Button'

interface HumanResourceFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
    refetchTrigger?: number
}

interface HumanResourceData {
    totalNumberOfEmployees: string
    hasNonMuslimEmployees: string
    nonMuslimEmployeeDetails: string
}

const HumanResourceForm: React.FC<HumanResourceFormProps> = ({
    userId,
    applicationId,
    onSaveAndNext,
    isLoading = false,
    refetchTrigger = 0
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
    } = useForm<HumanResourceData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing human resource data
    const { data: humanResourceData, refetch } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.humanResource}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data) {
                    const formData = data.data
                    setOriginalData(formData)

                    setValue('totalNumberOfEmployees', formData.totalNoOfEmployees || '') // API uses totalNoOfEmployees
                    setValue('hasNonMuslimEmployees', formData.hasNonMuslimEmployee || 'No') // API uses hasNonMuslimEmployee
                    setValue('nonMuslimEmployeeDetails', formData.nonMuslimEmployeeDetails || '')

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

    // Refetch data when refetchTrigger changes
    useEffect(() => {
        if (refetchTrigger > 0) {
            refetch()
        }
    }, [refetchTrigger, refetch])

    // Reset change detection when originalData is updated after refetch
    useEffect(() => {
        if (refetchTrigger > 0 && originalData && !isLoadingData) {
            setHasChanges(false)
        }
    }, [originalData, refetchTrigger, isLoadingData])

    // Handle data when it arrives (initial load)
    useEffect(() => {
        if (humanResourceData?.data && isLoadingData) {
            const formData = humanResourceData.data
            setOriginalData(formData)

            setValue('totalNumberOfEmployees', formData.totalNoOfEmployees || '') // API uses totalNoOfEmployees
            setValue('hasNonMuslimEmployees', formData.hasNonMuslimEmployee || 'No') // API uses hasNonMuslimEmployee
            setValue('nonMuslimEmployeeDetails', formData.nonMuslimEmployeeDetails || '')

            // Mark initial load as complete after a short delay
            setTimeout(() => {
                setIsInitialLoad(false)
            }, 200)

            setIsLoadingData(false)
        }
    }, [humanResourceData, isLoadingData, setValue])

    // Handle data after refetch
    useEffect(() => {
        if (humanResourceData?.data && refetchTrigger > 0 && !isLoadingData) {
            const formData = humanResourceData.data
            setOriginalData(formData)

            setValue('totalNumberOfEmployees', formData.totalNoOfEmployees || '') // API uses totalNoOfEmployees
            setValue('hasNonMuslimEmployees', formData.hasNonMuslimEmployee || 'No') // API uses hasNonMuslimEmployee
            setValue('nonMuslimEmployeeDetails', formData.nonMuslimEmployeeDetails || '')
        }
    }, [humanResourceData, refetchTrigger, isLoadingData, setValue])

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues && !isInitialLoad) {
            // Add a small delay to ensure form values are properly set
            const timeoutId = setTimeout(() => {
                const changes: string[] = []
                const hasFormChanges = Object.keys(watchedValues).some(key => {
                    const currentValue = watchedValues[key as keyof HumanResourceData]

                    // Handle field name mapping for API response
                    let originalValue
                    if (key === 'totalNumberOfEmployees') {
                        originalValue = originalData.totalNoOfEmployees
                    } else if (key === 'hasNonMuslimEmployees') {
                        originalValue = originalData.hasNonMuslimEmployee
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

                console.log('HumanResource Change detection:', { hasFormChanges, changes, originalData, watchedValues })
                setHasChanges(hasFormChanges)
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [watchedValues, originalData, isInitialLoad])

    const onSubmit = (data: HumanResourceData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // Prepare payload for API - map field names to API format
        const { totalNumberOfEmployees, hasNonMuslimEmployees, ...restData } = data
        const payload = {
            ...restData,
            totalNoOfEmployees: totalNumberOfEmployees, // API uses totalNoOfEmployees
            hasNonMuslimEmployee: hasNonMuslimEmployees // API uses hasNonMuslimEmployee
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
                    <h2 className="text-xl font-semibold text-gray-900">Human Resources</h2>
                    {/* Total Number of Employees */}
                    <div>
                        <CustomInput
                            label="Total Number of Employees *"
                            placeholder="e.g., 50"
                            type="number"
                            {...register('totalNumberOfEmployees', {
                                required: 'Total number of employees is required',
                                min: { value: 1, message: 'Must be at least 1' }
                            })}
                            error={errors.totalNumberOfEmployees?.message}
                        />
                    </div>

                    {/* Do you have Non-Muslim Employees */}
                    <div>
                        <RadioGroup
                            label="Do you have Non-Muslim Employees? *"
                            name="hasNonMuslimEmployees"
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' }
                            ]}
                            value={watch('hasNonMuslimEmployees') || 'No'}
                            onChange={(value) => setValue('hasNonMuslimEmployees', value)}
                            error={errors.hasNonMuslimEmployees?.message}
                            required
                        />
                    </div>

                    {/* Non-Muslim Employee Details - Show only if Yes is selected */}
                    {watch('hasNonMuslimEmployees') === 'Yes' && (
                        <div>
                            <CustomTextarea
                                label="Non-Muslim Employee Details *"
                                placeholder="Please provide details about your non-Muslim employees..."
                                rows={4}
                                {...register('nonMuslimEmployeeDetails', {
                                    required: watch('hasNonMuslimEmployees') === 'Yes' ? 'Non-Muslim employee details are required' : false
                                })}
                                error={errors.nonMuslimEmployeeDetails?.message}
                            />
                        </div>
                    )}
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

export default HumanResourceForm
