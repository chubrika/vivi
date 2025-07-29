import React, { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { useAuth } from '../utils/authContext';
import { useRouter } from 'next/navigation';

interface CategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, token]);

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      setSelectedCategory(category);
    } else {
      // Navigate to products page with category filter
      router.push(`/products?category=${category.slug}`);
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
          isSelected ? 'ring-2 ring-purple-500 border border-purple-500' : 'border-2 border-transparent'
        }`}
        onClick={() => handleCategoryClick(category)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 md:top-[121px] inset-0 z-50 bg-white border-t border-gray-200 w-full">
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="container mx-auto px-4 py-8 border border-gray-200 border-t-0 rounded-md bg-white box-shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">კატეგორიები</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm font-medium">{category.name}</span>
                      {category.children && category.children.length > 0 && (
                        <span className="ml-auto text-xs text-gray-500">({category.children.length})</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: Subcategories */}
            <div className="flex-1">
              {selectedCategory && selectedCategory.children && selectedCategory.children.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedCategory.name}
                  </h3>
                  <div className="space-y-1">
                    {selectedCategory.children.map(child => (
                      <div key={child._id}>
                        <div
                          className="flex items-center p-3 rounded cursor-pointer text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors duration-200"
                          onClick={() => {
                            if (child.children && child.children.length > 0) {
                              setSelectedCategory(child);
                            } else {
                              router.push(`/products?category=${child.slug}`);
                              onClose();
                            }
                          }}
                        >
                          <span className="text-sm font-medium">{child.name}</span>
                          {child.children && child.children.length > 0 && (
                            <span className="ml-auto text-xs text-gray-500">({child.children.length})</span>
                          )}
                        </div>
                        {/* Show children if they exist */}
                        {child.children && child.children.length > 0 && (
                          <div className="ml-6 space-y-1">
                            {child.children.map(grandchild => (
                              <div
                                key={grandchild._id}
                                className="flex items-center p-2 rounded cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-colors duration-200"
                                onClick={() => {
                                  router.push(`/products?category=${grandchild.slug}`);
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
                      <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="flex items-center text-purple-600 hover:text-purple-700 font-medium mr-3"
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
                            router.push(`/products?category=${child.slug}`);
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
                                router.push(`/products?category=${grandchild.slug}`);
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