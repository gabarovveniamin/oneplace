@echo off
echo ========================================
echo   OnePlace Backend Server
echo ========================================
echo.
cd backend
echo Проверяю PostgreSQL...
docker ps | findstr onepace-postgres >nul 2>&1
if errorlevel 1 (
    echo PostgreSQL не запущен. Запускаю...
    docker-compose up -d postgres
    timeout /t 5 /nobreak >nul
)

echo Запускаю backend сервер...
echo.
npm run dev



