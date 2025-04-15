'use client';

import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  initialImages?: string[];
}

export default function CloudinaryUploadWidget({
  onUploadSuccess,
  multiple = true,
  maxFiles = 5,
  initialImages = []
}: CloudinaryUploadWidgetProps) {
  // State to track uploaded images
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize images when component mounts
  useEffect(() => {
    // Reset images to initialImages
    setImages([...initialImages]);
  }, [initialImages]);

  // Handle successful upload
  const handleUploadSuccess = (result: any) => {
    if (result.info && typeof result.info !== 'string') {
      const newUrl = result.info.secure_url;
      
      // Add the new URL to the images array
      setImages(prevImages => {
        // Check if the URL is already in the array to avoid duplicates
        if (!prevImages.includes(newUrl)) {
          const updatedImages = [...prevImages, newUrl];
          // Notify parent component
          onUploadSuccess(updatedImages);
          return updatedImages;
        }
        return prevImages;
      });
    }
    
    setIsUploading(false);
  };

  // Handle upload error
  const handleUploadError = (error: any) => {
    console.error('Upload error:', error);
    setIsUploading(false);
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      // Notify parent component
      onUploadSuccess(newImages);
      return newImages;
    });
  };

  // Open the uploader
  const handleOpenUploader = (open: () => void) => {
    setIsUploading(true);
    open();
  };

  return (
    <div className="space-y-4">
      {/* Display uploaded images */}
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="relative group">
            <img
              src={url}
              alt={`Uploaded image ${index + 1}`}
              className="w-24 h-24 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        
        {/* Upload button */}
        {images.length < maxFiles && (
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            options={{
              maxFiles: multiple ? maxFiles - images.length : 1,
              resourceType: 'image',
              multiple: multiple,
              showAdvancedOptions: false,
              cropping: false,
              showUploadMoreButton: false,
              styles: {
                palette: {
                  window: '#FFFFFF',
                  windowBorder: '#90A0B3',
                  tabIcon: '#0078FF',
                  menuIcons: '#5A616A',
                  textDark: '#000000',
                  textLight: '#FFFFFF',
                  link: '#0078FF',
                  action: '#FF620C',
                  inactiveTabIcon: '#0E2F5A',
                  error: '#F44235',
                  inProgress: '#0078FF',
                  complete: '#20B832',
                  sourceBg: '#E4EBF1',
                  folder: '#0078FF',
                },
              },
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => handleOpenUploader(open)}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>
      
      {/* Upload status */}
      {isUploading && (
        <div className="text-sm text-gray-500">Uploading...</div>
      )}
      
      {/* Image count */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500">
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded
          {maxFiles && ` (max ${maxFiles})`}
        </div>
      )}
    </div>
  );
} 