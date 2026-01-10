import React, { useState } from 'react';
import { 
    BookOpen, Search, Plus, Edit, Trash2, Shield, Lock, DollarSign, 
    LifeBuoy, FileText, ChevronRight, X, Save, Clock, Download,
    CheckCircle, Info, Star, ChevronLeft, Share2, Users, Globe as GlobeIcon, UserPlus
} from 'lucide-react';
import { PolicyCategory, PolicyDocument, StatCardProps, HandbookProps } from '../types';

const SummaryCard: React.FC<{ title: string; count: number; icon: React.ReactNode; color: string }> = ({ title, count, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] p-6 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#1e293b]">{count}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
        {icon}
      </div>
    </div>
);

const Handbook: React.FC<HandbookProps & { roles?: string[] }> = ({ 
    user: userProp = {} as any, categories = [], policies = [], users = [], groups = [], roles = [],
    onAddCategory = (c: PolicyCategory) => {}, onUpdateCategory = (c: PolicyCategory) => {}, onDeleteCategory = (id: string) => {},
    onAddPolicy = (p: PolicyDocument) => {}, onUpdatePolicy = (p: PolicyDocument) => {}, onDeletePolicy = (id: string) => {}
}) => {
    // Ensure user.groups is always set based on group membership
    const userGroups = groups.filter(g => Array.isArray(g.memberIds) && g.memberIds.includes(userProp.id)).map(g => g.id);
    const user = { ...userProp, groups: userProp.groups || userGroups };
    const isHR = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'hr';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewPolicy, setViewPolicy] = useState<PolicyDocument | null>(null);

    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<PolicyCategory | null>(null);
    const [catForm, setCatForm] = useState<Partial<PolicyCategory>>({ name: '', description: ''
        // , icon: 'BookOpen'
     });

    const [isPolModalOpen, setIsPolModalOpen] = useState(false);
    const [editingPol, setEditingPol] = useState<PolicyDocument | null>(null);
    const [polForm, setPolForm] = useState<Partial<PolicyDocument>>({ title: '', content: '', version: '1.0', access: { users: [], groups: [] } });
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [accessEditPolicy, setAccessEditPolicy] = useState<PolicyDocument | null>(null);
    const [accessForm, setAccessForm] = useState<{ users: string[]; groups: string[] }>({ users: [], groups: [] });
    const [isCategoryAccessModalOpen, setIsCategoryAccessModalOpen] = useState(false);
    const [accessEditCategory, setAccessEditCategory] = useState<PolicyCategory | null>(null);
    const [categoryAccessForm, setCategoryAccessForm] = useState<{ users: string[]; groups: string[] }>({ users: [], groups: [] });
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [categoryUserSearchTerm, setCategoryUserSearchTerm] = useState('');
    const [categoryGroupSearchTerm, setCategoryGroupSearchTerm] = useState('');
    const [showCategoryUserDropdown, setShowCategoryUserDropdown] = useState(false);
    const [showCategoryGroupDropdown, setShowCategoryGroupDropdown] = useState(false);

    // Close dropdowns when clicking outside (handled by modal onClick)

    // Helper: check if current user has access to a category
    const hasCategoryAccess = (cat: PolicyCategory) => {
        if (!cat.access) return true;
        const { users: allowedUsers = [], groups: allowedGroups = [] } = cat.access;
        if (allowedUsers.includes(user.id)) return true;
        if (user.groups && allowedGroups.some(gid => user.groups.includes(gid))) return true;
        return allowedUsers.length === 0 && allowedGroups.length === 0;
    };

    // Filter categories by access and search
    const filteredCategories = categories
        .filter(hasCategoryAccess)
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'Shield': return <Shield size={24} />;
            case 'Lock': return <Lock size={24} />;
            case 'DollarSign': return <DollarSign size={24} />;
            case 'LifeBuoy': return <LifeBuoy size={24} />;
            default: return <BookOpen size={24} />;
        }
    };

    // Helper: check if current user has access to a policy
    const hasAccess = (policy: PolicyDocument) => {
        if (!policy.access) return true;
        const { users: allowedUsers = [], groups: allowedGroups = [] } = policy.access;
        if (allowedUsers.includes(user.id)) return true;
        if (user.groups && allowedGroups.some(gid => user.groups.includes(gid))) return true;
        return allowedUsers.length === 0 && allowedGroups.length === 0; // public if no restrictions
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">Employee Handbook</h1>
                    <p className="text-[#64748b] text-base mt-1">Policies and guidelines for organizational conduct.</p>
                </div>
                {isHR && (
                    <button 
                        onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '' }); setIsCatModalOpen(true); }} 
                        className="bg-[#f97316] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus size={18} /> <span>Add Category</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Policies" count={policies.length} icon={<FileText size={20} />} color="bg-blue-500" />
                <SummaryCard title="Categories" count={categories.length} icon={<BookOpen size={20} />} color="bg-purple-500" />
                <SummaryCard title="Compliance" count={100} icon={<Shield size={20} />} color="bg-[#94a3b8]" />
                <SummaryCard title="Updates" count={policies.length > 0 ? 2 : 0} icon={<Clock size={20} />} color="bg-[#22c55e]" />
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] overflow-hidden">
                <div className="p-6 border-b border-[#f1f5f9]">
                    <div className="relative max-w-[360px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                        <input type="text" placeholder="Search policies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/10 text-sm font-medium" />
                    </div>
                </div>

                <div className="p-8">
                    {!selectedCategory ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredCategories.map(cat => {
                                if (!hasCategoryAccess(cat)) return null;
                                return (
                                    <div key={cat.id} className="bg-white p-3 rounded-xl border border-[#f1f5f9] hover:border-[#f97316]/30 transition-all group min-h-[170px] flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
                                                {getIcon(cat.icon)}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                {isHR && (
                                                    <>
                                                        <button 
                                                            onClick={() => { 
                                                                setAccessEditCategory(cat); 
                                                                setCategoryAccessForm(cat.access || { users: [], groups: [] }); 
                                                                setIsCategoryAccessModalOpen(true); 
                                                            }} 
                                                            className="p-2 text-[#94a3b8] hover:text-orange-500"
                                                            title="Manage Access"
                                                        >
                                                            <Shield size={16}/>
                                                        </button>
                                                        <button onClick={() => { setEditingCat(cat); setCatForm(cat); setIsCatModalOpen(true); }} className="p-2 text-[#94a3b8] hover:text-[#1e293b]" title="Edit Category"><Edit size={16}/></button>
                                                        <button onClick={() => { if(window.confirm('Delete category?')) onDeleteCategory(cat.id); }} className="p-2 text-[#94a3b8] hover:text-red-500" title="Delete Category"><Trash2 size={16}/></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div onClick={() => setSelectedCategory(cat.id)} className="cursor-pointer space-y-1 flex-1">
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                                cat.access && (cat.access.users.length > 0 || cat.access.groups.length > 0) 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                                    : 'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}>
                                                {cat.access && (cat.access.users.length > 0 || cat.access.groups.length > 0) ? 'SHARED' : 'PUBLIC'}
                                            </span>
                                            <h3 className="text-base font-bold text-[#1e293b] pt-1">{cat.name}</h3>
                                            <p className="text-xs text-[#64748b] font-medium">
                                                {cat.access && (cat.access.users.length > 0 || cat.access.groups.length > 0) 
                                                    ? `Shared with ${cat.access.users.length + cat.access.groups.length} ${cat.access.users.length + cat.access.groups.length === 1 ? 'person' : 'people'}`
                                                    : 'Available to everyone'
                                                }
                                            </p>
                                        </div>
                                        <p className="text-xs text-[#94a3b8] mt-2 line-clamp-2 leading-snug">{cat.description}</p>
                                        <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-3 mt-2" onClick={() => setSelectedCategory(cat.id)}>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f97316] uppercase tracking-wider cursor-pointer">
                                                <span>{policies.filter(p => p.categoryid === cat.id && hasAccess(p)).length} Docs</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-sm font-bold text-[#64748b] hover:text-[#1e293b]"><ChevronLeft size={18} /> Back to Categories</button>
                                {isHR && <button onClick={() => { setEditingPol(null); setPolForm({ title: '', content: '', version: '1.0' }); setIsPolModalOpen(true); }} className="bg-[#1e293b] text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all"><Plus size={16}/> New Policy</button>}
                            </div>
                            <h2 className="text-xl font-bold text-[#1e293b] mb-6 px-2">{categories.find(c => c.id === selectedCategory)?.name}</h2>
                            <div className="overflow-x-auto rounded-xl border border-[#f1f5f9]">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafc] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                                        <tr><th className="px-6 py-4">POLICY DOCUMENT</th><th className="px-6 py-4">VERSION</th><th className="px-6 py-4">LAST UPDATED</th><th className="px-6 py-4 text-right">ACTIONS</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f5f9]">
                                        {policies.filter(p => p.categoryid === selectedCategory && hasAccess(p)).map(pol => (
                                            <tr key={pol.id} className="hover:bg-[#fcfdfe] transition-colors cursor-pointer group" onClick={() => setViewPolicy(pol)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><FileText size={18}/></div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-[#334155] group-hover:text-[#f97316] transition-colors">{pol.title}</span>
                                                                    {pol.access && (pol.access.users.length > 0 || pol.access.groups.length > 0) ? (
                                                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg">
                                                                            <Share2 size={10} />
                                                                            <span>Shared</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg">
                                                                            <GlobeIcon size={10} />
                                                                            <span>Public</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {pol.access && (pol.access.users.length > 0 || pol.access.groups.length > 0) && (
                                                                    <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                                                                        <Users size={12} />
                                                                        <span>Shared with {pol.access.users.length + pol.access.groups.length} {pol.access.users.length + pol.access.groups.length === 1 ? 'person' : 'people'}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-[#64748b]">v{pol.version}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-[#64748b]">{pol?.updated_at}</td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1">
                                                        {isHR && (
                                                            <>
                                                                <button 
                                                                    onClick={() => { setAccessEditPolicy(pol); setAccessForm(pol.access || { users: [], groups: [] }); setIsAccessModalOpen(true); }} 
                                                                    className="p-2 text-[#94a3b8] hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                                                    title="Manage Access"
                                                                >
                                                                    <Shield size={18}/>
                                                                </button>
                                                                <button onClick={() => { setEditingPol(pol); setPolForm(pol); setIsPolModalOpen(true); }} className="p-2 text-[#94a3b8] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Policy"><Edit size={18}/></button>
                                                                <button onClick={() => { if(window.confirm('Delete policy?')) onDeletePolicy(pol.id); }} className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Policy"><Trash2 size={18}/></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Policy Access Permissions Modal - Webapp Style */}
            {isAccessModalOpen && accessEditPolicy && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4" onClick={() => {
                    setIsAccessModalOpen(false);
                    setShowUserDropdown(false);
                    setShowGroupDropdown(false);
                }}>
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-[#1e293b]">Configure Access Permissions</h3>
                            <button onClick={() => setIsAccessModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]">
                                <X size={24}/>
                            </button>
                        </div>
                        <form className="p-8 space-y-5" onSubmit={e => {
                            e.preventDefault();
                            if (accessEditPolicy) {
                                onUpdatePolicy({ ...accessEditPolicy, access: accessForm });
                                setIsAccessModalOpen(false);
                            }
                        }}>
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Policy Document</label>
                                <div className="px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium">
                                    {accessEditPolicy.title}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Allowed Users</label>
                                <div className="relative">
                                    {/* Selected Users Tags */}
                                    {accessForm.users.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {[...accessForm.users]
                                              .map(uid => users.find(x => x.id === uid))
                                              .filter(Boolean)
                                              .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
                                              .map(u => u && (
                                                <span key={u.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {u.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAccessForm({ ...accessForm, users: accessForm.users.filter(id => id !== u.id) })}
                                                        className="text-blue-700 hover:text-blue-900"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                              ))}
                                        </div>
                                    )}
                                    
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                        <input
                                            type="text"
                                            placeholder={users.length === 0 ? "No users available" : "Search and select users..."}
                                            value={userSearchTerm}
                                            onChange={(e) => {
                                                setUserSearchTerm(e.target.value);
                                                setShowUserDropdown(true);
                                            }}
                                            onFocus={() => setShowUserDropdown(true)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                                            disabled={users.length === 0}
                                        />
                                        {showUserDropdown && users.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                {users
                                                    .filter(u => 
                                                        !accessForm.users.includes(u.id) &&
                                                        (u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                                         u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
                                                    )
                                                    .map(u => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => {
                                                                setAccessForm({ ...accessForm, users: [...accessForm.users, u.id] });
                                                                setUserSearchTerm('');
                                                                setShowUserDropdown(false);
                                                            }}
                                                            className="flex items-center gap-3 p-3 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {u.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-[#1e293b]">{u.name}</p>
                                                                <p className="text-xs text-[#64748b]">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {users.filter(u => 
                                                    !accessForm.users.includes(u.id) &&
                                                    (u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                                     u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
                                                ).length === 0 && (
                                                    <div className="p-4 text-center text-sm text-[#64748b]">
                                                        No users found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Allowed Groups</label>
                                <div className="relative">
                                    {/* Selected Groups Tags */}
                                    {accessForm.groups.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {[...accessForm.groups]
                                              .map(gid => groups.find(x => x.id === gid))
                                              .filter(Boolean)
                                              .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
                                              .map(g => g && (
                                                <span key={g.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                                                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white">
                                                        <Users size={12} />
                                                    </div>
                                                    {g.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAccessForm({ ...accessForm, groups: accessForm.groups.filter(id => id !== g.id) })}
                                                        className="text-purple-700 hover:text-purple-900"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                              ))}
                                        </div>
                                    )}
                                    
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                        <input
                                            type="text"
                                            placeholder={groups.length === 0 ? "No groups available" : "Search and select groups..."}
                                            value={groupSearchTerm}
                                            onChange={(e) => {
                                                setGroupSearchTerm(e.target.value);
                                                setShowGroupDropdown(true);
                                            }}
                                            onFocus={() => setShowGroupDropdown(true)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                                            disabled={groups.length === 0}
                                        />
                                        {showGroupDropdown && groups.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                {groups
                                                    .filter(g => 
                                                        !accessForm.groups.includes(g.id) &&
                                                        g.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
                                                    )
                                                    .map(g => (
                                                        <div
                                                            key={g.id}
                                                            onClick={() => {
                                                                setAccessForm({ ...accessForm, groups: [...accessForm.groups, g.id] });
                                                                setGroupSearchTerm('');
                                                                setShowGroupDropdown(false);
                                                            }}
                                                            className="flex items-center gap-3 p-3 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                                                                <Users size={14} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-[#1e293b]">{g.name}</p>
                                                                <p className="text-xs text-[#64748b]">{g.memberIds?.length || 0} members</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {groups.filter(g => 
                                                    !accessForm.groups.includes(g.id) &&
                                                    g.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
                                                ).length === 0 && (
                                                    <div className="p-4 text-center text-sm text-[#64748b]">
                                                        No groups found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> Leave both fields empty to make the policy accessible to all employees.
                                </p>
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsAccessModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-4 py-2.5 bg-[#f97316] text-white rounded-xl font-semibold shadow-lg hover:bg-[#ea580c] transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={16} />
                                    Save Permissions
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Access Permissions Modal - Webapp Style */}
            {isCategoryAccessModalOpen && accessEditCategory && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4" onClick={() => {
                    setIsCategoryAccessModalOpen(false);
                    setShowCategoryUserDropdown(false);
                    setShowCategoryGroupDropdown(false);
                }}>
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-[#1e293b]">Configure Access Permissions</h3>
                            <button onClick={() => setIsCategoryAccessModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]">
                                <X size={24}/>
                            </button>
                        </div>
                        <form className="p-8 space-y-5" onSubmit={e => {
                            e.preventDefault();
                            if (accessEditCategory) {
                                onUpdateCategory({ ...accessEditCategory, access: categoryAccessForm });
                                setIsCategoryAccessModalOpen(false);
                            }
                        }}>
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Category</label>
                                <div className="px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium">
                                    {accessEditCategory.name}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Allowed Users</label>
                                <div className="relative">
                                    {/* Selected Users Tags */}
                                    {categoryAccessForm.users.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {[...categoryAccessForm.users]
                                              .map(uid => users.find(x => x.id === uid))
                                              .filter(Boolean)
                                              .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
                                              .map(u => u && (
                                                <span key={u.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {u.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => setCategoryAccessForm({ ...categoryAccessForm, users: categoryAccessForm.users.filter(id => id !== u.id) })}
                                                        className="text-blue-700 hover:text-blue-900"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                              ))}
                                        </div>
                                    )}
                                    
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                        <input
                                            type="text"
                                            placeholder={users.length === 0 ? "No users available" : "Search and select users..."}
                                            value={categoryUserSearchTerm}
                                            onChange={(e) => {
                                                setCategoryUserSearchTerm(e.target.value);
                                                setShowCategoryUserDropdown(true);
                                            }}
                                            onFocus={() => setShowCategoryUserDropdown(true)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                                            disabled={users.length === 0}
                                        />
                                        {showCategoryUserDropdown && users.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                {users
                                                    .filter(u => 
                                                        !categoryAccessForm.users.includes(u.id) &&
                                                        (u.name.toLowerCase().includes(categoryUserSearchTerm.toLowerCase()) ||
                                                         u.email.toLowerCase().includes(categoryUserSearchTerm.toLowerCase()))
                                                    )
                                                    .map(u => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => {
                                                                setCategoryAccessForm({ ...categoryAccessForm, users: [...categoryAccessForm.users, u.id] });
                                                                setCategoryUserSearchTerm('');
                                                                setShowCategoryUserDropdown(false);
                                                            }}
                                                            className="flex items-center gap-3 p-3 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {u.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-[#1e293b]">{u.name}</p>
                                                                <p className="text-xs text-[#64748b]">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {users.filter(u => 
                                                    !categoryAccessForm.users.includes(u.id) &&
                                                    (u.name.toLowerCase().includes(categoryUserSearchTerm.toLowerCase()) ||
                                                     u.email.toLowerCase().includes(categoryUserSearchTerm.toLowerCase()))
                                                ).length === 0 && (
                                                    <div className="p-4 text-center text-sm text-[#64748b]">
                                                        No users found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Allowed Groups</label>
                                <div className="relative">
                                    {/* Selected Groups Tags */}
                                    {categoryAccessForm.groups.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {[...categoryAccessForm.groups]
                                              .map(gid => groups.find(x => x.id === gid))
                                              .filter(Boolean)
                                              .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
                                              .map(g => g && (
                                                <span key={g.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                                                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white">
                                                        <Users size={12} />
                                                    </div>
                                                    {g.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => setCategoryAccessForm({ ...categoryAccessForm, groups: categoryAccessForm.groups.filter(id => id !== g.id) })}
                                                        className="text-purple-700 hover:text-purple-900"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                              ))}
                                        </div>
                                    )}
                                    
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                        <input
                                            type="text"
                                            placeholder={groups.length === 0 ? "No groups available" : "Search and select groups..."}
                                            value={categoryGroupSearchTerm}
                                            onChange={(e) => {
                                                setCategoryGroupSearchTerm(e.target.value);
                                                setShowCategoryGroupDropdown(true);
                                            }}
                                            onFocus={() => setShowCategoryGroupDropdown(true)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                                            disabled={groups.length === 0}
                                        />
                                        {showCategoryGroupDropdown && groups.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                {groups
                                                    .filter(g => 
                                                        !categoryAccessForm.groups.includes(g.id) &&
                                                        g.name.toLowerCase().includes(categoryGroupSearchTerm.toLowerCase())
                                                    )
                                                    .map(g => (
                                                        <div
                                                            key={g.id}
                                                            onClick={() => {
                                                                setCategoryAccessForm({ ...categoryAccessForm, groups: [...categoryAccessForm.groups, g.id] });
                                                                setCategoryGroupSearchTerm('');
                                                                setShowCategoryGroupDropdown(false);
                                                            }}
                                                            className="flex items-center gap-3 p-3 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                                                                <Users size={14} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-[#1e293b]">{g.name}</p>
                                                                <p className="text-xs text-[#64748b]">{g.memberIds?.length || 0} members</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {groups.filter(g => 
                                                    !categoryAccessForm.groups.includes(g.id) &&
                                                    g.name.toLowerCase().includes(categoryGroupSearchTerm.toLowerCase())
                                                ).length === 0 && (
                                                    <div className="p-4 text-center text-sm text-[#64748b]">
                                                        No groups found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> Leave both fields empty to make the category accessible to all employees.
                                </p>
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsCategoryAccessModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-4 py-2.5 bg-[#f97316] text-white rounded-xl font-semibold shadow-lg hover:bg-[#ea580c] transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={16} />
                                    Save Permissions
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCatModalOpen && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-[#1e293b]">{editingCat ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsCatModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]">
                                <X size={24}/>
                            </button>
                        </div>
                        <form className="p-8 space-y-5" onSubmit={(e) => {
                            e.preventDefault();
                            const { created_at, updated_at, ...safeCat } = catForm as any;
                            const data: PolicyCategory = {
                                ...safeCat,
                                id: editingCat ? editingCat.id : `cat-${Date.now()}`
                            };
                            editingCat ? onUpdateCategory(data) : onAddCategory(data);
                            setIsCatModalOpen(false);
                        }}>
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Name</label>
                                <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Description</label>
                                <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none h-24" />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-[#f97316] text-white rounded-xl font-bold shadow-lg">Save Category</button>
                        </form>
                    </div>
                </div>
            )}

            {isPolModalOpen && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white"><h3 className="text-xl font-bold text-[#1e293b]">{editingPol ? 'Edit Policy' : 'Create Policy'}</h3><button onClick={() => setIsPolModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]"><X size={24}/></button></div>
                        <form
  className="p-8 space-y-5"
  onSubmit={(e) => {
    e.preventDefault();

    // Remove DB-managed fields (VERY IMPORTANT)
    const {
      created_at,
      updated_at,
      lastUpdated,
      ...safePol
    } = polForm as any;

    const data: PolicyDocument = {
      ...safePol,
      id: editingPol ? editingPol.id : `pol-${Date.now()}`,
      categoryid: selectedCategory!,   //  backend expects categoryid
      version: Number(safePol.version) || 1
    };

    editingPol ? onUpdatePolicy(data) : onAddPolicy(data);
    setIsPolModalOpen(false);
  }}
>

                            <div className="grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Title</label><input value={polForm.title} onChange={e => setPolForm({...polForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium" required /></div><div><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Version</label><input value={polForm.version} onChange={e => setPolForm({...polForm, version: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium" /></div></div>
                            <div><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Content</label><textarea value={polForm.content} onChange={e => setPolForm({...polForm, content: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none h-64" required /></div>
                            <button type="submit" className="w-full py-4 bg-[#f97316] text-white rounded-xl font-bold">Publish Policy</button>
                        </form>
                    </div>
                </div>
            )}

            {viewPolicy && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-3xl h-[80vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
                        <div className="p-8 border-b bg-white flex justify-between items-start">
                            <div><h2 className="text-2xl font-bold text-[#1e293b] tracking-tight">{viewPolicy.title}</h2><div className="flex gap-3 mt-1.5"><span className="text-[10px] font-bold uppercase text-[#f97316] bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">VERSION {viewPolicy.version}</span><span className="text-[10px] font-bold uppercase text-[#94a3b8]">UPDATED: {viewPolicy.lastUpdated}</span></div></div>
                            <button onClick={() => setViewPolicy(null)} className="p-1.5 text-[#94a3b8] hover:text-[#1e293b]"><X size={24}/></button>
                        </div>
                        <div className="flex-1 p-10 overflow-y-auto bg-white"><div className="max-w-2xl mx-auto text-[#475569] leading-relaxed whitespace-pre-line text-base font-medium">{viewPolicy.content}</div></div>
                        <div className="px-8 py-6 border-t border-[#f1f5f9] flex justify-between items-center bg-[#f8fafc]">
                            <div className="flex items-center gap-2 text-[#94a3b8]">
                                <Shield size={16} />
                                <p className="text-[10px] font-bold uppercase tracking-wider">Internal Document</p>
                            </div>
                            {/* Download button removed as requested */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Handbook;