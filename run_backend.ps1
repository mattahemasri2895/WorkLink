# run_backend.ps1
# Run this from ANY directory — uses absolute paths

$ROOT = "C:\Users\SAMA\Downloads\Infosys_Repo\Web-Platform-for-Freelance-Services-and-Skill-Matching_Feb_Batch-8_2026\milestone1\freelance_project"
$PYTHON = "$ROOT\venv\Scripts\python.exe"
$MANAGE = "$ROOT\config\manage.py"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " WorkLink Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1] Running migrations..." -ForegroundColor Yellow
& $PYTHON $MANAGE migrate

Write-Host "`n[2] Starting Django server on port 8000..." -ForegroundColor Yellow
& $PYTHON $MANAGE runserver
