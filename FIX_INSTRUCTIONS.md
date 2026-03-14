# FIX APPLICATION SYSTEM ERRORS

## Problem Summary
- ❌ Database column `offer_letter` missing
- ❌ Applications not showing in My Applications
- ❌ Apply button not working
- ❌ Recruiter can't see applicants

## SOLUTION - Follow These Steps:

### Step 1: Fix Database Schema (REQUIRED)

**Option A: Using PostgreSQL Command Line**
```bash
# Connect to PostgreSQL
psql -U postgres -d freelance_db

# Then paste these commands:
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_letter VARCHAR(100);
ALTER TABLE users_application ADD COLUMN IF NOT EXISTS offer_message TEXT DEFAULT '';
ALTER TABLE users_application DROP CONSTRAINT IF EXISTS users_application_status_check;
ALTER TABLE users_application ADD CONSTRAINT users_application_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'interview_scheduled', 'interview_completed', 'interview_rejected', 'selected', 'offer_sent', 'offer_accepted', 'hired', 'shortlisted', 'exam_scheduled'));
ALTER TABLE users_interviewslot ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT FALSE;
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Connect to `freelance_db` database
3. Open Query Tool (Tools → Query Tool)
4. Open file: `RUN_THIS_SQL.sql`
5. Click Execute (F5)

**Option C: Using Python Script**
```bash
cd config
python fix_migrations.py
```

### Step 2: Verify Database Changes
```sql
-- Run this to verify columns exist:
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users_application';

-- You should see:
-- offer_letter | character varying
-- offer_message | text
```

### Step 3: Restart Django Server
```bash
cd config
python manage.py runserver
```

### Step 4: Restart React App
```bash
cd frontend_react
npm start
```

## Testing the Fix

### Test 1: Apply for Job
1. Login as Freelancer
2. Go to Browse Jobs
3. Click on a job → "Apply Now"
4. Should show: "Application submitted successfully!"
5. Check My Applications → Should see the application

### Test 2: View Applications (Freelancer)
1. Go to My Applications
2. Should see all jobs you applied for
3. Status should show "pending"

### Test 3: View Applicants (Recruiter)
1. Login as Recruiter
2. Go to Applicants
3. Should see all freelancers who applied
4. Can click to view details

## Common Issues & Solutions

### Issue: "Column does not exist"
**Solution:** Run the SQL commands in Step 1 again

### Issue: "Applications not showing"
**Solution:** 
1. Check if applications exist: `SELECT * FROM users_application;`
2. Verify user is logged in (check localStorage for access_token)
3. Check browser console for errors

### Issue: "Apply button shows localhost:3000 error"
**Solution:**
1. Make sure Django server is running on port 8000
2. Check CORS settings in Django
3. Verify API endpoint: `http://localhost:8000/api/auth/jobs/{id}/apply/`

### Issue: "Recruiter sees no applicants"
**Solution:**
1. Make sure freelancers have applied to recruiter's jobs
2. Check: `SELECT * FROM users_application WHERE job_id IN (SELECT id FROM users_job WHERE recruiter_id = YOUR_RECRUITER_ID);`

## Database Schema Reference

### users_application table should have:
- id (primary key)
- job_id (foreign key)
- freelancer_id (foreign key)
- status (varchar) - pending, accepted, rejected, etc.
- applied_at (timestamp)
- resume_snapshot (varchar)
- offer_letter (varchar) ← NEW
- offer_message (text) ← NEW

## API Endpoints Reference

### Freelancer Endpoints:
- `GET /api/auth/freelancer/applications/` - Get my applications
- `POST /api/auth/jobs/{id}/apply/` - Apply to job

### Recruiter Endpoints:
- `GET /api/auth/recruiter/applications/` - Get all applicants
- `POST /api/auth/recruiter/application/{id}/status/` - Update status

## Success Checklist
- ✅ SQL commands executed without errors
- ✅ Django server running without errors
- ✅ React app running without errors
- ✅ Can apply for jobs
- ✅ Applications show in My Applications
- ✅ Recruiter can see applicants
- ✅ No "column does not exist" errors

## Need Help?
If issues persist:
1. Check Django server logs for errors
2. Check browser console (F12) for errors
3. Verify database connection in settings.py
4. Ensure all migrations are applied: `python manage.py migrate`
