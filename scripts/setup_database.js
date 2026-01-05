import 'dotenv/config';
import { Pool, Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ADMIN_PASSWORD = 'admin123';
const EMPLOYEE_PASSWORD = 'employee123';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminClient = new Client({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: 'postgres',
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function createDatabase() {
  try {
    await adminClient.connect();
    console.log('🔗 Connected to PostgreSQL (admin)');

    const dbName = process.env.PGDATABASE || 'hr_portal';
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database created: ${dbName}`);
    } else {
      console.log(`✅ Database already exists: ${dbName}`);
    }

    await adminClient.end();
  } catch (err) {
    console.error('❌ Error creating database:', err.message);
    process.exit(1);
  }
}

async function createTables() {
  try {
    await pool.connect();
    console.log('🔗 Connected to hr_portal database');
    console.log('📝 Applying database schema...');

    const schemaPath = path.join(__dirname, '..', 'database_schema_postgresql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon, properly handling dollar-quoted strings
    const queries = [];
    let currentQuery = '';
    let inDollarQuote = false;
    let dollarQuoteDelim = '';
    let charIndex = 0;

    while (charIndex < schema.length) {
      const char = schema[charIndex];
      const remaining = schema.substring(charIndex);

      // Check for dollar quote delimiters
      const dollarMatch = remaining.match(/^\$\w*\$/);
      if (dollarMatch) {
        const delim = dollarMatch[0];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarQuoteDelim = delim;
        } else if (delim === dollarQuoteDelim) {
          inDollarQuote = false;
          dollarQuoteDelim = '';
        }
        currentQuery += delim;
        charIndex += delim.length;
        continue;
      }

      // Check for statement terminator (semicolon)
      if (char === ';' && !inDollarQuote) {
        currentQuery += char;
        const trimmed = currentQuery.trim();
        if (trimmed.length > 0 && !trimmed.startsWith('--')) {
          queries.push(trimmed);
        }
        currentQuery = '';
        charIndex++;
        continue;
      }

      currentQuery += char;
      charIndex++;
    }

    // Execute all queries
    let successCount = 0;
    let skipCount = 0;
    
    for (const query of queries) {
      try {
        await pool.query(query);
        successCount++;
      } catch (err) {
        // Skip "already exists" and "duplicate" errors
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate key') ||
            err.message.includes('conflicting data type')) {
          skipCount++;
        } else {
          console.warn(`⚠️  ${err.message}`);
          skipCount++;
        }
      }
    }

    console.log(`✅ Tables created successfully (${successCount} executed, ${skipCount} skipped)`);
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    process.exit(1);
  }
}

async function seedUsers() {
  try {
    console.log('🌱 Seeding demo users...');

    // Import bcrypt
    const bcrypt = await import('bcryptjs');

    const hashedAdminPwd = await bcrypt.default.hash(ADMIN_PASSWORD, 10);
    const hashedEmployeePwd = await bcrypt.default.hash(EMPLOYEE_PASSWORD, 10);

    // Add password column if it doesn't exist
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN password VARCHAR(255);`);
    } catch (err) {
      // Column already exists, ignore
      if (!err.message.includes('already exists')) {
        console.warn(`Column check: ${err.message}`);
      }
    }

    const users = [
      {
        id: 'u-admin',
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        avatar: '',
        designation: 'System Admin',
        status: 'Active',
        branchIds: ['b-1'],
        password: hashedAdminPwd,
      },
      {
        id: 'u-employee',
        name: 'Demo Employee',
        email: 'employee@company.com',
        role: 'employee',
        avatar: '',
        designation: 'Staff Member',
        status: 'Active',
        branchIds: ['b-1'],
        password: hashedEmployeePwd,
      },
      {
        id: 'u-manager',
        name: 'Manager User',
        email: 'manager@company.com',
        role: 'manager',
        avatar: '',
        designation: 'Team Manager',
        status: 'Active',
        branchIds: ['b-1'],
        password: hashedEmployeePwd,
      },
    ];

    for (const u of users) {
      const query = `
        INSERT INTO users (id, name, email, role, avatar, designation, status, branchIds, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          updated_at = NOW();
      `;
      await pool.query(query, [
        u.id,
        u.name,
        u.email,
        u.role,
        u.avatar,
        u.designation,
        u.status,
        u.branchIds,
        u.password,
      ]);
      console.log(`✅ Seeded user: ${u.email} (${u.role})`);
    }

    console.log('\n🎉 Demo users created successfully!');
    console.log('\n📝 LOGIN CREDENTIALS:');
    console.log('━'.repeat(50));
    console.log('Admin:');
    console.log(`  Email: admin@company.com`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('Employee:');
    console.log(`  Email: employee@company.com`);
    console.log(`  Password: ${EMPLOYEE_PASSWORD}`);
    console.log('');
    console.log('Manager:');
    console.log(`  Email: manager@company.com`);
    console.log(`  Password: ${EMPLOYEE_PASSWORD}`);
    console.log('━'.repeat(50));
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
    process.exit(1);
  }
}

async function runSetup() {
  try {
    console.log('\n🚀 Starting database setup...\n');
    await createDatabase();
    
    // Wait a moment for database to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await createTables();
    await seedUsers();
    await pool.end();
    console.log('\n✨ Setup complete!\n');
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

runSetup();
