import React, { useState } from 'react';
import { 
  Search, Plus, Edit, Trash2, Eye, X, ArrowRightLeft, 
  Users, CheckCircle, Building2, Clock, Phone, Mail, MapPin, 
  Monitor, FileText, DollarSign, Receipt, Briefcase, Calendar,
  CreditCard, ExternalLink, Download, ArrowUpRight, AlertCircle
} from 'lucide-react';
import { Employee, StatCardProps, EmployeeListProps, LeaveRequest, Asset, Branch, AttendanceRecord, PayrollRecord, Reimbursement } from '../types';
import Departments from './Departments';

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between transition-all hover:shadow-xl hover:translate-y-[-2px]">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-current/20`}>
        {icon}
      </div>
    </div>
);

const EmployeeList: React.FC<EmployeeListProps & { onTransferEmployee?: (empId: string, branchId: string) => void }> = ({ 
    user, branches = [], employees, assets, leaves, departments, systemConfig, attendance, payrollRecords, reimbursements,
    onAddEmployee, onUpdateEmployee, onDeleteEmployee, onTransferEmployee,
    onAddDepartment, onUpdateDepartment, onDeleteDepartment
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'leave_requests' | 'departments'>('directory');
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [branchFilter, setBranchFilter] = useState('All');
    const [sortBy, setSortBy] = useState<'name' | 'branch' | 'department' | 'status'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'attendance' | 'assets' | 'payroll' | 'claims'>('overview');
    const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
    const [showDeptInput, setShowDeptInput] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
        const [addingDept, setAddingDept] = useState(false);
  const [transferEmployee, setTransferEmployee] = useState<Employee | null>(null);
  const [selectedBranchForTransfer, setSelectedBranchForTransfer] = useState('');

  const isHR = user.role === 'admin' || user.role === 'super_admin' || user.role === 'hr';

    let filteredEmployees = employees.filter(emp => 
        (emp.name?.toLowerCase().includes(searchTerm?.toLowerCase()) || emp.employeeid?.toLowerCase().includes(searchTerm?.toLowerCase())) &&
        (departmentFilter === 'All' || emp.department === departmentFilter) &&
        (branchFilter === 'All' || emp.branchid === branchFilter)
    );

    // Sorting
    filteredEmployees = filteredEmployees.sort((a, b) => {
        let valA, valB;
        switch (sortBy) {
            case 'branch':
                const branchA = branches.find(br => br.id === a.branchId);
                const branchB = branches.find(br => br.id === b.branchId);
                valA = (branchA?.name || 'Unassigned').toLowerCase();
                valB = (branchB?.name || 'Unassigned').toLowerCase();
                break;
            case 'department':
                valA = (a.department || '').toLowerCase();
                valB = (b.department || '').toLowerCase();
                break;
            case 'status':
                valA = (a.status || '').toLowerCase();
                valB = (b.status || '').toLowerCase();
                break;
            default:
                valA = (a.name || '').toLowerCase();
                valB = (b.name || '').toLowerCase();
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

  const filteredLeaves = leaves.filter(l => (l.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()));

//   const handleUpdate = (e: React.FormEvent) => {
//       e.preventDefault();
//       if (editEmployee) {
//           onUpdateEmployee(editEmployee);
//           setEditEmployee(null);
//       }
//   };

const handleUpdate = (e: React.FormEvent) => {
  e.preventDefault();
  if (!editEmployee) return;

  if (!window.confirm('Are you sure you want to update this employee?')) return;

  const cleaned = {
    id: editEmployee.id, // ONLY PK
    name: editEmployee.name,
    email: editEmployee.email,
    phone: editEmployee.phone,
    designation: editEmployee.designation,
    department: editEmployee.department,
    status: editEmployee.status,
    employeeid: editEmployee.employeeid,
    branchid: editEmployee.branchid || editEmployee.branchId,
    joindate: editEmployee.joindate || editEmployee.joinDate,
    avatar: editEmployee.avatar ?? null
  };

  onUpdateEmployee(cleaned);

  setEditEmployee(null);
};


const calculateLeaveDays = (start: string, end: string) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Normalize to midnight to avoid timezone issues
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays > 0 ? diffDays : 0;
};



  const handleTransfer = () => {
      if (transferEmployee && selectedBranchForTransfer && onTransferEmployee) {
          onTransferEmployee(transferEmployee.id, selectedBranchForTransfer);
          setTransferEmployee(null);
      }
  };

  const ProfileTabButton = ({ id, label, icon: Icon }: { id: typeof profileTab, label: string, icon: any }) => (
    <button 
      onClick={() => setProfileTab(id)}
      className={`flex items-center gap-2 py-2.5 px-5 text-xs font-semibold transition-all whitespace-nowrap relative border-b-2 ${
        profileTab === id 
          ? 'text-blue-600 border-blue-600 bg-white' 
          : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-white/50'
      }`}
    >
        <Icon size={15} />
        <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-slate-800 tracking-tight">Workforce Hub</h1>
          <p className="text-slate-500 text-sm font-medium">Provision profiles, manage talent units and organizational structures.</p>
        </div>
        {isHR && (
            <button 
                onClick={onAddEmployee} 
                className="bg-accent-500 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-accent-600 shadow-xl shadow-orange-500/20 transition-all font-black uppercase text-[11px] tracking-widest"
            >
                <Plus size={18} /> <span>Add New Talent</span>
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Staff" value={employees?.length || 0} icon={<Users size={20} />} color="bg-blue-500" />
          <StatCard title="Active Profiles" value={(employees?.filter(e=>e.status==='Active')?.length) || 0} icon={<CheckCircle size={20} />} color="bg-orange-500" />
          <StatCard title="Departments" value={departments?.length || 0} icon={<Building2 size={20} />} color="bg-purple-500" />
          <StatCard title="Leave Pipeline" value={(leaves?.filter(l=>l.status==='Pending')?.length) || 0} icon={<Clock size={20} />} color="bg-orange-500" />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/20 overflow-hidden">
        <div className="border-b border-slate-100 p-2 bg-slate-50/50">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide px-2">
                 {['directory', 'leave_requests', 'departments'].map(t => (
                     <button 
                        key={t} 
                        onClick={() => setActiveTab(t as any)} 
                        className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-white shadow-lg shadow-slate-200/50 text-accent-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                    >
                        {t.replace('_', ' ')}
                    </button>
                 ))}
            </div>
        </div>

        {activeTab === 'directory' && (
            <>
                                <div className="p-6 border-b border-slate-100 bg-white/50 space-y-4">
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Search by name or employee ID..." 
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none text-sm font-medium focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all" 
                                                value={searchTerm} 
                                                onChange={(e) => setSearchTerm(e.target.value)} 
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <select 
                                                value={branchFilter} 
                                                onChange={e => setBranchFilter(e.target.value)} 
                                                className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white transition-all cursor-pointer"
                                            >
                                                <option value="All">All Branches</option>
                                                <option value="">Unassigned</option>
                                                {(branches || []).map(b => <option key={b.id} value={b.id}>{b.name} - {b.city}</option>)}
                                            </select>
                                            <select 
                                                value={departmentFilter} 
                                                onChange={(e) => setDepartmentFilter(e.target.value)} 
                                                className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white transition-all cursor-pointer"
                                            >
                                                <option value="All">All Departments</option>
                                                {(departments || []).map(dep => (
                                                   <option key={dep.id} value={dep.name}>
                                                     {dep.name}
                                                   </option>
                                                ))}

                                            </select>
                                            <select
                                                value={sortBy + '-' + sortDir}
                                                onChange={e => {
                                                    const [by, dir] = e.target.value.split('-');
                                                    setSortBy(by as any);
                                                    setSortDir(dir as any);
                                                }}
                                                className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white transition-all cursor-pointer"
                                            >
                                                <option value="name-asc">Sort: Name (A-Z)</option>
                                                <option value="name-desc">Sort: Name (Z-A)</option>
                                                <option value="branch-asc">Sort: Branch (A-Z)</option>
                                                <option value="branch-desc">Sort: Branch (Z-A)</option>
                                                <option value="department-asc">Sort: Department (A-Z)</option>
                                                <option value="department-desc">Sort: Department (Z-A)</option>
                                                <option value="status-asc">Sort: Status (A-Z)</option>
                                                <option value="status-desc">Sort: Status (Z-A)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-6">Employee</th>
                                <th className="p-6">ID</th>
                                <th className="p-6">Branch</th>
                                <th className="p-6">Unit</th>
                                <th className="p-6">Function</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.map(emp => {
                                const empBranch = branches.find(b => b.id === emp.branchId);
                                return (
                                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => { setViewEmployee(emp); setProfileTab('overview'); }}>
                                    <td className="p-6 flex items-center space-x-4">
                                        <img src={emp.avatar} className="w-10 h-10 rounded-[1rem] border-2 border-white shadow-md object-cover" alt={emp.name}/>
                                        <span className="font-bold text-slate-800 text-sm tracking-tight">{emp.name}</span>
                                    </td>
                                    <td className="p-6 text-[10px] font-black font-mono text-slate-400 uppercase">{emp.id}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 tracking-widest">
                                            {empBranch ? `${empBranch.name}` : 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{emp.department}</td>
                                    <td className="p-6 text-sm text-slate-500 font-medium">{emp.designation}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border tracking-widest ${emp.status === 'Active' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setViewEmployee(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><Eye size={18}/></button>
                                            {isHR && (
                                                <>
                                                    <button onClick={() => setEditEmployee(emp)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><Edit size={18}/></button>
                                                    <button onClick={() => { if(window.confirm('Delete this talent record permanently?')) onDeleteEmployee(emp.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><Trash2 size={18}/></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredEmployees.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center justify-center">
                            <Users size={48} className="text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No matching talent found</p>
                        </div>
                    )}
                </div>
            </>
        )}

        {activeTab === 'leave_requests' && (
            <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <tr><th className="p-6">Talent</th><th className="p-6">Type</th><th className="p-6">Span</th><th className="p-6">Days</th><th className="p-6">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLeaves.map(l => (
                            <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-6 flex items-center gap-4">
                                    <img src={l.employeeAvatar || 'https://ui-avatars.com/api/?name=User'} className="w-10 h-10 rounded-[1rem] border-2 border-white shadow-md object-cover" />
                                    <span className="font-bold text-slate-800 text-sm tracking-tight">{l.employeeName}</span>
                                </td>
                                <td className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{l.leavetype}</td>
                                <td className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.startdate} → {l.enddate}</td>
                                <td className="p-6 text-sm font-black text-slate-700">
                                  {calculateLeaveDays(l.startdate, l.enddate)}
                                </td>

                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border tracking-widest ${
                                        l.status === 'Approved' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        l.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>{l.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'departments' && <Departments departments={departments} employees={employees} branches={branches} onAddDepartment={onAddDepartment} onUpdateDepartment={onUpdateDepartment} onDeleteDepartment={onDeleteDepartment} />}
            {/* Render Departments tab as a full section, not inside the table card */}
            {/* {activeTab === 'departments' && (
                <div className="mt-8">
                    <Departments
                        departments={departments}
                        employees={employees}
                        branches={branches}
                        onAddDepartment={onAddDepartment}
                        onUpdateDepartment={onUpdateDepartment}
                        onDeleteDepartment={onDeleteDepartment}
                    />
                </div>
            )} */}
      </div>

      {/* --- ENHANCED FIXED HEIGHT VIEW MODAL --- */}
      {viewEmployee && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
                  {/* Fixed Header */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-slate-700 to-slate-800 p-5 relative">
                      <button onClick={() => setViewEmployee(null)} className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"><X size={18}/></button>
                      <div className="flex items-center gap-4">
                          <img src={viewEmployee.avatar} className="w-16 h-16 rounded-xl border-2 border-white/40 shadow-lg object-cover" />
                          <div className="flex-1">
                              <h3 className="text-xl font-bold text-white">{viewEmployee.name}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs font-semibold text-white/90 bg-white/20 px-2 py-0.5 rounded-md">{viewEmployee.designation}</span>
                                  <span className="text-xs text-white/70">ID: {viewEmployee.employeeId}</span>
                                  <span className="text-xs text-white/70">•</span>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${viewEmployee.status === 'Active' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}>{viewEmployee.status}</span>
                              </div>
                          </div>
                          {isHR && (
                              <button
                                  onClick={() => {
                                      setTransferEmployee(viewEmployee);
                                      setSelectedBranchForTransfer('');
                                  }}
                                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                              >
                                  <ArrowRightLeft size={14} /> Transfer
                              </button>
                          )}
                      </div>
                  </div>

                  {/* Fixed Height Tabs Bar */}
                  <div className="flex-shrink-0 bg-slate-100 border-b border-slate-200 flex gap-0 px-5">
                      <ProfileTabButton id="overview" label="Overview" icon={Briefcase} />
                      <ProfileTabButton id="attendance" label="Attendance" icon={Clock} />
                      <ProfileTabButton id="assets" label="Assets" icon={Monitor} />
                      <ProfileTabButton id="payroll" label="Payroll" icon={CreditCard} />
                      <ProfileTabButton id="claims" label="Claims" icon={Receipt} />
                  </div>

                  {/* Fixed Height Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-5 bg-slate-50" style={{ minHeight: 0 }}>
                      {profileTab === 'overview' && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Contact Card */}
                              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                      <Mail size={14} className="text-blue-600"/> Contact
                                  </h4>
                                  <div className="space-y-3">
                                      <div className="flex items-start gap-2">
                                          <Mail size={14} className="text-slate-400 mt-0.5"/>
                                          <div>
                                              <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Email</p>
                                              <p className="text-sm font-semibold text-slate-700">{viewEmployee.email}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                          <Phone size={14} className="text-slate-400 mt-0.5"/>
                                          <div>
                                              <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Phone</p>
                                              <p className="text-sm font-semibold text-slate-700">{viewEmployee.phone || 'N/A'}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                          <MapPin size={14} className="text-slate-400 mt-0.5"/>
                                          <div>
                                              <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Location</p>
                                              <p className="text-sm font-semibold text-slate-700">{viewEmployee.location || 'Central HQ'}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Work Info Card */}
                              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                      <Briefcase size={14} className="text-blue-600"/> Work Details
                                  </h4>
                                  <div className="space-y-3">
                                      <div>
                                          <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Department</p>
                                          <p className="text-sm font-semibold text-slate-700">{viewEmployee.department}</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Join Date</p>
                                          <p className="text-sm font-semibold text-slate-700">{viewEmployee.joinDate}</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Branch</p>
                                          <p className="text-sm font-semibold text-slate-700">{branches.find(b => b.id === viewEmployee.branchId)?.name || 'Unassigned'}</p>
                                      </div>
                                  </div>
                              </div>

                              {/* Recent Activity Card */}
                              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                      <Calendar size={14} className="text-blue-600"/> Recent Leaves
                                  </h4>
                                  <div className="space-y-2">
                                      {leaves.filter(l => l.employeeName === viewEmployee.name).slice(0, 3).map(leave => (
                                          <div key={leave.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                                              <div>
                                                  <p className="text-xs font-bold text-slate-700">{leave.type}</p>
                                                  <p className="text-[10px] text-slate-400">{leave.startDate}</p>
                                              </div>
                                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                                  leave.status === 'Approved' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                              }`}>{leave.status}</span>
                                          </div>
                                      ))}
                                      {leaves.filter(l => l.employeeName === viewEmployee.name).length === 0 && 
                                          <div className="text-center py-6"><p className="text-xs text-slate-400">No leave history</p></div>
                                      }
                                  </div>
                              </div>
                          </div>
                      )}

                      {profileTab === 'attendance' && (
                          <div className="space-y-4">
                              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                  <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                          <thead className="bg-slate-50 border-b border-slate-200">
                                              <tr className="text-[10px] font-bold text-slate-500 uppercase">
                                                  <th className="p-3 text-left">Date</th>
                                                  <th className="p-3 text-left">Check In</th>
                                                  <th className="p-3 text-left">Check Out</th>
                                                  <th className="p-3 text-left">Hours</th>
                                                  <th className="p-3 text-right">Status</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                              {attendance.filter(a => (a.employeename || a.employeeName) === viewEmployee.name).slice(0, 10).map(rec => (
                                                  <tr key={rec.id} className="hover:bg-slate-50">
                                                      <td className="p-3 font-medium text-slate-700">{rec.date}</td>
                                                      <td className="p-3 font-mono text-xs text-slate-600">{rec.checkin}</td>
                                                      <td className="p-3 font-mono text-xs text-slate-600">{rec.checkout}</td>
                                                      <td className="p-3 font-semibold text-blue-600">{rec.workhours}</td>
                                                      <td className="p-3 text-right">
                                                          <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold">{rec.status}</span>
                                                      </td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  </div>
                                  {attendance.filter(a => (a.employeename || a.employeeName) === viewEmployee.name).length === 0 && 
                                      <div className="p-12 text-center"><p className="text-sm text-slate-400">No attendance records</p></div>
                                  }
                              </div>
                          </div>
                      )}

                      {profileTab === 'assets' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {assets.filter(a => (a.assignedto || a.assignedTo) === viewEmployee.name).map(asset => (
                                  <div key={asset.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-blue-300 transition-all">
                                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                          <Monitor size={20}/>
                                      </div>
                                      <div className="flex-1">
                                          <p className="text-sm font-bold text-slate-800">{asset.name}</p>
                                          <p className="text-xs text-slate-400 font-mono">{asset.serialnumber}</p>
                                      </div>
                                  </div>
                              ))}
                              {assets.filter(a => (a.assignedto || a.assignedTo) === viewEmployee.name).length === 0 && 
                                  <div className="col-span-2 py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                                      <p className="text-sm text-slate-400">No assets assigned</p>
                                  </div>
                              }
                          </div>
                      )}

                      {profileTab === 'payroll' && (
                          <div className="space-y-3">
                              {payrollRecords.filter(p => (p.employeeId || p.employeeid) === (viewEmployee.id || viewEmployee.employeeId)).map(pay => (
                                  <div key={pay.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center hover:border-green-300 transition-all">
                                      <div className="flex items-center gap-3">
                                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                              <FileText size={18}/>
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-800">{pay.month}</p>
                                              <p className="text-xs text-slate-400">Paid: {pay.paymentDate || 'Settled'}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-lg font-bold text-slate-800">${pay.netSalary.toLocaleString()}</p>
                                          <button className="text-xs text-blue-600 font-medium hover:underline">Download</button>
                                      </div>
                                  </div>
                              ))}
                              {payrollRecords.filter(p => (p.employeeId || p.employeeid) === (viewEmployee.id || viewEmployee.employeeId)).length === 0 && 
                                  <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                                      <p className="text-sm text-slate-400">No payroll records</p>
                                  </div>
                              }
                          </div>
                      )}

                      {profileTab === 'claims' && (
                          <div className="space-y-3">
                              {reimbursements.filter(r => (r.employeeName || r.employeename) === viewEmployee.name).map(claim => (
                                  <div key={claim.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center hover:border-purple-300 transition-all">
                                      <div className="flex items-center gap-3">
                                          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                              <Receipt size={18}/>
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{claim.description}</p>
                                              <p className="text-xs text-slate-400">{claim.date} • {claim.type}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-lg font-bold text-slate-800">${claim.amount.toLocaleString()}</p>
                                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                              claim.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                              claim.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                              'bg-yellow-100 text-yellow-700'
                                          }`}>{claim.status}</span>
                                      </div>
                                  </div>
                              ))}
                              {reimbursements.filter(r => (r.employeeName || r.employeename) === viewEmployee.name).length === 0 && 
                                  <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                                      <p className="text-sm text-slate-400">No claims submitted</p>
                                  </div>
                              }
                          </div>
                      )}
                  </div>

                  {/* Fixed Footer with Actions */}
                  <div className="flex-shrink-0 p-3 bg-white border-t border-slate-200 flex justify-between items-center">
                      <div className="text-xs text-slate-400">
                          Branch: <span className="font-semibold text-slate-600">{branches.find(b => b.id === viewEmployee.branchId)?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex gap-2">
                          {isHR && (
                              <button 
                                  onClick={() => {
                                      setEditEmployee({
                                      id: viewEmployee.id,
                                      name: viewEmployee.name,
                                      email: viewEmployee.email,
                                      phone: viewEmployee.phone,
                                      designation: viewEmployee.designation,
                                      department: viewEmployee.department,
                                      status: viewEmployee.status,
                                      employeeid: viewEmployee.employeeid,
                                      branchid: viewEmployee.branchid,
                                      joindate: viewEmployee.joindate,
                                      avatar: viewEmployee.avatar
                                    });

                                      setViewEmployee(null);
                                  }}
                                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-1"
                              >
                                  <Edit size={14} /> Edit
                              </button>
                          )}
                          <button 
                              onClick={() => setViewEmployee(null)} 
                              className="px-5 py-2 bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all"
                          >
                              Close
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* TRANSFER EMPLOYEE MODAL */}
      {transferEmployee && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[160] p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-5 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <ArrowRightLeft size={18} className="text-[#f97316]" />
                          Transfer Employee
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Move {transferEmployee.name} to a different branch</p>
                  </div>
                  <div className="p-5 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-600 block mb-2">Current Branch</label>
                          <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-sm font-semibold text-slate-700">
                                  {branches.find(b => b.id === transferEmployee.branchId)?.name || 'Unassigned'}
                              </p>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-600 block mb-2">Transfer To</label>
                          <select 
                              value={selectedBranchForTransfer}
                              onChange={(e) => setSelectedBranchForTransfer(e.target.value)}
                              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:border-[#f97316] outline-none transition-all"
                          >
                              <option value="">Select destination branch</option>
                              {branches.filter(b => b.id !== transferEmployee.branchId).map(branch => (
                                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                              ))}
                          </select>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-xs text-orange-800 font-medium flex items-start gap-2">
                              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                              <span>This will transfer all employee data including attendance, assets, payroll records, and claims to the new branch.</span>
                          </p>
                      </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2 justify-end">
                      <button 
                          onClick={() => {
                              setTransferEmployee(null);
                              setSelectedBranchForTransfer('');
                          }}
                          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleTransfer}
                          disabled={!selectedBranchForTransfer}
                          className="px-5 py-2 bg-[#f97316] text-white rounded-lg text-xs font-semibold hover:bg-[#ea580c] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                          <ArrowRightLeft size={14} />
                          Confirm Transfer
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODALS: Edit & Provisioning handled here as well, following the same glass-card styling */}
            {editEmployee && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Update Profile</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{editEmployee.name}</p>
                            </div>
                            <button onClick={() => setEditEmployee(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white border rounded-xl"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Full Name</label>
                                        <input type="text" value={editEmployee.name} onChange={e=>setEditEmployee({...editEmployee, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-accent-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Designation</label>
                                        <input type="text" value={editEmployee.designation || ''} onChange={e=>setEditEmployee({...editEmployee, designation: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-accent-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Email</label>
                                        <input type="email" value={editEmployee.email || ''} onChange={e=>setEditEmployee({...editEmployee, email: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-accent-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Phone</label>
                                        <input type="text" value={editEmployee.phone || ''} onChange={e=>setEditEmployee({...editEmployee, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-accent-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Avatar URL</label>
                                        <input type="text" value={editEmployee.avatar || ''} onChange={e=>setEditEmployee({...editEmployee, avatar: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-accent-500 transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Employee ID</label>
                                        <input type="text" value={editEmployee.id || ''} onChange={e=>setEditEmployee({...editEmployee, employeeId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-accent-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Unit / Department</label>
                                        <div className="flex gap-2">
                                            <select value={editEmployee.department} onChange={e=>setEditEmployee({...editEmployee, department: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none">
                                                {(departments || []).map(dep => (
                                                   <option key={dep.id} value={dep.name}>
                                                     {dep.name}
                                                   </option>
                                                ))}

                                            </select>
                                            <button type="button" className="px-3 py-2 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600" onClick={()=>setShowDeptInput(v=>!v)} title="Add Department">+</button>
                                        </div>
                                        {showDeptInput && (
                                            <div className="flex gap-2 mt-2">
                                                <input type="text" value={newDeptName} onChange={e=>setNewDeptName(e.target.value)} placeholder="New department name" className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-bold text-slate-700 focus:border-accent-500 outline-none" />
                                                <button type="button" className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700" onClick={async () => {
                                                    if (newDeptName && !systemConfig.departments.includes(newDeptName)) {
                                                        try {
                                                            await onAddDepartment({
                                                                id: `dept-${Date.now()}`,
                                                                name: newDeptName,
                                                                manager: '',
                                                                employeeCount: 0,
                                                                location: '',
                                                                status: 'Active'
                                                            });
                                                            // Force refresh of department list and systemConfig
                                                            if (window.location) {
                                                                // Quick hack: reload to force full refresh if all else fails
                                                                window.location.reload();
                                                            }
                                                            setEditEmployee({...editEmployee, department: newDeptName});
                                                            setNewDeptName('');
                                                            setShowDeptInput(false);
                                                        } catch (err) {
                                                            alert('Failed to add department.');
                                                        }
                                                    }
                                                }}>Add</button>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Status</label>
                                        <select value={editEmployee.status} onChange={e=>setEditEmployee({...editEmployee, status: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none">
                                            <option>Active</option>
                                            <option>On Leave</option>
                                            <option>Terminated</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Join Date</label>
                                        <input type="date" value={editEmployee.joinDate || ''} onChange={e=>setEditEmployee({...editEmployee, joinDate: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-accent-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Branch / Location</label>
                                        <select
                                          value={editEmployee.branchid || ''}
                                          onChange={e =>
                                            setEditEmployee({ ...editEmployee, branchid: e.target.value })
                                          }
                                        >
                                          {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                          ))}
                                        </select>

                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-2xl mt-4">Commit Changes</button>
                        </form>
                    </div>
                </div>
            )}
    </div>
  );
};

export default EmployeeList;