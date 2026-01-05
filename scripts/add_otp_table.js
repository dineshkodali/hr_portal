// Migration script to add OTP table for email-based login
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'hr_portal',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres'
});

async function addOTPTable() {
  try {
    console.log('🔄 Starting OTP table migration...');

    // Check if table already exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_otp'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('⚠️  Table user_otp already exists. Skipping creation.');
    } else {
      // Create OTP table
      await pool.query(`
        CREATE TABLE user_otp (
          id VARCHAR(50) PRIMARY KEY,
          userId VARCHAR(50),
          email VARCHAR(255) NOT NULL,
          otpCode VARCHAR(10) NOT NULL,
          expiresAt TIMESTAMP NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          attempts INT DEFAULT 0,
          purpose VARCHAR(50) CHECK (purpose IN ('login', 'password_reset', 'verification')),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usedAt TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      console.log('✅ Table user_otp created successfully');

      // Create indexes
      await pool.query(`CREATE INDEX idx_user_otp_email ON user_otp(email);`);
      await pool.query(`CREATE INDEX idx_user_otp_userId ON user_otp(userId);`);
      await pool.query(`CREATE INDEX idx_user_otp_expires ON user_otp(expiresAt);`);
      await pool.query(`CREATE INDEX idx_user_otp_verified ON user_otp(verified);`);
      console.log('✅ Indexes created successfully');
    }

    // Update user_security_settings to ensure otpEnabled column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='user_security_settings' AND column_name='otpenabled';
    `);

    if (columnCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE user_security_settings 
        ADD COLUMN IF NOT EXISTS otpEnabled BOOLEAN DEFAULT FALSE;
      `);
      console.log('✅ Added otpEnabled column to user_security_settings');
    } else {
      console.log('⚠️  Column otpEnabled already exists in user_security_settings');
    }

    console.log('✅ OTP migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Configure SMTP settings for sending OTP emails');
    console.log('2. Restart the server: npm run server');
    console.log('3. Test OTP login from the login page');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addOTPTable().catch(console.error);
