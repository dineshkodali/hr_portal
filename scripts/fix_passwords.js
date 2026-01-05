/**
 * Script to check and fix user password hashes in the database
 * Run with: node scripts/fix_passwords.js
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'employee_management',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

async function checkAndFixPasswords() {
  try {
    console.log('🔍 Connecting to database...');
    await pool.connect();
    console.log('✅ Connected!\n');

    // Get all users
    const result = await pool.query('SELECT id, name, email, password_hash FROM users');
    const users = result.rows;

    console.log(`📊 Found ${users.length} users\n`);

    let fixedCount = 0;
    let issueCount = 0;

    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Password hash type: ${typeof user.password_hash}`);
      
      if (!user.password_hash) {
        console.log(`   ❌ NULL password hash`);
        issueCount++;
        
        // Set default password: "password123"
        const defaultPassword = 'password123';
        const newHash = await bcrypt.hash(defaultPassword, 10);
        
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE id = $2',
          [newHash, user.id]
        );
        
        console.log(`   ✅ Fixed with default password: ${defaultPassword}`);
        fixedCount++;
        continue;
      }

      if (typeof user.password_hash === 'object') {
        console.log(`   ❌ Password hash is an object, not a string`);
        console.log(`   Value:`, user.password_hash);
        issueCount++;
        
        // Try to extract string value if it's a buffer or object
        let hashString = null;
        if (Buffer.isBuffer(user.password_hash)) {
          hashString = user.password_hash.toString('utf8');
          console.log(`   🔧 Converted from Buffer to string`);
        } else if (user.password_hash.password_hash) {
          hashString = user.password_hash.password_hash;
          console.log(`   🔧 Extracted nested password_hash`);
        }

        if (hashString && typeof hashString === 'string') {
          await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hashString, user.id]
          );
          console.log(`   ✅ Fixed by extracting string value`);
          fixedCount++;
        } else {
          // Set default password
          const defaultPassword = 'password123';
          const newHash = await bcrypt.hash(defaultPassword, 10);
          
          await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [newHash, user.id]
          );
          
          console.log(`   ✅ Fixed with default password: ${defaultPassword}`);
          fixedCount++;
        }
        continue;
      }

      if (typeof user.password_hash === 'string') {
        const hashLength = user.password_hash.length;
        console.log(`   Password hash length: ${hashLength}`);
        
        // bcrypt hashes are always 60 characters
        if (hashLength === 60 && user.password_hash.startsWith('$2')) {
          console.log(`   ✅ Valid bcrypt hash`);
        } else {
          console.log(`   ⚠️  Unusual hash format (length: ${hashLength})`);
          
          // If it's a plain text password (very bad!)
          if (hashLength < 60) {
            console.log(`   ❌ Appears to be plain text password!`);
            issueCount++;
            
            // Hash the plain text password
            const hashedPassword = await bcrypt.hash(user.password_hash, 10);
            await pool.query(
              'UPDATE users SET password_hash = $1 WHERE id = $2',
              [hashedPassword, user.id]
            );
            
            console.log(`   ✅ Hashed the plain text password`);
            fixedCount++;
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   Issues found: ${issueCount}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`\n✅ Done!\n`);

    if (fixedCount > 0) {
      console.log('⚠️  Users with fixed passwords now have default password: "password123"');
      console.log('   Please ask them to change their password immediately.\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkAndFixPasswords();
