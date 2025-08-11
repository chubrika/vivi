import { api } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface HomeSlider {
  _id: string;
  name: string;
  slug: string;
  desktopImage: string;
  mobileImage: string;
  categorySlug: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomeSliderData {
  name: string;
  slug?: string;
  desktopImage: string;
  mobileImage: string;
  categorySlug?: string;
}

export interface UpdateHomeSliderData extends Partial<CreateHomeSliderData> {
  isActive?: boolean;
  order?: number;
}

export const homeSliderService = {
  // Get all home sliders
  async getHomeSliders(): Promise<HomeSlider[]> {
    const response = await api.get('/api/home-sliders', undefined, false);
    return response.data;
  },

  // Get home slider by ID
  async getHomeSliderById(id: string): Promise<HomeSlider> {
    const response = await api.get(`/api/home-sliders/${id}`, undefined, false);
    return response.data;
  },

  // Create new home slider
  async createHomeSlider(data: CreateHomeSliderData): Promise<HomeSlider> {
    const token = getToken();
    const response = await api.post('/api/home-sliders', data, token || undefined);
    return response.data;
  },

  // Update home slider
  async updateHomeSlider(id: string, data: UpdateHomeSliderData): Promise<HomeSlider> {
    const token = getToken();
    const response = await api.put(`/api/home-sliders/${id}`, data, token || undefined);
    return response.data;
  },

  // Delete home slider
  async deleteHomeSlider(id: string): Promise<void> {
    const token = getToken();
    await api.delete(`/api/home-sliders/${id}`, token || undefined);
  }
}; 