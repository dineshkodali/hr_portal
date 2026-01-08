import React, { useState, useEffect } from 'react';
import { Bot, Trash2, Download, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

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
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">AI Assistant Settings</h2>
                        <p className="text-sm text-slate-500">Configure your HR AI Assistant preferences</p>
                    </div>
                </div>
                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Chat History */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-slate-900">Chat History</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-700">Enable Chat History</p>
                                    <p className="text-sm text-slate-500">Save conversations for future reference</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enableChatHistory}
                                        onChange={(e) => setSettings({ ...settings, enableChatHistory: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-700">History Retention</p>
                                    <p className="text-sm text-slate-500">Keep chat history for {settings.maxHistoryDays} days</p>
                                </div>
                                <select
                                value={settings.maxHistoryDays}
                                onChange={(e) => setSettings({ ...settings, maxHistoryDays: parseInt(e.target.value) })}
                                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value={7}>7 days</option>
                                <option value={30}>30 days</option>
                                <option value={90}>90 days</option>
                                <option value={365}>1 year</option>
                            </select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">AI Model</p>
                                <p className="text-sm text-slate-500">Choose which AI model to use for chat responses</p>
                            </div>
                            <select
                                value={aiModel}
                                onChange={handleModelChange}
                                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="default">Default (Gemini/OpenAI, may require API key)</option>
                                <option value="free">Free Model (OpenRouter/HuggingFace, no key required)</option>
                                <option value="llama">Llama (Meta, open-source, no key required)</option>
                                <option value="chatgpt">ChatGPT (OpenAI, requires API key)</option>
                            </select>
                            <span className="ml-3 text-xs text-slate-500">Current: <span className="font-bold text-primary">{aiModel.charAt(0).toUpperCase() + aiModel.slice(1)}</span></span>
                        </div>
                        {/* OpenAI API Key input for ChatGPT, on its own line with edit/remove controls */}
                        {aiModel === 'chatgpt' && (
                            <div className="mt-4 flex flex-col gap-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">OpenAI API Key</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="flex-1 border p-2 rounded-lg"
                                        placeholder="sk-..."
                                        value={openaiApiKey}
                                        onChange={e => setOpenaiApiKey(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-300"
                                        onClick={() => {
                                            setOpenaiApiKey('');
                                            if (typeof window !== 'undefined') {
                                                localStorage.removeItem('openaiApiKey');
                                            }
                                        }}
                                    >Remove</button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Your key is stored locally and sent only when using ChatGPT. You can edit, paste, or remove it anytime.</p>
                            </div>
                        )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">Auto-Suggestions</p>
                                <p className="text-sm text-slate-500">Show suggested questions when chat opens</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoSuggest}
                                    onChange={(e) => setSettings({ ...settings, autoSuggest: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">Usage Analytics</p>
                                <p className="text-sm text-slate-500">Help improve AI responses with usage data</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableAnalytics}
                                    onChange={(e) => setSettings({ ...settings, enableAnalytics: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex gap-3">
                        <Bot className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">About the AI Assistant</p>
                            <p className="text-blue-700">
                                The HR AI Assistant uses your company's documentation and HR database to answer questions about policies, leave balances, and more. All conversations are private and secure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>);
}
