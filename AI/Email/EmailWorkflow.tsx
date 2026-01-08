import React, { useState } from 'react';
import { Mail, Send, FileText, Trash2, Settings, Plus, Inbox, Search, Filter, Shield, User, Users, Box, Bell, Database, Copyright, ChevronRight } from 'lucide-react';
import EmailInbox from './EmailInbox';
import EmailCompose from './EmailCompose';
import EmailSettings from './EmailSettings';
import { EmailFolder } from '../../types';

const EmailWorkflow: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState<EmailFolder | 'compose' | 'settings' | 'ai-assistant'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  const menuGroups = [
    {
      title: 'ACCOUNT',
      items: [
        { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'sent', label: 'Sent', icon: Send, color: 'text-slate-600', bg: 'bg-slate-50' },
        { id: 'drafts', label: 'Drafts', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
        { id: 'trash', label: 'Trash', icon: Trash2, color: 'text-slate-600', bg: 'bg-slate-50' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Mail Settings', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50' },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Box, color: 'text-slate-600', bg: 'bg-slate-50' },
      ]
    }
  ];

  const SidebarItem = ({ id, label, icon: Icon, color, bg }: any) => (
    <button
      onClick={() => setActiveFolder(id as any)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${activeFolder === id
        ? 'bg-orange-50 text-orange-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      <Icon size={18} className={`${activeFolder === id ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span className={`text-sm font-medium ${activeFolder === id ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50/30 rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-100 flex flex-col pt-8 overflow-y-auto shrink-0">
        {/* COMPOSE AT TOP */}
        <div className="px-6 mb-8">
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 transition-all active:scale-95 group"
            onClick={() => setActiveFolder('compose')}
          >
            <Plus size={20} strokeWidth={3} className="text-white group-hover:rotate-90 transition-transform" />
            <span className="text-sm">Compose</span>
          </button>
        </div>

        {menuGroups.map((group, idx) => (
          <div key={idx} className="px-4 mb-8">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map(item => (
                <SidebarItem key={item.id} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-slate-800">
            {activeFolder === 'compose' ? 'Compose' :
              activeFolder === 'settings' ? 'Mail Settings' :
                activeFolder === 'ai-assistant' ? 'AI Mail Assistant' :
                  activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all border border-slate-100">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="h-full">
            {activeFolder === 'compose' ? (
              <EmailCompose />
            ) : activeFolder === 'settings' ? (
              <EmailSettings />
            ) : (
              <EmailInbox folder={activeFolder as EmailFolder} searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailWorkflow;
