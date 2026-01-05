

import { Employee, AttendanceRecord, Asset } from '../types';

/**
 * POSTGRESQL DATABASE CONTEXT:
 * The backend API communicates with PostgreSQL through Express.js server
 * All data is stored in PostgreSQL instead of Firebase
 */

const getApiUrl = () => {
    // In Replit environment, use relative path or same-host API
    // The backend API can be accessed via the current host
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Try to detect if we're on Replit or localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development - try both ports
        return 'http://localhost:3001/api';
    }
    
    // Replit environment - use same host for API calls
    // This works when backend runs alongside frontend
    return `${protocol}//${hostname}:3001/api`;
};

export const api = {
    // Notification Settings
    getNotificationSettings: async (userId: string) => {
      const res = await fetch(`${getApiUrl()}/notificationsettings?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to fetch notification settings');
      return res.json();
    },

    createNotificationSetting: async (data: any) => {
      const res = await fetch(`${getApiUrl()}/notificationsettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create notification setting');
      return res.json();
    },

    updateNotificationSetting: async (id: string, data: any) => {
      const res = await fetch(`${getApiUrl()}/notificationsettings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update notification setting');
      return res.json();
    },

    deleteNotificationSetting: async (id: string) => {
      const res = await fetch(`${getApiUrl()}/notificationsettings/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete notification setting');
      return res.json();
    },
  get: async (endpoint: string) => {
    const res = await fetch(`${getApiUrl()}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  },

  create: async (endpoint: string, data: any) => {
    const res = await fetch(`${getApiUrl()}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Server error creating ${endpoint}:`, errorBody);
      throw new Error(`Failed to create ${endpoint}: ${errorBody}`);
    }
    return res.json();
  },

  update: async (endpoint: string, id: string, data: any) => {
    const res = await fetch(`${getApiUrl()}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Server error updating ${endpoint}/${id}:`, errorBody);
      throw new Error(`Failed to update ${endpoint}: ${errorBody}`);
    }
    return res.json();
  },

  delete: async (endpoint: string, id: string) => {
    const res = await fetch(`${getApiUrl()}/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Server error deleting ${endpoint}/${id}:`, errorBody);
      throw new Error(`Failed to delete ${endpoint}: ${errorBody}`);
    }
    return res.json();
  },

  // Specialized helpers
  getEmployees: async (): Promise<Employee[]> => {
    const res = await fetch(`${getApiUrl()}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  // Health Check for the PostgreSQL bridge
  checkConnection: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${getApiUrl()}/health`, { 
          signal: controller.signal,
          method: 'GET' 
      });
      clearTimeout(timeoutId);
      return res.status === 200;
    } catch (e) {
      return false;
    }
  },

  // 2FA Endpoints
  setupTotp: async (userId: string) => {
    const res = await fetch(`${getApiUrl()}/auth/totp/setup/${userId}`);
    if (!res.ok) throw new Error('Failed to setup TOTP');
    return res.json();
  },

  verifyTotp: async (userId: string, code: string, deviceName: string, deviceMetadata?: any) => {
    const res = await fetch(`${getApiUrl()}/auth/totp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code, deviceName, ...deviceMetadata })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Verification failed');
    }
    return res.json();
  },

  disableTotp: async (userId: string) => {
    const res = await fetch(`${getApiUrl()}/auth/totp/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to disable TOTP');
    return res.json();
  },

  getTrustedDevices: async (userId: string) => {
    const res = await fetch(`${getApiUrl()}/auth/trusted-devices/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  revokeTrustedDevice: async (userId: string, deviceId: string) => {
    const res = await fetch(`${getApiUrl()}/auth/device/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, deviceId })
    });
    if (!res.ok) throw new Error('Failed to revoke device');
    return res.json();
  },

  getMFALogs: async (userId: string) => {
    const res = await fetch(`${getApiUrl()}/auth/mfa-logs/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch MFA logs');
    return res.json();
  },

  getSecuritySettings: async (userId: string) => {
    const res = await fetch(`${getApiUrl()}/auth/security-settings/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch security settings');
    return res.json();
  },

  updateSecuritySettings: async (userId: string, settings: any) => {
    const res = await fetch(`${getApiUrl()}/auth/security-settings/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update security settings');
    return res.json();
  }
};