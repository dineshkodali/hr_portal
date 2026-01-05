-- Migration: Add permission_groups table
-- Date: 2026-01-04
-- Description: Creates permission_groups table for storing role-based access control

-- Create permission_groups table
CREATE TABLE IF NOT EXISTS permission_groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_permission_groups_name ON permission_groups(name);

-- Display confirmation
SELECT 'permission_groups table created successfully!' AS status;
