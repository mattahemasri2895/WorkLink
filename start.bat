@echo off
echo ========================================
echo  WorkLink - Starting Servers
echo ========================================

echo.
echo [1/2] Running Django migrations...
cd config
..\venv\Scripts\python.exe manage.py migrate
cd ..

echo.
echo [2/2] Starting Django backend (port 8000)...
start "Django Backend" cmd /k "cd config && ..\venv\Scripts\python.exe manage.py runserver"

echo.
echo [3/3] Starting React frontend (port 3000)...
start "React Frontend" cmd /k "cd frontend_react && npm start"

echo.
echo ========================================
echo  Both servers starting...
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:3000
echo  Landing:  http://localhost:3000/landing
echo ========================================
pause
