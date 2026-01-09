// Copyright (c) 2026 SD Commercial. All rights reserved.
// This application and its content are the exclusive property of SD Commercial.
// Unauthorized use, reproduction, or distribution is strictly prohibited.

import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ArrowRight, Loader, Shield, Key, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../src/config/database.config';
import { collectDeviceMetadata } from '../services/deviceMetadata';
import CopyrightNotice from './CopyrightNotice';

interface LoginProps {
  onLogin: (user: User) => void;
  users?: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users = [] }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  // OTP States
  const [loginMode, setLoginMode] = useState<'password' | 'otp' | 'forgot'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = getApiUrl();

      // Collect device metadata for logging
      const metadata = await collectDeviceMetadata('Password Login');

      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          browser: metadata.browser,
          os: metadata.os,
          deviceType: metadata.deviceType,
          ipAddress: metadata.ipAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();

      // ✅ IF MFA IS REQUIRED, SHOW MFA VERIFICATION SCREEN
      if (data.requiresMFA) {
        setRequiresMFA(true);
        setSessionToken(data.sessionToken);
        setCurrentUserId(data.userId);
        setMfaCode('');
        setLoading(false);
        return;
      }

      // ✅ IF NO MFA, LOGIN DIRECTLY
      if (data.success && data.user) {
        onLogin(data.user as User);
      } else {
        setError('Login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = getApiUrl();

      // Collect device metadata for logging
      const metadata = await collectDeviceMetadata('Login Device');

      const response = await fetch(`${apiUrl}/auth/login/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          code: mfaCode,
          deviceType: metadata.deviceType,
          browser: metadata.browser,
          os: metadata.os,
          ipAddress: metadata.ipAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'MFA verification failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.user) {
        onLogin(data.user as User);
      } else {
        setError('MFA verification failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('MFA error:', err);
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  const fillCredentials = (role: string) => {
    setError('');

    const candidate = users.find(u => u.role.toLowerCase().includes(role.toLowerCase()));
    if (candidate) {
      setEmail(candidate.email);
    } else {
      setError('User role not found');
    }
  };

  // OTP Generation Handler
  const handleRequestOTP = async () => {
    if (!otpEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiUrl();
      const purpose = loginMode === 'forgot' ? 'password_reset' : 'login';

      const response = await fetch(`${apiUrl}/auth/${purpose === 'password_reset' ? 'password-reset/request' : 'otp/generate'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, purpose })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setOtpExpiresIn(data.expiresIn || 600);
        setError('');
        // Start countdown
        const countdown = setInterval(() => {
          setOtpExpiresIn(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP request error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Handler
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiUrl();
      const metadata = await collectDeviceMetadata('OTP Login Device');

      const response = await fetch(`${apiUrl}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          otpCode,
          deviceType: metadata.deviceType,
          browser: metadata.browser,
          os: metadata.os,
          ipAddress: metadata.ipAddress
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        onLogin(data.user as User);
      } else {
        setError(data.error || 'Invalid OTP code');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/auth/password-reset/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          otpCode,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Password reset successful! You can now login with your new password.');
        setLoginMode('password');
        setOtpSent(false);
        setOtpCode('');
        setOtpEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToPasswordLogin = () => {
    setLoginMode('password');
    setOtpSent(false);
    setOtpCode('');
    setOtpEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setOtpExpiresIn(0);
    setLoading(false);
    // Also clear MFA states to prevent redirecting to MFA screen
    setRequiresMFA(false);
    setMfaCode('');
    setSessionToken('');
    setCurrentUserId('');
  };

  const resetFromMFA = () => {
    setRequiresMFA(false);
    setMfaCode('');
    setSessionToken('');
    setCurrentUserId('');
    setError('');
    setPassword('');
    setLoading(false);
  };

  // ✅ MFA VERIFICATION SCREEN
  if (requiresMFA) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-900 to-primary-800 p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
          <div className="p-8 pb-6 bg-gradient-to-r from-orange-50 to-orange-100/50">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
              <Shield className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
          </div>

          <form onSubmit={handleMFASubmit} className="p-8 pt-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Verification Code</label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-3xl border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-mono tracking-widest"
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Check your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Verify & Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetFromMFA}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </form>
        </div>
        <div className="max-w-md w-full">
          <CopyrightNotice />
        </div>
      </div>
    );
  }

  // ✅ OTP LOGIN SCREEN
  if (loginMode === 'otp' || loginMode === 'forgot') {
    const isForgotPassword = loginMode === 'forgot';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-900 to-primary-800 p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
          <div className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-blue-100/50">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Key className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isForgotPassword ? 'Reset Password' : 'Login with OTP'}
            </h2>
            <p className="text-gray-600">
              {otpSent
                ? `Enter the 6-digit code sent to ${otpEmail}`
                : `We'll send a verification code to your email`
              }
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={(e) => { e.preventDefault(); handleRequestOTP(); }} className="p-8 pt-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 flex items-center">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetToPasswordLogin}
                className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← Back to Password Login
              </button>
            </form>
          ) : (
            <form onSubmit={isForgotPassword ? handlePasswordReset : handleVerifyOTP} className="p-8 pt-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 flex items-center">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Verification Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-3xl border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono tracking-widest"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {otpExpiresIn > 0
                      ? `Expires in ${Math.floor(otpExpiresIn / 60)}:${(otpExpiresIn % 60).toString().padStart(2, '0')}`
                      : 'Code expired'
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpCode(''); }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Resend Code
                  </button>
                </div>
              </div>

              {isForgotPassword && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">New Password</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6 || (isForgotPassword && (!newPassword || !confirmPassword))}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>{isForgotPassword ? 'Reset Password' : 'Verify & Login'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetToPasswordLogin}
                className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← Back to Password Login
              </button>
            </form>
          )}
        </div>
        <div className="max-w-md w-full">
          <CopyrightNotice />
        </div>
      </div>
    );
  }

  // ✅ NORMAL LOGIN SCREEN
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-900 to-primary-800 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-8 pb-6">
          <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
            <span className="text-white font-bold text-xl">HR</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500">Sign in to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
              <button
                type="button"
                onClick={() => setLoginMode('forgot')}
                className="text-xs text-accent-600 hover:text-accent-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-bold">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setLoginMode('otp'); setOtpEmail(email); }}
            disabled={loading}
            className="w-full bg-white border-2 border-blue-500 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            <Key size={18} />
            <span>Login with OTP</span>
          </button>
        </form>

        <div className="bg-gray-50 p-6 border-t border-gray-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Quick Login (Click to Fill)</p>
          <div className="flex gap-3">
            <button
              onClick={() => fillCredentials('admin')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-semibold"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500"></div> Admin
            </button>
            <button
              onClick={() => fillCredentials('manager')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-semibold"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Manager
            </button>
            <button
              onClick={() => fillCredentials('employee')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors text-sm font-semibold"
            >
              <div className="w-2 h-2 rounded-full bg-orange-500"></div> Employee
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-md w-full">
        <CopyrightNotice />
      </div>
    </div>
  );
};

export default Login;
