import React, { useState } from 'react';
import EmailInbox from './EmailInbox';
import EmailCompose from './EmailCompose';
import EmailSettings from './EmailSettings';

const EmailWorkflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'settings'>('inbox');

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'inbox' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setActiveTab('inbox')}>Inbox</button>
        <button className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'compose' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setActiveTab('compose')}>Compose</button>
        <button className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'settings' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>
      {activeTab === 'inbox' && <EmailInbox />}
      {activeTab === 'compose' && <EmailCompose />}
      {activeTab === 'settings' && <EmailSettings />}
    </div>
  );
};

export default EmailWorkflow;
