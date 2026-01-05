import React, { useState } from "react";
import {
  Plus,
  Search,
  MapPin,
  Briefcase,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Upload,
  Download,
  Globe,
  Mail,
  ChevronRight,
  ArrowLeft,
  Send,
  MessageSquare,
  Filter,
  Building2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  LayoutGrid,
  List,
  FileUp,
  Users,
  SquarePen,
  Info,
  ExternalLink,
  Bookmark,
  Share2,
  ArrowRight,
  ThumbsUp,
  Paperclip,
  FileSignature,
  Phone,
  Printer,
  Sparkles,
} from "lucide-react";
import {
  Job,
  Candidate,
  StatCardProps,
  SystemConfig,
  OfferDetails,
} from "../types";

interface RecruitmentProps {
  jobs: Job[];
  candidates: Candidate[];
  systemConfig: SystemConfig;
  onAddJob: (job: Job) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onAddCandidate: (candidate: Candidate) => void;
  onUpdateCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (id: string) => void;
  standalone?: boolean;
}

const SummaryCard: React.FC<{
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, count, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] flex items-center justify-between min-w-[240px]">
    <div>
      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-[#1e293b] tracking-tight">
        {count}
      </h3>
    </div>
    <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>{icon}</div>
  </div>
);

const OfferLetterModal: React.FC<{
  candidate: Candidate;
  onClose: () => void;
  onSendOffer: (offer: OfferDetails) => void;
}> = ({ candidate, onClose, onSendOffer }) => {
  const [offerForm, setOfferForm] = useState<Partial<OfferDetails>>({
    salary: 0,
    joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    terms:
      "1. Probation period is 3 months.\n2. Standard working hours apply.\n3. Notice period is 30 days.",
  });
  const [preview, setPreview] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    onSendOffer({
      ...(offerForm as OfferDetails),
      generatedAt: new Date().toISOString(),
    });
  };

  const renderOfferContent = () => (
    <div className="bg-white p-12 border rounded shadow-inner font-serif text-[#1e293b] max-w-full overflow-hidden leading-relaxed">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl mx-auto rounded-xl mb-2">
          SDC
        </div>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Letter of Offer
        </h1>
      </div>
      <div className="flex justify-between mb-8">
        <div>
          <p className="font-bold">TO:</p>
          <p>{candidate.name}</p>
          <p>{candidate.email}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">DATE:</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="space-y-6">
        <p>Dear {candidate.name.split(" ")[0]},</p>
        <p>
          We are pleased to offer you the position of{" "}
          <span className="font-bold">{candidate.jobtitle}</span> at SDC CRM.
          Your skills and experience will be a valuable addition to our team.
        </p>

        <h3 className="font-bold border-b border-slate-200 pb-1 uppercase text-sm tracking-widest">
          Offer Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Annual Base Salary
            </p>
            <p className="font-bold text-lg">
              ${Number(offerForm.salary).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Joining Date
            </p>
            <p className="font-bold text-lg">{offerForm.joiningDate}</p>
          </div>
        </div>

        <h3 className="font-bold border-b border-slate-200 pb-1 uppercase text-sm tracking-widest">
          Terms & Conditions
        </h3>
        <div className="whitespace-pre-line text-sm bg-slate-50 p-4 rounded-lg italic">
          {offerForm.terms}
        </div>

        <p>
          Please review the terms and return a signed copy by{" "}
          {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
        </p>

        <div className="pt-10">
          <p>Sincerely,</p>
          <div className="h-12 w-48 border-b border-slate-300 mt-2 italic font-medium flex items-end">
            System Automated HR
          </div>
          <p className="font-bold mt-2">Human Resources Department</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in zoom-in duration-300 max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <FileSignature size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Offer Letter Generator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 bg-white border rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Form Side */}
          <form
            onSubmit={handleGenerate}
            className="w-full md:w-1/2 p-8 space-y-6 overflow-y-auto border-r border-slate-100 bg-slate-50/30"
          >
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Candidate
              </label>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200">
                  {candidate.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{candidate.name}</p>
                  <p className="text-xs text-slate-500">{candidate.jobtitle}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Annual Base Salary (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  value={offerForm.salary}
                  onChange={(e) =>
                    setOfferForm({
                      ...offerForm,
                      salary: Number(e.target.value),
                    })
                  }
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-bold"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Anticipated Joining Date
              </label>
              <input
                type="date"
                value={offerForm.joiningDate}
                onChange={(e) =>
                  setOfferForm({ ...offerForm, joiningDate: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Employment Terms
              </label>
              <textarea
                value={offerForm.terms}
                onChange={(e) =>
                  setOfferForm({ ...offerForm, terms: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm leading-relaxed h-48"
              />
            </div>
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="flex-1 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50"
              >
                {preview ? "Hide Preview" : "Show Preview"}
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Send size={14} /> Send via Email
              </button>
            </div>
          </form>

          {/* Preview Side */}
          <div
            className={`hidden md:block w-1/2 p-8 bg-slate-200/50 overflow-y-auto custom-scrollbar`}
          >
            <div className="sticky top-0 mb-4 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Live Document Preview
              </span>
              <div className="flex gap-2">
                <button className="p-2 bg-white text-slate-400 hover:text-slate-800 rounded-lg shadow-sm">
                  <Printer size={16} />
                </button>
                <button className="p-2 bg-white text-slate-400 hover:text-slate-800 rounded-lg shadow-sm">
                  <Download size={16} />
                </button>
              </div>
            </div>
            <div className="transform origin-top scale-[0.85] -mt-10">
              {renderOfferContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Recruitment: React.FC<RecruitmentProps> = ({
  jobs,
  candidates,
  systemConfig,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  standalone = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "jobs" | "candidates" | "emails" | "public"
  >(standalone ? "public" : "jobs");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<{
    type: "job" | "candidate";
    data: any;
  } | null>(null);

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [offeringToCandidate, setOfferingToCandidate] =
    useState<Candidate | null>(null);

  const [jobForm, setJobForm] = useState<Partial<Job>>({});
  const [candidateForm, setCandidateForm] = useState<Partial<Candidate>>({});

  const [publicJobView, setPublicJobView] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appForm, setAppForm] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
    coverLetter: "",
    resumeFile: "",
  });

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.confirm(editingJob ? 'Are you sure you want to update this job posting?' : 'Are you sure you want to create this new job posting?')) {
      return;
    }

    // Strip DB-managed fields
    const { created_at, updated_at, postedDate, ...safeJob } = jobForm as any;

    const data: Job = {
      ...safeJob,
      id: editingJob ? editingJob.id : `j-${Date.now()}`,
      postedDate: editingJob
        ? editingJob.postedDate
        : new Date().toISOString().split("T")[0],
      status: safeJob.status || "Active",
    };

    editingJob ? onUpdateJob(data) : onAddJob(data);

    setIsJobModalOpen(false);
    setEditingJob(null);
    setJobForm({});
  };

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.confirm(editingCandidate ? 'Are you sure you want to update this candidate information?' : 'Are you sure you want to add this new candidate?')) {
      return;
    }

    //  Strip DB-managed fields
    const { created_at, updated_at, appliedDate, ...safeCandidate } =
      candidateForm as any;

    const data: Candidate = {
      ...safeCandidate,
      id: editingCandidate ? editingCandidate.id : `c-${Date.now()}`,
      appliedDate: editingCandidate
        ? editingCandidate.appliedDate
        : new Date().toISOString().split("T")[0],
    };

    editingCandidate ? onUpdateCandidate(data) : onAddCandidate(data);

    setIsCandidateModalOpen(false);
    setEditingCandidate(null);
    setCandidateForm({});
  };

  const handleSendOffer = (offer: OfferDetails) => {
    if (offeringToCandidate) {
      onUpdateCandidate({
        ...offeringToCandidate,
        status: "Offered",
        offerDetails: offer,
      });
      alert(`Offer Letter sent to ${offeringToCandidate.name}!`);
      setIsOfferModalOpen(false);
      setOfferingToCandidate(null);
    }
  };

  const handlePublicApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (publicJobView) {
      const newCand: Candidate = {
        id: `cand-${Date.now()}`,
        name: appForm.name,
        email: appForm.email,
        phone: appForm.phone,
        appliedFor: publicJobView.title,
        appliedDate: new Date().toISOString().split("T")[0],
        status: "Applied",
        resumeUrl: appForm.resumeFile || "resume_internal.pdf",
      };
      onAddCandidate(newCand);
      onUpdateJob({
        ...publicJobView,
        applicants: (publicJobView.applicants || 0) + 1,
      });
      alert("Application submitted successfully!");
      setIsApplying(false);
      setPublicJobView(null);
      setAppForm({
        name: "",
        email: "",
        phone: "",
        portfolio: "",
        coverLetter: "",
        resumeFile: "",
      });
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesPosition =
      positionFilter === "All" || c.appliedFor === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const candidateStatuses: Candidate["status"][] = [
    "Applied",
    "Screening",
    "Interview",
    "Offered",
    "Hired",
  ];
  const jobTitles = Array.from(new Set(jobs.map((j) => j.title)));

  if (activeTab === "public") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] animate-in fade-in duration-500 font-sans">
        {/* Public Careers UI logic unchanged */}
        <div className="bg-[#0f172a] py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
              <Globe size={14} className="text-orange-500" /> SDC Enterprise
              Careers
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] text-balance">
              Build the next generation of{" "}
              <span className="text-orange-500">workforce solutions</span>.
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              We are looking for creators, thinkers, and builders to help us
              redefine how organizations manage talent globally.
            </p>
            {!standalone && (
              <button
                onClick={() => setActiveTab("jobs")}
                className="px-8 py-3 bg-slate-800 text-slate-300 rounded-2xl font-bold text-sm hover:text-white transition-all border border-slate-700 hover:border-slate-500"
              >
                Return to Internal Portal
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-12 pb-32">
          {!publicJobView ? (
            <div className="space-y-12">
              <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row gap-4 items-center backdrop-blur-xl">
                <div className="relative flex-1 w-full">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    placeholder="Search roles..."
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-medium text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select className="w-full md:w-72 px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-slate-600 focus:bg-white transition-all">
                  <option>All Departments</option>
                  {(systemConfig?.departments || []).map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {jobs
                  .filter(
                    (j) =>
                      j.status === "Active" &&
                      j.title.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((job) => (
                    <div
                      key={job.id}
                      className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-orange-500/20 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Briefcase size={120} className="text-orange-500" />
                      </div>
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-5 bg-slate-50 text-slate-400 rounded-3xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                          <Briefcase size={32} />
                        </div>
                        <span className="px-4 py-1.5 bg-orange-50 text-orange-700 text-[10px] font-black uppercase rounded-xl border border-orange-100 shadow-sm">
                          {job.type}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3 relative z-10">
                        {job.title}
                      </h3>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-3 mb-10 relative z-10">
                        <span className="flex items-center gap-1.5 text-slate-900">
                          <Building2 size={16} className="text-orange-500" />{" "}
                          {job.department}
                        </span>
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-orange-500" />{" "}
                          {job.location}
                        </span>
                      </p>
                      <button
                        onClick={() => setPublicJobView(job)}
                        className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 active:scale-95 relative z-10"
                      >
                        View Openings <ArrowRight size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-700 max-w-5xl mx-auto">
              <div className="p-12 md:p-16 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-6">
                  <button
                    onClick={() => setPublicJobView(null)}
                    className="text-xs font-black text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-2 uppercase tracking-[0.2em]"
                  >
                    <ArrowLeft size={18} /> Back to all roles
                  </button>
                  <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                    {publicJobView.title}
                  </h2>
                  <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-400 uppercase tracking-[0.1em]">
                    <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-slate-600">
                      <Building2 size={18} className="text-orange-500" />{" "}
                      {publicJobView.department}
                    </span>
                    <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-slate-600">
                      <MapPin size={18} className="text-orange-500" />{" "}
                      {publicJobView.location}
                    </span>
                    <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-slate-600">
                      <Clock size={18} className="text-orange-500" />{" "}
                      {publicJobView.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsApplying(true)}
                  className="w-full md:w-auto px-16 py-6 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-600 shadow-2xl shadow-orange-500/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Apply For This Role <ArrowRight size={18} />
                </button>
              </div>
              {isApplying && (
                <div className="p-12 md:p-16 bg-white border-t border-slate-50">
                  <h3 className="text-2xl font-bold text-slate-800 mb-8">
                    Submit Application
                  </h3>
                  <form
                    onSubmit={handlePublicApply}
                    className="space-y-6 max-w-3xl"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                          Full Name
                        </label>
                        <input
                          value={appForm.name}
                          onChange={(e) =>
                            setAppForm({ ...appForm, name: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={appForm.email}
                          onChange={(e) =>
                            setAppForm({ ...appForm, email: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={appForm.phone}
                          onChange={(e) =>
                            setAppForm({ ...appForm, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                          Resume (PDF)
                        </label>
                        <input
                          type="file"
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all"
                    >
                      Submit Application
                    </button>
                  </form>
                </div>
              )}
              <div className="p-12 md:p-16 space-y-16 bg-white">
                <section className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-4">
                    Mission Brief{" "}
                    <div className="h-px bg-slate-100 flex-1"></div>
                  </h4>
                  <div className="text-slate-600 text-xl font-medium leading-relaxed whitespace-pre-line">
                    {publicJobView.description ||
                      "Join our team to shape the future of organizational excellence."}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">
            Recruitment Intelligence
          </h1>
          <p className="text-[#64748b] text-base mt-1">
            Acquisition lifecycle and applicant tracking control.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("public")}
            className="px-5 py-2.5 bg-white border border-[#e2e8f0] text-[#64748b] rounded-xl font-bold flex items-center gap-2 hover:bg-[#f8fafc] transition-all shadow-sm"
          >
            <Globe size={18} /> Careers Site
          </button>
          <button
            onClick={() => {
              if (activeTab === "jobs") {
                setEditingJob(null);
                setJobForm({ status: "Active", jobtype: "Full-time" });
                setIsJobModalOpen(true);
              } else {
                setEditingCandidate(null);
                setCandidateForm({ status: "Applied" });
                setIsCandidateModalOpen(true);
              }
            }}
            className="px-6 py-2.5 bg-[#f97316] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={18} />{" "}
            {activeTab === "jobs" ? "Post New Role" : "Add Candidate"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] overflow-hidden mt-8">
        <div className="flex border-b border-[#f1f5f9] bg-[#fcfdfe] px-6 h-16 items-center gap-2">
          {["jobs", "candidates", "emails"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t as any);
                setSearchTerm("");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                activeTab === t
                  ? "bg-white shadow-sm text-[#f97316]"
                  : "text-[#64748b] hover:text-[#1e293b]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 border-b border-[#f1f5f9] flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              size={18}
            />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/10 text-sm font-medium text-[#1e293b] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === "candidates" && (
            <div className="flex gap-2">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748b] focus:ring-2 focus:ring-[#f97316]/10"
              >
                <option value="All">All Roles</option>
                {jobTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748b] focus:ring-2 focus:ring-[#f97316]/10"
              >
                <option value="All">All Status</option>
                {candidateStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === "jobs" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-4">POSITION</th>
                  <th className="p-4">DEPARTMENT</th>
                  {/* <th className="p-4">MANAGER</th> */}
                  <th className="p-4">TYPE</th>
                  {/* <th className="p-4">APPLICANTS</th> */}
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {job.title}
                      </p>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <MapPin size={12} className="mr-1" /> {job.location}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {job.department}
                    </td>
                    {/* <td className="p-4 text-sm text-slate-600 font-medium">{job.hiringManager || '-'}</td> */}
                    <td className="p-4 text-sm text-slate-600">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200">
                        {job.jobtype}
                      </span>
                    </td>
                    {/* <td className="p-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-slate-400"/>
                                                <span className="font-bold text-slate-700">{job.applicants}</span>
                                            </div>
                                        </td> */}
                    <td className="p-4">
                      <select
                        value={job.status}
                        onChange={(e) =>
                          onUpdateJob({ ...job, status: e.target.value as any })
                        }
                        className={`px-2 py-1 text-xs font-medium rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 cursor-pointer ${
                          job.status === "Active"
                            ? "text-orange-700 border-orange-200"
                            : "text-slate-500 border-slate-200"
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() =>
                            setViewItem({ type: "job", data: job })
                          }
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setJobForm(job);
                            setIsJobModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete job?"))
                              onDeleteJob(job.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "candidates" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-4">CANDIDATE</th>
                  <th className="p-4">CONTACT INFO</th>
                  <th className="p-4">APPLIED POSITION</th>
                  <th className="p-4">APP DATE</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 border border-slate-200">
                          {cand.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {cand.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Mail size={12} className="text-slate-400" />{" "}
                          {cand.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Phone size={12} className="text-slate-400" />{" "}
                          {cand.phone || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-700">
                        {cand.jobtitle}
                      </p>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-medium">
                      {cand.applieddate}
                    </td>
                    <td className="p-4">
                      <select
                        value={cand.status}
                        onChange={(e) =>
                          onUpdateCandidate({
                            ...cand,
                            status: e.target.value as any,
                          })
                        }
                        className={`px-3 py-1 text-xs font-bold rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 cursor-pointer ${
                          cand.status === "Hired"
                            ? "text-orange-700 border-orange-200"
                            : cand.status === "Offered"
                            ? "text-blue-700 border-blue-200"
                            : cand.status === "Interview"
                            ? "text-purple-700 border-purple-200"
                            : "text-slate-500 border-slate-200"
                        }`}
                      >
                        {candidateStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setOfferingToCandidate(cand);
                            setIsOfferModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Generate Offer Letter"
                        >
                          <FileSignature size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setViewItem({ type: "candidate", data: cand })
                          }
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCandidate(cand);
                            setCandidateForm(cand);
                            setIsCandidateModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete candidate record?"))
                              onDeleteCandidate(cand.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Offer Letter Modal */}
      {isOfferModalOpen && offeringToCandidate && (
        <OfferLetterModal
          candidate={offeringToCandidate}
          onClose={() => {
            setIsOfferModalOpen(false);
            setOfferingToCandidate(null);
          }}
          onSendOffer={handleSendOffer}
        />
      )}

      {isJobModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-in zoom-in duration-200 overflow-hidden">
            <button
              onClick={() => setIsJobModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full z-20 transition-all"
            >
              <X size={20} />
            </button>
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e293b]">
                {editingJob ? "Edit Job" : "Create New Job"}
              </h3>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleJobSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500">
                  Job Title
                </label>
                <input
                  value={jobForm.title || ""}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-orange-500 transition-colors"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500">
                    Department
                  </label>
                  <select
                    value={jobForm.department || ""}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, department: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                  >
                    <option value="">Select Dept</option>
                    {(systemConfig?.departments || []).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-500">Hiring Manager</label>
                                    <input value={jobForm.hiringManager || ''} onChange={e => setJobForm({...jobForm, hiringManager: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none" placeholder="e.g. John Doe" />
                                </div> */}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500">
                  Location
                </label>
                <input
                  value={jobForm.location || ""}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, location: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                  placeholder="New York, NY"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500">
                    Job Type
                  </label>
                  <select
                    value={jobForm.jobtype || ""}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, jobtype: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500">
                    Status
                  </label>
                  <select
                    value={jobForm.status || "Active"}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, status: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-[#f97316] text-white rounded-xl font-bold hover:bg-[#ea580c] transition-all shadow-xl shadow-orange-500/20 active:scale-95"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {isCandidateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-in zoom-in duration-200 overflow-hidden">
            <button
              onClick={() => setIsCandidateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full z-20 transition-all"
            >
              <X size={20} />
            </button>
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e293b]">
                {editingCandidate ? "Edit Candidate" : "Add Candidate"}
              </h3>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleCandidateSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500">
                  Full Name
                </label>
                <input
                  value={candidateForm.name || ""}
                  onChange={(e) =>
                    setCandidateForm({ ...candidateForm, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={candidateForm.email || ""}
                    onChange={(e) =>
                      setCandidateForm({
                        ...candidateForm,
                        email: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={candidateForm.phone || ""}
                    onChange={(e) =>
                      setCandidateForm({
                        ...candidateForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500">
                  Applied For
                </label>
                <select
                  value={candidateForm.jobtitle || ""}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      jobtitle: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                >
                  <option value="">Select Role</option>
                  {jobTitles.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500">
                  Status
                </label>
                <select
                  value={candidateForm.status || "Applied"}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                >
                  {candidateStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-[#f97316] text-white rounded-xl font-bold hover:bg-[#ea580c] transition-all shadow-xl shadow-orange-500/20 active:scale-95"
              >
                Save Candidate
              </button>
            </form>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-in zoom-in duration-200 overflow-hidden">
            <button
              onClick={() => setViewItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full z-20 transition-all"
            >
              <X size={20} />
            </button>
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-xl font-bold text-[#1e293b]">
                {viewItem.type === "job"
                  ? viewItem.data.title
                  : viewItem.data.name}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {viewItem.type === "job"
                  ? "Position Profile"
                  : "Candidate Dossier"}
              </p>
            </div>
            <div className="p-10 space-y-6">
              {viewItem.type === "job" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      DEPARTMENT
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.department}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      MANAGER
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.hiringManager || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      LOCATION
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      STATUS
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      EMAIL
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      PHONE
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      POSITION
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.jobtitle}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      APPLIED
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {viewItem.data.appliedDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      STATUS
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100`}
                      >
                        {viewItem.data.status}
                      </span>
                      {viewItem.data.offerDetails && (
                        <div
                          className="p-1.5 bg-purple-50 text-purple-600 rounded-lg flex items-center gap-1.5"
                          title="Offer Generated"
                        >
                          <FileSignature size={14} />
                          <span className="text-[9px] font-black uppercase">
                            Offered
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {viewItem.data.offerDetails && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center gap-2 text-[#94a3b8] mb-1">
                        <Sparkles size={14} className="text-purple-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest">
                          Active Offer Details
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Salary
                        </span>
                        <span className="font-bold text-slate-800">
                          ${viewItem.data.offerDetails.salary.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Join Date
                        </span>
                        <span className="font-bold text-slate-800">
                          {viewItem.data.offerDetails.joiningDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="pt-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">
                  {viewItem.type === "job" ? "MISSION BRIEF" : "ATTACHMENTS"}
                </span>
                {viewItem.type === "job" ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {viewItem.data.description ||
                        "No detailed mission brief provided."}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <FileSignature className="text-blue-500" size={24} />
                    <div>
                      <p className="text-xs font-bold text-blue-700">
                        Resume_v2.pdf
                      </p>
                      <p className="text-[9px] font-bold text-blue-400 uppercase">
                        3.2 MB • DOCUMENT
                      </p>
                    </div>
                    <button className="ml-auto p-2 bg-white text-blue-500 rounded-lg shadow-sm hover:bg-blue-500 hover:text-white transition-all">
                      <Download size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => setViewItem(null)}
                className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
