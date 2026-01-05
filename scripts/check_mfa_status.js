/**
 * Script to check MFA status for all users
 * Run with: node scripts/check_mfa_status.js
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'employee_management',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

async function checkMFAStatus() {
  try {
    console.log('🔍 Connecting to database...\n');
    
    // Get all users with their MFA status
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        COALESCE(s.totpEnabled, false) as mfa_enabled,
        COALESCE(s.otpEnabled, false) as otp_enabled,
        t.secret IS NOT NULL as has_totp_secret
      FROM users u
      LEFT JOIN user_security_settings s ON u.id = s.userId
      LEFT JOIN user_totp t ON u.id = t.userId
      ORDER BY u.name
    `);

    console.log(`📊 Found ${result.rows.length} users\n`);
    console.log('═'.repeat(120));
    console.log('User Report - MFA Status');
    console.log('═'.repeat(120));
    
    for (const user of result.rows) {
      console.log(`\n👤 ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   MFA Enabled: ${user.mfa_enabled ? '✅ YES' : '❌ NO'}`);
      console.log(`   OTP Enabled: ${user.otp_enabled ? '✅ YES' : '❌ NO'}`);
      console.log(`   Has TOTP Secret: ${user.has_totp_secret ? '✅ YES' : '❌ NO'}`);
      
      // Warning if inconsistent
      if (user.mfa_enabled && !user.has_totp_secret) {
        console.log(`   ⚠️  WARNING: MFA enabled but no TOTP secret found!`);
      }
      if (!user.mfa_enabled && user.has_totp_secret) {
        console.log(`   ⚠️  WARNING: TOTP secret exists but MFA not enabled!`);
      }
    }

    console.log('\n' + '═'.repeat(120));
    
    // Summary
    const mfaEnabledCount = result.rows.filter(u => u.mfa_enabled).length;
    const hasSecretCount = result.rows.filter(u => u.has_totp_secret).length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Users: ${result.rows.length}`);
    console.log(`   MFA Enabled: ${mfaEnabledCount}`);
    console.log(`   Has TOTP Secret: ${hasSecretCount}`);
    console.log(`   No MFA: ${result.rows.length - mfaEnabledCount}`);

    if (mfaEnabledCount === 0) {
      console.log(`\n⚠️  NO USERS HAVE MFA ENABLED!`);
      console.log(`   This is why MFA is not being enforced during login.`);
      console.log(`   Users need to set up 2FA in Settings → Security & 2FA → Setup 2FA\n`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkMFAStatus();
