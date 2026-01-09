
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
import CopyrightNotice from './components/CopyrightNotice';
import HolidayCalendar from './components/HolidayCalendar';
import Handbook from './components/Handbook';
import { User, ViewState, Employee, Job, Candidate, Asset, Task, LeaveRequest, AttendanceRecord, Department, Timesheet, Shift, PayrollRecord, SystemConfig, EmailTemplate, SmtpSettings, Reimbursement, Branch, NotificationSetting, ActivityLog, Group, Team, PolicyCategory, PolicyDocument, Holiday } from './types';
import PasswordManager from './components/PasswordManager';
import { api } from './services/api';
import { WifiOff, Lock } from 'lucide-react';

import AIHRChat from './AI/AIHRAssistant/AIHRChat';
import EmailWorkflow from './AI/Email/EmailWorkflow';

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
  const [groups, refreshGroups] = useApiData<Group[]>('permission_groups', []);
  const [teams, refreshTeams] = useApiData<Team[]>('teams', []);
  const [policyCategories, refreshPolicyCategories] = useApiData<PolicyCategory[]>('policy_categories', []);
  const [policies, refreshPolicies] = useApiData<PolicyDocument[]>('policies', []);
  const [holidays, refreshHolidays] = useApiData<Holiday[]>('holidays', []);
  const [systemConfig, refreshConfig] = useApiData<SystemConfig>('system_config', {
    assetCategories: [],
    jobTypes: [],
    leaveTypes: [],
    departments: [],
    designations: [],
    portalSettings: {
      allowEmployeeProfileEdit: false,
      allowEmployeePhotoUpload: false,
      allowEmployeeAddressEdit: false,
      allowEmployeeBankEdit: false
    },
    footerSettings: {
      companyName: 'SD Commercial',
      copyrightNotice: 'SD Commercial Employee Management Portal\n\nCopyright (c) 2026 SD Commercial. All rights reserved.\n\nThis application and its source code are proprietary to SD Commercial. Unauthorized copying, distribution, modification, or use of any part of this software is strictly prohibited and may result in legal action.\n\nAll content, data, and intellectual property within this portal are the exclusive property of SD Commercial.',
      privacyContent: 'Standard Privacy Policy content...',
      termsContent: 'Standard Terms and Conditions content...',
      securityContent: 'Standard Security Policy content...'
    },
    copyrightSections: [
      { title: "Proprietary Rights", content: "All source code, UI designs, and system architecture are protected under international copyright laws." },
      { title: "Data Protection", content: "Employee records, company data, and internal documentation are strictly confidential." },
      { title: "Legal Inquiries", content: "For licensing, permissions, or reporting unauthorized use, please contact our legal department." }
    ]
  });
  const [emailTemplates, refreshTemplates] = useApiData<EmailTemplate[]>('email_templates', []);
  const [smtpSettings, refreshSmtp] = useApiData<SmtpSettings>('smtp_settings', { host: '', port: '', user: '', pass: '', fromEmail: '' });
  const [notificationSettings, refreshNotifs] = useApiData<NotificationSetting[]>('notification_settings', []);
  const [emails, refreshEmails] = useApiData<any[]>('emails', []);

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
    logActivity('Logout', 'Auth', `User logged out: ${user?.name}`);
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
        timestamp: new Date().toISOString(),
        branchId: selectedBranchId
      };
      // Only log if logs is loaded
      if (logs && Array.isArray(logs)) {
        api.create('logs', newLog)
          .then(() => refreshLogs())
          .catch(err => console.error('Failed to log activity:', err));
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
      logActivity('Create Employee', 'Workforce', `Added employee ${emp.name} and created user account`);
    });
  };

  // Fix: api.update and api.delete are now implemented in services/api.ts
  const handleUpdateEmployee = (emp: Employee) => wrap(api.update('employees', emp.id, emp).then(res => {
    logActivity('Update Employee', 'Workforce', `Updated details for ${emp.name}`);
    return res;
  }), refreshEmployees);
  const handleDeleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    wrap(api.delete('employees', id).then(res => {
      logActivity('Delete Employee', 'Workforce', `Removed employee: ${emp?.name || id}`);
      return res;
    }), refreshEmployees);
  };

  const handleAddUser = (u: User) => wrap(api.create('users', { ...u, id: Date.now().toString() }).then(res => {
    logActivity('Create User', 'Settings', `Created user account for ${u.name}`);
    return res;
  }), refreshUsers);
  const handleUpdateUser = (u: User) => wrap(api.update('users', u.id, u).then(res => {
    logActivity('Update User', 'Settings', `Updated user account for ${u.name}`);
    return res;
  }), refreshUsers);
  const handleDeleteUser = (id: string) => {
    const u = systemUsers?.find(user => user.id === id);
    wrap(api.delete('users', id).then(res => {
      logActivity('Delete User', 'Settings', `Deleted user account: ${u?.name || id}`);
      return res;
    }), refreshUsers);
  };

  const handleAddBranch = (b: Branch) => wrap(api.create('branches', b).then(res => {
    logActivity('Create Branch', 'Settings', `Added new branch: ${b.name}`);
    return res;
  }), refreshBranches);
  const handleUpdateBranch = (b: Branch) => wrap(api.update('branches', b.id, b).then(res => {
    logActivity('Update Branch', 'Settings', `Updated branch details for ${b.name}`);
    return res;
  }), refreshBranches);
  const handleDeleteBranch = (id: string) => {
    const b = branches.find(branch => branch.id === id);
    wrap(api.delete('branches', id).then(res => {
      logActivity('Delete Branch', 'Settings', `Removed branch: ${b?.name || id}`);
      return res;
    }), refreshBranches);
  };

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

  const filteredEmployees = user?.role === 'employee' ? employees.filter(e => e.id === user.linkedemployeeid) : employees.filter(e => isRecordVisible(e.branchId));
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

        {/* Floating AI Assistant Chat */}
        <AIHRChat currentUser={user} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 sm:p-6"><div className="mx-auto" style={{ width: '90%' }}>
          {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} employees={filteredEmployees || []} tasks={tasks || []} leaves={leaves || []} jobs={jobs || []} attendance={attendance || []} selectedBranch={selectedBranchObject || 'all'} user={user} />}
          {currentView === 'password-manager' && <PasswordManager userId={user.id} />}
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
          {currentView === 'teams' && <TeamManagement
            teams={teams || []}
            employees={filteredEmployees || []}
            onAddTeam={t => wrap(api.create('teams', t).then(res => {
              logActivity('Create Team', 'Workforce', `Created team: ${t.name}`);
              return res;
            }), refreshTeams)}
            onUpdateTeam={t => wrap(api.update('teams', t.id, t).then(res => {
              logActivity('Update Team', 'Workforce', `Updated team: ${t.name}`);
              return res;
            }), refreshTeams)}
            onDeleteTeam={id => {
              const team = teams.find(tm => tm.id === id);
              wrap(api.delete('teams', id).then(res => {
                logActivity('Delete Team', 'Workforce', `Removed team: ${team?.name || id}`);
                return res;
              }), refreshTeams);
            }}
          />}
          {currentView === 'assets' && <AssetManagement
            user={user}
            assets={assets || []}
            employees={filteredEmployees || []}
            branches={visibleBranches || []}
            systemConfig={systemConfig || {}}
            onAddAsset={a => wrap(api.create('assets', a).then(res => {
              logActivity('Create Asset', 'Assets', `Registered asset: ${a.name}`);
              return res;
            }), refreshAssets)}
            onUpdateAsset={a => wrap(api.update('assets', a.id, a).then(res => {
              logActivity('Update Asset', 'Assets', `Updated asset: ${a.name}`);
              return res;
            }), refreshAssets)}
            onDeleteAsset={id => {
              const asset = assets.find(ast => ast.id === id);
              wrap(api.delete('assets', id).then(res => {
                logActivity('Delete Asset', 'Assets', `Decommissioned asset: ${asset?.name || id}`);
                return res;
              }), refreshAssets);
            }}
          />}
          {/* Fix: Added missing user prop to FileManager */}
          {currentView === 'files' && <FileManager user={user} onLogActivity={logActivity} />}
          {currentView === 'tasks' && <TaskBoard
            tasks={tasks || []}
            employees={filteredEmployees || []}
            user={user}
            onAddTask={t => {
              const payload = mapTaskToDb(t);
              wrap(api.create('tasks', payload).then(res => {
                logActivity('Create Task', 'Tasks', `Created task: ${t.title}`);
                return res;
              }), refreshTasks);
            }}
            onUpdateTask={t => {
              const payload = mapTaskToDb(t);
              wrap(api.update('tasks', t.id, payload).then(res => {
                logActivity('Update Task', 'Tasks', `Updated task: ${t.title}`);
                return res;
              }), refreshTasks);
            }}
          />}
          {currentView === 'recruitment' && <Recruitment
            departments={departments || []}
            jobs={jobs || []}
            candidates={candidates || []}
            systemConfig={systemConfig || {}}
            onAddJob={j => wrap(api.create('jobs', j).then(res => {
              logActivity('Create Job', 'Recruitment', `Posted new job: ${j.title}`);
              return res;
            }), refreshJobs)}
            onUpdateJob={j => wrap(api.update('jobs', j.id, j).then(res => {
              logActivity('Update Job', 'Recruitment', `Updated job: ${j.title}`);
              return res;
            }), refreshJobs)}
            onDeleteJob={id => {
              const job = jobs.find(jb => jb.id === id);
              wrap(api.delete('jobs', id).then(res => {
                logActivity('Delete Job', 'Recruitment', `Removed job posting: ${job?.title || id}`);
                return res;
              }), refreshJobs);
            }}
            onAddCandidate={c => wrap(api.create('candidates', c).then(res => {
              logActivity('Add Candidate', 'Recruitment', `Added candidate: ${c.name} for ${c.jobTitle}`);
              return res;
            }), refreshCandidates)}
            onUpdateCandidate={c => wrap(api.update('candidates', c.id, c).then(res => {
              logActivity('Update Candidate', 'Recruitment', `Updated candidate: ${c.name}`);
              return res;
            }), refreshCandidates)}
            onDeleteCandidate={id => {
              const cand = candidates.find(can => can.id === id);
              wrap(api.delete('candidates', id).then(res => {
                logActivity('Delete Candidate', 'Recruitment', `Removed candidate: ${cand?.name || id}`);
                return res;
              }), refreshCandidates);
            }}
          />}
          {currentView === 'attendance' && <Attendance
            user={user}
            records={attendance || []}
            timesheets={timesheets || []}
            shifts={shifts || []}
            leaves={leaves || []}
            onAddRecord={r => wrap(api.create('attendance', r).then(res => {
              logActivity('Add Attendance', 'Attendance', `Manually added attendance for ${r.employeeName}`);
              return res;
            }), refreshAttendance)}
            onUpdateRecord={r => wrap(api.update('attendance', r.id, r).then(res => {
              logActivity('Update Attendance', 'Attendance', `Updated attendance for ${r.employeeName}`);
              return res;
            }), refreshAttendance)}
            onDeleteRecord={id => {
              const record = attendance.find(a => a.id === id);
              wrap(api.delete('attendance', id).then(res => {
                logActivity('Delete Attendance', 'Attendance', `Removed attendance for ${record?.employeeName || id}`);
                return res;
              }), refreshAttendance);
            }}
            onUpdateTimesheet={t => wrap(api.update('timesheets', t.id, t).then(res => {
              logActivity('Update Timesheet', 'Attendance', `Updated timesheet for ${t.employeeName}`);
              return res;
            }), refreshTimesheets)}
            onDeleteTimesheet={id => {
              const ts = timesheets.find(t => t.id === id);
              wrap(api.delete('timesheets', id).then(res => {
                logActivity('Delete Timesheet', 'Attendance', `Removed timesheet for ${ts?.employeeName || id}`);
                return res;
              }), refreshTimesheets);
            }}
            onAddShift={s => wrap(api.create('shifts', s).then(res => {
              logActivity('Add Shift', 'Attendance', `Added shift: ${s.name}`);
              return res;
            }), refreshShifts)}
            onUpdateShift={s => wrap(api.update('shifts', s.id, s).then(res => {
              logActivity('Update Shift', 'Attendance', `Updated shift: ${s.name}`);
              return res;
            }), refreshShifts)}
            onDeleteShift={id => {
              const sh = shifts.find(sf => sf.id === id);
              wrap(api.delete('shifts', id).then(res => {
                logActivity('Delete Shift', 'Attendance', `Removed shift: ${sh?.name || id}`);
                return res;
              }), refreshShifts);
            }}
            onUpdateLeave={l => wrap(api.update('leaves', l.id, l).then(res => {
              logActivity('Update Leave', 'Attendance', `Updated leave request for ${l.employeeName}: ${l.status}`);
              return res;
            }), refreshLeaves)}
            onAddLeave={l => wrap(api.create('leaves', l).then(res => {
              logActivity('Apply Leave', 'Attendance', `New leave request from ${l.employeeName}`);
              return res;
            }), refreshLeaves)}
          />}
          {currentView === 'payroll' && <Payroll
            user={user}
            payrollRecords={payrollRecords || []}
            employees={filteredEmployees || []}
            attendance={attendance || []}
            timesheets={timesheets || []}
            reimbursements={reimbursements || []}
            onAddPayroll={p => wrap(api.create('payroll', p).then(res => {
              logActivity('Create Payroll', 'Payroll', `Generated payroll for ${p.employeeName}`);
              return res;
            }), refreshPayroll)}
            onUpdatePayroll={p => wrap(api.update('payroll', p.id, p).then(res => {
              logActivity('Update Payroll', 'Payroll', `Updated payroll record for ${p.employeeName}`);
              return res;
            }), refreshPayroll)}
            onDeletePayroll={id => {
              const pr = payrollRecords.find(p => p.id === id);
              wrap(api.delete('payroll', id).then(res => {
                logActivity('Delete Payroll', 'Payroll', `Removed payroll record for ${pr?.employeeName || id}`);
                return res;
              }), refreshPayroll);
            }}
            onUpdateEmployee={handleUpdateEmployee}
            onAddReimbursement={r => wrap(api.create('reimbursements', r).then(res => {
              logActivity('Add Reimbursement', 'Payroll', `New reimbursement for ${r.employeeName}: ${r.amount}`);
              return res;
            }), refreshReimbursements)}
            onUpdateReimbursement={r => wrap(api.update('reimbursements', r.id, r).then(res => {
              logActivity('Update Reimbursement', 'Payroll', `Updated reimbursement for ${r.employeeName}`);
              return res;
            }), refreshReimbursements)}
            onDeleteReimbursement={id => {
              const rb = reimbursements.find(r => r.id === id);
              wrap(api.delete('reimbursements', id).then(res => {
                logActivity('Delete Reimbursement', 'Payroll', `Removed reimbursement: ${rb?.amount || id}`);
                return res;
              }), refreshReimbursements);
            }}
          />}
          {currentView === 'holidays' && <HolidayCalendar
            user={user}
            holidays={holidays || []}
            onAddHoliday={h => wrap(api.create('holidays', h).then(res => {
              logActivity('Add Holiday', 'Settings', `Added holiday: ${h.name}`);
              return res;
            }), refreshHolidays)}
            onUpdateHoliday={h => wrap(api.update('holidays', h.id, h).then(res => {
              logActivity('Update Holiday', 'Settings', `Updated holiday: ${h.name}`);
              return res;
            }), refreshHolidays)}
            onDeleteHoliday={id => {
              const hol = holidays.find(h => h.id === id);
              wrap(api.delete('holidays', id).then(res => {
                logActivity('Delete Holiday', 'Settings', `Removed holiday: ${hol?.name || id}`);
                return res;
              }), refreshHolidays);
            }}
            onApplyLeave={() => setCurrentView('attendance')}
          />}
          {currentView === 'handbook' && <Handbook
            user={user}
            categories={policyCategories || []}
            policies={policies || []}
            onAddCategory={c => wrap(api.create('policy_categories', c).then(res => {
              logActivity('Add Category', 'Handbook', `Created category: ${c.name}`);
              return res;
            }), refreshPolicyCategories)}
            onUpdateCategory={c => wrap(api.update('policy_categories', c.id, c).then(res => {
              logActivity('Update Category', 'Handbook', `Updated category: ${c.name}`);
              return res;
            }), refreshPolicyCategories)}
            onDeleteCategory={id => wrap(api.delete('policy_categories', id).then(res => {
              logActivity('Delete Category', 'Handbook', `Removed category: ${id}`);
              return res;
            }), refreshPolicyCategories)}
            onAddPolicy={p => wrap(api.create('policies', p).then(res => {
              logActivity('Add Policy', 'Handbook', `Added policy: ${p.title}`);
              return res;
            }), refreshPolicies)}
            onUpdatePolicy={p => wrap(api.update('policies', p.id, p).then(res => {
              logActivity('Update Policy', 'Handbook', `Updated policy: ${p.title}`);
              return res;
            }), refreshPolicies)}
            onDeletePolicy={id => wrap(api.delete('policies', id).then(res => {
              logActivity('Delete Policy', 'Handbook', `Removed policy: ${id}`);
              return res;
            }), refreshPolicies)}
          />}
          {currentView === 'settings' && <Settings
            user={user}
            users={systemUsers || []}
            groups={groups || []}
            onAddGroup={g => wrap(api.create('permission_groups', g).then(res => {
              logActivity('Create Group', 'Settings', `Created permission group: ${g.name}`);
              return res;
            }), refreshGroups)}
            onUpdateGroup={g => wrap(api.update('permission_groups', g.id, g).then(res => {
              logActivity('Update Group', 'Settings', `Updated permission group: ${g.name}`);
              return res;
            }), refreshGroups)}
            onDeleteGroup={id => {
              const g = groups.find(group => group.id === id);
              wrap(api.delete('permission_groups', id).then(res => {
                logActivity('Delete Group', 'Settings', `Deleted permission group: ${g?.name || id}`);
                return res;
              }), refreshGroups);
            }}
            branches={visibleBranches || []}
            employees={employees || []}
            assets={assets || []}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
            onAddBranch={handleAddBranch}
            onUpdateBranch={handleUpdateBranch}
            onDeleteBranch={handleDeleteBranch}
            onUpdateEmployee={handleUpdateEmployee}
            onUpdateAsset={a => wrap(api.update('assets', a.id, a).then(res => {
              logActivity('Update Asset', 'Assets', `Updated asset: ${a.name}`);
              return res;
            }), refreshAssets)}
            onDeleteAsset={id => {
              const a = assets.find(asset => asset.id === id);
              wrap(api.delete('assets', id).then(res => {
                logActivity('Delete Asset', 'Assets', `Deleted asset: ${a?.name || id}`);
                return res;
              }), refreshAssets);
            }}
            systemConfig={systemConfig || {}}
            setSystemConfig={c => wrap(api.create('system_config', c).then(res => {
              logActivity('Update Config', 'Settings', 'Updated system configuration');
              return res;
            }), refreshConfig)}
            emailTemplates={emailTemplates || []}
            setEmailTemplates={t => wrap(api.create('email_templates', t).then(res => {
              logActivity('Update Templates', 'Settings', 'Updated email templates');
              return res;
            }), refreshTemplates)}
            smtpSettings={smtpSettings || {}}
            setSmtpSettings={s => wrap(api.create('smtp_settings', s).then(res => {
              logActivity('Update SMTP', 'Settings', 'Updated SMTP settings');
              return res;
            }), refreshSmtp)}
            notificationSettings={notificationSettings || {}}
            setNotificationSettings={n => wrap(api.create('notification_settings', n).then(res => {
              logActivity('Update Notifications', 'Settings', 'Updated notification preferences');
              return res;
            }), refreshNotifs)}
            onNavigate={handleNavigate}
            onSelectBranch={setSelectedBranchId}
            onViewEmployee={handleViewEmployeeProfile}
            leaves={leaves || []}
            reimbursements={reimbursements || []}
            logs={logs || []}
            onRefreshLogs={refreshLogs}
          />}
          {currentView === 'email' && <EmailWorkflow onLogActivity={logActivity} />}
          <div className="max-w-7xl mx-auto w-full">
            <CopyrightNotice footerSettings={systemConfig.footerSettings} />
          </div>
        </div><div className="h-6"></div></main>
      </div>
    </div>
  );
};

export default () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
