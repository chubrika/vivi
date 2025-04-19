'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sellersService, Seller, CreateSellerData } from '../../../services/sellersService';
import SellerCreationModal from '../../../components/SellerCreationModal';

export default function SellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateSellerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellersService.getAllSellers();
      setSellers(data);
    } catch (err) {
      console.error('Error fetching sellers:', err);
      setError('Failed to fetch sellers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email) {
      setFormError('Name and email are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Use the sellersService to create a new seller
      const newSeller = await sellersService.createSeller(formData);
      
      // Update sellers list
      setSellers(prev => [...prev, newSeller]);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        description: ''
      });
      
    } catch (err) {
      console.error('Error creating seller:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create seller');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (sellerId: string) => {
    try {
      const seller = sellers.find((s) => s._id === sellerId);
      if (!seller) return;

      await sellersService.updateSeller(sellerId, { isActive: !seller.isActive });
      setSellers((prev: Seller[]) =>
        prev.map((s) =>
          s._id === sellerId ? { ...s, isActive: !s.isActive } : s
        )
      );
    } catch (err) {
      setError('Failed to update seller status');
      console.error('Error updating seller status:', err);
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (!window.confirm('Are you sure you want to delete this seller?')) {
      return;
    }

    try {
      await sellersService.deleteSeller(sellerId);
      setSellers((prev: Seller[]) => prev.filter((s) => s._id !== sellerId));
    } catch (err) {
      setError('Failed to delete seller');
      console.error('Error deleting seller:', err);
    }
  };

  const handleCreateSeller = async (data: CreateSellerData) => {
    try {
      const newSeller = await sellersService.createSeller(data);
      setSellers((prev: Seller[]) => [...prev, newSeller]);
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to create seller');
      console.error('Error creating seller:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sellers Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Add New Seller
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No sellers found. Click "Add New Seller" to create one.
                </td>
              </tr>
            ) : (
              sellers.map((seller) => (
                <tr key={seller._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{seller.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{seller.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      seller.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {seller.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleToggleStatus(seller._id)}
                      className={`text-${seller.isActive ? 'red' : 'green'}-600 hover:text-${seller.isActive ? 'red' : 'green'}-900`}
                    >
                      {seller.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteSeller(seller._id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SellerCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSellerCreated={handleCreateSeller}
      />
    </div>
  );
} 