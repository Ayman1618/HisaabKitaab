import axios from 'axios';

// During local development, replace with your machine's local IP Address (e.g., http://192.168.1.5:3000)
const API_URL = 'http://192.168.137.232:3000/api/v1'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'x-user-id': 'demo-user-1', // Temporary identification
  },
});

export interface SmsMessagePayload {
  sender: string;
  body: string;
  timestamp: number;
}

export const BackendAPI = {
  /**
   * Pushes the Android SMS batch directly to our centralized NestJS backend.
   */
  syncMessages: async (messages: SmsMessagePayload[]) => {
    try {
      const response = await api.post('/sms/sync', { messages });
      return response.data;
    } catch (error) {
      console.error('Failed to sync SMS batch to backend:', error);
      throw error;
    }
  },

  /**
   * Fetches processed transactions from the backend.
   */
  getTransactions: async () => {
    try {
      const response = await api.get('/transactions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }
};
