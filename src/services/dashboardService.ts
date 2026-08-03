import { api } from '../lib/api';
import { authService } from './authService';
import type { DashboardStats, MaintenanceRequest, Job, ServiceCategory, RequestStatus, RequestPriority } from '../types';

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

function mapJob(r: any): Job {
  const category = ((r.category || 'general').toLowerCase().replace('ac_hvac', 'ac')) as ServiceCategory;
  const description = r.description || r.title || '';
  const propertyAddress = r.location?.address || r.propertyAddress || r.buildingName || '';
  const status = (r.status || 'pending').toLowerCase().replace(/ /g, '_') as any;
  return {
    id: r.jobId || r.id || '',
    requestId: r.requestId || '',
    handymanId: r.handymanId || '',
    handymanName: r.handymanName || '',
    tenantName: r.tenantName || '',
    category,
    description,
    propertyAddress,
    status,
    createdAt: r.createdAt || new Date().toISOString(),
    startedAt: r.startedAt,
    completedAt: r.completedAt,
    totalCost: r.totalCost || r.quotedAmount || 0,
    platformFee: r.platformFee || 0,
    handymanPayout: r.handymanPayout || 0,
    request: {
      id: r.requestId || '',
      tenantId: r.tenantId || '',
      tenantName: r.tenantName || '',
      tenantPhone: r.tenantPhone || '',
      propertyAddress,
      category,
      description,
      images: r.photoUrls || r.images || [],
      priority: (r.priority || 'medium').toLowerCase() as RequestPriority,
      status,
      createdAt: r.createdAt || new Date().toISOString(),
      lat: r.location?.latitude || r.lat || 25.2048,
      lng: r.location?.longitude || r.lng || 55.2708,
    },
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const token = await authService.getToken();
    const response = await api.get<DashboardStats>('/requests/stats', token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch stats');
    }
    return response.data;
  },

  async getRecentRequests(): Promise<MaintenanceRequest[]> {
    const token = await authService.getToken();
    const response = await api.get<any[]>('/requests', token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch requests');
    }
    return (Array.isArray(response.data) ? response.data : []).map(mapRequest).slice(0, 5);
  },

  async getActiveJobs(): Promise<Job[]> {
    const token = await authService.getToken();
    const response = await api.get<any[]>('/jobs', token);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch jobs');
    }
    return (Array.isArray(response.data) ? response.data : [])
      .map(mapJob)
      .filter((j) => j.status !== 'completed' && j.status !== 'cancelled');
  },
};
