@echo off
SET ROOT=C:\Users\SAMA\Downloads\Infosys_Repo\Web-Platform-for-Freelance-Services-and-Skill-Matching_Feb_Batch-8_2026\milestone1\freelance_project
SET PYTHON=%ROOT%\venv\Scripts\python.exe
SET MANAGE=%ROOT%\config\manage.py

echo ========================================
echo  Step 1: Running migrations
echo ========================================
"%PYTHON%" "%MANAGE%" migrate
if %ERRORLEVEL% NEQ 0 (
    echo MIGRATION FAILED - check errors above
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Step 2: Starting Django server
echo ========================================
"%PYTHON%" "%MANAGE%" runserver
pause
