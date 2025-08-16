import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Sheet from './ui/sheet';
import { Switch } from './ui/switch';
import { useDeleteApi } from '../hooks/useDeleteApi';
import { useToast } from '../components/CustomToast/ToastContext';
import { ECODE_ENDPOINTS } from '../config/api';
import type { ECode } from '../types/entities';
import ChipList from './ChipList';

interface ECodeDetailSheetProps {
  ecode: ECode | null;
  open: boolean;
  onClose: () => void;
  onEdit: (ecode: ECode) => void;
  onDelete: (ecode: ECode) => void;
  onToggleStatus: (ecode: ECode) => void;
  hasUpdatePermission: boolean;
  hasDeletePermission: boolean;
  onRefetch?: () => void;
}

const ECodeDetailSheet: React.FC<ECodeDetailSheetProps> = ({
  ecode,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  hasUpdatePermission,
  hasDeletePermission,
  onRefetch,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localIsActive, setLocalIsActive] = useState(ecode?.isActive ?? false);
  const { showToast } = useToast();

  // Update local state when ecode changes
  useEffect(() => {
    setLocalIsActive(ecode?.isActive ?? false);
  }, [ecode?.isActive]);

  const deleteECodeMutation = useDeleteApi(
    ecode ? `${ECODE_ENDPOINTS.delete}/${ecode.id}?hardDelete=true` : '',
    {
      requireAuth: true,
      invalidateQueries: ['ecodes'],
      onSuccess: () => {
        if (ecode) {
          onDelete(ecode);
        }
        setShowDeleteConfirm(false);
        // Call the refetch function if provided
        if (onRefetch) {
          onRefetch();
        }
      },
      onError: (error) => {
        console.error('Error deleting E-Code:', error);
        showToast('error', error instanceof Error ? error.message : 'Failed to delete E-Code');
      },
    }
  );

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteECodeMutation.mutate();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleToggleChange = async (checked: boolean) => {
    if (!ecode) return;
    
    // Optimistically update the local state
    setLocalIsActive(checked);
    
    try {
      // Call the API
      await onToggleStatus({ ...ecode, isActive: checked });
    } catch (error) {
      // If API call fails, revert the local state
      setLocalIsActive(!checked);
    }
  };

  if (!ecode) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'halaal':
        return 'bg-green-100 text-green-800';
      case 'haraam':
        return 'bg-red-100 text-red-800';
      case 'doubtful':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sheet open={open} close={onClose} title={`E-Code Details - ${ecode.name}`}>
      <div className="flex flex-col h-full p-6">
        {/* E-Code Info */}
        <div className="flex flex-col gap-4 flex-1 pt-10">
          <div className="text-left flex justify-between ">
            <h2 className="font-semibold text-xl text-gray-900 mb-2">
              {ecode.name || 'Untitled'}
              <span>  ({ecode.code || 'No Code'})</span>
            </h2>
            <span className={`px-3 py-1 flex justify-center items-center rounded-full text-xs font-medium ${getStatusBadgeColor(ecode.status)}`}>
                {ecode.status}
              </span>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center gap-3">
            <Switch checked={localIsActive} onCheckedChange={handleToggleChange} />
            <span className="text-sm text-gray-700">
              {localIsActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Alternative Names</h3>
              <ChipList items={ecode.alternateName} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Function</h3>
              <ChipList items={ecode.function} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Source</h3>
              <ChipList items={ecode.source} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Health Information</h3>
              <ChipList items={ecode.healthInfo} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Uses</h3>
              <ChipList items={ecode.uses} />
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {hasUpdatePermission && (
            <button
              onClick={() => onEdit(ecode)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiEdit size={16} />
              <span>Edit</span>
            </button>
          )}
          
          {hasDeletePermission && (
            <button
              onClick={handleDeleteClick}
              disabled={deleteECodeMutation.isPending}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:text-white border border-red-400 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <FiTrash2 size={16} />
              <span>{deleteECodeMutation.isPending ? 'Deleting...' : 'Delete'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && ecode && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete the E-Code "{ecode.name}"? This action cannot be undone and the E-Code will be permanently removed from the database.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={deleteECodeMutation.isPending}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteECodeMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteECodeMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
};

export default ECodeDetailSheet;
