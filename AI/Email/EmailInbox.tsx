import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Mail, Send, Inbox, Clock, User, FileText, Trash2, Paperclip, MoreVertical, Star, Reply, Archive } from 'lucide-react';
import { Email, EmailFolder } from '../../types';

interface EmailInboxProps {
  folder: EmailFolder;
  searchQuery: string;
}

const EmailInbox: React.FC<EmailInboxProps> = ({ folder, searchQuery }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    setLoading(true);
    // Fetch emails for the specific folder
    api.get(`emails?folder=${folder}`)
      .then(data => {
        const filteredData = Array.isArray(data) ? data : [];
        setEmails(filteredData.filter((e: Email) =>
          e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.sender.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch emails:', err);
        setLoading(false);
      });
  }, [folder, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-100 rounded-full"></div>
          <div className="absolute top-0 w-12 h-12 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">Loading your {folder}...</p>
      </div>
    );
  }

  if (selectedEmail) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => setSelectedEmail(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
          >
            <Inbox size={18} /> Back to {folder}
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"><Star size={18} /></button>
            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"><Reply size={18} /></button>
            <button className="p-2 hover:bg-rose-100 hover:text-rose-600 rounded-lg text-slate-500 transition-colors"><Trash2 size={18} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">
                {selectedEmail.sender[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedEmail.subject || '(No Subject)'}</h3>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{selectedEmail.sender}</span>
                  <span>&bull;</span>
                  <span>{new Date(selectedEmail.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {selectedEmail.has_attachments && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                <Paperclip size={12} />
                2 Attachments
              </div>
            )}
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {selectedEmail.body}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
          {folder === 'inbox' && <Inbox className="text-blue-500" size={20} />}
          {folder === 'sent' && <Send className="text-green-500" size={20} />}
          {folder === 'drafts' && <FileText className="text-amber-500" size={20} />}
          {folder === 'trash' && <Trash2 className="text-rose-500" size={20} />}
          {folder}
        </h2>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-widest italic">
          Viewing All Messages
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Archive className="w-10 h-10 opacity-20" />
            </div>
            <p className="font-bold text-slate-500 italic">This folder is empty</p>
            <p className="text-xs mt-1">When you receive or send messages, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-full">
            {emails.map(email => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-all border-l-4 border-transparent hover:border-orange-500"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-bold ${email.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>
                      {folder === 'inbound' ? email.sender : email.recipient}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                      {new Date(email.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate pr-4 ${email.status === 'unread' ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                      <span className="text-slate-900">{email.subject}</span>
                      <span className="mx-2 text-slate-300">&ndash;</span>
                      <span className="opacity-70">{email.body}</span>
                    </p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {email.has_attachments && <Paperclip size={14} className="text-slate-400" />}
                      <Star size={14} className="text-slate-300 hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* PAGINATION */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="text-xs font-medium text-slate-500">
                Showing <span className="text-slate-900 font-bold">1-10</span> of <span className="text-slate-900 font-bold">{emails.length}</span> messages
              </div>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all text-[10px] font-bold uppercase tracking-wider disabled:opacity-50">Prev</button>
                <div className="flex items-center gap-1 mx-2">
                  {[1, 2, 3].map(page => (
                    <button
                      key={page}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${page === 1 ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all text-[10px] font-bold uppercase tracking-wider">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInbox;
