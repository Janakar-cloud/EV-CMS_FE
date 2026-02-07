import apiClient from './api-client';

export interface Review {
  id: string;
  stationName: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published' | 'flagged';
  createdAt: string;
}

export interface ReviewListResponse {
  reviews: Review[];
}

class AdminReviewsService {
  private static readonly API_BASE = '/admin/reviews';

  async listReviews(): Promise<ReviewListResponse> {
    const response = await apiClient.get(AdminReviewsService.API_BASE);
    return (response as ReviewListResponse) ?? { reviews: [] };
  }

  async moderateReview(id: string, action: 'publish' | 'flag'): Promise<void> {
    await apiClient.patch(`${AdminReviewsService.API_BASE}/${id}/moderate`, { action });
  }
}

export const adminReviewsService = new AdminReviewsService();
export default adminReviewsService;
