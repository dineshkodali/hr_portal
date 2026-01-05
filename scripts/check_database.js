import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function checkDatabase() {
  try {
    await pool.connect();
    console.log('✅ Connected to database\n');

    // List all tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`📊 Tables in database (${tables.rows.length}):`);
    if (tables.rows.length === 0) {
      console.log('  ⚠️  No tables found! Database is empty.');
    } else {
      tables.rows.forEach(t => console.log(`  ✅ ${t.table_name}`));
    }

    // Check if users table has data
    if (tables.rows.some(t => t.table_name === 'users')) {
      const users = await pool.query('SELECT id, email, role FROM users LIMIT 10');
      console.log(`\n👥 Users in database (${users.rows.length}):`);
      users.rows.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    }

    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDatabase();
