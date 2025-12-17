import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';

interface RichTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string | { description?: string; urduDescription?: string; arabicDescription?: string }) => void;
  initialContent?: string;
  initialDescriptions?: {
    description?: string;
    urduDescription?: string;
    arabicDescription?: string;
  };
  title?: string;
  buttonText?: string;
  multiLanguage?: boolean;
}

const RichTextModal: React.FC<RichTextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContent = '',
  initialDescriptions,
  title = 'Add Description',
  buttonText = 'Add Resource',
  multiLanguage = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [descriptions, setDescriptions] = useState<{
    description?: string;
    urduDescription?: string;
    arabicDescription?: string;
  }>(initialDescriptions || {
    description: '',
    urduDescription: '',
    arabicDescription: ''
  });

  // Update descriptions when initialDescriptions changes (for edit mode)
  useEffect(() => {
    if (initialDescriptions) {
      setDescriptions(initialDescriptions);
    }
  }, [initialDescriptions]);

  const handleSave = () => {
    if (multiLanguage) {
      // Validate that at least one language description is filled
      // Remove HTML tags and check for actual content
      const stripHtml = (html: string | undefined) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      const hasContent =
        (descriptions.description && stripHtml(descriptions.description).trim() !== '') ||
        (descriptions.urduDescription && stripHtml(descriptions.urduDescription).trim() !== '') ||
        (descriptions.arabicDescription && stripHtml(descriptions.arabicDescription).trim() !== '');

      if (!hasContent) {
        // Return false to indicate validation failed - don't close modal
        return false;
      }

      onSave(descriptions);
      onClose();
      return true;
    } else {
      onSave(content);
      onClose();
      return true;
    }
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
          {multiLanguage ? (
            <RichTextEditor
              descriptions={descriptions}
              onDescriptionsChange={setDescriptions}
              placeholder="Enter your description here..."
              rows={20}
              className="h-full"
            />
          ) : (
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Enter your description here..."
              rows={20}
              className="h-full"
            />
          )}
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
            onClick={() => {
              const saved = handleSave();
              if (saved === false && multiLanguage) {
                // Validation failed - show error (parent component will also validate)
                alert('Please enter description in at least one language.');
              }
            }}
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
