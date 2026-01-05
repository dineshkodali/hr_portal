import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'hr_portal',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

async function verifyAndCreateTable() {
  try {
    console.log('🔍 Checking permission_groups table...');
    
    // Check if table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'permission_groups'
      );
    `;
    
    const { rows } = await pool.query(checkTableQuery);
    const tableExists = rows[0].exists;
    
    if (tableExists) {
      console.log('✅ permission_groups table already exists');
      
      // Check columns
      const checkColumnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'permission_groups'
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await pool.query(checkColumnsQuery);
      console.log('\n📋 Current table structure:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
      // Test insert
      console.log('\n🧪 Testing insert operation...');
      const testGroup = {
        id: 'test-group-' + Date.now(),
        name: 'Test Group',
        description: 'Test group for verification',
        permissions: JSON.stringify([
          { id: 'p-1', module: 'dashboard', read: true, create: false, update: false, delete: false }
        ])
      };
      
      const insertQuery = `
        INSERT INTO permission_groups (id, name, description, permissions)
        VALUES ($1, $2, $3, $4::jsonb)
        RETURNING *
      `;
      
      const insertResult = await pool.query(insertQuery, [
        testGroup.id,
        testGroup.name,
        testGroup.description,
        testGroup.permissions
      ]);
      
      console.log('✅ Insert test successful:', insertResult.rows[0]);
      
      // Clean up test data
      await pool.query('DELETE FROM permission_groups WHERE id = $1', [testGroup.id]);
      console.log('✅ Test data cleaned up');
      
    } else {
      console.log('❌ Table does not exist. Creating...');
      
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
      
      await pool.query(createTableQuery);
      console.log('✅ Table created successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    console.log('\n✅ Database connection closed');
  }
}

verifyAndCreateTable();
