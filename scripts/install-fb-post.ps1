$ErrorActionPreference = "Stop"

$TaskBaseName = "AutoTechDailyFBPost"
$Runner = Resolve-Path (Join-Path $PSScriptRoot "run-fb-post.ps1")
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$Action = "`"$PowerShellExe`" -NoProfile -ExecutionPolicy Bypass -File `"$Runner`""

schtasks /Create /F /TN "$TaskBaseName-Startup" /SC ONLOGON /TR $Action | Out-Host
schtasks /Create /F /TN "$TaskBaseName-Check" /SC MINUTE /MO 30 /TR $Action | Out-Host

Write-Host ""
Write-Host "Installed scheduled tasks:"
Write-Host "  $TaskBaseName-Startup  - checks the Facebook queue when you log in"
Write-Host "  $TaskBaseName-Check    - checks the Facebook queue every 30 minutes"
Write-Host ""
Write-Host "Run this anytime to test manually:"
Write-Host "  npm run fb:post"
