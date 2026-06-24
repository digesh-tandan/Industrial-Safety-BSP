# =====================================================================
# SAIL BHILAI STEEL PLANT - AI SAFETY COMPLIANCE SYSTEM
# SYSTEM WIDE STARTUP LAUNCHER (PowerShell Core)
# =====================================================================

Clear-Host
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "          SAIL BHILAI STEEL PLANT - AI SAFETY SURVEILLANCE NODE      " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "[LAUNCHER] Booting enterprise system components..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

# 1. Start Django REST Backend Server
Write-Host "[LAUNCHER] Launching Django REST API Server on Port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '--- BSP Django REST Core Server ---' -ForegroundColor Green; python manage.py runserver 8000" -WindowStyle Normal

# 2. Start React SCADA Frontend Dev Server
Write-Host "[LAUNCHER] Launching React SCADA Frontend Panel on Port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '--- BSP React SCADA UI Server ---' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# 3. Wait for Server Handshakes, then start the AI Pipeline worker
Write-Host "[LAUNCHER] Waiting 4 seconds for API handshakes to sync..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

Write-Host "[LAUNCHER] Launching Edge AI Stream Processing Daemon..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai_service; Write-Host '--- BSP OpenCV/YOLOv8 Edge Inference Pipeline ---' -ForegroundColor Yellow; python pipeline.py --source ../test_footage.mp4 --camera-id 1 --camera-code CCTV-BF-01" -WindowStyle Normal

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] All BSP Safety Core systems dispatched successfully!" -ForegroundColor Green
Write-Host " -> Django REST API: http://127.0.0.1:8000/api/" -ForegroundColor SlateGray
Write-Host " -> React SCADA Panel: http://localhost:5173/" -ForegroundColor SlateGray
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "Press any key to exit this launcher window (service consoles remain active)..."
$null = [System.Console]::ReadKey()
