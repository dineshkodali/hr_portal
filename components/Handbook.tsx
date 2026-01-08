import React, { useState } from 'react';
import { 
    BookOpen, Search, Plus, Edit, Trash2, Shield, Lock, DollarSign, 
    LifeBuoy, FileText, ChevronRight, X, Save, Clock, Download,
    CheckCircle, Info, Star, ChevronLeft
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

const Handbook: React.FC<HandbookProps> = ({ 
    user = {} as any, categories = [], policies = [], users = [], groups = [],
    onAddCategory = (c: PolicyCategory) => {}, onUpdateCategory = (c: PolicyCategory) => {}, onDeleteCategory = (id: string) => {},
    onAddPolicy = (p: PolicyDocument) => {}, onUpdatePolicy = (p: PolicyDocument) => {}, onDeletePolicy = (id: string) => {}
}) => {
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCategories.map(cat => {
                                if (!hasCategoryAccess(cat)) return null;
                                return (
                                    <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="bg-white p-6 rounded-2xl border border-[#f1f5f9] hover:border-[#f97316]/20 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                        <div className="w-12 h-12 bg-[#f8fafc] text-[#94a3b8] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#f97316] group-hover:text-white transition-all">{getIcon(cat.icon)}</div>
                                        <h3 className="text-lg font-bold text-[#1e293b] mb-2">{cat.name}</h3>
                                        <p className="text-sm text-[#64748b] leading-relaxed mb-6 line-clamp-2">{cat.description}</p>
                                        {/* Category Access List UI */}
                                        {cat.access && (cat.access.users.length > 0 || cat.access.groups.length > 0) && (
                                            <div className="mb-3 text-xs text-[#64748b] bg-[#f8fafc] rounded-lg p-2 border border-[#e2e8f0]">
                                                <div className="font-bold text-[#334155] mb-1">Access:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {cat.access.users.map(uid => {
                                                        const u = users.find(x => x.id === uid);
                                                        return u ? (
                                                            <span key={u.id} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg font-semibold flex items-center gap-1">
                                                                {u.name}
                                                                {isHR && <button title="Remove" className="ml-1 text-[#64748b] hover:text-red-500" style={{fontSize:'12px'}} onClick={e => {e.stopPropagation(); onUpdateCategory({ ...cat, access: { ...cat.access, users: cat.access.users.filter(id => id !== u.id) } });}}>&times;</button>}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                    {cat.access.groups.map(gid => {
                                                        const g = groups.find(x => x.id === gid);
                                                        return g ? (
                                                            <span key={g.id} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg font-semibold flex items-center gap-1">
                                                                Group: {g.name}
                                                                {isHR && <button title="Remove" className="ml-1 text-[#64748b] hover:text-red-500" style={{fontSize:'12px'}} onClick={e => {e.stopPropagation(); onUpdateCategory({ ...cat, access: { ...cat.access, groups: cat.access.groups.filter(id => id !== g.id) } });}}>&times;</button>}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                                {(cat.access.users.length === 0 && cat.access.groups.length === 0) && <span className="text-[#64748b]">All employees</span>}
                                                {isHR && (
                                                    <div className="mt-2 flex gap-2">
                                                        <button className="px-2 py-1 bg-[#f97316] text-white rounded-lg text-xs font-bold" onClick={e => {e.stopPropagation(); setEditingCat(cat); setCatForm(cat); setIsCatModalOpen(true);}}>Add/Change Access</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-4">
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#f97316] uppercase tracking-wider"><span>{policies.filter(p => p.categoryid === cat.id && hasAccess(p)).length} Docs</span><ChevronRight size={14} /></div>
                                            {isHR && (
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => { setEditingCat(cat); setCatForm(cat); setIsCatModalOpen(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#1e293b]" title="Edit Category"><Edit size={16}/></button>
                                                    <button onClick={() => { setEditingCat(cat); setCatForm(cat.access || { users: [], groups: [] }); setIsAccessModalOpen(true); }} className="p-1.5 text-[#94a3b8] hover:text-orange-500" title="Edit Access"><Shield size={16}/></button>
                                                    <button onClick={() => { if(window.confirm('Delete category?')) onDeleteCategory(cat.id); }} className="p-1.5 text-[#94a3b8] hover:text-red-500" title="Delete Category"><Trash2 size={16}/></button>
                                                </div>
                                            )}
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
                                                            <span className="text-sm font-bold text-[#334155] group-hover:text-[#f97316] transition-colors">{pol.title}</span>
                                                            {pol.access && (pol.access.users.length > 0 || pol.access.groups.length > 0) && (
                                                                <span className="ml-2 px-2 py-0.5 bg-orange-50 text-orange-500 text-[10px] font-bold rounded-lg border border-orange-100">Confidential</span>
                                                            )}
                                                        </div>
                                                        {/* Access List UI */}
                                                        {pol.access && (pol.access.users.length > 0 || pol.access.groups.length > 0) && (
                                                            <div className="mt-1 text-xs text-[#64748b] bg-[#f8fafc] rounded-lg p-2 border border-[#e2e8f0]">
                                                                <div className="font-bold text-[#334155] mb-1">Access: </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {pol.access.users.map(uid => {
                                                                        const u = users.find(x => x.id === uid);
                                                                        return u ? (
                                                                            <span key={u.id} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg font-semibold flex items-center gap-1">
                                                                                {u.name}
                                                                                {isHR && <button title="Remove" className="ml-1 text-[#64748b] hover:text-red-500" style={{fontSize:'12px'}} onClick={e => {e.stopPropagation(); onUpdatePolicy({ ...pol, access: { ...pol.access, users: pol.access.users.filter(id => id !== u.id) } });}}>&times;</button>}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                                    {pol.access.groups.map(gid => {
                                                                        const g = groups.find(x => x.id === gid);
                                                                        return g ? (
                                                                            <span key={g.id} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg font-semibold flex items-center gap-1">
                                                                                Group: {g.name}
                                                                                {isHR && <button title="Remove" className="ml-1 text-[#64748b] hover:text-red-500" style={{fontSize:'12px'}} onClick={e => {e.stopPropagation(); onUpdatePolicy({ ...pol, access: { ...pol.access, groups: pol.access.groups.filter(id => id !== g.id) } });}}>&times;</button>}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                                </div>
                                                                {(pol.access.users.length === 0 && pol.access.groups.length === 0) && <span className="text-[#64748b]">All employees</span>}
                                                                {isHR && (
                                                                    <div className="mt-2 flex gap-2">
                                                                        <button className="px-2 py-1 bg-[#f97316] text-white rounded-lg text-xs font-bold" onClick={e => {e.stopPropagation(); setAccessEditPolicy(pol); setAccessForm(pol.access || { users: [], groups: [] }); setIsAccessModalOpen(true);}}>Add/Change Access</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-[#64748b]">v{pol.version}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-[#64748b]">{pol?.updated_at}</td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1">
                                                        {/* Download button removed as requested */}
                                                        {isHR && (
                                                            <>
                                                                <button onClick={() => { setEditingPol(pol); setPolForm(pol); setIsPolModalOpen(true); }} className="p-2 text-[#94a3b8] hover:text-blue-600"><Edit size={18}/></button>
                                                                <button onClick={() => { setAccessEditPolicy(pol); setAccessForm(pol.access || { users: [], groups: [] }); setIsAccessModalOpen(true); }} className="p-2 text-[#94a3b8] hover:text-orange-500"><Shield size={18}/></button>
                                                                <button onClick={() => { if(window.confirm('Delete policy?')) onDeletePolicy(pol.id); }} className="p-2 text-[#94a3b8] hover:text-red-500"><Trash2 size={18}/></button>
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

            {isCatModalOpen && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white"><h3 className="text-xl font-bold text-[#1e293b]">{editingCat ? 'Edit Category' : 'New Category'}</h3><button onClick={() => setIsCatModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]"><X size={24}/></button></div>
                        <form className="p-8 space-y-5" onSubmit={(e) => {
  e.preventDefault();

  //  Remove DB-managed fields
                    {/* Access Permissions Modal */}
                    {isAccessModalOpen && (
                        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                                <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white">
                                    <h3 className="text-xl font-bold text-[#1e293b]">Configure Access Permissions</h3>
                                    <button onClick={() => setIsAccessModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]"><X size={24}/></button>
                                </div>
                                <form className="p-8 space-y-5" onSubmit={e => {
                                    e.preventDefault();
                                    if (accessEditPolicy) {
                                        onUpdatePolicy({ ...accessEditPolicy, access: accessForm });
                                        setIsAccessModalOpen(false);
                                    }
                                }}>
                                    <div>
                                        <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Allowed Users</label>
                                        <select multiple value={accessForm.users} onChange={e => setAccessForm({ ...accessForm, users: Array.from(e.target.selectedOptions as any, (o: any) => (o as HTMLOptionElement).value) })} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none">
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Allowed Groups</label>
                                        <select multiple value={accessForm.groups} onChange={e => setAccessForm({ ...accessForm, groups: Array.from(e.target.selectedOptions as any, (o: any) => (o as HTMLOptionElement).value) })} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none">
                                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full py-3.5 bg-[#f97316] text-white rounded-xl font-bold shadow-lg">Save Permissions</button>
                                </form>
                            </div>
                        </div>
                    )}
  const { created_at, updated_at, ...safeCat } = catForm as any;

  const data: PolicyCategory = {
    ...safeCat,
    id: editingCat ? editingCat.id : `cat-${Date.now()}`
  };

  editingCat ? onUpdateCategory(data) : onAddCategory(data);
  setIsCatModalOpen(false);
}}
>
                            <div><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Name</label><input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none" required /></div>
                            <div><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Description</label><textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none h-24" /></div>
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