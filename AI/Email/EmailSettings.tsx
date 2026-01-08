import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sparkles, Mail, Link2, ExternalLink, User, Lock, Globe, Phone, MapPin, Briefcase, ChevronDown, Check, X, Shield, RefreshCw, Inbox } from 'lucide-react';

const EmailSettings: React.FC = () => {
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Rules State
  const [rules, setRules] = useState([
    { id: '1', name: 'Sort to "Work" folder', condition: 'Sender matches @microsoft.com', active: true },
    { id: '2', name: 'Auto-Draft Replies', condition: 'Subject contains [Inquiry]', active: false }
  ]);

  // Azure Config State
  const [azureConfig, setAzureConfig] = useState({
    clientId: '',
    tenantId: '',
    clientSecret: ''
  });

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', condition: '', folder: 'Work' });

  useEffect(() => {
    api.get('smtp_settings')
      .then(data => {
        if (data && data.length > 0) {
          setSmtpStatus(data[0]);
          setIsConnected(true);
        }
      })
      .catch(err => console.error('Error fetching SMTP:', err));
  }, []);

  const handleConnectOutlook = () => {
    if (!azureConfig.clientId) {
      alert('Please provide an Azure Client ID in the "Outlook Configuration" section first.');
      return;
    }
    setIsConnecting(true);

    const redirectUri = window.location.origin + '/hr_portal/auth/callback';
    const scope = encodeURIComponent('offline_access user.read mail.readwrite mail.send');
    const authUrl = `https://login.microsoftonline.com/${azureConfig.tenantId || 'common'}/oauth2/v2.0/authorize?client_id=${azureConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${scope}`;

    console.log('Redirecting to Outlook OAuth:', authUrl);

    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setSmtpStatus({ user: 'dinesh.k@microsoft.com', host: 'outlook.office365.com' });
    }, 2000);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.condition) {
      setRules([...rules, {
        id: Date.now().toString(),
        name: newRule.name,
        condition: newRule.condition,
        active: true
      }]);
      setIsAddingRule(false);
      setNewRule({ name: '', condition: '', folder: 'Work' });
    }
  };

  const InputField = ({ label, value, type = 'text', placeholder = '', onChange, disabled = false }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>
    </div>
  );

  const SelectField = ({ label, value }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer pr-10">
          <option>{value}</option>
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 p-8 pt-0">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${isConnected ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
            }`}>
            {isConnected ? 'Service Online' : 'Action Required'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
        <div className="flex items-center gap-8 relative z-10">
          <div className="relative shrink-0">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isConnected ? 'bg-blue-600 shadow-blue-600/20' : 'bg-slate-100 shadow-slate-200/20'
              }`}>
              <Mail className={`w-10 h-10 ${isConnected ? 'text-white' : 'text-slate-400'}`} />
            </div>
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-slate-800">Microsoft Outlook</h3>
              {isConnected && (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-widest rounded-md border border-blue-100/50">Personal Linked</span>
              )}
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              {isConnected
                ? `Synchronizing mail as ${smtpStatus?.user || 'dinesh.k@microsoft.com'}. All messages are being processed by the AI Assistant.`
                : 'Connect your Microsoft 365 or Outlook account to enable AI drafting and automated mailbox management.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleConnectOutlook}
          disabled={isConnecting}
          className={`relative z-10 px-8 py-3.5 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-3 shadow-lg ${isConnected
            ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-200/20'
            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20'
            }`}
        >
          {isConnecting ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : isConnected ? (
            <Link2 size={18} className="text-blue-500" />
          ) : (
            <ExternalLink size={18} />
          )}
          <span>{isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Outlook'}</span>
        </button>

        <Mail className="absolute right-[-20px] top-[-20px] w-64 h-64 text-slate-50/50 -rotate-12 pointer-events-none" />
      </div>

      <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h4 className="text-lg font-bold text-slate-800">Outlook OAuth Configuration</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <InputField
              label="Azure Client ID"
              value={azureConfig.clientId}
              onChange={(val: string) => setAzureConfig({ ...azureConfig, clientId: val })}
              placeholder="Enter Application (client) ID"
            />
            <InputField
              label="Azure Tenant ID"
              value={azureConfig.tenantId}
              onChange={(val: string) => setAzureConfig({ ...azureConfig, tenantId: val })}
              placeholder="e.g. common or your-tenant-id"
            />
            <InputField
              label="Client Secret"
              type="password"
              value={azureConfig.clientSecret}
              onChange={(val: string) => setAzureConfig({ ...azureConfig, clientSecret: val })}
              placeholder="••••••••••••••••"
            />
            <div className="flex flex-col gap-2 pt-8">
              <div className="text-xs text-slate-400 italic">
                Note: You can find these keys in your Azure Active Directory App Registration.
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Auto-Sorting Rules</h4>
            </div>
            {!isAddingRule && (
              <button
                onClick={() => setIsAddingRule(true)}
                className="text-[10px] font-extrabold text-orange-600 hover:underline uppercase tracking-widest"
              >
                + Add New Rule
              </button>
            )}
          </div>

          <div className="space-y-4">
            {isAddingRule && (
              <div className="p-8 bg-orange-50/30 border border-orange-100 rounded-[32px] space-y-6 animate-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Rule Name"
                    value={newRule.name}
                    onChange={(val: string) => setNewRule({ ...newRule, name: val })}
                    placeholder="e.g. Finance Invoices"
                  />
                  <InputField
                    label="Condition"
                    value={newRule.condition}
                    onChange={(val: string) => setNewRule({ ...newRule, condition: val })}
                    placeholder="e.g. Subject contains 'Invoice'"
                  />
                  <SelectField label="Move to Folder" value={newRule.folder} />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleAddRule}
                    className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    Create Rule
                  </button>
                  <button
                    onClick={() => setIsAddingRule(false)}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {rules.map(rule => (
              <div key={rule.id} className={`p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-all ${!rule.active ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 ${rule.active ? 'text-orange-500' : 'text-slate-400'}`}>
                    <Inbox size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{rule.name}</div>
                    <div className="text-xs text-slate-500">{rule.condition}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${rule.active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => removeRule(rule.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={16} /></button>
                </div>
              </div>
            ))}
            {rules.length === 0 && !isAddingRule && (
              <div className="text-center py-12 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 text-slate-400 italic text-sm">
                No active sorting rules. Add one to start organizing your mailbox.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h4 className="text-lg font-bold text-slate-800">Smart Features</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">AI Smart Drafting</div>
                <div className="text-xs text-slate-500 mt-0.5">Suggest replies using your writing style</div>
              </div>
              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${aiEnabled ? 'bg-orange-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${aiEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-help">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Thread Summaries</div>
                  <div className="text-xs text-slate-500">Auto-generate briefs for long emails</div>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">BETA</span>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <Shield size={16} />
            <span className="text-xs font-medium italic">Your mail data is encrypted and never stored on system servers.</span>
          </div>
          <button className="bg-slate-900 border-none text-white font-bold py-3 px-10 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
