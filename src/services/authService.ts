import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';
import type { LoginRequest, AuthResponse, User, Company } from '../types';

const TOKEN_KEY = 'handygo_admin_token';
const USER_KEY = 'handygo_admin_user';
const COMPANY_KEY = 'handygo_admin_company';

// Mock data for development
const MOCK_USER: User = {
  id: 'admin-1',
  email: 'admin@handygo.ae',
  firstName: 'Property',
  lastName: 'Manager',
  phone: '+971501234567',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
};

const MOCK_COMPANY: Company = {
  id: 'comp-1',
  name: 'Dubai Marina Properties',
  adminUserId: 'admin-1',
  email: 'admin@handygo.ae',
  phone: '+971501234567',
  address: 'Dubai Marina, Dubai, UAE',
  propertiesCount: 15,
  tenantsCount: 34,
  createdAt: new Date().toISOString(),
};

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; company?: Company }> {
    try {
      const response = await api.post<any>('/auth/login', credentials);
      if (response.data && !response.error) {
        const d = response.data;
        // Handle both flat response and { token, user } response from backend
        const userData = d.user || d;
        const user: User = {
          id: userData.id, email: userData.email,
          firstName: userData.firstName, lastName: userData.lastName,
          phone: userData.phoneNumber || userData.phone, role: userData.role || 'ADMIN',
          createdAt: userData.createdAt,
        };
        const token = d.token || `backend-${user.id}`;
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        if (d.company) {
          await SecureStore.setItemAsync(COMPANY_KEY, JSON.stringify(d.company));
        }
        return { user, company: d.company };
      }
      throw new Error(response.error || 'Login failed');
    } catch {
      // Mock fallback for development
      if (credentials.email === 'admin@handygo.ae' && credentials.password === 'admin123') {
        const mockToken = 'mock-admin-token-' + Date.now();
        await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(MOCK_USER));
        await SecureStore.setItemAsync(COMPANY_KEY, JSON.stringify(MOCK_COMPANY));
        return { user: MOCK_USER, company: MOCK_COMPANY };
      }
      throw new Error('Invalid email or password');
    }
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
};

