@echo off
setlocal

cd /d "%~dp0"

echo [1/4] Pulling latest code from GitHub...
git pull origin main
if errorlevel 1 (
  echo Git pull failed. Please check your Git authentication.
  pause
  exit /b 1
)

echo [2/4] Opening browser at http://127.0.0.1:4173/index.html
start "" "http://127.0.0.1:4173/index.html"

echo [3/4] Starting local server on port 4173...
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 -m http.server 4173
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 4173
  goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
  npx serve -l 4173
  goto :eof
)

echo [4/4] Could not find py, python, or npx.
echo Please install Python 3 or Node.js.
pause
