-- RUN THIS IN pgAdmin TO FIX JOBS AND APPLICATIONS LOADING ISSUE
-- Database: freelance_db

-- 1. Check current job status values
SELECT id, title, status FROM users_job LIMIT 10;

-- 2. Update any NULL or empty status values to 'open'
UPDATE users_job SET status = 'open' WHERE status IS NULL OR status = '';

-- 3. Verify all jobs now have status
SELECT COUNT(*) as total_jobs, 
       COUNT(CASE WHEN status = 'open' THEN 1 END) as open_jobs,
       COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_jobs
FROM users_job;

-- 4. Check applications
SELECT COUNT(*) as total_applications FROM users_application;

-- 5. Check if there are any users
SELECT id, username, role FROM users_user LIMIT 5;

-- AFTER RUNNING THESE QUERIES:
-- 1. Restart Django server
-- 2. Clear browser cache (Ctrl+Shift+Delete)
-- 3. Refresh frontend
