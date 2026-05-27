@echo off
echo Iniciando Backend y Frontend...

start cmd /k "cd /d c:\Users\juanj\Desktop\Quiz mate && npx pnpm dev"

timeout /t 5 /nobreak

start cmd /k "cd /d c:\Users\juanj\Desktop\Quiz mate\frontend && npm run dev"

echo Servidores iniciados!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
