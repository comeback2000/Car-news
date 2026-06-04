$ErrorActionPreference = "Stop"

$TaskBaseName = "CarNewsAutoPublisher"
$Runner = Resolve-Path (Join-Path $PSScriptRoot "run-auto-publisher.ps1")
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$Action = "`"$PowerShellExe`" -NoProfile -ExecutionPolicy Bypass -File `"$Runner`""

schtasks /Create /F /TN "$TaskBaseName-Morning" /SC DAILY /ST 09:15 /TR $Action | Out-Host
schtasks /Create /F /TN "$TaskBaseName-Afternoon" /SC DAILY /ST 16:00 /TR $Action | Out-Host
schtasks /Create /F /TN "$TaskBaseName-Startup" /SC ONLOGON /TR $Action | Out-Host
schtasks /Create /F /TN "$TaskBaseName-Catchup" /SC HOURLY /MO 1 /TR $Action | Out-Host

Write-Host ""
Write-Host "Installed scheduled tasks:"
Write-Host "  $TaskBaseName-Morning    - publishes 4 articles at 09:15 IST"
Write-Host "  $TaskBaseName-Afternoon  - publishes 4 articles at 16:00 IST"
Write-Host "  $TaskBaseName-Startup    - checks missed publishing windows when you log in"
Write-Host "  $TaskBaseName-Catchup    - hourly safety check for missed windows"
Write-Host ""
Write-Host "Manual dry run:"
Write-Host "  `$env:AUTO_DRY_RUN='true'; npm run publish:auto"
Write-Host ""
Write-Host "Manual real run for a specific window:"
Write-Host "  `$env:AUTO_FORCE_WINDOW='morning'; npm run publish:auto"
