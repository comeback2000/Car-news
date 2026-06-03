$TaskBaseName = "AutoTechDailyFBPost"

schtasks /Delete /F /TN "$TaskBaseName-Startup" 2>$null | Out-Host
schtasks /Delete /F /TN "$TaskBaseName-Check" 2>$null | Out-Host

Write-Host "Removed AutoTech Daily Facebook publisher scheduled tasks."
