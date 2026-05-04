import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackendAPI, SmsMessagePayload } from './api';

const LAST_SYNCED_KEY = '@hisaab_last_synced_sms';
const SMS_LOOKBACK_DAYS = 365 * 3; // Scanning last 3 years of messages

/**
 * NOTE: react-native-get-sms-android ONLY works in a bare React Native / Expo Dev Build.
 * It will NOT work in Expo Go. You must run:
 *   npx expo run:android
 * on a physical Android device (or emulator with SMS support).
 */
const getSmsAndroid = (): any => {
  try {
    const mod = require('react-native-get-sms-android');
    return mod.default || mod;
  } catch {
    return null;
  }
};

export const SmsService = {
  requestPermissions: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
      if (already) return true;
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS, {
        title: 'HisaabKitaab SMS Permission',
        message: 'HisaabKitaab needs to read your SMS to automatically track bank transactions.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      });
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('[SmsService] Permission request threw:', err);
      return false;
    }
  },

  syncTransactions: async (): Promise<{ count: number; status: string; result?: any }> => {
    if (Platform.OS !== 'android') throw new Error('SMS sync is only available on Android.');

    const SmsAndroid = getSmsAndroid();
    if (!SmsAndroid) {
      throw new Error(
        'SMS_MODULE_UNAVAILABLE: Run with npx expo run:android (Dev Build), not Expo Go.',
      );
    }

    const hasPermission = await SmsService.requestPermissions();
    if (!hasPermission) throw new Error('SMS_PERMISSION_DENIED');

    const lookbackMs = SMS_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
    const minDate = Date.now() - lookbackMs; // Force full scan of last year

    console.log(`[SmsService] Syncing SMS since: ${new Date(minDate).toLocaleString()}`);

    const messages: any[] = await new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) { settled = true; reject(new Error('SMS_LIBRARY_TIMEOUT')); }
      }, 10_000);

      SmsAndroid.list(
        JSON.stringify({ box: 'inbox', minDate, maxCount: 200 }),
        (fail: string) => {
          if (settled) return; settled = true; clearTimeout(timer);
          reject(new Error(`SMS_LIST_FAILED: ${fail}`));
        },
        (_count: number, smsList: string) => {
          if (settled) return; settled = true; clearTimeout(timer);
          try { resolve(JSON.parse(smsList)); } catch { reject(new Error('SMS_PARSE_FAILED')); }
        },
      );
    });

    if (messages.length === 0) return { count: 0, status: 'no_new_messages' };

    const payload: SmsMessagePayload[] = messages.map((msg: any) => ({
      sender: msg.address ?? 'UNKNOWN',
      body: msg.body ?? '',
      timestamp: typeof msg.date === 'number' ? msg.date : parseInt(msg.date, 10),
    }));

    const result = await BackendAPI.syncMessages(payload);
    const latestTimestamp = Math.max(...payload.map(m => m.timestamp));
    await AsyncStorage.setItem(LAST_SYNCED_KEY, String(latestTimestamp));
    return { count: messages.length, status: 'synced', result };
  },

  syncMockTransactions: async (): Promise<{ count: number; status: string; result?: any }> => {
    const now = Date.now();
    const mockSMS: SmsMessagePayload[] = [
      { sender: 'SBI-BANK', body: 'A/c XX1234 debited by Rs 1,450.00 on 07-04-26. Info: Zomato Order. Avl Bal: Rs 23,540.50', timestamp: now - 1800000 },
      { sender: 'HDFC-TXN', body: 'Rs 500.00 debited from HDFC Bank A/c XX5678 to Swiggy on 07-04-26. UPI Ref: 99123456.', timestamp: now - 7200000 },
      { sender: 'ICICI-PL', body: 'Dear Customer, your A/c XXXXX102 is credited with INR 45,000.00 on 01-04-26. Info: Salary Apr 2026.', timestamp: now - 86400000 },
      { sender: 'AMAZON-PAY', body: 'Rs 2,100.00 debited from Amazon Pay for order #AMZ-991 on 07-04-26.', timestamp: now - 18000000 },
      { sender: 'AXIS-BANK', body: 'Alert: Your Axis Bank Debit Card was used for Rs 450.00 at Uber India on 07-04-26 18:23 IST.', timestamp: now - 30000 },
      { sender: 'PAYTM-BANK', body: 'INR 1200.00 debited from Paytm Wallet for Netflix subscription on 06-04-26.', timestamp: now - 36000000 },
      { sender: 'OTP-HDFC', body: 'Your OTP for HDFC Bank transaction is 847291. Do not share with anyone.', timestamp: now - 2700000 },
    ];
    const result = await BackendAPI.syncMessages(mockSMS);
    return { count: mockSMS.length, status: 'mock_synced', result };
  },

  resetSyncTimestamp: async (): Promise<void> => {
    await AsyncStorage.removeItem(LAST_SYNCED_KEY);
  },
};