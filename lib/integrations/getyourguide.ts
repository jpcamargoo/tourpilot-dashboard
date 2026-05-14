import { stub } from '@/lib/stubs';

interface GetYourGuideConfig {
  apiKey: string;
  partnerId: string;
}

/**
 * GetYourGuide API stub. Substitua por integração real implementando os
 * métodos abaixo. Veja docs/CUSTOMIZATION.md.
 */
export class GetYourGuideAPI {
  private config: GetYourGuideConfig;

  constructor(config?: GetYourGuideConfig) {
    this.config = config ?? {
      apiKey: process.env.GETYOURGUIDE_API_KEY ?? '',
      partnerId: process.env.GETYOURGUIDE_PARTNER_ID ?? '',
    };
  }

  async searchActivities(params: {
    q?: string;
    location_id?: string;
    category_id?: string;
    limit?: number;
    offset?: number;
  }) {
    stub('getyourguide.searchActivities', params);
    return { activities: [], total: 0 };
  }

  async getActivity(activityId: string) {
    stub('getyourguide.getActivity', { activityId });
    return null;
  }

  async getAvailability(activityId: string, date: string) {
    stub('getyourguide.getAvailability', { activityId, date });
    return { availabilities: [] };
  }

  async createBooking(_bookingData: {
    activity_id: string;
    option_id: string;
    datetime: string;
    participants: Array<{ type: string; count: number }>;
    customer: { email: string; firstName?: string; lastName?: string };
  }) {
    stub('getyourguide.createBooking', _bookingData);
    return { booking_id: 'mock-booking-id', status: 'confirmed' };
  }

  async getBookings(_params?: { from?: string; to?: string; status?: string }) {
    stub('getyourguide.getBookings', _params);
    return { bookings: [], total: 0 };
  }

  async cancelBooking(bookingId: string) {
    stub('getyourguide.cancelBooking', { bookingId });
    return { status: 'cancelled' };
  }
}

export const getYourGuideAPI = new GetYourGuideAPI();
