import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Sheet from './ui/sheet';
import { Switch } from './ui/switch';
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
  // onRefetch,
}) => {
  const [localIsActive, setLocalIsActive] = useState(ecode?.isActive ?? false);

  // Update local state when ecode changes
  useEffect(() => {
    setLocalIsActive(ecode?.isActive ?? false);
  }, [ecode?.isActive]);

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
          <div className="text-left flex justify-between items-start">
            <h2 className="font-semibold text-xl text-gray-900 mb-2">
              {ecode.name || 'Untitled'}
              <span>  ({ecode.code || 'No Code'})</span>
            </h2>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Switch checked={localIsActive} onCheckedChange={handleToggleChange} />
                <span className="text-sm text-gray-700">
                  {localIsActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className={`px-3 py-1 flex justify-center items-center rounded-full text-xs font-medium ${getStatusBadgeColor(ecode.status)}`}>
                {ecode.status}
              </span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
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

        {/* Fixed Action Buttons */}
        <div className="flex gap-3 mt-4 flex-shrink-0">
          {hasDeletePermission && (
            <button
              onClick={() => onDelete(ecode)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:text-white border border-red-400 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          )}
          
          {hasUpdatePermission && (
            <button
              onClick={() => onEdit(ecode)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#0c684b] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiEdit size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
};

export default ECodeDetailSheet;
