import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import { Send, Sparkles, Loader2, User, Mail, AlignLeft, CheckCircle2, Paperclip, X, FileText, Save } from 'lucide-react';

const EmailCompose: React.FC<{ onLogActivity?: (action: string, module: string, details: string) => void }> = ({ onLogActivity }) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!to && !isDraft) {
      alert('Please specify a recipient');
      return;
    }

    setIsSending(true);
    try {
      const emailId = `email_${Date.now()}`;
      await api.create('emails', {
        id: emailId,
        sender: 'me@company.com',
        recipient: to,
        cc: cc || null,
        bcc: bcc || null,
        subject: subject || (isDraft ? '(No Subject)' : ''),
        body,
        type: 'outbound',
        folder: isDraft ? 'drafts' : 'sent',
        status: isDraft ? 'sent' : 'sent',
        has_attachments: attachments.length > 0,
        created_at: new Date()
      });

      // Handle attachments if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          // In a real app, we would upload to storage and get a path
          await api.create('email_attachments', {
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            email_id: emailId,
            filename: file.name,
            file_path: '/uploads/emails/' + file.name, // Mock path
            file_size: file.size,
            mime_type: file.type
          });
        }
      }

      onLogActivity?.(isDraft ? 'Save Draft' : 'Send Email', 'Email', `${isDraft ? 'Saved draft' : 'Sent email'} to ${to} with subject: ${subject}`);

      setStatus('success');
      if (!isDraft) {
        setTo('');
        setSubject('');
        setBody('');
        setAttachments([]);
      }
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to process email:', err);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleAiAssist = async () => {
    if (!subject && !body) {
      alert('Please provide at least a subject or some initial text for the AI to work with.');
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await api.suggestEmail({
        subject,
        body,
        type: 'draft'
      });
      if (response.suggestion) {
        setBody(response.suggestion);
        onLogActivity?.('AI Assist', 'Email', `Used AI Smart Compose for subject: ${subject}`);
      }
    } catch (err) {
      console.error('AI error:', err);
      alert('Failed to get AI suggestion');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Send className="w-5 h-5 text-orange-500" />
          Compose Message
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiAssist}
            disabled={isAiLoading || (!subject && !body)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-100 disabled:opacity-50 transition-all border border-purple-100"
          >
            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Smart Compose
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <User size={14} /> To
              </label>
              <input
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="recipient@example.com"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="px-3 py-3 text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest border border-slate-100 rounded-xl"
            >
              {showCcBcc ? 'Hide CC/BCC' : 'Cc/Bcc'}
            </button>
          </div>

          {showCcBcc && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Cc
                </label>
                <input
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="cc@example.com"
                  value={cc}
                  onChange={e => setCc(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Bcc
                </label>
                <input
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="bcc@example.com"
                  value={bcc}
                  onChange={e => setBcc(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Mail size={14} /> Subject
            </label>
            <input
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="What's this about?"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <AlignLeft size={14} /> Message Content
          </label>
          <textarea
            className="w-full border border-slate-200 p-6 rounded-2xl h-80 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all resize-none shadow-inner bg-slate-50/20"
            placeholder="Start typing your professional message..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 group">
                <FileText size={14} className="text-slate-400" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <span className="text-slate-300">({(file.size / 1024).toFixed(0)}KB)</span>
                <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
          >
            <Paperclip size={18} />
            Attach Files
          </button>
          {status === 'success' && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold animate-bounce">
              <CheckCircle2 size={16} /> Saved Successfully
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleSend(e, true)}
            disabled={isSending}
            className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-white hover:border-slate-300 transition-all active:scale-95 shadow-sm"
          >
            <Save size={18} />
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSend(e, false)}
            disabled={isSending || !to || !subject || !body}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-orange-700 disabled:from-slate-300 disabled:to-slate-400 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailCompose;
