import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import type { Category } from '../types/category';
import { useAuth } from '../utils/authContext';
import { useRouter } from 'next/navigation';

interface CategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const router = useRouter();
  const { categories, error, isLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setIsMounted(false);
    } else if (shouldRender) {
      // Start closing animation - trigger fade out
      setIsClosing(true);
      setIsMounted(false);
      // Hide after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 500); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Trigger mount animation when categories are ready and menu is open
  useEffect(() => {
    if (!isLoading && isOpen && shouldRender && !isClosing) {
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isOpen, shouldRender, isClosing]);

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      setSelectedCategory(category);
    } else {
      // Navigate to products page with category filter
      router.push(`/products/${category.slug}`);
      onClose();
    }
  };

  const renderCategoryItem = (category: Category) => {
    const isSelected = selectedCategory?._id === category._id;
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div 
        key={category._id} 
        className={`bg-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-sky-500 border border-sky-500' : 'border-2 border-transparent'
        }`}
        onClick={() => handleCategoryClick(category)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
        </div>
      </div>
    );
  };

  if (!shouldRender) return null;

  return (
    <div className="absolute top-0 md:top-[80px] inset-0 z-50 bg-white border-t border-gray-200 w-full">
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error.message}</div>
      ) : (
        <div className={`container md:h-auto h-[100vh] mx-auto px-4 py-8 border border-gray-200 border-t-0 bg-white shadow-sm rounded-[10px] transition-all duration-500 ease-out ${
          isMounted && !isClosing
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-8'
        }`}>
          {/* Desktop Layout */}
          <div className="hidden md:flex gap-8">
            {/* Left: Main Categories */}
            <div className="w-1/3">
              <div className="space-y-1">
                {categories
                  .filter(category => !category.parentId)
                  .map(category => (
                    <div
                      key={category._id}
                      className={`flex items-center p-3 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                        selectedCategory?._id === category._id
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-gray-700 hover:text-sky-600'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm font-medium">{category.name}</span>
                      {/* {category.children && category.children.length > 0 && (
                        <span className="ml-auto text-xs text-gray-500">({category.children.length})</span>
                      )} */}
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: Subcategories */}
            <div className="flex-1 pl-4">
              {selectedCategory && selectedCategory.children && selectedCategory.children.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedCategory.name}
                  </h3>
                  <div className="space-y-1">
                    {selectedCategory.children.map(child => (
                      <div key={child._id}>
                        <div
                          className="flex items-center p-3 rounded cursor-pointer text-gray-700 hover:bg-gray-50 hover:text-sky-600 transition-colors duration-200"
                          onClick={() => {
                            if (child.children && child.children.length > 0) {
                              setSelectedCategory(child);
                            } else {
                              router.push(`/products/${child.slug}`);
                              onClose();
                            }
                          }}
                        >
                          <span className="text-sm font-medium">{child.name}</span>
                          {/* {child.children && child.children.length > 0 && (
                            <span className="ml-auto text-xs text-gray-500">({child.children.length})</span>
                          )} */}
                        </div>
                        {/* Show children if they exist */}
                        {child.children && child.children.length > 0 && (
                          <div className="ml-6 space-y-1">
                            {child.children.map(grandchild => (
                              <div
                                key={grandchild._id}
                                className="flex items-center p-2 rounded cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-sky-600 transition-colors duration-200"
                                onClick={() => {
                                  router.push(`/products/${grandchild.slug}`);
                                  onClose();
                                }}
                              >
                                <span className="text-sm">{grandchild.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">Select a category from the left</div>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {!selectedCategory ? (
              // Show main categories on mobile
              <div className="space-y-2">
                {categories
                  .filter(category => !category.parentId)
                  .map(category => (
                    <div
                      key={category._id}
                      className="flex items-center p-3 rounded-lg border border-gray-200 cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <svg className="w-5 h-5 mr-3 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-base font-medium text-gray-700">{category.name}</span>
                      {category.children && category.children.length > 0 && (
                        <span className="ml-auto text-sm text-gray-500">({category.children.length})</span>
                      )}
                      <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
              </div>
            ) : (
              // Show subcategories on mobile
              <div>
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center text-sky-600 hover:text-sky-700 font-medium mr-3"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <h3 className="text-base font-semibold text-gray-900">{selectedCategory.name}</h3>
                </div>
                
                <div className="space-y-2">
                  {selectedCategory.children?.map(child => (
                    <div key={child._id}>
                      <div
                        className="flex items-center p-3 rounded-lg border border-gray-200 cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                        onClick={() => {
                          if (child.children && child.children.length > 0) {
                            setSelectedCategory(child);
                          } else {
                            router.push(`/products/${child.slug}`);
                            onClose();
                          }
                        }}
                      >
                        <span className="text-base font-medium text-gray-700">{child.name}</span>
                        {child.children && child.children.length > 0 && (
                          <span className="ml-auto text-sm text-gray-500">({child.children.length})</span>
                        )}
                        {child.children && child.children.length > 0 && (
                          <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                      {/* Show children if they exist */}
                      {child.children && child.children.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1">
                          {child.children.map(grandchild => (
                            <div
                              key={grandchild._id}
                              className="flex items-center p-2 rounded cursor-pointer text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => {
                                router.push(`/products/${grandchild.slug}`);
                                onClose();
                              }}
                            >
                              <span className="text-sm">{grandchild.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMenu; 