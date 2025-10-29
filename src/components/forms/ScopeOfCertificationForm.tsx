import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomTextarea from '../CustomTextarea'
import Button from '../Button'

interface ScopeOfCertificationFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
}

interface ScopeOfCertificationData {
    scopeDescription: string
    selectedStandards: string[]
    otherStandardDescription?: string
}

const ScopeOfCertificationForm: React.FC<ScopeOfCertificationFormProps> = ({
    userId,
    applicationId,
    onSaveAndNext,
    isLoading = false
}) => {
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [originalData, setOriginalData] = useState<any>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [selectedStandards, setSelectedStandards] = useState<string[]>([])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ScopeOfCertificationData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing scope of certification data
    const { data: scopeData } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.scopeOfCertification}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data) {
                    const formData = data.data
                    setOriginalData(formData)

                    setValue('scopeDescription', formData.scopeDescription || '')
                    setValue('otherStandardDescription', formData.otherStandardDescription || '')

                    // Handle selected standards
                    const standards = formData.selectedStandards || []
                    setSelectedStandards(standards)
                    setValue('selectedStandards', standards)
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
        if (scopeData?.data && isLoadingData) {
            const formData = scopeData.data
            setOriginalData(formData)

            setValue('scopeDescription', formData.scopeDescription || '')
            setValue('otherStandardDescription', formData.otherStandardDescription || '')

            const standards = formData.selectedStandards || []
            setSelectedStandards(standards)
            setValue('selectedStandards', standards)

            setIsLoadingData(false)
        }
    }, [scopeData, isLoadingData, setValue])

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues) {
            const changes: string[] = []
            const hasFormChanges = Object.keys(watchedValues).some(key => {
                const currentValue = watchedValues[key as keyof ScopeOfCertificationData]
                const originalValue = originalData[key]

                let hasChange = false
                if (key === 'selectedStandards') {
                    // Handle array comparison for selectedStandards
                    const originalArray = Array.isArray(originalValue) ? originalValue : []
                    const currentArray = Array.isArray(currentValue) ? currentValue : []
                    hasChange = JSON.stringify([...originalArray].sort()) !== JSON.stringify([...currentArray].sort())
                } else {
                    const curr = (currentValue ?? '').toString()
                    const orig = (originalValue ?? '').toString()
                    hasChange = curr !== orig
                }

                if (hasChange) {
                    changes.push(`${key}: "${originalValue}" -> "${currentValue}"`)
                }

                return hasChange
            })

            console.log('ScopeOfCertification Change detection:', { hasFormChanges, changes })
            setHasChanges(hasFormChanges)
        }
    }, [watchedValues, originalData])

    const handleStandardChange = (standard: string, checked: boolean) => {
        let newStandards: string[]
        if (checked) {
            newStandards = [...selectedStandards, standard]
        } else {
            newStandards = selectedStandards.filter(s => s !== standard)
        }
        setSelectedStandards(newStandards)
        setValue('selectedStandards', newStandards)
    }

    const onSubmit = (data: ScopeOfCertificationData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // Prepare payload for API
        const payload = {
            ...data,
            selectedStandards: selectedStandards
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

    const standardOptions = [
        'PS: 3733:2022 OIC/SMIIC 1:2019',
        'PS: 5442:2021, Halal Pharma/Health Care',
        'PS: OIC/SMIIC 24',
        'Other'
    ]

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='min-h-[calc(100vh-300px)] max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 px-4'>
                    <h2 className="text-xl font-semibold text-gray-900">Scope of Certification</h2>
                    {/* Scope Description */}
                    <div>
                        <CustomTextarea
                            label="Scope Description *"
                            placeholder="Provide a detailed description of your certification scope"
                            rows={4}
                            {...register('scopeDescription', { required: 'Scope description is required' })}
                            error={errors.scopeDescription?.message}
                        />
                    </div>

                    {/* Selected Standards */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Selected Standards *
                        </label>
                        <div className="space-y-3">
                            {standardOptions.map((standard) => (
                                <label key={standard} className="flex items-center cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedStandards.includes(standard)}
                                            onChange={(e) => handleStandardChange(standard, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-[#2D5B19] peer-checked:bg-[#2D5B19] transition-all duration-200 peer-focus:ring-2 peer-focus:ring-[#2D5B19] peer-focus:ring-offset-2 group-hover:border-gray-400 flex items-center justify-center">
                                            {selectedStandards.includes(standard) && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="ml-3 text-sm text-gray-700">
                                        {standard}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.selectedStandards && (
                            <p className="mt-1 text-sm text-red-600">{errors.selectedStandards.message}</p>
                        )}
                    </div>

                    {/* Other Standard Description - Show only if "Other" is selected */}
                    {selectedStandards.includes('Other') && (
                        <div>
                            <CustomTextarea
                                label="Other Standard Description *"
                                placeholder="Please describe the other standard(s)"
                                rows={3}
                                {...register('otherStandardDescription', {
                                    required: selectedStandards.includes('Other') ? 'Other standard description is required' : false
                                })}
                                error={errors.otherStandardDescription?.message}
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

export default ScopeOfCertificationForm