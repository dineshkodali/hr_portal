import React, { useState, useEffect } from 'react';
import { 
    Shield, Lock, Smartphone, Trash2, Eye, EyeOff, Copy, CheckCircle, 
    AlertCircle, Plus, RefreshCw, LogOut, MapPin, Monitor, Globe, Calendar,
    QrCode, Key, Zap, ShieldCheck, ShieldOff, ToggleLeft, ToggleRight, FileText, X, Save,
    Users, Share2, Search, Grid, List, UserPlus, Globe as GlobeIcon
} from 'lucide-react';
import { User, FileItem, Group } from '../types';
import { api } from '../services/api';
import { collectDeviceMetadata, getDeviceMetadataDisplay } from '../services/deviceMetadata';
import { getLocationFromIP, formatLocationShort, LocationData } from '../services/geolocation';

interface TrustedDevice {
    id: string;
    userId: string;
    deviceName: string;
    deviceType: string;
    browser: string;
    os: string;
    ipAddress: string;
    deviceFingerprint: string;
    addedAt: string;
    lastUsedAt: string;
    isCurrentDevice: boolean;
}

interface MFALog {
    id: string;
    userId: string;
    timestamp: string;
    ipAddress: string;
    browser: string;
    os: string;
    device: string;
    deviceName?: string;
    status: 'success' | 'failed' | 'compromised';
    loginAttempt: string;
    loginSource?: 'password' | 'mfa' | 'otp';
}

interface SecuritySettings {
    totpEnabled: boolean;
    otpEnabled: boolean;
    totpSecret?: string;
}

export const SecuritySettings: React.FC<{ user: User; files?: FileItem[]; users?: User[]; groups?: Group[]; onUpdateFile?: (file: FileItem) => void }> = ({ user, files = [], users = [], groups = [], onUpdateFile }) => {
    const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'history' | 'devices' | 'setup' | 'file-access'>('sessions');
    const [loading, setLoading] = useState(false);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        totpEnabled: false,
        otpEnabled: false
    });
    const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
    const [mfaLogs, setMfaLogs] = useState<MFALog[]>([]);
    const [activeSessions, setActiveSessions] = useState<MFALog[]>([]);
    const [locationCache, setLocationCache] = useState<Record<string, LocationData | null>>({});
    const [showSecret, setShowSecret] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newDeviceName, setNewDeviceName] = useState('');
    const [setupStep, setSetupStep] = useState<'initial' | 'qr' | 'verify' | 'complete'>('initial');
    const [totpVerified, setTotpVerified] = useState(false);
    const [isFileAccessModalOpen, setIsFileAccessModalOpen] = useState(false);
    const [accessEditFile, setAccessEditFile] = useState<FileItem | null>(null);
    const [accessForm, setAccessForm] = useState<{ users: string[]; groups: string[] }>({ users: [], groups: [] });
    const [fileSearchTerm, setFileSearchTerm] = useState('');
    const [fileViewMode, setFileViewMode] = useState<'grid' | 'list'>('grid');
    const [fileFilter, setFileFilter] = useState<'all' | 'shared' | 'private'>('all');

    // Load security settings
    useEffect(() => {
        loadSecuritySettings();
        loadTrustedDevices();
        loadMFALogs();
        loadActiveSessions();
    }, [user.id]);

    const loadSecuritySettings = async () => {
        try {
            const settings = await api.getSecuritySettings(user.id);
            setSecuritySettings(settings);
            setTotpVerified(settings.totpEnabled);
        } catch (err) {
            console.error('Failed to load security settings:', err);
        }
    };

    const loadTrustedDevices = async () => {
        try {
            const devices = await api.getTrustedDevices(user.id);
            setTrustedDevices(devices);
        } catch (err) {
            console.error('Failed to load trusted devices:', err);
            setTrustedDevices([]);
        }
    };

    const loadMFALogs = async () => {
        try {
            const logs = await api.getMFALogs(user.id);
            setMfaLogs(logs);
            
            // Fetch locations for unique IPs in history
            const uniqueIPs = [...new Set(logs.map(log => log.ipAddress).filter(ip => ip && ip !== 'Unknown'))] as string[];
            const newLocationCache = { ...locationCache };
            
            for (const ip of uniqueIPs) {
                if (!newLocationCache[ip]) {
                    try {
                        const location = await getLocationFromIP(ip);
                        newLocationCache[ip] = location;
                    } catch (err) {
                        console.error(`Failed to get location for ${ip}:`, err);
                        newLocationCache[ip] = null;
                    }
                }
            }
            
            setLocationCache(newLocationCache);
        } catch (err) {
            console.error('Failed to load MFA logs:', err);
            setMfaLogs([]);
        }
    };

    const loadActiveSessions = async () => {
        try {
            // Get recent successful logins (last 24 hours) as active sessions
            const logs = await api.getMFALogs(user.id);
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const recentSessions = logs
                .filter(log => log.status === 'success')
                .filter(log => new Date(log.timestamp) > oneDayAgo)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            setActiveSessions(recentSessions);
            
            // Fetch locations for unique IPs
            const uniqueIPs = [...new Set(recentSessions.map(s => s.ipAddress).filter(ip => ip))] as string[];
            const newLocationCache = { ...locationCache };
            
            for (const ip of uniqueIPs) {
                if (!newLocationCache[ip]) {
                    try {
                        const location = await getLocationFromIP(ip);
                        newLocationCache[ip] = location;
                    } catch (err) {
                        console.error(`Failed to get location for ${ip}:`, err);
                        newLocationCache[ip] = null;
                    }
                }
            }
            
            setLocationCache(newLocationCache);
        } catch (err) {
            console.error('Failed to load active sessions:', err);
            setActiveSessions([]);
        }
    };

    const handleSetupTotp = async () => {
        setLoading(true);
        try {
            const response = await api.setupTotp(user.id);
            if (response.qrCode && response.secret) {
                setQrCodeUrl(response.qrCode);
                setSecuritySettings(prev => ({ ...prev, totpSecret: response.secret }));
                setSetupStep('qr');
            }
        } catch (err) {
            alert('Failed to setup TOTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTotp = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            alert('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            // Collect device metadata
            const metadata = await collectDeviceMetadata(newDeviceName || undefined);
            
            const response = await api.verifyTotp(
                user.id, 
                verificationCode, 
                metadata.deviceName,
                {
                    deviceType: metadata.deviceType,
                    browser: metadata.browser,
                    os: metadata.os,
                    ipAddress: metadata.ipAddress
                }
            );

            if (response.success) {
                setTotpVerified(true);
                setSetupStep('complete');
                setSecuritySettings(prev => ({ ...prev, totpEnabled: true }));
                setVerificationCode('');
                setNewDeviceName('');
                
                // Reload devices after setup
                setTimeout(() => {
                    loadTrustedDevices();
                    loadMFALogs();
                }, 1000);
            }
        } catch (err: any) {
            alert(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableTotp = async () => {
        if (!window.confirm('Are you sure? This will disable authenticator-based login.')) {
            return;
        }

        setLoading(true);
        try {
            await api.disableTotp(user.id);
            setSecuritySettings(prev => ({ ...prev, totpEnabled: false }));
            setTotpVerified(false);
            setSetupStep('initial');
            setQrCodeUrl('');
            alert('Authenticator app has been disabled');
        } catch (err) {
            alert('Failed to disable authenticator');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
        if (!window.confirm(`Remove "${deviceName}" from trusted devices?`)) {
            return;
        }

        setLoading(true);
        try {
            await api.revokeTrustedDevice(user.id, deviceId);
            loadTrustedDevices();
            alert('Device removed successfully');
        } catch (err) {
            alert('Failed to remove device');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveSubTab('sessions')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        activeSubTab === 'sessions'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Monitor size={18} />
                        Active Sessions ({activeSessions.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveSubTab('history')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        activeSubTab === 'history'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        Login History
                    </div>
                </button>
                <button
                    onClick={() => setActiveSubTab('devices')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        activeSubTab === 'devices'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Smartphone size={18} />
                        Trusted Devices ({trustedDevices.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveSubTab('setup')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        activeSubTab === 'setup'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Shield size={18} />
                        2FA, MFA & OTP
                    </div>
                </button>
                <button
                    onClick={() => setActiveSubTab('file-access')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        activeSubTab === 'file-access'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        File Access Management
                    </div>
                </button>
            </div>

            {/* ACTIVE SESSIONS TAB */}
            {activeSubTab === 'sessions' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Shield className="text-orange-500" size={24} />
                                    Active Sessions (Last 24 hours)
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">View your recent login sessions with real-time location data</p>
                            </div>
                            <button
                                onClick={loadActiveSessions}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>

                        {activeSessions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Device & Browser</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">IP & Location</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Info</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeSessions.map((session, index) => {
                                            const location = locationCache[session.ipAddress || ''] || null;
                                            const isFirstSession = index === 0;
                                            return (
                                                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1 text-orange-700">
                                                                <CheckCircle size={16} />
                                                                <span className="text-sm font-semibold">Success</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {session.loginSource === 'mfa' ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                                <Key size={12} />
                                                                Authenticator
                                                            </span>
                                                        ) : session.loginSource === 'otp' ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                                                <Smartphone size={12} />
                                                                Email OTP
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                                                <Lock size={12} />
                                                                Password
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                                <Monitor size={20} className="text-slate-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">{session.browser || 'Unknown Browser'}</p>
                                                                <p className="text-xs text-slate-500">{session.os || 'Unknown OS'}</p>
                                                                <p className="text-xs text-slate-500">{session.device || 'Unknown Device'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={14} className="text-slate-400" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800">{session.ipAddress || 'Unknown'}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {location ? formatLocationShort(location) : 'Fetching...'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">{new Date(session.timestamp).toLocaleDateString()}</p>
                                                            <p className="text-xs text-slate-500">{new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        {isFirstSession && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                                                <Zap size={12} />
                                                                Current
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Monitor className="mx-auto mb-4 text-slate-300" size={48} />
                                <p className="text-slate-600 font-medium">No active sessions</p>
                                <p className="text-sm text-slate-500 mt-1">Your recent login sessions will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LOGIN HISTORY TAB */}
            {activeSubTab === 'history' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="text-orange-500" size={24} />
                                    Activity Logs
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Complete history of your activities (Read-only)</p>
                            </div>
                            <button
                                onClick={() => loadMFALogs()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AUTH</p>
                                <p className="text-3xl font-black text-orange-600 mt-1">{mfaLogs.filter(log => log.status === 'success').length}</p>
                                <p className="text-xs text-slate-500 mt-1">Last: {mfaLogs.length > 0 ? new Date(mfaLogs[0].timestamp).toRelativeTime() : 'Never'}</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIEW</p>
                                <p className="text-3xl font-black text-blue-600 mt-1">{mfaLogs.length}</p>
                                <p className="text-xs text-slate-500 mt-1">Total activities</p>
                            </div>
                        </div>

                        {mfaLogs.length > 0 ? (
                            <div className="space-y-3">
                                {mfaLogs.map((log) => {
                                    const location = locationCache[log.ipAddress || ''] || null;
                                    return (
                                        <div
                                            key={log.id}
                                            className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-orange-200 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                                                        {log.status === 'success' ? (
                                                            <CheckCircle size={20} className="text-orange-500" />
                                                        ) : (
                                                            <AlertCircle size={20} className="text-red-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-semibold text-slate-800">{log.loginAttempt}</h4>
                                                            {/* Authentication Method Badge */}
                                                            {log.loginSource === 'password' && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                                    <Lock size={12} />
                                                                    Password
                                                                </span>
                                                            )}
                                                            {log.loginSource === 'mfa' && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                                                    <Key size={12} />
                                                                    Authenticator
                                                                </span>
                                                            )}
                                                            {log.loginSource === 'otp' && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                                                    <Smartphone size={12} />
                                                                    Email OTP
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
                                                            {/* Date & Time */}
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar size={14} className="text-slate-400" />
                                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            {/* IP Address & Location */}
                                                            <div className="flex items-center gap-1.5">
                                                                <Globe size={14} className="text-slate-400" />
                                                                <span className="font-mono">{log.ipAddress || 'Unknown IP'}</span>
                                                                {location && (
                                                                    <span className="text-slate-500">
                                                                        • {formatLocationShort(location)}
                                                                    </span>
                                                                )}
                                                                {!location && log.ipAddress && log.ipAddress !== 'Unknown' && (
                                                                    <span className="text-slate-400">• Loading...</span>
                                                                )}
                                                            </div>
                                                            {/* Device Type & Browser */}
                                                            <div className="flex items-center gap-1.5">
                                                                <Monitor size={14} className="text-slate-400" />
                                                                <span>{log.device || 'Unknown Device'}</span>
                                                                <span className="text-slate-400">•</span>
                                                                <span>{log.browser || 'Unknown Browser'}</span>
                                                            </div>
                                                            {/* Operating System */}
                                                            <div className="flex items-center gap-1.5">
                                                                <Monitor size={14} className="text-slate-400" />
                                                                <span>{log.os || 'Unknown OS'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {log.status === 'success' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                                            <CheckCircle size={12} /> Success
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                            <AlertCircle size={12} /> Failed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto mb-4 text-slate-300" size={48} />
                                <p className="text-slate-600 font-medium">No activity logs yet</p>
                                <p className="text-sm text-slate-500 mt-1">Your login attempts will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2FA, MFA & OTP TAB (AUTHENTICATION SETTINGS) */}
            {activeSubTab === 'setup' && (
                <div className="space-y-4">
                    {/* MFA TOGGLE - Top Section */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    securitySettings.totpEnabled ? 'bg-orange-50' : 'bg-slate-100'
                                }`}>
                                    {securitySettings.totpEnabled ? (
                                        <ShieldCheck className="text-orange-600" size={20} />
                                    ) : (
                                        <ShieldOff className="text-slate-400" size={20} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">MFA Enforcement</h3>
                                    <p className="text-xs text-slate-500">
                                        {securitySettings.totpEnabled 
                                            ? 'Require authentication code on every login'
                                            : 'Login with password only (less secure)'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                    securitySettings.totpEnabled
                                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                                }`}>
                                    {securitySettings.totpEnabled ? (
                                        <>
                                            <ShieldCheck className="inline mr-1" size={14} />
                                            Enabled
                                        </>
                                    ) : (
                                        <>
                                            <ShieldOff className="inline mr-1" size={14} />
                                            Disabled
                                        </>
                                    )}
                                </span>
                                <button
                                    onClick={async () => {
                                        // Check if user has completed MFA setup by verifying they have trusted devices
                                        if (trustedDevices.length === 0 && !securitySettings.totpEnabled) {
                                            alert('Please setup your authenticator app and verify a device below before enabling MFA.');
                                            return;
                                        }
                                        
                                        const newStatus = !securitySettings.totpEnabled;
                                        setLoading(true);
                                        try {
                                            if (newStatus) {
                                                await api.updateSecuritySettings(user.id, {
                                                    totpEnabled: true
                                                });
                                                await loadSecuritySettings();
                                                alert('✅ MFA Enabled! Authentication code required on every login.');
                                            } else {
                                                if (window.confirm('Disable MFA? This reduces account security.')) {
                                                    await api.updateSecuritySettings(user.id, {
                                                        totpEnabled: false
                                                    });
                                                    await loadSecuritySettings();
                                                    alert('⚠️ MFA Disabled.');
                                                }
                                            }
                                        } catch (err) {
                                            alert('Failed to update MFA settings');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg text-sm font-bold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                                >
                                    {securitySettings.totpEnabled ? 'Turn Off' : 'Turn On'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* OTP LOGIN TOGGLE - Email-based OTP */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    securitySettings.otpEnabled ? 'bg-blue-50' : 'bg-slate-100'
                                }`}>
                                    {securitySettings.otpEnabled ? (
                                        <Key className="text-blue-600" size={20} />
                                    ) : (
                                        <Key className="text-slate-400" size={20} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">OTP Login</h3>
                                    <p className="text-xs text-slate-500">
                                        {securitySettings.otpEnabled 
                                            ? 'Email-based one-time password login enabled'
                                            : 'Allow passwordless login via email verification code'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                    securitySettings.otpEnabled
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                                }`}>
                                    {securitySettings.otpEnabled ? (
                                        <>
                                            <CheckCircle className="inline mr-1" size={14} />
                                            Enabled
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="inline mr-1" size={14} />
                                            Disabled
                                        </>
                                    )}
                                </span>
                                <button
                                    onClick={async () => {
                                        const newStatus = !securitySettings.otpEnabled;
                                        setLoading(true);
                                        try {
                                            if (newStatus) {
                                                if (window.confirm('Enable OTP Login? You\'ll be able to login using a code sent to your email.')) {
                                                    await api.updateSecuritySettings(user.id, {
                                                        otpEnabled: true
                                                    });
                                                    await loadSecuritySettings();
                                                    alert('✅ OTP Login Enabled! You can now login using email verification codes.');
                                                }
                                            } else {
                                                if (window.confirm('Disable OTP Login? This removes the passwordless login option.')) {
                                                    await api.updateSecuritySettings(user.id, {
                                                        otpEnabled: false
                                                    });
                                                    await loadSecuritySettings();
                                                    alert('⚠️ OTP Login Disabled.');
                                                }
                                            }
                                        } catch (err) {
                                            alert('Failed to update OTP settings');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg text-sm font-bold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                                >
                                    {securitySettings.otpEnabled ? 'Turn Off' : 'Turn On'}
                                </button>
                            </div>
                        </div>
                        
                        {/* OTP Information */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="font-medium text-slate-700">Passwordless Login</p>
                                        <p className="text-slate-500 text-xs">Login using a 6-digit code sent to your email</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="font-medium text-slate-700">Password Recovery</p>
                                        <p className="text-slate-500 text-xs">Reset forgotten passwords securely via email</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="font-medium text-slate-700">Time-Limited Codes</p>
                                        <p className="text-slate-500 text-xs">Codes expire in 10 minutes for security</p>
                                    </div>
                                </div>
                                {securitySettings.otpEnabled && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-xs text-blue-800 font-medium">
                                            ✓ OTP Login Active - Use "Login with OTP" button on the login page
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AUTHENTICATOR SETUP */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <QrCode className="text-orange-500" size={20} />
                            Authenticator App Setup
                        </h3>

                        {!securitySettings.totpEnabled ? (
                            <div className="space-y-6">
                                {setupStep === 'initial' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                                            <div className="flex gap-3">
                                                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                                                <div>
                                                    <p className="font-medium text-blue-900">Two-Factor Authentication</p>
                                                    <p className="text-blue-800 text-xs mt-1">
                                                        Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) 
                                                        to add an extra layer of security to your account.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSetupTotp}
                                            disabled={loading}
                                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <QrCode size={18} />}
                                            {loading ? 'Setting up...' : 'Start Setup'}
                                        </button>
                                    </div>
                                )}

                                {setupStep === 'qr' && (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600 mb-3">Step 1: Scan QR Code</p>
                                            <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-center min-h-64">
                                                {qrCodeUrl ? (
                                                    <img src={qrCodeUrl} alt="QR Code" className="max-w-xs" />
                                                ) : (
                                                    <p className="text-slate-400">QR Code loading...</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-600 mb-2">Step 2: Manual Entry (if QR doesn't work)</p>
                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm">
                                                <div className="flex items-center justify-between">
                                                    <code className="break-all">{securitySettings.totpSecret}</code>
                                                    <button
                                                        onClick={() => copyToClipboard(securitySettings.totpSecret || '')}
                                                        className="ml-2 p-2 hover:bg-slate-200 rounded transition-all"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Device Name</label>
                                            <input
                                                type="text"
                                                value={newDeviceName}
                                                onChange={(e) => setNewDeviceName(e.target.value)}
                                                placeholder="e.g., Personal iPhone"
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                        </div>

                                        <button
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                            {showSecret ? 'Hide' : 'Show'} Secret Key
                                        </button>
                                    </div>
                                )}

                                {setupStep === 'qr' && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-2">Step 3: Enter Verification Code</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="000000"
                                                maxLength={6}
                                                className="flex-1 px-4 py-2 text-center text-2xl border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono tracking-widest"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Enter the 6-digit code from your authenticator app</p>
                                    </div>
                                )}

                                {setupStep === 'qr' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSetupStep('initial')}
                                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleVerifyTotp}
                                            disabled={loading || verificationCode.length !== 6}
                                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Verifying...' : 'Verify & Enable'}
                                        </button>
                                    </div>
                                )}

                                {setupStep === 'complete' && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                                        <CheckCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="font-bold text-orange-900">Setup Complete!</p>
                                            <p className="text-sm text-orange-800 mt-1">
                                                Your authenticator app is now enabled. You'll need to enter a code from your app when logging in.
                                            </p>
                                            <button
                                                onClick={() => setSetupStep('initial')}
                                                className="mt-3 text-sm text-orange-700 hover:text-orange-900 font-medium"
                                            >
                                                ← Back to Setup
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                                    <CheckCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-bold text-orange-900">Authenticator Enabled</p>
                                        <p className="text-sm text-orange-800 mt-1">
                                            Your account is protected with two-factor authentication.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDisableTotp}
                                    disabled={loading}
                                    className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-all"
                                >
                                    Disable Authenticator
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TRUSTED DEVICES TAB */}
            {activeSubTab === 'devices' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Connected Devices</h3>
                            <p className="text-sm text-slate-500 mt-1">Manage devices that have access to your account with 2FA</p>
                        </div>
                        <button
                            onClick={() => setActiveSubTab('setup')}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> Add New Device
                        </button>
                    </div>

                    {trustedDevices.length > 0 ? (
                        <div className="space-y-3">
                            {trustedDevices.map((device) => {
                                // Determine device icon based on type
                                const deviceIcon = 
                                    device.deviceType?.toLowerCase().includes('mobile') ? '📱' :
                                    device.deviceType?.toLowerCase().includes('tablet') ? '📱' :
                                    '🖥️';
                                
                                return (
                                <div
                                    key={device.id}
                                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="text-3xl mt-0.5">{deviceIcon}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-slate-800 text-lg break-words">{device.deviceName}</h4>
                                                    {device.isCurrentDevice && (
                                                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold whitespace-nowrap">
                                                            ✓ Current Device
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 space-y-2 mt-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Monitor size={14} className="text-slate-400" />
                                                        <span className="font-semibold text-slate-700">{device.os || 'Unknown OS'}</span>
                                                        <span className="text-slate-400">•</span>
                                                        <span className="text-slate-600">{device.browser || 'Unknown Browser'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Globe size={14} className="text-slate-400" />
                                                        <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded">{device.ipAddress || 'IP Unknown'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <span>Added <span className="font-semibold text-slate-700">{new Date(device.addedAt).toLocaleDateString()} {new Date(device.addedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Zap size={14} className="text-slate-400" />
                                                        <span>Last active <span className="font-semibold text-slate-700">{new Date(device.lastUsedAt).toLocaleDateString()} {new Date(device.lastUsedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span>
                                                    </div>
                                                    <div className="pt-1 border-t border-slate-100">
                                                        <div className="text-slate-400 inline-block">
                                                            Fingerprint: <span className="font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded text-[11px]">{device.deviceFingerprint?.substring(0, 24)}...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            {!device.isCurrentDevice && (
                                                <button
                                                    onClick={() => handleRemoveDevice(device.id, device.deviceName)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all font-medium text-xs"
                                                    title="Remove device"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                            <Smartphone className="text-slate-300 mx-auto mb-4" size={48} />
                            <p className="text-slate-700 font-bold text-lg">No Devices Connected</p>
                            <p className="text-sm text-slate-500 mt-2 mb-4">
                                Add your first device to start using 2FA authentication
                            </p>
                            <button
                                onClick={() => setActiveSubTab('setup')}
                                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all inline-flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Your First Device
                            </button>
                        </div>
                    )}

                    {trustedDevices.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> You have <strong>{trustedDevices.length}</strong> device{trustedDevices.length !== 1 ? 's' : ''} registered. 
                                Add more devices for better security and access from multiple platforms.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* FILE ACCESS MANAGEMENT TAB */}
            {activeSubTab === 'file-access' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="text-orange-500" size={24} />
                                    File Sharing & Access
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Manage who can access your files, just like OneDrive</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFileViewMode(fileViewMode === 'grid' ? 'list' : 'grid')}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                                    title={fileViewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                                >
                                    {fileViewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={fileSearchTerm}
                                    onChange={(e) => setFileSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFileFilter('all')}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        fileFilter === 'all'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    All Files
                                </button>
                                <button
                                    onClick={() => setFileFilter('shared')}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                        fileFilter === 'shared'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    <Share2 size={16} />
                                    Shared
                                </button>
                                <button
                                    onClick={() => setFileFilter('private')}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                        fileFilter === 'private'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    <Lock size={16} />
                                    Private
                                </button>
                            </div>
                        </div>

                        {/* Filtered Files */}
                        {(() => {
                            const filteredFiles = files.filter(file => {
                                const matchesSearch = file.name.toLowerCase().includes(fileSearchTerm.toLowerCase());
                                const fileAccess = (file as any).access || { users: [], groups: [] };
                                const isShared = fileAccess.users.length > 0 || fileAccess.groups.length > 0;
                                
                                if (fileFilter === 'shared' && !isShared) return false;
                                if (fileFilter === 'private' && isShared) return false;
                                
                                return matchesSearch;
                            });

                            if (filteredFiles.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <FileText className="mx-auto mb-4 text-slate-300" size={48} />
                                        <p className="text-slate-600 font-medium">No files found</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {fileSearchTerm ? 'Try a different search term' : 'Files will appear here once uploaded'}
                                        </p>
                                    </div>
                                );
                            }

                            if (fileViewMode === 'grid') {
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {filteredFiles.map((file) => {
                                            const fileAccess = (file as any).access || { users: [], groups: [] };
                                            const isShared = fileAccess.users.length > 0 || fileAccess.groups.length > 0;
                                            const totalShared = fileAccess.users.length + fileAccess.groups.length;
                                            
                                            return (
                                                <div
                                                    key={file.id}
                                                    className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="p-2 bg-orange-50 rounded-lg">
                                                            <FileText size={24} className="text-orange-500" />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {isShared ? (
                                                                <div className="p-1.5 bg-blue-100 rounded-full">
                                                                    <Share2 size={14} className="text-blue-600" />
                                                                </div>
                                                            ) : (
                                                                <div className="p-1.5 bg-slate-100 rounded-full">
                                                                    <Lock size={14} className="text-slate-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                                        {file.name}
                                                    </h4>
                                                    
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                                        <span className="truncate">{file.uploadedBy}</span>
                                                        <span>•</span>
                                                        <span>{file.category}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            {isShared ? (
                                                                <>
                                                                    <Users size={14} className="text-blue-600" />
                                                                    <span className="text-xs font-semibold text-blue-600">
                                                                        {totalShared} {totalShared === 1 ? 'person' : 'people'}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <GlobeIcon size={14} className="text-slate-400" />
                                                                    <span className="text-xs font-semibold text-slate-400">Everyone</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAccessEditFile(file);
                                                                setAccessForm(fileAccess);
                                                                setIsFileAccessModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-all flex items-center gap-1"
                                                        >
                                                            <Share2 size={12} />
                                                            Share
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            // List View
                            return (
                                <div className="space-y-2">
                                    {filteredFiles.map((file) => {
                                        const fileAccess = (file as any).access || { users: [], groups: [] };
                                        const isShared = fileAccess.users.length > 0 || fileAccess.groups.length > 0;
                                        const totalShared = fileAccess.users.length + fileAccess.groups.length;
                                        
                                        return (
                                            <div
                                                key={file.id}
                                                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="p-2 bg-orange-50 rounded-lg">
                                                            <FileText size={20} className="text-orange-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-slate-800 text-sm truncate">
                                                                    {file.name}
                                                                </h4>
                                                                {isShared && (
                                                                    <div className="p-1 bg-blue-100 rounded-full">
                                                                        <Share2 size={12} className="text-blue-600" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                <span>{file.uploadedBy}</span>
                                                                <span>•</span>
                                                                <span>{file.category}</span>
                                                                <span>•</span>
                                                                {isShared ? (
                                                                    <span className="text-blue-600 font-semibold">
                                                                        Shared with {totalShared} {totalShared === 1 ? 'person' : 'people'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400">Available to everyone</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setAccessEditFile(file);
                                                            setAccessForm(fileAccess);
                                                            setIsFileAccessModalOpen(true);
                                                        }}
                                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all flex items-center gap-2 ml-4"
                                                    >
                                                        <Share2 size={16} />
                                                        Manage Access
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* FILE ACCESS MODAL - OneDrive Style */}
            {isFileAccessModalOpen && accessEditFile && (
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <FileText size={24} className="text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Share "{accessEditFile.name}"</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Control who can access this file</p>
                                </div>
                            </div>
                            <button onClick={() => setIsFileAccessModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <form className="space-y-6" onSubmit={e => {
                                e.preventDefault();
                                if (accessEditFile && onUpdateFile) {
                                    const updatedFile = { ...accessEditFile, access: accessForm } as FileItem;
                                    onUpdateFile(updatedFile);
                                    setIsFileAccessModalOpen(false);
                                }
                            }}>
                                {/* Current Access Status */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Who has access</label>
                                    <div className="space-y-3">
                                        {accessForm.users.length === 0 && accessForm.groups.length === 0 ? (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <GlobeIcon size={20} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">Everyone in your organization</p>
                                                    <p className="text-xs text-slate-500">All employees can view this file</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {accessForm.users.map((uid: string) => {
                                                    const u = users.find(x => x.id === uid);
                                                    return u ? (
                                                        <div key={u.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                    {u.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">{u.name}</p>
                                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAccessForm({ ...accessForm, users: accessForm.users.filter(id => id !== uid) })}
                                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}
                                                {accessForm.groups.map((gid: string) => {
                                                    const g = groups.find(x => x.id === gid);
                                                    return g ? (
                                                        <div key={g.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                                                                    <Users size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">{g.name}</p>
                                                                    <p className="text-xs text-slate-500">Group • {g.memberIds?.length || 0} members</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAccessForm({ ...accessForm, groups: accessForm.groups.filter(id => id !== gid) })}
                                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Add People */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Add people or groups</label>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-2">Select Users</label>
                                            <select 
                                                multiple 
                                                value={[]}
                                                onChange={e => {
                                                    const selectedIds = Array.from(e.target.selectedOptions as any, (o: any) => (o as HTMLOptionElement).value);
                                                    setAccessForm({ 
                                                        ...accessForm, 
                                                        users: [...new Set([...accessForm.users, ...selectedIds])]
                                                    });
                                                    e.target.selectedIndex = -1;
                                                }} 
                                                className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 min-h-[100px]"
                                            >
                                                {users.filter(u => !accessForm.users.includes(u.id)).map(u => 
                                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                                )}
                                            </select>
                                            <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple users</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-2">Select Groups</label>
                                            <select 
                                                multiple 
                                                value={[]}
                                                onChange={e => {
                                                    const selectedIds = Array.from(e.target.selectedOptions as any, (o: any) => (o as HTMLOptionElement).value);
                                                    setAccessForm({ 
                                                        ...accessForm, 
                                                        groups: [...new Set([...accessForm.groups, ...selectedIds])]
                                                    });
                                                    e.target.selectedIndex = -1;
                                                }} 
                                                className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 min-h-[100px]"
                                            >
                                                {groups.filter(g => !accessForm.groups.includes(g.id)).map(g => 
                                                    <option key={g.id} value={g.id}>{g.name} ({g.memberIds?.length || 0} members)</option>
                                                )}
                                            </select>
                                            <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple groups</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Make Public Option */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <GlobeIcon size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-blue-900 text-sm mb-1">Make available to everyone</p>
                                            <p className="text-xs text-blue-800 mb-3">Remove all restrictions to make this file accessible to all employees in your organization.</p>
                                            <button
                                                type="button"
                                                onClick={() => setAccessForm({ users: [], groups: [] })}
                                                className="text-sm font-semibold text-blue-700 hover:text-blue-900 underline"
                                            >
                                                Make public
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                            <button 
                                type="button"
                                onClick={() => setIsFileAccessModalOpen(false)}
                                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-white transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={() => {
                                    if (accessEditFile && onUpdateFile) {
                                        const updatedFile = { ...accessEditFile, access: accessForm } as FileItem;
                                        onUpdateFile(updatedFile);
                                        setIsFileAccessModalOpen(false);
                                    }
                                }}
                                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2"
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Helper function for relative time
declare global {
    interface Date {
        toRelativeTime(): string;
    }
}

Date.prototype.toRelativeTime = function() {
    const now = new Date();
    const diffMs = now.getTime() - this.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return this.toLocaleDateString();
};

export default SecuritySettings;
