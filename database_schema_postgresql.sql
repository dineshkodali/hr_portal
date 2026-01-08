-- ===========================================================================
-- NOTIFICATION SETTINGS TABLE
-- ===========================================================================
-- ============================================================================
-- FILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  size BIGINT,
  path VARCHAR(500),
  ownerId VARCHAR(50),
  category VARCHAR(50),
  uploadedBy VARCHAR(255),
  uploadedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_files_ownerId ON files(ownerId);
CREATE INDEX idx_files_category ON files(category);
-- Employee Management Portal - PostgreSQL Schema
-- This file contains all tables, indexes, and functions for the HR system

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'super_admin')),
  avatar VARCHAR(500),
  designation VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  branchIds TEXT[], -- Array of branch IDs
  linkedEmployeeId VARCHAR(50),
  accessModules TEXT[] DEFAULT ARRAY['dashboard'],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- EMPLOYEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) PRIMARY KEY,
  employeeId VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  designation VARCHAR(100),
  department VARCHAR(100),
  branchId VARCHAR(50),
  joinDate DATE,
  status VARCHAR(50) DEFAULT 'Active',
  salary DECIMAL(12, 2),
  avatar VARCHAR(500),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zipCode VARCHAR(20),
  country VARCHAR(100),
  emergencyContact VARCHAR(255),
  emergencyPhone VARCHAR(20),
  bankAccount VARCHAR(50),
  bankName VARCHAR(100),
  ifscCode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_branchId ON employees(branchId);
CREATE INDEX idx_employees_status ON employees(status);

-- ============================================================================
-- BRANCHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zipCode VARCHAR(20),
  country VARCHAR(100),
  managerIds TEXT[],
  employeeCount INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DEPARTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  managerIds TEXT[],
  employeeCount INT DEFAULT 0,
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_branchId ON departments(branchId);

-- ============================================================================
-- ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  description TEXT,
  serialNumber VARCHAR(100),
  assignedTo VARCHAR(50),
  assignedToName VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Available',
  purchaseDate DATE,
  purchaseCost DECIMAL(12, 2),
  branchId VARCHAR(50),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_assignedTo ON assets(assignedTo);
CREATE INDEX idx_assets_branchId ON assets(branchId);
CREATE INDEX idx_assets_status ON assets(status);

-- ============================================================================
-- ATTENDANCE RECORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(50) PRIMARY KEY,
  employeeId VARCHAR(50) NOT NULL,
  employeeName VARCHAR(255),
  employeeAvatar VARCHAR(500),
  date DATE NOT NULL,
  checkIn VARCHAR(50),
  checkOut VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Present',
  workHours VARCHAR(50),
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_employeeId ON attendance(employeeId);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_branchId ON attendance(branchId);

-- ============================================================================
-- TIMESHEETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS timesheets (
  id VARCHAR(50) PRIMARY KEY,
  employeeId VARCHAR(50) NOT NULL,
  employeeName VARCHAR(255),
  date DATE NOT NULL,
  clockIn TIMESTAMP,
  clockOut TIMESTAMP,
  duration INT, -- in minutes
  status VARCHAR(50) DEFAULT 'Working',
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timesheets_employeeId ON timesheets(employeeId);
CREATE INDEX idx_timesheets_date ON timesheets(date);
CREATE INDEX idx_timesheets_branchId ON timesheets(branchId);

-- ============================================================================
-- SHIFTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS shifts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  startTime TIME,
  endTime TIME,
  branchId VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shifts_branchId ON shifts(branchId);

-- ============================================================================
-- LEAVE REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaves (
  id VARCHAR(50) PRIMARY KEY,
  employeeId VARCHAR(50) NOT NULL,
  employeeName VARCHAR(255),
  leaveType VARCHAR(100),
  startDate DATE,
  endDate DATE,
  duration INT,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  approvedBy VARCHAR(255),
  approvedDate DATE,
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaves_employeeId ON leaves(employeeId);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_branchId ON leaves(branchId);

-- ============================================================================
-- JOBS TABLE (Recruitment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(100),
  location VARCHAR(255),
  salary_range VARCHAR(100),
  jobType VARCHAR(50),
  postedDate DATE,
  status VARCHAR(50) DEFAULT 'Open',
  branchId VARCHAR(50),
  createdBy VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_branchId ON jobs(branchId);

-- ============================================================================
-- CANDIDATES TABLE (Recruitment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  jobId VARCHAR(50),
  jobTitle VARCHAR(255),
  resume VARCHAR(500),
  coverLetter TEXT,
  status VARCHAR(50) DEFAULT 'Applied',
  appliedDate DATE,
  interviewDate DATE,
  interviewNotes TEXT,
  rating DECIMAL(3, 1),
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX idx_candidates_jobId ON candidates(jobId);
CREATE INDEX idx_candidates_status ON candidates(status);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignedTo VARCHAR(50),
  assignedToName VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Todo',
  priority VARCHAR(50) DEFAULT 'Medium',
  dueDate DATE,
  completedDate DATE,
  branchId VARCHAR(50),
  createdBy VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedTo) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_assignedTo ON tasks(assignedTo);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_branchId ON tasks(branchId);

-- ============================================================================
-- PAYROLL TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll (
  id VARCHAR(50) PRIMARY KEY,
  employeeId VARCHAR(50) NOT NULL,
  employeeName VARCHAR(255),
  month VARCHAR(7), -- YYYY-MM format
  baseSalary DECIMAL(12, 2),
  allowances DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  netSalary DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'Pending',
  paidDate DATE,
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payroll_employeeId ON payroll(employeeId);
CREATE INDEX idx_payroll_month ON payroll(month);
CREATE INDEX idx_payroll_branchId ON payroll(branchId);

-- ============================================================================
-- REIMBURSEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reimbursements (
  id VARCHAR(50) PRIMARY KEY,
  employeeId VARCHAR(50) NOT NULL,
  employeeName VARCHAR(255),
  amount DECIMAL(12, 2),
  category VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  submittedDate DATE,
  approvedDate DATE,
  approvedBy VARCHAR(255),
  receipt VARCHAR(500),
  branchId VARCHAR(50),
  custom_fields JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reimbursements_employeeId ON reimbursements(employeeId);
CREATE INDEX idx_reimbursements_status ON reimbursements(status);
CREATE INDEX idx_reimbursements_branchId ON reimbursements(branchId);

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50),
  userName VARCHAR(255),
  userRole VARCHAR(50),
  action VARCHAR(255),
  module VARCHAR(100),
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  branchId VARCHAR(50),
  ipAddress VARCHAR(45)
);

CREATE INDEX idx_logs_userId ON logs(userId);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_module ON logs(module);

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  members TEXT[],
  createdBy VARCHAR(50),
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_branchId ON groups(branchId);

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leaderId VARCHAR(50),
  leaderName VARCHAR(255),
  members TEXT[],
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leaderId) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_teams_leaderId ON teams(leaderId);
CREATE INDEX idx_teams_branchId ON teams(branchId);

-- ============================================================================
-- POLICY CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS policy_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- POLICIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS policies (
  id VARCHAR(50) PRIMARY KEY,
  categoryId VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  version INT DEFAULT 1,
  effectiveDate DATE,
  createdBy VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES policy_categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_policies_categoryId ON policies(categoryId);

-- ============================================================================
-- HOLIDAYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS holidays (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  type VARCHAR(50),
  branchId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_branchId ON holidays(branchId);

-- ============================================================================
-- SYSTEM CONFIG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  companyName VARCHAR(255),
  companyLogo VARCHAR(500),
  companyEmail VARCHAR(255),
  companyPhone VARCHAR(20),
  companyAddress TEXT,
  financialYearStart INT,
  defaultLeaveYear INT DEFAULT 20,
  workingDaysPerWeek INT DEFAULT 5,
  overtimeRate DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get employee attendance summary
CREATE OR REPLACE FUNCTION get_employee_attendance(
  p_employee_id VARCHAR,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_present INT,
  total_absent INT,
  total_halfday INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'Present')::INT as total_present,
    COUNT(*) FILTER (WHERE status = 'Absent')::INT as total_absent,
    COUNT(*) FILTER (WHERE status = 'Half Day')::INT as total_halfday
  FROM attendance
  WHERE employeeId = p_employee_id
    AND date >= p_start_date
    AND date <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate payroll
CREATE OR REPLACE FUNCTION calculate_payroll(
  p_employee_id VARCHAR,
  p_month VARCHAR
)
RETURNS DECIMAL AS $$
DECLARE
  v_base_salary DECIMAL;
  v_attendance_days INT;
  v_calculated_salary DECIMAL;
BEGIN
  SELECT salary INTO v_base_salary FROM employees WHERE id = p_employee_id;
  
  -- Count present days in the month
  SELECT COUNT(*) INTO v_attendance_days
  FROM attendance
  WHERE employeeId = p_employee_id
    AND date >= (p_month || '-01')::DATE
    AND date <= ((p_month || '-01')::DATE + INTERVAL '1 month' - INTERVAL '1 day');
  
  v_calculated_salary := (v_base_salary / 30) * COALESCE(v_attendance_days, 0);
  
  RETURN v_calculated_salary;
END;
$$ LANGUAGE plpgsql;

-- Function to update employee updated_at timestamp
CREATE OR REPLACE FUNCTION update_employee_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for employees table
CREATE TRIGGER employees_update_timestamp
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_employee_timestamp();

-- Similar triggers for other tables
CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_employee_timestamp();

CREATE TRIGGER timesheets_update_timestamp
BEFORE UPDATE ON timesheets
FOR EACH ROW
EXECUTE FUNCTION update_employee_timestamp();

CREATE TRIGGER leaves_update_timestamp
BEFORE UPDATE ON leaves
FOR EACH ROW
EXECUTE FUNCTION update_employee_timestamp();

CREATE TRIGGER payroll_update_timestamp
BEFORE UPDATE ON payroll
FOR EACH ROW
EXECUTE FUNCTION update_employee_timestamp();

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Sample Users
INSERT INTO users (id, name, email, role, avatar, designation, status, branchIds, linkedEmployeeId, accessModules)
VALUES
  ('u-1', 'Admin User', 'admin@company.com', 'super_admin', '', 'HR Manager', 'Active', ARRAY['b-1', 'b-2'], NULL, ARRAY['dashboard', 'employees', 'recruitment', 'payroll', 'settings', 'logs']),
  ('u-2', 'John Manager', 'manager@company.com', 'manager', '', 'Branch Manager', 'Active', ARRAY['b-1'], 'e-1', ARRAY['dashboard', 'employees', 'attendance', 'payroll', 'tasks']),
  ('u-3', 'Employee One', 'emp1@company.com', 'employee', '', 'Software Engineer', 'Active', ARRAY['b-1'], 'e-2', ARRAY['dashboard', 'attendance', 'payroll', 'tasks', 'files', 'teams'])
ON CONFLICT DO NOTHING;

-- Sample Branches
INSERT INTO branches (id, name, location, city, state, zipCode, country, managerIds, employeeCount)
VALUES
  ('b-1', 'Main Office', '123 Business St', 'San Francisco', 'CA', '94105', 'USA', ARRAY['u-2'], 50),
  ('b-2', 'Branch Office', '456 Corporate Ave', 'New York', 'NY', '10001', 'USA', ARRAY['u-4'], 30)
ON CONFLICT DO NOTHING;

-- Sample Employees
INSERT INTO employees (id, name, email, phone, designation, department, branchId, joinDate, status, salary, avatar, city, state, country)
VALUES
  ('e-1', 'John Manager', 'john.manager@company.com', '555-0001', 'Branch Manager', 'Management', 'b-1', '2020-01-15', 'Active', 75000, '', 'San Francisco', 'CA', 'USA'),
  ('e-2', 'Software Developer', 'dev@company.com', '555-0002', 'Software Engineer', 'Engineering', 'b-1', '2021-03-20', 'Active', 85000, '', 'San Francisco', 'CA', 'USA'),
  ('e-3', 'HR Officer', 'hr@company.com', '555-0003', 'HR Specialist', 'Human Resources', 'b-1', '2019-06-10', 'Active', 65000, '', 'San Francisco', 'CA', 'USA')
ON CONFLICT DO NOTHING;

-- Sample System Config
INSERT INTO system_config (id, companyName, companyEmail, companyPhone, companyAddress, financialYearStart, defaultLeaveYear, workingDaysPerWeek)
VALUES
  ('default', 'ABC Corporation', 'contact@company.com', '+1-800-COMPANY', '123 Business St, San Francisco, CA 94105', 4, 20, 5)
ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- MFA & SECURITY TABLES
-- ============================================================================

-- Two-Factor Authentication (TOTP) Setup
CREATE TABLE IF NOT EXISTS user_totp (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL UNIQUE,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  setupDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verifiedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_totp_userId ON user_totp(userId);

-- Trusted Devices (for MFA device management)
CREATE TABLE IF NOT EXISTS trusted_devices (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  deviceName VARCHAR(255),
  deviceType VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  ipAddress VARCHAR(45),
  deviceFingerprint VARCHAR(255),
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastUsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revokedAt TIMESTAMP,
  isCurrentDevice BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trusted_devices_userId ON trusted_devices(userId);
CREATE INDEX idx_trusted_devices_fingerprint ON trusted_devices(deviceFingerprint);
CREATE INDEX idx_trusted_devices_revoked ON trusted_devices(revokedAt);

-- MFA Login Logs (for security audit trail)
CREATE TABLE IF NOT EXISTS mfa_logs (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  deviceId VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ipAddress VARCHAR(45),
  browser VARCHAR(100),
  os VARCHAR(100),
  device VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('success', 'failed', 'compromised')),
  loginAttempt VARCHAR(500),
  loginSource VARCHAR(50) CHECK (loginSource IN ('password', 'mfa', 'otp')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deviceId) REFERENCES trusted_devices(id) ON DELETE SET NULL
);

CREATE INDEX idx_mfa_logs_userId ON mfa_logs(userId);
CREATE INDEX idx_mfa_logs_timestamp ON mfa_logs(timestamp);
CREATE INDEX idx_mfa_logs_status ON mfa_logs(status);

-- OTP (One-Time Password) for Login
CREATE TABLE IF NOT EXISTS user_otp (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  otpCode VARCHAR(10) NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  purpose VARCHAR(50) CHECK (purpose IN ('login', 'password_reset', 'verification')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_otp_email ON user_otp(email);
CREATE INDEX idx_user_otp_userId ON user_otp(userId);
CREATE INDEX idx_user_otp_expires ON user_otp(expiresAt);
CREATE INDEX idx_user_otp_verified ON user_otp(verified);

-- Security Settings for Users
CREATE TABLE IF NOT EXISTS user_security_settings (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL UNIQUE,
  totpEnabled BOOLEAN DEFAULT FALSE,
  otpEnabled BOOLEAN DEFAULT FALSE,
  backupCodesUsed INT DEFAULT 0,
  lastSecurityCheck TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_security_settings_userId ON user_security_settings(userId);

-- ============================================================================
-- PERMISSION GROUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS permission_groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permission_groups_name ON permission_groups(name);

-- NOTIFICATION SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notificationsettings (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  type VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  channel VARCHAR(50) DEFAULT 'email', -- e.g., email, sms, push
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificationsettings_userId ON notificationsettings(userId);
CREATE INDEX idx_notificationsettings_type ON notificationsettings(type);
-- ============================================================================
-- EMAILS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS emails (
  id VARCHAR(50) PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  status VARCHAR(20) DEFAULT 'unread', -- unread, read, sent
  type VARCHAR(20) DEFAULT 'inbound', -- inbound, outbound
  folder VARCHAR(20) DEFAULT 'inbox', -- inbox, sent, drafts, trash
  has_attachments BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_attachments (
  id VARCHAR(50) PRIMARY KEY,
  email_id VARCHAR(50) REFERENCES emails(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emails_sender ON emails(sender);
CREATE INDEX idx_emails_recipient ON emails(recipient);
CREATE INDEX idx_emails_type ON emails(type);
CREATE INDEX idx_emails_folder ON emails(folder);
CREATE INDEX idx_attachments_email_id ON email_attachments(email_id);

-- ============================================================================
-- EMAIL_RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_rules (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  condition_type VARCHAR(50) NOT NULL, -- e.g., 'sender_domain', 'subject_contains'
  condition_value TEXT NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- e.g., 'move_to_folder', 'auto_draft'
  action_value VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- USER_OUTLOOK_TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_outlook_tokens (
  userId VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  token_type VARCHAR(50),
  expires_at TIMESTAMP,
  scope TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- OUTLOOK_CONFIG TABLE (GLOBAL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS outlook_config (
  id VARCHAR(50) PRIMARY KEY, -- 'global'
  clientId TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  clientSecret TEXT NOT NULL,
  organizationName VARCHAR(255),
  organizationId VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;
