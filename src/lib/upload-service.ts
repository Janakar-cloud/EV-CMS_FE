import { apiClient } from './api-client';

/**
 * File Upload Service
 * Handles file uploads (images, documents)
 */

const BASE_URL = '/upload';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export type UploadType = 'profile' | 'vehicle' | 'document' | 'station' | 'kyc';

export const uploadService = {
  /**
   * Upload a file
   */
  async uploadFile(file: File, type: UploadType): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return apiClient.post<UploadResponse>(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], type: UploadType): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, type));
    return Promise.all(uploadPromises);
  },

  /**
   * Upload with progress tracking
   */
  async uploadWithProgress(
    file: File,
    type: UploadType,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return apiClient.post<UploadResponse>(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
};
