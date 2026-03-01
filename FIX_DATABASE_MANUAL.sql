-- RUN THIS IN pgAdmin TO FIX DATABASE

-- 1. Add status column to users_job table if it doesn't exist
ALTER TABLE users_job ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';

-- 2. Update any NULL status values
UPDATE users_job SET status = 'open' WHERE status IS NULL OR status = '';

-- 3. Add applied_at column to users_application if it doesn't exist
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP DEFAULT NOW();

-- 4. Add resume_snapshot column to users_application if it doesn't exist
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS resume_snapshot VARCHAR(100);

-- 5. Update application status field to support longer values
ALTER TABLE users_application ALTER COLUMN status TYPE VARCHAR(30);

-- 6. Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users_job' AND column_name = 'status';

SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users_application' AND column_name IN ('status', 'applied_at', 'resume_snapshot');

-- 7. Check data
SELECT id, title, status FROM users_job LIMIT 5;
SELECT id, status, applied_at FROM users_application LIMIT 5;
