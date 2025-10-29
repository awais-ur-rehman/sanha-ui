import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import CustomTextarea from '../CustomTextarea'
import RadioGroup from '../RadioGroup'
import Button from '../Button'

interface CertificationConsultantsFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
    refetchTrigger?: number
}

interface CertificationConsultantsData {
    otherManagementSystemCertification: {
        isCertified: string
        details?: string
    }
    consultantDetails: {
        hasConsultant: string
        consultant?: {
            name: string
            company: string
            address: string
            email: string
            telephone: string
        }
    }
    tollCoManufacturing: {
        hasTollCoManufacturing: string
        manufacturer?: {
            name: string
            products: string
        }
    }
}

const CertificationConsultantsForm: React.FC<CertificationConsultantsFormProps> = ({
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
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CertificationConsultantsData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing certification consultants data
    const { data: certificationConsultantsData, refetch } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.certificationConsultants}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data) {
                    const formData = data.data
                    setOriginalData(formData)

                    // Set other management system certification data
                    setValue('otherManagementSystemCertification.isCertified', formData.otherManagementSystemCertification?.isCertified || 'No')
                    setValue('otherManagementSystemCertification.details', formData.otherManagementSystemCertification?.details || '')

                    // Set consultant details data
                    setValue('consultantDetails.hasConsultant', formData.consultantDetails?.hasConsultant || 'No')
                    if (formData.consultantDetails?.consultant) {
                        setValue('consultantDetails.consultant.name', formData.consultantDetails.consultant.name || '')
                        setValue('consultantDetails.consultant.company', formData.consultantDetails.consultant.company || '')
                        setValue('consultantDetails.consultant.address', formData.consultantDetails.consultant.address || '')
                        setValue('consultantDetails.consultant.email', formData.consultantDetails.consultant.email || '')
                        setValue('consultantDetails.consultant.telephone', formData.consultantDetails.consultant.telephone || '')
                    }

                    // Set toll co manufacturing data
                    setValue('tollCoManufacturing.hasTollCoManufacturing', formData.tollCoManufacturing?.hasTollCoManufacturing || 'No')
                    if (formData.tollCoManufacturing?.manufacturer) {
                        setValue('tollCoManufacturing.manufacturer.name', formData.tollCoManufacturing.manufacturer.name || '')
                        setValue('tollCoManufacturing.manufacturer.products', formData.tollCoManufacturing.manufacturer.products || '')
                    }

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
        if (certificationConsultantsData?.data && isLoadingData) {
            const formData = certificationConsultantsData.data
            setOriginalData(formData)

            // Set other management system certification data
            setValue('otherManagementSystemCertification.isCertified', formData.otherManagementSystemCertification?.isCertified || 'No')
            setValue('otherManagementSystemCertification.details', formData.otherManagementSystemCertification?.details || '')

            // Set consultant details data
            setValue('consultantDetails.hasConsultant', formData.consultantDetails?.hasConsultant || 'No')
            if (formData.consultantDetails?.consultant) {
                setValue('consultantDetails.consultant.name', formData.consultantDetails.consultant.name || '')
                setValue('consultantDetails.consultant.company', formData.consultantDetails.consultant.company || '')
                setValue('consultantDetails.consultant.address', formData.consultantDetails.consultant.address || '')
                setValue('consultantDetails.consultant.email', formData.consultantDetails.consultant.email || '')
                setValue('consultantDetails.consultant.telephone', formData.consultantDetails.consultant.telephone || '')
            }

            // Set toll co manufacturing data
            setValue('tollCoManufacturing.hasTollCoManufacturing', formData.tollCoManufacturing?.hasTollCoManufacturing || 'No')
            if (formData.tollCoManufacturing?.manufacturer) {
                setValue('tollCoManufacturing.manufacturer.name', formData.tollCoManufacturing.manufacturer.name || '')
                setValue('tollCoManufacturing.manufacturer.products', formData.tollCoManufacturing.manufacturer.products || '')
            }

            // Mark initial load as complete after a short delay
            setTimeout(() => {
                setIsInitialLoad(false)
            }, 200)

            setIsLoadingData(false)
        }
    }, [certificationConsultantsData, isLoadingData, setValue])

    // Handle data after refetch
    useEffect(() => {
        if (certificationConsultantsData?.data && refetchTrigger > 0 && !isLoadingData) {
            const formData = certificationConsultantsData.data
            setOriginalData(formData)

            // Set other management system certification data
            setValue('otherManagementSystemCertification.isCertified', formData.otherManagementSystemCertification?.isCertified || 'No')
            setValue('otherManagementSystemCertification.details', formData.otherManagementSystemCertification?.details || '')

            // Set consultant details data
            setValue('consultantDetails.hasConsultant', formData.consultantDetails?.hasConsultant || 'No')
            if (formData.consultantDetails?.consultant) {
                setValue('consultantDetails.consultant.name', formData.consultantDetails.consultant.name || '')
                setValue('consultantDetails.consultant.company', formData.consultantDetails.consultant.company || '')
                setValue('consultantDetails.consultant.address', formData.consultantDetails.consultant.address || '')
                setValue('consultantDetails.consultant.email', formData.consultantDetails.consultant.email || '')
                setValue('consultantDetails.consultant.telephone', formData.consultantDetails.consultant.telephone || '')
            }

            // Set toll co manufacturing data
            setValue('tollCoManufacturing.hasTollCoManufacturing', formData.tollCoManufacturing?.hasTollCoManufacturing || 'No')
            if (formData.tollCoManufacturing?.manufacturer) {
                setValue('tollCoManufacturing.manufacturer.name', formData.tollCoManufacturing.manufacturer.name || '')
                setValue('tollCoManufacturing.manufacturer.products', formData.tollCoManufacturing.manufacturer.products || '')
            }
        }
    }, [certificationConsultantsData, refetchTrigger, isLoadingData, setValue])

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues && !isInitialLoad) {
            // Add a small delay to ensure form values are properly set
            const timeoutId = setTimeout(() => {
                const changes: string[] = []
                const hasFormChanges = Object.keys(watchedValues).some(key => {
                    const currentValue = watchedValues[key as keyof CertificationConsultantsData]
                    const originalValue = (originalData as any)[key]

                    // Handle nested object comparison
                    if (typeof currentValue === 'object' && typeof originalValue === 'object') {
                        const currentObj = currentValue || {}
                        const originalObj = originalValue || {}
                        return Object.keys(currentObj).some(subKey => {
                            if (typeof (currentObj as any)[subKey] === 'object' && typeof (originalObj as any)[subKey] === 'object') {
                                // Handle deeply nested objects (like consultant and manufacturer)
                                const currentSubObj = (currentObj as any)[subKey] || {}
                                const originalSubObj = (originalObj as any)[subKey] || {}
                                return Object.keys(currentSubObj).some(subSubKey => {
                                    const curr = (currentSubObj[subSubKey] ?? '').toString().trim()
                                    const orig = (originalSubObj[subSubKey] ?? '').toString().trim()
                                    const hasChange = curr !== orig
                                    if (hasChange) {
                                        changes.push(`${key}.${subKey}.${subSubKey}: "${orig}" -> "${curr}"`)
                                    }
                                    return hasChange
                                })
                            } else {
                                const curr = ((currentObj as any)[subKey] ?? '').toString().trim()
                                const orig = ((originalObj as any)[subKey] ?? '').toString().trim()
                                const hasChange = curr !== orig
                                if (hasChange) {
                                    changes.push(`${key}.${subKey}: "${orig}" -> "${curr}"`)
                                }
                                return hasChange
                            }
                        })
                    }

                    // Normalize values for comparison
                    const curr = (currentValue ?? '').toString().trim()
                    const orig = (originalValue ?? '').toString().trim()
                    const hasChange = curr !== orig

                    if (hasChange) {
                        changes.push(`${key}: "${orig}" -> "${curr}"`)
                    }

                    return hasChange
                })

                console.log('CertificationConsultants Change detection:', { hasFormChanges, changes, originalData, watchedValues })
                setHasChanges(hasFormChanges)
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [watchedValues, originalData, isInitialLoad])

    const onSubmit = (data: CertificationConsultantsData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // Prepare payload for API
        const payload = {
            ...data
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
                <div className='min-h-[calc(100vh-350px)] max-h-[calc(100vh-300px)] overflow-y-auto space-y-4 px-4'>
                    {/* Other Management System Certification Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Other Management System Certification</h2>
                        <RadioGroup
                            label="Do you have other management system certifications? *"
                            name="otherManagementSystemCertification.isCertified"
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' }
                            ]}
                            value={watch('otherManagementSystemCertification.isCertified') || 'No'}
                            onChange={(value) => setValue('otherManagementSystemCertification.isCertified', value)}
                            error={errors.otherManagementSystemCertification?.isCertified?.message}
                            required
                        />

                        {/* Details field - Show only if Yes is selected */}
                        {watch('otherManagementSystemCertification.isCertified') === 'Yes' && (
                            <div>
                                <CustomTextarea
                                    label="Details *"
                                    placeholder="Please provide details about your other management system certifications"
                                    rows={4}
                                    value={watch('otherManagementSystemCertification.details') || ''}
                                    onChange={(e) => setValue('otherManagementSystemCertification.details', e.target.value)}
                                    error={errors.otherManagementSystemCertification?.details?.message}
                                />
                            </div>
                        )}
                    </div>

                    {/* Consultant Details Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Consultant Details</h2>
                        <RadioGroup
                            label="Do you have a consultant? *"
                            name="consultantDetails.hasConsultant"
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' }
                            ]}
                            value={watch('consultantDetails.hasConsultant') || 'No'}
                            onChange={(value) => setValue('consultantDetails.hasConsultant', value)}
                            error={errors.consultantDetails?.hasConsultant?.message}
                            required
                        />

                        {/* Consultant fields - Show only if Yes is selected */}
                        {watch('consultantDetails.hasConsultant') === 'Yes' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <CustomInput
                                        label="Consultant Name *"
                                        placeholder="Enter consultant name"
                                        value={watch('consultantDetails.consultant.name') || ''}
                                        onChange={(e) => setValue('consultantDetails.consultant.name', e.target.value)}
                                        error={errors.consultantDetails?.consultant?.name?.message}
                                    />
                                    <CustomInput
                                        label="Consultant Company *"
                                        placeholder="Enter consultant company"
                                        value={watch('consultantDetails.consultant.company') || ''}
                                        onChange={(e) => setValue('consultantDetails.consultant.company', e.target.value)}
                                        error={errors.consultantDetails?.consultant?.company?.message}
                                    />
                                </div>
                                <div>
                                    <CustomTextarea
                                        label="Consultant Address *"
                                        placeholder="Enter consultant address"
                                        rows={3}
                                        value={watch('consultantDetails.consultant.address') || ''}
                                        onChange={(e) => setValue('consultantDetails.consultant.address', e.target.value)}
                                        error={errors.consultantDetails?.consultant?.address?.message}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <CustomInput
                                        label="Consultant Email *"
                                        placeholder="Enter consultant email"
                                        type="email"
                                        value={watch('consultantDetails.consultant.email') || ''}
                                        onChange={(e) => setValue('consultantDetails.consultant.email', e.target.value)}
                                        error={errors.consultantDetails?.consultant?.email?.message}
                                    />
                                    <CustomInput
                                        label="Consultant Telephone *"
                                        placeholder="Enter consultant telephone"
                                        type="tel"
                                        value={watch('consultantDetails.consultant.telephone') || ''}
                                        onChange={(e) => setValue('consultantDetails.consultant.telephone', e.target.value)}
                                        error={errors.consultantDetails?.consultant?.telephone?.message}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Toll/Co Manufacturing Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Toll/Co Manufacturing</h2>
                        <RadioGroup
                            label="Do you have toll co manufacturing? *"
                            name="tollCoManufacturing.hasTollCoManufacturing"
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' }
                            ]}
                            value={watch('tollCoManufacturing.hasTollCoManufacturing') || 'No'}
                            onChange={(value) => setValue('tollCoManufacturing.hasTollCoManufacturing', value)}
                            error={errors.tollCoManufacturing?.hasTollCoManufacturing?.message}
                            required
                        />

                        {/* Manufacturer fields - Show only if Yes is selected */}
                        {watch('tollCoManufacturing.hasTollCoManufacturing') === 'Yes' && (
                            <div className="space-y-6">
                                <CustomInput
                                    label="Manufacturer Name *"
                                    placeholder="Enter manufacturer name"
                                    value={watch('tollCoManufacturing.manufacturer.name') || ''}
                                    onChange={(e) => setValue('tollCoManufacturing.manufacturer.name', e.target.value)}
                                    error={errors.tollCoManufacturing?.manufacturer?.name?.message}
                                />
                                <CustomTextarea
                                    label="Products *"
                                    placeholder="Enter products (comma separated)"
                                    rows={3}
                                    value={watch('tollCoManufacturing.manufacturer.products') || ''}
                                    onChange={(e) => setValue('tollCoManufacturing.manufacturer.products', e.target.value)}
                                    error={errors.tollCoManufacturing?.manufacturer?.products?.message}
                                />
                            </div>
                        )}
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

export default CertificationConsultantsForm
