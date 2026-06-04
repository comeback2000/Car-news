param(
  [switch]$InstallTask,
  [switch]$UninstallTask,
  [switch]$Run,
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

function Write-Json($Path, $Value) {
  $Value | ConvertTo-Json -Depth 80 | Set-Content -Path $Path -Encoding UTF8
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

function Get-Title($Niche, $Keyword) {
  if ($Niche -eq "bike") { return "${Keyword}: What Indian Riders Should Know Before Buying" }
  if ($Niche -eq "mobile") { return "${Keyword}: The Latest Tech Update Indian Buyers Should Watch" }
  if ($Keyword.ToLowerInvariant() -match "vs") { return "${Keyword}: Which Option Makes More Sense for Indian Buyers?" }
  return "${Keyword}: Latest India Update, Buyer Signals and What Changes Next"
}

function Get-Tags($Niche, $Keyword) {
  if ($Niche -eq "bike") { return @($Keyword, "Bike News India", "EV Bikes India", "Two Wheeler News") }
  if ($Niche -eq "mobile") { return @($Keyword, "Mobile Tech India", "Smartphone News", "AI Tech News") }
  return @($Keyword, "India car news", "Electric SUV India", "EV buying guide")
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
  $title = Get-Title -Niche $niche -Keyword $keyword
  $category = Get-Category -Niche $niche -Keyword $keyword
  $today = (Get-Date).ToString("yyyy-MM-dd")
  $summary = ($research | Select-Object -First 3 | ForEach-Object { "$($_.source): $($_.title)" }) -join " | "

  [pscustomobject]@{
    slug = $slug
    aliases = @()
    targetKeyword = $keyword
    title = $title
    metaTitle = "$keyword India Update 2026 | Car News"
    metaDescription = "$keyword update with latest India news signals, buyer intent, practical checks and what changes next.".Substring(0, [Math]::Min(155, "$keyword update with latest India news signals, buyer intent, practical checks and what changes next.".Length))
    excerpt = "$keyword is drawing fresh attention as Indian readers compare price, timing, features, ownership value and real-world impact."
    category = $category
    tags = @(Get-Tags -Niche $niche -Keyword $keyword)
    image = "assets/$slug-thumbnail.jpg"
    imageAlt = "$keyword thumbnail for latest India $niche update"
    imageCredit = "Thumbnail selected or generated uniquely for this article."
    author = "Car News Desk"
    datePublished = $today
    dateModified = $today
    sources = @($research | ForEach-Object { [pscustomobject]@{ label = "$($_.source): $($_.title)"; url = $_.link } })
    sections = @(
      [pscustomobject]@{
      heading = "${keyword}: Why This Topic Is Trending Now"
        paragraphs = @(
          "$keyword has become a useful search because buyers want quick clarity, not just a headline. The latest discussion is about timing, price, features, reliability and whether the update should change a shortlist.",
          "Current Google News signals include $summary. This article uses those signals to explain search intent and buyer impact without copying source articles."
        )
        subsections = @([pscustomobject]@{ heading = "Search intent"; paragraphs = @("Readers searching $keyword usually want a clear answer on what changed, why it matters now and what to compare before making a decision.") })
      },
      [pscustomobject]@{
        heading = "What $keyword Means for Indian Buyers"
        paragraphs = @(
          "The practical takeaway is to compare the news with real ownership needs. Availability, warranty, service access, running cost and resale confidence matter more than a single viral claim.",
          "For a sensible decision, compare the full ownership package and avoid judging only by launch hype or social media attention."
        )
        subsections = @([pscustomobject]@{ heading = "Buyer checklist"; paragraphs = @("Before acting on $keyword, compare price, availability, warranty language, service support, early owner feedback and total cost of ownership.") })
      },
      [pscustomobject]@{
      heading = "${keyword}: Final View"
        paragraphs = @(
          "$keyword should be treated as a shortlist starting point. The best choice is the one that fits daily use, budget and support expectations after the initial news cycle fades.",
          "Keep watching official updates and trusted reviews before making a final buying decision."
        )
        subsections = @()
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
  if (@($State.facebookUrls) -contains $url) { return [pscustomobject]@{ status = "skipped_duplicate"; postId = $null } }

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
      url = "$SiteUrl/$($Post.image)"
      caption = $caption
      published = "true"
      access_token = $token
    }
    $result = Invoke-RestMethod -Method Post -Uri "https://graph.facebook.com/$GraphApiVersion/$pageId/photos" -Body $body -TimeoutSec 60
    $postId = if ($result.post_id) { $result.post_id } else { $result.id }
    $State.facebookUrls += $url
    return [pscustomobject]@{ status = "published"; postId = $postId }
  } catch {
    return [pscustomobject]@{ status = "failed"; postId = $null; message = $_.Exception.Message }
  }
}

function Invoke-GitPublish($Slugs) {
  node (Join-Path $PSScriptRoot "build-site.js")
  git add data/posts.json data/daily-publisher-log.json posts category tags assets index.html sitemap.xml robots.txt | Out-Null
  $staged = git diff --cached --name-only
  if (!$staged) {
    Write-Host "No generated changes to commit."
    return $null
  }
  $message = "Daily publish: $($Slugs -join ', ')"
  if ($message.Length -gt 180) { $message = $message.Substring(0, 180) }
  git commit -m $message | Out-Host
  $commit = (git rev-parse --short HEAD).Trim()
  if (!$SkipGitPush) {
    git push origin HEAD:main | Out-Host
    git push origin HEAD:gh-pages | Out-Host
  }
  return $commit
}

try {
  Push-Location $Root
  Read-DotEnv

  $posts = @(Read-Json $PostsPath @())
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
