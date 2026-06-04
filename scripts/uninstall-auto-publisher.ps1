$ErrorActionPreference = "SilentlyContinue"

$TaskBaseName = "CarNewsAutoPublisher"
schtasks /Delete /F /TN "$TaskBaseName-Morning" | Out-Host
schtasks /Delete /F /TN "$TaskBaseName-Afternoon" | Out-Host
schtasks /Delete /F /TN "$TaskBaseName-Startup" | Out-Host
schtasks /Delete /F /TN "$TaskBaseName-Catchup" | Out-Host

Write-Host "Removed Car News auto publisher scheduled tasks."
