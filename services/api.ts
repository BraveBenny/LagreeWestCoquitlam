import { Staff, Shift } from '../types';

// In a real deployment, this would come from an environment variable
const API_BASE = 'http://localhost:3001/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(error.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  getStaff: async (): Promise<Staff[]> => {
    const res = await fetch(`${API_BASE}/staff`);
    return handleResponse(res);
  },
  addStaff: async (staff: Partial<Staff>): Promise<Staff> => {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staff),
    });
    return handleResponse(res);
  },
  deleteStaff: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete staff');
  },
  getShifts: async (): Promise<Shift[]> => {
    const res = await fetch(`${API_BASE}/shifts`);
    return handleResponse(res);
  },
  generateShiftRange: async (startDate: string, endDate: string, shiftTypes: any[]): Promise<Shift[]> => {
    const res = await fetch(`${API_BASE}/shifts/generate-range`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, shiftTypes }),
    });
    return handleResponse(res);
  },
  clearShifts: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/shifts`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear shifts');
  },
  generateSchedule: async (): Promise<{ shifts: Shift[], notes: string }> => {
    const res = await fetch(`${API_BASE}/schedule/generate`, { method: 'POST' });
    return handleResponse(res);
  }
};