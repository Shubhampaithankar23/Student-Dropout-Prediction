@echo off
echo ==========================================
echo   EduGuard AI - Setup Script
echo ==========================================
echo.

echo [1/4] Installing Backend dependencies...
cd backend
call npm install
echo Backend installed!
echo.

echo [2/4] Installing Frontend dependencies...
cd ..\frontend
call npm install
echo Frontend installed!
echo.

echo [3/4] Creating logs directory...
cd ..\backend
if not exist logs mkdir logs
echo Logs directory ready!
echo.

echo [4/4] Creating uploads directory...
if not exist uploads\csv mkdir uploads\csv
echo Uploads directory ready!
echo.

echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Create PostgreSQL database: CREATE DATABASE eduguard_db;
echo 2. Edit backend\.env with your DB credentials
echo 3. Run: cd backend ^&^& npm run migrate
echo 4. Run: cd backend ^&^& npm run seed
echo 5. Start backend: cd backend ^&^& npm run dev
echo 6. Start frontend: cd frontend ^&^& npm start
echo.
echo Demo credentials after seeding:
echo   Admin:     admin@eduguard.ai / Admin@123
echo   Teacher:   teacher@eduguard.ai / Teacher@123
echo   Counselor: counselor@eduguard.ai / Counselor@123
echo.
pause
