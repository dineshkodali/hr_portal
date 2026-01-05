
import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Users, FolderOpen, Target, X } from 'lucide-react';
import { Team, TeamManagementProps, Employee } from '../types';

const TeamManagement: React.FC<TeamManagementProps> = ({ teams, employees, onAddTeam, onUpdateTeam, onDeleteTeam }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState<Partial<Team>>({
        name: '', description: '', leaderid: '', leadername: '', members: []
        // , projectFocus: ''
    });

    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAddClick = () => {
        setEditingTeam(null);
        setFormData({ name: '', description: '', leaderid: '', leadername: '', members: []
            // , projectFocus: ''
         });
        setIsModalOpen(true);
    };

 const handleEditClick = (team: Team) => {
    setEditingTeam(team);

    const { id, ...rest } = team as any; //  cast ONCE, locally
    setFormData(rest);

    setIsModalOpen(true);
};



   const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.leaderid) return;

    const lead = employees.find(emp => emp.id === formData.leaderid);

    // 🔒 Strip DB-managed fields before sending to API
    const {
        created_at,
        updated_at,
        ...safeFormData
    } = formData as any;

    const teamData: Team = {
        ...safeFormData,
        leadername: lead ? lead.name : '',
        id: editingTeam ? editingTeam.id : `tm-${Date.now()}`
    };

    if (editingTeam) {
        onUpdateTeam(teamData);
    } else {
        onAddTeam(teamData);
    }

    setIsModalOpen(false);
};


    const toggleMember = (empId: string) => {
        const currentMembers = formData.members || [];
        if (currentMembers.includes(empId)) {
            setFormData({ ...formData, members: currentMembers.filter(id => id !== empId) });
        } else {
            setFormData({ ...formData, members: [...currentMembers, empId] });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Team Management</h1>
                    <p className="text-slate-500 mt-1">Manage internal teams, assignments, and projects.</p>
                </div>
                <button onClick={handleAddClick} className="bg-accent-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-accent-600 shadow-lg shadow-orange-500/30 transition-all font-medium">
                    <Plus size={18} /><span>Create Team</span>
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-white/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search teams..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map(team => {
                        const lead = employees.find(e => e.id === team.leaderid);
                        return (
                            <div key={team.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 rounded-full text-purple-600"><Users size={24} /></div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditClick(team)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                        <button onClick={() => { if (window.confirm('Are you sure you want to delete this team?')) { onDeleteTeam(team.id); } }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{team.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{team.description}</p>
                                
                                <div className="space-y-3 border-t border-slate-100 pt-4">
                                    {/* <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center"><Target size={14} className="mr-1.5"/> Focus:</span>
                                        <span className="font-medium text-slate-700">{team.projectFocus || 'General'}</span>
                                    </div> */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center"><Users size={14} className="mr-1.5"/> Lead:</span>
                                        <div className="flex items-center">
                                            {lead && <img src={lead.avatar} className="w-5 h-5 rounded-full mr-1.5" alt=""/>}
                                            <span className="font-medium text-slate-700">{team.leadername}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center"><FolderOpen size={14} className="mr-1.5"/> Members:</span>
                                        <span className="font-medium text-slate-700">{team.members?.length}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Team Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg">{editingTeam ? 'Edit Team' : 'Create New Team'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-3 py-2 border rounded-xl" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl" rows={2} />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Focus</label>
                                <input value={formData.projectFocus} onChange={e => setFormData({...formData, projectFocus: e.target.value})} type="text" className="w-full px-3 py-2 border rounded-xl" placeholder="e.g. Q4 Marketing Campaign" />
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead *</label>
                                <select value={formData.leaderid} onChange={e => setFormData({...formData, leaderid: e.target.value})} className="w-full px-3 py-2 border rounded-xl" required>
                                    <option value="">Select Team Lead</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-40 overflow-y-auto">
                                    {employees.map(emp => (
                                        <div key={emp.id} className="flex items-center space-x-2 mb-2">
                                            <input type="checkbox" checked={(formData.members || []).includes(emp.id)} onChange={() => toggleMember(emp.id)} className="rounded text-accent-500" />
                                            <span className="text-sm text-slate-700">{emp.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-accent-500 text-white py-2.5 rounded-xl font-medium hover:bg-accent-600 shadow-lg shadow-orange-500/30">
                                {editingTeam ? 'Update Team' : 'Create Team'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
