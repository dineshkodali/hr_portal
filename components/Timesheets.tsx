import React, { useState } from 'react';
import { Search, Calendar, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Timesheet, StatCardProps } from '../types';

interface TimesheetsProps {
  timesheets: Timesheet[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`p-2.5 rounded-xl ${color} text-white shadow-sm`}>
      {icon}
    </div>
  </div>
);

const Timesheets: React.FC<TimesheetsProps> = ({ timesheets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredTimesheets = timesheets.filter(ts => {
      const matchesSearch = ts.employeename.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      const today = new Date();
      const tsDate = new Date(ts.date);
      
      if (dateFilter === 'today') {
          matchesDate = tsDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = tsDate >= weekAgo && tsDate <= today;
      } else if (dateFilter === 'month') {
          matchesDate = tsDate.getMonth() === today.getMonth() && tsDate.getFullYear() === today.getFullYear();
      }

      return matchesSearch && matchesDate;
  });

  const totalHours = filteredTimesheets.reduce((acc, curr) => acc + curr.duration, 0);
  const totalOvertime = filteredTimesheets.filter(t => t.status === 'Overtime').reduce((acc, curr) => acc + (curr.duration - 540 > 0 ? curr.duration - 540 : 0), 0);

  const formatDuration = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6 px-6 pb-6">
      {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Timesheets</h1>
          <p className="text-slate-500 mt-1">Track daily working hours and overtime.</p>
        </div>
      </div> */}

       {/* Stats Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

         <StatCard title="Total Hours Logged" value={formatDuration(totalHours)} icon={<Clock size={20} />} color="bg-blue-500" />
         <StatCard title="Overtime Hours" value={formatDuration(totalOvertime)} icon={<Clock size={20} />} color="bg-purple-500" />
         <StatCard title="Active Logs" value={timesheets.filter(t => t.status === 'Working').length} icon={<Calendar size={20} />} color="bg-green-500" />
         <StatCard title="Completed Shifts" value={timesheets.filter(t => t.status === 'Completed' || t.status === 'Overtime').length} icon={<Calendar size={20} />} color="bg-orange-500" />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-white/50">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search employee..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50"
            >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
            </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Clock In</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Clock Out</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTimesheets.length > 0 ? filteredTimesheets.map(ts => (
                <tr key={ts.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 text-sm">{ts.employeename}</td>
                  <td className="p-4 text-sm text-slate-600">{ts.date}</td>
                  <td className="p-4 text-sm text-slate-600 font-mono">
                    {new Date(ts.clockin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">
                    {ts.clockout ? new Date(ts.clockout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-800 font-medium">
                    {formatDuration(ts.duration)}
                  </td>
                  <td className="p-4">
                     <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        ts.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                        ts.status === 'Overtime' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                        {ts.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 italic">
                      {ts.description || '-'}
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                            <Clock size={32} className="text-slate-300 mb-2" />
                            <p>No timesheets found for this period</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Timesheets;