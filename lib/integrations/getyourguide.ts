import axios from 'axios';

const API_BASE_URL = 'https://api.getyourguide.com/1';

interface GetYourGuideConfig {
  apiKey: string;
  partnerId: string;
}

export class GetYourGuideAPI {
  private config: GetYourGuideConfig;

  constructor(config?: GetYourGuideConfig) {
    this.config = config || {
      apiKey: process.env.GETYOURGUIDE_API_KEY || '',
      partnerId: process.env.GETYOURGUIDE_PARTNER_ID || '',
    };
  }

  private getHeaders() {
    return {
      'X-ACCESS-TOKEN': this.config.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // Buscar tours/atividades
  async searchActivities(params: {
    q?: string;
    location_id?: string;
    category_id?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const response = await axios.get(`${API_BASE_URL}/activities`, {
        headers: this.getHeaders(),
        params: {
          ...params,
          partner_id: this.config.partnerId,
        },
      });

      return response.data;
    } catch (error) {
      console.error('GetYourGuide API Error:', error);
      throw error;
    }
  }

  // Buscar detalhes de atividade
  async getActivity(activityId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/activities/${activityId}`,
        {
          headers: this.getHeaders(),
          params: { partner_id: this.config.partnerId },
        }
      );

      return response.data;
    } catch (error) {
      console.error('GetYourGuide API Error:', error);
      throw error;
    }
  }

  // Buscar disponibilidade
  async getAvailability(activityId: string, date: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/activities/${activityId}/availabilities`,
        {
          headers: this.getHeaders(),
          params: {
            partner_id: this.config.partnerId,
            date, // Format: YYYY-MM-DD
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('GetYourGuide API Error:', error);
      throw error;
    }
  }

  // Criar reserva
  async createBooking(bookingData: {
    activity_id: string;
    option_id: string;
    datetime: string;
    participants: Array<{
      type: string;
      count: number;
    }>;
    customer: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
    };
  }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bookings`,
        {
          ...bookingData,
          partner_id: this.config.partnerId,
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('GetYourGuide Booking Error:', error);
      throw error;
    }
  }

  // Cancelar reserva
  async cancelBooking(bookingId: string, reason?: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/bookings/${bookingId}`,
        {
          headers: this.getHeaders(),
          data: {
            partner_id: this.config.partnerId,
            reason,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('GetYourGuide Cancel Error:', error);
      throw error;
    }
  }

  // Buscar reviews
  async getReviews(activityId: string, page = 1, limit = 20) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/activities/${activityId}/reviews`,
        {
          headers: this.getHeaders(),
          params: {
            partner_id: this.config.partnerId,
            page,
            limit,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('GetYourGuide Reviews Error:', error);
      throw error;
    }
  }

  // Sincronizar tours com GetYourGuide
  async syncTours() {
    try {
      // Buscar todos os tours do GetYourGuide
      const activities = await this.searchActivities({
        limit: 100,
      });

      // Processar e salvar no banco
      // (Implementar lógica de sync)

      return {
        success: true,
        imported: activities.data?.length || 0,
      };
    } catch (error) {
      console.error('Sync Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const getYourGuideAPI = new GetYourGuideAPI();
