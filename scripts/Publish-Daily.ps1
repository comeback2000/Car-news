param(
  [switch]$InstallTask,
  [switch]$UninstallTask,
  [switch]$Run,
  [switch]$RetryFacebookFailed,
  [switch]$SkipFacebook,
  [switch]$SkipGitPush
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$TaskName = "Car-News-Daily-Publisher"
$SiteUrl = "https://comeback2000.github.io/Car-news"
$GraphApiVersion = "v23.0"
$LogDir = Join-Path $Root "logs"
$DataDir = Join-Path $Root "data"
$AssetsDir = Join-Path $Root "assets"
$PublisherLogPath = Join-Path $DataDir "daily-publisher-log.json"
$PostsPath = Join-Path $DataDir "posts.json"
$LegacyTaskNames = @(
  "CarNewsAutoPublisher-Morning",
  "CarNewsAutoPublisher-Afternoon",
  "CarNewsAutoPublisher-Startup",
  "CarNewsAutoPublisher-Catchup",
  "CarNewsDripPublisher-Startup",
  "CarNewsDripPublisher-Check",
  "AutoTechDailyFBPost-Startup",
  "AutoTechDailyFBPost-Check"
)

function Remove-LegacyTasks {
  foreach ($name in $LegacyTaskNames) {
    Unregister-ScheduledTask -TaskName $name -Confirm:$false -ErrorAction SilentlyContinue
  }
}

function Install-DailyTask {
  Remove-LegacyTasks
  $script = Join-Path $PSScriptRoot "Publish-Daily.ps1"
  $action = New-ScheduledTaskAction `
    -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$script`" -Run"
  $trigger = New-ScheduledTaskTrigger -Daily -At "09:15"
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2)
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Publish 6 daily Car News articles and Facebook posts." -Force | Out-Null
  Write-Host "Installed scheduled task '$TaskName' for 9:15 AM local time."
}

function Uninstall-DailyTask {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  Remove-LegacyTasks
  Write-Host "Removed scheduled task '$TaskName'."
}

if ($InstallTask) {
  Install-DailyTask
  exit 0
}

if ($UninstallTask) {
  Uninstall-DailyTask
  exit 0
}

New-Item -ItemType Directory -Force -Path $LogDir, $DataDir, $AssetsDir | Out-Null
$RunStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$RunLog = Join-Path $LogDir "daily-publisher-$RunStamp.log"
Start-Transcript -Path $RunLog -Append | Out-Null

function Read-Json($Path, $Fallback) {
  if (!(Test-Path $Path)) { return $Fallback }
  $raw = (Get-Content $Path -Raw).Trim()
  if (!$raw) { return $Fallback }
  return $raw | ConvertFrom-Json
}

function Read-JsonArray($Path) {
  $value = Read-Json $Path @()
  if ($null -eq $value) { return }
  if ($value -is [array]) {
    foreach ($item in $value) { $item }
    return
  }
  $value
}

function Write-Json($Path, $Value) {
  $json = $Value | ConvertTo-Json -Depth 80
  $encoding = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($Path, $json, $encoding)
}

function Invoke-CheckedCommand($FilePath, [string[]]$Arguments) {
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FilePath failed with exit code $LASTEXITCODE."
  }
}

function Wait-PublicUrl($Url, $Label) {
  for ($attempt = 1; $attempt -le 12; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -TimeoutSec 20
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) { return $true }
    } catch {
      Write-Host "Waiting for $Label to become public ($attempt/12): $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 20
  }
  return $false
}

function Get-WebErrorMessage($ErrorRecord) {
  $message = $ErrorRecord.Exception.Message
  $response = $ErrorRecord.Exception.Response
  if ($response -and $response.GetResponseStream()) {
    try {
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      $body = $reader.ReadToEnd()
      $reader.Dispose()
      if ($body) { $message = "$message $body" }
    } catch {}
  }
  return $message
}

function Read-DotEnv {
  $envPath = Join-Path $Root ".env"
  if (!(Test-Path $envPath)) { return }
  foreach ($line in Get-Content $envPath) {
    $trimmed = $line.Trim()
    if (!$trimmed -or $trimmed.StartsWith("#") -or !$trimmed.Contains("=")) { continue }
    $key, $value = $trimmed.Split("=", 2)
    $key = $key.Trim()
    $value = $value.Trim().Trim('"').Trim("'")
    if (![Environment]::GetEnvironmentVariable($key, "Process")) {
      [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
  }
}

function Slugify($Value) {
  $slug = $Value.ToLowerInvariant() -replace "&", "and"
  $slug = $slug -replace "[^a-z0-9]+", "-"
  return $slug.Trim("-")
}

function Normalize-Key($Value) {
  return ($Value -as [string]).Trim().ToLowerInvariant()
}

function Read-KeywordPool {
  $files = @(
    (Join-Path $Root "Keywords.txt"),
    (Join-Path $Root "keywords.txt"),
    (Join-Path $DataDir "keywords.txt")
  ) | Where-Object { Test-Path $_ }

  if (!$files) { throw "No keyword file found. Create Keywords.txt or data\keywords.txt." }

  $pool = [ordered]@{ car = @(); bike = @(); mobile = @() }
  foreach ($file in $files) {
    foreach ($line in Get-Content $file) {
      $keyword = $line.Trim()
      if (!$keyword -or $keyword -match "^https?://") { continue }
      $lower = $keyword.ToLowerInvariant()
      if ($lower -match "bike|bikes|scooter|motorcycle|two.?wheeler") {
        $pool.bike += $keyword
      } elseif ($lower -match "mobile|phone|iphone|apple|android|smartphone|gpu") {
        $pool.mobile += $keyword
      } elseif ($lower -match "car|cars|ev|electric|suv|tata|mahindra|maruti|hyundai|kia|mg|byd|toyota|charging|battery|range") {
        $pool.car += $keyword
      }
    }
  }

  foreach ($key in @("car", "bike", "mobile")) {
    $seen = @{}
    $pool[$key] = @($pool[$key] | Where-Object {
      $k = Normalize-Key $_
      if ($seen.ContainsKey($k)) { $false } else { $seen[$k] = $true; $true }
    })
  }
  return $pool
}

function New-EmptyPublisherLog {
  [pscustomobject]@{
    cursors = [pscustomobject]@{ car = 0; bike = 0; mobile = 0 }
    publishedKeywords = @()
    publishedSlugs = @()
    thumbnailHashes = @()
    thumbnailSources = @()
    facebookUrls = @()
    runs = @()
  }
}

function Select-NextKeywords($Pool, $State, $ExistingPosts) {
  $needed = [ordered]@{ car = 2; bike = 2; mobile = 2 }
  $used = @{}
  foreach ($keyword in @($State.publishedKeywords) + @($ExistingPosts | ForEach-Object { $_.targetKeyword })) {
    if ($keyword) { $used[(Normalize-Key $keyword)] = $true }
  }

  $selected = @()
  foreach ($category in $needed.Keys) {
    $list = @($Pool[$category])
    if ($list.Count -lt $needed[$category]) {
      throw "Keyword file needs at least $($needed[$category]) unused $category keywords."
    }

    $cursor = [int]$State.cursors.$category
    $picked = 0
    $checked = 0
    while ($picked -lt $needed[$category] -and $checked -lt ($list.Count * 2)) {
      $index = $cursor % $list.Count
      $keyword = $list[$index]
      $cursor++
      $checked++
      $key = Normalize-Key $keyword
      if ($used.ContainsKey($key)) { continue }
      $used[$key] = $true
      $selected += [pscustomobject]@{ Niche = $category; Keyword = $keyword }
      $picked++
    }

    $State.cursors.$category = $cursor % $list.Count
    if ($picked -lt $needed[$category]) {
      throw "No unused $category keywords remain. Add more keywords to Keywords.txt."
    }
  }

  return $selected
}

function Get-NewsResearch($Keyword, $Niche) {
  $query = "$Keyword India latest news"
  if ($Niche -eq "car") { $query = "$Keyword India auto car EV latest" }
  if ($Niche -eq "bike") { $query = "$Keyword India bike two wheeler latest" }
  if ($Niche -eq "mobile") { $query = "$Keyword India mobile technology latest" }

  $url = "https://news.google.com/rss/search?q=$([uri]::EscapeDataString($query))&hl=en-IN&gl=IN&ceid=IN:en"
  try {
    [xml]$xml = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 25).Content
    return @($xml.rss.channel.item | Select-Object -First 5 | ForEach-Object {
      [pscustomobject]@{
        title = [string]$_.title
        link = [string]$_.link
        source = if ($_.source) { [string]$_.source.InnerText } else { "Google News" }
        pubDate = [string]$_.pubDate
      }
    })
  } catch {
    return @([pscustomobject]@{
      title = "$Keyword latest India update"
      link = "https://news.google.com/search?q=$([uri]::EscapeDataString($Keyword))"
      source = "Google News"
      pubDate = (Get-Date).ToUniversalTime().ToString("R")
    })
  }
}

function Clean-NewsTitle($Title) {
  $clean = ($Title -as [string]).Trim()
  if (!$clean) { return "" }
  $clean = $clean -replace "\s+", " "
  $parts = $clean -split "\s-\s"
  if ($parts.Count -gt 1) {
    return ($parts[0..($parts.Count - 2)] -join " - ").Trim()
  }
  return $clean
}

function Get-SourceNames($Research) {
  @($Research | ForEach-Object { $_.source } | Where-Object { $_ } | Select-Object -Unique)
}

function Get-ResearchThemes($Research, $Niche) {
  $text = (($Research | ForEach-Object { $_.title }) -join " ").ToLowerInvariant()
  $themes = @()
  if ($text -match "launch|unveil|introduced|arrived") { $themes += "fresh launches" }
  if ($text -match "price|pricing|cost|emi|discount") { $themes += "pricing pressure" }
  if ($text -match "range|battery|charging|charger") { $themes += "range and charging confidence" }
  if ($text -match "sales|demand|deliveries|bookings") { $themes += "buyer demand" }
  if ($text -match "hybrid|petrol|diesel|cng|ice|ethanol") { $themes += "powertrain choice" }
  if ($text -match "ai|chip|gpu|camera|software|update") { $themes += "technology upgrades" }
  if ($text -match "service|warranty|ownership|reliability") { $themes += "ownership support" }
  if (!$themes) {
    if ($Niche -eq "bike") { $themes = @("commuter value", "running cost", "ownership support") }
    elseif ($Niche -eq "mobile") { $themes = @("upgrade timing", "software features", "value for money") }
    else { $themes = @("launch timing", "ownership value", "market competition") }
  }
  return @($themes | Select-Object -Unique)
}

function Get-LongTailKeywords($Niche, $Keyword, $Themes) {
  $base = ($Keyword -as [string]).Trim()
  if ($Niche -eq "bike") {
    return @(
      "electric bike buying guide India",
      "best commuter bike ownership cost",
      "two wheeler launch updates India"
    )
  }
  if ($Niche -eq "mobile") {
    return @(
      "smartphone upgrade guide India",
      "mobile launch buying advice",
      "AI phone features for Indian buyers"
    )
  }
  $tails = @(
    "EV buying guide India",
    "electric SUV ownership cost",
    "new car launch shortlist India"
  )
  if (($base + " " + ($Themes -join " ")) -match "charging|range") { $tails += "EV charging network India" }
  if (($base + " " + ($Themes -join " ")) -match "battery") { $tails += "EV battery warranty India" }
  return @($tails | Select-Object -Unique)
}

function Get-DecisionLens($Niche) {
  if ($Niche -eq "bike") {
    return [pscustomobject]@{
      audience = "daily riders and first-time two-wheeler buyers"
      money = "on-road price, fuel or electricity cost, tyres, battery health if it is an EV, and service reach"
      compare = "Hero, TVS, Bajaj, Ola, Ather, Honda and Royal Enfield options depending on budget and use case"
      takeaway = "The smartest choice is usually the bike that keeps monthly running costs predictable while still feeling easy to live with every day."
    }
  }
  if ($Niche -eq "mobile") {
    return [pscustomobject]@{
      audience = "Indian smartphone buyers planning an upgrade"
      money = "launch price, exchange value, software support, repair cost and whether the headline feature will matter after a month"
      compare = "Apple, Samsung, Xiaomi, OnePlus, Vivo, Oppo and iQOO alternatives in the same price band"
      takeaway = "The best upgrade is the phone that improves daily use, not the one with the loudest spec sheet."
    }
  }
  return [pscustomobject]@{
    audience = "Indian car buyers building a serious shortlist"
    money = "ex-showroom price, real range, charging access, insurance, service support, resale confidence and waiting period"
    compare = "Tata, Mahindra, Maruti Suzuki, Hyundai, Kia, MG, BYD and Toyota alternatives"
    takeaway = "A strong launch story only matters if the ownership package still looks good after the first wave of hype."
  }
}

function Get-ResearchBrief($Keyword, $Niche, $Research) {
  $headlines = @($Research | Select-Object -First 5 | ForEach-Object { Clean-NewsTitle $_.title } | Where-Object { $_ })
  $sources = @(Get-SourceNames $Research)
  $themes = @(Get-ResearchThemes -Research $Research -Niche $Niche)
  $longTail = @(Get-LongTailKeywords -Niche $Niche -Keyword $Keyword -Themes $themes)
  $lens = Get-DecisionLens $Niche
  $sourceLine = if ($sources.Count) { ($sources | Select-Object -First 4) -join ", " } else { "Google News" }
  $headlineLine = if ($headlines.Count) { ($headlines | Select-Object -First 3) -join "; " } else { "$Keyword latest update" }
  $themeLine = if ($themes.Count) { ($themes | Select-Object -First 3) -join ", " } else { "buyer interest" }

  return [pscustomobject]@{
    headlines = $headlines
    sources = $sources
    themes = $themes
    longTailKeywords = $longTail
    sourceLine = $sourceLine
    headlineLine = $headlineLine
    themeLine = $themeLine
    lens = $lens
  }
}

function Get-Category($Niche, $Keyword) {
  $lower = $Keyword.ToLowerInvariant()
  if ($Niche -eq "bike") { return "Bike News" }
  if ($Niche -eq "mobile") { return "Mobile Tech" }
  if ($lower -match "tata") { return "Tata Motors" }
  if ($lower -match "mahindra") { return "Mahindra EVs" }
  if ($lower -match "maruti") { return "Maruti Suzuki" }
  if ($lower -match "hyundai") { return "Hyundai India" }
  if ($lower -match "toyota") { return "Toyota India" }
  return "EV Buying Guides"
}

function Get-Title($Niche, $Keyword, $Brief = $null) {
  $lower = $Keyword.ToLowerInvariant()
  if ($Niche -eq "bike") {
    if ($lower -match "best|ev") { return "What Indian Riders Should Know Before Buying" }
    if ($lower -match "launch") { return "The New Bike Launches Worth Waiting For" }
    if ($lower -match "ice|vs") { return "EV or ICE Bikes: The Choice Riders Are Rechecking" }
    if ($lower -match "price") { return "The Real Cost Question Every Rider Should Ask" }
    if ($lower -match "range") { return "The Range Promise Riders Should Check Before Buying" }
    return "What Indian Riders Should Know Before Buying"
  }
  if ($Niche -eq "mobile") {
    if ($lower -match "launch") { return "The Phone Launches Worth Watching Before You Upgrade" }
    if ($lower -match "apple|iphone") { return "The Apple Update Buyers Should Watch Before Upgrading" }
    if ($lower -match "ai") { return "The AI Phone Shift Buyers Should Watch Closely" }
    if ($lower -match "gpu") { return "The Mobile Performance Upgrade Buyers Should Not Ignore" }
    return "The Tech Update Indian Buyers Should Watch Before Upgrading"
  }
  if ($lower -match "launch") { return "New EV Launches That Could Change Your 2026 Shortlist" }
  if ($lower -match "electric suv") { return "The Electric SUVs Buyers Should Shortlist Before Prices Move" }
  if ($lower -match "vs") { return "Which Option Makes More Sense for Indian Buyers?" }
  if ($lower -match "charging") { return "The Charging Question Buyers Should Ask Before Booking" }
  if ($lower -match "battery") { return "The Battery Life Question Every EV Buyer Should Ask" }
  if ($lower -match "cheap|under|affordable") { return "The Affordable EV Picks Buyers Should Check First" }
  return "What Buyers Should Know Before the Next Auto Update"
}

function Get-Tags($Niche, $Keyword) {
  if ($Niche -eq "bike") { return @($Keyword, "Bike News India", "EV Bikes India", "Two Wheeler News", "Bike Buying Guide") }
  if ($Niche -eq "mobile") { return @($Keyword, "Mobile Tech India", "Smartphone News", "AI Tech News", "Phone Buying Guide") }
  return @($Keyword, "India car news", "Electric SUV India", "EV buying guide", "Auto market India")
}

function Get-ThumbnailCandidates($Niche, $Keyword) {
  $lower = $Keyword.ToLowerInvariant()
  if ($Niche -eq "car") {
    if ($lower -match "curvv") { return @("https://www.tatamotors.com/wp-content/uploads/2024/08/EV-Front-3-4-scaled.jpg") }
    if ($lower -match "harrier") { return @("https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/06/thumb.jpg") }
    if ($lower -match "mahindra|xev|be 6|be6") { return @("https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dw6e27f812/press-release/26nov/desktop/1.1.jpg") }
    if ($lower -match "cheap|under|mg") { return @("https://mgmotor.scene7.com/is/image/mgmotor/hd-img-dsc-068?fit=constrain&fmt=jpg&qlt=90&resMode=bisharp&wid=1600") }
    return @("https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/07/th-040725.jpg", "https://www.tatamotors.com/wp-content/uploads/2024/08/EV-Front-3-4-scaled.jpg")
  }
  if ($Niche -eq "bike") {
    return @(
      "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg",
      "https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg"
    )
  }
  return @(
    "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg",
    "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg"
  )
}

function Get-ContentHash($Path) {
  if (!(Test-Path $Path)) { return $null }
  return (Microsoft.PowerShell.Utility\Get-FileHash -Algorithm SHA256 -Path $Path).Hash.ToLowerInvariant()
}

function Get-ThumbnailBadge($Niche, $Keyword) {
  $lower = $Keyword.ToLowerInvariant()
  if ($Niche -eq "bike") {
    if ($lower -match "ev|electric") { return "EV BIKE WATCH" }
    if ($lower -match "launch") { return "NEW BIKE ALERT" }
    return "RIDER GUIDE"
  }
  if ($Niche -eq "mobile") {
    if ($lower -match "ai") { return "AI PHONE WATCH" }
    if ($lower -match "apple|iphone") { return "APPLE UPDATE" }
    return "TECH ALERT"
  }
  if ($lower -match "charging|range|battery") { return "EV BUYER ALERT" }
  if ($lower -match "launch") { return "NEW EV WATCH" }
  return "AUTO TREND"
}

function Draw-HeadlineText($Graphics, $Text, $Font, $X, $Y, $MaxWidth, $LineHeight, $MaxLines) {
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 0, 0, 0))
  $words = $Text.ToUpperInvariant().Split(" ")
  $lines = @()
  $line = ""
  foreach ($word in $words) {
    $trial = "$line $word".Trim()
    if ($Graphics.MeasureString($trial, $Font).Width -gt $MaxWidth -and $line) {
      $lines += $line
      $line = $word
    } else {
      $line = $trial
    }
    if ($lines.Count -ge $MaxLines) { break }
  }
  if ($line -and $lines.Count -lt $MaxLines) { $lines += $line }
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $yy = $Y + ($i * $LineHeight)
    $Graphics.DrawString($lines[$i], $Font, $shadow, $X + 5, $yy + 5)
    $Graphics.DrawString($lines[$i], $Font, $white, $X, $yy)
  }
  $white.Dispose()
  $shadow.Dispose()
}

function Add-ThumbnailOverlay($Path, $Title, $Niche, $Keyword) {
  Add-Type -AssemblyName System.Drawing
  $source = [System.Drawing.Image]::FromFile($Path)
  $bitmap = New-Object System.Drawing.Bitmap 1600, 900
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = "AntiAlias"
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  $scale = [Math]::Max(1600 / $source.Width, 900 / $source.Height)
  $srcWidth = [Math]::Min($source.Width, 1600 / $scale)
  $srcHeight = [Math]::Min($source.Height, 900 / $scale)
  $srcX = [Math]::Max(0, ($source.Width - $srcWidth) / 2)
  $srcY = [Math]::Max(0, ($source.Height - $srcHeight) / 2)
  $graphics.DrawImage($source, 0, 0, 1600, 900)
  $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle 0, 0, 1600, 900), $srcX, $srcY, $srcWidth, $srcHeight, [System.Drawing.GraphicsUnit]::Pixel)

  $rect = New-Object System.Drawing.Rectangle 0, 0, 1600, 900
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(238, 0, 0, 0)), ([System.Drawing.Color]::FromArgb(65, 0, 0, 0)), 0
  $graphics.FillRectangle($gradient, $rect)
  $bottom = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 0, 0, 0))
  $graphics.FillRectangle($bottom, 0, 760, 1600, 140)

  $accentColor = if ($Niche -eq "bike") { [System.Drawing.Color]::FromArgb(0, 224, 154) } elseif ($Niche -eq "mobile") { [System.Drawing.Color]::FromArgb(72, 190, 255) } else { [System.Drawing.Color]::FromArgb(255, 199, 44) }
  $accent = New-Object System.Drawing.SolidBrush $accentColor
  $black = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 20, 20))
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $smallFont = New-Object System.Drawing.Font "Arial", 28, ([System.Drawing.FontStyle]::Bold)
  $tinyFont = New-Object System.Drawing.Font "Arial", 18, ([System.Drawing.FontStyle]::Bold)
  $headlineFont = New-Object System.Drawing.Font "Arial", 72, ([System.Drawing.FontStyle]::Bold)

  $badge = Get-ThumbnailBadge -Niche $Niche -Keyword $Keyword
  $graphics.FillRectangle($accent, 70, 62, 430, 56)
  $graphics.DrawString($badge, $smallFont, $black, 92, 76)
  Draw-HeadlineText -Graphics $graphics -Text $Title -Font $headlineFont -X 70 -Y 250 -MaxWidth 1000 -LineHeight 86 -MaxLines 5

  $graphics.FillRectangle($accent, 0, 832, 1600, 14)
  $graphics.DrawString("Fresh India update  |  Buyer guide  |  No hype, practical takeaways", $tinyFont, $white, 72, 802)
  $graphics.DrawString("Car News original thumbnail | real source image with editorial overlay", $tinyFont, $white, 72, 855)

  $tmp = "$Path.tmp.jpg"
  $bitmap.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $headlineFont.Dispose()
  $smallFont.Dispose()
  $tinyFont.Dispose()
  $white.Dispose()
  $black.Dispose()
  $accent.Dispose()
  $bottom.Dispose()
  $gradient.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  $source.Dispose()
  Move-Item -LiteralPath $tmp -Destination $Path -Force
}

function New-FallbackThumbnail($Path, $Title, $Niche) {
  Add-Type -AssemblyName System.Drawing
  $bitmap = New-Object System.Drawing.Bitmap 1600, 900
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = "AntiAlias"
  $colors = @{
    car = [System.Drawing.Color]::FromArgb(12, 24, 38)
    bike = [System.Drawing.Color]::FromArgb(24, 35, 28)
    mobile = [System.Drawing.Color]::FromArgb(26, 22, 42)
  }
  $brush = New-Object System.Drawing.SolidBrush $colors[$Niche]
  $graphics.FillRectangle($brush, 0, 0, 1600, 900)
  $accent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 191, 31))
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $fontBig = New-Object System.Drawing.Font "Arial", 68, ([System.Drawing.FontStyle]::Bold)
  $fontSmall = New-Object System.Drawing.Font "Arial", 34, ([System.Drawing.FontStyle]::Bold)
  $graphics.FillRectangle($accent, 70, 70, 440, 58)
  $graphics.DrawString($Niche.ToUpperInvariant(), $fontSmall, [System.Drawing.Brushes]::Black, 92, 82)
  $words = $Title.ToUpperInvariant().Split(" ")
  $line = ""
  $y = 330
  foreach ($word in $words) {
    $trial = "$line $word".Trim()
    if ($graphics.MeasureString($trial, $fontBig).Width -gt 1180 -and $line) {
      $graphics.DrawString($line, $fontBig, $white, 72, $y)
      $line = $word
      $y += 82
    } else {
      $line = $trial
    }
  }
  if ($line) { $graphics.DrawString($line, $fontBig, $white, 72, $y) }
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $graphics.Dispose()
  $bitmap.Dispose()
}

function New-Thumbnail($Post, $Niche, $State, $ExistingImageHashes) {
  $target = Join-Path $Root $Post.image
  $usedSources = @{}
  foreach ($source in @($State.thumbnailSources)) { if ($source) { $usedSources[$source] = $true } }

  foreach ($source in Get-ThumbnailCandidates $Niche $Post.targetKeyword) {
    if ($usedSources.ContainsKey($source)) { continue }
    try {
      Invoke-WebRequest -Uri $source -OutFile $target -UseBasicParsing -TimeoutSec 30
      if ((Get-Item $target).Length -lt 20000) { throw "Downloaded thumbnail too small." }
      Add-ThumbnailOverlay -Path $target -Title $Post.title -Niche $Niche -Keyword $Post.targetKeyword
      $hash = Get-ContentHash $target
      if ($ExistingImageHashes.ContainsKey($hash) -or @($State.thumbnailHashes) -contains $hash) {
        Remove-Item $target -Force
        continue
      }
      $State.thumbnailSources += $source
      $State.thumbnailHashes += $hash
      return
    } catch {
      Remove-Item $target -Force -ErrorAction SilentlyContinue
    }
  }

  New-FallbackThumbnail -Path $target -Title $Post.title -Niche $Niche
  $hash = Get-ContentHash $target
  if ($ExistingImageHashes.ContainsKey($hash) -or @($State.thumbnailHashes) -contains $hash) {
    throw "Could not create a unique thumbnail for $($Post.slug)."
  }
  $State.thumbnailSources += "generated:$($Post.slug)"
  $State.thumbnailHashes += $hash
}

function New-Article($Selection, $ExistingSlugs) {
  $keyword = $Selection.Keyword
  $niche = $Selection.Niche
  $slugBase = Slugify $keyword
  $slug = $slugBase
  $suffix = 2026
  while ($ExistingSlugs.ContainsKey($slug)) {
    $slug = "$slugBase-$suffix"
    $suffix++
  }
  $ExistingSlugs[$slug] = $true

  $research = @(Get-NewsResearch -Keyword $keyword -Niche $niche)
  $brief = Get-ResearchBrief -Keyword $keyword -Niche $niche -Research $research
  $title = Get-Title -Niche $niche -Keyword $keyword -Brief $brief
  $category = Get-Category -Niche $niche -Keyword $keyword
  $today = (Get-Date).ToString("yyyy-MM-dd")
  $primaryLongTail = @($brief.longTailKeywords | Select-Object -First 1)[0]
  $secondaryLongTail = @($brief.longTailKeywords | Select-Object -Skip 1 -First 1)[0]
  $lens = $brief.lens
  $sourcesLabel = $brief.sourceLine
  $headlinesLabel = $brief.headlineLine
  $themesLabel = $brief.themeLine
  $metaBase = "$title, explained with latest India news signals, buyer context, comparisons and practical takeaways."
  $excerpt = "Fresh reports from $sourcesLabel point to $themesLabel. Here is what buyers should actually take from the noise."
  $sourceParagraph = "Recent Google News results for this topic point to a more useful story than a simple launch or spec update. Reports tracked from $sourcesLabel highlight $headlinesLabel. Read together, they show why $($lens.audience) are asking sharper questions about $themesLabel."

  [pscustomobject]@{
    slug = $slug
    aliases = @()
    targetKeyword = $keyword
    title = $title
    metaTitle = "$title | Car News"
    metaDescription = $metaBase.Substring(0, [Math]::Min(155, $metaBase.Length))
    excerpt = $excerpt.Substring(0, [Math]::Min(190, $excerpt.Length))
    category = $category
    tags = @((Get-Tags -Niche $niche -Keyword $keyword) + @($brief.longTailKeywords) | Select-Object -Unique)
    image = "assets/$slug-thumbnail.jpg"
    imageAlt = "$title editorial thumbnail based on $keyword research"
    imageCredit = "Real source image with Car News editorial thumbnail overlay."
    author = "Car News Desk"
    datePublished = $today
    dateModified = $today
    conclusion = "$($lens.takeaway) Keep checking official details and independent reviews before turning this news into a booking decision."
    sources = @($research | ForEach-Object { [pscustomobject]@{ label = "$($_.source): $($_.title)"; url = $_.link } })
    sections = @(
      [pscustomobject]@{
        heading = "Why This Story Matters Now"
        paragraphs = @(
          $sourceParagraph,
          "That matters because the Indian market is no longer reacting only to headline announcements. Buyers are comparing delivery timelines, ownership cost, feature maturity and service confidence before they treat any new update as shortlist-worthy."
        )
        subsections = @([pscustomobject]@{ heading = "Reader intent"; paragraphs = @("For buyers, the useful question is closer to ${primaryLongTail}: what changed, why it matters, and whether this update should influence a real buying decision.") })
      },
      [pscustomobject]@{
        heading = "The Buyer Angle Most Headlines Miss"
        paragraphs = @(
          "For $($lens.audience), the important part is not whether a story is trending. It is whether the update changes the real buying equation: $($lens.money).",
          "This is where many quick summaries fall short. A product can look exciting in isolation and still be a weak fit if the waiting period is long, the service network is thin, the warranty wording is vague, or the most useful variant sits far above the advertised entry price."
        )
        subsections = @([pscustomobject]@{ heading = "Practical checklist"; paragraphs = @("Before acting, compare on-road price, confirmed availability, warranty terms, service access, early owner feedback, resale confidence and total monthly cost. Those checks matter more than a single viral claim.") })
      },
      [pscustomobject]@{
        heading = "How It Compares With the Market"
        paragraphs = @(
          "The competitive frame is just as important as the news itself. Indian buyers are likely to compare this update against $($lens.compare), and that comparison will decide whether the story becomes a real sales driver or just another busy news cycle.",
          "The strongest options will be the ones that make the trade-off easy to understand. Range or performance alone is not enough; buyers also want clear pricing, predictable service support, sensible variant packaging and confidence that the product will age well."
        )
        subsections = @([pscustomobject]@{ heading = "Market signal"; paragraphs = @("A useful long-tail angle here is ${secondaryLongTail}. It keeps the story focused on buyer outcomes, ownership questions and the real comparison shoppers are trying to make.") })
      },
      [pscustomobject]@{
        heading = "What Smart Buyers Should Watch Next"
        paragraphs = @(
          "The next signals to watch are official variant details, city-wise availability, early test-drive feedback, real-world efficiency or battery results, and whether dealers can explain the ownership package without ambiguity.",
          $lens.takeaway
        )
        subsections = @([pscustomobject]@{ heading = "Editorial view"; paragraphs = @("Treat this as a shortlist story, not a final verdict. The right decision is the one that still makes sense after the launch buzz, social chatter and first-week excitement fade.") })
      }
    )
  }
}

function Publish-Facebook($Post, $State) {
  if ($SkipFacebook) { return [pscustomobject]@{ status = "skipped"; postId = $null } }
  Read-DotEnv
  $pageId = $env:FB_PAGE_ID
  $token = $env:FB_PAGE_ACCESS_TOKEN
  if (!$pageId -or !$token) { return [pscustomobject]@{ status = "failed"; postId = $null; message = "Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN." } }

  $url = "$SiteUrl/posts/$($Post.slug).html"
  $imageUrl = "$SiteUrl/$($Post.image)"
  if (@($State.facebookUrls) -contains $url) { return [pscustomobject]@{ status = "skipped_duplicate"; postId = $null } }

  if (!(Wait-PublicUrl -Url $url -Label "article $($Post.slug)")) {
    return [pscustomobject]@{ status = "failed"; postId = $null; message = "Article URL is not public yet: $url" }
  }
  if (!(Wait-PublicUrl -Url $imageUrl -Label "image $($Post.slug)")) {
    return [pscustomobject]@{ status = "failed"; postId = $null; message = "Image URL is not public yet: $imageUrl" }
  }

  $caption = @(
    $Post.title,
    "",
    $Post.excerpt,
    "",
    "Read the full story: $url",
    "",
    (($Post.tags + @("CarNews", "AutoTechDaily")) | Select-Object -Unique | Select-Object -First 8 | ForEach-Object { "#" + ($_ -replace "[^a-zA-Z0-9]", "") }) -join " "
  ) -join "`n"

  try {
    $body = @{
      url = $imageUrl
      caption = $caption
      published = "true"
      access_token = $token
    }
    $result = Invoke-RestMethod -Method Post -Uri "https://graph.facebook.com/$GraphApiVersion/$pageId/photos" -Body $body -TimeoutSec 60
    $postId = if ($result.post_id) { $result.post_id } else { $result.id }
    $State.facebookUrls += $url
    return [pscustomobject]@{ status = "published"; postId = $postId }
  } catch {
    return [pscustomobject]@{ status = "failed"; postId = $null; message = (Get-WebErrorMessage $_) }
  }
}

function Invoke-GitPublish($Slugs) {
  Invoke-CheckedCommand "node" @((Join-Path $PSScriptRoot "build-site.js"))
  Invoke-CheckedCommand "git" @("add", "data/posts.json", "data/daily-publisher-log.json", "posts", "category", "tags", "assets", "index.html", "sitemap.xml", "robots.txt")
  $staged = git diff --cached --name-only
  if (!$staged) {
    Write-Host "No generated changes to commit."
    return $null
  }
  $message = "Daily publish: $($Slugs -join ', ')"
  if ($message.Length -gt 180) { $message = $message.Substring(0, 180) }
  Invoke-CheckedCommand "git" @("commit", "-m", $message)
  $commit = (git rev-parse --short HEAD).Trim()
  if (!$SkipGitPush) {
    Invoke-CheckedCommand "git" @("push", "origin", "HEAD:main")
    Invoke-CheckedCommand "git" @("push", "origin", "HEAD:gh-pages")
  }
  return $commit
}

function Retry-FailedFacebookPosts {
  Push-Location $Root
  try {
    Read-DotEnv
    $posts = @(Read-JsonArray $PostsPath)
    $postsBySlug = @{}
    foreach ($post in $posts) { $postsBySlug[$post.slug] = $post }
    $state = Read-Json $PublisherLogPath (New-EmptyPublisherLog)
    if ($null -eq $state.facebookUrls) { $state | Add-Member -MemberType NoteProperty -Name "facebookUrls" -Value @() }
    if ($null -eq $state.runs) { throw "No run history found in $PublisherLogPath." }

    $latestRun = @($state.runs | Select-Object -First 1)[0]
    $failed = @($latestRun.facebook | Where-Object { $_.result.status -eq "failed" })
    if (!$failed) {
      Write-Host "No failed Facebook posts found in the latest run."
      return
    }

    $facebookResults = @()
    foreach ($item in $failed) {
      if (!$postsBySlug.ContainsKey($item.slug)) {
        $facebookResults += [pscustomobject]@{ slug = $item.slug; title = $item.title; result = [pscustomobject]@{ status = "failed"; postId = $null; message = "Post not found in data/posts.json." }; postedAt = (Get-Date).ToString("o") }
        continue
      }
      $post = $postsBySlug[$item.slug]
      $facebookResults += [pscustomobject]@{
        slug = $post.slug
        title = $post.title
        result = Publish-Facebook -Post $post -State $state
        postedAt = (Get-Date).ToString("o")
      }
    }

    $retryEntry = [pscustomobject]@{
      ranAt = (Get-Date).ToString("o")
      commit = $null
      articles = @()
      facebook = $facebookResults
      retryOf = $latestRun.ranAt
    }
    $state.runs = @($retryEntry) + @($state.runs)
    Write-Json $PublisherLogPath $state
    Invoke-CheckedCommand "git" @("add", "data/daily-publisher-log.json")
    if (git diff --cached --quiet) {
      Write-Host "No publisher log changes to commit."
    } else {
      Invoke-CheckedCommand "git" @("commit", "-m", "Retry failed Facebook posts")
      if (!$SkipGitPush) {
        Invoke-CheckedCommand "git" @("push", "origin", "HEAD:main")
        Invoke-CheckedCommand "git" @("push", "origin", "HEAD:gh-pages")
      }
    }

    foreach ($result in $facebookResults) {
      Write-Host "Facebook $($result.result.status): $($result.slug) $($result.result.postId)"
      if ($result.result.message) { Write-Host "Facebook message: $($result.result.message)" }
    }
  } finally {
    Pop-Location -ErrorAction SilentlyContinue
  }
}

if ($RetryFacebookFailed) {
  Retry-FailedFacebookPosts
  exit 0
}

try {
  Push-Location $Root
  Read-DotEnv

  $posts = @(Read-JsonArray $PostsPath)
  $state = Read-Json $PublisherLogPath (New-EmptyPublisherLog)
  foreach ($prop in @("publishedKeywords", "publishedSlugs", "thumbnailHashes", "thumbnailSources", "facebookUrls", "runs")) {
    if ($null -eq $state.$prop) { $state | Add-Member -MemberType NoteProperty -Name $prop -Value @() }
  }
  if ($null -eq $state.cursors) { $state | Add-Member -MemberType NoteProperty -Name "cursors" -Value ([pscustomobject]@{ car = 0; bike = 0; mobile = 0 }) }

  $pool = Read-KeywordPool
  $selections = @(Select-NextKeywords -Pool $pool -State $state -ExistingPosts $posts)
  $existingSlugs = @{}
  foreach ($post in $posts) { $existingSlugs[$post.slug] = $true }
  $existingImageHashes = @{}
  foreach ($post in $posts) {
    $imagePath = Join-Path $Root $post.image
    $hash = Get-ContentHash $imagePath
    if ($hash) { $existingImageHashes[$hash] = $true }
  }

  $newPosts = @()
  foreach ($selection in $selections) {
    $post = New-Article -Selection $selection -ExistingSlugs $existingSlugs
    New-Thumbnail -Post $post -Niche $selection.Niche -State $state -ExistingImageHashes $existingImageHashes
    $newPosts += $post
    $state.publishedKeywords += $post.targetKeyword
    $state.publishedSlugs += $post.slug
  }

  $posts = @($newPosts) + @($posts)
  Write-Json $PostsPath $posts
  Write-Json $PublisherLogPath $state

  $commit = Invoke-GitPublish -Slugs @($newPosts | ForEach-Object { $_.slug })

  $facebookResults = @()
  foreach ($post in $newPosts) {
    $facebookResults += [pscustomobject]@{
      slug = $post.slug
      title = $post.title
      result = Publish-Facebook -Post $post -State $state
      postedAt = (Get-Date).ToString("o")
    }
  }

  $runEntry = [pscustomobject]@{
    ranAt = (Get-Date).ToString("o")
    commit = $commit
    articles = @($newPosts | ForEach-Object { [pscustomobject]@{ slug = $_.slug; keyword = $_.targetKeyword; category = $_.category; url = "$SiteUrl/posts/$($_.slug).html"; image = $_.image } })
    facebook = $facebookResults
  }
  $state.runs = @($runEntry) + @($state.runs)
  Write-Json $PublisherLogPath $state

  git add data/daily-publisher-log.json | Out-Null
  if ((git diff --cached --name-only) -contains "data/daily-publisher-log.json") {
    git commit -m "Update daily publisher log" | Out-Host
    if (!$SkipGitPush) {
      git push origin HEAD:main | Out-Host
      git push origin HEAD:gh-pages | Out-Host
    }
  }

  Write-Host "Published $($newPosts.Count) articles."
  foreach ($result in $facebookResults) {
    Write-Host "Facebook $($result.result.status): $($result.slug) $($result.result.postId)"
  }
} finally {
  Pop-Location -ErrorAction SilentlyContinue
  Stop-Transcript | Out-Null
}
