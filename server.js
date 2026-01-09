
// ...existing imports...
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';


const { Pool } = pg;
const app = express();

// Multer upload initialization (must be before usage)
// const upload = multer({ dest: 'uploads/' }); // Removed duplicate, use storage version below

// File upload setup for reimbursements and general files
const uploadDir = path.join(process.cwd(), 'uploads');
import fs from 'fs';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

/* ============================================================================ 
   FILES UPLOAD ENDPOINT
============================================================================ */
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    const { body, file } = req;
    if (!file) {
      console.error('❌ Multer did not provide a file:', req);
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const id = `file_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const data = {
      id,
      name: file.originalname,
      type: file.mimetype ? (file.mimetype.split('/')[1] || 'unknown') : 'unknown',
      size: file.size,
      path: file.path,
      ownerId: body.ownerId || null,
      category: body.category || 'company',
      uploadedBy: body.uploadedBy || 'unknown',
      uploadedDate: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT INTO files (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    try {
      const { rows } = await pool.query(query, values);
      res.status(201).json(rows[0]);
    } catch (dbErr) {
      console.error('❌ DB error inserting file:', dbErr, { data });
      res.status(500).json({ error: dbErr.message, details: dbErr, data });
    }
  } catch (err) {
    console.error('❌ General upload error:', err);
    res.status(500).json({ error: err.message, details: err });
  }
});

/* ============================================================================
   CONFIG
============================================================================ */
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

/* ============================================================================
   DATABASE
============================================================================ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test DB
pool.query('SELECT NOW()')
  .then(res => console.log('✅ Database connected:', res.rows[0].now))
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

pool.on('error', err => {
  console.error('❌ Unexpected DB error:', err);
  process.exit(1);
});

/* ============================================================================
   MIDDLEWARE
============================================================================ */
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ...existing code...
/* ============================================================================ 
   NOTIFICATION SETTINGS ENDPOINTS
============================================================================ */

// Get all notification settings for a user
app.get('/api/notificationsettings', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const { rows } = await pool.query('SELECT * FROM notificationsettings WHERE userId = $1', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new notification setting
app.post('/api/notificationsettings', async (req, res) => {
  try {
    const { userId, type, enabled, channel } = req.body;
    if (!userId || !type) return res.status(400).json({ error: 'userId and type required' });
    const id = `notif_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const { rows } = await pool.query(
      'INSERT INTO notificationsettings (id, userId, type, enabled, channel, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [id, userId, type, enabled ?? true, channel || 'email']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a notification setting
app.put('/api/notificationsettings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled, channel } = req.body;
    const { rows } = await pool.query(
      'UPDATE notificationsettings SET enabled = $1, channel = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [enabled, channel, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification setting
app.delete('/api/notificationsettings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notificationsettings WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* ============================================================================
   REIMBURSEMENTS FILE UPLOAD ENDPOINT
============================================================================ */
app.post('/api/reimbursements/upload', upload.single('proof'), async (req, res) => {
  try {
    const { body, file } = req;
    // Accept customFields as JSON string
    let customFields = body.customFields;
    if (typeof customFields === 'string') {
      try { customFields = JSON.parse(customFields); } catch { customFields = []; }
    }
    const data = {
      ...body,
      amount: Number(body.amount),
      proof: file ? file.filename : null,
      receipt: file ? file.path : null,
      custom_fields: customFields,
      submittedDate: new Date(),
      status: 'Pending',
      created_at: new Date(),
      updated_at: new Date()
    };
    // Remove id if present
    delete data.id;
    // Insert into DB
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT INTO reimbursements (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================================ 
   HEALTH
============================================================================ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

/* ============================================================================ 
   DATABASE INFO ENDPOINT
============================================================================ */
app.get('/api/dbinfo', async (req, res) => {
  try {
    // Get connection info
    const poolState = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };
    // Get DB version and current user
    const versionRes = await pool.query('SELECT version()');
    const userRes = await pool.query('SELECT current_user');
    // Get all table names
    const tablesRes = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    // Get row counts for each table (limit to 10 tables for perf)
    const tableNames = tablesRes.rows.map(r => r.table_name).slice(0, 10);
    const rowCounts = {};
    for (const table of tableNames) {
      try {
        const countRes = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
        rowCounts[table] = parseInt(countRes.rows[0].count, 10);
      } catch (e) {
        rowCounts[table] = 'error';
      }
    }
    res.json({
      pool: poolState,
      dbVersion: versionRes.rows[0].version,
      dbUser: userRes.rows[0].current_user,
      tables: tablesRes.rows.map(r => r.table_name),
      rowCounts
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch database info', details: err.message });
  }
});

/* ============================================================================
   AUTH – LOGIN
============================================================================ */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, browser, os, deviceType, ipAddress } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Validate that password is a string
    if (typeof password !== 'string') {
      console.error('❌ Invalid password type:', typeof password, password);
      return res.status(400).json({ error: 'Invalid password format' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1 AND status = 'Active'`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // Debug logging
    console.log('🔍 Login attempt for:', email);
    console.log('🔍 User ID:', user.id);
    console.log('🔍 Password hash type:', typeof user.password_hash);
    console.log('🔍 Password hash value:', user.password_hash ? `${user.password_hash.substring(0, 20)}...` : 'NULL/UNDEFINED');
    console.log('🔍 Password hash length:', user.password_hash ? user.password_hash.length : 0);

    // Validate password_hash exists and is a string
    if (!user.password_hash || typeof user.password_hash !== 'string') {
      console.error('❌ Invalid password_hash for user:', user.email, 'Type:', typeof user.password_hash);
      return res.status(500).json({ error: 'Account configuration error. Please contact administrator.' });
    }

    // 🔐 bcrypt compare (FIXED)
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      // Log failed login attempt with device metadata
      const logId = `mfa_log_${Date.now()}`;
      await pool.query(
        `INSERT INTO mfa_logs (id, userId, timestamp, status, loginAttempt, loginSource, ipAddress, browser, os, device) 
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'failed', 'Invalid password', 'password', $3, $4, $5, $6)`,
        [logId, user.id, ipAddress || 'Unknown', browser || 'Unknown', os || 'Unknown', deviceType || 'Unknown']
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ CHECK IF USER HAS 2FA/MFA ENABLED
    const securityCheck = await pool.query(
      `SELECT totpEnabled FROM user_security_settings WHERE userId = $1`,
      [user.id]
    );

    console.log('🔐 MFA Security Check for user:', user.email);
    console.log('🔐 Security settings rows:', securityCheck.rows);
    console.log('🔐 Row count:', securityCheck.rows.length);

    // PostgreSQL returns column names in lowercase unless quoted in query
    const totpEnabled = securityCheck.rows.length > 0 &&
      (securityCheck.rows[0].totpenabled === true || securityCheck.rows[0].totpEnabled === true);

    if (securityCheck.rows.length > 0) {
      console.log('🔐 totpEnabled value (lowercase):', securityCheck.rows[0].totpenabled);
      console.log('🔐 totpEnabled value (camelCase):', securityCheck.rows[0].totpEnabled);
      console.log('🔐 Final totpEnabled:', totpEnabled);
    }
    console.log('🔐 Final totpEnabled result:', totpEnabled);

    // If MFA is enabled, user must verify TOTP before login
    if (totpEnabled) {
      console.log('✅ MFA IS ENABLED - Requiring MFA verification');
      // Return session token for MFA verification step
      const sessionToken = crypto.randomBytes(32).toString('hex');
      res.json({
        success: false,
        requiresMFA: true,
        sessionToken: sessionToken,
        userId: user.id,
        message: 'MFA verification required',
        loginSource: 'password'
      });
      return;
    }

    console.log('⚠️  MFA NOT ENABLED - Allowing direct login');

    // Remove password hash before sending
    const { password_hash, ...safeUser } = user;

    // Log successful login with password only (no MFA) with device metadata
    const logId = `mfa_log_${Date.now()}`;
    await pool.query(
      `INSERT INTO mfa_logs (id, userId, timestamp, status, loginAttempt, loginSource, ipAddress, browser, os, device) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'success', 'Password login - No MFA', 'password', $3, $4, $5, $6)`,
      [logId, user.id, ipAddress || 'Unknown', browser || 'Unknown', os || 'Unknown', deviceType || 'Unknown']
    );

    // Log successful login to Activity Logs
    const activityLogId = `log_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await pool.query(
      `INSERT INTO logs (id, userId, userName, userRole, action, module, details, timestamp, ipAddress) 
       VALUES ($1, $2, $3, $4, 'Login', 'Auth', 'User logged in successfully', CURRENT_TIMESTAMP, $5)`,
      [activityLogId, user.id, user.name, user.role, ipAddress || 'Unknown']
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: safeUser,
      loginSource: 'password'
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ============================================================================
   SECURE USER CREATION (ADMIN/SETTINGS)
============================================================================ */
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, avatar, designation, branchIds, linkedEmployee, accessModules } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role required' });
    }
    // Check if user exists
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'User already exists' });
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    // Generate user id
    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    // Create linked employee if requested
    let employeeId = null;
    if (linkedEmployee && linkedEmployee.name && linkedEmployee.email) {
      employeeId = `emp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      await pool.query(
        `INSERT INTO employees (id, name, email, designation, branchId, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'Active', NOW(), NOW())`,
        [employeeId, linkedEmployee.name, linkedEmployee.email, linkedEmployee.designation || '', linkedEmployee.branchId || null]
      );
    }
    // Insert user
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar, designation, branchIds, linkedEmployeeId, accessModules, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Active', NOW(), NOW())`,
      [userId, name, email, password_hash, role, avatar || null, designation || '', branchIds || [], employeeId, accessModules || ['dashboard']]
    );
    res.status(201).json({ success: true, userId, employeeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   GET ALL USERS (ADMIN/SETTINGS)
============================================================================ */
app.get('/api/users/list', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, avatar, designation, status, branchIds, linkedEmployeeId, accessModules, created_at, updated_at 
         FROM users 
         ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
 UPDATE USER (ADMIN ONLY)
============================================================================ */
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      role,
      status,
      avatar,
      designation,
      branchIds,
      accessModules,
      linkedEmployee
    } = req.body;

    // 🔐 Basic validation
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    // Build dynamic update
    const fields = [];
    const values = [];
    let i = 1;

    fields.push(`name = $${i++}`); values.push(name);
    fields.push(`email = $${i++}`); values.push(email);
    fields.push(`role = $${i++}`); values.push(role);
    fields.push(`status = $${i++}`); values.push(status || 'Active');
    fields.push(`avatar = $${i++}`); values.push(avatar || null);
    fields.push(`designation = $${i++}`); values.push(designation || '');
    fields.push(`branchIds = $${i++}`); values.push(branchIds || []);
    fields.push(`accessModules = $${i++}`); values.push(accessModules || ['dashboard']);

    // 🔐 Update password ONLY if provided
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = $${i++}`);
      values.push(password_hash);
    }

    // Linked employee update (optional)
    if (linkedEmployee) {
      fields.push(`linkedEmployeeId = $${i++}`);
      values.push(linkedEmployee);
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${i}
      RETURNING id, name, email, role, status, avatar, designation, branchIds, accessModules, updated_at
    `;

    const { rows } = await pool.query(query, [...values, id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });

  } catch (err) {
    console.error('❌ User update error:', err);
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================================
   DELETE USER (ADMIN ONLY)
============================================================================ */
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: check if user exists
    const existing = await pool.query(
      'SELECT id, linkedEmployeeId FROM users WHERE id = $1',
      [id]
    );

    if (!existing.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const linkedEmployeeId = existing.rows[0].linkedemployeeid;

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    // Optional cleanup: linked employee
    if (linkedEmployeeId) {
      await pool.query(
        'DELETE FROM employees WHERE id = $1',
        [linkedEmployeeId]
      );
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (err) {
    console.error('❌ User delete error:', err);
    res.status(500).json({ error: err.message });
  }
});



/* ============================================================================
   GENERIC CRUD (⚠️ USERS TABLE BLOCKED)
============================================================================ */
const BLOCKED_TABLES = ['users'];

// Helper function to normalize column names from PostgreSQL to camelCase
const normalizeEmployeeRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    branchId: row.branchid || row.branchId,
    employeeId: row.employeeid || row.employeeId,
    joinDate: row.joindate || row.joinDate,
    zipCode: row.zipcode || row.zipCode,
    emergencyContact: row.emergencycontact || row.emergencyContact,
    emergencyPhone: row.emergencyphone || row.emergencyPhone,
    bankAccount: row.bankaccount || row.bankAccount,
    bankName: row.bankname || row.bankName,
    ifscCode: row.ifsccode || row.ifscCode
  };
};

app.get('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    if (BLOCKED_TABLES.includes(table)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if table exists in public schema to avoid crashing on missing tables
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
      [table]
    );

    if (!tableCheck.rows[0].exists) {
      console.warn(`Attempted to fetch non-existent table: ${table}`);
      return res.json([]); // Return empty array for convenience
    }

    let query = `SELECT * FROM ${table}`;
    const values = [];

    // Support simple filtering for emails table
    if (table === 'emails' && req.query.folder) {
      query += ` WHERE folder = $1`;
      values.push(req.query.folder);
    }

    // Dynamic ordering based on available columns
    const columnsCheck = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1",
      [table]
    );
    const columns = columnsCheck.rows.map(c => c.column_name);

    if (columns.includes('timestamp')) {
      query += ` ORDER BY timestamp DESC`;
    } else if (columns.includes('created_at')) {
      query += ` ORDER BY created_at DESC`;
    } else if (columns.includes('createdAt')) {
      query += ` ORDER BY "createdAt" DESC`;
    }

    const { rows } = await pool.query(query, values);

    // Normalize employees data
    if (table === 'employees') {
      const normalizedRows = rows.map(normalizeEmployeeRow);
      return res.json(normalizedRows);
    }

    res.json(rows);

  } catch (err) {
    console.error(`Error fetching table ${req.params.table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    if (BLOCKED_TABLES.includes(table)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM ${table} WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Normalize employees data
    if (table === 'employees') {
      return res.json(normalizeEmployeeRow(rows[0]));
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  try {

    if (BLOCKED_TABLES.includes(table)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = req.body;
    const keys = Object.keys(data);
    const values = Object.values(data).map(val => {
      // Convert arrays/objects to JSON strings for JSONB columns
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return JSON.stringify(val);
      }
      if (Array.isArray(val)) {
        // Handle both empty arrays and arrays with objects
        if (val.length === 0 || typeof val[0] === 'object') {
          return JSON.stringify(val);
        }
      }
      return val;
    });

    // Build values clause with proper JSONB casting for permission_groups table
    const valuesClause = keys.map((k, i) => {
      if (table === 'permission_groups' && k === 'permissions') {
        return `$${i + 1}::jsonb`;
      }
      return `$${i + 1}`;
    }).join(',');

    const query = `
      INSERT INTO ${table} (${keys.join(',')})
      VALUES (${valuesClause})
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    // Normalize employees data
    if (table === 'employees') {
      return res.status(201).json(normalizeEmployeeRow(rows[0]));
    }

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(`❌ Error creating ${table}:`, err.message);
    console.error(`Full error:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {

    if (BLOCKED_TABLES.includes(table)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = req.body;
    delete data.id;

    const keys = Object.keys(data);
    const tableName = table; // Store in local variable for closure
    const values = Object.values(data).map(val => {
      // Convert arrays/objects to JSON strings for JSONB columns
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return JSON.stringify(val);
      }
      if (Array.isArray(val)) {
        // Handle both empty arrays and arrays with objects
        if (val.length === 0 || typeof val[0] === 'object') {
          return JSON.stringify(val);
        }
      }
      return val;
    });

    // Build SET clause with proper JSONB casting for permission_groups table
    const setClause = keys.map((k, i) => {
      if (tableName === 'permission_groups' && k === 'permissions') {
        return `${k} = $${i + 1}::jsonb`;
      }
      return `${k} = $${i + 1}`;
    }).join(', ');

    const query = `
      UPDATE ${table}
      SET ${setClause},
          updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const { rows } = await pool.query(query, [...values, id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    // Normalize employees data
    if (table === 'employees') {
      return res.json(normalizeEmployeeRow(rows[0]));
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(`❌ Error updating ${table}:`, err.message);
    console.error(`Full error:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    if (BLOCKED_TABLES.includes(table)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await pool.query(
      `DELETE FROM ${table} WHERE id = $1 RETURNING *`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    res.json({ deleted: rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   2FA & AUTHENTICATOR ENDPOINTS
============================================================================ */

// Setup TOTP - Generate QR code and secret
app.get('/api/auth/totp/setup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SD Commercial HR Portal (${userId})`,
      issuer: 'SD Commercial UK LTD',
      length: 32
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret (not yet enabled)
    const id = `totp_${Date.now()}`;
    await pool.query(
      `INSERT INTO user_totp (id, userId, secret, enabled) 
       VALUES ($1, $2, $3, false) 
       ON CONFLICT (userId) DO UPDATE SET secret = $3, updatedAt = CURRENT_TIMESTAMP`,
      [id, userId, secret.base32]
    );

    res.json({
      secret: secret.base32,
      qrCode: qrCode,
      otpauthUrl: secret.otpauth_url
    });
  } catch (err) {
    console.error('TOTP setup error:', err);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
});

// Verify TOTP and enable 2FA
app.post('/api/auth/totp/verify', async (req, res) => {
  try {
    const { userId, code, deviceName, deviceType, browser, os, ipAddress } = req.body;

    // Get the stored secret
    const secretRes = await pool.query(
      'SELECT secret FROM user_totp WHERE userId = $1',
      [userId]
    );

    if (!secretRes.rows.length) {
      return res.status(400).json({ error: 'TOTP not setup' });
    }

    const secret = secretRes.rows[0].secret;

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      // Log failed attempt
      const logId = `mfa_log_${Date.now()}`;
      await pool.query(
        `INSERT INTO mfa_logs (id, userId, timestamp, status, loginAttempt) 
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'failed', 'TOTP verification failed')`,
        [logId, userId]
      );
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Enable TOTP
    await pool.query(
      `UPDATE user_totp SET enabled = true, verifiedAt = CURRENT_TIMESTAMP 
       WHERE userId = $1`,
      [userId]
    );

    // Update security settings
    await pool.query(
      `INSERT INTO user_security_settings (id, userId, totpEnabled) 
       VALUES ($1, $2, true) 
       ON CONFLICT (userId) DO UPDATE SET totpEnabled = true, updatedAt = CURRENT_TIMESTAMP`,
      [`sec_${userId}`, userId]
    );

    // Use provided metadata or defaults
    const finalDeviceType = deviceType || 'desktop';
    const finalBrowser = browser || 'Unknown';
    const finalOS = os || 'Unknown';
    const finalIPAddress = ipAddress || '0.0.0.0';
    const finalDeviceName = deviceName || 'Primary Device';

    // Create trusted device with accurate metadata
    const deviceId = `device_${Date.now()}`;
    const deviceFingerprint = crypto.createHash('sha256')
      .update(`${userId}_${finalDeviceName}_${finalBrowser}_${finalOS}`)
      .digest('hex');

    await pool.query(
      `INSERT INTO trusted_devices (id, userId, deviceName, deviceType, browser, os, ipAddress, deviceFingerprint, isCurrentDevice, addedAt, lastUsedAt) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [deviceId, userId, finalDeviceName, finalDeviceType, finalBrowser, finalOS, finalIPAddress, deviceFingerprint]
    );

    // Log successful setup
    const logId = `mfa_log_${Date.now()}`;
    await pool.query(
      `INSERT INTO mfa_logs (id, userId, deviceId, timestamp, ipAddress, browser, os, device, status, loginAttempt) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, 'success', '2FA Setup Completed')`,
      [logId, userId, deviceId, finalIPAddress, finalBrowser, finalOS, finalDeviceType]
    );

    res.json({ success: true, message: 'TOTP verified and enabled', device: { id: deviceId, deviceName: finalDeviceName, browser: finalBrowser, os: finalOS, ipAddress: finalIPAddress } });
  } catch (err) {
    console.error('TOTP verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Disable TOTP
// ✅ NEW: MFA Verification for Login
app.post('/api/auth/login/verify-mfa', async (req, res) => {
  try {
    const { userId, code, deviceType, browser, os, ipAddress } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and code required' });
    }

    // Get the stored TOTP secret
    const secretRes = await pool.query(
      'SELECT secret FROM user_totp WHERE userId = $1',
      [userId]
    );

    if (!secretRes.rows.length) {
      // Log failed MFA attempt
      const logId = `mfa_log_${Date.now()}`;
      await pool.query(
        `INSERT INTO mfa_logs (id, userId, timestamp, status, loginAttempt, loginSource) 
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'failed', 'TOTP not setup', 'mfa')`,
        [logId, userId]
      );
      return res.status(400).json({ error: 'TOTP not setup' });
    }

    const secret = secretRes.rows[0].secret;

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      // Log failed MFA attempt
      const logId = `mfa_log_${Date.now()}`;
      await pool.query(
        `INSERT INTO mfa_logs (id, userId, timestamp, status, loginAttempt, loginSource) 
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'failed', 'Invalid MFA code', 'mfa')`,
        [logId, userId]
      );
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Get user for response
    const userRes = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];
    const { password_hash, ...safeUser } = user;

    // Update last used device if applicable
    const finalDeviceType = deviceType || 'desktop';
    const finalBrowser = browser || 'Unknown';
    const finalOS = os || 'Unknown';
    const finalIPAddress = ipAddress || '0.0.0.0';

    // Log successful MFA login
    const logId = `mfa_log_${Date.now()}`;
    await pool.query(
      `INSERT INTO mfa_logs (id, userId, timestamp, ipAddress, browser, os, device, status, loginAttempt, loginSource) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, 'success', 'MFA login successful', 'mfa')`,
      [logId, userId, finalIPAddress, finalBrowser, finalOS, finalDeviceType]
    );

    res.json({
      success: true,
      message: 'MFA verification successful',
      user: safeUser,
      loginSource: 'mfa'
    });

  } catch (err) {
    console.error('MFA login verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/auth/totp/disable', async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query(
      'UPDATE user_totp SET enabled = false, updatedAt = CURRENT_TIMESTAMP WHERE userId = $1',
      [userId]
    );

    await pool.query(
      `UPDATE user_security_settings SET totpEnabled = false, updatedAt = CURRENT_TIMESTAMP 
       WHERE userId = $1`,
      [userId]
    );

    // Log the disabling
    const logId = `mfa_log_${Date.now()}`;
    await pool.query(
      `INSERT INTO mfa_logs (id, userId, timestamp, status, loginAttempt) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'success', '2FA Disabled')`,
      [logId, userId]
    );

    res.json({ success: true, message: 'TOTP disabled' });
  } catch (err) {
    console.error('TOTP disable error:', err);
    res.status(500).json({ error: 'Failed to disable TOTP' });
  }
});

// Get security settings
app.get('/api/auth/security-settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let settings = await pool.query(
      'SELECT totpEnabled, otpEnabled FROM user_security_settings WHERE userId = $1',
      [userId]
    );

    if (!settings.rows.length) {
      // Create default settings
      const id = `sec_${userId}`;
      await pool.query(
        `INSERT INTO user_security_settings (id, userId, totpEnabled, otpEnabled) 
         VALUES ($1, $2, false, false)`,
        [id, userId]
      );
      return res.json({ totpEnabled: false, otpEnabled: false });
    }

    // PostgreSQL returns lowercase column names
    const row = settings.rows[0];
    res.json({
      totpEnabled: row.totpenabled || row.totpEnabled || false,
      otpEnabled: row.otpenabled || row.otpEnabled || false
    });
  } catch (err) {
    console.error('Security settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update security settings
app.post('/api/auth/security-settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { totpEnabled, otpEnabled } = req.body;

    // Check if settings exist
    let settings = await pool.query(
      'SELECT * FROM user_security_settings WHERE userId = $1',
      [userId]
    );

    if (!settings.rows.length) {
      // Create new settings
      const id = `sec_${userId}`;
      await pool.query(
        `INSERT INTO user_security_settings (id, userId, totpEnabled, otpEnabled) 
         VALUES ($1, $2, $3, $4)`,
        [id, userId, totpEnabled ?? false, otpEnabled ?? false]
      );
    } else {
      // Update existing settings
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (totpEnabled !== undefined) {
        updates.push(`totpEnabled = $${paramCount++}`);
        values.push(totpEnabled);
      }
      if (otpEnabled !== undefined) {
        updates.push(`otpEnabled = $${paramCount++}`);
        values.push(otpEnabled);
      }

      if (updates.length > 0) {
        values.push(userId);
        await pool.query(
          `UPDATE user_security_settings SET ${updates.join(', ')} WHERE userId = $${paramCount}`,
          values
        );
      }
    }

    // Fetch and return updated settings
    const updated = await pool.query(
      'SELECT totpEnabled, otpEnabled FROM user_security_settings WHERE userId = $1',
      [userId]
    );

    // PostgreSQL returns lowercase column names
    const row = updated.rows[0];
    res.json({
      totpEnabled: row.totpenabled || row.totpEnabled || false,
      otpEnabled: row.otpenabled || row.otpEnabled || false
    });
  } catch (err) {
    console.error('Update security settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/* ============================================================================ 
   OTP-BASED LOGIN ENDPOINTS
============================================================================ */

// Generate OTP for email login
app.post('/api/auth/otp/generate', async (req, res) => {
  try {
    const { email, purpose = 'login' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, name FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userCheck.rows.length === 0) {
      // For security, don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, an OTP has been sent.'
      });
    }

    const user = userCheck.rows[0];

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused OTPs for this email
    await pool.query(
      'DELETE FROM user_otp WHERE email = $1 AND verified = false AND expiresAt > CURRENT_TIMESTAMP',
      [email]
    );

    // Store OTP
    const otpId = `otp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await pool.query(
      `INSERT INTO user_otp (id, userId, email, otpCode, expiresAt, purpose, attempts) 
       VALUES ($1, $2, $3, $4, $5, $6, 0)`,
      [otpId, user.id, email, otpCode, expiresAt, purpose]
    );

    // TODO: Send OTP via email (requires SMTP configuration)
    // For now, log it to console (REMOVE IN PRODUCTION)
    console.log(`🔐 OTP for ${email}: ${otpCode} (expires in 10 minutes)`);
    console.log(`📧 Purpose: ${purpose}`);

    // In production, send email here:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Login OTP Code',
      html: `
        <h2>Your OTP Code</h2>
        <p>Use this code to login: <strong>${otpCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
    */

    res.json({
      success: true,
      message: 'OTP sent to your email',
      expiresIn: 600 // seconds
    });

  } catch (err) {
    console.error('OTP generation error:', err);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Verify OTP and login
app.post('/api/auth/otp/verify', async (req, res) => {
  try {
    const { email, otpCode, deviceType, browser, os, ipAddress } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }

    // Find valid OTP
    const otpCheck = await pool.query(
      `SELECT * FROM user_otp 
       WHERE email = $1 
       AND otpCode = $2 
       AND verified = false 
       AND expiresAt > CURRENT_TIMESTAMP 
       ORDER BY createdAt DESC 
       LIMIT 1`,
      [email, otpCode]
    );

    if (otpCheck.rows.length === 0) {
      // Increment failed attempts
      await pool.query(
        `UPDATE user_otp 
         SET attempts = attempts + 1 
         WHERE email = $1 AND verified = false`,
        [email]
      );

      return res.status(401).json({ error: 'Invalid or expired OTP code' });
    }

    const otp = otpCheck.rows[0];

    // Check attempts limit
    if (otp.attempts >= 5) {
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Mark OTP as verified
    await pool.query(
      'UPDATE user_otp SET verified = true, usedAt = CURRENT_TIMESTAMP WHERE id = $1',
      [otp.id]
    );

    // Get user details
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [otp.userid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const { password_hash, ...safeUser } = user;

    // Log successful login
    const logId = `mfa_log_${Date.now()}`;
    await pool.query(
      `INSERT INTO mfa_logs (id, userId, timestamp, status, loginAttempt, loginSource, ipAddress, browser, os, device) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'success', 'OTP login', 'otp', $3, $4, $5, $6)`,
      [logId, user.id, ipAddress || 'Unknown', browser || 'Unknown', os || 'Unknown', deviceType || 'Unknown']
    );

    res.json({
      success: true,
      user: safeUser,
      message: 'Login successful'
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Request password reset OTP
app.post('/api/auth/password-reset/request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, name FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    // For security, always return success even if email doesn't exist
    if (userCheck.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset code has been sent.'
      });
    }

    const user = userCheck.rows[0];

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for password reset

    // Delete any existing unused password reset OTPs
    await pool.query(
      `DELETE FROM user_otp 
       WHERE email = $1 
       AND purpose = 'password_reset' 
       AND verified = false`,
      [email]
    );

    // Store OTP
    const otpId = `otp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await pool.query(
      `INSERT INTO user_otp (id, userId, email, otpCode, expiresAt, purpose, attempts) 
       VALUES ($1, $2, $3, $4, $5, 'password_reset', 0)`,
      [otpId, user.id, email, otpCode, expiresAt]
    );

    // TODO: Send email (requires SMTP)
    console.log(`🔐 Password Reset OTP for ${email}: ${otpCode} (expires in 15 minutes)`);

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      expiresIn: 900 // seconds
    });

  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with OTP
app.post('/api/auth/password-reset/verify', async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find valid OTP
    const otpCheck = await pool.query(
      `SELECT * FROM user_otp 
       WHERE email = $1 
       AND otpCode = $2 
       AND purpose = 'password_reset'
       AND verified = false 
       AND expiresAt > CURRENT_TIMESTAMP 
       ORDER BY createdAt DESC 
       LIMIT 1`,
      [email, otpCode]
    );

    if (otpCheck.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired reset code' });
    }

    const otp = otpCheck.rows[0];

    // Check attempts
    if (otp.attempts >= 5) {
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new code.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, otp.userid]
    );

    // Mark OTP as used
    await pool.query(
      'UPDATE user_otp SET verified = true, usedAt = CURRENT_TIMESTAMP WHERE id = $1',
      [otp.id]
    );

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (err) {
    console.error('Password reset verify error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get trusted devices
app.get('/api/auth/trusted-devices/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const devices = await pool.query(
      `SELECT id, deviceName, deviceType, browser, os, ipAddress, deviceFingerprint, 
              addedAt, lastUsedAt, isCurrentDevice 
       FROM trusted_devices 
       WHERE userId = $1 AND revokedAt IS NULL 
       ORDER BY lastUsedAt DESC`,
      [userId]
    );

    res.json(devices.rows);
  } catch (err) {
    console.error('Get devices error:', err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Revoke device
app.post('/api/auth/device/revoke', async (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    await pool.query(
      `UPDATE trusted_devices SET revokedAt = CURRENT_TIMESTAMP 
       WHERE id = $1 AND userId = $2`,
      [deviceId, userId]
    );

    res.json({ success: true, message: 'Device revoked' });
  } catch (err) {
    console.error('Revoke device error:', err);
    res.status(500).json({ error: 'Failed to revoke device' });
  }
});

// Get MFA logs
app.get('/api/auth/mfa-logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const logs = await pool.query(
      `SELECT id, userId, timestamp, ipAddress, browser, os, device, status, loginAttempt, deviceId 
       FROM mfa_logs 
       WHERE userId = $1 
       ORDER BY timestamp DESC 
       LIMIT 50`,
      [userId]
    );

    // Enrich logs with device names
    const enrichedLogs = await Promise.all(
      logs.rows.map(async (log) => {
        if (log.deviceId) {
          const deviceRes = await pool.query(
            'SELECT deviceName FROM trusted_devices WHERE id = $1',
            [log.deviceId]
          );
          if (deviceRes.rows.length) {
            log.deviceName = deviceRes.rows[0].deviceName;
          }
        }
        return log;
      })
    );

    res.json(enrichedLogs);
  } catch (err) {
    console.error('Get MFA logs error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/* ============================================================================ 
   AI EMAIL ASSISTANCE
============================================================================ */
app.post('/api/ai-email/suggest', async (req, res) => {
  try {
    const { subject, body, context, type } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      return res.json({
        suggestion: "AI assistance is not configured. Please set GEMINI_API_KEY in .env file."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";
    if (type === 'reply') {
      prompt = `Draft a professional reply to this email.
      Subject: ${subject}
      Body: ${body}
      Context: ${context || 'None'}
      Please provide only the body of the email.`;
    } else {
      prompt = `Provide a professional draft for an email.
      Subject: ${subject}
      Initial Content idea: ${body}
      Context: ${context || 'None'}
      Please provide only the draft body text.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ suggestion: text });
  } catch (err) {
    console.error('AI Email Error:', err);
    res.status(500).json({ error: 'Failed to generate AI suggestion' });
  }
});

/* ============================================================================ 
   OUTLOOK OAUTH CALLBACK
============================================================================ */
app.get('/hr_portal/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) {
      console.error('Outlook OAuth Error:', error);
      return res.redirect('/#activeFolder=settings&oauthStatus=error');
    }

    if (!code) {
      return res.redirect('/#activeFolder=settings&oauthStatus=nocode');
    }

    console.log('✅ Received Outlook OAuth code:', code);

    // Simulate token storage for now
    const tokenId = `token_${Date.now()}`;
    await pool.query(
      `INSERT INTO user_outlook_tokens (id, user_email, access_token, refresh_token, expires_at) 
       VALUES ($1, $2, $3, $4, NOW() + interval '1 hour')
       ON CONFLICT (user_email) DO UPDATE SET access_token = $3, updated_at = NOW()`,
      [tokenId, 'dinesh.k@microsoft.com', 'simulated_access_token', 'simulated_refresh_token']
    );

    res.redirect('/#activeFolder=settings&oauthStatus=success');
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect('/#activeFolder=settings&oauthStatus=failure');
  }
});

/* ============================================================================
   SERVER START
============================================================================ */
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ Server running`);
  console.log(`🌐 http://localhost:${PORT}/api`);
  console.log(`🔍 Health: /api/health`);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  server.close(() => {
    // Close pool after server stops accepting connections
    pool.end()
      .then(() => {
        console.log('✅ Database pool closed');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error closing pool:', err);
        process.exit(1);
      });
  });
});
