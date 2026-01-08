import React from 'react';
import { api } from '../services/api';
import { Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { User } from '../types';

interface LeaveManagementProps {
  user: User;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ user }) => {
  const [leaves, setLeaves] = React.useState<any[]>([]);
    const [showForm, setShowForm] = React.useState(false);
    const [form, setForm] = React.useState({
      type: '',
      startDate: '',
      endDate: '',
      days: '',
      reason: ''
    });
    const [formError, setFormError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    api.get('leaves').then(res => { if (mounted) setLeaves(res); }).catch(() => { if (mounted) setLeaves([]); });
    return () => { mounted = false; };
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Basic validation
    if (!form.type || !form.startDate || !form.endDate || !form.days || !form.reason) {
      setFormError('Please fill all fields.');
      return;
    }
    try {
      // Use linkedEmployeeId if available, else fallback to user.id
      const employeeId = user.linkedEmployeeId || user.id;
      await api.create('leaves', {
        employeeId,
        employeeName: user.name,
        leaveType: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        duration: Number(form.days),
        reason: form.reason,
        status: 'Pending'
      });
      setShowForm(false);
      setForm({ type: '', startDate: '', endDate: '', days: '', reason: '' });
      api.get('leaves').then(setLeaves);
    } catch {
      setFormError('Failed to apply for leave.');
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500 mt-1">Track balances and manage leave requests.</p>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-600 shadow transition-colors"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl border border-gray-200" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Apply for Leave</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowForm(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-100 bg-gray-50"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Earned">Earned Leave</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-100 bg-gray-50"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-100 bg-gray-50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Days</label>
                <input
                  type="number"
                  name="days"
                  min="1"
                  value={form.days}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-100 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Reason</label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-100 bg-gray-50 resize-none"
                  rows={2}
                  required
                />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  onClick={() => setShowForm(false)}
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow"
                >Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

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