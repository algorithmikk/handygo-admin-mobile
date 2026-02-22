import { api } from '../lib/api';
import { authService } from './authService';
import { MOCK_HANDYMEN } from '../lib/mockData';
import type { Handyman } from '../types';

export const handymanService = {
  async getHandymen(): Promise<Handyman[]> {
    try {
      const token = await authService.getToken();
      const response = await api.get<Handyman[]>('/handymen', token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      return MOCK_HANDYMEN;
    }
  },

  async getHandyman(id: string): Promise<Handyman | null> {
    try {
      const token = await authService.getToken();
      const response = await api.get<Handyman>(`/handymen/${id}`, token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      return MOCK_HANDYMEN.find(h => h.id === id) || null;
    }
  },

  async getAvailableHandymen(): Promise<Handyman[]> {
    try {
      const token = await authService.getToken();
      const response = await api.get<Handyman[]>('/handymen?available=true', token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      return MOCK_HANDYMEN.filter(h => h.available);
    }
  },
};

