@echo off
echo ============================================
echo  Applying migration for is_selected field
echo ============================================
cd config
..\venv\Scripts\python.exe manage.py migrate users 0018_interviewslot_is_selected --verbosity 2
echo.
echo ============================================
echo  Migration done. Starting server...
echo ============================================
..\venv\Scripts\python.exe manage.py runserver
