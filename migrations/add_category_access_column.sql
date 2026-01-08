-- Migration: Add 'access' JSONB column to policy_categories table for category-level permissions
ALTER TABLE policy_categories ADD COLUMN IF NOT EXISTS access JSONB DEFAULT '{"users":[],"groups":[]}';
