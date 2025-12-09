import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shift, Staff } from '../types';

interface StatsProps {
  shifts: Shift[];
  staff: Staff[];
}

export const Stats: React.FC<StatsProps> = ({ shifts, staff }) => {
  // Calculate hours per staff
  const data = staff.map(person => {
    const assignedShifts = shifts.filter(s => s.assignedStaffId === person.id);
    let totalHours = 0;
    assignedShifts.forEach(s => {
        const start = parseInt(s.startTime.split(':')[0]) + parseInt(s.startTime.split(':')[1])/60;
        const end = parseInt(s.endTime.split(':')[0]) + parseInt(s.endTime.split(':')[1])/60;
        totalHours += (end - start);
    });
    
    return {
      name: person.name,
      hours: Math.round(totalHours * 10) / 10, // round to 1 decimal
      role: person.role
    };
  }).filter(d => d.hours > 0);

  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Workload Distribution (Hours)</h3>
      <div className="h-64 w-full">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Generate a schedule to see stats
            </div>
        )}
      </div>
    </div>
  );
};