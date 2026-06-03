$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$LogDir = Join-Path $RepoRoot "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $LogDir "fb-post-$Stamp.log"

Set-Location $RepoRoot

"[$(Get-Date -Format o)] Starting AutoTech Daily Facebook publisher" | Tee-Object -FilePath $LogFile
npm run fb:post 2>&1 | Tee-Object -FilePath $LogFile -Append
$ExitCode = $LASTEXITCODE
"[$(Get-Date -Format o)] Finished with exit code $ExitCode" | Tee-Object -FilePath $LogFile -Append

exit $ExitCode
