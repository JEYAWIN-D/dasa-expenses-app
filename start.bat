@echo off
title DASA TECH - Quotation ^& Billing System
echo ========================================================
echo  Starting DASA TECH Quotation, Billing ^& Finance System
echo ========================================================
echo.

echo [1/2] Starting Backend API Server (Port 5000)...
start "DASA TECH - Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/2] Starting Frontend Web App (Port 5173)...
start "DASA TECH - Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 3 >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ========================================================
echo  All services are running!
echo  Backend:  http://localhost:5000/api
echo  Frontend: http://localhost:5173
echo ========================================================
