
import React, { useState, useRef } from 'react';
import { 
    Palmtree, Calendar, Plus, Edit, Trash2, MapPin, Search, X, 
    Save, Clock, ChevronLeft, ChevronRight, Download, ArrowRight,
    PalmtreeIcon, Star, Bell, Gift, Upload, Filter, ListFilter, AlertCircle
} from 'lucide-react';
// Fix: Added missing HolidayCalendarProps import from types.
import { Holiday, User, StatCardProps, HolidayCalendarProps } from '../types';

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] p-6 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#1e293b]">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
        {icon}
      </div>
    </div>
);

const HolidayCalendar: React.FC<HolidayCalendarProps> = ({ user = {} as User, holidays = [], onAddHoliday = (h: Holiday) => {}, onUpdateHoliday = (h: Holiday) => {}, onDeleteHoliday = (id: string) => {}, onApplyLeave }) => {
    const isHR = (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'hr');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'Public' | 'Company'>('All');
    const [calendarType, setCalendarType] = useState<'Indian' | 'American' | 'British' | 'All'>('Indian');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [form, setForm] = useState<Partial<Holiday>>({ name: '', date: '', type: 'Public', description: '' });

    // 2026 Holiday Data
    const holidays2026 = {
        Indian: [
            { id: 'ind-1', name: 'Republic Day', date: '2026-01-26', type: 'Public', description: 'Celebrates the adoption of the Constitution of India', country: 'Indian' },
            { id: 'ind-2', name: 'Maha Shivaratri', date: '2026-02-17', type: 'Public', description: 'Hindu festival dedicated to Lord Shiva', country: 'Indian' },
            { id: 'ind-3', name: 'Holi', date: '2026-03-06', type: 'Public', description: 'Festival of Colors celebrating spring and victory of good over evil', country: 'Indian' },
            { id: 'ind-4', name: 'Good Friday', date: '2026-04-03', type: 'Public', description: 'Christian observance of Jesus Christ\'s crucifixion', country: 'Indian' },
            { id: 'ind-5', name: 'Ram Navami', date: '2026-04-02', type: 'Public', description: 'Hindu festival celebrating the birth of Lord Rama', country: 'Indian' },
            { id: 'ind-6', name: 'Mahavir Jayanti', date: '2026-04-06', type: 'Public', description: 'Jain festival celebrating the birth of Lord Mahavira', country: 'Indian' },
            { id: 'ind-7', name: 'Eid-ul-Fitr', date: '2026-04-21', type: 'Public', description: 'Islamic festival marking the end of Ramadan', country: 'Indian' },
            { id: 'ind-8', name: 'Buddha Purnima', date: '2026-05-04', type: 'Public', description: 'Buddhist festival celebrating the birth of Gautama Buddha', country: 'Indian' },
            { id: 'ind-9', name: 'Eid-ul-Adha', date: '2026-06-28', type: 'Public', description: 'Islamic festival of sacrifice', country: 'Indian' },
            { id: 'ind-10', name: 'Muharram', date: '2026-07-17', type: 'Public', description: 'Islamic New Year and day of mourning', country: 'Indian' },
            { id: 'ind-11', name: 'Independence Day', date: '2026-08-15', type: 'Public', description: 'Celebrates India\'s independence from British rule', country: 'Indian' },
            { id: 'ind-12', name: 'Janmashtami', date: '2026-08-25', type: 'Public', description: 'Hindu festival celebrating the birth of Lord Krishna', country: 'Indian' },
            { id: 'ind-13', name: 'Ganesh Chaturthi', date: '2026-09-05', type: 'Public', description: 'Hindu festival celebrating Lord Ganesha', country: 'Indian' },
            { id: 'ind-14', name: 'Milad-un-Nabi', date: '2026-09-26', type: 'Public', description: 'Birthday of Prophet Muhammad', country: 'Indian' },
            { id: 'ind-15', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', type: 'Public', description: 'Birthday of Mahatma Gandhi, Father of the Nation', country: 'Indian' },
            { id: 'ind-16', name: 'Dussehra', date: '2026-10-12', type: 'Public', description: 'Hindu festival celebrating victory of good over evil', country: 'Indian' },
            { id: 'ind-17', name: 'Diwali', date: '2026-10-29', type: 'Public', description: 'Festival of Lights celebrating the victory of light over darkness', country: 'Indian' },
            { id: 'ind-18', name: 'Guru Nanak Jayanti', date: '2026-11-16', type: 'Public', description: 'Birthday of Guru Nanak Dev Ji, founder of Sikhism', country: 'Indian' },
            { id: 'ind-19', name: 'Christmas', date: '2026-12-25', type: 'Public', description: 'Christian festival celebrating the birth of Jesus Christ', country: 'Indian' }
        ],
        American: [
            { id: 'usa-1', name: 'New Year\'s Day', date: '2026-01-01', type: 'Public', description: 'First day of the year', country: 'American' },
            { id: 'usa-2', name: 'Martin Luther King Jr. Day', date: '2026-01-19', type: 'Public', description: 'Honors civil rights leader Martin Luther King Jr.', country: 'American' },
            { id: 'usa-3', name: 'Presidents\' Day', date: '2026-02-16', type: 'Public', description: 'Honors all U.S. presidents', country: 'American' },
            { id: 'usa-4', name: 'Memorial Day', date: '2026-05-25', type: 'Public', description: 'Honors military personnel who died in service', country: 'American' },
            { id: 'usa-5', name: 'Juneteenth', date: '2026-06-19', type: 'Public', description: 'Commemorates the end of slavery in the United States', country: 'American' },
            { id: 'usa-6', name: 'Independence Day', date: '2026-07-04', type: 'Public', description: 'Celebrates U.S. independence from Britain', country: 'American' },
            { id: 'usa-7', name: 'Labor Day', date: '2026-09-07', type: 'Public', description: 'Honors American workers and labor movement', country: 'American' },
            { id: 'usa-8', name: 'Columbus Day', date: '2026-10-12', type: 'Public', description: 'Commemorates Christopher Columbus\'s arrival in Americas', country: 'American' },
            { id: 'usa-9', name: 'Veterans Day', date: '2026-11-11', type: 'Public', description: 'Honors all military veterans', country: 'American' },
            { id: 'usa-10', name: 'Thanksgiving', date: '2026-11-26', type: 'Public', description: 'National day of thanksgiving and harvest celebration', country: 'American' },
            { id: 'usa-11', name: 'Christmas', date: '2026-12-25', type: 'Public', description: 'Christian festival celebrating the birth of Jesus Christ', country: 'American' }
        ],
        British: [
            { id: 'uk-1', name: 'New Year\'s Day', date: '2026-01-01', type: 'Public', description: 'First day of the year', country: 'British' },
            { id: 'uk-2', name: 'Good Friday', date: '2026-04-03', type: 'Public', description: 'Christian observance of Jesus Christ\'s crucifixion', country: 'British' },
            { id: 'uk-3', name: 'Easter Monday', date: '2026-04-06', type: 'Public', description: 'Day after Easter Sunday', country: 'British' },
            { id: 'uk-4', name: 'Early May Bank Holiday', date: '2026-05-04', type: 'Public', description: 'First Monday in May bank holiday', country: 'British' },
            { id: 'uk-5', name: 'Spring Bank Holiday', date: '2026-05-25', type: 'Public', description: 'Last Monday in May bank holiday', country: 'British' },
            { id: 'uk-6', name: 'Summer Bank Holiday', date: '2026-08-31', type: 'Public', description: 'Last Monday in August bank holiday', country: 'British' },
            { id: 'uk-7', name: 'Christmas Day', date: '2026-12-25', type: 'Public', description: 'Christian festival celebrating the birth of Jesus Christ', country: 'British' },
            { id: 'uk-8', name: 'Boxing Day', date: '2026-12-26', type: 'Public', description: 'Day after Christmas', country: 'British' }
        ]
    };

    // Merge predefined holidays with user-added holidays
    const allHolidays = [...holidays];
    if (calendarType === 'Indian') {
        allHolidays.push(...holidays2026.Indian.filter(h => !holidays.find(existing => existing.name === h.name && existing.date === h.date)));
    } else if (calendarType === 'American') {
        allHolidays.push(...holidays2026.American.filter(h => !holidays.find(existing => existing.name === h.name && existing.date === h.date)));
    } else if (calendarType === 'British') {
        allHolidays.push(...holidays2026.British.filter(h => !holidays.find(existing => existing.name === h.name && existing.date === h.date)));
    } else if (calendarType === 'All') {
        allHolidays.push(...holidays2026.Indian.filter(h => !holidays.find(existing => existing.name === h.name && existing.date === h.date)));
        allHolidays.push(...holidays2026.American.filter(h => !holidays.find(existing => existing.name === h.name && existing.date === h.date)));
        allHolidays.push(...holidays2026.British.filter(h => !holidays.find(existing => existing.name === h.name && existing.date === h.date)));
    }

    const filteredHolidays = allHolidays.filter(h => {
        const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || h.type === typeFilter;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const nextHoliday = filteredHolidays.find(h => new Date(h.date).getTime() > Date.now());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.confirm(editingHoliday ? 'Are you sure you want to update this holiday?' : 'Are you sure you want to add this new holiday?')) {
            return;
        }
        if (form.name && form.date) {
            const data = { ...form as Holiday, id: editingHoliday ? editingHoliday.id : `h-${Date.now()}` };
            editingHoliday ? onUpdateHoliday(data) : onAddHoliday(data);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">Holiday Calendar</h1>
                    <p className="text-[#64748b] text-base mt-1">Official organization and public holidays.</p>
                </div>
                <div className="flex space-x-3">
                    {isHR && (
                        <button 
                            onClick={() => { setEditingHoliday(null); setForm({ name: '', date: '', type: 'Public', description: '' }); setIsModalOpen(true); }} 
                            className="bg-[#f97316] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-500/20"
                        >
                            <Plus size={18} /> <span>Add Holiday</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Public Holidays" value={allHolidays.filter(h => h.type === 'Public').length} icon={<Palmtree size={20} />} color="bg-blue-500" />
                <StatCard title="Company Holidays" value={allHolidays.filter(h => h.type === 'Company').length} icon={<Gift size={20} />} color="bg-purple-500" />
                <StatCard title="Remaining" value={allHolidays.filter(h => new Date(h.date).getTime() > Date.now()).length} icon={<Calendar size={20} />} color="bg-[#22c55e]" />
                <StatCard title="Total" value={allHolidays.length} icon={<ListFilter size={20} />} color="bg-[#94a3b8]" />
            </div>

            {nextHoliday && (
                <div className="bg-white rounded-2xl p-8 border border-[#f1f5f9] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-orange-50 text-[#f97316] rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Clock size={32} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[#f97316] uppercase tracking-widest mb-1">UPCOMING BREAK</p>
                            <h2 className="text-3xl font-bold text-[#1e293b] tracking-tight">{nextHoliday.name}</h2>
                            <p className="text-[#64748b] font-medium mt-1">{new Date(nextHoliday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="text-center md:text-right">
                            <p className="text-4xl font-bold text-[#22c55e] leading-none">{Math.ceil((new Date(nextHoliday.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days</p>
                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mt-1">UNTIL VACATION</p>
                        </div>
                        {onApplyLeave && (
                            <button onClick={onApplyLeave} className="text-sm font-bold text-[#f97316] hover:underline flex items-center gap-1.5">
                                Request early leave <ArrowRight size={14}/>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] overflow-hidden">
                <div className="p-6 border-b border-[#f1f5f9]">
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full max-w-[360px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search holidays..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#f97316]/10 transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <select 
                                value={calendarType} 
                                onChange={(e) => setCalendarType(e.target.value as any)}
                                className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-xl text-sm font-bold text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#f97316]/10"
                            >
                                <option value="Indian">🇮🇳 Indian Calendar</option>
                                <option value="American">🇺🇸 American Calendar</option>
                                <option value="British">🇬🇧 British Calendar</option>
                                <option value="All">🌍 All Calendars</option>
                            </select>
                             <select 
                                value={typeFilter} 
                                onChange={(e) => setTypeFilter(e.target.value as any)}
                                className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-xl text-sm font-bold text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#f97316]/10"
                            >
                                <option value="All">All Types</option>
                                <option value="Public">Public Only</option>
                                <option value="Company">Company Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {filteredHolidays.map(h => (
                        <div key={h.id} className="bg-white p-6 rounded-2xl border border-[#f1f5f9] hover:border-[#f97316]/30 transition-all group">
                            <div className="flex justify-between items-start mb-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${h.type === 'Public' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                                    <Palmtree size={24}/>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isHR && (
                                        <>
                                            <button onClick={() => { setEditingHoliday(h); setForm(h); setIsModalOpen(true); }} className="p-2 text-[#94a3b8] hover:text-[#1e293b]"><Edit size={16}/></button>
                                            <button onClick={() => { if (window.confirm('Are you sure you want to delete this holiday?')) { onDeleteHoliday(h.id); } }} className="p-2 text-[#94a3b8] hover:text-red-500"><Trash2 size={16}/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${h.type === 'Public' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                    {h.type}
                                </span>
                                <h3 className="text-lg font-bold text-[#1e293b] pt-2">{h.name}</h3>
                                <p className="text-sm font-medium text-[#64748b]">{new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
                            </div>
                            <p className="text-sm text-[#94a3b8] mt-4 line-clamp-2 leading-relaxed">{h.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-[#1e293b]">{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Holiday Name</label>
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Date</label>
                                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Type</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none">
                                        <option value="Public">Public</option>
                                        <option value="Company">Company</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Description</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#f97316]/10 outline-none h-24" />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-[#f97316] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-[#ea580c] transition-all">Confirm & Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayCalendar;
