import { api } from '../lib/api';
import { authService } from './authService';
import { MOCK_STATS, MOCK_REQUESTS, MOCK_JOBS } from '../lib/mockData';
import type { DashboardStats, MaintenanceRequest, Job } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const token = await authService.getToken();
      const response = await api.get<DashboardStats>('/requests/stats', token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      return MOCK_STATS;
    }
  },

  async getRecentRequests(): Promise<MaintenanceRequest[]> {
    try {
      const token = await authService.getToken();
      const response = await api.get<MaintenanceRequest[]>('/requests?limit=5&sort=createdAt,desc', token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      return MOCK_REQUESTS.slice(0, 3);
    }
  },

  async getActiveJobs(): Promise<Job[]> {
    try {
      const token = await authService.getToken();
      const response = await api.get<Job[]>('/jobs?status=in_progress', token);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch');
    } catch {
      return MOCK_JOBS.filter(j => j.status !== 'completed');
    }
  },
};

