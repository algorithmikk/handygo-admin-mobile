import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';
import type { LoginRequest, User, Company } from '../types';

const TOKEN_KEY = 'handygo_admin_token';
const USER_KEY = 'handygo_admin_user';
const COMPANY_KEY = 'handygo_admin_company';

const allowMock =
  process.env.EXPO_PUBLIC_ALLOW_MOCK_AUTH === 'true' ||
  process.env.NODE_ENV === 'development';

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; company?: Company }> {
    const response = await api.post<any>('/auth/login', credentials);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Login failed');
    }
    const d = response.data;
    const userData = d.user || d;
    if (String(userData.role).toUpperCase() !== 'ADMIN') {
      throw new Error('Admin account required');
    }
    if (!d.token) {
      throw new Error('No auth token returned from server');
    }
    const user: User = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phoneNumber || userData.phone,
      role: userData.role || 'ADMIN',
      createdAt: userData.createdAt,
    };
    await SecureStore.setItemAsync(TOKEN_KEY, d.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    if (d.company) {
      await SecureStore.setItemAsync(COMPANY_KEY, JSON.stringify(d.company));
    }
    return { user, company: d.company };
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getUser(): Promise<User | null> {
    const json = await SecureStore.getItemAsync(USER_KEY);
    return json ? JSON.parse(json) : null;
  },

  async getCompany(): Promise<Company | null> {
    const json = await SecureStore.getItemAsync(COMPANY_KEY);
    return json ? JSON.parse(json) : null;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(COMPANY_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  },

  /** Dev-only helper — never used in production builds without EXPO_PUBLIC_ALLOW_MOCK_AUTH */
  isMockAllowed(): boolean {
    return allowMock;
  },
};
