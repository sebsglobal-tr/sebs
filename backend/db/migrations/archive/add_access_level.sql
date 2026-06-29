-- Add access_level column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'beginner';

-- Update existing users to have beginner access level
UPDATE users 
SET access_level = 'beginner' 
WHERE access_level IS NULL;

-- Add comment to column
COMMENT ON COLUMN users.access_level IS 'User access level: beginner, intermediate, advanced - determines which course levels user can access';

