import React, { useState } from 'react';
import { Staff, StaffRole } from '../types';
import { Users, UserPlus, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface StaffInputProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

export const StaffInput: React.FC<StaffInputProps> = ({ staff, setStaff }) => {
  const [name, setName] = useState('');
  const [constraints, setConstraints] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const addStaff = async () => {
    if (!name.trim()) return;
    setIsSyncing(true);
    try {
      const newStaff = await api.addStaff({
        name,
        role: StaffRole.HOST,
        constraints: constraints.trim() || 'No specific constraints.',
        avatar: `https://picsum.photos/seed/${name}/200`,
      });
      setStaff(prev => [...prev, newStaff]);
      setName('');
      setConstraints('');
    } catch (err) {
      alert("Failed to add staff to database.");
    } finally {
      setIsSyncing(false);
    }
  };

  const removeStaff = async (id: string) => {
    setIsSyncing(true);
    try {
      await api.deleteStaff(id);
      setStaff(prev => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete staff.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative">
      {isSyncing && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
        <Users className="w-5 h-5 mr-2 text-secondary" />
        Staff Availability
      </h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Host Name"
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
        <textarea
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="Constraints..."
          className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
        <button
          onClick={addStaff}
          disabled={isSyncing}
          className="w-full bg-secondary text-white p-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition flex justify-center items-center shadow-sm disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4 mr-2" /> {isSyncing ? 'Syncing...' : 'Add Host'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {staff.map((person) => (
          <div key={person.id} className="relative p-4 bg-white border border-gray-200 rounded-lg mb-3">
            <button onClick={() => removeStaff(person.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
            <div className="font-semibold text-gray-900 text-sm">{person.name}</div>
            <p className="text-xs text-gray-600 bg-gray-50 p-2 mt-2 rounded italic">"{person.constraints}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};