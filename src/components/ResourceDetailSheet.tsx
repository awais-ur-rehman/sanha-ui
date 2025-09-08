import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiExternalLink } from 'react-icons/fi';
import Sheet from './ui/sheet';
import { Switch } from './ui/switch';
import type { Resource } from '../types/entities';

interface ResourceDetailSheetProps {
  resource: Resource | null;
  open: boolean;
  onClose: () => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onToggleStatus: (resource: Resource) => void;
  hasUpdatePermission: boolean;
  hasDeletePermission: boolean;
  onRefetch?: () => void;
}

const ResourceDetailSheet: React.FC<ResourceDetailSheetProps> = ({
  resource,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  hasUpdatePermission,
  hasDeletePermission,
  // onRefetch,
}) => {
  const [localIsActive, setLocalIsActive] = useState(resource?.isActive ?? false);

  // Update local state when resource changes
  useEffect(() => {
    setLocalIsActive(resource?.isActive ?? false);
  }, [resource?.isActive]);

  const handleToggleChange = async (checked: boolean) => {
    if (!resource) return;
    
    // Optimistically update the local state
    setLocalIsActive(checked);
    
    try {
      // Call the API
      await onToggleStatus({ ...resource, isActive: checked });
    } catch (error) {
      // If API call fails, revert the local state
      setLocalIsActive(!checked);
    }
  };

  if (!resource) return null;

  return (
    <Sheet open={open} close={onClose} title={`Resource Details - ${resource.title}`}>
      <div className="flex flex-col h-full p-6">
        {/* Resource Image */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full h-64 overflow-hidden rounded-lg">
            <img
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-center"
              src={resource.imageUrl || '/placeholder-resource.jpg'}
              alt={resource.title}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-resource.jpg'
              }}
            />
          </div>
        </div>

        {/* Resource Info */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="text-left">
            <h2 className="font-semibold text-xl text-gray-900 mb-2">
              {resource.title || 'Untitled'}
            </h2>
            <p className="text-base text-gray-700 mb-1">
              By {resource.authorName || 'Unknown Author'}
            </p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                resource.category === 'Articles' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {resource.category}
              </span>
            </div>
          </div>

          {/* Status Toggle */}
          {hasUpdatePermission && (
            <div className="flex items-center gap-3 mt-2">
              <Switch checked={localIsActive} onCheckedChange={handleToggleChange} />
              <span className="text-sm text-gray-700">
                {localIsActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          )}

          {/* Description */}
          {resource.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <div className='max-h-[290px] overflow-y-auto bg-gray-50 p-3 rounded-lg'>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {resource.description}
                </p>
              </div>
            </div>
          )}

          {/* Published Date */}
          <div className='mt-2'>
            <h3 className="font-semibold text-gray-900 mb-2">Published Date</h3>
            <p className="text-sm text-gray-600">
              {new Date(resource.publishedDate).toLocaleDateString()}
            </p>
          </div>

          {/* Resource Links */}
          {resource.listUrl && resource.listUrl.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Resource Links</h3>
              <div className="space-y-2 bg-gray-50 p-2 rounded-lg overflow-y-auto max-h-[100px] min-h-[100px]">
                {resource.listUrl.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">
                      {link.type}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700 flex-1 truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.url}
                    </a>
                    <FiExternalLink size={14} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

         
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {hasUpdatePermission && (
            <button
              onClick={() => onEdit(resource)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiEdit size={16} />
              <span>Edit</span>
            </button>
          )}
          
          {hasDeletePermission && (
            <button
              onClick={() => onDelete(resource)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:text-white border border-red-400 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>


    </Sheet>
  );
};

export default ResourceDetailSheet;
