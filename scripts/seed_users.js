import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function upsertUsers() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);`);

    const plainPasswords = {
      admin: 'admin123',
      employee: 'employee123'
    };

    const users = [
      {
        id: 'u-admin',
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        avatar: '',
        designation: 'System Admin',
        status: 'Active',
        branchIds: ['b-1']
      },
      {
        id: 'u-employee',
        name: 'Employee User',
        email: 'employee@company.com',
        role: 'employee',
        avatar: '',
        designation: 'Staff',
        status: 'Active',
        branchIds: ['b-1']
      }
    ];

    for (const u of users) {
      // Hash password based on user type
      const userType = u.role === 'admin' ? 'admin' : 'employee';
      const plainPassword = plainPasswords[userType];
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const query = `
        INSERT INTO users (id, name, email, role, avatar, designation, status, branchIds, password, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          avatar = EXCLUDED.avatar,
          designation = EXCLUDED.designation,
          status = EXCLUDED.status,
          branchIds = EXCLUDED.branchIds,
          password = EXCLUDED.password,
          updated_at = NOW();
      `;
      await pool.query(query, [u.id, u.name, u.email, u.role, u.avatar, u.designation, u.status, u.branchIds, hashedPassword]);
      console.log(`Upserted user ${u.email} with hashed password`);
    }

    console.log('Done seeding users.');
  } catch (err) {
    console.error('Error seeding users:', err.message || err);
  } finally {
    await pool.end();
  }
}

upsertUsers();
