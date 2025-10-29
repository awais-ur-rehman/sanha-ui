import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
import ConfirmationModal from '../../components/ConfirmationModal'
import CustomTextarea from '../../components/CustomTextarea'
import Button from '../../components/Button'

interface ApplicationDetailProps { }

const ApplicationDetail: React.FC<ApplicationDetailProps> = () => {
    const { userId, applicationId } = useParams<{ userId: string; applicationId: string }>()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [currentForm, setCurrentForm] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userData, setUserData] = useState<any>(null)
    const [showAcceptModal, setShowAcceptModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [isProcessingReply, setIsProcessingReply] = useState(false)
    const [refetchTrigger, setRefetchTrigger] = useState(0)

    // Fetch user data for breadcrumb
    const { data: userResponse } = useGetApi<any>(
        `/users/${userId}`,
        { requireAuth: true, enabled: !!userId }
    )

    // Receive status from Applications page navigation state
    const location = useLocation() as { state?: { status?: string } }
    const applicationStatus: string = (location?.state?.status || '').toString()
    const statusLower = applicationStatus.trim().toLowerCase()
    const isApproved = statusLower === 'approved'
    const isRejected = statusLower === 'rejected'
    const isReviewNeeded = statusLower.includes('review')

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

        if (isApproved) {
            showToast('info', 'This application is approved and read-only.')
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

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}?userId=${userId}&applicationId=${applicationId}`, {
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

            // Trigger refetch of current form data
            setRefetchTrigger(prev => prev + 1)

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

    const handleAcceptApplication = async () => {
        setIsProcessingReply(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/certification/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    status: 'Approved',
                    applicationId: parseInt(applicationId || '0')
                })
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to accept application')
            }

            showToast('success', 'Application accepted successfully!')
            setShowAcceptModal(false)
            navigate('/certification/applications')
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Failed to accept application')
        } finally {
            setIsProcessingReply(false)
        }
    }

    const handleRejectApplication = async () => {
        if (!rejectReason.trim()) {
            showToast('error', 'Please provide a reason for rejection')
            return
        }

        setIsProcessingReply(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://quiet-similarly-cattle.ngrok-free.app/api/v1'}/certification/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    status: 'Rejected',
                    applicationId: parseInt(applicationId || '0'),
                    reply: rejectReason.trim()
                })
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to reject application')
            }

            showToast('success', 'Application rejected successfully!')
            setShowRejectModal(false)
            setRejectReason('')
            navigate('/certification/applications')
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Failed to reject application')
        } finally {
            setIsProcessingReply(false)
        }
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
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Certification Application</h1>
                            <p className="text-gray-600 text-sm">Review and manage application details</p>
                        </div>
                        <div className="flex gap-3">
                            {/* Download button (logic to be added later) */}
                            {!isReviewNeeded && (
                                <Button variant="outline" size="sm">Download</Button>
                            )}
                            {/* Show Approve and Reject based on status */}
                            {!isApproved && (
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => setShowAcceptModal(true)}
                                >
                                    Approve
                                </Button>
                            )}
                            {isRejected ? null : (!isApproved && (
                                <Button
                                    variant="outlineDanger"
                                    size="sm"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    Reject
                                </Button>
                            ))}
                        </div>
                    </div>
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
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 2 && (
                        <ScopeOfCertificationForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'scope')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 3 && (
                        <ProductionSitesForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'production')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 4 && (
                        <BusinessActivitiesForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'business')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 5 && (
                        <HumanResourceForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'human')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 6 && (
                        <ContactPersonsForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'contact')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 7 && (
                        <CertificationConsultantsForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'consultants')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 8 && (
                        <ProductListForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'products')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}

                    {currentForm === 9 && (
                        <DeclarationsSignaturesForm
                            userId={userId}
                            applicationId={applicationId}
                            onSaveAndNext={(data: any) => handleSaveAndNext(data, 'declarations')}
                            isLoading={isSubmitting}
                            refetchTrigger={refetchTrigger}
                        />
                    )}
                </div>
            </div>

            {/* Accept Confirmation Modal */}
            <ConfirmationModal
                isOpen={showAcceptModal}
                onClose={() => setShowAcceptModal(false)}
                onConfirm={handleAcceptApplication}
                title="Approve Application"
                message="Are you sure you want to approve this application?"
                confirmText="Approve"
                cancelText="Cancel"
                isLoading={isProcessingReply}
                type="success"
            />

            {/* Reject Confirmation Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        {/* Header */}
                        <div className="flex flex-col items-start space-x-3 p-6">
                            <div className="flex justify-center items-center space-x-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-red-600 bg-red-100">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Reject Application</h3>
                            </div>
                            <div className='mt-2'>
                                <p className="text-sm text-gray-500">Are you sure you want to reject this application?</p>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        <div className="px-6 pb-4">
                            <CustomTextarea
                                label="Reason for Rejection *"
                                placeholder="Please provide a reason for rejecting this application..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={10}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 px-6 pb-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectReason('')
                                }}
                                disabled={isProcessingReply}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectApplication}
                                disabled={isProcessingReply}
                                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessingReply ? 'Processing...' : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ApplicationDetail
