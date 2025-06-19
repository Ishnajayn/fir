@echo off
echo ========================================
echo FIR Application - Starting React App
echo ========================================
echo.

REM Set the PATH to include Node.js
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

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    "C:\Program Files\nodejs\npm.cmd" install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting React development server...
echo.
echo The application will open at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the React application using the full path
"C:\Program Files\nodejs\npm.cmd" start

pause 