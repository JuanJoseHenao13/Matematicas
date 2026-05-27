Write-Host "Iniciando Backend y Frontend..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\juanj\Desktop\Quiz mate'; npx pnpm dev"

Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\juanj\Desktop\Quiz mate\frontend'; npm run dev"

Write-Host "Servidores iniciados!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
