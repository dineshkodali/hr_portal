import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, Shield, Lock, Save, Bell, Plus, Users, Trash2, X,
  Database, Mail, Check, Building, Edit, MapPin, Phone, Globe,
  Eye, Monitor, FileText, Upload, Wallet, Server, Wifi, WifiOff, List,
  Settings as SettingsIcon, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, ArrowRight, ClipboardList, Receipt, Download, ShieldCheck, ShieldOff, Bot,
  RotateCcw, Send, AtSign, EyeOff, Search
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole, SettingsProps, Branch, Group, SystemConfig, EmailTemplate, RolePermission, Employee, Asset, LeaveRequest, Reimbursement } from '../types';
import { defaultNotificationSettings } from '../constants/defaultNotificationSettings';
import { defaultFeatureToggles, FeatureToggle } from '../constants/featureToggles';
import SecuritySettings from './SecuritySettings';
import CopyrightPage from './CopyrightPage';
import CopyrightNotice from './CopyrightNotice';
import AIHRSettings from '../AI/AIHRAssistant/AIHRSettings';
import ActivityLogs from './ActivityLogs';
import { History } from 'lucide-react';

const Settings: React.FC<SettingsProps> = (props) => {
  const {
    user,
    users = [],
    groups = [],
    onAddGroup,
    onUpdateGroup,
    onDeleteGroup,
    onAddPermissionGroup,
    onUpdatePermissionGroup,
    onDeletePermissionGroup,
    onAddUser,
    onDeleteUser,
    onUpdateUser,
    branches = [],
    employees = [],
    assets = [],
    onAddBranch,
    onUpdateBranch,
    onDeleteBranch,
    onUpdateEmployee,
    onUpdateAsset,
    onDeleteAsset,
    systemConfig = {} as SystemConfig,
    setSystemConfig,
    emailTemplates = [],
    setEmailTemplates,
    smtpSettings = {} as any,
    setSmtpSettings,
    notificationSettings: propNotificationSettings = [],
    setNotificationSettings: setPropNotificationSettings,
    leaves = [],
    reimbursements = [],
    logs = [],
    onRefreshLogs,
  } = props;

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const isSuperAdmin = user.role === "super_admin";
  const isEmployee = user.role === "employee";

  // --- FEATURE TOGGLES (Super Admin Only) ---
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>(defaultFeatureToggles);

  // --- AI Model Selection (shared with AIHRSettings) ---
  const [aiModel, setAiModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiModel') || 'default';
    }
    return 'default';
  });

  // --- Email Config State ---
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    useSsl: false,
    fromName: '',
    fromEmail: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // --- Notification Settings State ---
  const [notificationsLocal, setNotificationsLocal] = useState(propNotificationSettings);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const initial: { [key: string]: boolean } = {};
    defaultNotificationSettings.forEach(s => {
      initial[`${s.module}_${s.action}`] = s.enabled;
    });
    return initial;
  });

  const toggleNotification = (key: string) => {
    setNotificationsEnabled(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch notification settings for the current user
  const fetchNotificationSettings = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`notification_settings?userId=${user.id}`);
      if (Array.isArray(res) && res.length > 0) {
        setNotificationsLocal(res);
      } else {
        const settingsWithUser = defaultNotificationSettings.map(s => {
          let type = s.type || s.module || 'general';
          if (!type || typeof type !== 'string' || type.trim() === '') {
            type = 'general';
          }
          return { ...s, userId: user.id, type };
        });
        setNotificationsLocal(settingsWithUser);
        for (const setting of settingsWithUser) {
          try {
            await api.createNotificationSetting(setting);
          } catch (e) { }
        }
      }
    } catch (e) {
      setNotificationsLocal([]);
    }
  };
  const handleToggleFeature = (key: string) => {
    setFeatureToggles(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
    // TODO: Optionally persist to backend
  };

  const [activeTab, setActiveTab] = useState<string>(
    isEmployee ? "profile" : "users"
  );
  const [usersList, setUsersList] = useState<User[]>(users);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await api.get("users/list");
      setUsersList(res);
    } catch {
      setUsersList([]);
    }
  };

  // Fetch groups from backend
  const fetchGroups = async () => {
    try {
      const res = await api.get("permission_groups");
      setLocalGroups(res || []);
    } catch {
      setLocalGroups([]);
    }
  };

  const handleConfigUpdate = async (newConfig: SystemConfig) => {
    setSystemConfig(newConfig);
    try {
      await api.create('logs', {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        module: 'Settings',
        action: 'Update System Configuration',
        details: `System configuration updated by ${user.name}`,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to log config update", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'groups') fetchGroups();
    if (activeTab === 'notifications') {
      fetchNotificationSettings();
    }
    if (activeTab === 'logs') {
      onRefreshLogs?.();
    }
  }, [activeTab]);

  // After user creation/update, refresh list
  // const handleUserSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (!window.confirm(editingUser ? 'Are you sure you want to update this user?' : 'Are you sure you want to create this new user?')) {
  //         return;
  //     }
  //     if (userForm.name && userForm.email && userForm.password) {
  //         const payload: any = {
  //             name: userForm.name,
  //             email: userForm.email,
  //             password: userForm.password,
  //             role: userForm.role || 'employee',
  //             avatar: userForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.name || '')}&background=random`,
  //             designation: userForm.designation || '',
  //             branchIds: userForm.branchIds || [],
  //             accessModules: userForm.accessModules || ['dashboard'],
  //         };
  //         if (userForm.linkedEmployee) {
  //             payload.linkedEmployee = userForm.linkedEmployee;
  //         }
  //         await api.create('users', payload);
  //         setIsUserModalOpen(false);
  //         fetchUsers();
  //     } else {
  //         alert('Please fill all required fields (name, email, password)');
  //     }
  // };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = Boolean(editingUser);

    if (!userForm.name || !userForm.email) {
      alert("Name and Email are required");
      return;
    }

    if (!isEdit && !userForm.password) {
      alert("Password is required for new users");
      return;
    }

    if (!window.confirm(isEdit ? "Update this user?" : "Create this user?")) {
      return;
    }

    //  strip DB-managed fields
    const { id, created_at, updated_at, ...safeForm } = userForm as any;

    const payload: any = {
      name: safeForm.name,
      email: safeForm.email,
      role: safeForm.role || "employee",
      status: safeForm.status || "Active",
      designation: safeForm.designation || "",
      avatar:
        safeForm.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          safeForm.name
        )}&background=random`,
      branchIds: safeForm.branchIds || [],
      accessModules: safeForm.accessModules || ["dashboard"],
    };

    //  only include password when provided
    if (safeForm.password) {
      payload.password = safeForm.password;
    }

    //  linked employee (optional)
    if (safeForm.linkedEmployee) {
      payload.linkedEmployee = safeForm.linkedEmployee;
    }

    try {
      if (isEdit && editingUser) {
        await api.update("users", editingUser.id, payload); // ✅ UPDATE
      } else {
        await api.create("users", payload); // ✅ CREATE
      }

      setIsUserModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to save user");
    }
  };

  // --- STATE FOR MODALS & FORMS ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "employee",
    status: "Active",
    branchIds: [],
  });

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState<Partial<Group>>({
    name: "",
    description: "",
    permissions: [],
  });
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<Partial<Branch>>({
    name: "",
    city: "",
    currency: "USD",
    managerIds: [],
  });

  const [viewBranch, setViewBranch] = useState<Branch | null>(null);
  const [branchDetailTab, setBranchDetailTab] = useState<
    "overview" | "people" | "assets" | "documents"
  >("overview");

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [templateForm, setTemplateForm] = useState<Partial<EmailTemplate>>({
    name: "",
    subject: "",
    body: "",
  });

  const [configCategory, setConfigCategory] =
    useState<keyof SystemConfig>("departments");
  const [newItem, setNewItem] = useState("");
  const [branchDocName, setBranchDocName] = useState("");

  const [profileForm, setProfileForm] = useState<Partial<User>>({ name: user.name, email: user.email, phone: user.phone || '', address: user.address || '' });
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('disconnected');
  const [dbInfo, setDbInfo] = useState<any>(null);

  const roles: UserRole[] = [
    "super_admin",
    "admin",
    "manager",
    "hr",
    "finance",
    "team_lead",
    "employee",
  ];

  useEffect(() => {
    if (isAdmin) checkDbConnection();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'database') {
      fetchDbInfo();
    }
  }, [activeTab]);

  const fetchDbInfo = async () => {
    setDbInfo(null);
    try {
      const res = await fetch('/api/dbinfo');
      if (res.ok) {
        const info = await res.json();
        setDbInfo(info);
      } else {
        setDbInfo({ error: 'Failed to fetch database info' });
      }
    } catch (e) {
      setDbInfo({ error: 'Failed to fetch database info' });
    }
  };

  useEffect(() => {
    // Only sync from props if localGroups is empty
    if (localGroups.length === 0 && groups.length > 0) {
      setLocalGroups(groups);
    }
  }, [groups]);

  const checkDbConnection = async () => {
    setDbStatus("checking");
    const isConnected = await api.checkConnection();
    setDbStatus(isConnected ? "connected" : "disconnected");
  };

  // --- HANDLERS ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to update your profile?")) {
      return;
    }
    if (onUpdateUser) {
      onUpdateUser({ ...user, ...(profileForm as User) });

      // LOG ACTIVITY
      try {
        await api.create('logs', {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          module: 'Settings',
          action: 'Update Profile',
          details: `User updated their personal profile information: ${profileForm.name}`,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to log profile update", e);
      }

      alert("Profile Updated Successfully");
    }
  };

  const openUserModal = (u?: User) => {
    setEditingUser(u || null);
    setUserForm(
      u || {
        name: "",
        email: "",
        role: "employee",
        status: "Active",
        branchIds: [],
        designation: "",
      }
    );
    setIsUserModalOpen(true);
  };

  const openGroupModal = (g?: Group) => {
    setEditingGroup(g || null);
    setGroupForm(g || { name: "", description: "", permissions: [] });
    setIsGroupModalOpen(true);
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !window.confirm(
        editingGroup
          ? "Are you sure you want to update this permission group?"
          : "Are you sure you want to create this new permission group?"
      )
    ) {
      return;
    }
    if (groupForm.name) {
      const {
        id: _ignoredId,
        created_at,
        updated_at,
        ...safeGroupForm
      } = groupForm as any;

      const groupData: Group = {
        ...safeGroupForm,
        id: editingGroup ? editingGroup.id : `g-${Date.now()}`,
      };
      console.log("📤 Sending group data to API:", groupData);
      try {
        let result;
        if (editingGroup) {
          console.log("📝 Updating existing group:", groupData.id);
          result = await api.update("permission_groups", groupData.id, groupData);
          console.log("✅ Update response:", result);
          onUpdatePermissionGroup?.(groupData);
          setLocalGroups(prev =>
            prev.map(g => (g.id === groupData.id ? groupData : g))
          );
          //  optional external sync (permission-only)
          onUpdatePermissionGroup?.(groupData);
        } else {
          console.log("➕ Creating new group");
          result = await api.create("permission_groups", groupData);
          console.log("✅ Create response:", result);
          onAddPermissionGroup?.(groupData);
          setLocalGroups([...localGroups, groupData]);
        }
        setIsGroupModalOpen(false);
        alert("Permission group saved successfully!");
        // Refresh groups from database to confirm
        fetchGroups();
      } catch (error: any) {
        console.error("❌ Error saving group:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response,
          stack: error.stack,
        });
        alert(
          `Failed to save group to database: ${error.message || "Please try again."
          }`
        );
      }
    }
  };

  const handleDeletePermissionGroup = async (groupId: string) => {
    if (!window.confirm("Are you sure you want to delete this permission group?")) {
      return;
    }

    await api.delete("permission_groups", groupId);
    setLocalGroups(prev => prev.filter(g => g.id !== groupId));
    onDeletePermissionGroup?.(groupId);
  };

  const populateDefaultGroups = async () => {
    const defaultGroups: Group[] = [
      {
        id: 'g-super-admin',
        name: 'Super Admin Group',
        description: 'Full system access with all permissions',
        permissions: [
          { id: 'p-1', module: 'dashboard', read: true, create: true, update: true, delete: true },
          { id: 'p-2', module: 'employees', read: true, create: true, update: true, delete: true },
          { id: 'p-3', module: 'teams', read: true, create: true, update: true, delete: true },
          { id: 'p-4', module: 'assets', read: true, create: true, update: true, delete: true },
          { id: 'p-5', module: 'payroll', read: true, create: true, update: true, delete: true },
          { id: 'p-6', module: 'attendance', read: true, create: true, update: true, delete: true },
          { id: 'p-7', module: 'recruitment', read: true, create: true, update: true, delete: true },
          { id: 'p-8', module: 'tasks', read: true, create: true, update: true, delete: true },
          { id: 'p-9', module: 'files', read: true, create: true, update: true, delete: true },
          { id: 'p-10', module: 'settings', read: true, create: true, update: true, delete: true }
        ],
        memberIds: []
      },
      {
        id: 'g-hr-manager',
        name: 'HR Manager Group',
        description: 'HR operations with employee, recruitment, and leave management',
        permissions: [
          { id: 'p-11', module: 'dashboard', read: true, create: false, update: false, delete: false },
          { id: 'p-12', module: 'employees', read: true, create: true, update: true, delete: false },
          { id: 'p-13', module: 'teams', read: true, create: true, update: true, delete: false },
          { id: 'p-14', module: 'assets', read: true, create: false, update: false, delete: false },
          { id: 'p-15', module: 'payroll', read: true, create: false, update: false, delete: false },
          { id: 'p-16', module: 'attendance', read: true, create: true, update: true, delete: false },
          { id: 'p-17', module: 'recruitment', read: true, create: true, update: true, delete: true },
          { id: 'p-18', module: 'tasks', read: true, create: true, update: true, delete: false },
          { id: 'p-19', module: 'files', read: true, create: true, update: true, delete: false },
          { id: 'p-20', module: 'settings', read: true, create: false, update: false, delete: false }
        ],
        memberIds: []
      },
      {
        id: 'g-finance',
        name: 'Finance Group',
        description: 'Financial operations including payroll and reimbursements',
        permissions: [
          { id: 'p-21', module: 'dashboard', read: true, create: false, update: false, delete: false },
          { id: 'p-22', module: 'employees', read: true, create: false, update: false, delete: false },
          { id: 'p-23', module: 'teams', read: true, create: false, update: false, delete: false },
          { id: 'p-24', module: 'assets', read: true, create: false, update: false, delete: false },
          { id: 'p-25', module: 'payroll', read: true, create: true, update: true, delete: false },
          { id: 'p-26', module: 'attendance', read: true, create: false, update: false, delete: false },
          { id: 'p-27', module: 'recruitment', read: false, create: false, update: false, delete: false },
          { id: 'p-28', module: 'tasks', read: true, create: false, update: false, delete: false },
          { id: 'p-29', module: 'files', read: true, create: true, update: true, delete: false },
          { id: 'p-30', module: 'settings', read: false, create: false, update: false, delete: false }
        ],
        memberIds: []
      },
      {
        id: 'g-manager',
        name: 'Manager Group',
        description: 'Team management with approval permissions',
        permissions: [
          { id: 'p-31', module: 'dashboard', read: true, create: false, update: false, delete: false },
          { id: 'p-32', module: 'employees', read: true, create: false, update: true, delete: false },
          { id: 'p-33', module: 'teams', read: true, create: true, update: true, delete: false },
          { id: 'p-34', module: 'assets', read: true, create: false, update: false, delete: false },
          { id: 'p-35', module: 'payroll', read: true, create: false, update: false, delete: false },
          { id: 'p-36', module: 'attendance', read: true, create: true, update: true, delete: false },
          { id: 'p-37', module: 'recruitment', read: true, create: false, update: true, delete: false },
          { id: 'p-38', module: 'tasks', read: true, create: true, update: true, delete: true },
          { id: 'p-39', module: 'files', read: true, create: true, update: true, delete: false },
          { id: 'p-40', module: 'settings', read: false, create: false, update: false, delete: false }
        ],
        memberIds: []
      },
      {
        id: 'g-employee',
        name: 'Employee Group',
        description: 'Self-service access for regular employees',
        permissions: [
          { id: 'p-41', module: 'dashboard', read: true, create: false, update: false, delete: false },
          { id: 'p-42', module: 'employees', read: true, create: false, update: false, delete: false },
          { id: 'p-43', module: 'teams', read: true, create: false, update: false, delete: false },
          { id: 'p-44', module: 'assets', read: true, create: false, update: false, delete: false },
          { id: 'p-45', module: 'payroll', read: true, create: false, update: false, delete: false },
          { id: 'p-46', module: 'attendance', read: true, create: true, update: false, delete: false },
          { id: 'p-47', module: 'recruitment', read: false, create: false, update: false, delete: false },
          { id: 'p-48', module: 'tasks', read: true, create: false, update: true, delete: false },
          { id: 'p-49', module: 'files', read: true, create: false, update: false, delete: false },
          { id: 'p-50', module: 'settings', read: false, create: false, update: false, delete: false }
        ],
        memberIds: []
      }
    ];

    // Update local state immediately to show the groups
    setLocalGroups(defaultGroups);

    // Save each group to backend for persistence
    try {
      for (const group of defaultGroups) {
        await api.create('permission_groups', group);
        if (onAddGroup) {
          onAddGroup(group);
        }
      }
      alert('Default permission groups loaded successfully!');
    } catch (error) {
      console.error('Error saving groups:', error);
      alert('Groups displayed but may not persist. Check database connection.');
    }
  };

  const togglePermission = (
    module: string,
    action: "create" | "read" | "update" | "delete"
  ) => {
    const currentPerms = [...(groupForm.permissions || [])];
    const existingIdx = currentPerms.findIndex((p) => p.module === module);

    if (existingIdx >= 0) {
      currentPerms[existingIdx] = {
        ...currentPerms[existingIdx],
        [action]: !currentPerms[existingIdx][action as keyof RolePermission],
      };
    } else {
      currentPerms.push({
        id: `p-${Date.now()}`,
        module,
        create: action === "create",
        read: action === "read",
        update: action === "update",
        delete: action === "delete",
      });
    }
    setGroupForm({ ...groupForm, permissions: currentPerms });
  };

  const openBranchModal = (b?: Branch) => {
    setEditingBranch(b || null);
    setBranchForm(b || { name: "", city: "", currency: "USD", managerIds: [] });
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !window.confirm(
        editingBranch
          ? "Are you sure you want to update this branch?"
          : "Are you sure you want to create this new branch?"
      )
    ) {
      return;
    }
    if (branchForm.name) {
      // Remove any accidental updated_at from branchForm
      const { updated_at, ...branchFormSafe } = branchForm as any;
      const branchData = {
        ...branchFormSafe,
        id: editingBranch ? editingBranch.id : `b-${Date.now()}`,
      };

      try {
        if (editingBranch) onUpdateBranch(branchData);
        else onAddBranch(branchData);

        // LOG ACTIVITY
        await api.create('logs', {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          module: 'Branches',
          action: editingBranch ? 'Update Branch' : 'Create Branch',
          details: `${editingBranch ? 'Updated' : 'Created'} branch: ${branchData.name}`,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to save branch or log activity", e);
      }

      setIsBranchModalOpen(false);
    }
  };

  const handleAddStaffToBranch = (employeeId: string) => {
    if (!viewBranch) return;
    const emp = employees.find((e) => e.id === employeeId);
    if (emp && onUpdateEmployee) {
      // Remove any accidental 'branchid' (lowercase) property to avoid SQL error
      const { branchid, ...rest } = emp as any;
      onUpdateEmployee({ ...rest, branchId: viewBranch.id });
    }
  };

  const handleUploadBranchDoc = () => {
    if (branchDocName && viewBranch) {
      const updatedDocs = [...(viewBranch.documents || []), branchDocName];
      // Remove any accidental updated_at from viewBranch
      const { updated_at, ...viewBranchSafe } = viewBranch as any;
      onUpdateBranch({ ...viewBranchSafe, documents: updatedDocs });
      setViewBranch({ ...viewBranchSafe, documents: updatedDocs });
      setBranchDocName("");
    }
  };

  const handleDeleteBranchDoc = (docName: string) => {
    if (
      viewBranch &&
      window.confirm("Are you sure you want to delete this document?")
    ) {
      const updatedDocs = (viewBranch.documents || []).filter(
        (d) => d !== docName
      );
      // Remove any accidental updated_at from viewBranch
      const { updated_at, ...viewBranchSafe } = viewBranch as any;
      onUpdateBranch({ ...viewBranchSafe, documents: updatedDocs });
      setViewBranch({ ...viewBranchSafe, documents: updatedDocs });
    }
  };

  const handleRemoveAssetFromBranch = (assetId: string) => {
    if (
      onDeleteAsset &&
      window.confirm("Are you sure you want to remove this asset?")
    ) {
      onDeleteAsset(assetId);
    }
  };

  const SidebarItem = ({
    id,
    label,
    icon: Icon,
  }: {
    id: string;
    label: string;
    icon: any;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === id
        ? "bg-orange-50 text-orange-600"
        : "text-slate-600 hover:bg-slate-50"
        }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col p-4 space-y-1 overflow-y-auto flex-shrink-0">
        <div className="mb-4 px-4 pt-2 pb-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Account
          </h2>
        </div>
        <SidebarItem id="profile" label="My Profile" icon={UserIcon} />
        <SidebarItem id="security" label="Security & 2FA" icon={Lock} />
        {isEmployee && (
          <SidebarItem id="documents" label="My Documents" icon={FileText} />
        )}

        {isAdmin && (
          <>
            {isSuperAdmin && (
              <SidebarItem id="features" label="Features" icon={ToggleLeft} />
            )}
            <SidebarItem id="users" label="Users & Roles" icon={Users} />
            <SidebarItem id="groups" label="Permission Groups" icon={Shield} />
            <SidebarItem
              id="branches"
              label="Branch Management"
              icon={Building}
            />
            <div className="mt-6 mb-2 px-4 pt-4 pb-2 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System
              </h2>
            </div>
            <SidebarItem id="config" label="Configurations" icon={List} />
            <SidebarItem id="email" label="Email & SMTP" icon={Mail} />
            <SidebarItem id="notifications" label="Notifications" icon={Bell} />
            <SidebarItem id="ai-assistant" label="AI Assistant" icon={Bot} />
            <SidebarItem id="logs" label="Activity Logs" icon={History} />
            <SidebarItem id="database" label="Database" icon={Database} />
            <SidebarItem id="copyright" label="Copyright & Ownership" icon={ShieldCheck} />
            <button
              onClick={() => window.open("/appnote.html", "_blank")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-200 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 shadow-sm"
            >
              <FileText size={18} />
              <span className="font-semibold">App Details</span>
              <ArrowRight size={16} className="ml-auto" />
            </button>
          </>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8 flex justify-center">
        {activeTab === 'features' && isSuperAdmin && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Features Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <ToggleLeft size={140} />
              </div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                  <ToggleLeft size={28} className="text-orange-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight mb-1">Module Orchestration</h1>
                  <p className="text-slate-400 font-medium text-xs max-w-md">
                    Toggle system-wide functional capabilities and experimental feature branches.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                <Shield size={14} className="text-slate-400" />
                <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Access Control Matrix</span>
              </div>
              <div className="p-6 space-y-4">
                {featureToggles.map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-orange-500/20 transition-all group">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{feature.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{feature.description}</div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(feature.key)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${feature.enabled
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      {feature.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <AlertCircle size={14} className="text-blue-500" />
                  <p className="text-[10px] text-blue-700 font-medium italic">Only high-privileged administrators can modify system orchestration toggles.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "logs" && (
          <div className="w-[98%] mx-auto max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Logs Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <History size={140} />
              </div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                  <History size={28} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight mb-1">Administrative Protocols</h1>
                  <p className="text-slate-400 font-medium text-xs max-w-md">
                    Immutable transparency logs monitoring system-wide administrative state changes.
                  </p>
                </div>
              </div>
            </div>
            <ActivityLogs
              logs={isAdmin ? logs : logs.filter(l => l.userId === user.id)}
              onRefresh={onRefreshLogs}
            />
          </div>
        )}
        {activeTab === "profile" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Profile Hero Card */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <UserIcon size={140} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <img
                    src={profileForm.avatar && profileForm.avatar.trim() !== "" ? profileForm.avatar : user.avatar}
                    alt="avatar"
                    className="w-28 h-28 rounded-3xl border-4 border-white/10 object-cover shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || user.name || "User")}&background=E11D48&color=fff&bold=true`;
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-xl border-4 border-slate-900 shadow-xl">
                    <UserIcon size={14} />
                  </div>
                </div>

                <div className="text-center md:text-left space-y-3">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight">{profileForm.name}</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                      {profileForm.designation || user.designation}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span className="text-[10px] font-black uppercase tracking-wider">{user.role.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                      <Globe size={10} className="text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{user.status}</span>
                    </div>
                    {user.branchIds && user.branchIds.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                        <Building size={10} className="text-purple-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {branches.find((b) => b.id === user.branchIds[0])?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Identity & Contact Card */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Identity & Communications</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Display Name", value: profileForm.name, key: "name", icon: UserIcon },
                      { label: "Digital Mail", value: profileForm.email, key: "email", icon: Mail, disabled: true },
                      { label: "Primary Phone", value: profileForm.phone, key: "phone", icon: Phone },
                      { label: "Residential Locale", value: profileForm.address, key: "address", icon: MapPin },
                      { label: "Professional Title", value: profileForm.designation, key: "designation", icon: Shield },
                      { label: "Visual Identity (URL)", value: profileForm.avatar, key: "avatar", icon: Globe }
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                          <field.icon size={10} /> {field.label}
                        </label>
                        <input
                          className={`w-full bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-xs font-bold transition-all ${field.disabled ? 'opacity-60 cursor-not-allowed' : 'focus:bg-white focus:border-orange-500/30 outline-none'}`}
                          value={field.value || ""}
                          onChange={(e) => !field.disabled && setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                          disabled={field.disabled || !isAdmin}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                    <Lock size={14} className="text-slate-400" />
                    <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Infrastructure Access</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Branch Assignment</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500/30 outline-none transition-all"
                        value={user.branchIds?.[0] || ""}
                        disabled={!isAdmin}
                        onChange={(e) => isAdmin && setProfileForm({ ...profileForm, branchIds: [e.target.value] })}
                      >
                        <option value="">Select Branch</option>
                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Protocol Status</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500/30 outline-none transition-all"
                        value={user.status}
                        disabled={!isAdmin}
                        onChange={(e) => isAdmin && setProfileForm({ ...profileForm, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Privilege Tier</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500/30 outline-none transition-all"
                        value={user.role}
                        disabled={!isAdmin}
                        onChange={(e) => isAdmin && setProfileForm({ ...profileForm, role: e.target.value })}
                      >
                        {roles.map((r) => <option key={r} value={r}>{r.replace("_", " ").toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Action Side Column */}
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Neural Security</h4>
                    <div className="space-y-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Encryption Cipher</label>
                        <input
                          type="password"
                          className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-xs focus:bg-white outline-none"
                          placeholder="••••••••"
                          disabled={!isAdmin}
                        />
                      </div>
                      <button
                        type="button"
                        className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                        disabled={!isAdmin}
                      >
                        Cycle Credentials
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xs">
                        ID
                      </div>
                      <div className="text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Linked Employee</h3>
                        <p className="text-[10px] font-mono text-slate-400">{user.linkedEmployeeId || "UNLINKED"}</p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      type="submit"
                      className="w-full py-4 bg-orange-500 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                    >
                      Sync Profile
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="w-[98%] mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Security & 2FA Settings
            </h2>
            <SecuritySettings user={user} />
          </div>
        )}

        {activeTab === "ai-assistant" && (
          <div className="w-[98%] mx-auto max-w-4xl">
            <AIHRSettings user={user} aiModel={aiModel} setAiModel={setAiModel} />
          </div>
        )}

        {/* Pass aiModel to AIHRChat if used elsewhere in this file */}
        {/* Example usage: <AIHRChat currentUser={user} aiModel={aiModel} /> */}

        {activeTab === "users" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Users Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Users size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                    <Users size={28} className="text-orange-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight mb-1">Human Capital Directory</h1>
                    <p className="text-slate-400 font-medium text-xs max-w-md">
                      Orchestrate user identities, privilege tiers, and organizational access protocols.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openUserModal()}
                  className="relative z-20 flex items-center gap-2 px-6 py-3 bg-orange-500 rounded-2xl text-[10px] font-black text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest whitespace-nowrap"
                >
                  <Plus size={14} /> Provision User
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                <Shield size={14} className="text-slate-400" />
                <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Active Identity Base</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descriptor</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Privilege Tier</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Hub</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-10 h-10 rounded-2xl border border-slate-100 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f1f5f9&color=64748b&bold=true`;
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm tracking-tight">{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium lowercase font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200/50">
                            {u.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Building size={12} className="text-slate-300" />
                            {u.branchIds && u.branchIds.length > 0
                              ? branches.find((b) => b.id === u.branchIds[0])?.name
                              : "Global Hub"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${u.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}>
                            <span className={`w-1 h-1 rounded-full ${u.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                            {u.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openUserModal(u)}
                              className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                                  if (onDeleteUser) {
                                    onDeleteUser(u.id);
                                    setTimeout(fetchUsers, 500);
                                  }
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "branches" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Branches Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Building size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                    <Building size={28} className="text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight mb-1">Operational Geosystems</h1>
                    <p className="text-slate-400 font-medium text-xs max-w-md">
                      Global infrastructure management and localized asset orchestration across branch nodes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openBranchModal()}
                  className="relative z-20 flex items-center gap-2 px-6 py-3 bg-orange-500 rounded-2xl text-[10px] font-black text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest whitespace-nowrap"
                >
                  <Plus size={14} /> Establish Node
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group hover:border-orange-500/20 transition-all duration-300"
                >
                  <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openBranchModal(b)}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this branch? All associated data will be affected.")) {
                          onDeleteBranch(b.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 tracking-tight leading-none mb-1.5">{b.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <MapPin size={8} /> {b.city}, {b.country}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff Density</p>
                      <p className="text-xl font-black text-slate-800 tracking-tighter">
                        {employees.filter((e) => e.branchId === b.id).length}
                        <span className="text-[10px] text-slate-400 font-bold ml-1 tracking-normal">UNITS</span>
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Allocation</p>
                      <p className="text-xl font-black text-slate-800 tracking-tighter">
                        {assets.filter((a) => a.branchId === b.id).length}
                        <span className="text-[10px] text-slate-400 font-bold ml-1 tracking-normal">FOUND</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setViewBranch(b);
                      setBranchDetailTab("overview");
                    }}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-900/10"
                  >
                    Node Analytics <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Groups Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Shield size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                    <Shield size={28} className="text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight mb-1">Authorization Matrix</h1>
                    <p className="text-slate-400 font-medium text-xs max-w-md">
                      Define secure permission clusters and role-based access control hierarchies.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {localGroups.length === 0 && (
                    <button
                      onClick={populateDefaultGroups}
                      className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black text-white hover:bg-white/20 transition-all border border-white/10 uppercase tracking-widest"
                    >
                      <CheckCircle size={14} /> Restore Defaults
                    </button>
                  )}
                  <button
                    onClick={() => openGroupModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 rounded-2xl text-[10px] font-black text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest"
                  >
                    <Plus size={14} /> Define Cluster
                  </button>
                </div>
              </div>
            </div>

            {localGroups.length === 0 ? (
              <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-100 p-20 text-center shadow-inner">
                <Shield size={64} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">No Permission Chains Found</h3>
                <p className="text-slate-400 font-medium text-xs mb-8 max-w-sm mx-auto">
                  Permission groups organize and assign access rights. Start by loading default protocols or create a custom role.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {localGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group hover:border-purple-500/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100/50">
                        <Shield size={20} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openGroupModal(group)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePermissionGroup(group.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-black text-slate-800 text-lg mb-1 tracking-tight">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mb-6">
                      {group.description || "Experimental authorization chain definition."}
                    </p>

                    <div className="pt-4 border-t border-slate-50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Permissions</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500">{group.permissions.length} Units</span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {group.permissions.slice(0, 6).map((p) => {
                          const hasFullAccess = p.read && p.create && p.update && p.delete;
                          const hasNoAccess = !p.read && !p.create && !p.update && !p.delete;
                          return (
                            <div key={p.id} className="flex justify-between items-center group/row">
                              <span className="text-[11px] font-bold text-slate-600 capitalize">{p.module}</span>
                              <div className="flex gap-0.5">
                                {hasNoAccess ? (
                                  <div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                                    <X size={8} className="text-slate-400" />
                                  </div>
                                ) : hasFullAccess ? (
                                  <div className="w-10 h-4 bg-orange-500 rounded text-[8px] font-black text-white flex items-center justify-center uppercase">Full</div>
                                ) : (
                                  <div className="flex gap-0.5">
                                    {['read', 'create', 'update', 'delete'].map(act => (
                                      <div key={act} className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[7px] font-black uppercase ${p[act as keyof typeof p] ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                                        {act[0]}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {group.permissions.length > 6 && (
                          <div className="col-span-2 text-center pt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            + {group.permissions.length - 6} Additional Modules
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "config" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Config Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <List size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                    <List size={28} className="text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight mb-1">System Core Parameters</h1>
                    <p className="text-slate-400 font-medium text-xs max-w-md">
                      Global orchestration of organizational entities, asset classifications, and portal behaviors.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleConfigUpdate({
                    ...systemConfig,
                    departments: systemConfig.departments?.length ? systemConfig.departments : ["Human Resources", "Engineering", "Sales", "Operations"],
                    assetCategories: systemConfig.assetCategories?.length ? systemConfig.assetCategories : ["Laptop", "Monitor", "Phone", "Furniture"],
                    jobTypes: systemConfig.jobTypes?.length ? systemConfig.jobTypes : ["Full Time", "Part Time", "Contract"],
                    leaveTypes: systemConfig.leaveTypes?.length ? systemConfig.leaveTypes : ["Sick Leave", "Paid Time Off", "Casual Leave"],
                    designations: systemConfig.designations?.length ? systemConfig.designations : ["Manager", "Team Lead", "Software Engineer", "Intern"],
                    portalSettings: { ...(systemConfig.portalSettings || {}), allowEmployeeProfileEdit: true, allowEmployeePhotoUpload: true, allowEmployeeAddressEdit: false, allowEmployeeBankEdit: false },
                  })}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black text-white hover:bg-white/20 transition-all border border-white/10 uppercase tracking-widest whitespace-nowrap"
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Selector Card */}
              <div className="md:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                  <SettingsIcon size={14} className="text-slate-400" />
                  <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Registry Category</span>
                </div>
                <div className="p-4 space-y-1">
                  {[
                    { id: 'departments', label: 'Departments', icon: Building },
                    { id: 'assetCategories', label: 'Asset Library', icon: Database },
                    { id: 'jobTypes', label: 'Employment Tiers', icon: UserIcon },
                    { id: 'leaveTypes', label: 'Absence Protocols', icon: Bell },
                    { id: 'designations', label: 'Role Designations', icon: Shield },
                    { id: 'portalSettings', label: 'Portal Behaviors', icon: Globe }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setConfigCategory(cat.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${configCategory === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <cat.icon size={14} className={configCategory === cat.id ? 'text-emerald-400' : 'text-slate-300'} />
                      <span className="text-[11px] font-black uppercase tracking-wider">{cat.label}</span>
                      {configCategory === cat.id && <div className="ml-auto w-1 h-3 bg-emerald-400 rounded-full"></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Card */}
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Data Collection</span>
                  </div>
                </div>

                <div className="p-6">
                  {configCategory !== "portalSettings" ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {((systemConfig as any)[configCategory] || []).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                            <span className="text-xs font-bold text-slate-700">{item}</span>
                            <button
                              onClick={() => {
                                const arr = [...((systemConfig as any)[configCategory] || [])];
                                arr.splice(idx, 1);
                                setSystemConfig({ ...systemConfig, [configCategory]: arr });
                              }}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-slate-50">
                        <input
                          value={newItem}
                          onChange={(e) => setNewItem(e.target.value)}
                          placeholder={`Add new ${configCategory}...`}
                          className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs font-bold focus:bg-white outline-none transition-all"
                        />
                        <button
                          onClick={() => {
                            if (!newItem) return;
                            const arr = [...((systemConfig as any)[configCategory] || []), newItem];
                            setSystemConfig({ ...systemConfig, [configCategory]: arr });
                            setNewItem("");
                          }}
                          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                        >
                          Inject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'allowEmployeeProfileEdit', label: 'Profile Orchestration', sub: 'Enable administrative profile overrides' },
                        { id: 'allowEmployeePhotoUpload', label: 'Visual Identification', sub: 'Bio-visual data synchronization' },
                        { id: 'allowEmployeeAddressEdit', label: 'Geospatial Registry', sub: 'Residential data modifications' },
                        { id: 'allowEmployeeBankEdit', label: 'Financial Gateways', sub: 'Banking infrastructure updates' }
                      ].map(setting => (
                        <div key={setting.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-emerald-500/20 transition-all duration-300">
                          <div>
                            <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{setting.label}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{setting.sub}</div>
                          </div>
                          <button
                            onClick={() => setSystemConfig({
                              ...systemConfig,
                              portalSettings: { ...(systemConfig.portalSettings || {}), [setting.id]: !(systemConfig.portalSettings as any)?.[setting.id] },
                            })}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${(systemConfig.portalSettings as any)?.[setting.id]
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-white text-slate-400 border border-slate-100'
                              }`}
                          >
                            {(systemConfig.portalSettings as any)?.[setting.id] ? "Online" : "Offline"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Notifications Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Bell size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                    <Bell size={28} className="text-yellow-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight mb-1">Signal Processing Center</h1>
                    <p className="text-slate-400 font-medium text-xs max-w-md">
                      Configure event-driven telemetry and automated notification pathways across the enterprise.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'employee_joining', label: 'Onboarding Pulsing', sub: 'Signal newly integrated personnel entities' },
                { id: 'employee_resignation', label: 'Offboarding Telemetry', sub: 'Track personnel departure protocols' },
                { id: 'leave_request', label: 'Absence Logistics', sub: 'Monitor personnel request/approval cycles' },
                { id: 'asset_request', label: 'Resource Allocation', sub: 'Track hardware deployment requests' },
                { id: 'document_expiry', label: 'Protocol Expiration', sub: 'Alert on decaying document validity' }
              ].map(item => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-yellow-500/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-black text-slate-800 tracking-tight leading-none mb-1.5 uppercase text-[12px]">{item.label}</h3>
                      <div className="text-[10px] text-slate-400 font-bold tracking-wider">{item.sub}</div>
                    </div>
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl border border-yellow-100/50">
                      <Bell size={14} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {['Push', 'Email', 'SMS'].map(mode => {
                      const modeKey = `${item.id}_${mode.toLowerCase()}`;
                      const isEnabled = notificationsEnabled[modeKey];
                      return (
                        <button
                          key={mode}
                          onClick={() => toggleNotification(modeKey)}
                          className={`flex-1 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${isEnabled
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-slate-50 text-slate-300 border border-slate-100'
                            }`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "email" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Email Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Mail size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                    <Mail size={28} className="text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight mb-1">STMP Messaging Gateway</h1>
                    <p className="text-slate-400 font-medium text-xs max-w-md">
                      Global SMTP infrastructure management and encrypted transactional communication protocols.
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const loadingToast = document.createElement('div');
                    loadingToast.className = "fixed bottom-5 right-5 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-bounce z-50";
                    loadingToast.innerHTML = `<div class="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div><span class="text-[10px] font-black uppercase tracking-widest">Disseminating Probe...</span>`;
                    document.body.appendChild(loadingToast);
                    await new Promise(r => setTimeout(r, 2000));
                    document.body.removeChild(loadingToast);
                    alert("Probe dissemination successful. Connectivity established.");
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500 rounded-2xl text-[10px] font-black text-white hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest whitespace-nowrap"
                >
                  <Send size={14} /> Send Probe
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Protocol Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Server size={14} className="text-slate-400" />
                  <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Transmission Nodes</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relay Host</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input
                        type="text"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold focus:bg-white outline-none transition-all"
                        placeholder="smtp.example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocol Port</label>
                      <input
                        type="text"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-xs font-bold focus:bg-white outline-none transition-all"
                        placeholder="587"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Encryption</label>
                      <div className="flex items-center justify-between h-[48px] bg-slate-50 border border-slate-100 px-4 rounded-2xl">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">TLS/SSL</span>
                        <button
                          onClick={() => setEmailConfig({ ...emailConfig, useSsl: !emailConfig.useSsl })}
                          className={`w-10 h-5 rounded-full transition-all relative ${emailConfig.useSsl ? 'bg-cyan-500' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${emailConfig.useSsl ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Lock size={14} className="text-slate-400" />
                  <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Credential Tier</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity UID</label>
                    <input
                      type="text"
                      value={emailConfig.smtpUser}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-xs font-bold focus:bg-white outline-none transition-all"
                      placeholder="service-account"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Token</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={emailConfig.smtpPass}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-xs font-bold focus:bg-white outline-none transition-all pr-12"
                        placeholder="••••••••••••"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Origin Card */}
              <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <AtSign size={14} className="text-slate-400" />
                  <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Source Identity Inflection</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Originator Appellation</label>
                    <input
                      type="text"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-xs font-bold focus:bg-white outline-none transition-all"
                      placeholder="Enterprise HR Systems"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Return-Path Address</label>
                    <input
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-xs font-bold focus:bg-white outline-none transition-all"
                      placeholder="no-reply@enterprise.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "database" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Database Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Database size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
                    <Database size={28} className="text-orange-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight mb-1">Database Architecture</h1>
                    <p className="text-slate-400 font-medium text-xs max-w-md">
                      Real-time synchronization and secure relational data integrity systems.
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${dbStatus === 'connected' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                  dbStatus === 'checking' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                    'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-orange-500 animate-pulse' : dbStatus === 'checking' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{dbStatus}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Connection Specs Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                  <SettingsIcon size={14} className="text-slate-400" />
                  <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Connection Specifications</span>
                </div>
                <div className="p-6">
                  {dbInfo === null ? (
                    <div className="flex items-center justify-center py-8 gap-3 text-slate-400">
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Validating connection...</span>
                    </div>
                  ) : dbInfo.error ? (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                      <X size={18} className="text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700">Authentication Failure</p>
                        <p className="text-xs text-red-600 font-mono mt-1">{dbInfo.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Environment", value: dbInfo.database, icon: Database },
                          { label: "Encryption", value: dbInfo.user, icon: Shield },
                          { label: "Protocol", value: dbInfo.host, icon: WifiOff },
                          { label: "Interface", value: dbInfo.port, icon: SettingsIcon }
                        ].map((item, i) => (
                          <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-orange-500/30 hover:shadow-md transition-all duration-300">
                            <item.icon size={14} className="text-slate-300 mb-2 group-hover:text-orange-500 transition-colors" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-xs font-mono text-slate-800 font-bold break-all">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Directory Grid */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
                            {dbInfo.tables?.length || 0}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Schema Directory</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Active relational collections found in {dbInfo.database}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {dbInfo.tables && dbInfo.tables.length > 0 ? dbInfo.tables.map((t: string) => (
                            <div key={t} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 hover:border-orange-500/20 hover:bg-orange-50/10 transition-all group cursor-default">
                              <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-orange-500 transition-colors"></div>
                              <span className="font-mono text-[11px] text-slate-600 font-medium truncate">{t}</span>
                            </div>
                          )) : (
                            <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest italic">No table definitions found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "copyright" && (
          <div className="w-[98%] mx-auto max-w-4xl">
            <CopyrightPage
              systemConfig={systemConfig}
              setSystemConfig={handleConfigUpdate}
              isAdmin={isAdmin}
            />
          </div>
        )}
        {/* --- MODALS --- */}
      </div>

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={userForm.password || ""}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Designation
                </label>
                <input
                  value={userForm.designation || ""}
                  onChange={(e) =>
                    setUserForm({ ...userForm, designation: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Avatar URL
                </label>
                <input
                  value={userForm.avatar || ""}
                  onChange={(e) =>
                    setUserForm({ ...userForm, avatar: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Branch
                </label>
                <select
                  value={userForm.branchIds?.[0] || ""}
                  onChange={(e) =>
                    setUserForm({ ...userForm, branchIds: [e.target.value] })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Role
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={userForm.status}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Linked Employee (optional)
                </label>
                <input
                  value={userForm.linkedEmployee?.name || ""}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      linkedEmployee: {
                        ...(userForm.linkedEmployee || {}),
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                  placeholder="Employee Name"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Permission Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {editingGroup
                  ? "Edit Group Permissions"
                  : "Create Permission Group"}
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleGroupSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Group Name
                  </label>
                  <input
                    value={groupForm.name}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, name: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Description
                  </label>
                  <input
                    value={groupForm.description}
                    onChange={(e) =>
                      setGroupForm({
                        ...groupForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">
                  Module Permissions
                </h4>
                {[
                  "dashboard",
                  "employees",
                  "teams",
                  "assets",
                  "payroll",
                  "attendance",
                  "recruitment",
                  "tasks",
                  "files",
                  "settings",
                ].map((mod) => {
                  const perm = groupForm.permissions?.find(
                    (p) => p.module === mod
                  ) || {
                    read: false,
                    create: false,
                    update: false,
                    delete: false,
                  };
                  return (
                    <div
                      key={mod}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <span className="font-bold text-slate-700 capitalize text-sm">
                        {mod}
                      </span>
                      <div className="flex gap-6">
                        {["read", "create", "update", "delete"].map(
                          (action) => (
                            <label
                              key={action}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={!!perm[action as keyof typeof perm]}
                                onChange={() =>
                                  togglePermission(mod, action as any)
                                }
                                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                              />
                              <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-600 transition-colors">
                                {action}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-6 py-2.5 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-2.5 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BRANCH DETAIL MODAL --- */}
      {viewBranch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b bg-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {viewBranch.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-1">
                  <MapPin size={12} /> {viewBranch.city}, {viewBranch.country}
                </p>
              </div>
              <button
                onClick={() => setViewBranch(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-white overflow-x-auto gap-8">
              {["overview", "people", "assets", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBranchDetailTab(tab as any)}
                  className={`py-4 text-sm font-bold capitalize border-b-2 transition-all whitespace-nowrap ${branchDetailTab === tab
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
              {branchDetailTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-6">
                      Branch Details
                    </h4>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400 font-medium">
                          Manager
                        </span>
                        <span className="font-bold text-slate-800">
                          {viewBranch.managerName || "Tony Stark"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400 font-medium">
                          Currency
                        </span>
                        <span className="font-bold text-slate-800">
                          {viewBranch.currency || "USD"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400 font-medium">
                          Phone
                        </span>
                        <span className="font-bold text-slate-800">
                          {viewBranch.phone || "+1 212-555-0100"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400 font-medium">
                          Email
                        </span>
                        <span className="font-bold text-slate-800">
                          {viewBranch.email || "ny@company.com"}
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">
                          Address
                        </span>
                        <div className="bg-slate-50 p-3 rounded-lg text-slate-700 font-medium border border-slate-100">
                          {viewBranch.address || "10880 Malibu Point"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-fit">
                    <h4 className="text-sm font-bold text-slate-800 mb-6">
                      Quick Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-blue-50 rounded-2xl text-center border border-blue-100/50">
                        <p className="text-3xl font-black text-blue-600">
                          {
                            employees.filter(
                              (e) => e.branchId === viewBranch.id
                            ).length
                          }
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          Employees
                        </p>
                      </div>
                      <div className="p-5 bg-orange-50 rounded-2xl text-center border border-orange-100/50">
                        <p className="text-3xl font-black text-orange-600">
                          {
                            assets.filter((a) => a.branchId === viewBranch.id)
                              .length
                          }
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          Assets
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {branchDetailTab === 'people' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-4 border-b bg-white flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-800">Managers</h4>
                      <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1 hover:bg-blue-100">+ Add Manager</button>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Manager list and controls go here */}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase"><tr><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                          {employees.filter(e => e.branchId === viewBranch.id).map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">{emp.name.split(' ').map(n => n[0]).join('')}</div><span className="font-bold text-slate-700 text-xs">{emp.name}</span></div></td>
                              <td className="p-4 text-xs font-medium text-slate-400">{emp.designation}</td>
                              <td className="p-4 text-right"><button onClick={() => handleAddStaffToBranch(emp.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors" title="Remove from Branch"><X size={16} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {branchDetailTab === "documents" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Document Name (e.g. Lease Agreement)"
                        value={branchDocName}
                        onChange={(e) => setBranchDocName(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none"
                      />
                      <button
                        onClick={handleUploadBranchDoc}
                        className="bg-orange-500 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-white">
                      <h4 className="text-sm font-bold text-slate-800">
                        Branch Documents
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {viewBranch.documents &&
                        viewBranch.documents.length > 0 ? (
                        viewBranch.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                <FileText size={20} />
                              </div>
                              <span className="font-bold text-slate-700 text-sm">
                                {doc}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                                <Download size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteBranchDoc(doc)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400 font-medium italic">
                          No documents found for this branch.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {branchDetailTab === "assets" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveTab("assets")}
                      className="text-xs font-bold text-orange-600 hover:underline"
                    >
                      Go to Asset Management to Assign Assets
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assets
                      .filter((a) => a.branchId === viewBranch.id)
                      .map((asset) => (
                        <div
                          key={asset.id}
                          className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                              <Monitor size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {asset.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {asset.serialNumber}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveAssetFromBranch(asset.id)
                            }
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    {assets.filter((a) => a.branchId === viewBranch.id)
                      .length === 0 && (
                        <div className="col-span-2 text-center py-12 text-slate-400 font-medium italic">
                          No assets assigned to this branch.
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Branch Add Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {editingBranch ? "Edit Branch" : "Add Branch"}
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBranchSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Branch Name */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Branch Name *
                  </label>
                  <input
                    value={branchForm.name || ""}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, name: e.target.value })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    value={branchForm.location || ""}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, location: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    City
                  </label>
                  <input
                    value={branchForm.city || ""}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, city: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    State
                  </label>
                  <input
                    value={branchForm.state || ""}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, state: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>

                {/* Zipcode */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Zip Code
                  </label>
                  <input
                    value={branchForm.zipcode || ""}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, zipcode: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Country
                  </label>
                  <input
                    value={branchForm.country || ""}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, country: e.target.value })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Manager IDs */}
              <div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">
                    Branch Managers
                  </label>

                  <div className="max-h-48 overflow-y-auto border rounded-xl p-3 space-y-2 bg-slate-50">
                    {employees.length === 0 && (
                      <p className="text-xs text-slate-400 italic">
                        No employees found
                      </p>
                    )}

                    {employees.map((emp) => {
                      const checked = branchForm.managerids?.includes(emp.id);

                      return (
                        <label
                          key={emp.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const current = branchForm.managerids || [];
                              const updated = e.target.checked
                                ? [...current, emp.id]
                                : current.filter((id) => id !== emp.id);

                              setBranchForm({
                                ...branchForm,
                                managerids: updated,
                              });
                            }}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">
                              {emp.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {emp.designation || "Employee"}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-6 py-2.5 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}





      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {editingTemplate ? "Edit Email Template" : "New Email Template"}
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Template Saved");
                setIsTemplateModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Template Name
                </label>
                <input
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, name: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Subject Line
                </label>
                <input
                  value={templateForm.subject}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      subject: e.target.value,
                    })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                  Email Content (HTML Supported)
                </label>
                <textarea
                  value={templateForm.body}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, body: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm h-64 font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-6 py-2.5 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-2.5 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* Fix: Added default export for Settings component */
export default Settings;
