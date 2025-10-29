/**
 * upload.service.ts - File upload service
 *
 * Provides helper to upload avatar images via multipart/form-data.
 */

import axios from '../utils/axios';

export const uploadService = {
  /**
   * Upload an avatar image file and return its public URL.
   * @param file Image file to upload
   * @returns URL string of uploaded image
   */
  async uploadAvatar(file: File): Promise<string> {
    const form = new FormData();
    form.append('image', file);

    const response = await axios.post('/uploads/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });

    if (!response.data?.success || !response.data?.url) {
      throw new Error(response.data?.message || 'Upload failed');
    }
    return response.data.url as string;
  }
};
