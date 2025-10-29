import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import Button from '../Button'

interface ContactPersonsFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
    refetchTrigger?: number
}

interface ContactPersonsData {
    contactPersons: Array<{
        department: string
        name: string
        position: string
        emailAddress: string
        contactNumber: string
    }>
}

const ContactPersonsForm: React.FC<ContactPersonsFormProps> = ({
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
    const [contactPersons, setContactPersons] = useState<Array<{
        department: string
        name: string
        position: string
        emailAddress: string
        contactNumber: string
    }>>([])

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ContactPersonsData>({ mode: 'onChange' })

    // Watch all form values for change detection
    const watchedValues = watch()

    // Fetch existing contact persons data
    const { data: contactPersonsData, refetch } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.contactPersons}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (data) => {
                if (data?.data) {
                    const formData = data.data
                    setOriginalData(formData)

                    // Initialize contact persons array with default structure
                    const defaultContactPersons = [
                        { department: 'Top Management', name: '', position: '', emailAddress: '', contactNumber: '' },
                        { department: 'Halal Management Representative (MR)', name: '', position: '', emailAddress: '', contactNumber: '' },
                        { department: 'Research and Development', name: '', position: '', emailAddress: '', contactNumber: '' },
                        { department: 'Marketing', name: '', position: '', emailAddress: '', contactNumber: '' },
                        { department: 'Finance', name: '', position: '', emailAddress: '', contactNumber: '' }
                    ]

                    // Map API data to form structure
                    const apiContactPersons = formData.contactPersons || []
                    const mappedContactPersons = defaultContactPersons.map(defaultContact => {
                        const apiContact = apiContactPersons.find((api: any) => api.department === defaultContact.department)
                        return apiContact ? {
                            department: defaultContact.department,
                            name: apiContact.name || '',
                            position: apiContact.position || '',
                            emailAddress: apiContact.emailAddress || '',
                            contactNumber: apiContact.contactNumber || ''
                        } : defaultContact
                    })

                    setContactPersons(mappedContactPersons)
                    setValue('contactPersons', mappedContactPersons)

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
        if (contactPersonsData?.data && isLoadingData) {
            const formData = contactPersonsData.data
            setOriginalData(formData)

            // Initialize contact persons array with default structure
            const defaultContactPersons = [
                { department: 'Top Management', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Halal Management Representative (MR)', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Research and Development', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Marketing', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Finance', name: '', position: '', emailAddress: '', contactNumber: '' }
            ]

            // Map API data to form structure
            const apiContactPersons = formData.contactPersons || []
            const mappedContactPersons = defaultContactPersons.map(defaultContact => {
                const apiContact = apiContactPersons.find((api: any) => api.department === defaultContact.department)
                return apiContact ? {
                    department: defaultContact.department,
                    name: apiContact.name || '',
                    position: apiContact.position || '',
                    emailAddress: apiContact.emailAddress || '',
                    contactNumber: apiContact.contactNumber || ''
                } : defaultContact
            })

            setContactPersons(mappedContactPersons)
            setValue('contactPersons', mappedContactPersons)

            // Mark initial load as complete after a short delay
            setTimeout(() => {
                setIsInitialLoad(false)
            }, 200)

            setIsLoadingData(false)
        }
    }, [contactPersonsData, isLoadingData, setValue])

    // Handle data after refetch
    useEffect(() => {
        if (contactPersonsData?.data && refetchTrigger > 0 && !isLoadingData) {
            const formData = contactPersonsData.data
            setOriginalData(formData)

            // Initialize contact persons array with default structure
            const defaultContactPersons = [
                { department: 'Top Management', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Halal Management Representative (MR)', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Research and Development', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Marketing', name: '', position: '', emailAddress: '', contactNumber: '' },
                { department: 'Finance', name: '', position: '', emailAddress: '', contactNumber: '' }
            ]

            // Map API data to form structure
            const apiContactPersons = formData.contactPersons || []
            const mappedContactPersons = defaultContactPersons.map(defaultContact => {
                const apiContact = apiContactPersons.find((api: any) => api.department === defaultContact.department)
                return apiContact ? {
                    department: defaultContact.department,
                    name: apiContact.name || '',
                    position: apiContact.position || '',
                    emailAddress: apiContact.emailAddress || '',
                    contactNumber: apiContact.contactNumber || ''
                } : defaultContact
            })

            setContactPersons(mappedContactPersons)
            setValue('contactPersons', mappedContactPersons)
        }
    }, [contactPersonsData, refetchTrigger, isLoadingData, setValue])

    // Handle contact person field changes
    const handleContactPersonChange = (index: number, field: string, value: string) => {
        const updatedContactPersons = [...contactPersons]
        updatedContactPersons[index] = {
            ...updatedContactPersons[index],
            [field]: value
        }
        setContactPersons(updatedContactPersons)
        setValue('contactPersons', updatedContactPersons)
    }

    // Track changes
    useEffect(() => {
        if (originalData && watchedValues && !isInitialLoad) {
            // Add a small delay to ensure form values are properly set
            const timeoutId = setTimeout(() => {
                const changes: string[] = []
                const hasFormChanges = Object.keys(watchedValues).some(key => {
                    const currentValue = watchedValues[key as keyof ContactPersonsData]
                    const originalValue = originalData[key]

                    // Handle contactPersons array comparison
                    if (key === 'contactPersons') {
                        const currentArray = Array.isArray(currentValue) ? currentValue : []
                        const originalArray = Array.isArray(originalValue) ? originalValue : []

                        if (currentArray.length !== originalArray.length) {
                            return true
                        }

                        return currentArray.some((currentItem, index) => {
                            const originalItem = originalArray[index] || {}
                            return Object.keys(currentItem).some(field => {
                                const curr = (currentItem[field as keyof typeof currentItem] ?? '').toString().trim()
                                const orig = (originalItem[field as keyof typeof originalItem] ?? '').toString().trim()
                                const hasChange = curr !== orig
                                if (hasChange) {
                                    changes.push(`contactPersons[${index}].${field}: "${orig}" -> "${curr}"`)
                                }
                                return hasChange
                            })
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

                console.log('ContactPersons Change detection:', { hasFormChanges, changes, originalData, watchedValues })
                setHasChanges(hasFormChanges)
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [watchedValues, originalData, isInitialLoad])

    const onSubmit = (data: ContactPersonsData) => {
        if (!hasChanges) {
            // No changes made, just proceed to next form without API call
            onSaveAndNext({ skipApi: true })
            return
        }

        // Prepare payload for API - map emailAddress to email for API compatibility
        const payload = {
            contactPersons: data.contactPersons.map(contact => ({
                department: contact.department,
                name: contact.name,
                position: contact.position,
                emailAddress: contact.emailAddress,
                contactNumber: contact.contactNumber
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='min-h-[calc(100vh-350px)] max-h-[calc(100vh-300px)] overflow-y-auto space-y-4 px-4'>
                    <h2 className="text-xl font-semibold text-gray-900">Contact Persons</h2>
                    {/* Render all 5 contact person sections */}
                    {contactPersons.map((contactPerson, index) => (
                        <div key={contactPerson.department} className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">{contactPerson.department}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CustomInput
                                    label="Name *"
                                    placeholder="Enter full name"
                                    value={contactPerson.name}
                                    onChange={(e) => handleContactPersonChange(index, 'name', e.target.value)}
                                    error={errors.contactPersons?.[index]?.name?.message}
                                />
                                <CustomInput
                                    label="Position *"
                                    placeholder="Enter position/title"
                                    value={contactPerson.position}
                                    onChange={(e) => handleContactPersonChange(index, 'position', e.target.value)}
                                    error={errors.contactPersons?.[index]?.position?.message}
                                />
                                <CustomInput
                                    label="Email *"
                                    placeholder="Enter email address"
                                    type="email"
                                    value={contactPerson.emailAddress}
                                    onChange={(e) => handleContactPersonChange(index, 'emailAddress', e.target.value)}
                                    error={errors.contactPersons?.[index]?.emailAddress?.message}
                                />
                                <CustomInput
                                    label="Contact Number *"
                                    placeholder="Enter contact number"
                                    type="tel"
                                    value={contactPerson.contactNumber}
                                    onChange={(e) => handleContactPersonChange(index, 'contactNumber', e.target.value)}
                                    error={errors.contactPersons?.[index]?.contactNumber?.message}
                                />
                            </div>
                            {index < contactPersons.length - 1 && (
                                <div className="border-t border-gray-200"></div>
                            )}
                        </div>
                    ))}
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

export default ContactPersonsForm
