import React from 'react';
import { Category } from '../types/category';

interface HierarchicalCategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const HierarchicalCategorySelect: React.FC<HierarchicalCategorySelectProps> = ({
  categories,
  value,
  onChange,
  required = false,
  className = ''
}) => {
  const renderCategoryOptions = (categories: Category[], level: number = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category._id}>
        <option value={category._id} className={level > 0 ? `pl-${level * 4}` : ''}>
          {'\u00A0'.repeat(level * 4)}{category.name} ({category.slug})
        </option>
        {category.children && renderCategoryOptions(category.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800 ${className}`}
    >
      <option value="">Select a category</option>
      {renderCategoryOptions(categories)}
    </select>
  );
};

export default HierarchicalCategorySelect; 