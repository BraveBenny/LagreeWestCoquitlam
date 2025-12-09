
import React from 'react';
import { Shift, Staff } from '../types';
import { Clock, AlertCircle, CalendarCheck } from 'lucide-react';

interface DailyScheduleListProps {
  shifts: Shift[];
  staff: Staff[];
}

export const DailyScheduleList: React.FC<DailyScheduleListProps> = ({ shifts, staff }) => {
  // Sort shifts by date and time
  const sortedShifts = [...shifts].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  const getStaff = (id?: string) => staff.find(s => s.id === id);

  const getDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const duration = (endH + endM / 60) - (startH + startM / 60);
    return Math.round(duration * 10) / 10;
  };

  // Group by date for headers
  const shiftsByDate: Record<string, Shift[]> = {};
  sortedShifts.forEach(shift => {
    if (!shiftsByDate[shift.date]) shiftsByDate[shift.date] = [];
    shiftsByDate[shift.date].push(shift);
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="bg-green-100 p-2 rounded-lg text-green-700">
            <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-800">Daily Breakdown</h3>
            <p className="text-xs text-gray-500">Detailed chronologcial LWC view</p>
        </div>
      </div>
      
      {Object.keys(shiftsByDate).length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No shifts scheduled yet. Use the "Range Generator" to add slots.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(shiftsByDate).map(([date, dayShifts]) => {
            const dateObj = new Date(date);
            // Check if all shifts in this day have assignments
            const isFullyStaffed = dayShifts.every(s => s.assignedStaffId);
            
            return (
                <div key={date} className={`border rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${isFullyStaffed ? 'border-gray-200' : 'border-orange-200'}`}>
                <div className={`px-5 py-3 border-b flex justify-between items-center ${isFullyStaffed ? 'bg-gray-50 border-gray-200' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="text-center bg-white px-3 py-1 rounded border border-gray-200 shadow-sm min-w-[60px]">
                            <div className="text-[10px] font-bold text-gray-500 uppercase">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div>
                            <div className="text-xl font-bold text-gray-800 leading-none">{dateObj.getDate()}</div>
                        </div>
                        <span className="font-bold text-gray-800">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${isFullyStaffed ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                        {isFullyStaffed ? 'Fully Staffed' : 'Needs Attention'}
                    </span>
                </div>
                
                <div className="divide-y divide-gray-100 bg-white">
                    {dayShifts.map((shift, idx) => {
                    const assigned = getStaff(shift.assignedStaffId);
                    const duration = getDuration(shift.startTime, shift.endTime);
                    
                    // Determine if this is a morning, afternoon, or evening shift for icon color
                    const hour = parseInt(shift.startTime.split(':')[0]);
                    let timeColor = "text-blue-600"; // Morning
                    if (hour >= 12) timeColor = "text-orange-500"; // Afternoon
                    if (hour >= 17) timeColor = "text-indigo-600"; // Evening
                    
                    return (
                        <div key={shift.id} className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-[200px]">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 ${timeColor}`}>
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-mono font-bold text-gray-800 text-lg leading-none mb-1">
                                    {shift.startTime}<span className="text-gray-300 text-sm mx-1">-</span>{shift.endTime}
                                </div>
                                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded inline-block">
                                    {duration} hrs
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex-1 sm:pl-6 border-l-0 sm:border-l border-gray-100">
                            {assigned ? (
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all w-full sm:w-auto">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                            <img src={assigned.avatar} alt={assigned.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 text-sm">{assigned.name}</span>
                                        <span className="text-[10px] text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                                            {assigned.constraints.substring(0, 40)}{assigned.constraints.length > 40 ? '...' : ''}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 w-full sm:w-auto">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm font-bold">Unassigned Slot</span>
                                </div>
                            )}
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
