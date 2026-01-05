# Employee Management Portal - Complete Documentation

> **Project:** HR Management System (Employee Management Portal)  
> **Tech Stack:** React + TypeScript (Frontend) | Express.js + PostgreSQL (Backend)  
> **Architecture:** Full-Stack Web Application with REST API  
> **Date:** January 4, 2026

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Technology Stack](#technology-stack)
3. [Data Model & Database Schema](#data-model--database-schema)
4. [Features & Modules](#features--modules)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Application Flow](#application-flow)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Security & Authentication](#security--authentication)
10. [Setup & Deployment](#setup--deployment)

---

## Overview & Architecture

### System Purpose
The Employee Management Portal is a comprehensive HR management system designed to handle all aspects of employee lifecycle management, from recruitment to payroll, attendance tracking, asset management, and more.

### Architecture Pattern
- **Frontend:** Single Page Application (SPA) using React with TypeScript
- **Backend:** RESTful API built with Express.js
- **Database:** PostgreSQL with comprehensive schema including indexes and functions
- **State Management:** React hooks with REST API integration
- **File Storage:** Local filesystem for uploads (documents, receipts, attachments)

### Key Design Principles
1. **Role-Based Access Control (RBAC)** - Different views and permissions based on user roles
2. **Multi-Branch Support** - Organization can have multiple branches with isolated data
3. **Real-Time Updates** - API-driven data refresh for live updates
4. **Offline/Demo Mode** - Fallback mode when backend is unavailable
5. **Modular Architecture** - Each feature is a separate component/module

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.8.2
- **Build Tool:** Vite 6.4.1
- **UI Components:** Custom components with Lucide React icons
- **Charts:** Recharts 2.12.3 for data visualization
- **Styling:** Tailwind CSS (utility-first CSS framework)

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5.2.1
- **Database Driver:** pg (node-postgres) 8.16.3
- **Authentication:** bcryptjs 2.4.3, jsonwebtoken 9.0.3, speakeasy 2.0.0 (for 2FA)
- **File Upload:** Multer 2.0.2
- **Email:** Nodemailer 7.0.12
- **Other:** CORS, body-parser, dotenv

### Database
- **DBMS:** PostgreSQL (version 12+)
- **Schema:** 20+ tables with proper indexing and foreign keys
- **Functions:** Custom PL/pgSQL functions for calculations

### External Services
- **Google Gemini AI:** @google/genai 1.34.0 (for AI-powered features)

---

## Data Model & Database Schema

### Core Tables

#### 1. **users** - System Users/Login Accounts
```sql
Fields: id, name, email, password_hash, role, avatar, designation, status, 
        branchIds[], linkedEmployeeId, accessModules[], created_at, updated_at
Roles: super_admin, admin, manager, hr, finance, team_lead, employee
```
Stores login credentials and access control information. Each user can be linked to an employee record.

#### 2. **employees** - Employee Master Data
```sql
Fields: id, name, email, phone, designation, department, branchId, joinDate,
        status, salary, avatar, address, city, state, zipCode, country,
        emergencyContact, emergencyPhone, bankAccount, bankName, ifscCode
```
Complete employee information including personal, contact, and bank details.

#### 3. **branches** - Organization Branches/Locations
```sql
Fields: id, name, location, city, state, zipCode, country, 
        managerIds[], employeeCount
```
Multi-branch support for organizations with multiple locations.

#### 4. **departments** - Department Structure
```sql
Fields: id, name, description, managerIds[], employeeCount, branchId
```
Organizational departments with hierarchy.

#### 5. **attendance** - Daily Attendance Records
```sql
Fields: id, employeeId, employeeName, employeeAvatar, date, checkIn, checkOut,
        status (Present/Absent/Late/Half Day/On Leave), workHours, branchId
```
Track daily employee attendance with check-in/check-out times.

#### 6. **timesheets** - Detailed Time Tracking
```sql
Fields: id, employeeId, employeeName, date, clockIn, clockOut, 
        duration (minutes), status, branchId
```
More granular time tracking than attendance for project/task-based work.

#### 7. **shifts** - Shift Management
```sql
Fields: id, name, startTime, endTime, branchId, description
```
Define working shifts for different employee groups.

#### 8. **leaves** - Leave/Time-Off Requests
```sql
Fields: id, employeeId, employeeName, leaveType, startDate, endDate, duration,
        reason, status (Pending/Approved/Rejected), approvedBy, approvedDate, branchId
```
Leave management with approval workflow.

#### 9. **jobs** - Job Openings (Recruitment)
```sql
Fields: id, title, description, department, location, salary_range, jobType,
        postedDate, status (Open/Closed/Draft), branchId, createdBy
```
Job posting management for recruitment module.

#### 10. **candidates** - Job Applicants
```sql
Fields: id, name, email, phone, jobId, jobTitle, resume, coverLetter,
        status (Applied/Screening/Interview/Offered/Hired), appliedDate,
        interviewDate, interviewNotes, rating, branchId
```
Candidate tracking through recruitment pipeline.

#### 11. **tasks** - Task Management
```sql
Fields: id, title, description, assignedTo, assignedToName, 
        status (Todo/In Progress/Review/Done), priority, dueDate, 
        completedDate, branchId, createdBy
```
Project and task assignment with status tracking.

#### 12. **assets** - Company Assets
```sql
Fields: id, name, type, description, serialNumber, assignedTo, assignedToName,
        status (Available/Assigned/Under Repair/Retired), purchaseDate,
        purchaseCost, branchId, location
```
IT assets, equipment, and resource management.

#### 13. **payroll** - Payroll Records
```sql
Fields: id, employeeId, employeeName, month (YYYY-MM), baseSalary, allowances,
        deductions, tax, netSalary, status (Pending/Paid), paidDate, branchId
```
Monthly payroll processing and payment tracking.

#### 14. **reimbursements** - Expense Claims
```sql
Fields: id, employeeId, employeeName, amount, category, description,
        status (Pending/Approved/Rejected/Paid), submittedDate, approvedDate,
        approvedBy, receipt, branchId, custom_fields (JSONB)
```
Employee expense reimbursement workflow with file attachments.

#### 15. **files** - Document Management
```sql
Fields: id, name, type, size, path, ownerId, category (Company/Personal),
        uploadedBy, uploadedDate
```
Centralized file storage and management.

#### 16. **logs** - Activity/Audit Logs
```sql
Fields: id, userId, userName, userRole, action, module, details, timestamp,
        branchId, ipAddress
```
Complete audit trail of all system activities.

#### 17. **teams** - Team Structure
```sql
Fields: id, name, description, leaderId, leaderName, members[], branchId
```
Team organization and member management.

#### 18. **groups** - User Groups
```sql
Fields: id, name, description, members[], createdBy, branchId
```
Group employees for permissions and communication.

#### 19. **policies** - Company Policies
```sql
Fields: id, categoryId, title, content, version, effectiveDate, createdBy
Related: policy_categories (id, name, description)
```
Store company policies and handbook content.

#### 20. **holidays** - Holiday Calendar
```sql
Fields: id, name, date, description, type, branchId
```
Company holiday management for leave calculations.

#### 21. **system_config** - System Settings
```sql
Fields: id, companyName, companyLogo, companyEmail, companyPhone, companyAddress,
        financialYearStart, defaultLeaveYear, workingDaysPerWeek, overtimeRate
```
Global system configuration.

### Security Tables

#### 22. **user_security_settings** - 2FA/MFA Settings
```sql
Fields: userId, totpEnabled, totpSecret, backupCodes[], 
        smsEnabled, smsNumber, emailEnabled
```

#### 23. **mfa_logs** - Authentication Logs
```sql
Fields: id, userId, timestamp, status, loginAttempt, loginSource, 
        ipAddress, browser, os, device
```

### Database Functions

#### get_employee_attendance()
Calculates attendance summary for an employee in a date range.
```sql
Returns: total_present, total_absent, total_halfday
```

#### calculate_payroll()
Calculates monthly payroll based on attendance and salary structure.

---

## Features & Modules

### 1. **Dashboard** 📊
**Component:** `Dashboard.tsx`

**Features:**
- Overview statistics (Active Employees, Open Positions, Pending Tasks, Leave Requests)
- Attendance charts and visualizations
- Recent hires list
- Quick actions for common tasks
- Task management board with drag-and-drop
- Real-time data refresh

**Data Displayed:**
- Employee count by status
- Attendance trends (weekly/monthly charts using Recharts)
- Task distribution by status
- Leave requests awaiting approval

**User Actions:**
- Navigate to detailed views
- View/Edit/Delete tasks
- Quick status updates on tasks
- Filter charts by department/date range

---

### 2. **Employee Management** 👥
**Components:** `EmployeeList.tsx`, `AddEmployee.tsx`

**Features:**

#### Employee List
- Searchable and filterable employee directory
- Grid and list view options
- Employee status indicators (Active, On Leave, Terminated)
- Quick actions (View Profile, Edit, Transfer Branch, Delete)
- Export functionality
- Bulk operations support

#### Employee Profile Modal
- Multi-tab interface:
  - **Personal:** Basic info, contact details, address
  - **Professional:** Designation, department, joining date, salary
  - **Bank:** Account details for payroll
  - **Compliance:** Tax codes, NI numbers, P45/P60 status
  - **Documents:** Upload and manage employee documents

#### Add/Edit Employee
- Comprehensive form with validation
- Profile photo upload
- Branch assignment
- Department and designation selection
- Salary structure configuration
- Bank details capture
- Emergency contact information

**Employee Data Structure:**
```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  branchId?: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
  salary: number;
  avatar: string;
  address: string;
  bankDetails: { accountName, accountNumber, bankName, sortCode };
  complianceDetails: { niNumber, taxCode, p45Status, p60Status };
}
```

---

### 3. **Attendance Management** ⏰
**Component:** `Attendance.tsx`

**Features:**
- Daily attendance marking
- Bulk attendance entry
- Check-in/Check-out time tracking
- Status options: Present, Absent, Late, Half Day, On Leave
- Work hours calculation
- Overtime tracking
- Attendance reports and analytics
- Calendar view of attendance
- Filter by employee, date range, status
- Export attendance sheets

**Workflow:**
1. HR/Admin marks attendance daily
2. System calculates work hours based on check-in/out
3. Late arrivals flagged automatically
4. Integration with leave management
5. Monthly attendance summary for payroll

---

### 4. **Leave Management** 🏖️
**Component:** `LeaveManagement.tsx`

**Features:**

#### Leave Balance Tracking
- Multiple leave types (Casual, Sick, Annual, etc.)
- Per-employee leave balance display
- Visual progress bars for utilization
- Configurable leave quotas

#### Leave Request Workflow
1. Employee applies for leave with reason
2. Manager/HR receives notification
3. Approval/Rejection with comments
4. Automatic calendar update
5. Leave balance deduction

**Leave Request Fields:**
- Employee name and ID
- Leave type
- Start and end dates
- Number of days (calculated)
- Reason/Description
- Status (Pending/Approved/Rejected/Cancelled)
- Attachment support (medical certificates, etc.)

**Leave Types Configuration:**
- Casual Leave: 12 days/year
- Sick Leave: 7 days/year
- Annual Leave: 20 days/year
- Maternity/Paternity Leave
- Unpaid Leave

---

### 5. **Recruitment** 🎯
**Component:** `Recruitment.tsx`

**Features:**

#### Job Management
- Create job postings with detailed descriptions
- Upload JD (Job Description) files
- Set job type (Full-Time, Part-Time, Contract, Internship)
- Location and department assignment
- Salary range specification
- Status management (Active, Closed, Draft)

#### Candidate Pipeline
- Application tracking system (ATS)
- Candidate stages:
  - Applied → Screening → Interview → Offered → Hired
- Resume upload and storage
- Interview scheduling
- Notes and ratings for each candidate
- Email communication integration
- Offer letter generation

**Recruitment Flow:**
```
Post Job → Receive Applications → Screen Resumes → 
Schedule Interviews → Evaluate → Make Offer → Hire
```

**Data Tracking:**
- Application source
- Time in each stage
- Hiring manager assigned
- Interview panel members
- Offer details (salary, joining date, terms)

---

### 6. **Asset Management** 💻
**Component:** `AssetManagement.tsx`

**Features:**
- IT assets and equipment inventory
- Asset assignment to employees
- Asset lifecycle tracking:
  - Available → Assigned → Under Repair → Retired
- Serial number tracking
- Purchase date and cost recording
- Warranty management
- Asset location tracking
- Asset transfer between branches
- Maintenance schedule
- Asset depreciation tracking

**Asset Types:**
- Laptops and Computers
- Mobile Phones
- Monitors and Peripherals
- Software Licenses
- Office Equipment
- Vehicles
- Custom categories

**Asset Fields:**
```typescript
interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  assignedTo?: string;
  assignedToName?: string;
  status: 'Available' | 'Assigned' | 'Under Repair' | 'Retired';
  purchaseDate: string;
  purchaseCost: number;
  branchId?: string;
  location: string;
  image?: string;
}
```

---

### 7. **Payroll Management** 💰
**Component:** `Payroll.tsx`

**Features:**

#### Payroll Processing
- Monthly payroll generation
- Salary structure breakdown:
  - Basic Salary
  - HRA (House Rent Allowance)
  - Conveyance
  - Medical Allowance
  - Special Allowances
  - Overtime Pay

#### Deductions
- PF (Provident Fund)
- ESI (Employee State Insurance)
- TDS (Tax Deducted at Source)
- Professional Tax
- LOP (Loss of Pay for absent days)

#### Payroll Features
- Attendance-based salary calculation
- Reimbursement integration
- Ad-hoc bonus/deduction support
- Payslip generation (PDF)
- Salary revision management
- Bank transfer file generation
- Tax calculation and compliance
- Year-end tax statements (Form 16)

**Payroll Record:**
```typescript
interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Pending' | 'Paid';
  paymentDate?: string;
  payableDays: number;
  lopDays?: number;
  breakdown: PayrollBreakdown;
}
```

#### Reimbursements
- Employee expense claim submission
- Categories: Travel, Food, Medical, Office Supplies, Other
- Receipt/Bill upload
- Approval workflow
- Payment tracking
- Integration with payroll for payment

---

### 8. **Timesheets** ⏱️
**Component:** `Timesheets.tsx`

**Features:**
- Detailed time entry for projects/tasks
- Clock in/Clock out tracking
- Duration calculation (in minutes)
- Daily, weekly, monthly views
- Status tracking:
  - Working → Completed → Approved → Rejected
- Overtime identification
- Billable vs non-billable hours
- Project-wise time allocation
- Manager approval workflow
- Export timesheets for billing/payroll

**Timesheet Workflow:**
1. Employee clocks in at start of work
2. System tracks duration automatically
3. Employee clocks out at end of day
4. Manager reviews and approves timesheets
5. Data used for payroll and project billing

---

### 9. **Task Board** 📋
**Component:** `TaskBoard.tsx`

**Features:**
- Kanban-style task management
- Task columns: To Do → In Progress → Review → Done
- Drag-and-drop task movement
- Task assignment to team members
- Priority levels (Low, Medium, High)
- Due date tracking
- Task comments and attachments
- Task history/activity log
- Filters by assignee, priority, due date
- Personal vs team task views

**Task Structure:**
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar: string;
  team?: string[];
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  attachments?: string[];
  comments?: TaskComment[];
  history?: TaskHistory[];
}
```

---

### 10. **Team Management** 👨‍👩‍👧‍👦
**Component:** `TeamManagement.tsx`

**Features:**
- Create and manage teams
- Assign team leaders
- Add/remove team members
- Team project assignments
- Team performance metrics
- Team communication hub
- Role assignment within teams
- Team goals and objectives tracking

**Team Structure:**
```typescript
interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: string[];
  description: string;
  projectFocus?: string;
}
```

---

### 11. **File Manager** 📁
**Component:** `FileManager.tsx`

**Features:**
- Centralized document repository
- File categories:
  - Company Documents
  - Employee Documents
  - Policies and Handbooks
  - Forms and Templates
  - Payroll Documents
- File upload with drag-and-drop
- File preview
- Version control
- Access control (owner-based)
- Search and filter files
- File sharing via links
- Folder structure support

**Supported File Types:**
- PDF documents
- Word documents (DOC, DOCX)
- Excel spreadsheets (XLS, XLSX)
- Images (JPG, PNG, GIF)
- Custom file types

---

### 12. **Handbook & Policies** 📖
**Component:** `Handbook.tsx`

**Features:**
- Company policies repository
- Policy categories:
  - Code of Conduct
  - Leave Policy
  - Work from Home Policy
  - Dress Code
  - Data Security
  - HR Policies
  - Safety Guidelines
- Policy versioning
- Effective date tracking
- Employee acknowledgment tracking
- Search within policies
- Print-friendly format

**Policy Structure:**
```typescript
interface PolicyDocument {
  id: string;
  categoryId: string;
  title: string;
  content?: string;
  fileUrl?: string;
  lastUpdated: string;
  version: string;
}
```

---

### 13. **Holiday Calendar** 📅
**Component:** `HolidayCalendar.tsx`

**Features:**
- Annual holiday calendar
- Public/National holidays
- Company-specific holidays
- Regional holiday variations
- Holiday types (Mandatory, Optional)
- Integration with leave management
- Calendar sync (iCal export)
- Holiday notifications

**Holiday Entry:**
```typescript
interface Holiday {
  id: string;
  name: string;
  date: string;
  description: string;
  type: string;
  branchId?: string;
}
```

---

### 14. **Reports & Analytics** 📈
**Component:** `Reports.tsx`

**Features:**

#### Available Reports
1. **Employee Reports**
   - Headcount by department/branch
   - Attrition rate
   - New hires vs separations
   - Employee demographics

2. **Attendance Reports**
   - Monthly attendance summary
   - Absent/Late patterns
   - Overtime analysis
   - Department-wise attendance

3. **Leave Reports**
   - Leave utilization
   - Leave balance summary
   - Leave trends
   - Pending leave requests

4. **Payroll Reports**
   - Monthly payroll summary
   - Department-wise cost
   - Deduction analysis
   - Tax reports

5. **Recruitment Reports**
   - Time to hire
   - Source of hire
   - Offer acceptance rate
   - Candidate pipeline status

6. **Asset Reports**
   - Asset inventory
   - Assignment status
   - Maintenance schedule
   - Asset depreciation

**Report Features:**
- Date range selection
- Department/Branch filters
- Export to Excel/PDF
- Scheduled report generation
- Email report delivery
- Visual charts and graphs

---

### 15. **Activity Logs** 📝
**Component:** `ActivityLogs.tsx`

**Features:**
- Complete audit trail of all system activities
- Log information:
  - User who performed action
  - Action type (Create, Update, Delete, View)
  - Module affected
  - Timestamp
  - IP Address
  - Device information
- Filter by:
  - User
  - Module
  - Date range
  - Action type
- Search logs
- Export logs for compliance
- Retention policy management

**Log Entry:**
```typescript
interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  branchId?: string;
  ipAddress?: string;
}
```

---

### 16. **Settings** ⚙️
**Component:** `Settings.tsx`

**Features:**

#### System Configuration
- Company information
- Branch management
- Department setup
- Designation list
- Leave types configuration
- Asset categories
- Job types

#### Security Settings
- Password policies
- Session timeout
- Two-Factor Authentication (2FA/MFA)
- IP whitelisting
- Login attempt limits

#### User Management
- Create system users
- Assign roles and permissions
- Link users to employees
- Manage access modules
- Deactivate users

#### Email Settings
- SMTP configuration
- Email templates
- Notification settings
- Automated email triggers

#### Portal Settings
- Allow employee profile edit
- Allow photo upload
- Allow address edit
- Allow bank details edit
- Custom field definitions

#### Backup & Maintenance
- Database backup
- Data export
- System health check
- Cache management

---

### 17. **Login & Authentication** 🔐
**Components:** `Login.tsx`, `LoginNew.tsx`, `SecuritySettings.tsx`

**Features:**

#### Standard Login
- Email and password authentication
- Remember me option
- Password reset via email
- Account lockout after failed attempts
- Login activity tracking

#### Two-Factor Authentication (2FA)
- TOTP (Time-based One-Time Password) using Google Authenticator
- QR code generation for setup
- Backup codes generation
- SMS verification (optional)
- Email verification (optional)

#### Security Features
- Password encryption with bcrypt
- Session management
- Device tracking (browser, OS, device type)
- IP address logging
- Suspicious activity detection
- Automatic session timeout

**Login Flow:**
```
1. Enter email & password
2. Validate credentials
3. Check if 2FA enabled
   - If yes: Request TOTP code
   - If no: Log in directly
4. Log activity
5. Create session
6. Redirect to dashboard
```

---

## User Roles & Permissions

### Role Hierarchy

#### 1. **Super Admin** 👑
**Full System Access**
- All modules (read, create, update, delete)
- System configuration
- User management
- Multi-branch access
- Audit log access
- Security settings
- Backup and restore

#### 2. **Admin** 🔑
**Organization-Wide Access**
- All modules except system config
- User management (limited)
- Branch-level data access
- Reports and analytics
- Cannot modify super admin accounts

#### 3. **Manager** 👔
**Department/Team Management**
- View all employees in department
- Approve/Reject leave requests
- Approve timesheets
- Task assignment
- Team performance reports
- Limited payroll view
- Cannot delete employees

#### 4. **HR** 👥
**Human Resources Operations**
- Full employee CRUD
- Recruitment management
- Leave management
- Attendance management
- Document management
- Policy distribution
- Cannot access payroll finances

#### 5. **Finance** 💼
**Financial Operations**
- Payroll management
- Reimbursement approval
- Salary revisions
- Tax calculations
- Financial reports
- Cannot access recruitment

#### 6. **Team Lead** 📊
**Team-Level Management**
- View team members only
- Approve team leave requests
- Assign tasks to team
- View team reports
- Limited access to other modules

#### 7. **Employee** 👤
**Self-Service Portal**
- View own profile
- Edit limited personal info
- Apply for leave
- View payslips
- Submit reimbursements
- Mark attendance (self)
- View own tasks
- Access company policies
- No access to others' data

### Permission Matrix

| Module | Super Admin | Admin | Manager | HR | Finance | Team Lead | Employee |
|--------|-------------|-------|---------|----|---------|-----------|----- |
| Dashboard | ✅ Full | ✅ Full | ✅ Team | ✅ Full | ✅ Limited | ✅ Team | ✅ Self |
| Employees | ✅ CRUD | ✅ CRUD | ✅ View | ✅ CRUD | ✅ View | ✅ Team View | ✅ Self View |
| Attendance | ✅ CRUD | ✅ CRUD | ✅ Team CRUD | ✅ CRUD | ❌ | ✅ Team View | ✅ Self Mark |
| Leave | ✅ CRUD | ✅ CRUD | ✅ Approve | ✅ CRUD | ❌ | ✅ Team Approve | ✅ Self Apply |
| Recruitment | ✅ CRUD | ✅ CRUD | ✅ View | ✅ CRUD | ❌ | ❌ | ❌ |
| Payroll | ✅ CRUD | ✅ CRUD | ✅ View | ❌ | ✅ CRUD | ❌ | ✅ Self View |
| Assets | ✅ CRUD | ✅ CRUD | ✅ Team Assign | ✅ CRUD | ❌ | ❌ | ✅ Self View |
| Tasks | ✅ CRUD | ✅ CRUD | ✅ Team CRUD | ✅ View | ❌ | ✅ Team CRUD | ✅ Self Update |
| Reports | ✅ All | ✅ All | ✅ Team | ✅ HR Reports | ✅ Finance Reports | ✅ Team | ❌ |
| Settings | ✅ Full | ✅ Limited | ❌ | ❌ | ❌ | ❌ | ❌ |
| Activity Logs | ✅ Full | ✅ Full | ❌ | ✅ HR Logs | ❌ | ❌ | ❌ |

---

## Application Flow

### User Journey Flow

#### 1. **First-Time Setup**
```
Install Dependencies → Configure Database → Run Migrations → 
Seed Initial Data → Create Super Admin → Access Portal
```

#### 2. **Admin Workflow**
```
Login → Dashboard → Configure System Settings → 
Add Branches → Add Departments → Create Users → 
Add Employees → Configure Leave Types → Set Holidays → 
Create Job Postings → Assign Assets
```

#### 3. **HR Daily Workflow**
```
Login → Check Dashboard → Mark Attendance → 
Review Leave Requests → Process Recruitment → 
Update Employee Records → Generate Reports
```

#### 4. **Employee Daily Workflow**
```
Login → View Dashboard → Mark Attendance/Clock In → 
Check Assigned Tasks → Apply for Leave (if needed) → 
Submit Reimbursement → View Payslip → Clock Out
```

#### 5. **Manager Workflow**
```
Login → Review Team Dashboard → Approve Leave Requests → 
Assign Tasks → Review Timesheets → Check Team Performance → 
Generate Team Reports
```

### Data Flow Architecture

```
┌─────────────────┐
│  Frontend (React)│
│  Components      │
└────────┬─────────┘
         │
         │ HTTP Requests (REST API)
         │
         ▼
┌─────────────────┐
│ Backend (Express)│
│  /api/*         │
└────────┬─────────┘
         │
         │ SQL Queries (pg)
         │
         ▼
┌─────────────────┐
│ PostgreSQL DB   │
│  Tables + Functions│
└─────────────────┘
```

### API Request Flow

```
Component → api.ts → fetch() → server.js → 
Route Handler → Database Query → Response → 
Parse Data → Update State → Re-render Component
```

---

## API Endpoints

### Base URL
```
Development: http://localhost:3001/api
Production: [Configured via VITE_API_URL]
```

### Generic CRUD Endpoints

The backend uses a generic table-based API pattern:

#### GET `/api/:table`
Fetch all records from a table
```
Example: GET /api/employees
Response: Employee[]
```

#### GET `/api/:table/:id`
Fetch single record by ID
```
Example: GET /api/employees/emp_123
Response: Employee
```

#### POST `/api/:table`
Create new record
```
Example: POST /api/employees
Body: { name, email, designation, ... }
Response: { id, ...newEmployee }
```

#### PUT `/api/:table/:id`
Update existing record
```
Example: PUT /api/employees/emp_123
Body: { name: "Updated Name", ... }
Response: { ...updatedEmployee }
```

#### DELETE `/api/:table/:id`
Delete record
```
Example: DELETE /api/employees/emp_123
Response: { success: true }
```

### Specific Endpoints

#### Authentication
- `POST /api/login` - User login with password
- `POST /api/verify-mfa` - Verify 2FA code
- `POST /api/users` - Create new user account

#### Security & 2FA
- `POST /api/security/enable-totp` - Enable TOTP 2FA
- `POST /api/security/verify-totp` - Verify TOTP setup
- `POST /api/security/disable-totp` - Disable 2FA
- `GET /api/security/settings/:userId` - Get security settings
- `GET /api/security/mfa-logs/:userId` - Get MFA logs

#### Search
- `GET /api/search?query=xyz` - Global search across multiple tables

#### File Upload
- `POST /api/files/upload` - Upload files (multipart/form-data)
- `POST /api/reimbursements/upload` - Upload reimbursement receipts

#### Reports
- `GET /api/reports/:type` - Generate specific report type

#### Health Check
- `GET /api/health` - Server health check

### Supported Tables (for Generic CRUD)
- `employees`
- `users`
- `branches`
- `departments`
- `attendance`
- `leaves`
- `jobs`
- `candidates`
- `assets`
- `tasks`
- `payroll`
- `reimbursements`
- `timesheets`
- `shifts`
- `teams`
- `groups`
- `policies`
- `holidays`
- `files`
- `logs`

---

## Frontend Components

### Component Structure

```
components/
├── App.tsx              - Main application container with routing
├── Login.tsx            - Login page
├── LoginNew.tsx         - Enhanced login with 2FA
├── Header.tsx           - Top navigation bar
├── Sidebar.tsx          - Left navigation menu
├── Dashboard.tsx        - Main dashboard with stats and charts
├── EmployeeList.tsx     - Employee directory and management
├── AddEmployee.tsx      - Employee creation form
├── Attendance.tsx       - Attendance marking and tracking
├── LeaveManagement.tsx  - Leave application and approval
├── Recruitment.tsx      - Job postings and candidate management
├── Payroll.tsx          - Salary processing and payslips
├── AssetManagement.tsx  - IT asset inventory and assignment
├── TaskBoard.tsx        - Kanban-style task management
├── Timesheets.tsx       - Time entry and tracking
├── TeamManagement.tsx   - Team structure and members
├── FileManager.tsx      - Document repository
├── Handbook.tsx         - Company policies and handbook
├── HolidayCalendar.tsx  - Holiday list and calendar
├── Reports.tsx          - Analytics and reports
├── ActivityLogs.tsx     - System audit logs
├── Settings.tsx         - System configuration
├── SecuritySettings.tsx - 2FA and security management
└── Profile.tsx          - User profile management
```

### Shared Component Patterns

#### StatCard Component
Used across Dashboard and other modules for metric display
```tsx
<StatCard
  title="Active Employees"
  value={120}
  trend="+5%"
  trendUp={true}
  icon={<Users />}
  color="bg-blue-500"
  onClick={() => navigate('employees')}
/>
```

#### Modal Pattern
Consistent modal structure for forms and details
```tsx
<ModalBackdrop onClose={closeModal}>
  <ModalHeader title="Edit Employee" />
  <ModalBody>
    {/* Form content */}
  </ModalBody>
  <ModalFooter>
    <Button onClick={save}>Save</Button>
    <Button onClick={close}>Cancel</Button>
  </ModalFooter>
</ModalBackdrop>
```

#### Data Table Pattern
Reusable table structure with search, filter, and actions
```tsx
<DataTable
  data={employees}
  columns={[
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Department', accessor: 'department' }
  ]}
  searchable={true}
  filterable={true}
  actions={['edit', 'delete']}
/>
```

### State Management Pattern

Using custom `useApiData` hook for data fetching:
```tsx
const [employees, refreshEmployees, loading] = useApiData<Employee[]>(
  'employees',
  [],
  serverConnected
);
```

This hook:
1. Fetches data from API on mount
2. Handles loading states
3. Provides refresh function
4. Falls back to empty array if server unavailable

---

## Security & Authentication

### Authentication Methods

#### 1. **Password-Based Login**
- Email + Password combination
- Password hashed with bcrypt (salt rounds: 10)
- Password requirements:
  - Minimum 8 characters
  - Mix of uppercase, lowercase, numbers
  - Special characters recommended

#### 2. **Two-Factor Authentication (2FA/MFA)**
- TOTP (Time-based One-Time Password) using speakeasy library
- Compatible with Google Authenticator, Authy, Microsoft Authenticator
- 6-digit codes that change every 30 seconds
- Setup process:
  1. User enables 2FA in Security Settings
  2. System generates secret key
  3. QR code displayed for scanning
  4. User verifies with initial code
  5. Backup codes generated
- Fallback options:
  - Backup codes (10 single-use codes)
  - SMS verification (optional)
  - Email verification (optional)

### Security Features

#### Password Security
- Bcrypt hashing with salt
- Password never stored in plain text
- Password reset via email token
- Account lockout after 5 failed attempts
- Password history (prevent reuse)

#### Session Management
- Session tokens stored securely
- Configurable session timeout
- Auto-logout on inactivity
- Device tracking for sessions

#### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens for forms
- Input validation and sanitization
- File upload restrictions (type, size)

#### Access Control
- Role-based access control (RBAC)
- Module-level permissions
- Branch-level data isolation
- Resource ownership validation

#### Audit & Compliance
- Complete activity logging
- User action tracking
- IP address logging
- Device information capture
- Login attempt monitoring
- Data access logging

### MFA Logs
All authentication attempts logged:
```typescript
interface MFALog {
  id: string;
  userId: string;
  timestamp: string;
  status: 'success' | 'failed';
  loginAttempt: string;
  loginSource: 'password' | 'mfa' | 'sso';
  ipAddress: string;
  browser: string;
  os: string;
  device: string;
}
```

---

## Setup & Deployment

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 12+
- npm or yarn
- Git

### Environment Variables

Create `.env` file in root:
```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/hr_portal
PGHOST=localhost
PGPORT=5432
PGDATABASE=hr_portal
PGUSER=postgres
PGPASSWORD=your_password

# Backend
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Employee Management Portal

# Optional
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd hr-portal
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Database Setup
```bash
# Create database
createdb hr_portal

# Run schema
psql hr_portal < database_schema_postgresql.sql

# Seed initial data (optional)
npm run seed
```

#### 4. Start Development Servers
```bash
# Option 1: Run both frontend and backend together
npm run dev

# Option 2: Run separately
# Terminal 1 - Frontend
npm run dev:client

# Terminal 2 - Backend
npm run dev:server
```

#### 5. Access Application
```
Frontend: http://localhost:5173
Backend: http://localhost:3001
Health Check: http://localhost:3001/api/health
```

### Production Deployment

#### 1. Build Frontend
```bash
npm run build
```
Generates optimized build in `dist/` folder

#### 2. Configure Production Environment
Update `.env`:
```env
NODE_ENV=production
DATABASE_URL=<production_database_url>
VITE_API_URL=<production_api_url>
```

#### 3. Deploy Backend
- Use PM2 for process management:
```bash
pm2 start server.js --name hr-portal-api
```

#### 4. Deploy Frontend
- Serve `dist/` folder using:
  - Nginx
  - Apache
  - Vercel
  - Netlify
  - GitHub Pages (static)

#### 5. Database Migration
```bash
npm run setup  # Run migrations
```

### NPM Scripts
```json
{
  "dev": "Run both frontend and backend",
  "dev:client": "Vite dev server (port 5173)",
  "dev:server": "Express server (port 3001)",
  "build": "Production build for frontend",
  "preview": "Preview production build",
  "server": "Start backend server only",
  "seed": "Seed database with sample data",
  "setup": "Initialize database schema",
  "reset": "Reset database (WARNING: deletes data)",
  "check-db": "Check database connection",
  "deploy": "Deploy to GitHub Pages"
}
```

### Database Maintenance

#### Backup
```bash
pg_dump hr_portal > backup_$(date +%Y%m%d).sql
```

#### Restore
```bash
psql hr_portal < backup_20260104.sql
```

#### Reset Database
```bash
npm run reset
```

---

## Key Features Summary

### ✅ Complete HR Operations
- Employee lifecycle management (hire to retire)
- Attendance and time tracking
- Leave and absence management
- Payroll processing with compliance
- Recruitment and onboarding

### ✅ Modern Architecture
- React 18 with TypeScript
- RESTful API design
- PostgreSQL with proper indexing
- Responsive UI with Tailwind CSS
- Component-based architecture

### ✅ Security & Compliance
- Multi-factor authentication (2FA/MFA)
- Role-based access control
- Complete audit trail
- Data encryption
- GDPR-ready logging

### ✅ Multi-Branch Support
- Manage multiple office locations
- Branch-wise data isolation
- Centralized reporting
- Branch-specific configurations

### ✅ Self-Service Portal
- Employee self-service features
- Leave application
- Attendance marking
- Document access
- Profile management

### ✅ Analytics & Reporting
- Real-time dashboards
- Customizable reports
- Visual charts (Recharts)
- Export capabilities (Excel, PDF)
- Scheduled reports

### ✅ Document Management
- Centralized file storage
- Version control
- Access permissions
- Multiple file format support
- Search and categorization

### ✅ Extensibility
- Modular design
- Custom fields support
- API-first architecture
- Easy integration with third-party tools
- Plugin-ready structure

---

## Technical Specifications

### Performance
- **API Response Time:** < 200ms (average)
- **Page Load Time:** < 2s (first paint)
- **Database Connections:** Pool of 20 connections
- **File Upload Limit:** Configurable (default: 10MB)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Scalability
- Supports 1000+ employees
- Handles 10,000+ records per table
- Concurrent user limit: 100+ (with proper server sizing)
- Horizontal scaling ready (stateless backend)

### Data Retention
- Activity logs: 2 years
- Payroll records: 7 years (configurable)
- Employee records: Indefinite (soft delete)
- File storage: Based on disk space

---

## Support & Maintenance

### Troubleshooting

#### Database Connection Issues
```bash
# Check database status
npm run check-db

# Test connection manually
psql -U postgres -d hr_portal -c "SELECT NOW();"
```

#### Frontend Not Loading
1. Check if backend is running: `http://localhost:3001/api/health`
2. Verify `VITE_API_URL` in `.env`
3. Clear browser cache
4. Check console for errors

#### Login Issues
1. Verify user exists: `SELECT * FROM users WHERE email='user@example.com';`
2. Check password hash exists
3. Verify 2FA settings if enabled
4. Check MFA logs: `SELECT * FROM mfa_logs WHERE userId='xxx' ORDER BY timestamp DESC;`

### Logs
- Backend logs: Console output (use PM2 logs in production)
- Database logs: PostgreSQL log files
- Activity logs: `logs` table in database
- MFA logs: `mfa_logs` table

---

## Future Enhancements (Roadmap)

### Phase 1 (Completed) ✅
- Core employee management
- Basic attendance and leave
- Simple recruitment
- Asset tracking
- File management

### Phase 2 (Current)
- Advanced payroll with compliance
- Two-factor authentication
- Comprehensive reporting
- Multi-branch support
- Activity logging

### Phase 3 (Planned)
- Mobile app (React Native)
- AI-powered resume screening
- Automated payroll calculations
- Integration with accounting software
- Advanced analytics and predictions

### Phase 4 (Future)
- Performance management module
- Training and development tracking
- Employee engagement surveys
- Chatbot for HR queries
- Blockchain-based document verification

---

## Conclusion

This Employee Management Portal is a comprehensive, modern HR management system built with industry-standard technologies and best practices. It provides end-to-end functionality for managing all aspects of HR operations, from recruitment to payroll, with strong security and compliance features.

The modular architecture ensures easy maintenance and extensibility, while the role-based access control provides flexibility for organizations of all sizes. With multi-branch support and comprehensive reporting, it's suitable for small businesses to large enterprises.

For any queries or support, please refer to the inline code documentation or contact the development team.

---

**Last Updated:** January 4, 2026  
**Version:** 1.0.0  
**Maintained By:** Development Team
