import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi'
import { useGetApi } from '../../hooks'
import { CERTIFICATION_ENDPOINTS } from '../../config/api'
import { useToast } from '../../components/CustomToast/ToastContext'
import CompanyInformationForm from '../../components/forms/CompanyInformationForm'
import ScopeOfCertificationForm from '../../components/forms/ScopeOfCertificationForm'
import ProductionSitesForm from '../../components/forms/ProductionSitesForm'
import BusinessActivitiesForm from '../../components/forms/BusinessActivitiesForm'
import HumanResourceForm from '../../components/forms/HumanResourceForm'
import ContactPersonsForm from '../../components/forms/ContactPersonsForm'
import CertificationConsultantsForm from '../../components/forms/CertificationConsultantsForm'
import ProductListForm from '../../components/forms/ProductListForm'
import DeclarationsSignaturesForm from '../../components/forms/DeclarationsSignaturesForm'

interface ApplicationDetailProps { }

const ApplicationDetail: React.FC<ApplicationDetailProps> = () => {
    const { userId, applicationId } = useParams<{ userId: string; applicationId: string }>()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [currentForm, setCurrentForm] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userData, setUserData] = useState<any>(null)

    // Fetch user data for breadcrumb
    const { data: userResponse } = useGetApi<any>(
        `/users/${userId}`,
        { requireAuth: true, enabled: !!userId }
    )

    useEffect(() => {
        if (userResponse?.data) {
            setUserData(userResponse.data)
        }
    }, [userResponse])

    const handleSaveAndNext = async (formData: any, formType: string): Promise<void> => {
        // Check if we should skip API call (view-only navigation)
        if (formData.skipApi) {
            return
        }

        setIsSubmitting(true)
        try {
            // Make PUT API call to update the form data
            let endpoint = ''
            switch (formType) {
                case 'company':
                    endpoint = CERTIFICATION_ENDPOINTS.companyInformation
                    break
                case 'scope':
                    endpoint = CERTIFICATION_ENDPOINTS.scopeOfCertification
                    break
                case 'production':
                    endpoint = CERTIFICATION_ENDPOINTS.productionSites
                    break
                case 'business':
                    endpoint = CERTIFICATION_ENDPOINTS.businessActivities
                    break
                case 'human':
                    endpoint = CERTIFICATION_ENDPOINTS.humanResource
                    break
                case 'contact':
                    endpoint = CERTIFICATION_ENDPOINTS.contactPersons
                    break
                case 'consultants':
                    endpoint = CERTIFICATION_ENDPOINTS.certificationConsultants
                    break
                case 'products':
                    endpoint = CERTIFICATION_ENDPOINTS.productList
                    break
                case 'declarations':
                    endpoint = CERTIFICATION_ENDPOINTS.declarationsSignatures
                    break
                default:
                    throw new Error('Unknown form type')
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://quiet-similarly-cattle.ngrok-free.app/api/v1'}${endpoint}?userId=${userId}&applicationId=${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error('Failed to update form data')
            }

            const formNames = {
                company: 'Company Information',
                scope: 'Scope of Certification',
                production: 'Production Sites',
                business: 'Business Activities',
                human: 'Human Resource',
                contact: 'Contact Persons',
                consultants: 'Certification Consultants',
                products: 'Product List',
                declarations: 'Declarations & Signatures'
            }
            showToast('success', `${formNames[formType as keyof typeof formNames] || 'Form'} updated successfully!`)

            // Do not auto-advance; stay on the same form
        } catch (error) {
            showToast('error', 'Failed to update form data')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBackToApplications = () => {
        navigate('/certification/applications')
    }

    const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : 'User'

    return (
        <div className="py-4">
            <div className="bg-white rounded-lg overflow-hidden min-h-[calc(100vh-35px)] p-6">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                    <button
                        onClick={handleBackToApplications}
                        className="flex items-center space-x-1 text-[#0c684b] hover:underline"
                    >
                        <FiArrowLeft size={16} />
                        <span>Application</span>
                    </button>
                    <FiChevronRight size={16} />
                    <span className="font-medium text-gray-900">{fullName}</span>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Certification Application</h1>
                    <p className="text-gray-600 text-sm">Review and manage application details</p>
                </div>

                {/* Form Progress */}
                <div className="mb-6 cursor-pointer">
                    <div className="flex items-center space-x-3">
                        {[
                            { id: 1, name: 'Company', status: currentForm === 1 ? 'current' : currentForm > 1 ? 'completed' : 'upcoming' },
                            { id: 2, name: 'Certification', status: currentForm === 2 ? 'current' : currentForm > 2 ? 'completed' : 'upcoming' },
                            { id: 3, name: 'Sites', status: currentForm === 3 ? 'current' : currentForm > 3 ? 'completed' : 'upcoming' },
                            { id: 4, name: 'Business', status: currentForm === 4 ? 'current' : currentForm > 4 ? 'completed' : 'upcoming' },
                            { id: 5, name: 'Resource', status: currentForm === 5 ? 'current' : currentForm > 5 ? 'completed' : 'upcoming' },
                            { id: 6, name: 'Contacts', status: currentForm === 6 ? 'current' : currentForm > 6 ? 'completed' : 'upcoming' },
                            { id: 7, name: 'Consultants', status: currentForm === 7 ? 'current' : currentForm > 7 ? 'completed' : 'upcoming' },
                            { id: 8, name: 'Products', status: currentForm === 8 ? 'current' : currentForm > 8 ? 'completed' : 'upcoming' },
                            { id: 9, name: 'Declarations', status: currentForm === 9 ? 'current' : 'upcoming' }
                        ].map((form, index) => (
                            <button type="button" onClick={() => setCurrentForm(form.id)} key={form.id} className="flex items-center focus:outline-none">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] cursor-pointer  p-3 ${form.status === 'current'
                                    ? 'bg-[#0c684b] text-white'
                                    : form.status === 'completed'
                                        ? 'bg-[#0c684b] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {form.id}
                                </div>
                                <span className={`ml-2 text-[12px] cursor-pointer ${form.status === 'current' ? 'text-[#0c684b] font-medium' : 'text-gray-500'
                                    }`}>
                                    {form.name}
                                </span>
                                {index < 8 && (
                                    <div className="w-6 h-0.5 bg-gray-200 mx-3 cursor-pointer" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Content (no background, horizontal padding only) */}
                <div className="px-6">
                    {currentForm === 1 && (
                        <CompanyInformationForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'company')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 2 && (
                        <ScopeOfCertificationForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'scope')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 3 && (
                        <ProductionSitesForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'production')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 4 && (
                        <BusinessActivitiesForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'business')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 5 && (
                        <HumanResourceForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'human')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 6 && (
                        <ContactPersonsForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'contact')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 7 && (
                        <CertificationConsultantsForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'consultants')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 8 && (
                        <ProductListForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'products')}
                            isLoading={isSubmitting}
                        />
                    )}

                    {currentForm === 9 && (
                        <DeclarationsSignaturesForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'declarations')}
                            isLoading={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ApplicationDetail
