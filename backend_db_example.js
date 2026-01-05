
/**
 * BACKEND SERVER EXAMPLE (Node.js)
 * 
 * IMPORTANT: This code must run on a Node.js server, NOT in the React frontend.
 * React cannot connect to Postgres directly.
 * 
 * Install dependencies: npm install pg express cors
 */

const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection Configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sdcrm_hr_pg_db',
  user: 'postgres',
  password: 'Ganesh@2929', // Note: Secure this in production using Environment Variables
});

// Test Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

// API Routes Examples

// 1. Get All Employees
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create New Employee
app.post('/api/employees', async (req, res) => {
  const { id, name, email, department, designation, branch_id } = req.body;
  try {
    const query = `
      INSERT INTO employees (id, first_name, email, department, designation, branch_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [id, name, email, department, designation, branch_id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Clock In (Attendance)
app.post('/api/attendance/clock-in', async (req, res) => {
  const { employee_id, date, check_in } = req.body;
  try {
    const query = `
      INSERT INTO attendance_records (employee_id, date, check_in, status)
      VALUES ($1, $2, $3, 'Present')
      RETURNING *
    `;
    const result = await pool.query(query, [employee_id, date, check_in]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
