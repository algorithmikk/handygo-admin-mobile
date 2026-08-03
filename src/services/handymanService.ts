import { api } from '../lib/api';
import { authService } from './authService';
import type { Handyman } from '../types';

function mapHandyman(h: any): Handyman {
  return {
    id: h.handymanId || h.id,
    userId: h.userId,
    name: `${h.firstName || ''} ${h.lastName || ''}`.trim() || h.name || 'Handyman',
    email: h.email,
    phone: h.phoneNumber || h.phone,
    services: h.serviceCategories || h.services || [],
    available: Boolean(h.isAvailable ?? h.available),
    rating: h.rating || 0,
    completedJobs: h.completedJobs || 0,
    status: h.status,
    lat: h.currentLocation?.latitude || h.lat || 25.2048,
    lng: h.currentLocation?.longitude || h.lng || 55.2708,
  };
}

export const handymanService = {
  async getHandymen(): Promise<Handyman[]> {
    const token = await authService.getToken();
    const response = await api.get<any[]>('/handymen', token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch handymen');
    }
    return (Array.isArray(response.data) ? response.data : []).map(mapHandyman);
  },

  async getHandyman(id: string): Promise<Handyman | null> {
    const token = await authService.getToken();
    const response = await api.get<any>(`/handymen/${id}`, token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch handyman');
    }
    return mapHandyman(response.data);
  },

  async getAvailableHandymen(): Promise<Handyman[]> {
    const token = await authService.getToken();
    const response = await api.get<any[]>('/handymen?available=true', token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch available handymen');
    }
    return (Array.isArray(response.data) ? response.data : []).map(mapHandyman);
  },

  async verify(handymanId: string, action: 'approve' | 'suspend' | 'reject' = 'approve'): Promise<void> {
    const token = await authService.getToken();
    const response = await api.post(`/handymen/${handymanId}/verify`, { action }, token);
    if (response.error) throw new Error(response.error);
  },
};
