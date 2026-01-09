-- =========================================================================
-- USER PASSWORDS TABLE (Password Manager)
-- =========================================================================
CREATE TABLE IF NOT EXISTS user_passwords (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password_encrypted TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_passwords_user_id ON user_passwords(user_id);
