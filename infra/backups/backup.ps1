# Backup PostgreSQL (nihongo + english_learning) từ container edu-postgres
# Usage: powershell -File infra/backups/backup.ps1

$ErrorActionPreference = "Stop"
$container = "edu-postgres"
$user = "nihongo"
$outDir = $PSScriptRoot
$ts = Get-Date -Format "yyyyMMdd_HHmmss"

if (-not (docker ps --format "{{.Names}}" | Select-String -Quiet "^${container}$")) {
    Write-Host "Container '$container' chưa chạy. Chạy: docker compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$databases = @("nihongo", "english_learning")
foreach ($db in $databases) {
    $file = Join-Path $outDir "${db}_${ts}.sql"
    Write-Host "Dump $db -> $file"
    docker exec $container pg_dump -U $user $db | Set-Content -Path $file -Encoding utf8
}

$schemaFile = Join-Path $outDir "nihongo_schema_${ts}.sql"
Write-Host "Dump schema nihongo -> $schemaFile"
docker exec $container pg_dump -U $user --schema-only nihongo | Set-Content -Path $schemaFile -Encoding utf8

Write-Host "Done. SQL dumps in infra/backups/ (*.sql gitignored)" -ForegroundColor Green
