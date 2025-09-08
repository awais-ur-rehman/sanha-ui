import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomTextarea from '../components/CustomTextarea'
import Button from '../components/Button'
import { type ContactUsReplyRequest } from '../types/entities'

const replySchema = yup.object({
  id: yup.number().required(),
  replyMessage: yup
    .string()
    .required('Reply message is required')
    .min(10, 'Reply message must be at least 10 characters')
    .max(1000, 'Reply message must not exceed 1000 characters'),
})

interface ContactUsFormProps {
  contactUs?: any
  onSubmit: (data: ContactUsReplyRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

const ContactUsForm: React.FC<ContactUsFormProps> = ({
  contactUs,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactUsReplyRequest>({
    resolver: yupResolver(replySchema),
    defaultValues: {
      id: contactUs?.id || 0,
      replyMessage: contactUs?.replyMessage || '',
    },
  })

  const handleFormSubmit = (data: ContactUsReplyRequest) => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Contact Information Display */}
      {contactUs && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <p className="text-gray-900">{contactUs.firstName} {contactUs.lastName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-900">{contactUs.email}</p>
            </div>
            {contactUs.orgName && (
              <div>
                <span className="font-medium text-gray-700">Organization:</span>
                <p className="text-gray-900">{contactUs.orgName}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <p className="text-gray-900">{contactUs.type}</p>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Original Message:</span>
            <p className="text-gray-900 mt-1 p-3 bg-white rounded border">
              {contactUs.message}
            </p>
          </div>
        </div>
      )}

      {/* Hidden ID field */}
      <input type="hidden" {...register('id')} />

      {/* Reply Message */}
      <CustomTextarea
        label="Reply Message"
        placeholder="Enter your reply message..."
        error={errors.replyMessage?.message}
        rows={6}
        {...register('replyMessage')}
      />

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
        >
          {isLoading ? 'Sending Reply...' : 'Send Reply'}
        </Button>
      </div>
    </form>
  )
}

export default ContactUsForm
