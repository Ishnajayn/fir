@echo off
echo ========================================
echo FIR Application - Fix and Start
echo ========================================
echo.

REM Set environment variables
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Check if Node.js is available
"C:\Program Files\nodejs\node.exe" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found at C:\Program Files\nodejs\node.exe
    echo Please install Node.js first
    pause
    exit /b 1
)

echo Node.js found and working!
echo.

REM Clean install dependencies
echo Cleaning and reinstalling dependencies...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del package-lock.json
)

echo Installing fresh dependencies...
"C:\Program Files\nodejs\npm.cmd" install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.

echo Starting React development server...
echo The application will open at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the React application
"C:\Program Files\nodejs\npm.cmd" start

pause 