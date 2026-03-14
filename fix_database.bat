@echo off
echo ========================================
echo FIXING APPLICATION SYSTEM DATABASE
echo ========================================
echo.

echo Step 1: Connecting to PostgreSQL...
echo.

set PGPASSWORD=hema@2005

echo Running SQL fixes...
psql -U postgres -d freelance_db -f RUN_THIS_SQL.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database schema updated.
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart Django server: cd config ^&^& python manage.py runserver
    echo 2. Restart React app: cd frontend_react ^&^& npm start
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Could not update database.
    echo ========================================
    echo.
    echo Please run the SQL commands manually:
    echo 1. Open pgAdmin or psql
    echo 2. Connect to freelance_db
    echo 3. Run the commands in RUN_THIS_SQL.sql
    echo.
)

pause
