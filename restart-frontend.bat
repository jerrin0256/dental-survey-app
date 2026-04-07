@echo off
echo ========================================
echo Dental Survey App - Restart with Clear Cache
echo ========================================
echo.

cd frontend

echo [1/3] Stopping any running Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Clearing Expo cache...
echo.

echo [3/3] Starting Expo with cleared cache...
echo.
npx expo start -c

echo.
echo ========================================
echo Server started! Press 'a' for Android or 'i' for iOS
echo ========================================
