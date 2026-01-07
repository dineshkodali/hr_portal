// Feature toggles for HR Portal
// Only editable by super admin
export interface FeatureToggle {
  key: string;
  label: string;
  enabled: boolean;
  description?: string;
}

export const defaultFeatureToggles: FeatureToggle[] = [
  { key: 'attendance', label: 'Attendance', enabled: true, description: 'Enable attendance tracking module.' },
  { key: 'payroll', label: 'Payroll', enabled: true, description: 'Enable payroll management module.' },
  { key: 'recruitment', label: 'Recruitment', enabled: true, description: 'Enable recruitment module.' },
  { key: 'leave', label: 'Leave Management', enabled: true, description: 'Enable leave management module.' },
  { key: 'assets', label: 'Asset Management', enabled: true, description: 'Enable asset management module.' },
  { key: 'aihr', label: 'AI HR Assistant', enabled: true, description: 'Enable AI HR Assistant chat.' },
  { key: 'reports', label: 'Reports', enabled: true, description: 'Enable reports and analytics.' },
  { key: 'handbook', label: 'Handbook', enabled: true, description: 'Enable employee handbook.' },
  { key: 'filemanager', label: 'File Manager', enabled: true, description: 'Enable file/document manager.' },
  // Add more as needed
];
