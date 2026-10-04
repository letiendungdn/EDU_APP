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

# pg_dump ghi file ngay trong container rồi docker cp ra — KHÔNG pipe qua PowerShell:
# pipe decode stdout theo code page console (CP437) nên chữ Việt/Nhật bị hỏng (vd "tự do" -> "tß╗▒ do").
function Invoke-PgDump($container, $user, $db, $file, $extraArgs) {
    $tmp = "/tmp/backup_$([guid]::NewGuid().ToString('N')).sql"
    docker exec $container pg_dump -U $user @extraArgs -f $tmp $db
    if ($LASTEXITCODE -ne 0) { throw "pg_dump $db that bai (exit $LASTEXITCODE)" }
    docker cp "${container}:$tmp" $file
    if ($LASTEXITCODE -ne 0) { throw "docker cp $db that bai (exit $LASTEXITCODE)" }
    docker exec $container rm -f $tmp | Out-Null
}

foreach ($item in $dumps) {
    if (-not (docker ps --format "{{.Names}}" | Select-String -Quiet "^$($item.Container)$")) {
        Write-Host "Bo qua $($item.Db) - container '$($item.Container)' chua chay." -ForegroundColor Yellow
        continue
    }
    $file = Join-Path $outDir "$($item.Db)_${ts}.sql"
    Write-Host "Dump $($item.Db) -> $file"
    Invoke-PgDump $item.Container $item.User $item.Db $file @()
}

$schemaFile = Join-Path $outDir "nihongo_schema_${ts}.sql"
Write-Host "Dump schema nihongo -> $schemaFile"
Invoke-PgDump "edu-postgres-nihongo" "nihongo" "nihongo" $schemaFile @("--schema-only")

Write-Host "Done. SQL dumps saved in infra/backups/" -ForegroundColor Green
