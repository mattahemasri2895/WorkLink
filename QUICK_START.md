# QUICK START - FOLLOW THESE STEPS EXACTLY

## STEP 1: Run SQL in pgAdmin (MOST IMPORTANT)

Open pgAdmin → Connect to `freelance_db` → Run this SQL:

```sql
-- Add missing columns
ALTER TABLE users_job ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS resume_snapshot VARCHAR(100);
ALTER TABLE users_application ALTER COLUMN status TYPE VARCHAR(30);

-- Set defaults
UPDATE users_job SET status = 'open' WHERE status IS NULL OR status = '';
UPDATE users_application SET applied_at = NOW() WHERE applied_at IS NULL;

-- Create wishlist table
CREATE TABLE IF NOT EXISTS users_wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES users_job(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Verify
SELECT 'Jobs with status' as check_name, COUNT(*) as count FROM users_job WHERE status IS NOT NULL
UNION ALL
SELECT 'Applications with date', COUNT(*) FROM users_application WHERE applied_at IS NOT NULL
UNION ALL
SELECT 'Wishlist table exists', COUNT(*) FROM users_wishlist;
```

## STEP 2: Restart Django Server

```bash
# Stop server (Ctrl+C if running)

cd c:\Users\SAMA\Downloads\Infosys_Repo\Web-Platform-for-Freelance-Services-and-Skill-Matching_Feb_Batch-8_2026\milestone1\freelance_project\config

# Activate venv
venv\Scripts\activate

# Start server
python manage.py runserver
```

## STEP 3: Test Endpoints

Open browser and test these URLs (after logging in):

### Freelancer Endpoints:
- http://localhost:8000/api/auth/freelancer/stats/
- http://localhost:8000/api/auth/freelancer/applications/
- http://localhost:8000/api/auth/jobs/
- http://localhost:8000/api/auth/wishlist/

### Recruiter Endpoints:
- http://localhost:8000/api/auth/recruiter/stats/
- http://localhost:8000/api/auth/recruiter/applications/
- http://localhost:8000/api/auth/jobs/

## STEP 4: Clear Browser Cache

1. Press F12
2. Application tab
3. Clear storage
4. Refresh page

## STEP 5: Test Features

### Freelancer:
1. Login
2. Dashboard should show stats
3. Profile → Upload resume
4. Browse Jobs → See jobs
5. Apply to a job
6. My Applications → See applied jobs

### Recruiter:
1. Login
2. Dashboard should show stats
3. Post Job
4. My Jobs → See posted jobs
5. Applicants → See applications

## If Still Failing:

### Check Django Logs
Look at terminal where Django is running. Copy any error messages.

### Check Browser Console
Press F12 → Console tab. Copy any red error messages.

### Verify Database
Run in pgAdmin:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users_job';
SELECT column_name FROM information_schema.columns WHERE table_name = 'users_application';
SELECT * FROM users_job LIMIT 1;
SELECT * FROM users_application LIMIT 1;
```

## Common Errors and Solutions:

### "column does not exist"
→ Run Step 1 SQL again

### "relation does not exist"  
→ Run CREATE TABLE commands in Step 1

### "Failed to load"
→ Check Django server is running
→ Check browser console for specific error
→ Test endpoint directly in browser

### Profile upload fails
→ Create media folder: `mkdir media` in config directory
→ Check settings.py has MEDIA_ROOT and MEDIA_URL

## All Endpoints:

```
POST   /api/auth/register/
POST   /api/auth/login/
GET    /api/auth/profile/

GET    /api/auth/freelancer/profile/
POST   /api/auth/freelancer/profile/
GET    /api/auth/freelancer/stats/
GET    /api/auth/freelancer/applications/
POST   /api/auth/resume/
GET    /api/auth/resume/

GET    /api/auth/jobs/
POST   /api/auth/jobs/create/
POST   /api/auth/jobs/{id}/apply/

GET    /api/auth/wishlist/
POST   /api/auth/wishlist/
DELETE /api/auth/wishlist/{id}/

GET    /api/auth/recruiter/profile/
POST   /api/auth/recruiter/profile/
GET    /api/auth/recruiter/stats/
GET    /api/auth/recruiter/applications/
POST   /api/auth/recruiter/application/{id}/status/
```
