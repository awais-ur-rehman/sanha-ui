import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Sheet from './ui/sheet';
import { Switch } from './ui/switch';
import type { Book } from '../types/entities';

interface BookDetailSheetProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleStatus: (book: Book) => void;
  hasUpdatePermission: boolean;
  hasDeletePermission: boolean;
}

const BookDetailSheet: React.FC<BookDetailSheetProps> = ({
  book,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  hasUpdatePermission,
  hasDeletePermission,
}) => {
  const [localIsActive, setLocalIsActive] = useState(book?.isActive ?? false);

  // Update local state when book changes
  useEffect(() => {
    setLocalIsActive(book?.isActive ?? false);
  }, [book?.isActive]);

  const handleToggleChange = async (checked: boolean) => {
    if (!book) return;
    
    // Optimistically update the local state
    setLocalIsActive(checked);
    
    try {
      // Call the API with the new state (checked value)
      await onToggleStatus({ ...book, isActive: checked });
    } catch (error) {
      // If API call fails, revert the local state
      setLocalIsActive(!checked);
    }
  };

  if (!book) return null;

  return (
    <Sheet open={open} close={onClose} title={`Book Details - ${book.title}`}>
      <div className="flex flex-col h-full p-6">
        {/* Book Image */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full h-96 overflow-hidden">
            <img
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain"
              src={book.imageUrl || '/placeholder-book.jpg'}
              alt={book.title}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-book.jpg'
              }}
            />

          </div>
        </div>

        {/* Book Info */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="text-left">
            <h2 className="font-semibold text-xl text-gray-900 mb-2">
              {book.title || 'Untitled'}
            </h2>
            <p className="text-base text-gray-700 mb-1">
              {book.author || 'Unknown Author'}
            </p>
            <p className="text-sm text-gray-600">
              {book.publishedBy || 'Unknown Publisher'}
            </p>
               <p className=" text-black text-sm l">
                 {book.contentLanguage || 'N/A'}
               </p>

          </div>

          {/* Status Toggle */}
          <div className="flex items-center">
            <Switch
              checked={localIsActive}
              onCheckedChange={handleToggleChange}
            />
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <div className='max-h-[100px] overflow-y-auto bg-gray-50 p-3 rounded-lg'>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {book.description}
                </p>
              </div>
            </div>
          )}

          {/* PDF URL */}
          {book.url && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">PDF Link</h3>
              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm break-all underline"
              >
                View PDF
              </a>
            </div>
          )}

          {/* Amazon URL */}
          {book.amazonUrl && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Amazon Link</h3>
              <a
                href={book.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm break-all underline"
              >
                View on Amazon
              </a>
            </div>
          )}
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex gap-3 mt-4 flex-shrink-0">
          {hasDeletePermission && (
            <button
              onClick={() => onDelete(book)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:text-white border border-red-400 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          )}
          
          {hasUpdatePermission && (
            <button
              onClick={() => onEdit(book)}
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

export default BookDetailSheet;
