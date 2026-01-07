
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Monitor, 
  Settings, 
  LogOut,
  X,
  UserPlus,
  FolderOpen,
  ClipboardList,
  History,
  Grid,
  BookOpen,
  Palmtree,
  UserCircle,
  FileBarChart
} from 'lucide-react';
import { ViewState, UserRole, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userRole: UserRole;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose, onLogout, userRole, user }) => {
  const isAdminOrHR = user.role === 'admin' || user.role === 'super_admin' || user.role === 'hr';
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'employee' },
    { id: 'reports', label: 'Reports', icon: FileBarChart, minRole: 'employee' },
    { id: 'employees', label: 'Workforce', icon: Users, minRole: 'hr' },
    { id: 'teams', label: 'Teams', icon: Grid, minRole: 'employee' },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, minRole: 'employee' },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus, minRole: 'hr' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, minRole: 'employee' },
    { id: 'holidays', label: 'Holidays', icon: Palmtree, minRole: 'employee' },
    { id: 'handbook', label: 'Handbook', icon: BookOpen, minRole: 'employee' },
    { id: 'assets', label: 'Assets', icon: Monitor, minRole: 'employee' },
    { id: 'files', label: 'Files', icon: FolderOpen, minRole: 'employee' },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, minRole: 'employee' },
    { id: 'logs', label: 'Activity Logs', icon: History, minRole: 'hr' },
    { 
        id: 'settings', 
        label: isAdminOrHR ? 'System Settings' : 'My Profile', 
        icon: isAdminOrHR ? Settings : UserCircle, 
        minRole: 'employee' 
    },
  ];

  const hasAccess = (item: typeof menuItems[0]) => {
      if (user.role === 'super_admin' || user.role === 'admin') return true;
      if (item.minRole === 'hr') return user.role === 'hr' || user.role === 'manager';
      return true;
  };

  const filteredItems = menuItems.filter(hasAccess);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          fixed top-0 left-0 z-30 h-screen w-64 
          bg-slate-900 
          text-white transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex-shrink-0
        `}
      >
        <div className="flex items-center justify-between p-6 h-20 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
              HR
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Portal</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-9rem)] scrollbar-hide">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-3">Main Menu</p>
          <nav className="space-y-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewState);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${currentView === item.id || (item.id === 'employees' && currentView === 'add-employee')
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} className={`transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-xl transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
