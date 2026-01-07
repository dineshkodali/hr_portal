# Local Database Setup Guide

This guide helps you set up the HR Management Portal with your own PostgreSQL database.

## Prerequisites
- PostgreSQL installed and running (version 12+)
- Node.js 18+ installed
- Git (optional)

## Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql prompt, create database and user
CREATE DATABASE hr_portal;
CREATE USER hr_user WITH PASSWORD 'your_secure_password';
ALTER ROLE hr_user WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE hr_portal TO hr_user;
\q
```

## Step 2: Initialize Database Schema

```bash
# Run the SQL schema file to create all tables
psql -U hr_user -d hr_portal -h localhost < database_schema_postgresql.sql

# Verify tables were created
psql -U hr_user -d hr_portal -h localhost
\dt  # Should show all tables
\q
```

## Step 3: Configure Environment Variables

Using Replit's secrets manager:

1. Click **Tools** → **Secrets**
2. Add the following secrets:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | Full connection string | `postgresql://hr_user:password@localhost:5432/hr_portal` |
| `PGHOST` | Database host | `localhost` |
| `PGPORT` | Database port | `5432` |
| `PGDATABASE` | Database name | `hr_portal` |
| `PGUSER` | Database user | `hr_user` |
| `PGPASSWORD` | Database password | `your_secure_password` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:3001/api` |

**OR** if running locally, create `.env` file in project root:

```bash
DATABASE_URL=postgresql://hr_user:password@localhost:5432/hr_portal
PGHOST=localhost
PGPORT=5432
PGDATABASE=hr_portal
PGUSER=hr_user
PGPASSWORD=password
PORT=3001
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
```

## Step 4: Install Dependencies

```bash
npm install
npm install --legacy-peer-deps  # Due to React 19 compatibility
```

## Step 5: Start the Application

```bash
# Terminal 1: Start Backend
npm run server

# Terminal 2: Start Frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## Quick Login Credentials

Use the Quick Login buttons on the login page:
- **Admin**: admin@company.com
- **Manager**: manager@company.com  
- **Employee**: emp@company.com

(Mock login - currently no password required for demo)

## Database Troubleshooting

### Connection Issues
```bash
# Test PostgreSQL connection
psql -U hr_user -d hr_portal -h localhost -c "SELECT NOW();"

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
```

### Schema Issues
```bash
# Check all tables
psql -U hr_user -d hr_portal -h localhost -c "\dt"

# Check specific table structure
psql -U hr_user -d hr_portal -h localhost -c "\d employees"

# Clear and reinitialize database
psql -U postgres -d template1 -c "DROP DATABASE hr_portal;"
psql -U postgres -d template1 -c "CREATE DATABASE hr_portal;"
PGPASSWORD=password psql -U hr_user -d hr_portal -h localhost < database_schema_postgresql.sql
```

### Backend Can't Connect
```bash
# Check server logs
npm run server

# Test API endpoint
curl http://localhost:3001/api/health

# Check environment variables
echo $DATABASE_URL
echo $PGHOST
```

## Common Errors

### "relation does not exist"
- Schema wasn't initialized
- Solution: Run `psql -U hr_user -d hr_portal -h localhost < database_schema_postgresql.sql`

### "password authentication failed"
- Wrong credentials in .env
- Solution: Verify PGUSER, PGPASSWORD, and PGHOST

### "Cannot connect to server"
- PostgreSQL not running
- Solution: Start PostgreSQL service

### "Port 3001 already in use"
- Another process using the port
- Solution: `lsof -i :3001` and kill the process, or change PORT in .env

## Backup & Restore

### Backup Database
```bash
pg_dump -U hr_user -d hr_portal -h localhost > backup.sql
```

### Restore from Backup
```bash
psql -U hr_user -d hr_portal -h localhost < backup.sql
```

## Next Steps
- Implement authentication system
- Add file upload functionality
- Set up email notifications
- Configure production database
- Deploy to cloud hosting

## Support
If you encounter issues:
1. Check logs in terminal (npm run server)
2. Review SETUP_LOCAL_DATABASE.md
3. Verify PostgreSQL is running
4. Test connection with: `psql -c "SELECT 1"`
