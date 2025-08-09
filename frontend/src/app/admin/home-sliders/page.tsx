'use client';
'use client';

import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import CloudinaryUploadWidget from '../../../components/CloudinaryUploadWidget';
import { homeSliderService, HomeSlider, CreateHomeSliderData } from '../../../services/homeSliderService';

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

export default function HomeSlidersPage() {
  const [homeSliders, setHomeSliders] = useState<HomeSlider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<HomeSlider | null>(null);
  const [formData, setFormData] = useState<CreateHomeSliderData>({
    name: '',
    slug: '',
    desktopImage: '',
    mobileImage: '',
    categorySlug: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [slugInputType, setSlugInputType] = useState<'manual' | 'category'>('manual');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slidersResponse, categoriesResponse] = await Promise.all([
        fetch('/api/home-sliders'),
        fetch('/api/categories')
      ]);

      const slidersData = await slidersResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (slidersData.success) {
        setHomeSliders(slidersData.data);
      }

      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (field: keyof CreateHomeSliderData, value: string) => {
    setFormData((prev: any) => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // If slug is being manually entered, clear categorySlug
      if (field === 'slug') {
        updated.categorySlug = '';
      }
      
      return updated;
    });
  };

  const handleCategorySelect = (category: Category) => {
    setFormData(prev => ({
      ...prev,
      categorySlug: category.slug,
      slug: '' // Clear slug when category is selected
    }));
  };

  const handleDesktopImageUpload = (urls: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      desktopImage: urls[0] || ''
    }));
  };

  const handleMobileImageUpload = (urls: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      mobileImage: urls[0] || ''
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.desktopImage || !formData.mobileImage) {
      alert('Please fill in all required fields: Name, Desktop Image, and Mobile Image');
      return;
    }

    // Check if either slug or categorySlug is provided, but not both
    if (!formData.slug && !formData.categorySlug) {
      alert('Please provide either a slug or select a category');
      return;
    }
    
    if (formData.slug && formData.categorySlug) {
      alert('Please provide either a slug OR select a category, not both');
      return;
    }

    setIsLoading(true);
    try {
      if (editingSlider) {
        await homeSliderService.updateHomeSlider(editingSlider._id, formData);
      } else {
        await homeSliderService.createHomeSlider(formData);
      }
      
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving home slider:', error);
      alert('Failed to save home slider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (slider: HomeSlider) => {
    setEditingSlider(slider);
    setSlugInputType('manual'); // Default to manual for editing
    setFormData({
      name: slider.name,
      slug: slider.slug,
      desktopImage: slider.desktopImage,
      mobileImage: slider.mobileImage,
      categorySlug: slider.categorySlug
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this home slider?')) {
      try {
        await homeSliderService.deleteHomeSlider(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting home slider:', error);
        alert('Failed to delete home slider');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlider(null);
    setSlugInputType('manual');
    setFormData({
      name: '',
      slug: '',
      desktopImage: '',
      mobileImage: '',
      categorySlug: ''
    });
  };

  const renderCategory = (category: Category, level: number = 0) => {
    return (
      <div key={category._id}>
        <div
          style={{ marginLeft: `${level * 24}px` }}
          className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => handleCategorySelect(category)}
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
              formData.categorySlug === category.slug ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {formData.categorySlug === category.slug && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900">
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
        <h1 className="text-2xl font-bold text-gray-900">Home Sliders</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Slider
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSlider ? "Edit Home Slider" : "Create New Home Slider"}
      >
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              placeholder="Enter slider name"
            />
          </div>

          {/* Slug Input */}
          <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
               Slug
             </label>
             <div className="space-y-2">
               {/* Slug Input Type Selection */}
               <div className="flex space-x-4">
                                   <label className="flex items-center">
                    <input
                      type="radio"
                      name="slugInputType"
                      value="manual"
                      checked={slugInputType === 'manual'}
                      onChange={() => {
                        setSlugInputType('manual');
                        setFormData(prev => ({
                          ...prev,
                          categorySlug: '' // Clear categorySlug when switching to manual
                        }));
                      }}
                      className="mr-2 text-gray-500"
                    />
                    <span className="text-sm text-gray-700">Type manually</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="slugInputType"
                      value="category"
                      checked={slugInputType === 'category'}
                      onChange={() => {
                        setSlugInputType('category');
                        setFormData(prev => ({
                          ...prev,
                          slug: '' // Clear slug when switching to category
                        }));
                      }}
                      className="mr-2 text-gray-500"
                    />
                    <span className="text-sm text-gray-700">Choose from category</span>
                  </label>
               </div>
               
               {/* Manual Slug Input */}
               {slugInputType === 'manual' && (
                 <input
                   type="text"
                   value={formData.slug}
                   onChange={(e) => handleInputChange('slug', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                   placeholder="Enter slider slug"
                 />
               )}
               
               {/* Category Selection for Slug */}
               {slugInputType === 'category' && (
                 <div>
                   <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                     {categories.map(category => renderCategory(category))}
                   </div>
                   {formData.categorySlug && (
                     <p className="text-sm text-gray-600 mt-1">
                       Selected category: {formData.categorySlug}
                     </p>
                   )}
                 </div>
               )}
             </div>
           </div>

          {/* Desktop Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desktop Image *
            </label>
            <CloudinaryUploadWidget
              onUploadSuccess={handleDesktopImageUpload}
              multiple={false}
              maxFiles={1}
              initialImages={formData.desktopImage ? [formData.desktopImage] : []}
            />
          </div>

          {/* Mobile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Image *
            </label>
            <CloudinaryUploadWidget
              onUploadSuccess={handleMobileImageUpload}
              multiple={false}
              maxFiles={1}
              initialImages={formData.mobileImage ? [formData.mobileImage] : []}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Saving...' : (editingSlider ? 'Update Slider' : 'Create Slider')}
          </button>
        </div>
      </Modal>

      {/* Home Sliders List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {homeSliders.map((slider) => (
            <li key={slider._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {slider.desktopImage && (
                      <img
                        src={slider.desktopImage}
                        alt="Desktop"
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                    {slider.mobileImage && (
                      <img
                        src={slider.mobileImage}
                        alt="Mobile"
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{slider.name}</h3>
                    <p className="text-sm text-gray-500">Slug: {slider.slug}</p>
                    <p className="text-sm text-gray-500">Category: {slider.categorySlug}</p>
                    <p className="text-sm text-gray-500">Order: {slider.order}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    slider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {slider.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleEdit(slider)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slider._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {homeSliders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No home sliders found. Create your first slider!
          </div>
        )}
      </div>
    </div>
  );
} 