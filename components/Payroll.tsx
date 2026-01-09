// Extend Window interface for custom global function
declare global {
    interface Window {
        refreshReimbursements?: () => void;
    }
}

import React, { useState, useMemo, useEffect } from 'react';
/* Added missing Plus import from lucide-react */
import { 
    Search, X, SquarePen, AlertTriangle, Info, Calculator, DollarSign, Download, FileText, Plus
} from 'lucide-react';
import { 
    PayrollRecord, PayrollProps, Employee, 
    Reimbursement, SalaryStructure 
} from '../types';

const Payroll: React.FC<PayrollProps> = ({ 
    user, 
    payrollRecords = [], 
    employees = [], 
    reimbursements = [],
    onAddPayroll, 
    onUpdatePayroll, 
    onDeletePayroll, 
    onUpdateEmployee,
    onAddReimbursement,
    onUpdateReimbursement,
    onDeleteReimbursement
}) => {
    const isEmployee = user.role === 'employee';
    // Custom fields state for claim form
    const [customFieldsState, setCustomFieldsState] = useState<{ name: string; value: string }[]>([]);
    const handleAddCustomField = () => setCustomFieldsState([...customFieldsState, { name: '', value: '' }]);
    const handleCustomFieldChange = (idx: number, key: 'name' | 'value', val: string) => {
        setCustomFieldsState(fields => fields.map((f, i) => i === idx ? { ...f, [key]: val } : f));
    };
    const handleRemoveCustomField = (idx: number) => {
        setCustomFieldsState(fields => fields.filter((_, i) => i !== idx));
    };
    const [activeTab, setActiveTab] = useState<'Overview' | 'Salary Setup' | 'Process Payroll' | 'Claims Management'>(isEmployee ? 'Overview' : 'Process Payroll');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
    const [processingMonth] = useState('October 2023');
    
    // Modal state
    const [isRunPayrollModalOpen, setIsRunPayrollModalOpen] = useState(false);
    const [targetEmp, setTargetEmp] = useState<Employee | null>(null);
    const [runPayrollForm, setRunPayrollForm] = useState({
        basic: 0, hra: 0, conveyance: 0, medical: 0, specialAllowances: 0, pf: 0, esi: 0, tds: 0, professionalTax: 0, adhocBonus: 0, adhocDeduction: 0
    });

    const [salaryForm, setSalaryForm] = useState<SalaryStructure>({ 
        basic: 0, hra: 0, conveyance: 0, medical: 0, specialAllowances: 0, pf: 0, esi: 0, tds: 0, professionalTax: 0 
    });

    const selectedEmp = useMemo(() => employees.find(e => e.id === selectedEmpId), [employees, selectedEmpId]);

    useEffect(() => {
        if (selectedEmp) {
            setSalaryForm(selectedEmp.salaryStructure || {
                basic: 0, hra: 0, conveyance: 0, medical: 0, specialAllowances: 0, pf: 0, esi: 0, tds: 0, professionalTax: 0
            });
        }
    }, [selectedEmpId, selectedEmp]);

    const calculateGross = (s: any) => 
        (Number(s.basic) || 0) + (Number(s.hra) || 0) + (Number(s.conveyance) || 0) + (Number(s.medical) || 0) + (Number(s.specialAllowances) || 0);

    const calculateDeductions = (s: any) => 
        (Number(s.pf) || 0) + (Number(s.esi) || 0) + (Number(s.tds) || 0) + (Number(s.professionalTax) || 0);

    const filteredEmployees = employees.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const avatarColors: Record<string, string> = {
        'JD': 'bg-orange-500',
        'PP': 'bg-purple-200 text-purple-700',
        'NR': 'bg-emerald-900',
        'SR': 'bg-orange-200 text-orange-700',
        'KR': 'bg-yellow-400 text-yellow-900',
        'JC': 'bg-slate-500',
        'MD': 'bg-red-400',
        'Q': 'bg-cyan-500',
    };

    const handleOpenProcess = (emp: Employee) => {
        setTargetEmp(emp);
        const s = emp.salaryStructure || { basic: 0, hra: 0, conveyance: 0, medical: 0, specialAllowances: 0, pf: 0, esi: 0, tds: 0, professionalTax: 0 };
        setRunPayrollForm({ ...s, adhocBonus: 0, adhocDeduction: 0 });
        setIsRunPayrollModalOpen(true);
    };

    const handleConfirmProcess = () => {
        if (!targetEmp) return;
        const gross = calculateGross(runPayrollForm);
        const deductions = calculateDeductions(runPayrollForm);
        const net = gross + runPayrollForm.adhocBonus - deductions - runPayrollForm.adhocDeduction;

        onAddPayroll({
            id: `pay-${Date.now()}`,
            employeeId: targetEmp.id,
            employeeName: targetEmp.name,
            employeeAvatar: targetEmp.avatar,
            month: processingMonth,
            basicSalary: runPayrollForm.basic,
            allowances: (gross - runPayrollForm.basic),
            deductions: deductions,
            netSalary: net,
            status: 'Paid',
            payableDays: 30,
            breakdown: { ...runPayrollForm, grossEarnings: gross + runPayrollForm.adhocBonus, totalDeductions: deductions + runPayrollForm.adhocDeduction, overtime: 0, special: runPayrollForm.specialAllowances, pt: runPayrollForm.professionalTax, lop: 0 }
        });
        setIsRunPayrollModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">Payroll Management</h1>
                <p className="text-[#64748b] text-base mt-1">Process salaries, manage structures and compliance.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] overflow-hidden">
                {/* Tabs Styling */}
                <div className="flex border-b border-[#f1f5f9] bg-[#fcfdfe] px-6 h-16 items-center gap-2">
                    {['Overview', 'Salary Setup', 'Process Payroll', 'Claims Management'].map((tab) => {
                        if (isEmployee && (tab === 'Salary Setup' || tab === 'Process Payroll')) return null;
                        const isActive = activeTab === tab;
                        return (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab as any)} 
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'bg-white shadow-sm text-[#f97316]' : 'text-[#64748b] hover:text-[#1e293b]'}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'Process Payroll' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-400">
                        {/* Search Bar UI */}
                        <div className="p-6">
                            <div className="relative max-w-[360px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search employee..." 
                                    className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/10 text-sm font-medium text-[#1e293b] placeholder:text-[#94a3b8] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Process Payroll Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc] border-y border-[#f1f5f9]">
                                        <th className="px-6 py-4 font-extrabold">EMPLOYEE</th>
                                        <th className="px-6 py-4 font-extrabold">DEPARTMENT</th>
                                        <th className="px-6 py-4 font-extrabold">GROSS SALARY</th>
                                        <th className="px-6 py-4 font-extrabold">STATUS</th>
                                        <th className="px-6 py-4 font-extrabold text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9]">
                                    {filteredEmployees.map((emp) => {
                                        const hasProcessed = payrollRecords.some(p => p.employeeId === emp.id && p.month === processingMonth);
                                        const initials = getInitials(emp.name);
                                        const bgColor = avatarColors[initials] || 'bg-slate-400';
                                        
                                        return (
                                            <tr key={emp.id} className="hover:bg-[#fcfdfe] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${bgColor}`}>
                                                            {initials}
                                                        </div>
                                                        <span className="text-sm font-bold text-[#334155]">{emp.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#64748b] font-medium">{emp.department}</td>
                                                <td className="px-6 py-4 text-sm text-[#475569] font-medium">${calculateGross(emp.salaryStructure || {}).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-4 py-1 rounded-full text-[11px] font-semibold border ${hasProcessed ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0]'}`}>
                                                        {hasProcessed ? 'Paid' : 'Not Generated'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleOpenProcess(emp)}
                                                        className="p-1.5 text-[#94a3b8] hover:text-[#1e293b] transition-colors rounded-lg"
                                                    >
                                                        <SquarePen size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Salary Setup' && (
                    <div className="flex flex-col lg:flex-row h-[700px] animate-in slide-in-from-bottom-2 duration-400">
                        {/* Sidebar */}
                        <div className="w-full lg:w-80 border-r border-[#f1f5f9] flex flex-col p-6 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-[#1e293b]">Employees</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search employee..." 
                                        className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#f97316]/10" 
                                        value={searchTerm} 
                                        onChange={e => setSearchTerm(e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                {filteredEmployees.map((emp) => {
                                    const initials = getInitials(emp.name);
                                    const bgColor = avatarColors[initials] || 'bg-slate-400';
                                    const isActive = selectedEmpId === emp.id;
                                    return (
                                        <button 
                                            key={emp.id} 
                                            onClick={() => setSelectedEmpId(emp.id)} 
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${isActive ? 'bg-white border-[#e2e8f0] shadow-sm' : 'border-transparent hover:bg-[#f8fafc]'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${bgColor}`}>
                                                {initials}
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-xs font-bold text-[#334155] truncate">{emp.name}</p>
                                                <p className="text-[10px] text-[#94a3b8] font-medium truncate">{emp.designation}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                            {selectedEmp ? (
                                <div className="space-y-10 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#1e293b]">Salary Configuration</h2>
                                            <p className="text-[#64748b] text-sm mt-1">Configure earnings, deductions and bank details for {selectedEmp.name}.</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">GROSS SALARY</p>
                                            <p className="text-[28px] font-bold text-[#22c55e] leading-none">${calculateGross(salaryForm).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Earnings Section */}
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-2">
                                            <Plus size={14} /> EARNINGS (MONTHLY)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                            {[
                                                { label: 'Basic Salary', key: 'basic' },
                                                { label: 'HRA', key: 'hra' },
                                                { label: 'Conveyance', key: 'conveyance' },
                                                { label: 'Medical', key: 'medical' },
                                                { label: 'Special Allowances', key: 'specialAllowances' }
                                            ].map((field, idx) => (
                                                <div key={field.key} className={field.key === 'specialAllowances' ? 'md:col-span-2' : ''}>
                                                    <label className="block text-xs font-bold text-[#64748b] mb-1.5">{field.label}</label>
                                                    <input 
                                                        type="number" 
                                                        value={salaryForm[field.key as keyof SalaryStructure]} 
                                                        onChange={e => setSalaryForm({...salaryForm, [field.key]: Number(e.target.value)})} 
                                                        className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none" 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deductions Section */}
                                    <div className="space-y-6 border-t border-[#f1f5f9] pt-8">
                                        <h4 className="text-[11px] font-bold text-[#ef4444] uppercase tracking-widest flex items-center gap-2">
                                            <Calculator className="rotate-180" size={14} /> DEDUCTIONS (MONTHLY)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                            {[
                                                { label: 'Provident Fund (PF)', key: 'pf' },
                                                { label: 'Professional Tax', key: 'professionalTax' },
                                                { label: 'TDS (Tax)', key: 'tds' },
                                                { label: 'ESI', key: 'esi' }
                                            ].map((field) => (
                                                <div key={field.key}>
                                                    <label className="block text-xs font-bold text-[#64748b] mb-1.5">{field.label}</label>
                                                    <input 
                                                        type="number" 
                                                        value={salaryForm[field.key as keyof SalaryStructure]} 
                                                        onChange={e => setSalaryForm({...salaryForm, [field.key]: Number(e.target.value)})} 
                                                        className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none" 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-4">
                                        <button 
                                            onClick={() => onUpdateEmployee({...selectedEmp, salaryStructure: salaryForm})} 
                                            className="px-8 py-3 bg-[#f97316] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-[#ea580c] transition-all"
                                        >
                                            Save Configuration
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-[#cbd5e1]">
                                    <Calculator size={64} className="mb-4 opacity-20" />
                                    <p className="text-sm font-medium">Select an employee to configure salary</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Overview' && (
                    <div className="p-8 space-y-6">
                        <h3 className="text-lg font-bold text-[#1e293b]">Recent Payroll Runs</h3>
                        <div className="overflow-x-auto rounded-xl border border-[#f1f5f9]">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">EMPLOYEE</th>
                                        <th className="px-6 py-4">MONTH</th>
                                        <th className="px-6 py-4">NET PAY</th>
                                        <th className="px-6 py-4">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9]">
                                    {payrollRecords.slice(0, 8).map(record => (
                                        <tr key={record.id} className="hover:bg-[#fcfdfe] transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {getInitials(record.employeename)}
                                                </div>
                                                <span className="text-sm font-bold text-[#334155]">{record.employeename}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#64748b]">{record.month}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-[#1e293b]">${record.netsalary.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-4 py-1 bg-orange-50 text-orange-700 rounded-full text-[11px] font-bold border border-orange-100">
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {payrollRecords.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-20 text-center text-[#94a3b8] text-sm italic">No payroll cycles discovered.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Claims Management' && (
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-[#1e293b]">Active Reimbursements</h3>
                                <p className="text-[#64748b] text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Claims pipeline overview</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-5 py-2 bg-white border border-[#e2e8f0] text-[#64748b] rounded-xl text-sm font-bold hover:bg-[#f8fafc] transition-all">Export CSV</button>
                                <button onClick={() => setActiveTab('Overview')} className="px-5 py-2 bg-[#1e293b] text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-black transition-all">Batch Settle</button>
                            </div>
                        </div>

                        {/* Employee Claim Request Form - Enhanced */}
                        {isEmployee && (
                            <div className="bg-white border border-[#f1f5f9] p-8 rounded-2xl shadow-lg mb-8 max-w-xl mx-auto">
                                <h4 className="text-xl font-bold text-[#f97316] mb-6 flex items-center gap-2">
                                    <FileText size={22}/> Raise a Claim Request
                                </h4>
                                <form
                                    onSubmit={async e => {
                                        e.preventDefault();
                                        
                                        if (!window.confirm('Are you sure you want to submit this reimbursement claim?')) {
                                            return;
                                        }
                                        
                                        const form = e.target as any;
                                        const description = form.description.value;
                                        const amount = Number(form.amount.value);
                                        const type = form.type.value;
                                        const proof = form.proof.files[0] || null;
                                        const customFields = customFieldsState;
                                        if (!description || !amount || !type) return;
                                        const formData = new FormData();
                                        formData.append('employeeId', user.id);
                                        formData.append('employeeName', user.name);
                                        formData.append('description', description);
                                        formData.append('amount', String(amount));
                                        formData.append('type', type);
                                        formData.append('date', new Date().toLocaleDateString());
                                        formData.append('status', 'Pending');
                                        if (proof) formData.append('proof', proof);
                                        formData.append('customFields', JSON.stringify(customFields));
                                        await fetch('/api/reimbursements/upload', {
                                            method: 'POST',
                                            body: formData
                                        });
                                        if (typeof window.refreshReimbursements === 'function') window.refreshReimbursements();
                                        form.reset();
                                        setCustomFieldsState([]);
                                    }}
                                    className="space-y-5"
                                    encType="multipart/form-data"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-[#64748b] mb-1.5">Description</label>
                                            <input name="description" type="text" required className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#64748b] mb-1.5">Amount</label>
                                            <input name="amount" type="number" min="1" required className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#64748b] mb-1.5">Type</label>
                                            <select name="type" required className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none">
                                                <option value="">Select type</option>
                                                <option value="Travel">Travel</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Food">Food</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#64748b] mb-1.5">Proof (Upload)</label>
                                            <input name="proof" type="file" accept="image/*,application/pdf" className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none" />
                                        </div>
                                    </div>
                                    {/* Custom Fields Section */}
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-[#64748b] mb-2">Custom Fields</label>
                                        <div className="space-y-2">
                                            {customFieldsState.map((field, idx) => (
                                                <div key={idx} className="flex gap-2 mb-1">
                                                    <input
                                                        type="text"
                                                        value={field.name}
                                                        onChange={e => handleCustomFieldChange(idx, 'name', e.target.value)}
                                                        placeholder="Field Name"
                                                        className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-xs font-medium w-1/3"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)}
                                                        placeholder="Field Value"
                                                        className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-xs font-medium w-2/3"
                                                    />
                                                    <button type="button" onClick={() => handleRemoveCustomField(idx)} className="text-red-500 hover:text-red-700 px-2">Remove</button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={handleAddCustomField} className="px-4 py-2 bg-[#f97316] text-white rounded-lg text-xs font-bold shadow hover:bg-[#ea580c] transition-all">Add Field</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" className="px-10 py-3 bg-[#f97316] text-white rounded-xl text-base font-bold shadow-lg shadow-orange-500/20 hover:bg-[#ea580c] transition-all">Submit Claim</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {reimbursements.map(claim => (
                                <div key={claim.id} className="bg-white border border-[#f1f5f9] p-6 rounded-2xl shadow-sm flex items-center justify-between group hover:border-[#f97316] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${claim.status === 'Pending' ? 'bg-orange-50 text-[#f97316]' : claim.status === 'Rejected' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                            <FileText size={28}/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-lg font-bold text-[#1e293b]">{claim.description}</p>
                                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${claim.status === 'Approved' ? 'bg-orange-50 text-orange-700 border-orange-100' : claim.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{claim.status}</span>
                                            </div>
                                            <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mt-1">{claim.employeeName} • {claim.date} • {claim.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-0.5">Total Claim</p>
                                            <p className="text-2xl font-bold text-[#1e293b] tracking-tighter">${claim.amount.toLocaleString()}</p>
                                        </div>
                                        {/* Admin controls: Approve/Reject */}
                                        {!isEmployee && claim.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => onUpdateReimbursement({ ...claim, status: 'Approved' })} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200 transition-all">Approve</button>
                                                <button onClick={() => onUpdateReimbursement({ ...claim, status: 'Rejected' })} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-all">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Process Payroll Modal - Exact Match Screenshot 3 */}
            {isRunPayrollModalOpen && targetEmp && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[720px] overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-[#f1f5f9] flex justify-between items-start bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-[#1e293b]">Process Payroll</h3>
                                <p className="text-xs font-medium text-[#64748b] mt-1">{targetEmp.name} - {processingMonth}</p>
                            </div>
                            <button onClick={() => setIsRunPayrollModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b] transition-colors"><X size={24}/></button>
                        </div>
                        
                        <div className="p-8 grid grid-cols-2 gap-x-12 gap-y-6">
                            {/* Earnings Column */}
                            <div className="space-y-5">
                                <h4 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-widest mb-2">EARNINGS</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Basic', key: 'basic' },
                                        { label: 'Hra', key: 'hra' },
                                        { label: 'Conveyance', key: 'conveyance' },
                                        { label: 'Medical', key: 'medical' },
                                        { label: 'Special Allowances', key: 'specialAllowances' }
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">{f.label}</label>
                                            <input 
                                                type="number" 
                                                value={runPayrollForm[f.key as keyof typeof runPayrollForm]} 
                                                onChange={e => setRunPayrollForm({...runPayrollForm, [f.key]: Number(e.target.value)})}
                                                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#f97316]" 
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-xs font-bold text-[#22c55e] mb-1.5">Adhoc Bonus</label>
                                        <input 
                                            type="number" 
                                            value={runPayrollForm.adhocBonus} 
                                            onChange={e => setRunPayrollForm({...runPayrollForm, adhocBonus: Number(e.target.value)})}
                                            className="w-full px-3 py-2 border border-[#22c55e]/20 bg-[#f0fdf4] rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#22c55e]" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Deductions Column */}
                            <div className="space-y-5">
                                <h4 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-widest mb-2">DEDUCTIONS</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Pf', key: 'pf' },
                                        { label: 'Esi', key: 'esi' },
                                        { label: 'Tds', key: 'tds' },
                                        { label: 'Professional Tax', key: 'professionalTax' }
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">{f.label}</label>
                                            <input 
                                                type="number" 
                                                value={runPayrollForm[f.key as keyof typeof runPayrollForm]} 
                                                onChange={e => setRunPayrollForm({...runPayrollForm, [f.key]: Number(e.target.value)})}
                                                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#f97316]" 
                                            />
                                        </div>
                                    ))}
                                    <div className="mt-8">
                                        <label className="block text-xs font-bold text-[#ef4444] mb-1.5">Adhoc Deduction</label>
                                        <input 
                                            type="number" 
                                            value={runPayrollForm.adhocDeduction} 
                                            onChange={e => setRunPayrollForm({...runPayrollForm, adhocDeduction: Number(e.target.value)})}
                                            className="w-full px-3 py-2 border border-[#ef4444]/20 bg-[#fef2f2] rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#ef4444]" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-[#f1f5f9] flex justify-between items-center bg-white">
                            <div>
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">NET PAY</p>
                                <p className="text-[32px] font-bold text-[#22c55e] leading-none">
                                    ${(calculateGross(runPayrollForm) + runPayrollForm.adhocBonus - calculateDeductions(runPayrollForm) - runPayrollForm.adhocDeduction).toLocaleString()}
                                </p>
                            </div>
                            <button 
                                onClick={handleConfirmProcess}
                                className="px-10 py-3.5 bg-[#f97316] text-white rounded-[14px] text-base font-bold shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] hover:bg-[#ea580c] transition-all"
                            >
                                Confirm & Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;