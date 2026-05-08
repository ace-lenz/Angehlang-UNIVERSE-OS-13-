@echo off
echo Starting Build...
npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Build Failed!
  exit /b %ERRORLEVEL%
)
echo Build Successful!
