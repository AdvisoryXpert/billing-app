// src/api/auth.ts
import { api, saveToken, clearToken } from './http';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = { id: number; name: string; email: string };
export type LoginResp = { access_token: string; token_type: 'Bearer'; user: User };

const USER_KEY = 'auth_user';

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResp>('/login', { email, password });
  await saveToken(data.access_token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)); // <-- save user
  return data.user;
}

export async function getSavedUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function logout() {
  try { await api.post('/logout'); } catch {}
  await clearToken();
  await AsyncStorage.removeItem(USER_KEY); // <-- clear user
}

// (optional) if your backend supports it, you can refresh user:
// export async function me(): Promise<User> {
//   const { data } = await api.get<User>('/me');
//   await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
//   return data;
// }
