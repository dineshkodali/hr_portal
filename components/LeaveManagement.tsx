import React from 'react';
import { api } from '../services/api';
import { Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    api.get('leaves').then(res => { if (mounted) setLeaves(res); }).catch(() => { if (mounted) setLeaves([]); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6 space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500 mt-1">Track balances and manage leave requests.</p>
        </div>
        <button className="bg-accent-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-accent-600 shadow-sm transition-colors">
            <Plus size={18} />
            <span>Apply for Leave</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={64} className="text-blue-500" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Casual Leave</p>
            <div className="mt-4 flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-gray-800">8</h2>
                <span className="text-gray-400 text-sm">/ 12 days</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '66%' }}></div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={64} className="text-green-500" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Sick Leave</p>
             <div className="mt-4 flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-gray-800">5</h2>
                <span className="text-gray-400 text-sm">/ 7 days</span>
            </div>
             <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '71%' }}></div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={64} className="text-purple-500" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Earned Leave</p>
             <div className="mt-4 flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-gray-800">14</h2>
                <span className="text-gray-400 text-sm">/ 15 days</span>
            </div>
             <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '93%' }}></div>
            </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-medium text-gray-700">{leave.type}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {leave.startDate} <span className="text-gray-400 mx-1">to</span> {leave.endDate}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{leave.days}</td>
                  <td className="p-4 text-sm text-gray-600">{leave.reason}</td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full w-fit text-xs font-medium ${
                        leave.status === 'Approved' ? 'bg-orange-100 text-orange-700' :
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        {leave.status === 'Approved' && <CheckCircle size={12} />}
                        {leave.status === 'Rejected' && <XCircle size={12} />}
                        {leave.status === 'Pending' && <Clock size={12} />}
                        <span>{leave.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
