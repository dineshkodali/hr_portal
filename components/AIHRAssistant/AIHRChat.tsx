
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Sparkles, Trash2, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    time: Date;
    source?: string;
}

interface AIHRChatProps {
    currentUser: any;
    aiModel?: string;
}

// Accept aiModel as prop
export default function AIHRChat({ currentUser, aiModel = 'default' }: AIHRChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            time: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Use the generic api.create to call the backend chat endpoint
            let apiKey = undefined;
            if (aiModel === 'chatgpt' && typeof window !== 'undefined') {
                apiKey = localStorage.getItem('openaiApiKey') || undefined;
            }
            const response = await api.create('chat', {
                userId: currentUser.id,
                message: userMessage.text,
                model: aiModel,
                apiKey
            });

            // If backend returns extra data, render it in a rich way
            let extraContent = null;
            if (response.extraData) {
                // Example: leave balance, holidays, etc.
                if (response.extraData.leaveBalance) {
                    extraContent = (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-xs">
                            <strong>Leave Balance:</strong><br />
                            Remaining: {response.extraData.leaveBalance.balance} days<br />
                            Used: {response.extraData.leaveBalance.used} days<br />
                            Annual Entitlement: {response.extraData.leaveBalance.total} days
                        </div>
                    );
                }
                if (response.extraData.holidays) {
                    extraContent = (
                        <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200 text-orange-900 text-xs">
                            <strong>Upcoming Holidays:</strong>
                            <ul>
                                {response.extraData.holidays.map((h, i) => (
                                    <li key={i}>{h.name} ({h.date}) {h.type ? `- ${h.type}` : ''}</li>
                                ))}
                            </ul>
                        </div>
                    );
                }
                // Add more types as needed
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                sender: 'ai',
                time: new Date(),
                source: response.source
            };

            setMessages(prev => [...prev, aiMessage]);

            // If extraContent exists, add a special message for it
            if (extraContent) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 2).toString(),
                    text: '',
                    sender: 'ai',
                    time: new Date(),
                    source: 'DB Data',
                    extraContent
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting to the HR Assistant right now. Please try again later.",
                sender: 'ai',
                time: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        if (confirm('Are you sure you want to clear this conversation?')) {
            setMessages([]);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setInputText('');
    };

    // Download chat transcript as text file
    const handleDownloadChat = () => {
        if (messages.length === 0) return;
        const lines = messages.map(msg => {
            const sender = msg.sender === 'user' ? (currentUser?.name || 'You') : 'HR Assistant';
            const time = msg.time instanceof Date ? msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return `${sender} [${time}]:\n${msg.text}\n`;
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hr-chat-transcript.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    if (!currentUser) return null;

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-primary hover:scale-110 shadow-teal-500/30'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <div className="relative">
                        <MessageCircle className="w-6 h-6 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
                        </span>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-slate-900 p-4 shrink-0 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                    <Bot className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                        HR Assistant <Sparkles className="w-4 h-4 text-primary" />
                                    </h3>
                                    <p className="text-slate-400 text-xs">Always here to help</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleNewChat}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title="New Chat"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleClearChat}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                                    title="Clear Chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.length === 0 && (
                            <div className="text-center py-8 opacity-60">
                                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h4 className="font-medium text-slate-900 mb-2">How can I help you?</h4>
                                <p className="text-sm text-slate-500 px-4">
                                    Ask me about leave balances, policies, or general HR questions.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {['My Leave Balance', 'Holiday Calendar', 'Work from home policy'].map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => { setInputText(suggestion); }}
                                            className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:border-primary transition-colors text-slate-600"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end max-w-[85%] gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primary/10' : 'bg-primary'
                                        }`}>
                                        {msg.sender === 'user' ? (
                                            <UserIcon className="w-4 h-4 text-primary" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-white" />
                                        )}
                                    </div>

                                    <div className={`p-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-white text-slate-800 border border-gray-100 rounded-bl-none'
                                        }`}>
                                        {msg.source && (
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> {msg.source}
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {/* Simple markdown parser for bold */}
                                            {msg.text.split(/(\*\*.*?\*\*)/).map((part, i) =>
                                                part.startsWith('**') && part.endsWith('**') ?
                                                    <strong key={i}>{part.slice(2, -2)}</strong> :
                                                    part
                                            )}
                                        </div>
                                        {/* Render extra DB content if present */}
                                        {msg.extraContent}
                                        <span className={`text-[10px] mt-1 block ${msg.sender === 'user' ? 'text-teal-100' : 'text-slate-400'
                                            }`}>
                                            {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-end max-w-[85%] gap-2 flex-row">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area + Download Button */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask anything..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-slate-800"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="p-2 bg-primary text-white rounded-xl hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadChat}
                            disabled={messages.length === 0}
                            className="ml-2 p-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Download chat transcript"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
