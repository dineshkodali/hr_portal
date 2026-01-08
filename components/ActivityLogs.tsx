
import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { Search, Filter, History, ChevronDown, ChevronUp } from 'lucide-react';

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

    const modules = Array.from(new Set(logs.map(l => l.module))).filter(Boolean);
    const actions = Array.from(new Set(logs.map(l => l.action))).filter(Boolean);

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

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;

        const logDate = new Date(log.timestamp);
        const isValidDate = !isNaN(logDate.getTime());

        let matchesStartDate = !startDate;
        if (startDate && isValidDate) {
            matchesStartDate = logDate >= new Date(startDate);
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

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
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
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            >
                                <option value="all">Every Module</option>
                                {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                            </select>
                        </div>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        >
                            <option value="all">Every Action</option>
                            {actions.map(act => <option key={act} value={act}>{act}</option>)}
                        </select>
                    </div>
                </div>

                <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-6 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Range</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all"
                            />
                            <span className="text-slate-300">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all"
                            />
                        </div>
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-100 font-bold transition-all"
                        >
                            Clear Date Range
                        </button>
                    )}
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
                                                <span className="text-sm font-semibold text-slate-800">{log.userName || 'System'}</span>
                                                <span className="text-xs text-slate-500 capitalize">{log.userRole || 'Automated'}</span>
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
