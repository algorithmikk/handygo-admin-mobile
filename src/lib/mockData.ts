import type { MaintenanceRequest, Handyman, Tenant, DashboardStats, Job } from '../types';

export const SERVICE_CATEGORIES = [
  { id: 'plumbing' as const, label: 'Plumbing', icon: '🔧', color: '#3B82F6' },
  { id: 'electrical' as const, label: 'Electrical', icon: '⚡', color: '#F59E0B' },
  { id: 'ac' as const, label: 'AC / HVAC', icon: '❄️', color: '#06B6D4' },
  { id: 'general' as const, label: 'General', icon: '🔨', color: '#8B5CF6' },
];

export const getCategoryInfo = (id: string) => SERVICE_CATEGORIES.find(c => c.id === id);

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', assigned: '#3b82f6', in_progress: '#8b5cf6',
  completed: '#10b981', cancelled: '#ef4444', accepted: '#06b6d4',
  en_route: '#14b8a6', declined: '#ef4444',
};

export const MOCK_STATS: DashboardStats = {
  totalRequests: 47, pendingRequests: 8, activeJobs: 5, completedToday: 3,
  totalHandymen: 12, availableHandymen: 7, totalTenants: 34, monthlySpend: 12450,
};

export const MOCK_HANDYMEN: Handyman[] = [
  { id: 'h1', userId: 'u1', name: 'Mohammed Khan', email: 'mohammed@handygo.ae', phone: '+971507654321', services: ['plumbing', 'general'], available: true, rating: 4.8, completedJobs: 156, lat: 25.2048, lng: 55.2708 },
  { id: 'h2', userId: 'u2', name: 'Ahmed Hassan', email: 'ahmed@handygo.ae', phone: '+971501234567', services: ['electrical'], available: true, rating: 4.9, completedJobs: 203, lat: 25.1985, lng: 55.2796 },
  { id: 'h3', userId: 'u3', name: 'Omar Farooq', email: 'omar@handygo.ae', phone: '+971509876543', services: ['ac'], available: false, rating: 4.7, completedJobs: 89, lat: 25.2100, lng: 55.2650 },
  { id: 'h4', userId: 'u4', name: 'Rashid Ali', email: 'rashid@handygo.ae', phone: '+971505555666', services: ['plumbing', 'electrical', 'general'], available: true, rating: 4.6, completedJobs: 67 },
];

export const MOCK_TENANTS: Tenant[] = [
  { id: 't1', userId: 'tu1', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+971551234567', propertyAddress: 'Marina Towers, Apt 1204, Dubai Marina', unit: '1204' },
  { id: 't2', userId: 'tu2', name: 'Fatima Al-Sayed', email: 'fatima@email.com', phone: '+971559876543', propertyAddress: 'Burj Views, Unit 808, Downtown Dubai', unit: '808' },
  { id: 't3', userId: 'tu3', name: 'James Wilson', email: 'james@email.com', phone: '+971554443322', propertyAddress: 'JBR Walk, Apt 503, JBR', unit: '503' },
];

export const MOCK_REQUESTS: MaintenanceRequest[] = [
  { id: 'r1', tenantId: 't1', tenantName: 'Sarah Johnson', tenantPhone: '+971551234567', propertyAddress: 'Marina Towers, Apt 1204, Dubai Marina', category: 'plumbing', description: 'Kitchen sink is leaking badly. Water pooling under cabinet.', images: [], priority: 'high', status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString(), lat: 25.0800, lng: 55.1400, estimatedCost: 350 },
  { id: 'r2', tenantId: 't2', tenantName: 'Fatima Al-Sayed', tenantPhone: '+971559876543', propertyAddress: 'Burj Views, Unit 808, Downtown Dubai', category: 'electrical', description: 'Power outlet in living room stopped working. Sparks occasionally.', images: [], priority: 'urgent', status: 'assigned', createdAt: new Date(Date.now() - 7200000).toISOString(), lat: 25.1972, lng: 55.2744, estimatedCost: 200, assignedHandymanId: 'h2', assignedHandymanName: 'Ahmed Hassan' },
  { id: 'r3', tenantId: 't3', tenantName: 'James Wilson', tenantPhone: '+971554443322', propertyAddress: 'JBR Walk, Apt 503, JBR', category: 'ac', description: 'AC unit making loud rattling noise and not cooling properly.', images: [], priority: 'medium', status: 'in_progress', createdAt: new Date(Date.now() - 86400000).toISOString(), lat: 25.0780, lng: 55.1340, estimatedCost: 500, assignedHandymanId: 'h3', assignedHandymanName: 'Omar Farooq' },
  { id: 'r4', tenantId: 't1', tenantName: 'Sarah Johnson', tenantPhone: '+971551234567', propertyAddress: 'Marina Towers, Apt 1204, Dubai Marina', category: 'general', description: 'Bedroom door handle is loose and needs replacement.', images: [], priority: 'low', status: 'completed', createdAt: new Date(Date.now() - 172800000).toISOString(), lat: 25.0800, lng: 55.1400, estimatedCost: 150, completedAt: new Date(Date.now() - 86400000).toISOString(), assignedHandymanId: 'h1', assignedHandymanName: 'Mohammed Khan' },
];

export const MOCK_JOBS: Job[] = [
  { id: 'j1', requestId: 'r2', request: MOCK_REQUESTS[1], handymanId: 'h2', handymanName: 'Ahmed Hassan', status: 'accepted', acceptedAt: new Date(Date.now() - 3600000).toISOString(), totalCost: 200, platformFee: 30, handymanPayout: 170 },
  { id: 'j2', requestId: 'r3', request: MOCK_REQUESTS[2], handymanId: 'h3', handymanName: 'Omar Farooq', status: 'in_progress', acceptedAt: new Date(Date.now() - 43200000).toISOString(), startedAt: new Date(Date.now() - 7200000).toISOString(), totalCost: 500, platformFee: 75, handymanPayout: 425 },
  { id: 'j3', requestId: 'r4', request: MOCK_REQUESTS[3], handymanId: 'h1', handymanName: 'Mohammed Khan', status: 'completed', acceptedAt: new Date(Date.now() - 172800000).toISOString(), startedAt: new Date(Date.now() - 90000000).toISOString(), completedAt: new Date(Date.now() - 86400000).toISOString(), totalCost: 150, platformFee: 22.5, handymanPayout: 127.5 },
];

