$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
docker compose down
Write-Host "Rocket.Chat stopped." -ForegroundColor Green
