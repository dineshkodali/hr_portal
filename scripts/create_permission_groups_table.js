// Script to create permission_groups table
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createPermissionGroupsTable() {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating permission_groups table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS permission_groups (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        permissions JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_permission_groups_name ON permission_groups(name);
    `;
    
    await client.query(createTableQuery);
    console.log('✅ permission_groups table created successfully!');
    
    // Check if table exists
    const checkQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'permission_groups';
    `;
    const result = await client.query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: permission_groups table exists');
    } else {
      console.log('❌ Warning: permission_groups table not found');
    }
    
  } catch (error) {
    console.error('❌ Error creating permission_groups table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createPermissionGroupsTable();
