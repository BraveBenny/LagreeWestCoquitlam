
import React, { useState, useCallback, useEffect } from 'react';
import { ShiftInput } from './components/ShiftInput';
import { StaffInput } from './components/StaffInput';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { Stats } from './components/Stats';
import { DailyScheduleList } from './components/DailyScheduleList';
import { api } from './services/api';
import { Shift, Staff } from './types';
import { Sparkles, AlertTriangle, Loader2, LayoutDashboard, Cloud } from 'lucide-react';

const App: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shifts' | 'staff'>('shifts');

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [staffData, shiftData] = await Promise.all([
          api.getStaff(),
          api.getShifts()
        ]);
        setStaff(staffData);
        setShifts(shiftData);
      } catch (err) {
        setError("Could not connect to database. Check if backend is running.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGenerateSchedule = useCallback(async () => {
    if (shifts.length === 0 || staff.length === 0) {
        setError("Ensure you have staff and shift slots created first.");
        return;
    }

    setIsGenerating(true);
    setError(null);
    setNotes(null);

    try {
      const result = await api.generateSchedule();
      setShifts(result.shifts);
      setNotes(result.notes);
    } catch (err: any) {
      setError("AI Scheduling failed. Check server logs.");
    } finally {
      setIsGenerating(false);
    }
  }, [shifts, staff]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium">Connecting to MongoDB Atlas...</p>
      </div>
    );
  }

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
            <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-wider">
               <Cloud className="w-3 h-3" />
               Live Database Active
            </div>
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> AI Roster Build
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel */}
        <div className="w-full md:w-1/3 lg:w-[320px] flex flex-col border-r border-gray-200 bg-white z-10 shadow-sm flex-shrink-0">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'shifts' ? 'text-primary border-primary bg-white' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
            >
              1. Slots
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'staff' ? 'text-secondary border-secondary bg-white' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
            >
              2. Staff
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
             {activeTab === 'shifts' ? (
                 <ShiftInput shifts={shifts} setShifts={setShifts} />
             ) : (
                 <StaffInput staff={staff} setStaff={setStaff} />
             )}
          </div>
          
          {error && (
            <div className="p-4 border-t border-red-100 bg-red-50 text-red-700 text-xs flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="p-6 space-y-8 max-w-6xl mx-auto">
                <div className="min-h-[500px]">
                    <ScheduleCalendar shifts={shifts} staff={staff} />
                </div>
                <div className="h-80">
                    <Stats shifts={shifts} staff={staff} />
                </div>
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
