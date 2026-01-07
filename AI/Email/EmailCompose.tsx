import React, { useState } from 'react';

const EmailCompose: React.FC = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Compose Email</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1">To</label>
          <input className="w-full border p-2 rounded" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Subject</label>
          <input className="w-full border p-2 rounded" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Body</label>
          <textarea className="w-full border p-2 rounded h-32" value={body} onChange={e => setBody(e.target.value)} />
        </div>
        <button type="button" className="bg-orange-500 text-white px-6 py-2 rounded font-bold">Send (Mock)</button>
      </form>
    </div>
  );
};

export default EmailCompose;
