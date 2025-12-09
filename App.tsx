
import React, { useState, useCallback, useEffect } from 'react';
import { ShiftInput } from './components/ShiftInput';
import { StaffInput } from './components/StaffInput';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { Stats } from './components/Stats';
import { DailyScheduleList } from './components/DailyScheduleList';
import { generateSchedule } from './services/gemini';
import { Shift, Staff, StaffRole } from './types';
import { Sparkles, AlertTriangle, Loader2, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  // Initialize with the specific staff list and generated personas
  const [staff, setStaff] = useState<Staff[]>([
    { 
      id: 'ben', 
      name: 'Ben', 
      role: StaffRole.HOST, 
      constraints: 'Early riser. Loves the 6:30am shifts. Cannot work past 2pm.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben' 
    },
    { 
      id: 'nahal', 
      name: 'Nahal', 
      role: StaffRole.HOST, 
      constraints: 'Student. Only available for Evening shifts (2:45pm+).', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nahal' 
    },
    { 
      id: 'bahar', 
      name: 'Bahar', 
      role: StaffRole.HOST, 
      constraints: 'Flexible on weekdays, but strictly NO weekends.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bahar' 
    },
    { 
      id: 'liam', 
      name: 'Liam', 
      role: StaffRole.HOST, 
      constraints: 'Weekends ONLY. Available for double shifts on Sat/Sun.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' 
    },
    { 
      id: 'reza', 
      name: 'Reza', 
      role: StaffRole.HOST, 
      constraints: ' prefers the long Day shift (8:30-1:30). Hate mornings.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reza' 
    },
    { 
      id: 'ashghar', 
      name: 'Ashghar', 
      role: StaffRole.HOST, 
      constraints: 'Morning (6:30am) or Day (8:30am) only. No evenings.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ashghar' 
    },
    { 
      id: 'akbar', 
      name: 'Akbar', 
      role: StaffRole.HOST, 
      constraints: 'Anytime, but needs Tuesdays off. Prefers Evening shifts.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Akbar' 
    },
    { 
      id: 'naghi', 
      name: 'Naghi', 
      role: StaffRole.HOST, 
      constraints: 'Very flexible. Can fill gaps anywhere.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Naghi' 
    },
    { 
      id: 'taghi', 
      name: 'Taghi', 
      role: StaffRole.HOST, 
      constraints: 'Prefers Day shift. Can do Mornings if needed. No Evenings.', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taghi' 
    },
  ]);

  // Initialize with shifts for December 2025 with strict 3 slots
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const year = 2025;
    const month = 11; // Month is 0-indexed, 11 = December
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const defaultShifts: Shift[] = [];
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        // 1. Morning Shift: 6:30 am to 8:30 am
        defaultShifts.push({
            id: `dec25-${d}-mor`,
            date: dateStr,
            startTime: '06:30',
            endTime: '08:30',
            role: StaffRole.HOST
        });
        
        // 2. Day Shift: 8:30 am to 1:30 pm (13:30)
        defaultShifts.push({
            id: `dec25-${d}-day`,
            date: dateStr,
            startTime: '08:30',
            endTime: '13:30',
            role: StaffRole.HOST
        });

        // 3. Evening Shift: 2:45 pm (14:45) to 6:30 pm (18:30)
        defaultShifts.push({
            id: `dec25-${d}-eve`,
            date: dateStr,
            startTime: '14:45',
            endTime: '18:30',
            role: StaffRole.HOST
        });
    }
    return defaultShifts;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shifts' | 'staff'>('shifts');

  const handleGenerateSchedule = useCallback(async () => {
    if (shifts.length === 0) {
        setError("Add some shifts first!");
        return;
    }
    if (staff.length === 0) {
        setError("Add some staff members first!");
        return;
    }

    setIsGenerating(true);
    setError(null);
    setNotes(null);

    try {
      // Clear current assignments first
      const cleanShifts = shifts.map(s => ({ ...s, assignedStaffId: undefined }));
      setShifts(cleanShifts);

      const result = await generateSchedule(cleanShifts, staff);

      // Apply assignments
      const updatedShifts = cleanShifts.map(shift => {
        const assignment = result.assignments.find(a => a.shiftId === shift.id);
        return assignment ? { ...shift, assignedStaffId: assignment.staffId } : shift;
      });

      setShifts(updatedShifts);
      setNotes(result.notes);
      
      if (result.unfilledShiftIds.length > 0) {
        setError(`Warning: ${result.unfilledShiftIds.length} shifts could not be filled based on constraints.`);
      }

    } catch (err: any) {
      setError(err.message || "Failed to generate schedule.");
    } finally {
      setIsGenerating(false);
    }
  }, [shifts, staff]);

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white shadow-sm">
             <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Studio Host AI</h1>
            <p className="text-xs text-gray-500">Dec 2025 Planning</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {notes && (
             <div className="text-xs max-w-md text-right text-gray-600 bg-amber-50 p-2 rounded-md border border-amber-100 hidden md:block shadow-sm">
                <span className="font-bold text-amber-700">AI Note:</span> {notes}
             </div>
          )}
          <button
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
            className={`
                flex items-center px-5 py-2 rounded-full font-bold text-sm text-white shadow-md transition-all transform hover:scale-105
                ${isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-indigo-700 hover:shadow-indigo-200'
                }
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Roster
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Controls - Fixed Width */}
        <div className="w-full md:w-1/3 lg:w-[320px] flex flex-col border-r border-gray-200 bg-white z-10 shadow-sm flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'shifts' ? 'text-primary border-primary bg-white' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
            >
              1. Range
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'staff' ? 'text-secondary border-secondary bg-white' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
            >
              2. Staff
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
             {activeTab === 'shifts' ? (
                 <ShiftInput shifts={shifts} setShifts={setShifts} />
             ) : (
                 <StaffInput staff={staff} setStaff={setStaff} />
             )}
          </div>
          
          {/* Error/Status Message area in sidebar */}
          {error && (
            <div className="p-4 border-t border-red-100 bg-red-50 text-red-700 text-xs flex items-start animate-pulse">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Right Panel: Visualizations - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="p-6 space-y-8 max-w-6xl mx-auto">
                {/* 1. Calendar View */}
                <div className="min-h-[500px]">
                    <ScheduleCalendar shifts={shifts} staff={staff} />
                </div>
                
                {/* 2. Statistics */}
                <div className="h-80">
                    <Stats shifts={shifts} staff={staff} />
                </div>

                {/* 3. Detailed Daily List */}
                <div>
                    <DailyScheduleList shifts={shifts} staff={staff} />
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;
