
import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { Search, Filter, History, ChevronDown, ChevronUp, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityLogsProps {
    logs: ActivityLog[];
    onRefresh?: () => void;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof ActivityLog; direction: 'desc' | 'asc' }>({
        key: 'timestamp',
        direction: 'desc'
    });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Custom Date Picker State
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    const ALL_MODULES = [
        'Auth',
        'Workforce',
        'Assets',
        'Tasks',
        'Recruitment',
        'Attendance',
        'Payroll',
        'Handbook',
        'Settings',
        'Files',
        'Email'
    ];

    const modules = Array.from(new Set([...ALL_MODULES, ...logs.map(l => l.module)])).filter(Boolean).sort();

    // Dynamically filter actions based on selected module
    const actions = Array.from(new Set(
        logs
            .filter(l => moduleFilter === 'all' || l.module === moduleFilter)
            .map(l => l.action)
    )).filter(Boolean).sort();

    const formatTimestamp = (ts: string) => {
        try {
            const date = new Date(ts);
            if (isNaN(date.getTime())) return ts;
            return new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(date);
        } catch (e) {
            return ts;
        }
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const getPredefinedRange = (period: string) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let start = new Date(now);
        let end = new Date(now);

        switch (period) {
            case 'Today':
                break;
            case 'Yesterday':
                start.setDate(now.getDate() - 1);
                end.setDate(now.getDate() - 1);
                break;
            case 'This Week':
                start.setDate(now.getDate() - now.getDay());
                break;
            case 'Last 7 Days':
                start.setDate(now.getDate() - 6);
                break;
            case 'This Month':
                start.setDate(1);
                break;
            case 'Last Month':
                start.setMonth(now.getMonth() - 1);
                start.setDate(1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'Last Week':
                start.setDate(now.getDate() - now.getDay() - 7);
                end.setDate(now.getDate() - now.getDay() - 1);
                break;
            default:
                break;
        }

        const formatDate = (d: Date) => d.toISOString().split('T')[0];
        setTempStartDate(formatDate(start));
        setTempEndDate(formatDate(end));
    };

    const isDateSelected = (dateStr: string) => {
        if (!tempStartDate) return false;
        if (!tempEndDate) return dateStr === tempStartDate;
        return dateStr >= tempStartDate && dateStr <= tempEndDate;
    };

    const handleDateClick = (dateStr: string) => {
        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            setTempStartDate(dateStr);
            setTempEndDate('');
        } else {
            if (dateStr < tempStartDate) {
                setTempEndDate(tempStartDate);
                setTempStartDate(dateStr);
            } else {
                setTempEndDate(dateStr);
            }
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;

        const logDate = new Date(log.timestamp);
        const isValidDate = !isNaN(logDate.getTime());

        let matchesStartDate = !startDate;
        if (startDate && isValidDate) {
            const s = new Date(startDate);
            s.setHours(0, 0, 0, 0);
            matchesStartDate = logDate >= s;
        }

        let matchesEndDate = !endDate;
        if (endDate && isValidDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesEndDate = logDate <= end;
        }

        return matchesSearch && matchesModule && matchesAction && matchesStartDate && matchesEndDate;
    }).sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';

        if (sortConfig.key === 'timestamp') {
            const timeA = new Date(valA).getTime();
            const timeB = new Date(valB).getTime();
            return sortConfig.direction === 'desc' ? timeB - timeA : timeA - timeB;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: keyof ActivityLog) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const SortIcon = ({ column }: { column: keyof ActivityLog }) => {
        if (sortConfig.key !== column) return <ChevronDown size={14} className="opacity-20" />;
        return sortConfig.direction === 'desc' ? <ChevronDown size={14} className="text-orange-500" /> : <ChevronUp size={14} className="text-orange-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">System Activity Logs</h1>
                    <p className="text-slate-500 mt-1">Full audit trail of all system operations and user actions.</p>
                </div>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-sm active:scale-95"
                    >
                        <History size={18} />
                        <span>Refresh Logs</span>
                    </button>
                )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden relative">
                <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 bg-white/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by user, action or details..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Custom Date Range Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsDatePickerOpen(!isDatePickerOpen);
                                    if (!isDatePickerOpen) {
                                        setTempStartDate(startDate);
                                        setTempEndDate(endDate);
                                    }
                                }}
                                className={`flex items-center gap-3 bg-white border ${startDate || endDate ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:border-orange-500 group`}
                            >
                                <Calendar size={18} className={startDate || endDate ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'} />
                                <span className={startDate || endDate ? 'text-slate-800' : 'text-slate-500'}>
                                    {startDate ? (endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : new Date(startDate).toLocaleDateString()) : 'Select Period'}
                                </span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Advanced Date Picker Dropdown */}
                            {isDatePickerOpen && (
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-4 flex gap-4 animate-in fade-in zoom-in-95 duration-200" style={{ width: '520px' }}>
                                    {/* Left: Calendar View */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <button
                                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <h3 className="font-bold text-slate-800 text-sm">
                                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </h3>
                                            <button
                                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                <div key={day} className="text-center text-[9px] font-bold text-slate-400 uppercase pb-1">{day}</div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="h-8 w-8" />
                                            ))}
                                            {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                                                const day = i + 1;
                                                const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                                const dateStr = d.toISOString().split('T')[0];
                                                const isSelected = isDateSelected(dateStr);
                                                const isStart = tempStartDate === dateStr;
                                                const isEnd = tempEndDate === dateStr;
                                                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                                return (
                                                    <button
                                                        key={day}
                                                        onClick={() => handleDateClick(dateStr)}
                                                        className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs transition-all relative
                                                            ${isSelected ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20' : 'text-slate-600 hover:bg-orange-50'}
                                                            ${isToday && !isSelected ? 'ring-1 ring-orange-500/30 font-bold' : ''}
                                                        `}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Middle: Divider */}
                                    <div className="w-px bg-slate-100 self-stretch" />

                                    {/* Right: Predefined Filters */}
                                    <div className="w-40 flex flex-col">
                                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filter by Period</h4>
                                        <div className="grid grid-cols-1 gap-1">
                                            {['Today', 'Yesterday', 'Last 7 Days', 'This Week', 'Last Week', 'This Month', 'Last Month', 'Custom'].map(period => (
                                                <button
                                                    key={period}
                                                    onClick={() => period === 'Custom' ? (setTempStartDate(''), setTempEndDate('')) : getPredefinedRange(period)}
                                                    className="w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                                                >
                                                    {period}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex gap-2 pt-4">
                                            <button
                                                onClick={() => setIsDatePickerOpen(false)}
                                                className="flex-1 py-2 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setStartDate(tempStartDate);
                                                    setEndDate(tempEndDate);
                                                    setIsDatePickerOpen(false);
                                                }}
                                                className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-[11px] font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                value={moduleFilter}
                                onChange={(e) => {
                                    setModuleFilter(e.target.value);
                                    setActionFilter('all'); // Reset action when module changes
                                }}
                                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer"
                            >
                                <option value="all">All Modules</option>
                                {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                            </select>
                        </div>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all min-w-[160px] cursor-pointer"
                        >
                            <option value="all">{moduleFilter === 'all' ? 'All Actions' : `Actions: ${moduleFilter}`}</option>
                            {actions.map(act => <option key={act} value={act}>{act}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm">
                            <tr>
                                <th
                                    className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Timestamp</span>
                                        <SortIcon column="timestamp" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('userName')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>User</span>
                                        <SortIcon column="userName" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('module')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Module</span>
                                        <SortIcon column="module" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('action')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Action</span>
                                        <SortIcon column="action" />
                                    </div>
                                </th>
                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log, index) => (
                                    <tr key={log.id} className="hover:bg-orange-50/30 transition-colors group">
                                        <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{log.username}</span>
                                                <span className="text-xs text-slate-500 capitalize">{log.userrole}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 whitespace-nowrap uppercase tracking-tighter">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-700 font-semibold">{log.action}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="max-w-md">
                                                <p className="text-sm text-slate-600 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all" title={log.details}>
                                                    {log.details}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <History size={32} className="text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-slate-800">No activity logs found</p>
                                                <p className="text-sm text-slate-400">Try adjusting your filters or search terms.</p>
                                            </div>
                                            {(searchTerm || moduleFilter !== 'all' || actionFilter !== 'all' || startDate || endDate) && (
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setModuleFilter('all');
                                                        setActionFilter('all');
                                                        setStartDate('');
                                                        setEndDate('');
                                                    }}
                                                    className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all text-sm font-medium"
                                                >
                                                    Reset All Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredLogs.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                        <span>Showing {filteredLogs.length} of {logs.length} system events</span>
                        <span>Use table headers to sort by column</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
