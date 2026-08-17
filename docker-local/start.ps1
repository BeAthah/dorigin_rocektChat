# Rocket.Chat local stack — web UI + backend (Docker)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==> Starting Rocket.Chat (MongoDB + server)..." -ForegroundColor Cyan
Set-Location $Root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: docker compose failed. Is Docker Desktop running?" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==> Waiting for Rocket.Chat (first start can take 2-5 minutes)..." -ForegroundColor Yellow
$max = 40
for ($i = 1; $i -le $max; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/api/info" -UseBasicParsing -TimeoutSec 5
        if ($r.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "SUCCESS: Rocket.Chat is running!" -ForegroundColor Green
            Write-Host "  Web UI + API: http://localhost:3000"
            Write-Host "  API info:     http://localhost:3000/api/info"
            Write-Host ""
            Write-Host "Open http://localhost:3000 in your browser and complete the setup wizard."
            exit 0
        }
    } catch {
        Write-Host "  ... still starting ($i/$max)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 10
    }
}

Write-Host ""
Write-Host "Server is still starting. Check logs:" -ForegroundColor Yellow
Write-Host "  docker compose -f `"$Root\docker-compose.yml`" logs -f rocketchat"
Write-Host "Then open http://localhost:3000"
