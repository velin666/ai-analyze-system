@echo off
echo Starting deployment process...

echo Pulling latest code from repository...
git pull

if %errorlevel% neq 0 (
    echo Git pull failed!
    pause
    exit /b 1
)

echo Installing/updating dependencies...
pnpm i

if %errorlevel% neq 0 (
    echo npm install failed!
    pause
    exit /b 1
)

echo Building project...
pnpm build

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Restarting PM2 processes...
pnpm:pm2:restart

if %errorlevel% neq 0 (
    echo PM2 restart failed!
    pause
    exit /b 1
)

echo Deployment completed successfully!
pause
