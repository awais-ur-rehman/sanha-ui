import React from 'react';
import Chip from './Chip';

interface ChipListProps {
  items: string[] | string | null | undefined;
  emptyText?: string;
  className?: string;
}

const ChipList: React.FC<ChipListProps> = ({ 
  items, 
  emptyText = 'N/A',
  className = '' 
}) => {
  // Handle different input types
  const processItems = (): string[] => {
    if (!items) return [];
    
    if (Array.isArray(items)) {
      return items.filter(item => item && item.trim() !== '');
    }
    
    if (typeof items === 'string') {
      return items
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
    }
    
    return [];
  };

  const processedItems = processItems();

  if (processedItems.length === 0) {
    return (
      <p className="text-sm text-gray-600 leading-relaxed">
        {emptyText}
      </p>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {processedItems.map((item, index) => (
        <Chip key={index} label={item} />
      ))}
    </div>
  );
};

export default ChipList;
