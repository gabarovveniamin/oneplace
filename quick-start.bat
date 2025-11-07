@echo off
echo ========================================
echo   OnePlace - Быстрый старт
echo ========================================
echo.

REM Проверка Docker
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Docker не запущен!
    echo Пожалуйста, запустите Docker Desktop и попробуйте снова.
    pause
    exit /b 1
)

echo [1/4] Запускаю PostgreSQL...
cd backend
docker-compose up -d postgres
timeout /t 3 /nobreak >nul
echo [OK] PostgreSQL запущен

echo.
echo [2/4] Проверяю зависимости backend...
if not exist "node_modules" (
    echo Устанавливаю зависимости backend...
    call npm install
)

cd ..

echo.
echo [3/4] Проверяю зависимости frontend...
if not exist "node_modules" (
    echo Устанавливаю зависимости frontend...
    call npm install
)

echo.
echo [4/4] Проверяю файл .env...
if not exist "backend\.env" (
    echo Создаю .env из примера...
    copy backend\env.example backend\.env
    echo [OK] Файл .env создан. Проверьте настройки в backend\.env
)

echo.
echo ========================================
echo   Готово к запуску!
echo ========================================
echo.
echo Следующие шаги:
echo   1. Откройте терминал 1 и запустите: cd backend ^&^& npm run dev
echo   2. Откройте терминал 2 и запустите: npm run dev
echo.
echo Или просто запустите start-backend.bat и start-frontend.bat
echo.
pause



