@echo off
echo Starting EduGuard AI Development Environment...
echo.
echo Starting Backend on http://localhost:5000
start "EduGuard Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"
timeout /t 3 /nobreak >nul
echo Starting Frontend on http://localhost:3000
start "EduGuard Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm start"
echo.
echo Both servers starting in separate windows!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
