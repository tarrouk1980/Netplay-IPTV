@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════╗
echo ║     OPTIMARK - Installation Windows      ║
echo ╚══════════════════════════════════════════╝
echo.

echo [1/4] Création du fichier .env backend...
(
echo DATABASE_URL="postgresql://postgres:optimark2025@localhost:5432/optimark"
echo JWT_SECRET="optimark-secret-jwt-2025"
echo PORT=3001
echo KONNECT_API_KEY=your_konnect_api_key
echo KONNECT_WALLET_ID=your_wallet_id
echo PAYMEE_API_KEY=your_paymee_api_key
echo PAYMEE_VENDOR_TOKEN=your_paymee_vendor_token
echo FRONTEND_URL=http://localhost:3000
) > backend\.env
echo    ✓ backend\.env créé

echo [2/4] Création du fichier .env.local frontend...
(
echo NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
) > frontend\.env.local
echo    ✓ frontend\.env.local créé

echo [3/4] Démarrage de PostgreSQL via Docker...
docker compose up -d
if %errorlevel% neq 0 (
    echo    ✗ Docker non disponible. Installez Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo    ✓ PostgreSQL démarré sur le port 5432

timeout /t 5 /nobreak >nul

echo [4/4] Installation des dépendances...
cd backend
call npm install
call npx prisma generate
call npx prisma db push
cd ..

cd frontend
call npm install
cd ..

echo.
echo ╔══════════════════════════════════════════╗
echo ║        Installation terminée !           ║
echo ║                                          ║
echo ║  Pour lancer OPTIMARK:                   ║
echo ║  → Double-cliquez sur start.bat          ║
echo ╚══════════════════════════════════════════╝
echo.
pause
