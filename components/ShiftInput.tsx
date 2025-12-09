
import React, { useState } from 'react';
import { Shift, StaffRole } from '../types';
import { PlusCircle, Trash2, CalendarRange, Check, Clock } from 'lucide-react';

interface ShiftInputProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
}

export const ShiftInput: React.FC<ShiftInputProps> = ({ shifts, setShifts }) => {
  // Default to current month range or specifically Dec 2025 as per context
  const [startDate, setStartDate] = useState<string>('2025-12-01');
  const [endDate, setEndDate] = useState<string>('2025-12-31');

  // Hardcoded Shift Definitions
  const SHIFT_TYPES = [
    { name: 'Morning', start: '06:30', end: '08:30', duration: '2h' },
    { name: 'Day', start: '08:30', end: '13:30', duration: '5h' },
    { name: 'Evening', start: '14:45', end: '18:30', duration: '3.75h' },
  ];

  const addShiftsRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      alert("Start date cannot be after end date");
      return;
    }

    const newShifts: Shift[] = [];
    const current = new Date(start);

    // Filter out existing dates to avoid duplicates if user clicks add twice
    const existingDates = new Set(shifts.map(s => s.date));

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Only add if not already present (or you could choose to append)
      // For simplicity, we'll allow appending but usually you'd check existing
      
      SHIFT_TYPES.forEach((type, idx) => {
          newShifts.push({
            id: `shift-${dateStr}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
            date: dateStr,
            startTime: type.start,
            endTime: type.end,
            role: StaffRole.HOST,
          });
      });
      
      current.setDate(current.getDate() + 1);
    }

    // Merge logic: Remove old shifts in this range? Or just append? 
    // To be clean, let's filter out shifts in the selected range first to avoid double booking slots
    const filteredShifts = shifts.filter(s => {
        return s.date < startDate || s.date > endDate;
    });

    setShifts([...filteredShifts, ...newShifts]);
  };

  const removeShift = (id: string) => {
    setShifts(shifts.filter((s) => s.id !== id));
  };

  const clearAllShifts = () => {
    if (confirm("Are you sure you want to clear all shifts?")) {
      setShifts([]);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
        <CalendarRange className="w-5 h-5 mr-2 text-primary" />
        Define Range
      </h2>

      <div className="bg-indigo-50/50 p-4 rounded-lg mb-4 border border-indigo-100 shadow-sm">
        <p className="text-xs text-indigo-800 mb-3 font-medium">
            Select the date range to generate the standard daily roster (Morning, Day, Evening).
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
             <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date</label>
             <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-indigo-100 mb-4 space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Daily Structure</div>
            {SHIFT_TYPES.map(type => (
                <div key={type.name} className="flex justify-between text-xs text-gray-700 border-b border-gray-50 last:border-0 pb-1 last:pb-0">
                    <span className="font-semibold">{type.name}</span>
                    <span className="font-mono">{type.start} - {type.end}</span>
                </div>
            ))}
            <div className="text-[10px] text-gray-400 italic text-center pt-1">
                (Break: 13:30 - 14:45)
            </div>
        </div>

        <button
          onClick={addShiftsRange}
          className="w-full bg-primary text-white p-2.5 rounded-md text-sm font-bold hover:bg-indigo-700 transition flex justify-center items-center shadow-sm"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Generate Shifts
        </button>
      </div>

      <div className="flex justify-between items-center mb-2 px-1 border-b border-gray-100 pb-2">
         <span className="text-xs font-bold text-gray-400 uppercase">Slots Overview</span>
         {shifts.length > 0 && (
            <button onClick={clearAllShifts} className="text-xs text-red-500 hover:text-red-700 font-medium">
                Clear All
            </button>
         )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {shifts.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm border-2 border-dashed border-gray-100 rounded-lg">
            No shifts defined.<br/>Set range above to start.
          </div>
        ) : (
          <div className="space-y-2">
            {shifts.sort((a,b) => {
                const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                return a.startTime.localeCompare(b.startTime);
            }).map((shift) => {
                // Determine shift name for display
                let label = "Shift";
                if (shift.startTime === '06:30') label = "Morning";
                else if (shift.startTime === '08:30') label = "Day";
                else if (shift.startTime === '14:45') label = "Evening";

                return (
                    <div
                        key={shift.id}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-300 transition group"
                    >
                        <div>
                        <div className="font-bold text-gray-700 text-xs flex items-center gap-2 mb-0.5">
                            {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${
                                label === 'Morning' ? 'bg-blue-400' :
                                label === 'Day' ? 'bg-orange-400' : 'bg-indigo-400'
                            }`}>{label}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 font-mono pl-0.5">
                            <Clock className="w-3 h-3 mr-1 opacity-50" />
                            {shift.startTime} - {shift.endTime}
                            {shift.assignedStaffId && <Check className="w-3 h-3 ml-2 text-green-500" />}
                        </div>
                        </div>
                        <button
                        onClick={() => removeShift(shift.id)}
                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-right">
        Total Slots: {shifts.length}
      </div>
    </div>
  );
};
