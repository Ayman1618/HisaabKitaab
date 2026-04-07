import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SmsAndroid from 'react-native-get-sms-android';
import { BackendAPI, SmsMessagePayload } from './api';

const LAST_SYNCED_KEY = '@hisaab_last_synced_sms';

export const SmsService = {
  /**
   * Request Android SMS permissions.
   */
  requestPermissions: async () => {
    if (Platform.OS !== 'android') return false;

    try {
      // 1. Check if already granted to avoid the hang
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
      
      if (hasPermission) {
        console.log('[DEBUG] Permission already granted, skipping check.');
        return true;
      }

      console.log('[DEBUG] Prompting user for permission...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'HisaabKitaab SMS Permission',
          message: 'HisaabKitaab needs access to your SMS to automatically track your expenses.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[DEBUG] Permission request error:', err);
      return false;
    }
  },

  /**
   * Main sync logic: Reads SMS from device and pushes to backend.
   */
  syncTransactions: async () => {
    console.log('[DEBUG] Requesting SMS Permissions...');
    const hasPermission = await SmsService.requestPermissions();
    console.log('[DEBUG] Permission granted:', hasPermission);
    
    if (!hasPermission) {
      console.error('[DEBUG] Permission Denied via UI/OS');
      throw new Error('SMS Permission Denied');
    }

    // 1. Get last synced timestamp
    const lastSyncedStr = await AsyncStorage.getItem(LAST_SYNCED_KEY);
    const lastSynced = lastSyncedStr ? parseInt(lastSyncedStr, 10) : 0;

    // 2. Query SMS messages
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const effectiveMinDate = lastSynced > 0 ? Math.max(lastSynced + 1, last24Hours) : last24Hours;

    const filter = {
      box: 'inbox',
      minDate: effectiveMinDate, 
    };
    
    console.log(`[DEBUG] Checking for SMS since: ${new Date(effectiveMinDate).toLocaleString()}`);

    return new Promise((resolve, reject) => {
      let isSettled = false;

      const timeoutId = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          console.error('[DEBUG] FATAL: SMS Library hung for > 8 seconds!');
          reject(new Error('SMS_LIBRARY_TIMEOUT'));
        }
      }, 8000);

      SmsAndroid.list(
        JSON.stringify(filter),
        (fail: string) => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeoutId);
          reject(new Error(fail));
        },
        async (count: number, smsList: string) => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeoutId);

          const messages = JSON.parse(smsList);
          if (messages.length === 0) {
            resolve({ count: 0, status: 'no_new_messages' });
            return;
          }

          const payload: SmsMessagePayload[] = messages.map((msg: any) => ({
            sender: msg.address,
            body: msg.body,
            timestamp: msg.date,
          }));

          try {
            const result = await BackendAPI.syncMessages(payload);
            const latestTimestamp = Math.max(...payload.map(m => m.timestamp));
            await AsyncStorage.setItem(LAST_SYNCED_KEY, latestTimestamp.toString());
            resolve({ count: messages.length, status: 'synced', result });
          } catch (error: any) {
            reject(new Error(`NETWORK_ERROR: ${error.message}`));
          }
        }
      );
    });
  },

  /**
   * DEVELOPER MOCK SYNC:
   * Bypasses the blocked SMS permission in Expo Go for testing.
   */
  syncMockTransactions: async () => {
    console.log('[DEBUG] Running Mock Sync (Bypassing Android OS Block)...');
    
    const mockSMS = [
      { sender: 'SBI-BANK', body: 'A/c XX1234 debited by Rs 1,450.00 on 07-04-26. Ref: Zomato Order.', date: Date.now() - 1000 * 60 * 30 },
      { sender: 'HDFC-TXN', body: 'Money transfer: Rs 500.00 from HDFC Bank to Swiggy. ID: 99123.', date: Date.now() - 1000 * 60 * 120 },
      { sender: 'ICICI-PL', body: 'Dear Customer, your Ac XXXXX102 is credited with INR 45,000.00 on 01-04-26. (Salary).', date: Date.now() - 1000 * 60 * 60 * 24 },
      { sender: 'AMAZON-PAY', body: 'Paid Rs 2,100.00 for order on Amazon. Ref: AMZ-991.', date: Date.now() - 1000 * 60 * 60 * 5 },
      { sender: 'AXIS-BANK', body: 'Alert: Your Axis Bank card was used for Rs 450.00 at Uber India.', date: Date.now() - 1000 * 30 },
    ];

    const payload: SmsMessagePayload[] = mockSMS.map(msg => ({
      sender: msg.sender,
      body: msg.body,
      timestamp: msg.date,
    }));

    try {
      console.log(`[DEBUG] Sending ${payload.length} MOCK messages to backend...`);
      // BackendAPI.syncMessages already wraps it in { messages: payload }
      const result = await BackendAPI.syncMessages(payload);
      return { count: payload.length, status: 'mock_synced', result };
    } catch (error: any) {
      console.error(`[DEBUG] Mock Sync FAILED:`, error.message);
      throw new Error(`MOCK_SYNC_NETWORK_ERROR: ${error.message}`);
    }
  }
};
