-- Add missing columns to users_application table
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_letter VARCHAR(100);
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_message TEXT DEFAULT '';

-- Update status column to support new workflow statuses
ALTER TABLE users_application DROP CONSTRAINT IF EXISTS users_application_status_check;
ALTER TABLE users_application ADD CONSTRAINT users_application_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'interview_scheduled', 'interview_completed', 'interview_rejected', 'selected', 'offer_sent', 'offer_accepted', 'hired', 'shortlisted', 'exam_scheduled'));

-- Add is_selected column to users_interviewslot if not exists
ALTER TABLE users_interviewslot ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT FALSE;

-- Verify the changes
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users_application';
