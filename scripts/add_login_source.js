import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
});

async function addLoginSourceColumn() {
  try {
    console.log('🔧 Adding loginSource column to mfa_logs table...');
    
    // Add loginSource column
    await pool.query(`
      ALTER TABLE mfa_logs 
      ADD COLUMN IF NOT EXISTS loginSource VARCHAR(50) CHECK (loginSource IN ('password', 'mfa', 'otp'));
    `);
    
    console.log('✅ loginSource column added successfully!');
    
    // Drop existing column if it exists and add back with new definition
    await pool.query(`
      ALTER TABLE mfa_logs
      DROP COLUMN IF EXISTS loginAttempt CASCADE;
    `);

    await pool.query(`
      ALTER TABLE mfa_logs
      ADD COLUMN IF NOT EXISTS loginAttempt VARCHAR(500);
    `);

    console.log('✅ loginAttempt column refreshed!');
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Column already exists, skipping...');
      process.exit(0);
    }
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

addLoginSourceColumn();
