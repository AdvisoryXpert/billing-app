// src/api/http.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// --- Origin the browser can reach (NOT the docker service name) ---
const ORIGIN = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, ''); // no trailing slash
const TOKEN_KEY_NATIVE = 'billing.token.native';
const TOKEN_KEY_WEB = 'billing.token.session';
const isWeb = typeof window !== 'undefined';

let tokenMem: string | undefined;

// Axios instance points to ORIGIN only; we’ll prepend `/api` in a request interceptor
export const api = axios.create({
  baseURL: ORIGIN,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// --- Token helpers ---
export const setAuthToken = (token?: string) => {
  tokenMem = token;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete (api.defaults.headers.common as any).Authorization;
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
// 1) Always prefix path with `/api` (and de-dupe if caller already included it)
api.interceptors.request.use(async (config) => {
  // Auth header (lazy-restore)
  if (!config.headers?.Authorization) {
    let t = getToken();
    if (!t) t = await restoreToken();
    if (t) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${t}` };
  }

  const raw = (config.url ?? '').toString();
  // If caller used absolute URL, leave it alone
  if (!/^https?:\/\//i.test(raw)) {
    // normalize to '/something'
    let path = raw.startsWith('/') ? raw : `/${raw}`;
    // remove a leading '/api' ONCE to avoid '/api/api'
    path = path.replace(/^\/api(\/|$)/i, '/');
    // final url becomes '/api/whatever'
    config.url = `/api${path}`;
  }
  return config;
});

// 2) Auto-logout on 401 (web → /login)
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