// Copyright (c) 2026 SD Commercial. All rights reserved.
// This application and its content are the exclusive property of SD Commercial.
// Unauthorized use, reproduction, or distribution is strictly prohibited.

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import EmployeeList from './EmployeeList';
import Login from './Login';
import AddEmployee from './AddEmployee';
import Recruitment from './Recruitment';
import AssetManagement from './AssetManagement';
import FileManager from './FileManager';
import TaskBoard from './TaskBoard';
// Fix: Changed Settings to a named import to match its definition and fix the default export error
import Settings from './Settings';
import Attendance from './Attendance';
import Payroll from './Payroll';
import ActivityLogs from './ActivityLogs';
import TeamManagement from './TeamManagement';
import Handbook from './Handbook';
import HolidayCalendar from './HolidayCalendar';
import Reports from './Reports';
import { WifiOff, Lock } from 'lucide-react';
import PasswordManager from './PasswordManager';
import { User, ViewState, Employee, Job, Candidate, Asset, Task, LeaveRequest, AttendanceRecord, Department, Timesheet, Shift, PayrollRecord, SystemConfig, EmailTemplate, SmtpSettings, Reimbursement, Branch, NotificationSetting, ActivityLog, Group, Team, PolicyCategory, PolicyDocument, Holiday, FileItem } from '../types';
import { api } from '../services/api';

// Global state to track server availability across the app
let globalServerAvailable = false;

// --- Custom Hook for API Data Fetching with Offline Support ---
const useApiData = <T,>(endpoint: string, defaultValue: T, serverConnected: boolean | null): [T, () => void, boolean] => {
    const [data, setData] = useState<T>(defaultValue);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        if (serverConnected === null) return;

        if (serverConnected === false) {
            setData(defaultValue);
            setLoading(false);
            return;
        }

        let isMounted = true;
        // Fix: Transitioned from broken Firebase onSnapshot to robust api.get calls to resolve environment import errors
        api.get(endpoint)
            .then(res => {
                if (isMounted) {
                    if (Array.isArray(defaultValue) && !Array.isArray(res)) {
                        setData(Object.values(res) as unknown as T);
                    } else {
                        setData(res);
                    }
                    setLoading(false);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.warn(`Failed to fetch ${endpoint}, using defaults.`);
                    setData(defaultValue);
                    setLoading(false);
                }
            });
        return () => { isMounted = false; };
    }, [endpoint, refreshTrigger, serverConnected]);

    return [data, refresh, loading];
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Connection State: null = checking, true = online, false = offline
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);

  // Check connection once on mount
  useEffect(() => {
      const checkServer = async () => {
          const isConnected = await api.checkConnection();
          setServerConnected(isConnected);
          globalServerAvailable = isConnected;
          if (!isConnected) {
              console.log("⚠️ Backend not detected. Switching to Offline/Demo Mode.");
          }
      };
      checkServer();
  }, []);

  // --- Data Hooks (REST API) ---
    const [systemUsers, refreshUsers] = useApiData<User[]>('users/list', [], serverConnected);
    const [employees, refreshEmployees] = useApiData<Employee[]>('employees', [], serverConnected);
    const [branches, refreshBranches] = useApiData<Branch[]>('branches', [], serverConnected);
    const [assets, refreshAssets] = useApiData<Asset[]>('assets', [], serverConnected);
    const [attendance, refreshAttendance] = useApiData<AttendanceRecord[]>('attendance', [], serverConnected);
    const [jobs, refreshJobs] = useApiData<Job[]>('jobs', [], serverConnected);
    const [candidates, refreshCandidates] = useApiData<Candidate[]>('candidates', [], serverConnected);
    const [tasks, refreshTasks] = useApiData<Task[]>('tasks', [], serverConnected);
    const [departments, refreshDepartments] = useApiData<Department[]>('departments', [], serverConnected);
    const [timesheets, refreshTimesheets] = useApiData<Timesheet[]>('timesheets', [], serverConnected);
    const [shifts, refreshShifts] = useApiData<Shift[]>('shifts', [], serverConnected);
    const [leaves, refreshLeaves] = useApiData<LeaveRequest[]>('leaves', [], serverConnected);
    const [payrollRecords, refreshPayroll] = useApiData<PayrollRecord[]>('payroll', [], serverConnected);
    const [reimbursements, refreshReimbursements] = useApiData<Reimbursement[]>('reimbursements', [], serverConnected);
    const [logs, refreshLogs] = useApiData<ActivityLog[]>('logs', [], serverConnected);
    const [groups, refreshGroups] = useApiData<Group[]>('groups', [], serverConnected);
    const [teams, refreshTeams] = useApiData<Team[]>('teams', [], serverConnected);
    const [policyCategories, refreshPolicyCategories] = useApiData<PolicyCategory[]>('policy_categories', [], serverConnected);
    const [policies, refreshPolicies] = useApiData<PolicyDocument[]>('policies', [], serverConnected);
    const [holidays, refreshHolidays] = useApiData<Holiday[]>('holidays', [], serverConnected);
    const [files, refreshFiles] = useApiData<FileItem[]>('files', [], serverConnected);
    const [systemConfig, refreshConfig] = useApiData<SystemConfig>('systemConfig', { assetCategories: [], jobTypes: [], leaveTypes: [], departments: [], designations: [], portalSettings: { allowEmployeeProfileEdit: true, allowEmployeePhotoUpload: true, allowEmployeeAddressEdit: true, allowEmployeeBankEdit: false } }, serverConnected);

  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [targetEmployeeId, setTargetEmployeeId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<{ start: Date; id: string } | null>(null);

  const getLocalTodayDate = () => {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localDate = new Date(now.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
  };

  useEffect(() => {
      if (!user) return;
      const todayStr = getLocalTodayDate();
      const activeTimesheet = timesheets.find(ts => 
          (ts.employeeId === user.id || ts.employeeName === user.name) &&
          ts.date === todayStr &&
          ts.status === 'Working'
      );
      if (activeTimesheet) {
          setCurrentSession({ start: new Date(activeTimesheet.clockIn), id: activeTimesheet.id });
      } else {
          setCurrentSession(null);
      }
  }, [user, timesheets]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
    if (loggedInUser.branchIds?.length === 1) setSelectedBranchId(loggedInUser.branchIds[0]);
    else setSelectedBranchId('all');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentSession(null);
  };

  const wrap = (promise: Promise<any>, refresh: () => void) => {
      if (!serverConnected) {
          alert("Action simulated (Backend is offline)");
          return;
      }
      promise.then(refresh).catch(err => console.error("Action failed:", err));
  };

  // Map frontend Task shape to DB columns expected by the server for tasks table
  const mapTaskToDb = (t: Task) => {
      const assignedEmployee = employees.find(e => e.name === (t.assignee || (t as any).assignedToName));
      const assignedToId = assignedEmployee ? assignedEmployee.id : undefined;
      const statusMap: Record<string, string> = {
          'To Do': 'Todo',
          'In Progress': 'In Progress',
          'Review': 'Review',
          'Done': 'Done'
      };
      return {
          id: t.id,
          title: t.title,
          description: t.description || null,
          assignedTo: assignedToId || null,
          assignedToName: (t.assignee || (t as any).assignedToName) || null,
          status: statusMap[t.status] || t.status,
          priority: t.priority || 'Medium',
          dueDate: t.dueDate || null,
          branchId: selectedBranchId !== 'all' ? selectedBranchId : null,
          createdBy: user?.id || null
      };
  };

  const handleClockIn = () => {
      if (!user) return;
      const now = new Date();
      const todayStr = getLocalTodayDate();
      const tsId = `ts-${Date.now()}`;
      // Use linkedEmployeeId if present, else fallback to user.id
      const employeeId = user.linkedemployeeid || user.id;
      const newTimesheet: Timesheet = {
          id: tsId, employeeId, employeeName: user.name, date: todayStr,
          clockIn: now.toISOString(), clockOut: null, duration: 0, status: 'Working'
      };
      if (!serverConnected) {
          setCurrentSession({ start: now, id: tsId });
          return;
      }
      api.create('timesheets', newTimesheet).then(() => {
          setCurrentSession({ start: now, id: tsId });
          refreshTimesheets();
          api.create('attendance', {
              id: `at-${Date.now()}`, employeeId, employeeName: user.name, employeeAvatar: user.avatar,
              date: todayStr, checkIn: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), checkOut: '-', status: 'Present', workHours: 'Working...'
          }).then(refreshAttendance);
      });
  };

  const handleClockOut = () => {
      if (!currentSession || !user) return;
      const now = new Date();
      if (!serverConnected) {
          setCurrentSession(null);
          return;
      }
      const duration = Math.floor((now.getTime() - currentSession.start.getTime()) / 60000);
      const currentTs = timesheets.find(t => t.id === currentSession.id);
      if(currentTs) {
          api.update('timesheets', currentSession.id, {
              ...currentTs, clockOut: now.toISOString(), duration, status: duration > 540 ? 'Overtime' : 'Completed'
          }).then(() => {
              setCurrentSession(null);
              refreshTimesheets();
              const todayStr = getLocalTodayDate();
              const record = attendance.find(a => a.employeeid === user.id && a.date === todayStr);
              if(record) {
                  const h = Math.floor(duration / 60);
                  const m = duration % 60;
                  api.update('attendance', record.id, {
                      ...record, checkOut: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), workHours: `${h}h ${m}m`
                  }).then(refreshAttendance);
              }
          });
      }
  };

  const renderContent = () => {
    if (!user) return null;
    const filteredEmployees = user.role === 'employee' ? employees.filter(e => e.id === user.linkedEmployeeId) : employees;
    const filteredLeaves = user.role === 'employee' ? leaves.filter(l => l.employeeName === user.name) : leaves;

    switch (currentView) {
    case 'dashboard': return <Dashboard onNavigate={setCurrentView} employees={filteredEmployees} tasks={tasks} leaves={filteredLeaves} jobs={jobs} attendance={attendance} selectedBranch={'all'} user={user} onUpdateTask={t => wrap(api.update('tasks', t.id, t), refreshTasks)} onDeleteTask={id => wrap(api.delete('tasks', id), refreshTasks)} />;
      case 'reports': return <Reports />;
      case 'employees': return <EmployeeList 
        user={user} branches={branches} employees={filteredEmployees} assets={assets} timesheets={timesheets} attendance={attendance} leaves={leaves} departments={departments} payrollRecords={payrollRecords} reimbursements={reimbursements} systemConfig={systemConfig} selectedBranch={'all'} 
        onAddEmployee={() => setCurrentView('add-employee')} onUpdateEmployee={e => wrap(api.update('employees', e.id, e), refreshEmployees)} onDeleteEmployee={id => wrap(api.delete('employees', id), refreshEmployees)} 
        onAddDepartment={d => wrap(api.create('departments', d), refreshDepartments)} onUpdateDepartment={d => wrap(api.update('departments', d.id, d), refreshDepartments)} onDeleteDepartment={id => wrap(api.delete('departments', id), refreshDepartments)} 
        onUpdateLeave={l => wrap(api.update('leaves', l.id, l), refreshLeaves)} policyCategories={policyCategories} policies={policies} holidays={holidays}
        onAddCategory={c => wrap(api.create('policy_categories', c), refreshPolicyCategories)} onUpdateCategory={c => wrap(api.update('policy_categories', c.id, c), refreshPolicyCategories)} onDeleteCategory={id => wrap(api.delete('policy_categories', id), refreshPolicyCategories)}
        onAddPolicy={p => wrap(api.create('policies', p), refreshPolicies)} onUpdatePolicy={p => wrap(api.update('policies', p.id, p), refreshPolicies)} onDeletePolicy={id => wrap(api.delete('policies', id), refreshPolicies)}
        onAddHoliday={h => wrap(api.create('holidays', h), refreshHolidays)} onUpdateHoliday={h => wrap(api.update('holidays', h.id, h), refreshHolidays)} onDeleteHoliday={id => wrap(api.delete('holidays', id), refreshHolidays)}
      />;
      case 'add-employee': return <AddEmployee onBack={() => setCurrentView('employees')} onSave={e => wrap(api.create('employees', e), refreshEmployees)} employees={employees} branches={branches} />;
    case 'recruitment': return <Recruitment jobs={jobs} candidates={candidates} departments={departments} systemConfig={systemConfig} onAddJob={j => wrap(api.create('jobs', j), refreshJobs)} onUpdateJob={j => wrap(api.update('jobs', j.id, j), refreshJobs)} onDeleteJob={id => wrap(api.delete('jobs', id), refreshJobs)} onAddCandidate={c => wrap(api.create('candidates', c), refreshCandidates)} onUpdateCandidate={c => wrap(api.update('candidates', c.id, c), refreshCandidates)} onDeleteCandidate={id => wrap(api.delete('candidates', id), refreshCandidates)} />;
      case 'assets': return <AssetManagement user={user} assets={assets} employees={filteredEmployees} branches={branches} systemConfig={systemConfig} onAddAsset={a => wrap(api.create('assets', a), refreshAssets)} onUpdateAsset={a => wrap(api.update('assets', a.id, a), refreshAssets)} onDeleteAsset={id => wrap(api.delete('assets', id), refreshAssets)} />;
      case 'files': return <FileManager user={user} />;
            case 'tasks': return <TaskBoard tasks={tasks} employees={filteredEmployees} user={user} onAddTask={t => {
                    const payload = mapTaskToDb(t);
                    wrap(api.create('tasks', payload), refreshTasks);
                }} onUpdateTask={t => {
                    const payload = mapTaskToDb(t);
                    wrap(api.update('tasks', t.id, payload), refreshTasks);
                }} />;
      case 'attendance': return <Attendance user={user} records={attendance} timesheets={timesheets} shifts={shifts} leaves={leaves} onAddRecord={r => wrap(api.create('attendance', r), refreshAttendance)} onUpdateRecord={r => wrap(api.update('attendance', r.id, r), refreshAttendance)} onDeleteRecord={id => wrap(api.delete('attendance', id), refreshAttendance)} onUpdateTimesheet={t => wrap(api.update('timesheets', t.id, t), refreshTimesheets)} onDeleteTimesheet={id => wrap(api.delete('timesheets', id), refreshTimesheets)} onAddShift={s => wrap(api.create('shifts', s), refreshShifts)} onUpdateShift={s => wrap(api.update('shifts', s.id, s), refreshShifts)} onDeleteShift={id => wrap(api.delete('shifts', id), refreshShifts)} onUpdateLeave={l => wrap(api.update('leaves', l.id, l), refreshLeaves)} onAddLeave={l => wrap(api.create('leaves', l), refreshLeaves)} />;
      case 'payroll': return <Payroll user={user} payrollRecords={payrollRecords} employees={filteredEmployees} attendance={attendance} timesheets={timesheets} reimbursements={reimbursements} onAddPayroll={p => wrap(api.create('payroll', p), refreshPayroll)} onUpdatePayroll={p => wrap(api.update('payroll', p.id, p), refreshPayroll)} onDeletePayroll={id => wrap(api.delete('payroll', id), refreshPayroll)} onUpdateEmployee={e => wrap(api.update('employees', e.id, e), refreshEmployees)} onAddReimbursement={r => wrap(api.create('reimbursements', r), refreshReimbursements)} onUpdateReimbursement={r => wrap(api.update('reimbursements', r.id, r), refreshReimbursements)} onDeleteReimbursement={id => wrap(api.delete('reimbursements', id), refreshReimbursements)} />;
      case 'settings': return <Settings user={user} users={systemUsers} branches={branches} employees={employees} assets={assets} groups={groups} files={files} onAddGroup={g => wrap(api.create('groups', g), refreshGroups)} onUpdateGroup={g => wrap(api.update('groups', g.id, g), refreshGroups)} onDeleteGroup={id => wrap(api.delete('groups', id), refreshGroups)} onAddBranch={b => wrap(api.create('branches', b), refreshBranches)} onUpdateBranch={b => wrap(api.update('branches', b.id, b), refreshBranches)} onDeleteBranch={id => wrap(api.delete('branches', id), refreshBranches)} systemConfig={systemConfig} setSystemConfig={c => wrap(api.create('systemConfig', c), refreshConfig)} emailTemplates={[]} setEmailTemplates={()=>{}} smtpSettings={{host:'', port:'', user:'', pass:'', fromEmail:''}} setSmtpSettings={()=>{}} notificationSettings={[]} setNotificationSettings={()=>{}} onUpdateUser={u => wrap(api.update('users', u.id, u), refreshUsers)} onDeleteUser={id => wrap(api.delete('users', id), refreshUsers)} onAddUser={u => wrap(api.create('users', u), refreshUsers)} onUpdateEmployee={e => wrap(api.update('employees', e.id, e), refreshEmployees)} onUpdateAsset={a => wrap(api.update('assets', a.id, a), refreshAssets)} onDeleteAsset={id => wrap(api.delete('assets', id), refreshAssets)} onUpdateFile={f => wrap(api.update('files', f.id, f), refreshFiles)} />;
      case 'logs': return <ActivityLogs logs={logs} />;
      case 'teams': return <TeamManagement teams={teams} employees={filteredEmployees} onAddTeam={t => wrap(api.create('teams', t), refreshTeams)} onUpdateTeam={t => wrap(api.update('teams', t.id, t), refreshTeams)} onDeleteTeam={id => wrap(api.delete('teams', id), refreshTeams)} />;
            case 'handbook': {
                if (!systemUsers || !groups || systemUsers.length === 0 || groups.length === 0) {
                    return (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <div className="text-lg font-semibold mb-2">Loading users and groups...</div>
                            <div className="text-sm">Please ensure the backend is running and users/groups exist in the database.</div>
                        </div>
                    );
                }
                // Get all unique roles from systemUsers
                const allRoles = Array.from(new Set(systemUsers.map(u => u.role)));
                return <Handbook user={user} categories={policyCategories} policies={policies} users={systemUsers} groups={groups} roles={allRoles} onAddCategory={c => wrap(api.create('policy_categories', c), refreshPolicyCategories)} onUpdateCategory={c => wrap(api.update('policy_categories', c.id, c), refreshPolicyCategories)} onDeleteCategory={id => wrap(api.delete('policy_categories', id), refreshPolicyCategories)} onAddPolicy={p => wrap(api.create('policies', p), refreshPolicies)} onUpdatePolicy={p => wrap(api.update('policies', p.id, p), refreshPolicies)} onDeletePolicy={id => wrap(api.delete('policies', id), refreshPolicies)} />;
            }
      case 'holidays': return <HolidayCalendar user={user} holidays={holidays} onAddHoliday={h => wrap(api.create('holidays', h), refreshHolidays)} onUpdateHoliday={h => wrap(api.update('holidays', h.id, h), refreshHolidays)} onDeleteHoliday={id => wrap(api.delete('holidays', id), refreshHolidays)} onApplyLeave={() => setCurrentView('attendance')} />;
        case 'password-manager':
            return <PasswordManager userId={user.id} />;
        default: return <Dashboard onNavigate={setCurrentView} employees={filteredEmployees} tasks={tasks} leaves={filteredLeaves} jobs={jobs} attendance={attendance} selectedBranch={'all'} user={user} onUpdateTask={t => wrap(api.update('tasks', t.id, t), refreshTasks)} onDeleteTask={id => wrap(api.delete('tasks', id), refreshTasks)} />;
    }
  };

  if (!user) return <Login onLogin={handleLogin} users={systemUsers} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} userRole={user.role} user={user} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} onClockIn={handleClockIn} onClockOut={handleClockOut} isClockedIn={!!currentSession} sessionStartTime={currentSession?.start || null} branches={branches} selectedBranch={'all'} onSelectBranch={setSelectedBranchId} />
        {serverConnected === false && (
            <div className="bg-amber-100 text-amber-800 px-4 py-2 text-xs font-bold text-center border-b border-amber-200 flex items-center justify-center gap-2">
                <WifiOff size={14} />
                <span>Offline Mode: Backend disconnected. Using mock data (Read-Only).</span>
            </div>
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 sm:p-6"><div className="max-w-7xl mx-auto">{renderContent()}</div></main>
      </div>
    </div>
  );
};

export default App;
