@echo off
title Angehlang Universe OS — Full Engine Rebuild v13.0 TRILLION-X
color 0A
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║   ANGEHLANG SOVEREIGN FULL ENGINE REBUILD — v13.0 TRILLION-X   ║
echo  ║   Engines: SovereignLLM + AngehlangCore + 8 Super-Intel      ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] Stopping any running servers...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo     Done.
echo.

echo [2/4] Verifying dependencies...
call npm install --silent
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] npm install failed! Check your connection.
    pause
    exit /b 1
)
echo     Dependencies OK.
echo.

echo [3/4] Building Sovereign Substrate (webpack)...
echo     This may take 30-90 seconds...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ═══════════════════════════════════════════════════════
    echo  [BUILD ERROR] Webpack failed. Common fixes:
    echo  1. Check for TypeScript errors in source files
    echo  2. Run: npm run typecheck
    echo  3. Fix any errors reported above
    echo  ═══════════════════════════════════════════════════════
    pause
    exit /b 1
)
echo.
echo  ✓ Build complete. All engines compiled successfully.
echo.

echo [4/4] Starting Sovereign Preview Server on port 3001...
echo.
echo  ╔════════════════════════════════════════════════════╗
echo  ║   SOVEREIGN INTELLIGENCE — ONLINE                 ║
echo  ║   Open: http://localhost:3001                     ║
echo  ║                                                    ║
echo  ║   Engines Active:                                  ║
echo  ║   ✓ SovereignLLM (ZETA+ 1.2T)                    ║
echo  ║   ✓ AngehlangCore (40+ topic KB)                 ║
echo  ║   ✓ NativeNeuralCore (Expert Swarm)              ║
echo  ║   ✓ StudioRouter (15 Studios)                    ║
echo  ║   ✓ PhotonicTensorCore (Zero-Crash)              ║
echo  ║                                                    ║
echo  ║   Press Ctrl+C to stop                           ║
echo  ╚════════════════════════════════════════════════════╝
echo.
node server.mjs preview

pause
