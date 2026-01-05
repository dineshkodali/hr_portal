import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
});

// SQL for creating 2FA tables
const createTablesSQL = `
-- Two-Factor Authentication (TOTP) Setup
CREATE TABLE IF NOT EXISTS user_totp (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL UNIQUE,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  setupDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verifiedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_totp_userId ON user_totp(userId);

-- Trusted Devices (for MFA device management)
CREATE TABLE IF NOT EXISTS trusted_devices (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  deviceName VARCHAR(255),
  deviceType VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  ipAddress VARCHAR(45),
  deviceFingerprint VARCHAR(255),
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastUsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revokedAt TIMESTAMP,
  isCurrentDevice BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_userId ON trusted_devices(userId);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON trusted_devices(deviceFingerprint);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_revoked ON trusted_devices(revokedAt);

-- MFA Login Logs (for security audit trail)
CREATE TABLE IF NOT EXISTS mfa_logs (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  deviceId VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ipAddress VARCHAR(45),
  browser VARCHAR(100),
  os VARCHAR(100),
  device VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('success', 'failed', 'compromised')),
  loginAttempt VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deviceId) REFERENCES trusted_devices(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mfa_logs_userId ON mfa_logs(userId);
CREATE INDEX IF NOT EXISTS idx_mfa_logs_timestamp ON mfa_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_mfa_logs_status ON mfa_logs(status);

-- Security Settings for Users
CREATE TABLE IF NOT EXISTS user_security_settings (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL UNIQUE,
  totpEnabled BOOLEAN DEFAULT FALSE,
  otpEnabled BOOLEAN DEFAULT FALSE,
  backupCodesUsed INT DEFAULT 0,
  lastSecurityCheck TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_security_settings_userId ON user_security_settings(userId);
`;

async function migrate() {
    try {
        console.log('🔐 Starting 2FA database migration...');
        
        // Split SQL into individual statements
        const statements = createTablesSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            await pool.query(statement);
            console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        }

        console.log('✨ 2FA tables created successfully!');
        console.log('📊 Tables created:');
        console.log('  - user_totp');
        console.log('  - trusted_devices');
        console.log('  - mfa_logs');
        console.log('  - user_security_settings');

        // Verify tables were created
        const tables = await pool.query(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
             AND tablename IN ('user_totp', 'trusted_devices', 'mfa_logs', 'user_security_settings')`
        );

        console.log(`\n📈 Verification: ${tables.rows.length}/4 tables found in database`);
        
        if (tables.rows.length === 4) {
            console.log('✅ All 2FA tables successfully created and verified!');
        } else {
            console.log('⚠️ Some tables may not have been created. Please check logs.');
            console.log('Missing tables:', tables.rows.map(t => t.tablename).join(', '));
        }

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
