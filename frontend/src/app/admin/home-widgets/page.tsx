'use client';

import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import CloudinaryUploadWidget from '../../../components/CloudinaryUploadWidget';
import { deleteCloudinaryImage } from '../../../utils/cloudinaryUrl';
import { categoriesService, Category } from '../../../services/categoriesService';

interface CategoryWithImage extends Category {
  image?: string;
  mobileImage?: string;
}

interface WidgetGroupCategory {
  categoryId: string;
  name: string;
  image: string;
  mobileImage: string;
  slug: string;
}

interface WidgetGroup {
  id: string;
  widgetName: string;
  categories: WidgetGroupCategory[];
}

export default function HomeWidgetsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryWithImage[]>([]);
  const [widgetGroups, setWidgetGroups] = useState<WidgetGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WidgetGroup | null>(null);
  const [widgetName, setWidgetName] = useState('');

  useEffect(() => {
    // Fetch categories and widget groups from your API
    const fetchData = async () => {
      try {
        const [categoriesData, widgetGroupsResponse] = await Promise.all([
          categoriesService.getAllCategories(),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups`)
        ]);
        const widgetGroupsData = await widgetGroupsResponse.json();

        if (categoriesData) {
          setCategories(categoriesData);
        }

        if (widgetGroupsData.success) {
          setWidgetGroups(widgetGroupsData.data.map((group: any) => ({
            id: group._id,
            widgetName: group.widgetName,
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
      setSelectedCategories([...selectedCategories, { ...category, image: '', mobileImage: '' } as CategoryWithImage]);
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

  const handleMobileImageUpload = (categoryId: string, urls: string[]) => {
    setSelectedCategories(prev => 
      prev.map(cat => 
        cat._id === categoryId 
          ? { ...cat, mobileImage: urls[0] } // Take the first image
          : cat
      )
    );
  };

  const handleSaveWidgetGroup = async () => {
    if (!widgetName) {
      alert('Please enter a widget name');
      return;
    }

    if (selectedCategories.length !== 4) {
      alert('Please select exactly 4 categories');
      return;
    }

    try {
      const url = editingGroup 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups/${editingGroup.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups`;
      
      const method = editingGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          widgetName: widgetName.trim(),
          categories: selectedCategories
        })
      });

      if (response.ok) {
        // Refresh the widget groups list
        const widgetGroupsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups`);
        const widgetGroupsData = await widgetGroupsResponse.json();

        if (widgetGroupsData.success) {
          setWidgetGroups(widgetGroupsData.data.map((group: any) => ({
            id: group._id,
            widgetName: group.widgetName,
            categories: group.categories
          })));
        }

        setSelectedCategories([]);
        setEditingGroup(null);
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to save widget group: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving widget group:', error);
      alert('Failed to save widget group');
    }
  };

  const handleEditGroup = (group: WidgetGroup) => {
    setEditingGroup(group);
    setWidgetName(group.widgetName);
    setSelectedCategories(group.categories.map(cat => ({
      _id: cat.categoryId,
      name: cat.name,
      slug: cat.slug,
      image: cat.image || '',
      mobileImage: cat.mobileImage || ''
    } as any)));
    setIsModalOpen(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this widget group?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Refresh the widget groups list
        const widgetGroupsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups`);
        const widgetGroupsData = await widgetGroupsResponse.json();

        if (widgetGroupsData.success) {
          setWidgetGroups(widgetGroupsData.data.map((group: any) => ({
            id: group._id,
            widgetName: group.widgetName,
            categories: group.categories
          })));
        }
      } else {
        alert('Failed to delete widget group');
      }
    } catch (error) {
      console.error('Error deleting widget group:', error);
      alert('Failed to delete widget group');
    }
  };

  const handleCloseModal = () => {
    setSelectedCategories([]);
    setEditingGroup(null);
    setWidgetName('');
    setIsModalOpen(false);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isSelected = selectedCategories.some(c => c._id === category._id);
    
    return (
      <div key={category._id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center space-x-2 py-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {
              if (isSelected) {
                handleCategoryDeselect(category);
              } else {
                handleCategorySelect(category);
              }
            }}
            disabled={!isSelected && selectedCategories.length >= 4}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{category.name}</span>
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
        onClose={handleCloseModal}
        title={editingGroup ? "Edit Widget Group" : "Create New Widget Group"}
      >
        {/* Widget Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Widget Name *
          </label>
          <input
            type="text"
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            placeholder="Enter widget name"
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Categories (Choose exactly 4)</h3>
          <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-2">
            {categories.map(category => renderCategory(category))}
          </div>
        </div>

        {/* Selected Categories with Image Upload */}
        {selectedCategories.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Selected Categories</h3>
            <div className="grid grid-cols-1 gap-4">
              {selectedCategories.map((category) => (
                <div key={category._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
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
                  
                  {/* Desktop Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desktop Image
                    </label>
                    <CloudinaryUploadWidget
                      onUploadSuccess={(urls) => handleImageUpload(category._id, urls)}
                      onRemoveImage={async (url) => {
                        try {
                          await deleteCloudinaryImage(url);
                        } catch (e) {
                          alert(e instanceof Error ? e.message : 'Failed to delete image');
                          throw e;
                        }
                      }}
                      multiple={false}
                      maxFiles={1}
                      initialImages={category.image ? [category.image] : []}
                    />
                  </div>

                  {/* Mobile Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Image
                    </label>
                    <CloudinaryUploadWidget
                      onUploadSuccess={(urls) => handleMobileImageUpload(category._id, urls)}
                      onRemoveImage={async (url) => {
                        try {
                          await deleteCloudinaryImage(url);
                        } catch (e) {
                          alert(e instanceof Error ? e.message : 'Failed to delete image');
                          throw e;
                        }
                      }}
                      multiple={false}
                      maxFiles={1}
                      initialImages={category.mobileImage ? [category.mobileImage] : []}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveWidgetGroup}
            disabled={selectedCategories.length !== 4 || !widgetName}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCategories.length !== 4 || !widgetName
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {editingGroup ? 'Update Widget Group' : 'Create Widget Group'}
          </button>
        </div>
      </Modal>

      {/* Widget Groups List */}
      {widgetGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{group.widgetName}</h2>
              <p className="text-sm text-gray-500">Widget Group</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditGroup(group)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteGroup(group.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desktop Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.categories.map((category) => (
                  <tr key={category.categoryId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={`${category.name} desktop`}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.mobileImage && (
                        <img
                          src={category.mobileImage}
                          alt={`${category.name} mobile`}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.categoryId}
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