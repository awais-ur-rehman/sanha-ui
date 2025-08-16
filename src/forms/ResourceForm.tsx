import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiUpload, FiX, FiImage, FiPlus } from 'react-icons/fi';
import { useToast } from '../components/CustomToast/ToastContext';
import { API_CONFIG, FILE_ENDPOINTS } from '../config/api';
import type { Resource } from '../types/entities';

interface ResourceFormProps {
  resource?: Resource | null;
  category: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const schema = yup.object({
  authorName: yup.string().required('Author name is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  imageUrl: yup.string().url('Please enter a valid URL').required('Image URL is required'),
}).required();

const ResourceForm: React.FC<ResourceFormProps> = ({ 
  resource, 
  category, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);



  const [resourceRows, setResourceRows] = useState<Array<{ url: string; type: string }>>([
    { url: '', type: 'link' }
  ]);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      authorName: resource?.authorName || '',
      title: resource?.title || '',
      description: resource?.description || '',
      imageUrl: resource?.imageUrl || '',
    },
  });

  const watchedImageUrl = watch('imageUrl');

  // Update form values when resource changes (for edit mode)
  useEffect(() => {
    if (resource) {
      setValue('authorName', resource.authorName || '');
      setValue('title', resource.title || '');
      setValue('description', resource.description || '');
      setValue('imageUrl', resource.imageUrl || '');

    }
  }, [resource, setValue]);

  const handleFileUpload = async (file: File, type: 'image' | 'document', resourceType?: string) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      if (type === 'image') {
        setUploadingImage(true);
      } else {
        setUploadingDocuments(true);
      }

      // Map detected resource type to backend endpoint type
      const getEndpointType = (resourceType: string): string => {
        switch (resourceType) {
          case 'image':
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'bmp':
          case 'webp':
          case 'svg':
            return 'images';
          case 'video':
          case 'mp4':
          case 'avi':
          case 'mov':
          case 'wmv':
          case 'flv':
          case 'webm':
          case 'mkv':
            return 'videos';
          case 'audio':
          case 'mp3':
          case 'wav':
          case 'flac':
          case 'aac':
          case 'ogg':
          case 'wma':
            return 'videos'; // Audio files go to videos endpoint
          case 'pdf':
          case 'document':
          case 'doc':
          case 'docx':
          case 'txt':
          case 'rtf':
          case 'odt':
          case 'xls':
          case 'xlsx':
          case 'csv':
          case 'ppt':
          case 'pptx':
            return 'documents';
          default:
            return 'documents';
        }
      };

      const endpointType = getEndpointType(resourceType || 'document');
      
      // For file uploads, only include Authorization header, let browser set Content-Type
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_CONFIG.baseURL}${FILE_ENDPOINTS.upload}/${endpointType}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        const fileUrl = result.data.files[0].url;
        if (type === 'image') {
          setValue('imageUrl', fileUrl);
          showToast('success', 'Image uploaded successfully');
                } else {
          showToast('success', 'Resource uploaded successfully');
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', `Failed to upload ${type === 'image' ? 'image' : 'resource'}`);
    } finally {
      if (type === 'image') {
        setUploadingImage(false);
      } else {
        setUploadingDocuments(false);
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {

        handleFileUpload(file, 'image', 'image');
      } else {
        showToast('error', 'Please select a valid image file');
      }
    }
  };

  const detectFileType = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      // Images
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return 'image';
      
      // Videos
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
      case 'webm':
      case 'mkv':
        return 'video';
      
      // Audio
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
      case 'ogg':
      case 'wma':
        return 'audio';
      
      // PDFs
      case 'pdf':
        return 'pdf';
      
      // Documents
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
      case 'odt':
        return 'document';
      
      // Spreadsheets
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'document';
      
      // Presentations
      case 'ppt':
      case 'pptx':
        return 'document';
      
      default:
        return 'document';
    }
  };

  const detectUrlPlatform = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    
    // YouTube
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'YouTube';
    }
    
    // Facebook
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
      return 'Facebook';
    }
    
    // Twitter/X
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return 'Twitter';
    }
    
    // Instagram
    if (lowerUrl.includes('instagram.com')) {
      return 'Instagram';
    }
    
    // LinkedIn
    if (lowerUrl.includes('linkedin.com')) {
      return 'LinkedIn';
    }
    
    // TikTok
    if (lowerUrl.includes('tiktok.com')) {
      return 'TikTok';
    }
    
    // Vimeo
    if (lowerUrl.includes('vimeo.com')) {
      return 'Vimeo';
    }
    
    // Dailymotion
    if (lowerUrl.includes('dailymotion.com')) {
      return 'Dailymotion';
    }
    
    // SoundCloud
    if (lowerUrl.includes('soundcloud.com')) {
      return 'SoundCloud';
    }
    
    // Spotify
    if (lowerUrl.includes('spotify.com')) {
      return 'Spotify';
    }
    
    // Google Drive
    if (lowerUrl.includes('drive.google.com')) {
      return 'Google Drive';
    }
    
    // Dropbox
    if (lowerUrl.includes('dropbox.com')) {
      return 'Dropbox';
    }
    
    // GitHub
    if (lowerUrl.includes('github.com')) {
      return 'GitHub';
    }
    
    // Default to Website for unknown URLs
    return 'Website';
  };



  const removeImage = () => {
    setValue('imageUrl', '');
  };



  const handleUrlChange = (index: number, url: string) => {
    const newRows = [...resourceRows];
    newRows[index].url = url;
    if (url.trim()) {
      newRows[index].type = detectUrlPlatform(url);
    }
    setResourceRows(newRows);
  };

  const handleAddRow = () => {
    if (resourceRows.length >= 3) {
      showToast('error', 'Maximum 3 resources allowed');
      return;
    }
    setResourceRows(prev => [...prev, { url: '', type: 'link' }]);
  };

  const handleFileUploadForRow = async (file: File, rowIndex: number) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      setUploadingDocuments(true);
      
      const detectedType = detectFileType(file.name);
      
      // Map detected resource type to backend endpoint type
      const getEndpointType = (resourceType: string): string => {
        switch (resourceType) {
          case 'image':
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'bmp':
          case 'webp':
          case 'svg':
            return 'images';
          case 'video':
          case 'mp4':
          case 'avi':
          case 'mov':
          case 'wmv':
          case 'flv':
          case 'webm':
          case 'mkv':
            return 'videos';
          case 'audio':
          case 'mp3':
          case 'wav':
          case 'flac':
          case 'aac':
          case 'ogg':
          case 'wma':
            return 'videos'; // Audio files go to videos endpoint
          case 'pdf':
          case 'document':
          case 'doc':
          case 'docx':
          case 'txt':
          case 'rtf':
          case 'odt':
          case 'xls':
          case 'xlsx':
          case 'csv':
          case 'ppt':
          case 'pptx':
            return 'documents';
          default:
            return 'documents';
        }
      };

      const endpointType = getEndpointType(detectedType);
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_CONFIG.baseURL}${FILE_ENDPOINTS.upload}/${endpointType}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        const fileUrl = result.data.files[0].url;
        
        // Update the specific row with uploaded file URL
        const newRows = [...resourceRows];
        newRows[rowIndex] = {
          url: fileUrl,
          type: detectedType
        };
        setResourceRows(newRows);
        
        showToast('success', 'File uploaded successfully');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', 'Failed to upload file');
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleFileChangeForRow = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUploadForRow(file, rowIndex);
    }
  };

  const handleFormSubmit = (data: any) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Convert resource rows to listUrl format
    const listUrl = resourceRows
      .filter(row => row.url.trim()) // Only include rows with URLs
      .map(row => ({
        url: row.url,
        type: row.type
      }));

    const formData = {
      ...data,
      category,
      publishedDate: currentDate,
      listUrl,
    };
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Title and Author - Parallel */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  {...field}
                  type="text"
                  placeholder="Enter resource title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="authorName"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author *
                </label>
                <input
                  {...field}
                  type="text"
                  placeholder="Enter author name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent"
                />
                {errors.authorName && (
                  <p className="mt-1 text-sm text-red-600">{errors.authorName.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...field}
                rows={4}
                placeholder="Enter resource description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          )}
        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resource Image *
          </label>
          <div className="space-y-2">
            {watchedImageUrl ? (
              <div className="relative inline-block">
                <img 
                  src={watchedImageUrl} 
                  alt="Resource image" 
                  className="w-16 h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <FiX size={10} />
                </button>
              </div>
            ) : (
              <div className="w-16 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <FiImage className="text-gray-400" size={16} />
              </div>
            )}
            
            <div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c684b] cursor-pointer ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiUpload className="mr-1" size={12} />
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </label>
              {uploadingImage && (
                <p className="text-xs text-blue-600 mt-1">Uploading...</p>
              )}
            </div>
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
            )}
          </div>
        </div>

        {/* Resource Links & Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resource Links & Files
          </label>
          <div className="space-y-3">
            {resourceRows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* URL Input */}
                <div className="flex-1">
                  <input
                    type="url"
                    value={row.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="Enter URL or upload a file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c684b] focus:border-transparent text-sm"
                  />
                </div>

                {/* Upload Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.mp3,.wav,.flac,.aac,.ogg,.wma"
                    onChange={(e) => handleFileChangeForRow(e, index)}
                    className="hidden"
                    id={`file-upload-${index}`}
                    disabled={uploadingDocuments}
                  />
                  <label
                    htmlFor={`file-upload-${index}`}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] cursor-pointer transition-colors ${
                      uploadingDocuments ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiUpload size={16} />
                  </label>
                </div>
              </div>
            ))}

            {/* Add Row Button */}
            {resourceRows.length < 3 && (
              <div className="flex justify-end pe-1">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center justify-center w-8 h-8 border border-[#0c684b] rounded-full text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c684b] transition-colors"
                >
                  <FiPlus size={16} color='#0c684b' />
                </button>
              </div>
            )}

            {uploadingDocuments && (
              <p className="text-xs text-blue-600 text-center">Uploading...</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || uploadingImage || uploadingDocuments}
            className="flex-1 px-4 py-2 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (resource ? 'Updating...' : 'Creating...') 
              : (resource ? 'Update Resource' : 'Create Resource')
            }
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
