import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import CustomTextarea from '../CustomTextarea'
import RadioGroup from '../RadioGroup'
import Button from '../Button'

interface CompanyInformationFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
    refetchTrigger?: number
}

interface CompanyInformationData {
    companyLegalName: string
    tradingName: string
    registeredOfficeAddress: string
    companyStatus: string
    periodOfCurrentOwnership: string
    companyOwnedBy: string // Form uses string, but API returns array
    registrationNumber: string
    ntn: string
    gstNumber: string
    belongingsWithAnyBusinessGroup: string
    businessGroupName?: string
}

const CompanyInformationForm: React.FC<CompanyInformationFormProps> = ({
    userId,
    applicationId,
    onSaveAndNext,
    isLoading = false,
    refetchTrigger = 0
}) => {
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [originalData, setOriginalData] = useState<any>(null)
    const [hasChanges, setHasChanges] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CompanyInformationData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing company information
    const { data: companyData, refetch } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.companyInformation}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data) {
                    const formData = data.data
                    // Store original data for comparison
                    setOriginalData(formData)

                    setValue('companyLegalName', formData.companyLegalName || '')
                    setValue('tradingName', formData.tradingName || '')
                    setValue('registeredOfficeAddress', formData.registeredOfficeAddress || '')
                    setValue('companyStatus', formData.companyStatus || '')
                    setValue('periodOfCurrentOwnership', formData.periodOfCurrentOwnership || '')
                    setValue('companyOwnedBy', Array.isArray(formData.companyOwnedBy) ? formData.companyOwnedBy[0] || '' : formData.companyOwnedBy || '')
                    setValue('registrationNumber', formData.registrationNumber || '')
                    setValue('ntn', formData.ntn || '')
                    setValue('gstNumber', formData.gstNumber || '')
                    setValue('belongingsWithAnyBusinessGroup', formData.belongingsWithAnyBusinessGroup || '')
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
        if (companyData?.data && isLoadingData) {
            const formData = companyData.data
            setOriginalData(formData)

            setValue('companyLegalName', formData.companyLegalName || '')
            setValue('tradingName', formData.tradingName || '')
            setValue('registeredOfficeAddress', formData.registeredOfficeAddress || '')
            setValue('companyStatus', formData.companyStatus || '')
            setValue('periodOfCurrentOwnership', formData.periodOfCurrentOwnership || '')
            setValue('companyOwnedBy', Array.isArray(formData.companyOwnedBy) ? formData.companyOwnedBy[0] || '' : formData.companyOwnedBy || '')
            setValue('registrationNumber', formData.registrationNumber || '')
            setValue('ntn', formData.ntn || '')
            setValue('gstNumber', formData.gstNumber || '')
            setValue('belongingsWithAnyBusinessGroup', formData.belongingsWithAnyBusinessGroup || '')
            setIsLoadingData(false)
        }
    }, [companyData, isLoadingData, setValue])

    // Handle data after refetch
    useEffect(() => {
        if (companyData?.data && refetchTrigger > 0 && !isLoadingData) {
            const formData = companyData.data
            setOriginalData(formData)

            setValue('companyLegalName', formData.companyLegalName || '')
            setValue('tradingName', formData.tradingName || '')
            setValue('registeredOfficeAddress', formData.registeredOfficeAddress || '')
            setValue('companyStatus', formData.companyStatus || '')
            setValue('periodOfCurrentOwnership', formData.periodOfCurrentOwnership || '')
            setValue('companyOwnedBy', Array.isArray(formData.companyOwnedBy) ? formData.companyOwnedBy[0] || '' : formData.companyOwnedBy || '')
            setValue('registrationNumber', formData.registrationNumber || '')
            setValue('ntn', formData.ntn || '')
            setValue('gstNumber', formData.gstNumber || '')
            setValue('belongingsWithAnyBusinessGroup', formData.belongingsWithAnyBusinessGroup || '')
        }
    }, [companyData, refetchTrigger, isLoadingData, setValue])

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues) {
            const changes: string[] = []
            const hasFormChanges = Object.keys(watchedValues).some(key => {
                if (key === 'companyLegalName') return false // Skip company legal name
                const currentValue = watchedValues[key as keyof CompanyInformationData]
                const originalValue = originalData[key]

                let hasChange = false
                if (key === 'companyOwnedBy') {
                    // Handle array comparison for companyOwnedBy
                    const originalArray = Array.isArray(originalValue) ? originalValue : [originalValue]
                    const originalString = originalArray[0] || ''
                    hasChange = (currentValue ?? '') !== originalString
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

            console.log('Change detection:', { hasFormChanges, changes })
            setHasChanges(hasFormChanges)
        }
    }, [watchedValues, originalData])

    const onSubmit = (data: CompanyInformationData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // Prepare payload for API - exclude companyLegalName and convert companyOwnedBy to array
        const { companyLegalName, companyOwnedBy, ...apiPayload } = data
        const payload = {
            ...apiPayload,
            companyOwnedBy: companyOwnedBy ? [companyOwnedBy] : []
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
                    <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                    {/* Company Legal Name and Trading Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Legal Name *
                            </label>
                            <input
                                type="text"
                                {...register('companyLegalName')}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">This field cannot be modified</p>
                        </div>

                        <CustomInput
                            label="Trading Name *"
                            placeholder="Enter trading name"
                            {...register('tradingName', { required: 'Trading name is required' })}
                            error={errors.tradingName?.message}
                        />
                    </div>

                    {/* Company Status and Period of Current Ownership */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomInput
                            label="Company Status *"
                            placeholder="Enter company status"
                            {...register('companyStatus', { required: 'Company status is required' })}
                            error={errors.companyStatus?.message}
                        />

                        <CustomInput
                            label="Period of Current Ownership *"
                            placeholder="Enter period in years"
                            {...register('periodOfCurrentOwnership', { required: 'Period of current ownership is required' })}
                            error={errors.periodOfCurrentOwnership?.message}
                        />
                    </div>

                    {/* Registration Number, NTN, and GST Number */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CustomInput
                            label="Registration Number *"
                            placeholder="Enter registration number"
                            {...register('registrationNumber', { required: 'Registration number is required' })}
                            error={errors.registrationNumber?.message}
                        />

                        <CustomInput
                            label="NTN *"
                            placeholder="Enter NTN"
                            {...register('ntn', { required: 'NTN is required' })}
                            error={errors.ntn?.message}
                        />

                        <CustomInput
                            label="GST Number *"
                            placeholder="Enter GST number"
                            {...register('gstNumber', { required: 'GST number is required' })}
                            error={errors.gstNumber?.message}
                        />
                    </div>

                    {/* Registered Office Address */}
                    <div>
                        <CustomTextarea
                            label="Registered Office Address *"
                            placeholder="Enter complete registered office address"
                            rows={3}
                            {...register('registeredOfficeAddress', { required: 'Registered office address is required' })}
                            error={errors.registeredOfficeAddress?.message}
                        />
                    </div>

                    {/* Belongs to Any Business Group */}
                    <div className="flex items-center space-x-6">
                        <div className="flex-1">
                            <RadioGroup
                                label="Belongs to Any Business Group?"
                                name="belongingsWithAnyBusinessGroup"
                                options={[
                                    { label: 'Yes', value: 'Yes' },
                                    { label: 'No', value: 'No' }
                                ]}
                                value={watch('belongingsWithAnyBusinessGroup') || ''}
                                onChange={(value) => setValue('belongingsWithAnyBusinessGroup', value)}
                                error={errors.belongingsWithAnyBusinessGroup?.message}
                                required
                            />
                        </div>

                        {/* Business Group Name - Show only if Yes is selected */}
                        {watch('belongingsWithAnyBusinessGroup') === 'Yes' && (
                            <div className="flex-1">
                                <CustomInput
                                    label="Business Group Name *"
                                    placeholder="Enter business group name"
                                    {...register('businessGroupName', {
                                        required: watch('belongingsWithAnyBusinessGroup') === 'Yes' ? 'Business group name is required' : false
                                    })}
                                    error={errors.businessGroupName?.message}
                                />
                            </div>
                        )}
                    </div>

                    {/* Company Owned By */}
                    <RadioGroup
                        label="Company Owned By"
                        name="companyOwnedBy"
                        options={[
                            { label: 'Muslim', value: 'Muslim' },
                            { label: 'Christian', value: 'Christian' },
                            { label: 'Hindu', value: 'Hindu' },
                            { label: 'Parsi', value: 'Parsi' },
                            { label: 'Ahmadi', value: 'Ahmadi' },
                            { label: 'Others', value: 'Others' }
                        ]}
                        value={watch('companyOwnedBy') || ''}
                        onChange={(value) => setValue('companyOwnedBy', value)}
                        error={errors.companyOwnedBy?.message}
                        required
                    />
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

export default CompanyInformationForm