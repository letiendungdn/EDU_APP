# Fix Redis khi Docker Desktop làm mất network endpoint (Networks: {}).
# Chạy từ root repo:  powershell -File scripts/fix-redis-network.ps1

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host 'Recreating redis + dependents...'
docker compose up -d --force-recreate --no-deps redis
Start-Sleep -Seconds 3
docker compose up -d --force-recreate content-service exam-service api-gateway

Start-Sleep -Seconds 5
$nets = docker inspect edu-redis --format '{{json .NetworkSettings.Networks}}'
Write-Host "Redis networks: $nets"
docker exec edu-content getent hosts redis
docker ps --filter 'name=edu-redis' --filter 'name=edu-content' --filter 'name=edu-exam' --filter 'name=edu-gateway' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
