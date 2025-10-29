import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import CustomInput from '../CustomInput'
import Button from '../Button'

interface DeclarationsSignaturesFormProps {
    userId?: string
    applicationId?: string
    onSaveAndNext: (data: any) => void
    isLoading?: boolean
}

interface DeclarationsSignaturesData {
    name: string
    position: string
    location: string
    digitalSignature: string
    dateOfApplication?: string
}

const DeclarationsSignaturesForm: React.FC<DeclarationsSignaturesFormProps> = ({
    userId,
    applicationId,
    onSaveAndNext,
    isLoading = false
}) => {
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [originalData, setOriginalData] = useState<any>(null)
    const [hasChanges, setHasChanges] = useState(false)

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DeclarationsSignaturesData>({ mode: 'onChange' })

    const watchedValues = watch()

    const { data: declarationsData } = useGetApi<any>(
        `${CERTIFICATION_ENDPOINTS.declarationsSignatures}?userId=${userId}&applicationId=${applicationId}`,
        {
            requireAuth: true,
            enabled: !!userId && !!applicationId,
            onSuccess: (res) => {
                if (res?.data) {
                    const d = res.data
                    setOriginalData(d)
                    setValue('name', d.name || '')
                    setValue('position', d.position || '')
                    setValue('location', d.location || '')
                    setValue('digitalSignature', d.digitalSignature || '')
                    setValue('dateOfApplication', d.dateOfApplication || '')
                }
                setIsLoadingData(false)
            },
            onError: () => setIsLoadingData(false)
        }
    )

    useEffect(() => {
        if (declarationsData?.data && isLoadingData) {
            const d = declarationsData.data
            setOriginalData(d)
            setValue('name', d.name || '')
            setValue('position', d.position || '')
            setValue('location', d.location || '')
            setValue('digitalSignature', d.digitalSignature || '')
            setValue('dateOfApplication', d.dateOfApplication || '')
            setIsLoadingData(false)
        }
    }, [declarationsData, isLoadingData, setValue])

    useEffect(() => {
        if (!originalData) return
        const fields: Array<keyof DeclarationsSignaturesData> = ['name', 'position', 'location']
        const changed = fields.some((f) => {
            const curr = (watchedValues?.[f] ?? '').toString().trim()
            const orig = (originalData?.[f] ?? '').toString().trim()
            return curr !== orig
        })
        setHasChanges(changed)
    }, [watchedValues, originalData])

    const onSubmit = (data: DeclarationsSignaturesData) => {
        if (!hasChanges) {
            onSaveAndNext({ skipApi: true })
            return
        }
        const payload = {
            name: data.name,
            position: data.position,
            location: data.location
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

    const formattedDate = watchedValues?.dateOfApplication
        ? new Date(watchedValues.dateOfApplication).toLocaleDateString()
        : ''

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='min-h-[calc(100vh-300px)] max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 px-4'>
                    <h2 className="text-xl font-semibold text-gray-900">Declarations & Signatures</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomInput
                            label="Full Name *"
                            placeholder="Enter your full name"
                            {...register('name', { required: 'Name is required' })}
                            error={errors.name?.message}
                        />
                        <CustomInput
                            label="Position/Title *"
                            placeholder="Enter your position or title"
                            {...register('position', { required: 'Position is required' })}
                            error={errors.position?.message}
                        />
                    </div>

                    <div className=' grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <CustomInput
                            label="Location *"
                            placeholder="Enter your location (City, Country)"
                            {...register('location', { required: 'Location is required' })}
                            error={errors.location?.message}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Application</label>
                            <input
                                type="text"
                                value={formattedDate}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature</label>
                            {watchedValues?.digitalSignature ? (
                                <div className="border border-dashed border-gray-300 rounded-md p-3 bg-white">
                                    <img src={watchedValues.digitalSignature} alt="Digital Signature" className="max-h-40 object-contain" />

                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">No signature available</div>
                            )}
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
                            <Button type="submit" variant="primary" size="lg" loading={isLoading} disabled={isLoading}>
                                Update
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}

export default DeclarationsSignaturesForm


