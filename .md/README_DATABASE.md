
# Connecting Employee Portal to PostgreSQL

You have requested to use the following PostgreSQL server:
- **Host**: 13.135.37.89
- **Database**: sdcrm_hr_pg_db
- **User**: postgres

## ⚠️ Important Architecture Note
Web browsers (React applications) **cannot** securely connect directly to a PostgreSQL database. 
If you try to import `pg` or `mysql` libraries in React, it will fail with errors like `Module not found: Can't resolve 'net'`.

To use this database, you must set up a **Backend API**.

## Steps to Implementation

### 1. Database Setup
1. Download the `database_schema.sql` file generated in this project.
2. Connect to your database using a tool like **pgAdmin** or **DBeaver**.
3. Run the SQL script to create all the necessary tables (Employees, Attendance, Assets, etc.).

### 2. Backend Setup (Node.js)
1. Create a new folder for your backend (e.g., `server`).
2. Run `npm init -y` and `npm install express pg cors`.
3. Use the code provided in `backend_db_example.js` as your starting point.
4. Run the server using `node backend_db_example.js`.

### 3. Connect Frontend
Currently, `App.tsx` uses Firebase. To switch to Postgres:
1. Replace calls to `set(ref(db...))` with `fetch('http://localhost:3001/api/...')`.
2. Example:
   ```typescript
   // Old (Firebase)
   // set(ref(db, 'employees/' + id), newEmployee);

   // New (Postgres via API)
   // await fetch('http://localhost:3001/api/employees', {
   //   method: 'POST',
   //   headers: { 'Content-Type': 'application/json' },
   //   body: JSON.stringify(newEmployee)
   // });
   ```
