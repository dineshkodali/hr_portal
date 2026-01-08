import React from 'react';

// Placeholder/mock data for emails
const mockEmails = [
  { id: 1, from: 'alice@outlook.com', subject: 'Welcome!', date: '2026-01-07', direction: 'in' },
  { id: 2, from: 'bob@company.com', subject: 'Project Update', date: '2026-01-06', direction: 'in' },
  { id: 3, from: 'me@company.com', subject: 'Re: Meeting', date: '2026-01-05', direction: 'out' },
];

const EmailInbox: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Inbox & Sent</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left">From</th>
            <th className="text-left">Subject</th>
            <th className="text-left">Date</th>
            <th className="text-left">Direction</th>
          </tr>
        </thead>
        <tbody>
          {mockEmails.map(email => (
            <tr key={email.id} className="border-b last:border-b-0">
              <td>{email.from}</td>
              <td>{email.subject}</td>
              <td>{email.date}</td>
              <td>{email.direction === 'in' ? 'Incoming' : 'Outgoing'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailInbox;
