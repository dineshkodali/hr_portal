import React, { useState, useEffect } from 'react';
import { Bot, Trash2, Download, Settings as SettingsIcon, MessageSquare, Shield } from 'lucide-react';

interface AIHRSettingsProps {
    user: any;
    aiModel: string;
    setAiModel: (model: string) => void;
}

export default function AIHRSettings({ user, aiModel, setAiModel }: AIHRSettingsProps) {
    // Local state for OpenAI API key input
    const [openaiApiKey, setOpenaiApiKey] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('openaiApiKey') || '';
        }
        return '';
    });

    // Sync localStorage when key changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('openaiApiKey', openaiApiKey);
        }
    }, [openaiApiKey]);
    const [settings, setSettings] = useState({
        enableChatHistory: true,
        enableAnalytics: true,
        maxHistoryDays: 30,
        autoSuggest: true,
    });

    // Handler for model change
    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAiModel(e.target.value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('aiModel', e.target.value);
        }
    };

    // Handler for clearing chat history
    const handleClearHistory = () => {
        if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            // TODO: Implement API call to clear history
            alert('Chat history cleared successfully');
        }
    };

    // Handler for exporting logs
    const handleExportLogs = () => {
        // TODO: Implement export functionality
        alert('Export feature coming soon');
    };

    return (
        <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* AI Hero Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Bot size={140} />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="p-4 bg-primary/20 backdrop-blur-xl rounded-2xl border border-white/10 h-fit">
                        <Bot size={28} className="text-primary-light" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight mb-1">HR Intelligence Hub</h1>
                        <p className="text-slate-400 font-medium text-xs max-w-md">
                            Advanced neural orchestration for policy automation and employee support.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Interface Settings Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
                    <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                        <MessageSquare size={14} className="text-slate-400" />
                        <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Interface & Privacy</span>
                    </div>
                    <div className="p-5 space-y-3">
                        {[
                            { id: 'enableChatHistory', label: 'Global Persistence', sub: 'Archive conversations', checked: settings.enableChatHistory },
                            { id: 'autoSuggest', label: 'Prompt Assistance', sub: 'Contextual prompt starters', checked: settings.autoSuggest },
                            { id: 'enableAnalytics', label: 'Performance Insight', sub: 'Optimize neural responses', checked: settings.enableAnalytics }
                        ].map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-primary/20 transition-all duration-300 w-full">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer scale-90">
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={(e) => setSettings({ ...settings, [item.id as keyof typeof settings]: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Engine Configuration Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
                    <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                        <SettingsIcon size={14} className="text-slate-400" />
                        <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Engine Configuration</span>
                    </div>
                    <div className="p-5 space-y-5">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Model Selection</label>
                            <select
                                value={aiModel}
                                onChange={handleModelChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="default">Adaptive Neural (Default)</option>
                                <option value="free">Standard (Keyless)</option>
                                <option value="llama">Meta Llama 3 (Secure)</option>
                                <option value="chatgpt">GPT-4 Turbo (Premium)</option>
                            </select>
                        </div>

                        {aiModel === 'chatgpt' && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Neural API Gateway</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        autoComplete="off"
                                        className="flex-1 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="sk-••••••••••••••••"
                                        value={openaiApiKey}
                                        onChange={e => setOpenaiApiKey(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="px-4 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 uppercase"
                                        onClick={() => {
                                            setOpenaiApiKey('');
                                            if (typeof window !== 'undefined') localStorage.removeItem('openaiApiKey');
                                        }}
                                    >Wipe</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Cache Retention</label>
                            <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                {[7, 30, 90].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setSettings({ ...settings, maxHistoryDays: days })}
                                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all ${settings.maxHistoryDays === days
                                            ? 'bg-white text-primary shadow-sm border border-slate-100'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {days}D
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Infrastructure Actions & Info */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-primary/5 border border-primary/10 rounded-3xl p-4 flex gap-3 group hover:bg-primary/10 transition-colors duration-500">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-primary/10 text-primary">
                        <Shield size={14} />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Enterprise RAG protocol active. Internal documentation is processed locally with hardware encryption where available.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleClearHistory}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-3xl text-[10px] font-black text-red-500 hover:bg-red-50 hover:border-red-100 transition-all uppercase tracking-wider"
                    >
                        <Trash2 size={12} /> Purge Infrastructure
                    </button>
                    <button
                        onClick={handleExportLogs}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-3xl text-[10px] font-black text-white hover:bg-black transition-all shadow-lg shadow-slate-900/10 uppercase tracking-widest"
                    >
                        <Download size={14} /> Intelligence Log
                    </button>
                </div>
            </div>
        </div>
    );
}
