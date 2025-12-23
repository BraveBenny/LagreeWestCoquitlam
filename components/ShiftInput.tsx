import React, { useState } from 'react';
import { Shift, StaffRole } from '../types';
import { PlusCircle, Trash2, CalendarRange, Check, Clock, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ShiftInputProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
}

export const ShiftInput: React.FC<ShiftInputProps> = ({ shifts, setShifts }) => {
  const [startDate, setStartDate] = useState<string>('2025-12-01');
  const [endDate, setEndDate] = useState<string>('2025-12-31');
  const [isSyncing, setIsSyncing] = useState(false);

  const SHIFT_TYPES = [
    { name: 'Morning', start: '06:30', end: '08:30' },
    { name: 'Day', start: '08:30', end: '13:30' },
    { name: 'Evening', start: '14:45', end: '18:30' },
  ];

  const addShiftsRange = async () => {
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date");
      return;
    }

    setIsSyncing(true);
    try {
      const updatedShifts = await api.generateShiftRange(startDate, endDate, SHIFT_TYPES);
      setShifts(updatedShifts);
    } catch (err) {
      alert("Failed to sync shifts with database.");
    } finally {
      setIsSyncing(false);
    }
  };

  const clearAllShifts = async () => {
    if (!confirm("Are you sure you want to clear all shifts?")) return;
    
    setIsSyncing(true);
    try {
      await api.clearShifts();
      setShifts([]);
    } catch (err) {
      alert("Failed to clear database.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative">
      {isSyncing && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
        <CalendarRange className="w-5 h-5 mr-2 text-primary" />
        Define Range
      </h2>

      <div className="bg-indigo-50/50 p-4 rounded-lg mb-4 border border-indigo-100 shadow-sm">
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

        <button
          onClick={addShiftsRange}
          disabled={isSyncing}
          className="w-full bg-primary text-white p-2.5 rounded-md text-sm font-bold hover:bg-indigo-700 transition flex justify-center items-center shadow-sm disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> {isSyncing ? 'Syncing...' : 'Generate Shifts'}
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
            No shifts defined.
          </div>
        ) : (
          <div className="space-y-2">
            {[...shifts].sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <div className="font-bold text-gray-700 text-xs flex items-center gap-2 mb-0.5">
                            {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 font-mono">
                            <Clock className="w-3 h-3 mr-1 opacity-50" />
                            {shift.startTime} - {shift.endTime}
                        </div>
                    </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};