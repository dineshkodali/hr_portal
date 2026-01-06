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

// Default categories and sample policies for SD Commercial
const defaultCategories: PolicyCategory[] = [
    { id: 'cat-conduct', name: 'Code of Conduct', description: 'Guidelines for professional behavior and ethics.', icon: 'BookOpen' },
    { id: 'cat-attendance', name: 'Attendance & Leave', description: 'Rules for attendance, leave, and time-off.', icon: 'Clock' },
    { id: 'cat-payroll', name: 'Payroll & Compensation', description: 'Salary, overtime, and compensation policies.', icon: 'DollarSign' },
    { id: 'cat-harassment', name: 'Anti-Harassment & Equal Opportunity', description: 'Policies for workplace safety and equality.', icon: 'Shield' },
    { id: 'cat-it', name: 'IT & Data Security', description: 'Guidelines for technology and data protection.', icon: 'Lock' },
    { id: 'cat-health', name: 'Health, Safety & Environment', description: 'Workplace health and safety standards.', icon: 'LifeBuoy' },
    { id: 'cat-remote', name: 'Remote Work & Flexibility', description: 'Remote work and flexible hours policies.', icon: 'BookOpen' },
    { id: 'cat-benefits', name: 'Employee Benefits', description: 'Benefits and perks for employees.', icon: 'Star' },
    { id: 'cat-disciplinary', name: 'Disciplinary Procedures', description: 'Rules for discipline and termination.', icon: 'Info' },
    { id: 'cat-recruitment', name: 'Recruitment & Onboarding', description: 'Hiring and onboarding processes.', icon: 'BookOpen' },
    { id: 'cat-grievance', name: 'Grievance Redressal', description: 'How to raise and resolve complaints.', icon: 'LifeBuoy' },
    { id: 'cat-confidentiality', name: 'Confidentiality & NDA', description: 'Confidentiality and non-disclosure policies.', icon: 'Lock' },
];

const defaultPolicies: PolicyDocument[] = [
    // Code of Conduct
    { id: 'pol-conduct-1', categoryId: 'cat-conduct', title: 'Employee Code of Conduct', content: 'All employees must adhere to the highest standards of professional behavior and ethics.', version: '1', lastUpdated: '2026-01-01' },
    { id: 'pol-conduct-2', categoryId: 'cat-conduct', title: 'Dress Code Policy', content: 'Employees are expected to dress appropriately for the workplace.', version: '1', lastUpdated: '2026-01-01' },
    // Attendance & Leave
    { id: 'pol-attendance-1', categoryId: 'cat-attendance', title: 'Attendance Policy', content: 'Regular attendance is mandatory. Absences must be reported in advance.', version: '1', lastUpdated: '2026-01-01' },
    { id: 'pol-attendance-2', categoryId: 'cat-attendance', title: 'Annual Leave Policy', content: 'Employees are entitled to annual paid leave as per company guidelines.', version: '1', lastUpdated: '2026-01-01' },
    { id: 'pol-attendance-3', categoryId: 'cat-attendance', title: 'Sick Leave Policy', content: 'Sick leave is available for health-related absences.', version: '1', lastUpdated: '2026-01-01' },
    // Payroll & Compensation
    { id: 'pol-payroll-1', categoryId: 'cat-payroll', title: 'Payroll Schedule', content: 'Salaries are paid on the last working day of each month.', version: '1', lastUpdated: '2026-01-01' },
    { id: 'pol-payroll-2', categoryId: 'cat-payroll', title: 'Overtime Policy', content: 'Overtime is compensated as per statutory requirements.', version: '1', lastUpdated: '2026-01-01' },
    // Anti-Harassment & Equal Opportunity
    { id: 'pol-harassment-1', categoryId: 'cat-harassment', title: 'Anti-Harassment Policy', content: 'Harassment of any kind is strictly prohibited.', version: '1', lastUpdated: '2026-01-01' },
    { id: 'pol-harassment-2', categoryId: 'cat-harassment', title: 'Equal Opportunity Statement', content: 'SD Commercial is an equal opportunity employer.', version: '1', lastUpdated: '2026-01-01' },
    // IT & Data Security
    { id: 'pol-it-1', categoryId: 'cat-it', title: 'Acceptable Use Policy', content: 'Company IT resources must be used responsibly.', version: '1', lastUpdated: '2026-01-01' },
    { id: 'pol-it-2', categoryId: 'cat-it', title: 'Data Protection Policy', content: 'All personal and company data must be protected.', version: '1', lastUpdated: '2026-01-01' },
    // Health, Safety & Environment
    { id: 'pol-health-1', categoryId: 'cat-health', title: 'Workplace Safety Policy', content: 'Safety procedures must be followed at all times.', version: '1', lastUpdated: '2026-01-01' },
    // Remote Work & Flexibility
    { id: 'pol-remote-1', categoryId: 'cat-remote', title: 'Remote Work Policy', content: 'Remote work is permitted as per company guidelines.', version: '1', lastUpdated: '2026-01-01' },
    // Employee Benefits
    { id: 'pol-benefits-1', categoryId: 'cat-benefits', title: 'Health Insurance Policy', content: 'Health insurance is provided to all eligible employees.', version: '1', lastUpdated: '2026-01-01' },
    // Disciplinary Procedures
    { id: 'pol-disciplinary-1', categoryId: 'cat-disciplinary', title: 'Disciplinary Action Policy', content: 'Disciplinary actions will be taken for violations of company policy.', version: '1', lastUpdated: '2026-01-01' },
    // Recruitment & Onboarding
    { id: 'pol-recruitment-1', categoryId: 'cat-recruitment', title: 'Recruitment Policy', content: 'Recruitment is conducted in a fair and transparent manner.', version: '1', lastUpdated: '2026-01-01' },
    // Grievance Redressal
    { id: 'pol-grievance-1', categoryId: 'cat-grievance', title: 'Grievance Policy', content: 'Employees may raise grievances through the official process.', version: '1', lastUpdated: '2026-01-01' },
    // Confidentiality & NDA
    { id: 'pol-confidentiality-1', categoryId: 'cat-confidentiality', title: 'Confidentiality Agreement', content: 'All employees must sign a confidentiality agreement.', version: '1', lastUpdated: '2026-01-01' },
];

const Handbook: React.FC<HandbookProps> = (props) => {
        // No-op handlers for testing
        const onAddCategory = (c: PolicyCategory) => {};
        const onUpdateCategory = (c: PolicyCategory) => {};
        const onDeleteCategory = (id: string) => {};
        const onAddPolicy = (p: PolicyDocument) => {};
        const onUpdatePolicy = (p: PolicyDocument) => {};
        const onDeletePolicy = (id: string) => {};
    // Force use of default data for testing
    const effectiveCategories = defaultCategories;
    const effectivePolicies = defaultPolicies;
    // For real use, set isHR based on user role. For now, set to true to test admin/HR UI.
    const isHR = true;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewPolicy, setViewPolicy] = useState<PolicyDocument | null>(null);

    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<PolicyCategory | null>(null);
    const [catForm, setCatForm] = useState<Partial<PolicyCategory>>({ name: '', description: '' });

    const [isPolModalOpen, setIsPolModalOpen] = useState(false);
    const [editingPol, setEditingPol] = useState<PolicyDocument | null>(null);
    const [polForm, setPolForm] = useState<Partial<PolicyDocument>>({ title: '', content: '', version: '1.0', fileUrl: '' });

    const filteredCategories = effectiveCategories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'Shield': return <Shield size={24} />;
            case 'Lock': return <Lock size={24} />;
            case 'DollarSign': return <DollarSign size={24} />;
            case 'LifeBuoy': return <LifeBuoy size={24} />;
            default: return <BookOpen size={24} />;
        }
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
                        onClick={() => { setEditingCat(null); setCatForm({ name: '', description: ''
                            // , icon: 'BookOpen' 

                        }); setIsCatModalOpen(true); }} 
                        className="bg-[#f97316] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus size={18} /> <span>Add Category</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Policies" count={effectivePolicies.length} icon={<FileText size={20} />} color="bg-blue-500" />
                <SummaryCard title="Categories" count={effectiveCategories.length} icon={<BookOpen size={20} />} color="bg-purple-500" />
                <SummaryCard title="Compliance" count={100} icon={<Shield size={20} />} color="bg-[#94a3b8]" />
                <SummaryCard title="Updates" count={effectivePolicies.length > 0 ? 2 : 0} icon={<Clock size={20} />} color="bg-[#22c55e]" />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredCategories.map(cat => (
                                <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="bg-white p-3 rounded-xl border border-[#f1f5f9] hover:border-[#f97316]/20 shadow-sm hover:shadow-md transition-all cursor-pointer group min-h-[170px] flex flex-col justify-between">
                                    <div className="w-10 h-10 bg-[#f8fafc] text-[#94a3b8] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#f97316] group-hover:text-white transition-all">{getIcon(cat.icon)}</div>
                                    <h3 className="text-base font-bold text-[#1e293b] mb-1">{cat.name}</h3>
                                    <p className="text-xs text-[#64748b] leading-snug mb-2 line-clamp-2">{cat.description}</p>
                                    <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-2">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#f97316] uppercase tracking-wider"><span>{effectivePolicies.filter(p => p.categoryId === cat.id).length} Docs</span><ChevronRight size={14} /></div>
                                        {isHR && (
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => { setEditingCat(cat); setCatForm(cat); setIsCatModalOpen(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#1e293b]"><Edit size={16}/></button>
                                                <button onClick={() => { if(window.confirm('Delete category?')) onDeleteCategory(cat.id); }} className="p-1.5 text-[#94a3b8] hover:text-red-500"><Trash2 size={16}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-sm font-bold text-[#64748b] hover:text-[#1e293b]"><ChevronLeft size={18} /> Back to Categories</button>
                                {isHR && <button onClick={() => { setEditingPol(null); setPolForm({ title: '', content: '', version: '1.0' }); setIsPolModalOpen(true); }} className="bg-[#1e293b] text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all"><Plus size={16}/> New Policy</button>}
                            </div>
                            <h2 className="text-xl font-bold text-[#1e293b] mb-6 px-2">{effectiveCategories.find(c => c.id === selectedCategory)?.name}</h2>
                            <div className="overflow-x-auto rounded-xl border border-[#f1f5f9]">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafc] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Title</th>
                                            <th className="px-4 py-3">Version</th>
                                            <th className="px-4 py-3">Updated</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f5f9]">
                                        {effectivePolicies.filter(p => p.categoryId === selectedCategory).map(pol => (
                                            <tr key={pol.id} className="hover:bg-[#fcfdfe] transition-colors cursor-pointer group" onClick={() => setViewPolicy(pol)}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16}/>
                                                        <span className="text-sm font-bold text-[#334155] group-hover:text-[#f97316] transition-colors">{pol.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-[#64748b]">v{pol.version}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-[#64748b]">{pol.lastUpdated}</td>
                                                <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1">
                                                        {isHR && (
                                                            <>
                                                                <button onClick={() => { setEditingPol(pol); setPolForm(pol); setIsPolModalOpen(true); }} className="p-2 text-[#94a3b8] hover:text-blue-600"><Edit size={16}/></button>
                                                                <button onClick={() => { if(window.confirm('Delete policy?')) onDeletePolicy(pol.id); }} className="p-2 text-[#94a3b8] hover:text-red-500"><Trash2 size={16}/></button>
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
  const { created_at, updated_at, ...safeCat } = catForm as any;

  const data: PolicyCategory = {
    ...safeCat,
    id: editingCat ? editingCat.id : `cat-${Date.now()}`
  };

  editingCat ? onUpdateCategory(data) : onAddCategory(data);
  setIsCatModalOpen(false);
}}
>
                            <div><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Name</label><input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium" required /></div>
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
            categoryId: selectedCategory!, // use correct field
            version: String(safePol.version || '1'),
            fileUrl: polForm.fileUrl || ''
        };

        editingPol ? onUpdatePolicy(data) : onAddPolicy(data);
        setIsPolModalOpen(false);
    }}
>

                            <div className="grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Title</label><input value={polForm.title} onChange={e => setPolForm({...polForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium" required /></div><div><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Version</label><input value={polForm.version} onChange={e => setPolForm({...polForm, version: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium" /></div></div>
                                                        <div><label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Content</label><textarea value={polForm.content} onChange={e => setPolForm({...polForm, content: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none h-64" required /></div>
                                                        {isHR && (
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Upload PDF/DOCX</label>
                                                                <input
                                                                    type="file"
                                                                    accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                                                                    onChange={e => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            // For now, just store the file name as a placeholder. Real upload would use backend.
                                                                            setPolForm({ ...polForm, fileUrl: file.name });
                                                                        }
                                                                    }}
                                                                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium"
                                                                />
                                                                {polForm.fileUrl && <div className="text-xs text-[#64748b] mt-1">Selected: {polForm.fileUrl}</div>}
                                                            </div>
                                                        )}
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
                                                <div className="flex-1 p-10 overflow-y-auto bg-white">
                                                    <div className="max-w-2xl mx-auto text-[#475569] leading-relaxed whitespace-pre-line text-base font-medium">
                                                        {viewPolicy.fileUrl ? (
                                                            viewPolicy.fileUrl.endsWith('.pdf') ? (
                                                                <iframe
                                                                    src={viewPolicy.fileUrl}
                                                                    title="Policy PDF"
                                                                    width="100%"
                                                                    height="600px"
                                                                    style={{ border: 'none' }}
                                                                />
                                                            ) : viewPolicy.fileUrl.endsWith('.doc') || viewPolicy.fileUrl.endsWith('.docx') ? (
                                                                <a href={viewPolicy.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Document</a>
                                                            ) : (
                                                                <span>File: {viewPolicy.fileUrl}</span>
                                                            )
                                                        ) : (
                                                            viewPolicy.content
                                                        )}
                                                    </div>
                                                </div>
                        <div className="px-8 py-6 border-t border-[#f1f5f9] flex justify-between items-center bg-[#f8fafc]"><div className="flex items-center gap-2 text-[#94a3b8]"><Shield size={16} /><p className="text-[10px] font-bold uppercase tracking-wider">Internal Document</p></div></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Handbook;