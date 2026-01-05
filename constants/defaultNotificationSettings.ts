// Default notification settings for HR Portal
// Add more as needed for new modules/features
import { NotificationSetting } from '../types';

export const defaultNotificationSettings: NotificationSetting[] = [
  // User/Account
  {
    id: 'notif-user-created',
    module: 'users',
    action: 'created',
    enabled: true,
    description: 'Notify when a new user account is created.'
  },
  {
    id: 'notif-user-updated',
    module: 'users',
    action: 'updated',
    enabled: true,
    description: 'Notify when a user account is updated.'
  },
  {
    id: 'notif-user-deleted',
    module: 'users',
    action: 'deleted',
    enabled: true,
    description: 'Notify when a user account is deleted.'
  },
  // Employee
  {
    id: 'notif-employee-added',
    module: 'employees',
    action: 'added',
    enabled: true,
    description: 'Notify when a new employee is added.'
  },
  {
    id: 'notif-employee-updated',
    module: 'employees',
    action: 'updated',
    enabled: true,
    description: 'Notify when an employee profile is updated.'
  },
  {
    id: 'notif-employee-terminated',
    module: 'employees',
    action: 'terminated',
    enabled: true,
    description: 'Notify when an employee is terminated.'
  },
  // Leave
  {
    id: 'notif-leave-applied',
    module: 'leaves',
    action: 'applied',
    enabled: true,
    description: 'Notify when a leave request is submitted.'
  },
  {
    id: 'notif-leave-approved',
    module: 'leaves',
    action: 'approved',
    enabled: true,
    description: 'Notify when a leave request is approved.'
  },
  {
    id: 'notif-leave-rejected',
    module: 'leaves',
    action: 'rejected',
    enabled: true,
    description: 'Notify when a leave request is rejected.'
  },
  // Payroll
  {
    id: 'notif-payroll-processed',
    module: 'payroll',
    action: 'processed',
    enabled: true,
    description: 'Notify when payroll is processed.'
  },
  {
    id: 'notif-payroll-paid',
    module: 'payroll',
    action: 'paid',
    enabled: true,
    description: 'Notify when salary is paid.'
  },
  // Reimbursement/Claims
  {
    id: 'notif-claim-submitted',
    module: 'reimbursements',
    action: 'submitted',
    enabled: true,
    description: 'Notify when a claim is submitted.'
  },
  {
    id: 'notif-claim-approved',
    module: 'reimbursements',
    action: 'approved',
    enabled: true,
    description: 'Notify when a claim is approved.'
  },
  {
    id: 'notif-claim-rejected',
    module: 'reimbursements',
    action: 'rejected',
    enabled: true,
    description: 'Notify when a claim is rejected.'
  },
  // Attendance
  {
    id: 'notif-attendance-marked',
    module: 'attendance',
    action: 'marked',
    enabled: true,
    description: 'Notify when attendance is marked.'
  },
  // Recruitment
  {
    id: 'notif-candidate-applied',
    module: 'recruitment',
    action: 'applied',
    enabled: true,
    description: 'Notify when a candidate applies for a job.'
  },
  {
    id: 'notif-candidate-hired',
    module: 'recruitment',
    action: 'hired',
    enabled: true,
    description: 'Notify when a candidate is hired.'
  },
  // System
  {
    id: 'notif-system-error',
    module: 'system',
    action: 'error',
    enabled: true,
    description: 'Notify when a system error occurs.'
  }
];
