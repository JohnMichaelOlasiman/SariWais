ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP NULL;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_role_check'
) THEN
ALTER TABLE users
ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));
END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at);
UPDATE users
SET role = 'admin'
WHERE id = (
        SELECT id
        FROM users
        ORDER BY id ASC
        LIMIT 1
    )
    AND NOT EXISTS (
        SELECT 1
        FROM users
        WHERE role = 'admin'
    );