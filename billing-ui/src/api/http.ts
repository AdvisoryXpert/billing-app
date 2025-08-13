// src/api/http.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // ← change to your server/LAN IP
const TOKEN_KEY_NATIVE = 'billing.token.native';
const TOKEN_KEY_WEB = 'billing.token.session';
const isWeb = typeof window !== 'undefined';

let tokenMem: string | undefined;

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// --- Token helpers ---
export const setAuthToken = (token?: string) => {
  tokenMem = token;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const getToken = () => tokenMem;

export async function saveToken(token: string) {
  setAuthToken(token);
  if (isWeb) {
    try { sessionStorage.setItem(TOKEN_KEY_WEB, token); } catch {}
  } else {
    try { await SecureStore.setItemAsync(TOKEN_KEY_NATIVE, token); } catch {}
  }
}

export async function clearToken() {
  setAuthToken(undefined);
  if (isWeb) {
    try { sessionStorage.removeItem(TOKEN_KEY_WEB); } catch {}
  } else {
    try { await SecureStore.deleteItemAsync(TOKEN_KEY_NATIVE); } catch {}
  }
}

export async function restoreToken() {
  if (isWeb) {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY_WEB);
      if (t) setAuthToken(t);
      return t || undefined;
    } catch { return tokenMem; }
  }
  try {
    const t = await SecureStore.getItemAsync(TOKEN_KEY_NATIVE);
    if (t) setAuthToken(t);
    return t || undefined;
  } catch { return undefined; }
}

// --- Interceptors ---
// Ensure Authorization header on EVERY request
api.interceptors.request.use(async (config) => {
  if (!config.headers?.Authorization) {
    // try memory first
    let t = getToken();
    if (!t) {
      // lazy-restore from storage if needed
      t = await restoreToken();
    }
    if (t) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${t}` };
    }
  }
  return config;
});

// Optional: auto-logout on 401 (web goes to /login)
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearToken();
      if (isWeb) window.location.href = '/login';
    }
    throw error;
  }
);
