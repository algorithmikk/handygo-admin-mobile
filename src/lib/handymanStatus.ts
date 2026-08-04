import { Colors } from '@/constants/Colors';

export type VerifyAction = 'approve' | 'suspend' | 'reject';

export function getHandymanStatusStyle(status?: string): { labelKey: string; color: string; bg: string } {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'PENDING_VERIFICATION':
      return { labelKey: 'handymen.statusPending', color: Colors.amber[400], bg: Colors.amber[500] + '20' };
    case 'SUSPENDED':
      return { labelKey: 'handymen.statusSuspended', color: Colors.red[400], bg: Colors.red[400] + '20' };
    case 'BUSY':
      return { labelKey: 'handymen.statusBusy', color: Colors.orange[400], bg: Colors.orange[400] + '20' };
    case 'OFFLINE':
      return { labelKey: 'handymen.statusOffline', color: Colors.gray[400], bg: Colors.gray[600] + '30' };
    case 'AVAILABLE':
    default:
      return { labelKey: 'handymen.statusActive', color: Colors.primary[400], bg: Colors.primary[500] + '20' };
  }
}

export function canVerifyHandyman(status?: string): boolean {
  const normalized = (status || '').toUpperCase();
  return normalized === 'PENDING_VERIFICATION' || normalized === 'SUSPENDED' || normalized === 'AVAILABLE' || normalized === 'OFFLINE' || normalized === 'BUSY';
}
