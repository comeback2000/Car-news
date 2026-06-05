param(
  [string]$SiteUrl,
  [string]$SitemapUrl,
  [string]$ServiceAccountJson,
  [switch]$ListUrlsOnly
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$DefaultSiteUrl = "https://comeback2000.github.io/Car-news/"
$DefaultSitemapUrl = "https://comeback2000.github.io/Car-news/sitemap.xml"
$LocalSitemapPath = Join-Path $Root "sitemap.xml"

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

function ConvertTo-Base64Url([byte[]]$Bytes) {
  return [Convert]::ToBase64String($Bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

function Convert-StringToBase64Url([string]$Value) {
  return ConvertTo-Base64Url ([System.Text.Encoding]::UTF8.GetBytes($Value))
}

function Get-UrlEncoded([string]$Value) {
  return [System.Uri]::EscapeDataString($Value)
}

function Get-SitemapUrls {
  if (!(Test-Path $LocalSitemapPath)) {
    throw "Local sitemap not found: $LocalSitemapPath. Run npm run build first."
  }
  [xml]$sitemap = Get-Content $LocalSitemapPath -Raw
  $namespace = New-Object System.Xml.XmlNamespaceManager($sitemap.NameTable)
  $namespace.AddNamespace("sm", "http://www.sitemaps.org/schemas/sitemap/0.9")
  return @($sitemap.SelectNodes("//sm:url/sm:loc", $namespace) | ForEach-Object { $_.InnerText })
}

function Get-GoogleAccessToken($JsonPath) {
  if (!(Test-Path $JsonPath)) {
    throw "Google service account JSON not found: $JsonPath"
  }
  $serviceAccount = Get-Content $JsonPath -Raw | ConvertFrom-Json
  foreach ($field in @("client_email", "private_key", "token_uri")) {
    if (!$serviceAccount.$field) { throw "Service account JSON is missing '$field'." }
  }

  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $header = @{ alg = "RS256"; typ = "JWT" } | ConvertTo-Json -Compress
  $claim = @{
    iss = $serviceAccount.client_email
    scope = "https://www.googleapis.com/auth/webmasters"
    aud = $serviceAccount.token_uri
    iat = $now
    exp = $now + 3600
  } | ConvertTo-Json -Compress

  $unsigned = "$(Convert-StringToBase64Url $header).$(Convert-StringToBase64Url $claim)"
  $rsa = [System.Security.Cryptography.RSA]::Create()
  $rsa.ImportFromPem($serviceAccount.private_key.ToCharArray())
  $signature = $rsa.SignData(
    [System.Text.Encoding]::ASCII.GetBytes($unsigned),
    [System.Security.Cryptography.HashAlgorithmName]::SHA256,
    [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
  )
  $jwt = "$unsigned.$(ConvertTo-Base64Url $signature)"

  $body = @{
    grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer"
    assertion = $jwt
  }
  $tokenResponse = Invoke-RestMethod -Method Post -Uri $serviceAccount.token_uri -Body $body -TimeoutSec 60
  return $tokenResponse.access_token
}

Read-DotEnv

if (!$SiteUrl) { $SiteUrl = if ($env:GOOGLE_SEARCH_CONSOLE_SITE_URL) { $env:GOOGLE_SEARCH_CONSOLE_SITE_URL } else { $DefaultSiteUrl } }
if (!$SitemapUrl) { $SitemapUrl = if ($env:GOOGLE_SITEMAP_URL) { $env:GOOGLE_SITEMAP_URL } else { $DefaultSitemapUrl } }
if (!$ServiceAccountJson) { $ServiceAccountJson = $env:GOOGLE_SERVICE_ACCOUNT_JSON }

$urls = @(Get-SitemapUrls)
Write-Host "Local sitemap contains $($urls.Count) URL(s)."
Write-Host "Sitemap URL: $SitemapUrl"
Write-Host "Search Console property: $SiteUrl"

if ($ListUrlsOnly) {
  $urls | ForEach-Object { Write-Host $_ }
  exit 0
}

if (!$ServiceAccountJson) {
  throw "Set GOOGLE_SERVICE_ACCOUNT_JSON in .env or pass -ServiceAccountJson path\\to\\service-account.json."
}

$token = Get-GoogleAccessToken $ServiceAccountJson
$endpoint = "https://www.googleapis.com/webmasters/v3/sites/$(Get-UrlEncoded $SiteUrl)/sitemaps/$(Get-UrlEncoded $SitemapUrl)"
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Method Put -Uri $endpoint -Headers $headers -TimeoutSec 60 | Out-Null
Write-Host "Submitted sitemap to Google Search Console successfully."
Write-Host "Google will discover URLs from the sitemap, but indexing is not guaranteed or instant."
