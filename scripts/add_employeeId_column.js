import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function addEmployeeIdColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting migration: Add employeeId column to employees table...');
    
    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' AND column_name = 'employeeid'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ employeeId column already exists!');
    } else {
      // Add the column
      await client.query(`
        ALTER TABLE employees 
        ADD COLUMN employeeId VARCHAR(50) UNIQUE
      `);
      console.log('✅ Added employeeId column to employees table');
    }
    
    // Check if any employees don't have employeeId set
    const employeesWithoutId = await client.query(`
      SELECT id, name, department 
      FROM employees 
      WHERE employeeId IS NULL
    `);
    
    if (employeesWithoutId.rows.length > 0) {
      console.log(`\n📝 Found ${employeesWithoutId.rows.length} employees without employeeId. Generating IDs...`);
      
      const prefixMap = {
        'Engineering': 'ENG',
        'Marketing': 'MKT',
        'Sales': 'SLS',
        'HR': 'HRD',
        'Finance': 'FIN',
        'Operations': 'OPS'
      };
      
      for (const emp of employeesWithoutId.rows) {
        const dept = emp.department || 'Engineering';
        const prefix = prefixMap[dept] || 'EMP';
        
        // Find the next available number for this prefix
        const existingIds = await client.query(`
          SELECT employeeId 
          FROM employees 
          WHERE employeeId LIKE $1
        `, [`${prefix}-%`]);
        
        const numbers = existingIds.rows
          .map(row => parseInt(row.employeeid.split('-')[1], 10))
          .filter(n => !isNaN(n));
        
        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        const nextNum = maxNum + 1;
        const newEmployeeId = `${prefix}-${String(nextNum).padStart(3, '0')}`;
        
        await client.query(`
          UPDATE employees 
          SET employeeId = $1 
          WHERE id = $2
        `, [newEmployeeId, emp.id]);
        
        console.log(`   ✓ ${emp.name}: ${newEmployeeId}`);
      }
      
      console.log('✅ All employees now have employeeId assigned');
    } else {
      console.log('✅ All employees already have employeeId assigned');
    }
    
    console.log('\n✨ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addEmployeeIdColumn().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
