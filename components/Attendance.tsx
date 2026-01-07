
import React, { useState } from 'react';
/* Fix: Removed invalid Check import and relied on CheckCircle */
import { Search, Filter, Edit, Trash2, CheckCircle, XCircle, Clock, Calendar, ChevronDown, ChevronUp, X, Save, Eye, FileText, Plus, ThumbsUp, Upload, Download, FileSpreadsheet, Info, AlertTriangle } from 'lucide-react';
import { AttendanceRecord, StatCardProps, Timesheet, AttendanceProps, Shift, LeaveRequest } from '../types';
import Timesheets from './Timesheets';
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

const Attendance: React.FC<AttendanceProps> = ({ 
    user,
    records, timesheets, shifts, leaves,
    onAddRecord, onUpdateRecord, onDeleteRecord, onAddTimesheet,
    onUpdateTimesheet, onDeleteTimesheet,
    onAddShift, onUpdateShift, onDeleteShift,
    onUpdateLeave, onAddLeave
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'present' | 'absent' | 'overtime' | 'timesheets' | 'shifts' | 'leaves'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [recordFormData, setRecordFormData] = useState<Partial<AttendanceRecord>>({});
  
  const [viewRecord, setViewRecord] = useState<AttendanceRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      employee: 'all',
      status: 'all'
  });

  const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
  const [isViewTimesheetOpen, setIsViewTimesheetOpen] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
  const [timesheetFormData, setTimesheetFormData] = useState<Partial<Timesheet>>({});

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftFormData, setShiftFormData] = useState<Partial<Shift>>({});

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState<Partial<LeaveRequest>>({ type: 'Sick Leave', days: 1, attachment: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [viewLeave, setViewLeave] = useState<LeaveRequest | null>(null);

  const isEmployee = user.role === 'employee';
  const canApprove = user.role === 'admin' || user.role === 'manager';

  // Leave Balance Logic
  const LEAVE_LIMITS: Record<string, number> = {
    'Sick Leave': 10,
    'Casual Leave': 12,
    'Earned Leave': 15,
    'Maternity/Paternity Leave': 90
  };

  const calculateUsedLeave = (type: string) => {
    return leaves
        .filter(l => l.employeeName === user.name && l.type === type && l.status === 'Approved')
        .reduce((sum, l) => sum + l.days, 0);
  };

const checkDateFilter = (dateString: string) => {
    if (!dateString) return false;

    const recordDate = new Date(dateString)
        .toISOString()
        .split('T')[0]; //  normalize

    const today = new Date();
    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    );
    const todayStr = localToday.toISOString().split('T')[0];

    if (dateFilter === 'today') return recordDate === todayStr;

    if (dateFilter === 'week') {
        const d = new Date(recordDate);
        const t = new Date(todayStr);
        const weekAgo = new Date(t);
        weekAgo.setDate(t.getDate() - 7);
        return d >= weekAgo && d <= t;
    }

    if (dateFilter === 'month') {
        const d = new Date(recordDate);
        const t = new Date(todayStr);
        return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    }

    return true;
};




  const filteredRecords = records.filter(record => {
      if (isEmployee && record.employeename !== user.name) return false;
      const matchesSearch = (record.employeename || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = checkDateFilter(record.date);
      let matchesTab = true;
      if (activeTab === 'present') matchesTab = record.status === 'Present' || record.status === 'Late';
      if (activeTab === 'absent') matchesTab = record.status === 'Absent' || record.status === 'On Leave';
      if (activeTab === 'overtime') {
          const workhours = record.workhours || '0h';
          const hours = parseInt(workhours.split('h')[0]) || 0;
          matchesTab = hours > 9 || record.overtime !== undefined;
      }
      return matchesSearch && matchesDate && matchesTab;
  });

  const filteredTimesheets = timesheets.filter(ts => {
      if (isEmployee && ts.employeename !== user.name) return false;
      const matchesSearch = (ts.employeename || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = checkDateFilter(ts.date);
      return matchesSearch && matchesDate;
  });

  const filteredLeaves = leaves.filter(l => {
      if (isEmployee && l.employeename !== user.name) return false;
      const employeeMatch = (l.employeename || '').toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = (l.type || '').toLowerCase().includes(searchTerm.toLowerCase());
      return employeeMatch || typeMatch;
  });

  const sortData = (data: any[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  };

  const sortedRecords = sortData(filteredRecords);
  const sortedTimesheets = sortData(filteredTimesheets);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name: string) => {
    if (!sortConfig || sortConfig.key !== name) {
        return <div className="ml-1 text-slate-400 opacity-0 group-hover:opacity-50 transition-opacity"><ChevronDown size={14}/></div>;
    }
    return sortConfig.direction === 'asc' 
        ? <ChevronUp size={14} className="ml-1 text-accent-500"/> 
        : <ChevronDown size={14} className="ml-1 text-accent-500"/>;
  };

  const handleExport = () => {
      const recordsToExport = records.filter(r => {
          const rDate = new Date(r.date);
          const start = new Date(exportFilters.startDate);
          const end = new Date(exportFilters.endDate);
          const inDateRange = rDate >= start && rDate <= end;
          const matchesEmployee = exportFilters.employee === 'all' || r.employeeName === exportFilters.employee;
          const matchesStatus = exportFilters.status === 'all' || r.status === exportFilters.status;
          return inDateRange && matchesEmployee && matchesStatus;
      });
      const headers = ['Employee Name', 'Date', 'Status', 'Check In', 'Check Out', 'Work Hours'];
      const csvContent = [headers.join(','), ...recordsToExport.map(r => `${r.employeename},${r.date},${r.status},${r.checkin},${r.checkout},${r.workhours}`)].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_report_${exportFilters.startDate}_to_${exportFilters.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportModalOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          alert(`Successfully imported logs from ${e.target.files[0].name}`);
      }
  };

  const handleEditRecordClick = (record: AttendanceRecord) => {
      setEditingRecord(record);
      setRecordFormData(record);
      setIsModalOpen(true);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(editingRecord && recordFormData.date) {
          onUpdateRecord({ ...editingRecord, ...recordFormData as AttendanceRecord });
          setIsModalOpen(false);
          setEditingRecord(null);
      }
  };

  const handleEditTimesheetClick = (ts: Timesheet) => {
      setEditingTimesheet(ts);
      setTimesheetFormData(ts);
      setIsTimesheetModalOpen(true);
  };

  const handleViewTimesheetClick = (ts: Timesheet) => {
      setEditingTimesheet(ts);
      setIsViewTimesheetOpen(true);
  };

  const handleTimesheetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingTimesheet) {
          // Ensure employeeId is always present
          const updated = { ...editingTimesheet, ...timesheetFormData as Timesheet };
          if (!updated.employeeId) {
              updated.employeeId = user.id;
          }
          onUpdateTimesheet(updated);
          setIsTimesheetModalOpen(false);
          setEditingTimesheet(null);
      }
  };

  const handleApproveTimesheet = (ts: Timesheet) => {
      onUpdateTimesheet({ ...ts, status: 'Approved' });
  };

  const handleAddShiftClick = () => {
    setEditingShift(null);
    setShiftFormData({ name: '', startTime: '', endTime: '', days: [], assignedCount: 0 });
    setIsShiftModalOpen(true);
  };

  const handleEditShiftClick = (shift: Shift) => {
    setEditingShift(shift);
    setShiftFormData(shift);
    setIsShiftModalOpen(true);
  };

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(shiftFormData.name && shiftFormData.startTime) {
        if(editingShift) onUpdateShift({ ...editingShift, ...shiftFormData as Shift });
        else onAddShift({ id: `sh-${Date.now()}`, name: shiftFormData.name || '', startTime: shiftFormData.startTime || '', endTime: shiftFormData.endTime || '', days: shiftFormData.days || [], assignedCount: 0 });
        setIsShiftModalOpen(false);
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (leaveFormData.startDate && leaveFormData.endDate) {
          // Check balance before submitting
          const used = calculateUsedLeave(leaveFormData.type || 'Sick Leave');
          const limit = LEAVE_LIMITS[leaveFormData.type || 'Sick Leave'];
          if (used + (leaveFormData.days || 1) > limit) {
              if (!window.confirm("You are exceeding your leave balance. Continue anyway?")) return;
          }

          onAddLeave({
              id: `lv-${Date.now()}` ,
              employeename: user.name,
              employeeid:user.id,
            //   employeeAvatar: user.avatar,
              leavetype: leaveFormData.type || 'Sick Leave',
              startDate: leaveFormData.startDate,
              endDate: leaveFormData.endDate,
            //   days: leaveFormData.days || 1,
              reason: leaveFormData.reason || '',
              status: 'Pending',
            //   attachment: selectedFile ? selectedFile.name : '',
            //   appliedDate: new Date().toISOString().split('T')[0]
          });
          setIsLeaveModalOpen(false);
          setLeaveFormData({ type: 'Sick Leave', days: 1, attachment: '' });
          setSelectedFile(null);
      }
  };

  const handleViewLeave = (leave: LeaveRequest) => setViewLeave(leave);
  const sanitizeLeaveForUpdate = (leave: LeaveRequest, status: string) => {
    const {
        created_at,
        updated_at,
        ...safeLeave
    } = leave as any;

    return {
        ...safeLeave,
        status
    };
};


  const formatDuration = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
  };

  const uniqueEmployees = Array.from(new Set(records.map(r => r.employeeName)));

  // Balance Indicator Color Helper
  const getBalanceColor = (used: number, limit: number) => {
      const remaining = limit - used;
      if (remaining <= 0) return 'text-red-500 bg-red-50 border-red-100';
      if (remaining <= 2) return 'text-orange-500 bg-orange-50 border-orange-100';
      return 'text-orange-600 bg-orange-50 border-orange-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEmployee ? 'My Attendance' : 'Attendance & Timesheets'}</h1>
          <p className="text-slate-500 mt-1">{isEmployee ? 'View your logs, apply for leave, and check shifts.' : 'Monitor daily logs, approve timesheets, and manage shifts.'}</p>
        </div>
        
        <div className="flex space-x-2">
            <button 
                onClick={() => { setLeaveFormData({ type: 'Sick Leave', days: 1, attachment: '' }); setSelectedFile(null); setIsLeaveModalOpen(true); }} 
                className="bg-accent-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-accent-600 transition-all shadow-lg shadow-orange-500/20 font-bold"
            >
                <Plus size={18} /> <span>Apply Leave</span>
            </button>
            {!isEmployee && (
                <>
                    <div className="relative group">
                        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition-colors shadow-sm">
                            <Upload size={18} /> <span>Import Logs</span>
                        </button>
                        <input type="file" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.xlsx" />
                    </div>
                    <button 
                        onClick={() => setIsExportModalOpen(true)} 
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                    >
                        <Download size={18} /> <span>Export Report</span>
                    </button>
                </>
            )}
        </div>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard title="Present Days" value={filteredRecords.filter(r => r.status === 'Present').length} icon={<CheckCircle size={20} />} color="bg-orange-500" />
         <StatCard title="Absent/Leave" value={filteredRecords.filter(r => r.status === 'Absent' || r.status === 'On Leave').length} icon={<XCircle size={20} />} color="bg-red-500" />
         <StatCard title="Total Hours (Day)" value={timesheets.filter(t => checkDateFilter(t.date) && (!isEmployee || t.employeeName === user.name)).reduce((acc, curr) => acc + curr.duration/60, 0).toFixed(1)} icon={<Clock size={20} />} color="bg-blue-500" />
         <StatCard title="Pending Approvals" value={!isEmployee ? filteredTimesheets.filter(t => t.status === 'Pending').length + filteredLeaves.filter(l => l.status === 'Pending').length : filteredLeaves.filter(l => l.status === 'Pending').length} icon={<Calendar size={20} />} color="bg-orange-500" />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
        <div className="border-b border-slate-100 p-2 bg-slate-50/50">
             <div className="flex items-center space-x-1 overflow-x-auto">
                 <button onClick={() => setActiveTab('all')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white shadow-sm text-accent-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>All Logs</button>
                 {!isEmployee && (
                    <>
                        <button onClick={() => setActiveTab('present')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'present' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Working Now</button>
                        <button onClick={() => setActiveTab('absent')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'absent' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Absent / Leave</button>
                        <button onClick={() => setActiveTab('overtime')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'overtime' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Overtime</button>
                    </>
                 )}
                 <button onClick={() => setActiveTab('timesheets')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'timesheets' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Timesheets</button>
                 <button onClick={() => setActiveTab('shifts')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'shifts' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Shifts</button>
                 <button onClick={() => setActiveTab('leaves')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'leaves' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Leaves</button>
            </div>
        </div>
        
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-white/50">
            {(activeTab !== 'timesheets') && (
               <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            )}
            {(activeTab !== 'shifts' && activeTab !== 'leaves' && activeTab !== 'timesheets') && (
                <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50 font-medium"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                </select>
            )}
            
        </div>

        {/* Main Records Table */}
        {(activeTab === 'all' || activeTab === 'present' || activeTab === 'absent' || activeTab === 'overtime') && (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer group" onClick={() => requestSort('employeename')}>Employee {getSortIcon('employeename')}</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer group" onClick={() => requestSort('date')}>Date {getSortIcon('date')}</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Work Hours</th>
                        {!isEmployee && <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {sortedRecords.length > 0 ? sortedRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                            <div className="flex items-center space-x-3">
                                <img
                                  src={
                                    record.employeeavatar ||
                                    `https://ui-avatars.com/api/?name=${record.employeename}`
                                  }
                                />

                                <span className="font-semibold text-slate-800 text-sm">{record.employeename}</span>
                            </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-medium">{record.date}</td>
                        <td className="p-4 text-sm text-slate-600 font-mono">{record.checkin}</td>
                        <td className="p-4 text-sm text-slate-600 font-mono">{record?.checkout}</td>
                        <td className="p-4">
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${
                            record.status === 'Present' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-100' :
                            record.status === 'Late' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            'bg-orange-50 text-orange-700 border-orange-100'
                            }`}>
                            {record.status}
                            </span>
                        </td>
                        <td className="p-4 text-sm text-slate-800 font-bold">{record.workhours}</td>
                        {!isEmployee && (
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                    <button onClick={() => setViewRecord(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={16} /></button>
                                    <button onClick={() => handleEditRecordClick(record)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"><Edit size={16} /></button>
                                    <button onClick={() => { if(window.confirm('Are you sure?')) onDeleteRecord(record.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        )}
                        </tr>
                    )) : (
                        <tr><td colSpan={7} className="p-12 text-center text-slate-400 italic">No attendance records found for this period.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'leaves' && (
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <th className="p-4">Employee</th>
                             <th className="p-4">Type</th>
                             <th className="p-4">Duration</th>
                             <th className="p-4">Reason</th>
                             <th className="p-4">Status</th>
                             <th className="p-4 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {filteredLeaves.map(leave => (
                             <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                                 <td className="p-4 flex items-center space-x-3">
                                     <img src={leave?.employeeAvatar || `https://ui-avatars.com/api/?name=${leave.employeename}&background=random`} className="w-8 h-8 rounded-full border border-white shadow-sm" />
                                     <span className="font-bold text-slate-800 text-sm">{leave.employeename}</span>
                                 </td>
                                 <td className="p-4 text-xs font-bold text-slate-500 uppercase">{leave.leavetype}</td>
                                 <td className="p-4 text-sm text-slate-600">
                                     {leave.startdate} to {leave.enddate} <span className="text-[10px] font-black text-slate-400 uppercase ml-1">({leave.days} d)</span>
                                 </td>
                                 <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{leave.reason}</td>
                                 <td className="p-4">
                                     <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-lg border ${
                                       leave.status === 'Approved' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                         leave.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                         'bg-yellow-50 text-yellow-700 border-yellow-100'
                                     }`}>
                                         {leave.status}
                                     </span>
                                 </td>
                                 <td className="p-4 text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                        <button onClick={() => handleViewLeave(leave)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={16} /></button>
                                        {canApprove && (
                                            <>
                                                {/* Fix: Replaced missing Check icon with CheckCircle */}
                                                <button
                                                   onClick={() =>
                                                     onUpdateLeave(sanitizeLeaveForUpdate(leave, 'Approved'))
                                                   }
                                                   className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                >
                                                  <CheckCircle size={16} />
                                                </button>
                                                
                                                <button
                                                  onClick={() =>
                                                    onUpdateLeave(sanitizeLeaveForUpdate(leave, 'Rejected'))
                                                  }
                                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                  <XCircle size={16} />
                                                </button>

                                            </>
                                        )}
                                    </div>
                                </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        )}

        {activeTab === 'timesheets' && <Timesheets timesheets={timesheets} onAddTimesheet={onAddTimesheet} />}


      </div>

       {/* Enhanced Apply Leave Modal with Balance Indicators */}
       {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col" style={{ minWidth: 340 }}>
            <div className="px-6 pt-6 pb-2 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Apply Leave</h2>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={22}/></button>
            </div>
            {/* Leave Balance Summary */}
            <div className="px-6 pt-4 pb-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Balance Summary</span>
                <span className="text-xs font-bold text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">FY 2024</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(LEAVE_LIMITS).map(([type, limit]) => {
                  const used = calculateUsedLeave(type);
                  const colorClass = getBalanceColor(used, limit);
                  return (
                    <div key={type} className={`p-2 rounded-lg border text-xs transition-all ${colorClass} ${leaveFormData.type === type ? 'ring-2 ring-orange-400/20 shadow' : 'opacity-80'}`}>
                      <p className="font-bold uppercase truncate mb-1" title={type}>{type.replace(' Leave', '')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold">{limit - used}</span>
                        <span className="text-[10px] font-bold opacity-60">/ {limit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <form onSubmit={handleLeaveSubmit} className="px-6 py-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Leave Type</label>
                <select value={leaveFormData.type} onChange={e => setLeaveFormData({...leaveFormData, type: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100">
                  {Object.keys(LEAVE_LIMITS).map(type => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                  <input value={leaveFormData.startDate || ''} onChange={e => setLeaveFormData({...leaveFormData, startDate: e.target.value})} type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100" required />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                  <input value={leaveFormData.endDate || ''} onChange={e => setLeaveFormData({...leaveFormData, endDate: e.target.value})} type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Days</label>
                <input value={leaveFormData.days} onChange={e => setLeaveFormData({...leaveFormData, days: Number(e.target.value)})} type="number" min="1" className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Reason</label>
                <textarea value={leaveFormData.reason || ''} onChange={e => setLeaveFormData({...leaveFormData, reason: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100" rows={2} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Attachment (optional)</label>
                <input type="file" id="leave-file-upload" className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100" onChange={e => { if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
                {selectedFile && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                    <span>{selectedFile.name}</span>
                    <button type="button" className="text-red-500 ml-2" onClick={() => setSelectedFile(null)}>Remove</button>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full mt-2 bg-orange-500 text-white font-bold py-3 rounded-xl text-base shadow hover:bg-orange-600 transition-all">Confirm &amp; Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
