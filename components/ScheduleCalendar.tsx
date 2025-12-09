
import React, { useMemo } from 'react';
import { Shift, Staff } from '../types';
import { Users } from 'lucide-react';

interface ScheduleCalendarProps {
  shifts: Shift[];
  staff: Staff[];
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ shifts, staff }) => {
  // Determine the month/year range based on shifts
  const { startOfMonth, daysInMonth, monthLabel, emptyDays } = useMemo(() => {
    if (shifts.length === 0) {
        const now = new Date();
        return { startOfMonth: now, daysInMonth: 30, monthLabel: "No Shifts Scheduled", emptyDays: 0 };
    }
    
    // Find earliest shift to determine month context
    const sortedDates = shifts.map(s => new Date(s.date).getTime()).sort();
    const firstShiftDate = new Date(sortedDates[0]);
    
    const year = firstShiftDate.getFullYear();
    const month = firstShiftDate.getMonth();
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const emptyDays = startOfMonth.getDay(); // 0 = Sunday
    
    const monthLabel = startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return { startOfMonth, daysInMonth, monthLabel, emptyDays };
  }, [shifts]);

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    
    // Sort shifts within each day by start time
    Object.keys(map).forEach(date => {
        map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    return map;
  }, [shifts]);

  // Helper to get staff details
  const getStaff = (id?: string) => staff.find(s => s.id === id);

  const renderDays = () => {
    const days = [];
    
    // Empty slots for start of month
    for (let i = 0; i < emptyDays; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50/30 min-h-[140px] border-b border-r border-gray-100"></div>);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), d);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;

      const dayShifts = shiftsByDate[localDateStr] || [];
      const isToday = new Date().toISOString().split('T')[0] === localDateStr;
      
      // We expect 3 shifts usually. Let's map them to Morning/Day/Evening if possible for coloring
      const getSlotLabel = (start: string) => {
          if (start === '06:30') return { label: 'M', color: 'bg-blue-100 text-blue-800' };
          if (start === '08:30') return { label: 'D', color: 'bg-orange-100 text-orange-800' };
          if (start === '14:45') return { label: 'E', color: 'bg-indigo-100 text-indigo-800' };
          return { label: '?', color: 'bg-gray-100 text-gray-800' };
      };

      days.push(
        <div key={d} className={`bg-white min-h-[160px] border-b border-r border-gray-100 p-2 relative hover:bg-gray-50 transition flex flex-col ${isToday ? 'bg-indigo-50/10 ring-1 ring-inset ring-indigo-100' : ''}`}>
          <div className={`text-sm font-bold mb-2 flex justify-between items-center ${isToday ? 'text-primary' : 'text-gray-700'}`}>
             <span>{d}</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-1.5">
            {dayShifts.map(shift => {
              const assignedStaff = getStaff(shift.assignedStaffId);
              const { label, color } = getSlotLabel(shift.startTime);
              
              return (
                <div 
                    key={shift.id} 
                    className="flex items-center gap-2 overflow-hidden"
                    title={`${shift.startTime} - ${shift.endTime}`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded ${color}`}>
                      {label}
                  </span>
                  
                  <div className={`flex-1 text-xs truncate py-0.5 px-1.5 rounded border ${assignedStaff ? 'bg-white border-gray-100 text-gray-800 font-medium shadow-sm' : 'bg-red-50 border-red-100 text-red-400 italic'}`}>
                      {assignedStaff ? assignedStaff.name : 'Unassigned'}
                  </div>
                </div>
              );
            })}
            
            {dayShifts.length === 0 && (
                <div className="flex-1 flex items-center justify-center opacity-30">
                     <div className="h-full w-px bg-gray-300 mx-auto"></div>
                </div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Users className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900">{monthLabel}</h2>
                <p className="text-xs text-gray-500">Staff Assignments</p>
            </div>
        </div>
        <div className="flex gap-4 text-xs font-medium">
             <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                 <span className="text-gray-600">Morning</span>
             </div>
             <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                 <span className="text-gray-600">Day</span>
             </div>
             <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                 <span className="text-gray-600">Evening</span>
             </div>
        </div>
      </div>
      <div className="grid grid-cols-7 bg-gray-50 text-[10px] font-bold text-gray-400 tracking-wider text-center py-2 border-b border-gray-200">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>
      <div className="grid grid-cols-7 bg-gray-100 gap-px border-b border-gray-200">
         {renderDays()}
      </div>
    </div>
  );
};
