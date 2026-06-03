$TaskBaseName = "CarNewsDripPublisher"

schtasks /Delete /F /TN "$TaskBaseName-Startup" 2>$null | Out-Host
schtasks /Delete /F /TN "$TaskBaseName-Check" 2>$null | Out-Host

Write-Host "Removed Car News drip publisher scheduled tasks."
