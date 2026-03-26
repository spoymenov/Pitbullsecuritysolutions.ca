@echo off
setlocal

cd /d "%~dp0"

echo [1/6] Pulling latest code from GitHub...
git pull origin main
if errorlevel 1 (
  echo Git pull failed. Please check your Git authentication.
  pause
  exit /b 1
)

echo [2/6] Opening browser at http://127.0.0.1:4173/index.html
start "" "http://127.0.0.1:4173/index.html"

echo [3/6] Starting local server on port 4173...
where py >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "py -3 -m http.server 4173"
  goto :postserve
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "python -m http.server 4173"
  goto :postserve
)

where npx >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "npx serve -l 4173"
  goto :postserve
)

echo [4/6] Could not find py, python, or npx.
echo Please install Python 3 or Node.js.
pause
exit /b 1

:postserve
echo [4/6] Auto mode: deploying Cloudflare Worker...
if 1==1 (
  where wrangler >nul 2>nul
  if %errorlevel%==0 (
    wrangler deploy
  ) else (
    echo Wrangler not found. Install with: npm install -g wrangler
  )
)

echo [5/6] Auto mode: pushing local commits to GitHub...
if 1==1 (
  git push origin main
)

echo [6/6] Done. Local preview running on http://127.0.0.1:4173/index.html
pause
