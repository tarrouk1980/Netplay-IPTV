@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════╗
echo ║       OPTIMARK - Démarrage               ║
echo ╚══════════════════════════════════════════╝
echo.

echo Démarrage de la base de données...
docker compose up -d 2>nul

echo Démarrage du backend (port 3001)...
start "OPTIMARK Backend" cmd /k "cd backend && npm run start:dev"

timeout /t 5 /nobreak >nul

echo Démarrage du frontend (port 3000)...
start "OPTIMARK Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo Ouverture du navigateur...
start http://localhost:3000

echo.
echo ✓ OPTIMARK est lancé sur http://localhost:3000
echo.
