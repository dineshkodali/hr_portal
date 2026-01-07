
import React, { useState, useEffect } from 'react';
import { 
    User as UserIcon, Shield, Lock, Save, Bell, Plus, Users, Trash2, X, 
    Database, Mail, Check, Building, Edit, MapPin, Phone, Globe, Hash, 
    Eye, Monitor, FileText, Upload, Wallet, Server, Wifi, WifiOff, List,
    ToggleLeft, ToggleRight, CheckCircle, AlertCircle, ArrowRight, ClipboardList, Receipt, Download, ShieldCheck, ShieldOff
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole, SettingsProps, Branch, Group, SystemConfig, EmailTemplate, RolePermission, Employee, Asset, LeaveRequest, Reimbursement } from '../types';
import { defaultNotificationSettings } from '../constants/defaultNotificationSettings';
import SecuritySettings from './SecuritySettings';
import CopyrightPage from './CopyrightPage';

import AIHRSettings from '../AI/AIHRAssistant/AIHRSettings';

export const Settings: React.FC<SettingsProps> = ({
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
  notificationSettings = {} as any,
  setNotificationSettings,
  leaves = [],
  reimbursements = [],
}) => {
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const isEmployee = user.role === "employee";

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

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'groups') fetchGroups();
        // Initialize notification settings if empty
        if (activeTab === 'notifications' && notificationSettings && notificationSettings.length === 0) {
            // Attach userId and type to each default notification setting
            const userId = user.id;
            const settingsWithUser = defaultNotificationSettings.map(s => ({
                ...s,
                userId,
                type: s.type || s.module || 'general', // fallback if type missing
            }));
            setNotificationSettings(settingsWithUser);
            // Optionally, persist to backend
            settingsWithUser.forEach(async (setting) => {
                try {
                    await api.createNotificationSetting(setting);
                } catch (e) {
                    // Optionally handle error
                    // console.error('Failed to create notification setting', e);
                }
            });
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
    // currency: "USD",
    // managerIds: [],
    location: "",
    country: "",
    managerids: [],
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
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to update your profile?")) {
      return;
    }
    if (onUpdateUser) {
      onUpdateUser({ ...user, ...(profileForm as User) });
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
          `Failed to save group to database: ${
            error.message || "Please try again."
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

  if (!branchForm.name) {
    alert("Branch name is required");
    return;
  }

  const payload = {
  id: editingBranch ? editingBranch.id : `b-${Date.now()}`,
  name: branchForm.name?.trim(),
  city: branchForm.city?.trim(),
  location: branchForm.location?.trim(),
  country: branchForm.country?.trim(),

  //  IMPORTANT FIX
  managerids:
    Array.isArray(branchForm.managerids) &&
    branchForm.managerids.length > 0
      ? branchForm.managerids
      : null, //  send null instead of []
};

  try {
    if (editingBranch) {
      await onUpdateBranch?.(payload as Branch);
    } else {
      await onAddBranch?.(payload as Branch);
    }
    setIsBranchModalOpen(false);
  } catch (err) {
    console.error("Failed to save branch", err);
    alert("Failed to save branch");
  }
};
  const handleAddStaffToBranch = (employeeId: string) => {
    if (!viewBranch) return;
    const emp = employees.find((e) => e.id === employeeId);
    if (emp && onUpdateEmployee) {
      onUpdateEmployee({ ...emp, branchId: viewBranch.id });
    }
  };

  const handleUploadBranchDoc = () => {
    if (branchDocName && viewBranch) {
      const updatedDocs = [...(viewBranch.documents || []), branchDocName];
      onUpdateBranch({ ...viewBranch, documents: updatedDocs });
      setViewBranch({ ...viewBranch, documents: updatedDocs });
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
      onUpdateBranch({ ...viewBranch, documents: updatedDocs });
      setViewBranch({ ...viewBranch, documents: updatedDocs });
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
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
        activeTab === id
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
            <div className="mt-6 mb-2 px-4 pt-4 pb-2 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Administration
              </h2>
            </div>
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
        {activeTab === "profile" && (
          <div className="w-[98%] mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              My Profile
            </h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-6 items-center">
              <img
                src={
                  profileForm.avatar && profileForm.avatar.trim() !== ""
                    ? profileForm.avatar
                    : user.avatar
                }
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 border-slate-50 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(profileForm.name || user.name || "User");
                }}
              />
              <div className="flex-1">
                <h3 className="font-bold text-2xl text-slate-800 mb-1">
                  {profileForm.name}
                </h3>
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded">
                    {user.role.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    {user.status}
                  </span>
                  {user.branchIds && user.branchIds.length > 0 && (
                    <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded">
                      {branches.find((b) => b.id === user.branchIds[0])?.name}
                    </span>
                  )}
                </div>
                <div className="text-slate-500 text-sm mb-1">
                  {profileForm.designation || user.designation}
                </div>
                <div className="text-xs text-slate-400">
                  Joined:{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "-"}
                </div>
                {user.linkedEmployeeId && (
                  <div className="text-xs text-slate-400 mt-1">
                    Linked Employee: {user.linkedEmployeeId}
                  </div>
                )}
              </div>
            </div>
            <form
              onSubmit={handleUpdateProfile}
              className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    required
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg bg-slate-50"
                    value={profileForm.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        address: e.target.value,
                      })
                    }
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg"
                    value={profileForm.designation || ""}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        designation: e.target.value,
                      })
                    }
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg"
                    value={profileForm.avatar || ""}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, avatar: e.target.value })
                    }
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Branch
                  </label>
                  <select
                    className="w-full border p-2 rounded-lg"
                    value={
                      user.branchIds && user.branchIds.length > 0
                        ? user.branchIds[0]
                        : ""
                    }
                    disabled={!isAdmin}
                    onChange={(e) =>
                      isAdmin &&
                      setProfileForm({
                        ...profileForm,
                        branchIds: [e.target.value],
                      })
                    }
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full border p-2 rounded-lg"
                    value={user.role}
                    disabled={!isAdmin}
                    onChange={(e) =>
                      isAdmin &&
                      setProfileForm({ ...profileForm, role: e.target.value })
                    }
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full border p-2 rounded-lg"
                    value={user.status}
                    disabled={!isAdmin}
                    onChange={(e) =>
                      isAdmin &&
                      setProfileForm({ ...profileForm, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Linked Employee ID
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg bg-slate-50"
                    value={user.linkedEmployeeId || "-"}
                    disabled
                  />
                </div>
              </div>
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-bold text-slate-700 mb-4">
                  Change Password
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full border p-2 rounded-lg"
                      placeholder="Enter new password"
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="w-full border p-2 rounded-lg"
                      placeholder="Confirm new password"
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors"
                  disabled={!isAdmin}
                >
                  Update Password
                </button>
              </div>
              {isAdmin && (
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors mt-6"
                >
                  Save Changes
                </button>
              )}
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

        {activeTab === "users" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">
                  User Management
                </h2>
                <button
                  onClick={() => openUserModal()}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
                >
                  <Plus size={18} /> Add User
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                        User
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                        Role
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                        Branch
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                        Status
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full border border-slate-100"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-sm">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {u.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 capitalize">
                          {u.role.replace("_", " ")}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {u.branchIds && u.branchIds.length > 0
                            ? branches.find((b) => b.id === u.branchIds[0])
                                ?.name
                            : "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${
                              u.status === "Active"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openUserModal(u)}
                            className="p-2 text-slate-400 hover:text-blue-600 mr-2"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this user? This action cannot be undone."
                                )
                              ) {
                                if (onDeleteUser) {
                                  onDeleteUser(u.id);
                                  setTimeout(fetchUsers, 500);
                                }
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                Branch Operations
              </h2>
              <button
                onClick={() => openBranchModal()}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 font-bold"
              >
                <Plus size={18} /> Add Branch
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group hover:border-orange-200 transition-all"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openBranchModal(b)}
                      className="p-1 text-blue-500 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this branch? All associated data will be affected."
                          )
                        ) {
                          onDeleteBranch(b.id);
                        }
                      }}
                      className="p-1 text-red-500 bg-red-50 rounded hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <Building size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{b.name}</h3>
                      <p className="text-xs text-slate-500">
                        {b.city}, {b.country}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-4 mb-4">
                    <div className="flex justify-between">
                      <span>Staff Count:</span>{" "}
                      <span className="font-medium">
                        {employees.filter((e) => e.branchid === b.id).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assets:</span>{" "}
                      <span className="font-medium">
                        {assets.filter((a) => a.branchid === b.id).length}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setViewBranch(b);
                      setBranchDetailTab("overview");
                    }}
                    className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                Permission Groups
              </h2>
              <div className="flex gap-3">
                {localGroups.length === 0 && (
                  <button
                    onClick={populateDefaultGroups}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 font-medium"
                  >
                    <CheckCircle size={18} /> Load Default Groups
                  </button>
                )}
                <button
                  onClick={() => openGroupModal()}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 font-medium"
                >
                  <Plus size={18} /> Create Custom Group
                </button>
              </div>
            </div>

            {localGroups.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <Shield size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No Permission Groups Found
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Permission groups help you organize and assign access rights
                  to users. Start by loading default role-based groups or create
                  your own custom group.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={populateDefaultGroups}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-600 font-bold shadow-lg"
                  >
                    <CheckCircle size={20} /> Load 5 Default Groups
                  </button>
                  <button
                    onClick={() => openGroupModal()}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 font-bold shadow-lg"
                  >
                    <Plus size={20} /> Create Custom Group
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {localGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <Shield size={24} />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openGroupModal(group)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                             onClick={() => handleDeletePermissionGroup(group.id)}
                             className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"
                           >
                             <Trash2 size={16} />
                        </button>

                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      {group.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {group.description}
                    </p>
                    <div className="border-t border-slate-50 pt-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                        Permissions ({group.permissions.length} modules)
                      </div>
                      <div className="space-y-2">
                        {group.permissions.map((p) => {
                          const hasFullAccess =
                            p.read && p.create && p.update && p.delete;
                          const hasNoAccess =
                            !p.read && !p.create && !p.update && !p.delete;
                          return (
                            <div
                              key={p.id}
                              className="flex justify-between items-center text-xs"
                            >
                              <span className="font-bold text-slate-700 capitalize">
                                {p.module}
                              </span>
                              <div className="flex gap-1">
                                {hasNoAccess ? (
                                  <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-200">
                                    No Access
                                  </span>
                                ) : hasFullAccess ? (
                                  <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded border border-green-200">
                                    Full Access
                                  </span>
                                ) : (
                                  <>
                                    {p.read && (
                                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded border border-blue-200">
                                        R
                                      </span>
                                    )}
                                    {p.create && (
                                      <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded border border-green-200">
                                        C
                                      </span>
                                    )}
                                    {p.update && (
                                      <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold rounded border border-orange-200">
                                        U
                                      </span>
                                    )}
                                    {p.delete && (
                                      <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded border border-red-200">
                                        D
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "config" && (
          <div className="w-[98%] mx-auto max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                System Configurations
              </h2>
              <div>
                <button
                  onClick={() =>
                    setSystemConfig({
                      ...systemConfig,
                      departments:
                        systemConfig.departments &&
                        systemConfig.departments.length > 0
                          ? systemConfig.departments
                          : [
                              "Human Resources",
                              "Engineering",
                              "Sales",
                              "Operations",
                            ],
                      assetCategories:
                        systemConfig.assetCategories &&
                        systemConfig.assetCategories.length > 0
                          ? systemConfig.assetCategories
                          : ["Laptop", "Monitor", "Phone", "Furniture"],
                      jobTypes:
                        systemConfig.jobTypes &&
                        systemConfig.jobTypes.length > 0
                          ? systemConfig.jobTypes
                          : ["Full Time", "Part Time", "Contract"],
                      leaveTypes:
                        systemConfig.leaveTypes &&
                        systemConfig.leaveTypes.length > 0
                          ? systemConfig.leaveTypes
                          : ["Sick Leave", "Paid Time Off", "Casual Leave"],
                      designations:
                        systemConfig.designations &&
                        systemConfig.designations.length > 0
                          ? systemConfig.designations
                          : [
                              "Manager",
                              "Team Lead",
                              "Software Engineer",
                              "Intern",
                            ],
                      portalSettings: {
                        ...(systemConfig.portalSettings || {}),
                        allowEmployeeProfileEdit: true,
                        allowEmployeePhotoUpload: true,
                        allowEmployeeAddressEdit: false,
                        allowEmployeeBankEdit: false,
                      },
                    })
                  }
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm"
                >
                  Populate defaults
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-bold text-slate-500">
                  Category
                </label>
                <select
                  value={configCategory as string}
                  onChange={(e) => setConfigCategory(e.target.value as any)}
                  className="border p-2 rounded-lg text-sm"
                >
                  <option value="departments">Departments</option>
                  <option value="assetCategories">Asset Categories</option>
                  <option value="jobTypes">Job Types</option>
                  <option value="leaveTypes">Leave Types</option>
                  <option value="designations">Designations</option>
                  <option value="portalSettings">Portal Settings</option>
                </select>
              </div>

              {configCategory !== "portalSettings" ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {((systemConfig as any)[configCategory] || []).map(
                      (item: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="text-sm font-medium text-slate-700">
                            {item}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const arr = [
                                  ...((systemConfig as any)[configCategory] ||
                                    []),
                                ];
                                arr.splice(idx, 1);
                                setSystemConfig({
                                  ...systemConfig,
                                  [configCategory]: arr,
                                });
                              }}
                              className="text-red-500 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="New item"
                      className="flex-1 border p-2 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (!newItem) return;
                        const arr = [
                          ...((systemConfig as any)[configCategory] || []),
                          newItem,
                        ];
                        setSystemConfig({
                          ...systemConfig,
                          [configCategory]: arr,
                        });
                        setNewItem("");
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm font-bold">
                        Allow Profile Edit
                      </div>
                      <div className="text-xs text-slate-400">
                        Allow employees to edit their profile
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          setSystemConfig({
                            ...systemConfig,
                            portalSettings: {
                              ...(systemConfig.portalSettings || {}),
                              allowEmployeeProfileEdit:
                                !systemConfig.portalSettings
                                  ?.allowEmployeeProfileEdit,
                            },
                          })
                        }
                        className={`px-3 py-1 rounded-lg ${
                          systemConfig.portalSettings?.allowEmployeeProfileEdit
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {systemConfig.portalSettings?.allowEmployeeProfileEdit
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm font-bold">
                        Allow Photo Upload
                      </div>
                      <div className="text-xs text-slate-400">
                        Allow employees to upload profile photo
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          setSystemConfig({
                            ...systemConfig,
                            portalSettings: {
                              ...(systemConfig.portalSettings || {}),
                              allowEmployeePhotoUpload:
                                !systemConfig.portalSettings
                                  ?.allowEmployeePhotoUpload,
                            },
                          })
                        }
                        className={`px-3 py-1 rounded-lg ${
                          systemConfig.portalSettings?.allowEmployeePhotoUpload
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {systemConfig.portalSettings?.allowEmployeePhotoUpload
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm font-bold">
                        Allow Address Edit
                      </div>
                      <div className="text-xs text-slate-400">
                        Allow employees to change address
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          setSystemConfig({
                            ...systemConfig,
                            portalSettings: {
                              ...(systemConfig.portalSettings || {}),
                              allowEmployeeAddressEdit:
                                !systemConfig.portalSettings
                                  ?.allowEmployeeAddressEdit,
                            },
                          })
                        }
                        className={`px-3 py-1 rounded-lg ${
                          systemConfig.portalSettings?.allowEmployeeAddressEdit
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {systemConfig.portalSettings?.allowEmployeeAddressEdit
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="text-sm font-bold">Allow Bank Edit</div>
                      <div className="text-xs text-slate-400">
                        Allow employees to update bank details
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          setSystemConfig({
                            ...systemConfig,
                            portalSettings: {
                              ...(systemConfig.portalSettings || {}),
                              allowEmployeeBankEdit:
                                !systemConfig.portalSettings
                                  ?.allowEmployeeBankEdit,
                            },
                          })
                        }
                        className={`px-3 py-1 rounded-lg ${
                          systemConfig.portalSettings?.allowEmployeeBankEdit
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {systemConfig.portalSettings?.allowEmployeeBankEdit
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

            {activeTab === 'notifications' && (
                <div className="w-[98%] mx-auto max-w-4xl space-y-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Bell size={24} className="text-orange-500"/> Notification Settings</h3>
                            <button
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-all"
                                onClick={async () => {
                                    const userId = user.id;
                                    const updatedSettings = notificationSettings.map(s => ({
                                        ...s,
                                        userId: userId,
                                        type: s.type || s.module || 'general',
                                    }));
                                    setNotificationSettings(updatedSettings);
                                    for (const setting of updatedSettings) {
                                        try {
                                            const payload = {
                                                ...setting,
                                                userId: userId,
                                                type: setting.type || setting.module || 'general',
                                            };
                                            if (payload.id) {
                                                await api.updateNotificationSetting(payload.id, payload);
                                            } else {
                                                await api.createNotificationSetting(payload);
                                            }
                                        } catch (e) {
                                            // Optionally handle error
                                        }
                                    }
                                    alert('Notification settings saved!');
                                }}
                            >
                                Save All
                            </button>
                        </div>
                        {notificationSettings && notificationSettings.length > 0 ? (
                            <div className="space-y-4">
                                {notificationSettings.map((setting, idx) => (
                                    <div key={setting.id || idx} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">{setting.module} - {setting.action}</div>
                                            <div className="text-xs text-slate-400">{setting.description}</div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const userId = user.id;
                                                const updated = notificationSettings.map((s, i) =>
                                                    i === idx
                                                        ? {
                                                            ...s,
                                                            enabled: !s.enabled,
                                                            userId: userId,
                                                            type: s.type || s.module || 'general',
                                                        }
                                                        : s
                                                );
                                                setNotificationSettings(updated);
                                                // Persist the change to backend
                                                const changed = {
                                                    ...updated[idx],
                                                    userId: userId,
                                                    type: updated[idx].type || updated[idx].module || 'general',
                                                };
                                                try {
                                                    if (changed.id) {
                                                        await api.updateNotificationSetting(changed.id, changed);
                                                    } else {
                                                        await api.createNotificationSetting(changed);
                                                    }
                                                } catch (e) {
                                                    // Optionally handle error
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-lg ${setting.enabled ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                                        >
                                            {setting.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 italic">No notification settings found.</div>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'email' && (
                <div className="w-[98%] mx-auto max-w-4xl space-y-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Mail size={24} className="text-orange-500"/> SMTP Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-bold text-slate-600 mb-1">SMTP Host</label><input type="text" value={smtpSettings.host} onChange={e => setSmtpSettings({...smtpSettings, host: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" /></div>
                            <div><label className="block text-sm font-bold text-slate-600 mb-1">SMTP Port</label><input type="text" value={smtpSettings.port} onChange={e => setSmtpSettings({...smtpSettings, port: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" /></div>
                            <div><label className="block text-sm font-bold text-slate-600 mb-1">User / Email</label><input type="text" value={smtpSettings.user} onChange={e => setSmtpSettings({...smtpSettings, user: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" /></div>
                            <div><label className="block text-sm font-bold text-slate-600 mb-1">Password</label><input type="password" value={smtpSettings.pass} onChange={e => setSmtpSettings({...smtpSettings, pass: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" /></div>
                        </div>
                        <button onClick={() => alert('Settings Saved')} className="mt-6 bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all"><Save size={18}/> Save SMTP Configuration</button>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Email Templates</h3>
                            <button onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', body: '' }); setIsTemplateModalOpen(true); }} className="text-orange-600 font-bold hover:underline flex items-center gap-1 text-sm"><Plus size={16}/> New Template</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {emailTemplates.map(template => (
                                <div key={template.id} className="p-4 border rounded-2xl hover:border-orange-200 transition-all cursor-pointer group flex justify-between items-center" onClick={() => { setEditingTemplate(template); setTemplateForm(template); setIsTemplateModalOpen(true); }}>
                                    <div><p className="font-bold text-slate-800">{template.name}</p><p className="text-xs text-slate-500 truncate max-w-[200px]">{template.subject}</p></div>
                                    <Edit size={16} className="text-slate-300 group-hover:text-orange-500"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "database" && (
              <div className="w-[98%] mx-auto max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Database size={24} className="text-orange-500"/> Database Details</h2>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`inline-block w-3 h-3 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'checking' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                    <span className="font-bold text-slate-700">Status:</span>
                    <span className="text-sm font-mono">{dbStatus.charAt(0).toUpperCase() + dbStatus.slice(1)}</span>
                  </div>
                  {dbInfo === null ? (
                    <div className="text-slate-400 italic">Loading database info...</div>
                  ) : dbInfo.error ? (
                    <div className="text-red-500 font-bold">{dbInfo.error}</div>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-bold text-slate-700">Database:</span> <span className="font-mono">{dbInfo.database}</span></div>
                      <div className="mb-2"><span className="font-bold text-slate-700">User:</span> <span className="font-mono">{dbInfo.user}</span></div>
                      <div className="mb-2"><span className="font-bold text-slate-700">Host:</span> <span className="font-mono">{dbInfo.host}</span></div>
                      <div className="mb-2"><span className="font-bold text-slate-700">Port:</span> <span className="font-mono">{dbInfo.port}</span></div>
                      <div className="mb-2"><span className="font-bold text-slate-700">Tables:</span></div>
                      <ul className="list-disc pl-6 text-sm">
                        {dbInfo.tables && dbInfo.tables.length > 0 ? dbInfo.tables.map((t: string) => (
                          <li key={t} className="font-mono text-slate-700">{t}</li>
                        )) : <li className="text-slate-400 italic">No tables found</li>}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "copyright" && (
              <div className="w-[98%] mx-auto max-w-4xl">
                <CopyrightPage />
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
                  className={`py-4 text-sm font-bold capitalize border-b-2 transition-all whitespace-nowrap ${
                    branchDetailTab === tab
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
                                                {employees.filter(e => e.branchid === viewBranch.id).map(emp => (
                                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">{emp.name.split(' ').map(n => n[0]).join('')}</div><span className="font-bold text-slate-700 text-xs">{emp.name}</span></div></td>
                                                        <td className="p-4 text-xs font-medium text-slate-400">{emp.designation}</td>
                                                        <td className="p-4 text-right"><button onClick={() => handleAddStaffToBranch(emp.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors" title="Remove from Branch"><X size={16}/></button></td>
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
