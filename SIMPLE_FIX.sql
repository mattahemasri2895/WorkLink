-- SIMPLIFIED FIX - Run these commands in pgAdmin Query Tool
-- This only fixes what's needed for the application system to work

-- 1. Add missing columns to users_application table
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_letter VARCHAR(100);
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_message TEXT DEFAULT '';

-- 2. Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users_application' 
ORDER BY ordinal_position;

-- 3. Check current applications
SELECT id, job_id, freelancer_id, status, applied_at FROM users_application LIMIT 5;

-- SUCCESS!
SELECT '✅ Database fixed! Restart Django server now.' as message;
