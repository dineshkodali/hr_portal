import React, { useState } from 'react';
import { ShieldCheck, Lock, Scale, Mail, Info, Edit3, Save, ExternalLink, Copyright, Globe, FileText, Shield } from 'lucide-react';
import { SystemConfig } from '../types';

interface CopyrightPageProps {
  systemConfig: SystemConfig;
  setSystemConfig: (config: SystemConfig) => void;
  isAdmin?: boolean;
}

const CopyrightPage: React.FC<CopyrightPageProps> = ({ systemConfig, setSystemConfig, isAdmin = true }) => {
  const [editing, setEditing] = useState<'notice' | 'pillars' | 'footer' | null>(null);

  // Local state for editing the 3 pillars
  const [tempPillars, setTempPillars] = useState(systemConfig.copyrightSections || []);
  const [tempFooter, setTempFooter] = useState(systemConfig.footerSettings || {
    companyName: '',
    copyrightNotice: '',
    privacyContent: '',
    termsContent: '',
    securityContent: ''
  });

  const saveNotice = (text: string) => {
    setSystemConfig({
      ...systemConfig,
      footerSettings: {
        ...(systemConfig.footerSettings || { companyName: '', copyrightNotice: '', privacyContent: '', termsContent: '', securityContent: '' }),
        copyrightNotice: text
      }
    });
    setEditing(null);
  };

  const savePillars = () => {
    setSystemConfig({
      ...systemConfig,
      copyrightSections: tempPillars
    });
    setEditing(null);
  };

  const saveFooter = () => {
    setSystemConfig({
      ...systemConfig,
      footerSettings: tempFooter
    });
    setEditing(null);
  };

  const pillars = systemConfig.copyrightSections || [];
  const icons = [ShieldCheck, Lock, Scale];
  const colors = ["text-orange-500", "text-blue-500", "text-purple-500"];
  const bgs = ["bg-orange-50", "bg-blue-50", "bg-purple-50"];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Copyright size={140} />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-fit">
            <ShieldCheck size={28} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Ownership & Copyright</h1>
            <p className="text-slate-400 font-medium text-xs max-w-md">
              Proprietary digital infrastructure and intellectual property protection systems.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Pillar Sections */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
            <ShieldCheck size={14} /> Core Pillars
          </h2>
          {isAdmin && editing !== 'pillars' && (
            <button
              onClick={() => {
                setTempPillars(pillars);
                setEditing('pillars');
              }}
              className="text-[10px] font-black uppercase text-orange-500 hover:text-orange-600 transition-colors"
            >
              Edit Sections
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((s, i) => {
            const Icon = icons[i] || ShieldCheck;
            return (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                {editing === 'pillars' ? (
                  <div className="space-y-3">
                    <input
                      value={tempPillars[i].title}
                      onChange={(e) => {
                        const newPillars = [...tempPillars];
                        newPillars[i] = { ...newPillars[i], title: e.target.value };
                        setTempPillars(newPillars);
                      }}
                      className="w-full text-xs font-bold p-2 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                    <textarea
                      value={tempPillars[i].content}
                      onChange={(e) => {
                        const newPillars = [...tempPillars];
                        newPillars[i] = { ...newPillars[i], content: e.target.value };
                        setTempPillars(newPillars);
                      }}
                      className="w-full text-[10px] p-2 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-orange-500 outline-none h-20"
                    />
                  </div>
                ) : (
                  <>
                    <div className={`w-10 h-10 ${bgs[i % 3]} ${colors[i % 3]} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">{s.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {s.content}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {editing === 'pillars' && (
          <div className="flex justify-end gap-2 px-2">
            <button onClick={() => setEditing(null)} className="px-4 py-1.5 text-[10px] font-black uppercase text-slate-400">Cancel</button>
            <button onClick={savePillars} className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-orange-500/20">Save Pillars</button>
          </div>
        )}
      </div>

      {/* Main Notice Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-400" />
            <span className="font-black uppercase tracking-widest text-slate-400">Declaration Notice</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                if (editing === 'notice') saveNotice(tempFooter.copyrightNotice);
                else {
                  setTempFooter(systemConfig.footerSettings || tempFooter);
                  setEditing('notice');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all
                    ${editing === 'notice' ? 'bg-green-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-500 hover:text-orange-500'}
                  `}
            >
              {editing === 'notice' ? <><Save size={12} /> Save</> : <><Edit3 size={12} /> Edit</>}
            </button>
          )}
        </div>
        <div className="p-6">
          {editing === 'notice' ? (
            <textarea
              value={tempFooter.copyrightNotice}
              onChange={(e) => setTempFooter({ ...tempFooter, copyrightNotice: e.target.value })}
              className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
            />
          ) : (
            <div className="prose prose-slate max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed italic">
                "{systemConfig.footerSettings?.copyrightNotice || 'Notice not configured.'}"
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer Configuration Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-slate-400" />
            <span className="font-black uppercase tracking-widest text-slate-400">Footer & Legal Management</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                if (editing === 'footer') saveFooter();
                else {
                  setTempFooter(systemConfig.footerSettings || tempFooter);
                  setEditing('footer');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all
                    ${editing === 'footer' ? 'bg-green-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-500 hover:text-orange-500'}
                  `}
            >
              {editing === 'footer' ? <><Save size={12} /> Save</> : <><Edit3 size={12} /> Configure</>}
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
                  {editing === 'footer' ? (
                    <input
                      value={tempFooter.companyName}
                      onChange={(e) => setTempFooter({ ...tempFooter, companyName: e.target.value })}
                      className="w-full bg-transparent text-center focus:outline-none"
                      placeholder="SD"
                    />
                  ) : (
                    systemConfig.footerSettings?.companyName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "SD"
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Identity</p>
                  {editing === 'footer' ? (
                    <input
                      value={tempFooter.companyName}
                      onChange={(e) => setTempFooter({ ...tempFooter, companyName: e.target.value })}
                      className="w-full text-sm font-bold bg-slate-50 p-1.5 rounded-lg border focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm font-black text-slate-800 tracking-tight">{systemConfig.footerSettings?.companyName || 'Not Set'}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Artifacts</h4>
                {[
                  { label: 'Privacy Policy', icon: Lock, key: 'privacyContent' },
                  { label: 'Terms of Service', icon: FileText, key: 'termsContent' },
                  { label: 'Security Protocol', icon: Shield, key: 'securityContent' }
                ].map(legal => (
                  <div key={legal.key} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <legal.icon size={12} /> {legal.label}
                    </div>
                    {editing === 'footer' ? (
                      <textarea
                        value={(tempFooter as any)[legal.key]}
                        onChange={(e) => setTempFooter({ ...tempFooter, [legal.key]: e.target.value })}
                        className="w-full text-[11px] p-3 bg-slate-50 border rounded-xl focus:ring-1 focus:ring-orange-500 outline-none h-24"
                      />
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 italic line-clamp-2">
                        {(systemConfig.footerSettings as any)?.[legal.key] || 'Not configured.'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Globe size={40} className="text-orange-500 opacity-20" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Public Presence</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Configure how your organization appears in the portal's infrastructure footer.</p>
              </div>
              <div className="w-full space-y-2 pt-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                  <span>Status</span>
                  <span className="text-emerald-500 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Synchronized
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyrightPage;
