# Export nội dung học từ PostgreSQL → nihongo-content-seed.sql (UTF-8)
$ErrorActionPreference = "Stop"
$container = if ($env:POSTGRES_CONTAINER) { $env:POSTGRES_CONTAINER } else { "edu-postgres-nihongo" }
$dumpSh = Join-Path $PSScriptRoot "dump-content-tables.sh"
$out = Join-Path $PSScriptRoot "nihongo-content-seed.sql"

if (-not (docker ps --format "{{.Names}}" | Select-String -Quiet "^${container}$")) {
    Write-Host "Container '$container' chưa chạy. Chạy: docker compose up -d postgres-nihongo" -ForegroundColor Yellow
    exit 1
}

$lfScript = [System.IO.File]::ReadAllText($dumpSh).Replace("`r`n", "`n").Replace("`r", "`n")
$tempSh = [System.IO.Path]::GetTempFileName()
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($tempSh, $lfScript, $utf8)

docker cp $tempSh "${container}:/tmp/dump-content-tables.sh"
Remove-Item $tempSh -Force

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

[System.IO.File]::WriteAllText($out, $stdout, $utf8)
Write-Host "Done ($((Get-Item $out).Length) bytes)" -ForegroundColor Green
