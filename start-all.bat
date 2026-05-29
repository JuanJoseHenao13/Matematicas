@echo off
echo Iniciando Backend y Frontend...

rem Start backend server (Express) on port 8000
start cmd /k "cd /d c:\Users\juanj\Desktop\Quiz mate && npm run dev:server"

timeout /t 5 /nobreak

rem Start frontend Vite dev server on port 5173
start cmd /k "cd /d c:\Users\juanj\Desktop\Quiz mate\frontend && npm run dev"

echo Servidores iniciados!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
