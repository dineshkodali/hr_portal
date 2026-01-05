#!/usr/bin/env node
import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PGHOST = process.env.PGHOST || 'localhost';
const PGPORT = parseInt(process.env.PGPORT || '5432');
const PGUSER = process.env.PGUSER || 'postgres';
const PGPASSWORD = process.env.PGPASSWORD || 'postgres';
const PGDATABASE = process.env.PGDATABASE || 'hr_portal';

console.log(`\n🗑️  Database Reset & Setup Script`);
console.log(`====================================`);
console.log(`Host: ${PGHOST}:${PGPORT}`);
console.log(`User: ${PGUSER}`);
console.log(`Database: ${PGDATABASE}\n`);

async function dropAndRecreate() {
  // Connect to postgres database to drop hr_portal
  const adminClient = new Client({
    host: PGHOST,
    port: PGPORT,
    user: PGUSER,
    password: PGPASSWORD,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Drop existing database if it exists
    console.log(`🗑️  Dropping database ${PGDATABASE} if exists...`);
    await adminClient.query(`DROP DATABASE IF EXISTS "${PGDATABASE}"`);
    console.log(`✅ Database dropped`);

    // Create fresh database
    console.log(`📦 Creating database ${PGDATABASE}...`);
    await adminClient.query(`CREATE DATABASE "${PGDATABASE}"`);
    console.log(`✅ Database created`);

    await adminClient.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

async function createSchema() {
  const client = new Client({
    host: PGHOST,
    port: PGPORT,
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE
  });

  try {
    await client.connect();
    console.log('✅ Connected to hr_portal database');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database_schema_postgresql.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Split and execute properly
    const queries = [];
    let current = '';
    let inDollarQuote = false;
    let dollarDelim = '';

    for (let i = 0; i < schema.length; i++) {
      const char = schema[i];
      const remaining = schema.substring(i);

      // Check for dollar quote
      const dollarMatch = remaining.match(/^\$[a-zA-Z_]*\$/);
      if (dollarMatch) {
        const delim = dollarMatch[0];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarDelim = delim;
        } else if (delim === dollarDelim) {
          inDollarQuote = false;
        }
        current += delim;
        i += delim.length - 1;
        continue;
      }

      if (char === ';' && !inDollarQuote) {
        current += char;
        const q = current.trim();
        if (q && !q.startsWith('--')) {
          queries.push(q);
        }
        current = '';
        continue;
      }

      current += char;
    }

    console.log(`📝 Executing ${queries.length} SQL statements...`);
    let success = 0;
    let skipped = 0;

    for (const query of queries) {
      try {
        await client.query(query);
        success++;
      } catch (err) {
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate') ||
            err.message.includes('does not exist')) {
          skipped++;
        } else {
          console.warn(`⚠️  ${err.message.substring(0, 100)}`);
          skipped++;
        }
      }
    }

    console.log(`✅ Schema applied (${success} executed, ${skipped} skipped)`);
    await client.end();
  } catch (err) {
    console.error('❌ Schema error:', err.message);
    process.exit(1);
  }
}

async function seedUsers() {
  const client = new Client({
    host: PGHOST,
    port: PGPORT,
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE
  });

  try {
    await client.connect();
    console.log('🌱 Seeding users...');

    const bcrypt = await import('bcryptjs');
    
    const users = [
      {
        id: 'u-admin',
        email: 'admin@company.com',
        password: await bcrypt.default.hash('admin123', 10),
        name: 'Admin User',
        role: 'admin'
      },
      {
        id: 'u-employee',
        email: 'employee@company.com',
        password: await bcrypt.default.hash('employee123', 10),
        name: 'Employee User',
        role: 'employee'
      },
      {
        id: 'u-manager',
        email: 'manager@company.com',
        password: await bcrypt.default.hash('employee123', 10),
        name: 'Manager User',
        role: 'manager'
      }
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, password, name, role, designation, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password`,
        [u.id, u.email, u.password, u.name, u.role, 'Employee', 'Active']
      );
      console.log(`  ✅ ${u.email}`);
    }

    await client.end();
    console.log('\n✨ Setup complete!\n');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('═'.repeat(50));
    console.log('Admin:');
    console.log('  Email: admin@company.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Employee:');
    console.log('  Email: employee@company.com');
    console.log('  Password: employee123');
    console.log('');
    console.log('Manager:');
    console.log('  Email: manager@company.com');
    console.log('  Password: employee123');
    console.log('═'.repeat(50));
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await dropAndRecreate();
    await createSchema();
    await seedUsers();
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

main();
