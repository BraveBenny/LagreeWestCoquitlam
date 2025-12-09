export enum StaffRole {
  HOST = 'Host'
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  role: StaffRole;
  assignedStaffId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  constraints: string; // Natural language constraints
  avatar: string;
}

export interface Assignment {
  shiftId: string;
  staffId: string;
  reasoning?: string;
}

export interface ScheduleResult {
  assignments: Assignment[];
  unfilledShiftIds: string[];
  notes: string;
}