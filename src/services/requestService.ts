import { api } from '../lib/api';
import { authService } from './authService';
import type { MaintenanceRequest, RequestStatus, ServiceCategory, RequestPriority } from '../types';

function mapRequest(r: any): MaintenanceRequest {
  return {
    id: r.requestId || r.id || '',
    tenantId: r.tenantId || '',
    tenantName: r.tenantName || '',
    tenantPhone: r.tenantPhone || '',
    companyId: r.companyId,
    propertyAddress: r.location?.address || r.propertyAddress || r.buildingName || '',
    category: ((r.category || 'general').toLowerCase().replace('ac_hvac', 'ac')) as ServiceCategory,
    description: r.description || r.title || '',
    images: r.photoUrls || r.images || [],
    priority: (r.priority || 'medium').toLowerCase() as RequestPriority,
    status: (r.status || 'pending').toLowerCase().replace(/ /g, '_') as RequestStatus,
    createdAt: r.createdAt || new Date().toISOString(),
    assignedHandymanId: r.assignedHandymanId,
    assignedHandymanName: r.assignedHandymanName,
    lat: r.location?.latitude || r.lat || 25.2048,
    lng: r.location?.longitude || r.lng || 55.2708,
    estimatedCost: r.estimatedCost,
    completedAt: r.completedAt,
  };
}

export const requestService = {
  async getRequests(status?: RequestStatus): Promise<MaintenanceRequest[]> {
    const token = await authService.getToken();
    const endpoint = status ? `/requests?status=${status}` : '/requests';
    const response = await api.get<any[]>(endpoint, token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch requests');
    }
    return (Array.isArray(response.data) ? response.data : []).map(mapRequest);
  },

  async getRequest(id: string): Promise<MaintenanceRequest | null> {
    const token = await authService.getToken();
    const response = await api.get<any>(`/requests/${id}`, token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch request');
    }
    return mapRequest(response.data);
  },

  async assignHandyman(requestId: string, handymanId: string, handymanName?: string): Promise<void> {
    const token = await authService.getToken();
    const response = await api.put(
      `/requests/${requestId}/assign`,
      { handymanId, handymanName: handymanName || 'Handyman' },
      token,
    );
    if (response.error) throw new Error(response.error);
  },

  async updatePriority(requestId: string, priority: string): Promise<void> {
    const token = await authService.getToken();
    const response = await api.put(`/requests/${requestId}`, { priority }, token);
    if (response.error) throw new Error(response.error);
  },

  async cancelRequest(requestId: string): Promise<void> {
    const token = await authService.getToken();
    const response = await api.put(`/requests/${requestId}/cancel`, {}, token);
    if (response.error) throw new Error(response.error);
  },
};
