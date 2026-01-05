import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
});

async function drop() {
    try {
        console.log('🗑️ Dropping 2FA tables...');
        
        const dropSQL = `
            DROP TABLE IF EXISTS mfa_logs CASCADE;
            DROP TABLE IF EXISTS trusted_devices CASCADE;
            DROP TABLE IF EXISTS user_security_settings CASCADE;
            DROP TABLE IF EXISTS user_totp CASCADE;
        `;
        
        const statements = dropSQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        for (const stmt of statements) {
            await pool.query(stmt);
            console.log(`✅ ${stmt}`);
        }
        
        console.log('✨ All tables dropped successfully!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

drop();
