-- Add feature_toggles table for system-wide module visibility
CREATE TABLE IF NOT EXISTS feature_toggles (
  key VARCHAR(50) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example seed (optional):
INSERT INTO feature_toggles (key, label, description, enabled)
VALUES
  ('ai_assistant', 'AI HR Assistant', 'Enable the AI-powered HR assistant chat and settings.', TRUE),
  ('advanced_reporting', 'Advanced Reporting', 'Enable advanced analytics and reporting modules.', FALSE),
  ('asset_management', 'Asset Management', 'Enable asset tracking and management features.', TRUE),
  ('custom_workflows', 'Custom Workflows', 'Allow admins to define custom approval workflows.', FALSE)
ON CONFLICT (key) DO NOTHING;
