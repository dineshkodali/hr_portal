/**
 * Database Configuration
 * Loads configuration from environment variables
 * Supports both Replit and local database setups
 */

interface DatabaseConfig {
  connectionString: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  logging: boolean;
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isReplit = !!process.env.REPLIT_DOMAINS;
  
  // Use DATABASE_URL if available (Replit or custom)
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    return {
      connectionString,
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE || 'hr_portal',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'admin123',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      logging: process.env.DEBUG === 'true',
    };
  }

  // Fallback to individual credentials
  return {
    connectionString: `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'hr_portal'}`,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'hr_portal',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'praneeth123',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    logging: process.env.DEBUG === 'true',
  };
};

export const getApiUrl = (): string => {
  return process.env.VITE_API_URL || 'http://localhost:3001/api';
};

export const getAppConfig = () => ({
  appName: process.env.VITE_APP_NAME || 'Employee Management Portal',
  appTitle: process.env.VITE_APP_TITLE || 'HR Management System',
  apiUrl: getApiUrl(),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
});
