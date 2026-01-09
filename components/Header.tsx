// Copyright (c) 2026 SD Commercial. All rights reserved.
// This application and its content are the exclusive property of SD Commercial.
// Unauthorized use, reproduction, or distribution is strictly prohibited.
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Clock, CheckCircle, Building, X, User as UserIcon, Settings as SettingsIcon, Shield, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { User, Branch, ActivityLog } from '../types';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  onClockIn: () => void;
  onClockOut: () => void;
  isClockedIn: boolean;
  sessionStartTime: Date | null;
  branches: Branch[];
  selectedBranch: Branch | 'all';
  onSelectBranch: (branchId: string) => void;
  activityLogs?: ActivityLog[];
}

const Header: React.FC<HeaderProps> = ({ 
    user, onMenuClick, onClockIn, onClockOut, isClockedIn, sessionStartTime,
    branches, selectedBranch, onSelectBranch, activityLogs = []
}) => {
  const [clockTime, setClockTime] = useState<string>('00:00:00');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Filter branches for dropdown based on user role
  const allowedBranches = (user.role === 'admin' || user.role === 'super_admin')
    ? branches
    : branches.filter(b => user.branchIds?.includes(b.id));

  // Get recent notifications (last 10 activity logs related to user)
  const recentNotifications = activityLogs
    .filter(log => {
      // Show logs from the last 24 hours
      const logTime = new Date(log.timestamp).getTime();
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return logTime > oneDayAgo;
    })
    .slice(0, 10);

  const unreadCount = recentNotifications.length;

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const getNotificationIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case 'workforce': return <UserIcon size={16} />;
      case 'settings': return <SettingsIcon size={16} />;
      case 'attendance': return <Clock size={16} />;
      case 'payroll': return <DollarSign size={16} />;
      case 'recruitment': return <Briefcase size={16} />;
      case 'security': return <Shield size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getNotificationColor = (module: string) => {
    switch (module.toLowerCase()) {
      case 'workforce': return 'bg-blue-50 text-blue-600';
      case 'settings': return 'bg-purple-50 text-purple-600';
      case 'attendance': return 'bg-orange-50 text-orange-600';
      case 'payroll': return 'bg-green-50 text-green-600';
      case 'recruitment': return 'bg-indigo-50 text-indigo-600';
      case 'security': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  // useEffect(() => {
  //   let interval: ReturnType<typeof setInterval>;

  //   if (isClockedIn && sessionStartTime) {
  //     // Immediate update
  //     const updateTimer = () => {
  //       const now = new Date();
  //       const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
  //       if (diff >= 0) {
  //           const hrs = Math.floor(diff / 3600);
  //           const mins = Math.floor((diff % 3600) / 60);
  //           const secs = diff % 60;
  //           setClockTime(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
  //       }
  //     } // <-- close updateTimer
  //   } else {
  //     setClockTime('00:00:00');
  //   }

  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [isClockedIn, sessionStartTime]);

  console.log('HEADER RENDER', {
  isClockedIn,
  sessionStartTime
});

  
  
useEffect(() => {
  if (!isClockedIn || !sessionStartTime) {
    setClockTime('00:00:00');
    return;
  }

  // ✅ Force Date, even if string is passed
  const start = new Date(sessionStartTime);

  const interval = setInterval(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);

    if (diff < 0) return;

    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;

    setClockTime(
      `${hrs.toString().padStart(2, '0')}:` +
      `${mins.toString().padStart(2, '0')}:` +
      `${secs.toString().padStart(2, '0')}`
    );
  }, 1000);

  return () => clearInterval(interval);
}, [isClockedIn, sessionStartTime]);



  
  
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 md:hidden text-slate-600 transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Branch Selector (Visible on Desktop) */}
        {user.role !== 'employee' && (
            <div className="hidden md:flex items-center space-x-2 mr-4">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <Building size={18} />
                </div>
                <select 
                    value={selectedBranch === 'all' ? 'all' : selectedBranch.id} 
                    onChange={(e) => onSelectBranch(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-50 p-1 rounded max-w-[200px]"
                >
                    <option value="all">
                        {user.role === 'admin' || user.role === 'super_admin' ? 'All Branches' : 'My Branches'}
                    </option>
                    {allowedBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>
        )}

        <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-accent-500/20 focus-within:border-accent-500 transition-all">
          <Search size={18} className="text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Global search..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        {/* Clock In/Out Button - Visible on all screens */}
        <button
          onClick={() => (isClockedIn ? onClockOut() : onClockIn())}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
            ${
              isClockedIn
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }
          `}
        >
          {isClockedIn ? <CheckCircle size={16} /> : <Clock size={16} />}
          <span>
            {isClockedIn ? `Clock Out • ${clockTime}` : 'Clock In'}
          </span>
        </button>



        {/* Notification Bell and Dropdown (interactive) */}
        <div className="relative hidden sm:block" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  <p className="text-xs text-slate-500">{unreadCount} new updates</p>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No recent notifications</p>
                    <p className="text-xs mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  recentNotifications.map((log) => (
                    <div 
                      key={log.id}
                      className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getNotificationColor(log.module)}`}>
                          {getNotificationIcon(log.module)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase">{log.module}</span>
                            <span className="text-xs text-slate-400">{formatTimestamp(log.timestamp)}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mb-1">{log.action}</p>
                          <p className="text-xs text-slate-600 line-clamp-2">{log.details}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400">By {log.userName}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {log.userRole ? log.userRole.replace('_', ' ') : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {recentNotifications.length > 0 && (
                <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                  <button className="text-xs font-bold text-orange-600 hover:text-orange-700">
                    View All Activity Logs
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-xs text-slate-500 font-medium capitalize">{user.role.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500 font-medium capitalize">{user.role ? user.role.replace('_', ' ') : ''}</p>
          </div>
          <div className="relative group cursor-pointer">
             <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-white shadow-md object-cover"
            />
            {isClockedIn && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;