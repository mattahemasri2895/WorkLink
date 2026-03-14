-- COPY AND PASTE THESE COMMANDS INTO YOUR POSTGRESQL TERMINAL OR pgAdmin
-- Database: freelance_db

-- 1. Add missing columns to users_application table
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_letter VARCHAR(100);
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_message TEXT DEFAULT '';

-- 2. Update status constraint to include all workflow statuses
ALTER TABLE users_application DROP CONSTRAINT IF EXISTS users_application_status_check;
ALTER TABLE users_application ADD CONSTRAINT users_application_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'interview_scheduled', 'interview_completed', 'interview_rejected', 'selected', 'offer_sent', 'offer_accepted', 'hired', 'shortlisted', 'exam_scheduled'));

-- 3. Add is_selected column to users_interviewslot
ALTER TABLE users_interviewslot ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT FALSE;

-- 4. Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users_application' 
ORDER BY ordinal_position;

-- 5. Check if there are any applications
SELECT COUNT(*) as total_applications FROM users_application;

-- 6. Check application statuses
SELECT status, COUNT(*) as count FROM users_application GROUP BY status;

-- SUCCESS MESSAGE
SELECT 'Database schema updated successfully! Now restart your Django server.' as message;
