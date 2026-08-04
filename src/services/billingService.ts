import { api } from '../lib/api';
import { authService } from './authService';

export interface SubscriptionInfo {
  active?: boolean;
  status?: string;
}

export const billingService = {
  async getSubscription(): Promise<SubscriptionInfo> {
    const token = await authService.getToken();
    const response = await api.get<SubscriptionInfo>('/billing/subscription', token);
    if (response.error || !response.data) {
      return { active: false, status: 'none' };
    }
    return response.data;
  },
};
