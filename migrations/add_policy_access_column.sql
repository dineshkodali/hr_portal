-- Migration: Add 'access' JSONB column to policies table for confidential file/folder permissions
ALTER TABLE policies ADD COLUMN IF NOT EXISTS access JSONB DEFAULT '{"users":[],"groups":[]}';
