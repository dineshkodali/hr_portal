
import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { Search, Filter, History, ChevronDown, ChevronUp } from 'lucide-react';

interface ActivityLogsProps {
    logs: ActivityLog[];
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs }) => {
        if (!logs || logs.length === 0) {
            return (
                <div className="p-8 text-center text-gray-500">
                    <p>No activity logs available</p>
                </div>
            );
        }

    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const modules = Array.from(new Set(logs.map(l => l.module)));
    const actions = Array.from(new Set(logs.map(l => l.action)));

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.action.toLowerCase().includes(searchTerm?.toLowerCase()) || 
            log.details.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            log.username.toLowerCase().includes(searchTerm?.toLowerCase());
        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        return matchesSearch && matchesModule && matchesAction;
    }).sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>
                    <p className="text-slate-500 mt-1">Track all system activities and user operations.</p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 bg-white/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search logs by user, action or details..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        >
                            <option value="all">All Modules</option>
                            {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                        </select>
                        <select 
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        >
                            <option value="all">All Actions</option>
                            {actions.map(act => <option key={act} value={act}>{act}</option>)}
                        </select>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="flex items-center space-x-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50"
                        >
                            <span>Date</span>
                            {sortOrder === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Module</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 text-sm text-slate-600 font-mono text-xs whitespace-nowrap">{log.timestamp}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{log.username}</span>
                                                <span className="text-xs text-slate-500 capitalize">{log.userrole}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 whitespace-nowrap">{log.module}</span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-700 font-medium">{log.action}</td>
                                        <td className="p-4 text-sm text-slate-600 max-w-md truncate" title={log.details}>{log.details}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <History size={32} className="text-slate-300 mb-2" />
                                            <p>No activity logs found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
