// Booking Service - Complete CRUD with real API integration
import apiClient from './api-client';
import type { Booking } from '@/types/booking';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export type { Booking };

export interface BookingFilters {
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface BookingRequest {
  stationId: string;
  chargerId?: string;
  connectorType?: string;
  bookedFrom?: string;
  bookedUntil?: string;
  scheduledTime?: string;
  vehicleId?: string;
}

class BookingService {
  private static readonly API_BASE = '/bookings';

  /**
   * List all bookings
   */
  async listBookings(filters?: BookingFilters): Promise<Booking[]> {
    try {
      const response = await apiClient.get(BookingService.API_BASE, { params: filters });
      return unwrap<Booking[]>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking details
   */
  async getBooking(id: string): Promise<Booking> {
    try {
      const response = await apiClient.get(`${BookingService.API_BASE}/${id}`);
      return unwrap<Booking>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new booking
   */
  async createBooking(data: BookingRequest): Promise<Booking> {
    try {
      const response = await apiClient.post(BookingService.API_BASE, data);
      return unwrap<Booking>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Start booking (transition to in_progress)
   */
  async startBooking(id: string): Promise<Booking> {
    try {
      const response = await apiClient.put(`${BookingService.API_BASE}/${id}/start`, {});
      return unwrap<Booking>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete booking
   */
  async completeBooking(id: string): Promise<Booking> {
    try {
      const response = await apiClient.put(`${BookingService.API_BASE}/${id}/complete`, {});
      return unwrap<Booking>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      const response = await apiClient.put(`${BookingService.API_BASE}/${id}/cancel`, { reason });
      return unwrap<Booking>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Rate booking
   */
  async rateBooking(
    id: string,
    rating: number,
    comment: string,
    reviewType: 'station' | 'charger'
  ) {
    try {
      const response = await apiClient.post(`${BookingService.API_BASE}/${id}/rate`, {
        rating,
        comment,
        reviewType,
      });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const bookingService = new BookingService();
export { bookingService };
export default bookingService;
