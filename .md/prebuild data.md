# Employee Management Portal - Complete Setup

## Project Status ✅
- **Frontend**: Running on port 5000 (React + Vite)
- **Backend**: Running on port 3001 (Express.js + PostgreSQL)
- **Database**: PostgreSQL (Replit-managed)
- **Migration**: Complete - Firebase → PostgreSQL

## What's Included

### 1. Documentation Files
- `SETUP_LOCAL_DATABASE.md` - Step-by-step guide for local setup
- `API_ROUTES.md` - Complete API documentation with examples
- `database_schema_postgresql.sql` - Full database schema
- `BACKUP_restore_database.sql` - Backup of schema
- `.env.example` - Environment variables template

### 2. Backend Files
- `server.js` - Express.js REST API server
- `src/config/database.config.ts` - Database configuration loader
- Routes for all CRUD operations on 20+ tables

### 3. Frontend Files
- `components/` - 20+ React components for HR modules
- `services/api.ts` - REST API client (updated for PostgreSQL)
- `vite.config.ts` - Vite configuration with port 5000
- Login page with quick access buttons

### 4. Database
- 20+ tables for complete HR system
- Sample data pre-loaded
- Indexes and triggers for performance
- Graceful offline mode with mock data

## Quick Start

### Option 1: Replit (Already Running)
```bash
# Frontend and Backend are already running
# Access: http://localhost:5000 or via Replit's web view
# Quick login: Click Admin/Manager/Employee buttons
```

### Option 2: Local Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Update .env with your local database credentials
# PGHOST=localhost
# PGPORT=5432
# PGDATABASE=hr_portal
# PGUSER=postgres
# PGPASSWORD=your_password

# 3. Initialize database
psql -U postgres -d hr_portal -h localhost < database_schema_postgresql.sql

# 4. Install dependencies
npm install --legacy-peer-deps

# 5. Start backend (Terminal 1)
npm run server

# 6. Start frontend (Terminal 2)
npm run dev
```

## Environment Variables

### Required (Set via Replit Secrets or .env)
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PGHOST` | Database host | `localhost` |
| `PGPORT` | Database port | `5432` |
| `PGDATABASE` | Database name | `hr_portal` |
| `PGUSER` | Database user | `postgres` |
| `PGPASSWORD` | Database password | `password` |

### Optional
| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:3001/api` |
| `VITE_APP_NAME` | App name in frontend | `Employee Management Portal` |
| `DEBUG` | Enable debug logging | `false` |

## API Endpoints

All endpoints at `http://localhost:3001/api`

### Generic CRUD
```
GET    /api/:table              # List all
GET    /api/:table/:id          # Get one
POST   /api/:table              # Create
PUT    /api/:table/:id          # Update
DELETE /api/:table/:id          # Delete
GET    /api/health              # Health check
GET    /api/search?query=...    # Search
```

### Available Tables
- **Users**: users, groups, teams
- **Employees**: employees, departments, branches
- **Time**: attendance, timesheets, shifts, leaves
- **Operations**: assets, tasks, logs
- **Recruitment**: jobs, candidates
- **Finance**: payroll, reimbursements
- **Company**: system_config, policy_categories, policies, holidays

## Project Structure
```
├── components/                    # React UI components
├── services/
│   └── api.ts                    # REST API client
├── vite.config.ts                # Frontend config
├── server.js                      # Express.js backend
├── database_schema_postgresql.sql # Database schema
├── SETUP_LOCAL_DATABASE.md        # Setup guide
├── API_ROUTES.md                  # API documentation
├── .env.example                   # Environment template
├── replit.md                      # This file
└── package.json                   # Dependencies
```

## Features Implemented

### Workforce Management
- Employee records with profiles
- Department and branch management
- Team management with team leads

### Attendance & Time
- Clock in/out functionality
- Daily attendance tracking
- Timesheet management
- Shift definitions
- Leave request system

### Payroll
- Payroll record management
- Expense reimbursements
- Salary tracking

### Recruitment
- Job postings
- Candidate management
- Interview tracking

### Operations
- Asset management
- Task board with assignments
- Activity logs

### Admin
- User management with roles
- System configuration
- Policy management
- Holiday calendar

## User Roles

### Super Admin
- Full system access
- User and role management
- System configuration
- All modules

### Admin
- Employee management
- Payroll administration
- System configuration

### Manager
- Workforce oversight
- Attendance approval
- Team management
- Department management

### Employee
- Personal dashboard
- Attendance tracking
- Leave requests
- Task assignment
- Time tracking

## Mock Users (Demo Mode)

Passwords not required for demo - just click buttons:

| Email | Role | Access |
|-------|------|--------|
| admin@company.com | Super Admin | All features |
| manager@company.com | Manager | Workforce management |
| emp@company.com | Employee | Personal features |

## Database Backup & Restore

### Create Backup
```bash
pg_dump -U hr_user -d hr_portal > backup.sql
```

### Restore from Backup
```bash
psql -U hr_user -d hr_portal < backup.sql
```

## Troubleshooting

### Backend won't connect to database
1. Check environment variables are set correctly
2. Verify PostgreSQL is running
3. Test connection: `psql -c "SELECT 1"`
4. Check logs: `npm run server`

### Frontend can't reach backend
1. Verify backend is running on port 3001
2. Check VITE_API_URL environment variable
3. Test API: `curl http://localhost:3001/api/health`

### Port already in use
```bash
# Find and kill process using port
lsof -i :3001  # For backend
lsof -i :5000  # For frontend
kill -9 <PID>
```

### Database tables don't exist
```bash
# Reinitialize schema
psql -U hr_user -d hr_portal < database_schema_postgresql.sql
```

## Deployment

### Build Frontend
```bash
npm run build  # Creates dist/ folder
```

### Deploy Frontend
- Files in `dist/` can be deployed to any static host
- Configure static deployment in replit.md

### Deploy Backend
- Node.js application
- Requires PostgreSQL database
- Set environment variables on hosting platform
- Port must be accessible

## Next Steps
1. Implement real authentication (JWT/Sessions)
2. Add file upload for documents
3. Set up email notifications
4. Create advanced reporting
5. Add multi-tenancy support
6. Implement data encryption for sensitive fields

## Architecture Overview

### Frontend → Backend Flow
1. User interacts with React UI
2. Component calls `api.get()`, `api.create()`, etc.
3. Request sent to `http://localhost:3001/api/:table`
4. Express.js server validates and processes
5. Data saved to PostgreSQL
6. Response returned with data
7. Component updates UI

### No Firebase
- Removed all Firebase dependencies
- All data now in PostgreSQL
- REST API for data access
- Can easily integrate with external services

## Maintenance

### Regular Tasks
- Monitor database disk space
- Backup database daily
- Check API logs for errors
- Update dependencies monthly

### Performance Optimization
- Add database indexes (already included)
- Cache frequently accessed data
- Implement pagination for large datasets
- Use connection pooling (already configured)

## Security Notes

### Current (Demo)
- No authentication
- Mock login for demonstration
- No encrypted passwords

### For Production
- Implement JWT authentication
- Encrypt sensitive data
- Use HTTPS only
- Add rate limiting
- Validate all inputs
- Use prepared statements (already done)
- Set up WAF

## Support & Documentation

- API Routes: See `API_ROUTES.md`
- Local Setup: See `SETUP_LOCAL_DATABASE.md`
- Schema: See `database_schema_postgresql.sql`
- Examples: Check `server.js` for endpoint implementations

## Version History

- **v1.0** (Dec 22, 2025): Firebase → PostgreSQL migration
  - Removed Firebase dependencies
  - Created comprehensive REST API
  - Initialized PostgreSQL with 20+ tables
  - Created complete documentation
  - Configured for both Replit and local development
