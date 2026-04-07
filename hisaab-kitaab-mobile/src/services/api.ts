import axios from 'axios';

// During local development, replace with your machine's local IP Address (e.g., http://192.168.1.5:3000)
// Emulators route 'localhost' to the device itself.
const API_URL = 'http://localhost:3000/api/v1'; 

export interface SmsMessage {
  id: string;
  sender: string;
  body: string;
  receivedAt: string;
}

export const BackendAPI = {
  /**
   * Pushes the Android SMS batch directly to our centralized NestJS backend Queues.
   */
  syncMessages: async (userId: string, messages: SmsMessage[]) => {
    try {
      const response = await axios.post(`${API_URL}/sms/sync`, {
        userId,
        messages,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to sync SMS batch to backend:', error);
      throw error;
    }
  }
};
