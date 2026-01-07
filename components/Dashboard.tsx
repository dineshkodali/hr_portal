
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  ClipboardCheck, 
  Briefcase,
  Lock,
  Edit,
  Trash2,
  X,
  Save,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { StatCardProps, DashboardProps, User, Task, TaskStatus, AttendanceRecord } from '../types';

interface DashboardComponentProps extends DashboardProps {
  user: User;
  attendance?: AttendanceRecord[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 p-6 hover:shadow-xl transition-all border border-white/20 ${onClick ? 'cursor-pointer hover:bg-white' : 'cursor-default'}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-tight">
          <span className={trendUp ? "text-orange-500" : "text-red-500"}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    )}
  </div>
);

// Changed children to optional to fix "children prop missing" error
const ModalBackdrop = ({ children, onClose }: { children?: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-in zoom-in duration-200 overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full z-20 transition-all">
              <X size={20} />
          </button>
          {children}
      </div>
  </div>
);

const Dashboard: React.FC<DashboardComponentProps> = ({ onNavigate, employees, tasks, leaves, jobs, user, onUpdateTask, onDeleteTask, attendance }) => {
  const [chartFilter, setChartFilter] = useState('All');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const recentHires = [...employees].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()).slice(0, 5);
  const onLeaveToday = leaves.filter(l => l.status === 'Approved').length; 
  const openPositions = jobs.filter(j => j.status === 'Active').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Done').length;
  
  const isEmployee = user.role === 'employee';

  // Build chart data from `attendance` prop when available. Fallback to empty dataset.
  let chartData: { name: string; present: number; absent: number; leave: number }[] = [];
  if (attendance && attendance.length > 0) {
    // Aggregate by date (keep up to 7 recent days)
    const grouped: Record<string, { present: number; absent: number; leave: number }> = {};
    attendance.slice().reverse().forEach(a => {
      const day = a.date;
      if (!grouped[day]) grouped[day] = { present: 0, absent: 0, leave: 0 };
      if (a.status === 'Present') grouped[day].present += 1;
      else if (a.status === 'Absent') grouped[day].absent += 1;
      else if (a.status === 'On Leave') grouped[day].leave += 1;
      else if (a.status === 'Late') grouped[day].present += 1;
    });
    chartData = Object.keys(grouped).slice(0, 7).map(d => ({ name: d, ...grouped[d] }));
  }

  const handleStatusChange = (task: Task, newStatus: string) => {
    if (onUpdateTask) {
        onUpdateTask({ ...task, status: newStatus as TaskStatus });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && onUpdateTask) {
        onUpdateTask(editingTask);
        setEditingTask(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Business Dashboard</h1>
          <p className="text-slate-500 mt-1">Unified command center for workforce and projects.</p>
        </div>
        <button 
            onClick={() => onNavigate('tasks')}
            className="bg-accent-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-600 shadow-lg shadow-orange-500/20 transition-all"
        >
            + Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Workforce Size" 
          value={activeEmployees} 
          trend={!isEmployee ? "12%" : undefined} 
          trendUp={true} 
          icon={<Users size={24} />} 
          color="bg-blue-500" 
          onClick={!isEmployee ? () => onNavigate('employees') : undefined}
        />
        <StatCard 
          title="Talent Pipeline" 
          value={openPositions} 
          trend={!isEmployee ? "4" : undefined} 
          trendUp={true} 
          icon={<Briefcase size={24} />} 
          color="bg-orange-500"
          onClick={!isEmployee ? () => onNavigate('recruitment') : undefined}
        />
        <StatCard 
          title="On Vacation" 
          value={onLeaveToday} 
          icon={<Calendar size={24} />} 
          color="bg-orange-400" 
          onClick={() => onNavigate('attendance')}
        />
        <StatCard 
          title="Open Tasks" 
          value={pendingTasksCount} 
          icon={<ClipboardCheck size={24} />} 
          color="bg-purple-500" 
          onClick={() => onNavigate('tasks')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Attendance Dynamics</h3>
              {!isEmployee && (
                  <select 
                    value={chartFilter}
                    onChange={(e) => setChartFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase outline-none focus:border-accent-500"
                  >
                      <option value="All">Organization Wide</option>
                  </select>
              )}
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase'}} />
                <Bar dataKey="present" fill="#3B82F6" radius={[6, 6, 0, 0]} name="In Office" barSize={24} />
                <Bar dataKey="absent" fill="#EF4444" radius={[6, 6, 0, 0]} name="Absent" barSize={24} />
                <Bar dataKey="leave" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Approved Leave" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Internal Bulletin</h3>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-blue-200">HR Alert</span>
                    <span className="text-[10px] text-slate-400 font-bold">2h ago</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Update: Q4 Performance Cycle</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Review sessions start next Monday. Ensure all project documentation is finalized.</p>
            </div>
            
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 hover:bg-orange-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-orange-200">Social</span>
                    <span className="text-[10px] text-slate-400 font-bold">5h ago</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Town Hall Meeting</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Join the global leadership team for the monthly product roadmap sync.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">New Members</h3>
                  {!isEmployee && (
                      <button onClick={() => onNavigate('employees')} className="text-xs font-black uppercase text-accent-600 hover:text-accent-700 tracking-widest">Directory</button>
                  )}
              </div>
              
              {isEmployee ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Lock size={24} className="mb-2 opacity-30" />
                      <p className="text-xs font-bold uppercase tracking-widest">Restricted Access</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead>
                              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                                  <th className="pb-3 px-2">TALENT</th>
                                  <th className="pb-3">FUNCTION</th>
                                  <th className="pb-3 text-right">JOINED</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {recentHires.map(emp => (
                                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => onNavigate('employees')}>
                                      <td className="py-3 px-2 flex items-center space-x-3">
                                          <img src={emp.avatar} className="w-8 h-8 rounded-xl shadow-sm border border-white" alt=""/>
                                          <span className="font-bold text-slate-700">{emp.name}</span>
                                      </td>
                                      <td className="py-3 text-slate-500 font-medium">{emp.designation}</td>
                                      <td className="py-3 text-right text-slate-400 text-xs font-bold">{new Date(emp.joinDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Active Task Hub</h3>
                  <button onClick={() => onNavigate('tasks')} className="text-xs font-black uppercase text-accent-600 hover:text-accent-700 tracking-widest">Board View</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                              <th className="pb-3 px-2">MISSION</th>
                              <th className="pb-3">OWNER</th>
                              <th className="pb-3">STATUS</th>
                              <th className="pb-3 text-right">ACTION</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {tasks.slice(0, 5).map(task => (
                              <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 px-2">
                                      <p className="font-bold text-slate-700 tracking-tight">{task.title}</p>
                                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border mt-1 inline-block ${task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{task.priority}</span>
                                  </td>
                                  <td className="py-3 text-slate-500 font-bold text-xs">{task.assignee}</td>
                                  <td className="py-3">
                                      <select 
                                        value={task.status} 
                                        onChange={(e) => handleStatusChange(task, e.target.value)}
                                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-xl outline-none cursor-pointer border transition-all ${
                                            task.status === 'Done' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                            task.status === 'Review' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}
                                      >
                                          <option value="To Do">TO DO</option>
                                          <option value="In Progress">WORKING</option>
                                          <option value="Review">REVIEW</option>
                                          <option value="Done">DONE</option>
                                      </select>
                                  </td>
                                  <td className="py-3 text-right">
                                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => setEditingTask(task)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-sm"><Edit size={14}/></button>
                                          <button onClick={() => onDeleteTask && onDeleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>

      {/* Task Edit Modal */}
      {editingTask && (
          <ModalBackdrop onClose={() => setEditingTask(null)}>
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Project Task</h3>
              </div>
              <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Task Designation</label>
                      <input 
                        value={editingTask.title} 
                        onChange={e => setEditingTask({...editingTask, title: e.target.value})} 
                        className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl font-bold text-slate-800 outline-none focus:border-accent-500 transition-all"
                        required 
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Execution Notes</label>
                      <textarea 
                        value={editingTask.description} 
                        onChange={e => setEditingTask({...editingTask, description: e.target.value})} 
                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-sm font-medium outline-none focus:border-accent-500 h-32 resize-none"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Current Pipeline</label>
                        <select 
                            value={editingTask.status} 
                            onChange={e => setEditingTask({...editingTask, status: e.target.value as any})}
                            className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl font-bold text-slate-800 outline-none appearance-none"
                        >
                            <option>To Do</option><option>In Progress</option><option>Review</option><option>Done</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Urgency Level</label>
                        <select 
                            value={editingTask.priority} 
                            onChange={e => setEditingTask({...editingTask, priority: e.target.value as any})}
                            className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl font-bold text-slate-800 outline-none appearance-none"
                        >
                            <option>Low</option><option>Medium</option><option>High</option>
                        </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/40 hover:bg-black transition-all">
                      Push Updates
                  </button>
              </form>
          </ModalBackdrop>
      )}
    </div>
  );
};

export default Dashboard;
