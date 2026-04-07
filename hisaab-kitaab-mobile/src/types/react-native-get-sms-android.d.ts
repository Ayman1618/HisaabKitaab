declare module 'react-native-get-sms-android' {
  export interface SmsFilter {
    box?: 'inbox' | 'sent' | 'draft' | 'outbox' | 'failed' | 'queued';
    read?: 0 | 1;
    _id?: number;
    address?: string;
    body?: string;
    minDate?: number;
    maxDate?: number;
    indexFrom?: number;
    maxCount?: number;
  }

  export default class SmsAndroid {
    static list(
      filter: string,
      fail: (error: string) => void,
      success: (count: number, list: string) => void
    ): void;
  }
}
