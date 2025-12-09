import React, { useState } from 'react';
import { Staff, StaffRole } from '../types';
import { Users, UserPlus, X } from 'lucide-react';

interface StaffInputProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

export const StaffInput: React.FC<StaffInputProps> = ({ staff, setStaff }) => {
  const [name, setName] = useState('');
  // Role is always Host now
  const role = StaffRole.HOST;
  const [constraints, setConstraints] = useState('');

  const addStaff = () => {
    if (!name.trim()) return;
    const newStaff: Staff = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      role,
      constraints: constraints.trim() || 'No specific constraints.',
      avatar: `https://picsum.photos/seed/${name}/200`,
    };
    setStaff([...staff, newStaff]);
    setName('');
    setConstraints('');
  };

  const removeStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
        <Users className="w-5 h-5 mr-2 text-secondary" />
        Staff Availability
      </h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Host Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Smith"
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Constraints & Availability
          </label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. Can only work weekends, max 20 hours/week. Needs Tuesdays off."
            className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
          <p className="text-[10px] text-gray-400 mt-1">Describe availability in natural language.</p>
        </div>
        <button
          onClick={addStaff}
          className="w-full bg-secondary text-white p-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition flex justify-center items-center"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add Host
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {staff.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">No staff added yet.</div>
        ) : (
          <div className="space-y-3">
            {staff.map((person) => (
              <div
                key={person.id}
                className="relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => removeStaff(person.id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                    <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{person.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{person.role}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                  "{person.constraints}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
       <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-right">
        Total Staff: {staff.length}
      </div>
    </div>
  );
};