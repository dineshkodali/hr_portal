import React, { useEffect, useState } from 'react';
import { Lock, Search, Plus, Edit, Trash2, Eye, EyeOff, Copy, X } from 'lucide-react';
import { api } from '../services/api';

interface PasswordEntry {
  id: number;
  label: string;
  username?: string;
  password: string;
  created_at: string;
  updated_at: string;
}

interface PasswordFormState {
  id?: number;
  label: string;
  username: string;
  password: string;
}

const PasswordManager: React.FC<{ userId: string }> = ({ userId }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordId, setShowPasswordId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<PasswordFormState>({ label: '', username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchPasswords = async () => {
    setLoading(true);
    try {
      // Pass userId as query param
      const res = await api.get(`user_passwords?userId=${encodeURIComponent(userId)}`);
      setPasswords(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
    // eslint-disable-next-line
  }, [userId]);

  const handleOpenDialog = (entry?: PasswordEntry) => {
    if (entry) {
      setEditMode(true);
      setForm({ id: entry.id, label: entry.label, username: entry.username || '', password: entry.password });
    } else {
      setEditMode(false);
      setForm({ label: '', username: '', password: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ label: '', username: '', password: '' });
    setEditMode(false);
    setError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.label || !form.password) {
      setError('Label and password are required');
      return;
    }
    setLoading(true);
    try {
      if (editMode && form.id) {
        await api.update('user_passwords', String(form.id), { ...form, userId });
      } else {
        await api.create('user_passwords', { ...form, userId });
      }
      await fetchPasswords();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this password?')) return;
    setLoading(true);
    try {
      await api.delete('user_passwords', String(id));
      await fetchPasswords();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  // Password strength meter
  const getStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const filtered = passwords.filter(p =>
    p.label.toLowerCase().includes(search.toLowerCase()) ||
    (p.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (val: string, id: number) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">Password Vault</h1>
          <p className="text-[#64748b] text-base mt-1">Securely store external or work-related passwords. <b>This does not affect your login password.</b> Only you can view or manage your vault entries.</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="bg-[#f97316] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={18} /> <span>Add Password</span>
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] overflow-hidden">
        <div className="p-6 border-b border-[#f1f5f9]">
          <div className="relative max-w-[360px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input
              type="text"
              placeholder="Search passwords..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/10 text-sm font-medium"
            />
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((entry) => (
              <div key={entry.id} className="bg-white p-3 rounded-xl border border-[#f1f5f9] hover:border-[#f97316]/30 transition-all group min-h-[170px] flex flex-col justify-between relative">
                <div className="flex justify-between items-start mb-5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
                    <Lock size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleOpenDialog(entry)} className="p-2 text-[#94a3b8] hover:text-[#1e293b]" title="Edit"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(entry.id)} className="p-2 text-[#94a3b8] hover:text-red-500" title="Delete"><Trash2 size={16}/></button>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-orange-50 text-orange-700 border-orange-100 w-fit mb-1">EXTERNAL</span>
                <h3 className="text-base font-bold text-[#1e293b] pt-1">{entry.label}</h3>
                <p className="text-xs text-[#64748b] font-medium">{entry.username || <span className="text-[#cbd5e1]">No username</span>}</p>
                <div className="mb-2"><PasswordStrengthBar password={entry.password} /></div>
                <div className="flex items-center gap-2">
                  <input
                    type={showPasswordId === entry.id ? 'text' : 'password'}
                    value={entry.password}
                    readOnly
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-[#1e293b] font-mono text-sm px-0 py-1"
                  />
                  <button onClick={e => { e.stopPropagation(); setShowPasswordId(showPasswordId === entry.id ? null : entry.id); }} className="p-1 text-[#94a3b8] hover:text-[#1e293b]">
                    {showPasswordId === entry.id ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleCopy(entry.password, entry.id); }} className="p-1 text-[#94a3b8] hover:text-[#22c55e]">
                    <Copy size={16} />
                  </button>
                  {copiedId === entry.id && <span className="text-xs text-green-600 font-bold ml-1">Copied!</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center text-[#64748b] py-6 font-medium">No passwords found. Try adding or searching.</div>
            )}
            {loading && (
              <div className="col-span-full text-center text-[#64748b] py-6 font-medium">Loading...</div>
            )}
          </div>
        </div>
      </div>
      {/* Add/Edit Password Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4" onClick={handleCloseDialog}>
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-[#1e293b]">{editMode ? 'Edit Password' : 'Add Password'}</h3>
              <button onClick={handleCloseDialog} className="text-[#94a3b8] hover:text-[#1e293b]">
                <X size={24}/>
              </button>
            </div>
            <form className="p-8 space-y-5" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div>
                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Label</label>
                <input
                  autoFocus
                  name="label"
                  value={form.label}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748b] mb-1.5 uppercase tracking-wider">Password</label>
                <div className="flex items-center gap-2">
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    type="text"
                    className="flex-1 px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm font-medium outline-none"
                    required
                  />
                  <button type="button" onClick={() => setForm(f => ({ ...f, password: '' }))} className="p-2 text-[#94a3b8] hover:text-red-500" title="Clear Password"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="mt-1 mb-1">
                <PasswordStrengthBar password={form.password} />
              </div>
              {error && <div className="text-red-600 font-medium text-sm">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#f97316] text-white rounded-xl font-semibold shadow-lg hover:bg-[#ea580c] transition-all flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {editMode ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Password strength bar component (Handbook style, no MUI)
function PasswordStrengthBar({ password }: { password: string }) {
  const strength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-yellow-300', 'bg-green-300', 'bg-green-700'];
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-2 ${colors[strength]} rounded-full transition-all`} style={{ width: `${(strength / 4) * 100}%` }} />
      </div>
      <span className={`text-xs font-semibold ${strength < 2 ? 'text-red-500' : strength < 4 ? 'text-yellow-600' : 'text-green-700'}`}>{labels[strength]}</span>
    </div>
  );
}

export default PasswordManager;
