# Backup PostgreSQL — nihongo và english_learning trên 2 container riêng
# Usage: powershell -File infra/backups/backup.ps1

$ErrorActionPreference = "Stop"
$outDir = $PSScriptRoot
$ts = Get-Date -Format "yyyyMMdd_HHmmss"

$dumps = @(
    @{ Container = "edu-postgres-nihongo"; User = "nihongo"; Db = "nihongo" },
    @{ Container = "edu-postgres-english"; User = "english"; Db = "english_learning" }
)

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

foreach ($item in $dumps) {
    if (-not (docker ps --format "{{.Names}}" | Select-String -Quiet "^$($item.Container)$")) {
        Write-Host "Container '$($item.Container)' chưa chạy. Chạy: docker compose up -d postgres-nihongo postgres-english" -ForegroundColor Yellow
        exit 1
    }
    $file = Join-Path $outDir "$($item.Db)_${ts}.sql"
    Write-Host "Dump $($item.Db) -> $file"
    docker exec $item.Container pg_dump -U $item.User $item.Db | Set-Content -Path $file -Encoding utf8
}

$schemaFile = Join-Path $outDir "nihongo_schema_${ts}.sql"
Write-Host "Dump schema nihongo -> $schemaFile"
docker exec edu-postgres-nihongo pg_dump -U nihongo --schema-only nihongo | Set-Content -Path $schemaFile -Encoding utf8

Write-Host "Done. SQL dumps in infra/backups/ (*.sql gitignored)" -ForegroundColor Green
