import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function secureAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

const KEY_TOKEN = 'auth_token';
const KEY_EMAIL = 'auth_email';

export const AuthStore = {
  async getEmail(): Promise<string | null> {
    if (await secureAvailable()) return await SecureStore.getItemAsync(KEY_EMAIL);
    // fallback for web or if secure store is unavailable
    return await AsyncStorage.getItem(KEY_EMAIL);
  },
  async setEmail(email: string) {
    if (await secureAvailable()) return await SecureStore.setItemAsync(KEY_EMAIL, email);
    return await AsyncStorage.setItem(KEY_EMAIL, email);
  },
  async getToken(): Promise<string | null> {
    if (await secureAvailable()) return await SecureStore.getItemAsync(KEY_TOKEN);
    return await AsyncStorage.getItem(KEY_TOKEN);
  },
  async setToken(token: string) {
    if (await secureAvailable()) return await SecureStore.setItemAsync(KEY_TOKEN, token);
    return await AsyncStorage.setItem(KEY_TOKEN, token);
  },
  async clear() {
    if (await secureAvailable()) {
      await SecureStore.deleteItemAsync(KEY_TOKEN);
      await SecureStore.deleteItemAsync(KEY_EMAIL);
    } else {
      await AsyncStorage.multiRemove([KEY_TOKEN, KEY_EMAIL]);
    }
  },
};
