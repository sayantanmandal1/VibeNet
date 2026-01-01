@echo off
echo 🚀 Starting VibeNet Application...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Start database services
echo 📦 Starting PostgreSQL and Redis...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if backend dependencies are installed
if not exist "server\node_modules" (
    echo 📦 Installing backend dependencies...
    cd server
    npm install
    cd ..
)

REM Check if frontend dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Start backend server in background
echo 🔧 Starting backend server...
cd server
start /b npm start
cd ..

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo ✅ Backend server should be running on http://localhost:5000
echo ✅ Database services are running

REM Start frontend
echo 🎨 Starting frontend...
npm start

pause