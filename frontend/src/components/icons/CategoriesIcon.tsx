import React from 'react';

interface CategoriesIconProps {
  className?: string;
  size?: number;
}

export const CategoriesIcon: React.FC<CategoriesIconProps> = ({ 
  className = "", 
  size = 20 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-hidden="true"
      className={className}
    >
      <title>Categories (Grid 2x3)</title>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="6" height="6" rx="1.6"></rect>
        <rect x="14" y="4" width="6" height="6" rx="1.6"></rect>
        <rect x="4" y="14" width="6" height="6" rx="1.6"></rect>
        <rect x="14" y="14" width="6" height="6" rx="1.6"></rect>
        <path d="M12 4V20" opacity="0.001"></path>
      </g>
    </svg>
  );
};
