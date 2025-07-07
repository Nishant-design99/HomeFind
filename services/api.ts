import axios from 'axios';
import { Home } from '../types';

// The backend server will be running on port 5000
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const api = {
  getHomes: async (): Promise<Home[]> => {
    const response = await apiClient.get('/homes');
    return response.data;
  },
  
  getHomeById: async (id: string): Promise<Home> => {
    const response = await apiClient.get(`/homes/${id}`);
    return response.data;
  },

  /**
   * Uploads an array of files to the backend /upload endpoint.
   * @param files - An array of File objects to upload.
   * @returns A promise that resolves to the media file data from the backend.
   */
  uploadFiles: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Creates a new home listing.
   * @param homeData - The home data, including mediaFile objects from the upload step.
   * @returns A promise that resolves to the newly created home object.
   */
  addHome: async (homeData: Omit<Home, '_id' | 'createdAt'>): Promise<Home> => {
    const response = await apiClient.post('/homes', homeData);
    return response.data;
  },

  /**
   * Deletes a home listing by its ID.
   * @param id - The ID of the home to delete.
   * @returns A promise that resolves when the deletion is successful.
   */
  deleteHome: async (id: string): Promise<void> => {
    await apiClient.delete(`/homes/${id}`);
  },
};
