# Car News Daily Publisher

This repo uses one main PowerShell entry point for publishing:

```powershell
.\scripts\Publish-Daily.ps1 -Run
```

The script publishes 6 articles per run:

- 2 Car/EV articles
- 2 Bike articles
- 2 Mobile Tech articles

It reads keywords from `Keywords.txt`, continues from the next unused keyword, creates unique thumbnails, rebuilds the static site, commits and pushes generated files to GitHub, and posts each new article to the configured Facebook Page.

## Manual Run

```powershell
$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Publish-Daily.ps1 -Run
```

Or:

```powershell
npm run publish:daily
```

## Install Schedule

Install the Windows Task Scheduler job for 9:15 AM local time:

```powershell
$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Publish-Daily.ps1 -InstallTask
```

Or:

```powershell
npm run schedule:install
```

Remove the scheduled task:

```powershell
npm run schedule:uninstall
```

## Required Environment

Create `.env` from `.env.example` and set:

```env
GRAPH_API_VERSION=v23.0
FB_PAGE_ID=176747645744060
FB_PAGE_ACCESS_TOKEN=your_valid_page_access_token
FB_DRY_RUN=false
```

The Facebook token must be a Page token with:

- `pages_manage_posts`
- `pages_read_engagement`

## Logs

Runtime logs are written to:

```text
logs/daily-publisher-*.log
```

Publishing state and duplicate protection are tracked in:

```text
data/daily-publisher-log.json
```

The log tracks published keywords, slugs, thumbnail hashes, thumbnail sources, Facebook URLs, and run history.

## Remaining Scripts

Only these scripts are required:

- `scripts/Publish-Daily.ps1` - main publisher, scheduler installer, Facebook poster, GitHub pusher
- `scripts/build-site.js` - static site renderer
