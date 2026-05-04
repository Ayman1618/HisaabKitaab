import axios from 'axios';

// ── Update this to your Mac's current Wi-Fi IP ──────────────────────────────
const API_URL = 'http://192.168.203.216:3000/api/v1';
// ────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'x-user-id': 'demo-user-1',
  },
});

export interface SmsMessagePayload {
  sender: string;
  body: string;
  timestamp: number;
}

export const BackendAPI = {
  syncMessages: async (messages: SmsMessagePayload[]) => {
    const response = await api.post('/sms/sync', { messages });
    return response.data;
  },

  getTransactions: async (params?: { limit?: number; category?: string; type?: string }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/transactions/summary');
    return response.data;
  },

  getMonthlySummary: async (year: number, month: number) => {
    const response = await api.get('/transactions/summary/monthly', {
      params: { year, month },
    });
    return response.data;
  },

  getTopMerchants: async (year: number, month: number, limit = 5) => {
    const response = await api.get('/transactions/top-merchants', {
      params: { year, month, limit },
    });
    return response.data;
  },
};
