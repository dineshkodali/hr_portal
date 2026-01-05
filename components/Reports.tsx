
import React from 'react';
import { FileText, Download, Plus, Home, ChevronRight } from 'lucide-react';

const Reports: React.FC = () => {
  const reportCards = [
    {
      id: 1,
      title: "Monthly Occupancy Report",
      description: "Property occupancy rates for October 2024",
      date: "01 Nov 2024",
      tag: "Occupancy"
    },
    {
      id: 2,
      title: "Incident Summary",
      description: "All incidents logged in Q3 2024",
      date: "30 Oct 2024",
      tag: "Incidents"
    },
    {
      id: 3,
      title: "Compliance Status",
      description: "Safety certificate expiry overview",
      date: "28 Oct 2024",
      tag: "Compliance"
    },
    {
      id: 4,
      title: "Maintenance Costs",
      description: "Monthly maintenance expenditure breakdown",
      date: "25 Oct 2024",
      tag: "Finance"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumbs and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Reports</h1>
          <nav className="flex items-center space-x-2 text-xs font-medium text-[#64748b] mt-1.5">
            <Home size={14} className="hover:text-[#1e293b] cursor-pointer" />
            <ChevronRight size={12} className="text-[#94a3b8]" />
            <span className="hover:text-[#1e293b] cursor-pointer">Reports</span>
            <ChevronRight size={12} className="text-[#94a3b8]" />
            <span className="text-[#1e293b]">Report Library</span>
          </nav>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-teal-500/10 text-sm">
          <Plus size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all flex flex-col p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-50 rounded-xl text-primary shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1e293b] leading-tight">{report.title}</h3>
                <p className="text-sm text-[#64748b] mt-1 font-medium">{report.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8]">
                <FileText size={14} />
                <span>{report.date}</span>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-[#64748b] text-[10px] font-black uppercase rounded-lg border border-slate-200 tracking-wider">
                {report.tag}
              </span>
            </div>

            <button className="w-full mt-auto py-3.5 border border-[#e2e8f0] rounded-xl flex items-center justify-center gap-2.5 text-xs font-black text-[#64748b] uppercase tracking-widest hover:bg-slate-50 transition-colors group">
              <Download size={16} className="text-[#94a3b8] group-hover:text-primary transition-colors" />
              <span>Download Report</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
