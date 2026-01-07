import React, { useState } from 'react';

const EmailSettings: React.FC = () => {
  const [connected, setConnected] = useState(false);
  // Placeholder for OAuth/account connection
  const handleConnect = () => setConnected(true);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Outlook Integration</h2>
      <div className="mb-4">
        <span>Status: </span>
        {connected ? (
          <span className="text-green-600 font-bold">Connected</span>
        ) : (
          <span className="text-red-600 font-bold">Not Connected</span>
        )}
      </div>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded font-bold mb-4"
        onClick={handleConnect}
        disabled={connected}
      >
        {connected ? 'Connected' : 'Connect to Outlook (Mock)'}
      </button>
      <div className="mt-6">
        <h3 className="font-bold mb-2">Workflow Preferences</h3>
        <ul className="list-disc pl-6 text-slate-600">
          <li>Sort incoming emails by sender, subject, or date</li>
          <li>Auto-label outgoing emails</li>
          <li>Filter by direction (incoming/outgoing)</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailSettings;
