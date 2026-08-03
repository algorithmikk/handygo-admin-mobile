// TypeScript types for HandyGo Admin/Management Mobile App

export type ServiceCategory = 'plumbing' | 'electrical' | 'ac' | 'general';
export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type JobStatus = 'pending' | 'assigned' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'declined';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'TENANT' | 'HANDYMAN';
  profileImageUrl?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  adminUserId: string;
  email: string;
  phone: string;
  address: string;
  propertiesCount: number;
  tenantsCount: number;
  createdAt: string;
}

export interface Handyman {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  services: ServiceCategory[];
  available: boolean;
  rating: number;
  completedJobs: number;
  status?: string;
  lat?: number;
  lng?: number;
}

export interface Tenant {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  unit?: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  companyId?: string;
  propertyAddress: string;
  category: ServiceCategory;
  description: string;
  images: string[];
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  assignedHandymanId?: string;
  assignedHandymanName?: string;
  lat: number;
  lng: number;
  estimatedCost?: number;
  completedAt?: string;
}

export interface Job {
  id: string;
  requestId: string;
  request?: MaintenanceRequest;
  handymanId: string;
  handymanName?: string;
  status: JobStatus;
  category?: ServiceCategory;
  description?: string;
  propertyAddress?: string;
  tenantName?: string;
  createdAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  totalCost?: number;
  platformFee?: number;
  handymanPayout?: number;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  activeJobs: number;
  completedToday: number;
  totalHandymen: number;
  availableHandymen: number;
  totalTenants: number;
  monthlySpend: number;
}

export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { token: string; user: User; company?: Company; }

