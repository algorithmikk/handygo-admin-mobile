import { api } from '../lib/api';
import { authService } from './authService';
import { MOCK_REQUESTS } from '../lib/mockData';
import type { MaintenanceRequest, RequestStatus } from '../types';

export const requestService = {
  async getRequests(status?: RequestStatus): Promise<MaintenanceRequest[]> {
    try {
      const token = await authService.getToken();
      const endpoint = status ? `/requests?status=${status}` : '/requests';
      const response = await api.get<MaintenanceRequest[]>(endpoint, token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      // Mock fallback
      if (status) return MOCK_REQUESTS.filter(r => r.status === status);
      return MOCK_REQUESTS;
    }
  },

  async getRequest(id: string): Promise<MaintenanceRequest | null> {
    try {
      const token = await authService.getToken();
      const response = await api.get<MaintenanceRequest>(`/requests/${id}`, token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      return MOCK_REQUESTS.find(r => r.id === id) || null;
    }
  },

  async assignHandyman(requestId: string, handymanId: string, handymanName?: string): Promise<void> {
    try {
      const token = await authService.getToken();
      // Backend uses PUT for assign, expects { handymanId, handymanName }
      const response = await api.put(`/requests/${requestId}/assign`, { handymanId, handymanName: handymanName || 'Handyman' }, token);
      if (response.error) throw new Error(response.error);
    } catch {
      console.log(`Mock: Assigned handyman ${handymanId} to request ${requestId}`);
    }
  },

  async updatePriority(requestId: string, priority: string): Promise<void> {
    try {
      const token = await authService.getToken();
      // Backend uses PUT for updates
      const response = await api.put(`/requests/${requestId}`, { priority }, token);
      if (response.error) throw new Error(response.error);
    } catch {
      console.log(`Mock: Updated priority of ${requestId} to ${priority}`);
    }
  },

  async cancelRequest(requestId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      // Backend uses PUT for cancel at /requests/{id}/cancel
      const response = await api.put(`/requests/${requestId}/cancel`, {}, token);
      if (response.error) throw new Error(response.error);
    } catch {
      console.log(`Mock: Cancelled request ${requestId}`);
    }
  },
};

