# Export nội dung học từ PostgreSQL → nihongo-content-seed.sql (UTF-8)
$ErrorActionPreference = "Stop"
$container = if ($env:POSTGRES_CONTAINER) { $env:POSTGRES_CONTAINER } else { "edu-postgres" }
$dumpSh = Join-Path $PSScriptRoot "dump-content-tables.sh"
$out = Join-Path $PSScriptRoot "nihongo-content-seed.sql"

if (-not (docker ps --format "{{.Names}}" | Select-String -Quiet "^${container}$")) {
    Write-Host "Container '$container' chưa chạy. Chạy: docker compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

docker cp $dumpSh "${container}:/tmp/dump-content-tables.sh"
Write-Host "Dump content -> $out"

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "docker"
$psi.Arguments = "exec $container sh /tmp/dump-content-tables.sh"
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8

$proc = [System.Diagnostics.Process]::Start($psi)
$stdout = $proc.StandardOutput.ReadToEnd()
$stderr = $proc.StandardError.ReadToEnd()
$proc.WaitForExit()
if ($proc.ExitCode -ne 0) {
    Write-Error $stderr
}

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($out, $stdout, $utf8)
Write-Host "Done ($((Get-Item $out).Length) bytes)" -ForegroundColor Green
