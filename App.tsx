
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import Login from './components/Login';
import AddEmployee from './components/AddEmployee';
import Recruitment from './components/Recruitment';
import AssetManagement from './components/AssetManagement';
import FileManager from './components/FileManager';
import TaskBoard from './components/TaskBoard';
import Settings from './components/Settings';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import ActivityLogs from './components/ActivityLogs';
import TeamManagement from './components/TeamManagement';
import HolidayCalendar from './components/HolidayCalendar';
import Handbook from './components/Handbook';
import AIHRChat from './components/AIHRAssistant/AIHRChat';
import { User, ViewState, Employee, Job, Candidate, Asset, Task, LeaveRequest, AttendanceRecord, Department, Timesheet, Shift, PayrollRecord, SystemConfig, EmailTemplate, SmtpSettings, Reimbursement, Branch, NotificationSetting, ActivityLog, Group, Team, PolicyCategory, PolicyDocument, Holiday } from './types';
import { api } from './services/api';
import { WifiOff, Lock } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  declare state: { hasError: boolean; error: string };
  declare props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('React Error:', error);
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-red-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Custom Hook for API Data Fetching (PostgreSQL Only) ---
const useApiData = <T,>(endpoint: string, defaultValue: T): [T, () => void, boolean] => {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;

    api.get(endpoint)
      .then(res => {
        if (isMounted) {
          console.log(`✅ Loaded ${endpoint}:`, res);
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(`❌ Failed to fetch ${endpoint}:`, err.message);
          setLoading(false);
          // Don't update data on error - use default
        }
      });
    return () => { isMounted = false; };
  }, [endpoint, refreshTrigger]);

  return [data, refresh, loading];
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Restore user from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serverConnected, setServerConnected] = useState<boolean>(true);

  // --- Health Check on Mount ---
  useEffect(() => {
    api.checkConnection()
      .then(() => setServerConnected(true))
      .catch(() => setServerConnected(false));

    const interval = setInterval(() => {
      api.checkConnection()
        .then(() => setServerConnected(true))
        .catch(() => setServerConnected(false));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // --- Data Hooks (PostgreSQL Only) ---
  const [systemUsers, refreshUsers] = useApiData<User[]>('users', []);
  const [employees, refreshEmployees] = useApiData<Employee[]>('employees', []);
  const [branches, refreshBranches] = useApiData<Branch[]>('branches', []);
  const [assets, refreshAssets] = useApiData<Asset[]>('assets', []);
  const [attendance, refreshAttendance] = useApiData<AttendanceRecord[]>('attendance', []);
  const [jobs, refreshJobs] = useApiData<Job[]>('jobs', []);
  const [candidates, refreshCandidates] = useApiData<Candidate[]>('candidates', []);
  const [tasks, refreshTasks] = useApiData<Task[]>('tasks', []);
  const [departments, refreshDepartments] = useApiData<Department[]>('departments', []);
  const [timesheets, refreshTimesheets] = useApiData<Timesheet[]>('timesheets', []);
  const [shifts, refreshShifts] = useApiData<Shift[]>('shifts', []);
  const [leaves, refreshLeaves] = useApiData<LeaveRequest[]>('leaves', []);
  const [payrollRecords, refreshPayroll] = useApiData<PayrollRecord[]>('payroll', []);
  const [reimbursements, refreshReimbursements] = useApiData<Reimbursement[]>('reimbursements', []);
  const [logs, refreshLogs] = useApiData<ActivityLog[]>('logs', []);
  const [groups, refreshGroups] = useApiData<Group[]>('groups', []);
  const [teams, refreshTeams] = useApiData<Team[]>('teams', []);
  const [policyCategories, refreshPolicyCategories] = useApiData<PolicyCategory[]>('policy_categories', []);
  const [policies, refreshPolicies] = useApiData<PolicyDocument[]>('policies', []);
  const [holidays, refreshHolidays] = useApiData<Holiday[]>('holidays', []);
  const [systemConfig, refreshConfig] = useApiData<SystemConfig>('system_config', { assetCategories: [], jobTypes: [], leaveTypes: [], departments: [], designations: [], portalSettings: { allowEmployeeProfileEdit: false, allowEmployeePhotoUpload: false, allowEmployeeAddressEdit: false, allowEmployeeBankEdit: false } });
  const [emailTemplates, refreshTemplates] = useApiData<EmailTemplate[]>('email_templates', []);
  const [smtpSettings, refreshSmtp] = useApiData<SmtpSettings>('smtp_settings', { host: '', port: '', user: '', pass: '', fromEmail: '' });
  const [notificationSettings, refreshNotifs] = useApiData<NotificationSetting[]>('notification_settings', []);

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
    console.log('✅ User logged in:', loggedInUser.email);
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser)); // Persist user
    setCurrentView('dashboard');
    if (loggedInUser.branchIds?.length === 1) setSelectedBranchId(loggedInUser.branchIds[0]);
    else setSelectedBranchId('all');
    // Don't log activity on login to avoid initialization issues
  };

  const handleLogout = () => {
    console.log('✅ User logged out');
    setUser(null);
    setCurrentSession(null);
    localStorage.removeItem('user'); // Remove persisted user
  };

  const logActivity = (action: string, module: string, details: string, actor?: User) => {
    try {
      const targetActor = actor || user;
      if (!targetActor) return;

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        userId: targetActor.id,
        userName: targetActor.name,
        userRole: targetActor.role,
        action, module, details,
        timestamp: new Date().toLocaleString(),
        branchId: selectedBranchId
      };
      // Only log if logs is loaded
      if (logs && Array.isArray(logs)) {
        api.create('logs', newLog).catch(err => console.error('Failed to log activity:', err));
      }
    } catch (err) {
      console.warn('Could not log activity:', err);
    }
  };

  // --- CRUD Wrappers ---
  const wrap = (promise: Promise<any>, refresh: () => void) => {
    promise
      .then((result) => {
        console.log('✅ Operation successful:', result);
        // Refresh on success
        setTimeout(refresh, 300);
      })
      .catch(err => {
        console.error('❌ Operation failed:', err.message);
        console.error('Full error:', err);
        // Show user-friendly error message
        alert(`Operation failed: ${err.message || 'Please check your connection and try again.'}`);
        // Try to refresh anyway in case of partial success
        setTimeout(refresh, 300);
      });
  };

  // Map frontend Task shape to DB columns expected by the server for tasks table
  const mapTaskToDb = (t: Task) => {
    const assignedEmployee = employees.find(e => e.name === (t.assignee || (t as any).assignedToName));
    const assignedToId = assignedEmployee ? assignedEmployee.id : undefined;
    // Normalize status: UI uses 'To Do' while DB uses 'Todo' default
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

  const handleAddEmployee = (emp: Employee) => {
    const branchId = selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id;
    const newEmp = { ...emp, id: Date.now().toString(), branchId };

    // Fix: api.create is now implemented in services/api.ts
    wrap(api.create('employees', newEmp), () => {
      refreshEmployees();
      const newUser: User = {
        id: `u-${Date.now()}`, name: emp.name, email: emp.email, role: 'employee', avatar: emp.avatar,
        designation: emp.designation, status: 'Active', branchIds: [branchId], linkedEmployeeId: newEmp.id,
        accessModules: ['dashboard', 'attendance', 'payroll', 'tasks', 'files', 'assets', 'teams', 'settings']
      };
      api.create('users', newUser).then(refreshUsers).catch(() => { });
      setCurrentView('employees');
      logActivity('Create Employee', 'Workforce', `Added ${emp.name}`);
    });
  };

  // Fix: api.update and api.delete are now implemented in services/api.ts
  const handleUpdateEmployee = (emp: Employee) => wrap(api.update('employees', emp.id, emp), refreshEmployees);
  const handleDeleteEmployee = (id: string) => wrap(api.delete('employees', id), refreshEmployees);

  const handleAddUser = (u: User) => wrap(api.create('users', { ...u, id: Date.now().toString() }), refreshUsers);
  const handleUpdateUser = (u: User) => wrap(api.update('users', u.id, u), refreshUsers);
  const handleDeleteUser = (id: string) => wrap(api.delete('users', id), refreshUsers);

  const handleAddBranch = (b: Branch) => wrap(api.create('branches', b), refreshBranches);
  const handleUpdateBranch = (b: Branch) => wrap(api.update('branches', b.id, b), refreshBranches);
  const handleDeleteBranch = (id: string) => wrap(api.delete('branches', id), refreshBranches);

  // Clock In
  const handleClockIn = () => {
    if (!user) {
      alert("No user logged in");
      return;
    }

    if (!serverConnected) {
      const now = new Date();
      const tsId = `ts-${Date.now()}`;
      setCurrentSession({ start: now, id: tsId });
      alert("Clocked In (Offline Mode - local only)");
      logActivity('Clock In', 'Attendance', 'User Clocked In (Offline)');
      return;
    }

    const now = new Date();
    const todayStr = getLocalTodayDate();
    const tsId = Date.now().toString();

    const newTimesheet: Timesheet = {
      id: tsId,
      employeeId: user.id,
      employeeName: user.name,
      date: todayStr,
      clockIn: now.toISOString(),
      clockOut: null,
      duration: 0,
      status: 'Working'
    };

    console.log('📍 Clock In Attempt:', newTimesheet);
    console.log('📝 Sending to /api/timesheets with fields:', Object.keys(newTimesheet));

    api.create('timesheets', newTimesheet)
      .then(createdTs => {
        console.log('✅ Timesheet created successfully:', createdTs);
        setCurrentSession({ start: now, id: createdTs.id || tsId });
        refreshTimesheets();

        // Also update or create attendance record
        const checkIn = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const existing = attendance.find(a => a.employeeId === user.id && a.date === todayStr);

        if (existing) {
          api.update('attendance', existing.id, {
            ...existing,
            status: 'Present',
            checkIn
          }).then(() => {
            console.log('✅ Attendance updated');
            refreshAttendance();
          }).catch(err => console.warn('⚠️ Attendance update failed:', err.message));
        } else {
          api.create('attendance', {
            id: `at-${Date.now()}`,
            employeeId: user.id,
            employeeName: user.name,
            employeeAvatar: user.avatar,
            date: todayStr,
            checkIn,
            checkOut: '-',
            status: 'Present',
            workHours: 'Working...'
          }).then(() => {
            console.log('✅ Attendance created');
            refreshAttendance();
          }).catch(err => console.warn('⚠️ Attendance creation failed:', err.message));
        }

        logActivity('Clock In', 'Attendance', `Clocked in at ${checkIn}`);
      })
      .catch(err => {
        console.error('❌ Clock In Failed - Details:', {
          errorMessage: err.message,
          errorStatus: err.status,
          timesheet: newTimesheet,
          fullError: err
        });
        alert(`Failed to clock in: ${err.message}`);
      });
  };

  const handleClockOut = () => {
    if (!currentSession || !user) {
      console.warn('⚠️ No active session or user not logged in');
      return;
    }

    const now = new Date();
    const duration = Math.floor((now.getTime() - currentSession.start.getTime()) / 60000);

    if (!serverConnected) {
      console.log('📍 Clock Out (Offline Mode): duration =', duration, 'min');
      setCurrentSession(null);
      alert("Clocked Out (Offline Mode)");
      logActivity('Clock Out', 'Attendance', `User Clocked Out (Offline). Duration: ${duration}m`);
      return;
    }

    const currentTs = timesheets.find(t => t.id === currentSession.id);
    if (!currentTs) {
      console.error('❌ Clock Out Failed: Timesheet record not found for ID:', currentSession.id);
      alert('Error: Timesheet record not found.');
      return;
    }

    const updatedTimesheet = {
      ...currentTs,
      clockOut: now.toISOString(),
      duration,
      status: duration > 540 ? 'Overtime' : 'Completed'
    };

    console.log('📍 Clock Out Attempt:', { duration, status: updatedTimesheet.status, recordId: currentSession.id });

    api.update('timesheets', currentSession.id, updatedTimesheet)
      .then(() => {
        console.log('✅ Timesheet updated: clockOut recorded, duration =', duration, 'min');
        setCurrentSession(null);
        refreshTimesheets();

        // Update attendance record as non-fatal operation
        const todayStr = getLocalTodayDate();
        const record = attendance.find(a => a.employeeId === user.id && a.date === todayStr);
        if (record) {
          const h = Math.floor(duration / 60);
          const m = duration % 60;
          const attendanceUpdate = {
            ...record,
            checkOut: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            workHours: `${h}h ${m}m`
          };

          api.update('attendance', record.id, attendanceUpdate)
            .then(() => {
              console.log('✅ Attendance updated:', attendanceUpdate);
              refreshAttendance();
            })
            .catch(err => {
              console.warn('⚠️ Attendance update failed (non-fatal):', err.message);
            });
        } else {
          console.warn('⚠️ No attendance record found for today; skipping attendance update');
        }

        const h = Math.floor(duration / 60);
        const m = duration % 60;
        logActivity('Clock Out', 'Attendance', `User Clocked Out. Duration: ${h}h ${m}m`);
      })
      .catch(err => {
        console.error('❌ Clock Out Failed:', err);
        alert(`Failed to clock out: ${err.message}`);
      });
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleViewEmployeeProfile = (id: string) => {
    setTargetEmployeeId(id);
    setCurrentView('employees');
  };

  // --- Filtering ---
  const isRecordVisible = (recordBranchId?: string) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'super_admin') return selectedBranchId === 'all' || selectedBranchId === recordBranchId;
    if (!recordBranchId) return true;
    if (selectedBranchId === 'all') return user.branchIds?.includes(recordBranchId) || false;
    return user.branchIds?.includes(selectedBranchId) && selectedBranchId === recordBranchId;
  };

  const filteredEmployees = user?.role === 'employee' ? employees.filter(e => e.id === user.linkedEmployeeId) : employees.filter(e => isRecordVisible(e.branchId));
  const visibleBranches = (user?.role === 'admin' || user?.role === 'super_admin') ? branches : branches.filter(b => user?.branchIds?.includes(b.id));
  const selectedBranchObject = branches.find(b => b.id === selectedBranchId) || 'all';

  if (!user) return <Login onLogin={handleLogin} users={systemUsers} />;

  // Allow rendering even if data isn't fully loaded - show loading placeholders instead
  if (user.role === 'employee') {
    const restrictedViews: ViewState[] = ['recruitment', 'add-employee', 'logs'];
    if (restrictedViews.includes(currentView)) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
            <Lock size={32} className="text-red-500 mb-4 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
            <p className="text-slate-500 mt-2">You do not have permission to view this module.</p>
            <button onClick={() => setCurrentView('dashboard')} className="mt-6 text-accent-600 hover:underline font-medium">Return to Dashboard</button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} userRole={user.role} user={user} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} onClockIn={handleClockIn} onClockOut={handleClockOut} isClockedIn={!!currentSession} sessionStartTime={currentSession?.start || null} branches={visibleBranches} selectedBranch={selectedBranchObject} onSelectBranch={setSelectedBranchId} activityLogs={logs || []} />

        {/* Offline Banner */}
        {serverConnected === false && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 text-xs font-bold text-center border-b border-amber-200 flex items-center justify-center gap-2">
            <WifiOff size={14} />
            <span>Offline Mode: Backend disconnected. Using mock data (Read-Only).</span>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 sm:p-6"><div className="mx-auto" style={{ width: '90%' }}>
          {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} employees={filteredEmployees || []} tasks={tasks || []} leaves={leaves || []} jobs={jobs || []} attendance={attendance || []} selectedBranch={selectedBranchObject || 'all'} user={user} />}
          {/* Fix: Added missing props for policies, categories and holidays to EmployeeList call */}
          {currentView === 'employees' && <EmployeeList
            user={user}
            users={systemUsers || []}
            branches={branches || []}
            employees={filteredEmployees || []}
            assets={assets || []}
            timesheets={timesheets || []}
            attendance={attendance || []}
            leaves={leaves || []}
            departments={departments || []}
            payrollRecords={payrollRecords || []}
            reimbursements={reimbursements || []}
            systemConfig={systemConfig || {}}
            selectedBranch={selectedBranchObject || 'all'}
            onAddEmployee={() => setCurrentView('add-employee')}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onAddDepartment={d => wrap(api.create('departments', d), refreshDepartments)}
            onUpdateDepartment={d => wrap(api.update('departments', d.id, d), refreshDepartments)}
            onDeleteDepartment={id => wrap(api.delete('departments', id), refreshDepartments)}
            onUpdateLeave={l => wrap(api.update('leaves', l.id, l), refreshLeaves)}
            targetEmployeeId={targetEmployeeId}
            onClearTargetEmployee={() => setTargetEmployeeId(null)}
            onUpdateAsset={a => wrap(api.update('assets', a.id, a), refreshAssets)}
            policyCategories={policyCategories || []}
            policies={policies || []}
            holidays={holidays || []}
            onAddCategory={c => wrap(api.create('policy_categories', c), refreshPolicyCategories)}
            onUpdateCategory={c => wrap(api.update('policy_categories', c.id, c), refreshPolicyCategories)}
            onDeleteCategory={id => wrap(api.delete('policy_categories', id), refreshPolicyCategories)}
            onAddPolicy={p => wrap(api.create('policies', p), refreshPolicies)}
            onUpdatePolicy={p => wrap(api.update('policies', p.id, p), refreshPolicies)}
            onDeletePolicy={id => wrap(api.delete('policies', id), refreshPolicies)}
            onAddHoliday={h => wrap(api.create('holidays', h), refreshHolidays)}
            onUpdateHoliday={h => wrap(api.update('holidays', h.id, h), refreshHolidays)}
            onDeleteHoliday={id => wrap(api.delete('holidays', id), refreshHolidays)}
          />}
          {currentView === 'add-employee' && <AddEmployee onBack={() => setCurrentView('employees')} onSave={handleAddEmployee} employees={employees || []} />}
          {currentView === 'teams' && <TeamManagement teams={teams || []} employees={filteredEmployees || []} onAddTeam={t => wrap(api.create('teams', t), refreshTeams)} onUpdateTeam={t => wrap(api.update('teams', t.id, t), refreshTeams)} onDeleteTeam={id => wrap(api.delete('teams', id), refreshTeams)} />}
          {currentView === 'assets' && <AssetManagement user={user} assets={assets || []} employees={filteredEmployees || []} branches={visibleBranches || []} systemConfig={systemConfig || {}} onAddAsset={a => wrap(api.create('assets', a), refreshAssets)} onUpdateAsset={a => wrap(api.update('assets', a.id, a), refreshAssets)} onDeleteAsset={id => wrap(api.delete('assets', id), refreshAssets)} />}
          {/* Fix: Added missing user prop to FileManager */}
          {currentView === 'files' && <FileManager user={user} />}
          {currentView === 'tasks' && <TaskBoard tasks={tasks || []} employees={filteredEmployees || []} user={user} onAddTask={t => {
            const payload = mapTaskToDb(t);
            wrap(api.create('tasks', payload), refreshTasks);
          }} onUpdateTask={t => {
            const payload = mapTaskToDb(t);
            wrap(api.update('tasks', t.id, payload), refreshTasks);
          }} />}
          {currentView === 'recruitment' && <Recruitment jobs={jobs || []} candidates={candidates || []} systemConfig={systemConfig || {}} onAddJob={j => wrap(api.create('jobs', j), refreshJobs)} onUpdateJob={j => wrap(api.update('jobs', j.id, j), refreshJobs)} onDeleteJob={id => wrap(api.delete('jobs', id), refreshJobs)} onAddCandidate={c => wrap(api.create('candidates', c), refreshCandidates)} onUpdateCandidate={c => wrap(api.update('candidates', c.id, c), refreshCandidates)} onDeleteCandidate={id => wrap(api.delete('candidates', id), refreshCandidates)} />}
          {currentView === 'attendance' && <Attendance user={user} records={attendance || []} timesheets={timesheets || []} shifts={shifts || []} leaves={leaves || []} onAddRecord={r => wrap(api.create('attendance', r), refreshAttendance)} onUpdateRecord={r => wrap(api.update('attendance', r.id, r), refreshAttendance)} onDeleteRecord={id => wrap(api.delete('attendance', id), refreshAttendance)} onUpdateTimesheet={t => wrap(api.update('timesheets', t.id, t), refreshTimesheets)} onDeleteTimesheet={id => wrap(api.delete('timesheets', id), refreshTimesheets)} onAddShift={s => wrap(api.create('shifts', s), refreshShifts)} onUpdateShift={s => wrap(api.update('shifts', s.id, s), refreshShifts)} onDeleteShift={id => wrap(api.delete('shifts', id), refreshShifts)} onUpdateLeave={l => wrap(api.update('leaves', l.id, l), refreshLeaves)} onAddLeave={l => wrap(api.create('leaves', l), refreshLeaves)} />}
          {currentView === 'payroll' && <Payroll user={user} payrollRecords={payrollRecords || []} employees={filteredEmployees || []} attendance={attendance || []} timesheets={timesheets || []} reimbursements={reimbursements || []} onAddPayroll={p => wrap(api.create('payroll', p), refreshPayroll)} onUpdatePayroll={p => wrap(api.update('payroll', p.id, p), refreshPayroll)} onDeletePayroll={id => wrap(api.delete('payroll', id), refreshPayroll)} onUpdateEmployee={handleUpdateEmployee} onAddReimbursement={r => wrap(api.create('reimbursements', r), refreshReimbursements)} onUpdateReimbursement={r => wrap(api.update('reimbursements', r.id, r), refreshReimbursements)} onDeleteReimbursement={id => wrap(api.delete('reimbursements', id), refreshReimbursements)} />}
          {currentView === 'holidays' && <HolidayCalendar user={user} holidays={holidays || []} onAddHoliday={h => wrap(api.create('holidays', h), refreshHolidays)} onUpdateHoliday={h => wrap(api.update('holidays', h.id, h), refreshHolidays)} onDeleteHoliday={id => wrap(api.delete('holidays', id), refreshHolidays)} onApplyLeave={() => setCurrentView('attendance')} />}
          {currentView === 'handbook' && <Handbook user={user} categories={policyCategories || []} policies={policies || []} onAddCategory={c => wrap(api.create('policy_categories', c), refreshPolicyCategories)} onUpdateCategory={c => wrap(api.update('policy_categories', c.id, c), refreshPolicyCategories)} onDeleteCategory={id => wrap(api.delete('policy_categories', id), refreshPolicyCategories)} onAddPolicy={p => wrap(api.create('policies', p), refreshPolicies)} onUpdatePolicy={p => wrap(api.update('policies', p.id, p), refreshPolicies)} onDeletePolicy={id => wrap(api.delete('policies', id), refreshPolicies)} />}
          {currentView === 'settings' && <Settings user={user} users={systemUsers || []} groups={groups || []} onAddGroup={g => wrap(api.create('groups', g), refreshGroups)} onUpdateGroup={g => wrap(api.update('groups', g.id, g), refreshGroups)} onDeleteGroup={id => wrap(api.delete('groups', id), refreshGroups)} branches={visibleBranches || []} employees={employees || []} assets={assets || []} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} onAddBranch={handleAddBranch} onUpdateBranch={handleUpdateBranch} onDeleteBranch={handleDeleteBranch} onUpdateEmployee={handleUpdateEmployee} onUpdateAsset={a => wrap(api.update('assets', a.id, a), refreshAssets)} systemConfig={systemConfig || {}} setSystemConfig={c => wrap(api.create('systemConfig', c), refreshConfig)} emailTemplates={emailTemplates || []} setEmailTemplates={t => wrap(api.create('emailTemplates', t), refreshTemplates)} smtpSettings={smtpSettings || {}} setSmtpSettings={s => wrap(api.create('smtpSettings', s), refreshSmtp)} notificationSettings={notificationSettings || {}} setNotificationSettings={n => wrap(api.create('notificationSettings', n), refreshNotifs)} onNavigate={handleNavigate} onSelectBranch={setSelectedBranchId} onViewEmployee={handleViewEmployeeProfile} leaves={leaves || []} reimbursements={reimbursements || []} />}
          {currentView === 'logs' && <ActivityLogs logs={logs || []} />}
        </div><div className="h-6"></div></main>
        <AIHRChat currentUser={user} />
      </div>
    </div>
  );
};

export default () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
