import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';

interface RichTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent?: string;
  title?: string;
  buttonText?: string;
}

const RichTextModal: React.FC<RichTextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContent = '',
  title = 'Add Description',
  buttonText = 'Add Resource'
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[55vw] h-[85vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Enter your description here..."
            rows={20}
            className="h-full"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c684b]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0c684b] border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c684b]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RichTextModal;
