
import React from 'react';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'hr' | 'finance' | 'team_lead' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  designation: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
  branchIds?: string[];
  accessModules?: string[];
  address?: string;
  password?: string;
  linkedEmployeeId?: string;
  documents?: { name: string; date: string; size: string }[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  memberIds: string[];
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  location?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
  currency: string;
  managerids?: string[];
  managerName?: string;
  documents?: string[];
}

export interface Team {
  id: string;
  name: string;
  leaderid: string;
  leadername: string;
  members: string[];
  description: string;
  projectFocus?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  branchId?: string;
}

export interface SalaryStructure {
  basic: number;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowances: number;
  pf: number;
  esi: number;
  tds: number;
  professionalTax: number;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
}

export interface ComplianceDetails {
  niNumber?: string;
  taxCode?: string;
  shareCode?: string;
  p45Status?: 'Submitted' | 'Pending' | 'Not Applicable';
  p60Status?: 'Issued' | 'Pending' | 'Not Applicable';
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
  avatar: string;
  phone?: string;
  location?: string;
  branchid?: string;
  salaryStructure?: SalaryStructure;
  bankDetails?: BankDetails;
  complianceDetails?: ComplianceDetails;
}

export type EmployeeUpdatePayload = {
  id: string;               // PK is required
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  status?: 'Active' | 'On Leave' | 'Terminated';
  employeeid?: string;      // business ID
  branchid?: string;
  joindate?: string;
  avatar?: string | null;
};


export interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
  location: string;
  status: 'Active' | 'Inactive';
}

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

export interface LeaveRequest {
  id: string;
  employeeName?: string;
  employeeAvatar?: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  attachment?: string;
  appliedDate?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  jobtype: string;
  postedDate: string;
  status: 'Active' | 'Closed' | 'Draft';
  // applicants: number;
  description?: string;
  jdFile?: string;
  // hiringManager?: string;
}

export interface OfferDetails {
  salary: number;
  joiningDate: string;
  terms: string;
  generatedAt: string;
  acceptedAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  appliedFor: string;
  appliedDate: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired';
  resumeUrl?: string;
  offerDetails?: OfferDetails;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  serialnumber: string;
  assignedto?: string;
  purchasedate: string;
  status: 'Available' | 'Assigned' | 'Under Repair' | 'Retired';
  // condition: 'New' | 'Good' | 'Fair' | 'Poor';
  image?: string;
  branchId?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'img' | 'xls' | 'folder';
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  category: 'Company' | 'Personal';
  ownerId?: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskComment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  date: string;
}

export interface TaskHistory {
  id: string;
  user: string;
  action: string;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar: string;
  team?: string[];
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  attachments?: string[];
  comments?: TaskComment[];
  history?: TaskHistory[];
}

export interface RolePermission {
  id: string;
  role?: UserRole;
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId?: string;
  employeeName: string;
  employeeAvatar: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  workHours: string;
  overtime?: string;
  location?: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  duration: number;
  status: 'Working' | 'Pending' | 'Approved' | 'Rejected' | 'Overtime' | 'Completed';
  description?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  assignedCount: number;
}

export interface PayrollBreakdown {
  hra: number;
  conveyance: number;
  medical: number;
  special: number;
  overtime: number;
  grossEarnings: number;
  pf: number;
  esi: number;
  tds: number;
  pt: number;
  lop: number;
  totalDeductions: number;
  totalReimbursements?: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Pending' | 'Paid';
  paymentDate?: string;
  payableDays: number;
  workingHours?: number;
  lopDays?: number;
  adhocBonus?: number;
  adhocDeduction?: number;
  breakdown: PayrollBreakdown;
}

export interface Reimbursement {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Travel' | 'Food' | 'Medical' | 'Office Supplies' | 'Other';
  date: string;
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid' | 'Info Requested';
  attachment?: string;
  adminComments?: string;
}

export interface PayrollModificationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Tax Code' | 'Bank Details' | 'Other';
  description: string;
  status: 'Pending' | 'Resolved';
  date: string;
}

export interface NotificationSetting {
  id: string;
  module: string;
  action: string;
  enabled: boolean;
  description: string;
  type?: string; // Added for backend compatibility
  userId?: string; // Added for backend compatibility
}

export interface SystemConfig {
  assetCategories: string[];
  jobTypes: string[];
  leaveTypes: string[];
  departments: string[];
  designations: string[];
  portalSettings: {
    allowEmployeeProfileEdit: boolean;
    allowEmployeePhotoUpload: boolean;
    allowEmployeeAddressEdit: boolean;
    allowEmployeeBankEdit: boolean;
  }
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface SmtpSettings {
  host: string;
  port: string;
  user: string;
  pass: string;
  fromEmail: string;
}

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'trash';

export interface EmailAttachment {
  id: string;
  email_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface Email {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'unread' | 'read' | 'sent';
  type: 'inbound' | 'outbound';
  folder: EmailFolder;
  has_attachments: boolean;
  attachments?: EmailAttachment[];
  created_at: string;
  updated_at: string;
}

export interface PolicyCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface PolicyDocument {
  id: string;
  categoryId: string;
  title: string;
  content?: string;
  fileUrl?: string;
  lastUpdated: string;
  version: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'Public' | 'Company';
  description: string;
}

export interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  employees: Employee[];
  tasks: Task[];
  leaves: LeaveRequest[];
  jobs: Job[];
  selectedBranch: Branch | 'all';
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
}

export interface EmployeeListProps {
  user: User;
  users?: User[];
  branches?: Branch[];
  employees: Employee[];
  assets: Asset[];
  timesheets: Timesheet[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  departments: Department[];
  payrollRecords: PayrollRecord[];
  reimbursements: Reimbursement[];
  systemConfig: SystemConfig;
  selectedBranch: Branch | 'all';
  onAddEmployee: () => void;
  onUpdateEmployee: (emp: EmployeeUpdatePayload) => void;
  onDeleteEmployee: (id: string) => void;
  onAddDepartment: (dept: Department) => void;
  onUpdateDepartment: (dept: Department) => void;
  onDeleteDepartment: (id: string) => void;
  onUpdateLeave: (leave: LeaveRequest) => void;
  targetEmployeeId?: string | null;
  onClearTargetEmployee?: () => void;
  onUpdateAsset?: (asset: Asset) => void;
  policyCategories: PolicyCategory[];
  policies: PolicyDocument[];
  holidays: Holiday[];
  onAddCategory: (category: PolicyCategory) => void;
  onUpdateCategory: (category: PolicyCategory) => void;
  onDeleteCategory: (id: string) => void;
  onAddPolicy: (policy: PolicyDocument) => void;
  onUpdatePolicy: (policy: PolicyDocument) => void;
  onDeletePolicy: (id: string) => void;
  onAddHoliday: (holiday: Holiday) => void;
  onUpdateHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIChatProps {
  user: User;
  employees: Employee[];
  tasks: Task[];
  leaves: LeaveRequest[];
  holidays: Holiday[];
  policies: PolicyDocument[];
  onNavigate: (view: ViewState) => void;
}

export interface AttendanceProps {
  user: User;
  records: AttendanceRecord[];
  timesheets: Timesheet[];
  shifts: Shift[];
  leaves: LeaveRequest[];
  onAddRecord: (record: AttendanceRecord) => void;
  onUpdateRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateTimesheet: (ts: Timesheet) => void;
  onDeleteTimesheet: (id: string) => void;
  onAddShift: (shift: Shift) => void;
  onUpdateShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
  onUpdateLeave: (leave: LeaveRequest) => void;
  onAddLeave: (leave: LeaveRequest) => void;
}

export interface AssetManagementProps {
  user: User;
  assets: Asset[];
  employees: Employee[];
  branches: Branch[];
  systemConfig: SystemConfig;
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

export interface TeamManagementProps {
  teams: Team[];
  employees: Employee[];
  onAddTeam: (team: Team) => void;
  onUpdateTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
}

export interface HandbookProps {
  user: User;
  categories: PolicyCategory[];
  policies: PolicyDocument[];
  onAddCategory: (category: PolicyCategory) => void;
  onUpdateCategory: (category: PolicyCategory) => void;
  onDeleteCategory: (id: string) => void;
  onAddPolicy: (policy: PolicyDocument) => void;
  onUpdatePolicy: (policy: PolicyDocument) => void;
  onDeletePolicy: (id: string) => void;
}

export interface HolidayCalendarProps {
  user: User;
  holidays: Holiday[];
  onAddHoliday: (holiday: Holiday) => void;
  onUpdateHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
  onApplyLeave?: () => void;
}

export interface SettingsProps {
  user: User;
  users: User[];
  branches: Branch[];
  employees: Employee[];
  assets: Asset[];
  groups: Group[];
  onAddGroup: (group: Group) => void;
  onUpdateGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (id: string) => void;
  onUpdateEmployee?: (emp: Employee) => void;
  onUpdateAsset?: (asset: Asset) => void;
  onDeleteAsset?: (id: string) => void;
  onAddUser?: (u: User) => void;
  onDeleteUser?: (id: string) => void;
  onUpdateUser?: (u: User) => void;
  systemConfig: SystemConfig;
  setSystemConfig: (config: SystemConfig) => void;
  emailTemplates: EmailTemplate[];
  setEmailTemplates: (templates: EmailTemplate[]) => void;
  smtpSettings: SmtpSettings;
  setSmtpSettings: (settings: SmtpSettings) => void;
  notificationSettings: NotificationSetting[];
  setNotificationSettings: (settings: NotificationSetting[]) => void;
  onNavigate?: (view: ViewState) => void;
  onSelectBranch?: (id: string) => void;
  onViewEmployee?: (id: string) => void;
  leaves?: LeaveRequest[];
  reimbursements?: Reimbursement[];
}

export interface DepartmentsProps {
  departments: Department[];
  employees: Employee[];
  branches: Branch[];
  onAddDepartment: (dept: Department) => void;
  onUpdateDepartment: (dept: Department) => void;
  onDeleteDepartment: (id: string) => void;
}

export interface PayrollProps {
  user: User;
  payrollRecords: PayrollRecord[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  timesheets: Timesheet[];
  reimbursements: Reimbursement[];
  onAddPayroll: (record: PayrollRecord) => void;
  onUpdatePayroll: (record: PayrollRecord) => void;
  onDeletePayroll: (id: string) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onAddReimbursement: (reimbursement: Reimbursement) => void;
  onUpdateReimbursement: (reimbursement: Reimbursement) => void;
  onDeleteReimbursement: (id: string) => void;
}

export type ViewState = 'dashboard' | 'employees' | 'teams' | 'add-employee' | 'assets' | 'files' | 'tasks' | 'recruitment' | 'attendance' | 'payroll' | 'settings' | 'logs' | 'handbook' | 'holidays' | 'reports' | 'email';
