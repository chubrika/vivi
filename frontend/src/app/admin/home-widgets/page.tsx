'use client';

import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import CloudinaryUploadWidget from '../../../components/CloudinaryUploadWidget';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  parentId: string | null;
  hasChildren: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  children?: Category[];
  image?: string;
}

interface WidgetGroup {
  id: string;
  categories: Category[];
}

export default function HomeWidgetsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [widgetGroups, setWidgetGroups] = useState<WidgetGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch categories and widget groups from your API
    const fetchData = async () => {
      try {
        const [categoriesResponse, widgetGroupsResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups`)
        ]);

        const categoriesData = await categoriesResponse.json();
        const widgetGroupsData = await widgetGroupsResponse.json();

        if (categoriesData) {
          setCategories(categoriesData);
        }

        if (widgetGroupsData.success) {
          setWidgetGroups(widgetGroupsData.data.map((group: any) => ({
            id: group._id,
            categories: group.categories
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = (category: Category) => {
    if (selectedCategories.length < 4) {
      setSelectedCategories([...selectedCategories, { ...category, image: '' }]);
    }
  };

  const handleCategoryDeselect = (category: Category) => {
    setSelectedCategories(selectedCategories.filter(c => c._id !== category._id));
  };

  const handleImageUpload = (categoryId: string, urls: string[]) => {
    setSelectedCategories(prev => 
      prev.map(cat => 
        cat._id === categoryId 
          ? { ...cat, image: urls[0] } // Take the first image
          : cat
      )
    );
  };

  const handleSaveWidgetGroup = async () => {
    if (selectedCategories.length === 4) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ categories: selectedCategories })
        });

        const data = await response.json();

        if (data.success) {
          const newWidgetGroup: WidgetGroup = {
            id: data.data._id,
            categories: data.data.categories
          };
          setWidgetGroups([...widgetGroups, newWidgetGroup]);
          setSelectedCategories([]);
          setIsModalOpen(false);
        } else {
          console.error('Failed to save widget group:', data.message);
        }
      } catch (error) {
        console.error('Error saving widget group:', error);
      }
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isSelected = selectedCategories.some(c => c._id === category._id);
    const isDisabled = !isSelected && selectedCategories.length >= 4;

    return (
      <div key={category._id}>
        <div
          style={{ marginLeft: `${level * 24}px` }}
          className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (isSelected) {
              handleCategoryDeselect(category);
            } else if (!isDisabled) {
              handleCategorySelect(category);
            }
          }}
        >
          <div className="flex items-center space-x-2">
            {category.hasChildren && (
              <div className="w-4 h-4 flex items-center justify-center">
                <svg 
                  className="w-3 h-3 text-gray-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
            <div className={`w-5 h-5 border rounded flex items-center justify-center ${
              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {category.name}
          </span>
        </div>
        {category.hasChildren && category.children && category.children.length > 0 && (
          <div className="mt-1">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Home Widgets</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Widget Group
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Categories (Choose exactly 4)"
      >
        <div className="mt-4 space-y-1 max-h-[60vh] overflow-y-auto pr-2">
          {categories.map(category => renderCategory(category))}
        </div>

        {/* Selected Categories with Image Upload */}
        {selectedCategories.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Selected Categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedCategories.map((category) => (
                <div key={category._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <button
                      onClick={() => handleCategoryDeselect(category)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2">
                    <CloudinaryUploadWidget
                      onUploadSuccess={(urls) => handleImageUpload(category._id, urls)}
                      multiple={false}
                      maxFiles={1}
                      initialImages={category.image ? [category.image] : []}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Selected: {selectedCategories.length}/4 categories
          </div>
          <button
            onClick={handleSaveWidgetGroup}
            disabled={selectedCategories.length !== 4}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCategories.length === 4
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add Widget Group
          </button>
        </div>
      </Modal>

      {widgetGroups.map((group) => (
        <div key={group.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Widget Group {group.id}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category._id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
} 