# COMPLETE FIX GUIDE - RUN THESE STEPS IN ORDER

## STEP 1: Fix Database in pgAdmin

Open pgAdmin, connect to `freelance_db`, and run this SQL:

```sql
-- Add status column to jobs table
ALTER TABLE users_job ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';

-- Add applied_at column to applications table
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP DEFAULT NOW();

-- Add resume_snapshot column to applications table
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS resume_snapshot VARCHAR(100);

-- Update application status field to support longer values
ALTER TABLE users_application ALTER COLUMN status TYPE VARCHAR(30);

-- Set default values
UPDATE users_job SET status = 'open' WHERE status IS NULL OR status = '';
UPDATE users_application SET applied_at = NOW() WHERE applied_at IS NULL;

-- Verify
SELECT id, title, status FROM users_job LIMIT 3;
SELECT id, status, applied_at FROM users_application LIMIT 3;
```

## STEP 2: Create Wishlist Table (if not exists)

```sql
CREATE TABLE IF NOT EXISTS users_wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES users_job(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS users_wishlist_user_id_idx ON users_wishlist(user_id);
CREATE INDEX IF NOT EXISTS users_wishlist_job_id_idx ON users_wishlist(job_id);
```

## STEP 3: Create InterviewSlot and ExamSlot Tables (if not exists)

```sql
CREATE TABLE IF NOT EXISTS users_interviewslot (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES users_application(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    meeting_link VARCHAR(200) DEFAULT '',
    notes TEXT DEFAULT '',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_examslot (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES users_application(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    exam_link VARCHAR(200) DEFAULT '',
    instructions TEXT DEFAULT '',
    is_completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## STEP 4: Restart Django Server

```bash
cd c:\Users\SAMA\Downloads\Infosys_Repo\Web-Platform-for-Freelance-Services-and-Skill-Matching_Feb_Batch-8_2026\milestone1\freelance_project\config

# Stop current server (Ctrl+C)

# Activate virtual environment
venv\Scripts\activate

# Start server
python manage.py runserver
```

## STEP 5: Clear Browser Cache

1. Open browser
2. Press F12 (Developer Tools)
3. Go to Application tab
4. Click "Clear storage"
5. Click "Clear site data"
6. Close and reopen browser

## STEP 6: Test Each Feature

### Freelancer Tests:
1. Login as freelancer
2. Go to Dashboard - should see stats and charts
3. Go to Profile - upload resume and fill fields
4. Go to Browse Jobs - should see job listings
5. Click a job - should open modal
6. Apply to a job
7. Go to My Applications - should see applied jobs

### Recruiter Tests:
1. Login as recruiter
2. Go to Dashboard - should see stats and applicants
3. Go to Post Job - create a new job
4. Go to My Jobs - should see posted jobs
5. Go to Applicants - should see applications
6. Click applicant - should see details

## STEP 7: Check Django Server Logs

Look at the terminal where Django is running. If you see errors:
- Copy the error message
- Check which endpoint is failing
- Verify database has the required columns

## Common Issues and Solutions

### Issue: "column does not exist"
**Solution**: Run the SQL commands in Step 1 again

### Issue: "relation does not exist"
**Solution**: Run the CREATE TABLE commands in Steps 2 and 3

### Issue: Jobs not loading
**Solution**: 
1. Check Django logs for errors
2. Test endpoint: http://localhost:8000/api/auth/jobs/
3. Verify users_job table exists: `SELECT * FROM users_job LIMIT 1;`

### Issue: Applications not loading
**Solution**:
1. Check Django logs
2. Test endpoint: http://localhost:8000/api/auth/freelancer/applications/
3. Verify users_application table: `SELECT * FROM users_application LIMIT 1;`

### Issue: Profile upload fails
**Solution**:
1. Check MEDIA_ROOT in settings.py
2. Create media folder: `mkdir media` in config directory
3. Check file permissions

## Verification Queries

Run these in pgAdmin to verify everything is set up:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'users_%';

-- Check job columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users_job';

-- Check application columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users_application';

-- Check data
SELECT COUNT(*) as total_jobs FROM users_job;
SELECT COUNT(*) as total_applications FROM users_application;
SELECT COUNT(*) as total_users FROM users_user;
```

## If Still Not Working

1. Take screenshot of browser console errors (F12 → Console)
2. Take screenshot of Django server terminal
3. Run verification queries and share results
4. Check which specific feature is failing
