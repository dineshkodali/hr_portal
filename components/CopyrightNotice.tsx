import React, { useState } from 'react';
import { X, Shield, Lock, FileText, Info } from 'lucide-react';
import { FooterSettings } from '../types';

interface CopyrightNoticeProps {
    footerSettings?: FooterSettings;
}

const CopyrightNotice: React.FC<CopyrightNoticeProps> = ({ footerSettings }) => {
    const currentYear = new Date().getFullYear();
    const [popupContent, setPopupContent] = useState<{ title: string, content: string } | null>(null);

    const companyName = footerSettings?.companyName || "SD Commercial";
    const shortName = companyName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const handleOpenPopup = (e: React.MouseEvent, title: string, content: string) => {
        e.preventDefault();
        setPopupContent({ title, content });
    };

    return (
        <div className="py-3 px-4 border-t border-slate-100 mt-6 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-[10px]">
                        {shortName}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                        © {currentYear} <span className="text-slate-600 font-bold tracking-tight">{companyName}</span>. All rights reserved.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <a
                        href="#"
                        onClick={(e) => handleOpenPopup(e, "Privacy Policy", footerSettings?.privacyContent || "Privacy content not configured.")}
                        className="text-[10px] font-bold text-slate-300 hover:text-orange-400 transition-colors uppercase tracking-wider"
                    >
                        Privacy
                    </a>
                    <a
                        href="#"
                        onClick={(e) => handleOpenPopup(e, "Terms of Service", footerSettings?.termsContent || "Terms content not configured.")}
                        className="text-[10px] font-bold text-slate-300 hover:text-orange-400 transition-colors uppercase tracking-wider"
                    >
                        Terms
                    </a>
                    <a
                        href="#"
                        onClick={(e) => handleOpenPopup(e, "Security Protocol", footerSettings?.securityContent || "Security content not configured.")}
                        className="text-[10px] font-bold text-slate-300 hover:text-orange-400 transition-colors uppercase tracking-wider"
                    >
                        Security
                    </a>
                </div>
            </div>

            <div className="mt-2 text-center">
                <p className="text-[9px] text-slate-200 font-medium uppercase tracking-[0.25em]">
                    Proprietary Infrastructure
                </p>
            </div>

            {/* Simple Modal Popup */}
            {popupContent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    {popupContent.title.includes("Privacy") ? <Lock size={16} /> :
                                        popupContent.title.includes("Terms") ? <FileText size={16} /> : <Shield size={16} />}
                                </div>
                                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{popupContent.title}</h3>
                            </div>
                            <button
                                onClick={() => setPopupContent(null)}
                                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="flex items-start gap-4 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <Info size={18} className="text-blue-500 mt-0.5" />
                                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                    This document outlines the official protocols and legal frameworks governing the use of the {companyName} digital infrastructure.
                                </p>
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                                    {popupContent.content}
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setPopupContent(null)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CopyrightNotice;
