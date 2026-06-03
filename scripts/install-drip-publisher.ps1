$ErrorActionPreference = "Stop"

$TaskBaseName = "CarNewsDripPublisher"
$Runner = Resolve-Path (Join-Path $PSScriptRoot "run-drip-publisher.ps1")
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$Action = "`"$PowerShellExe`" -NoProfile -ExecutionPolicy Bypass -File `"$Runner`""

schtasks /Create /F /TN "$TaskBaseName-Startup" /SC ONLOGON /TR $Action | Out-Host
schtasks /Create /F /TN "$TaskBaseName-Check" /SC MINUTE /MO 30 /TR $Action | Out-Host

Write-Host ""
Write-Host "Installed scheduled tasks:"
Write-Host "  $TaskBaseName-Startup  - checks the queue when you log in"
Write-Host "  $TaskBaseName-Check    - checks the queue every 30 minutes"
Write-Host ""
Write-Host "Posts are released by scripts/drip-publish.js every 120 minutes by default."
Write-Host "Run this anytime to test manually:"
Write-Host "  npm run publish:drip"
