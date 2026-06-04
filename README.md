# Car News Codex Publisher

This repo uses a Codex Desktop automation as the article-writing agent and one PowerShell helper for local publishing tasks.

The active Codex automation is:

- `codex-car-news-daily-publisher`
- Runs daily at `9:15 AM IST`
- Creates 6 production articles per run:
  - 2 Car/EV articles
  - 2 Bike articles
  - 2 Mobile Tech articles

Codex reads keywords from `Keywords.txt`, researches current news and official sources, builds long-tail angles from the seed keyword, writes the article naturally, creates a unique real-image thumbnail, updates site data, prevents duplicates, and publishes to GitHub/Facebook when credentials are available.

The PowerShell script does not generate article bodies and does not call an article-generation API. It rebuilds the site, commits/pushes Codex-generated files, retries Facebook posting, and removes old Windows scheduled tasks that could publish low-quality template content.

## Manual Run

For immediate article creation, start a Codex run in this repo and ask it to execute the Codex publishing workflow. That keeps research, writing, source review, thumbnail decisions, and duplicate checks inside the Codex agent instead of a template script.

After Codex has generated or edited articles in the repo, run:

```powershell
$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Publish-Daily.ps1 -Run
```

Or:

```powershell
npm run publish:daily
```

This finalizes real Codex-generated changes by rebuilding the static site, committing/pushing generated files, and posting up to 6 article URLs that are not yet in the Facebook posting history.

## Schedule

The daily schedule is managed by Codex Desktop, not by a Windows Task Scheduler article generator.

To clean old Windows scheduled tasks that may still exist from previous versions:

```powershell
$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Publish-Daily.ps1 -InstallTask
```

Or:

```powershell
npm run schedule:install
```

Remove old Windows scheduled tasks:

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

- `scripts/Publish-Daily.ps1` - build/push helper, old scheduler cleanup, Facebook poster/retry tool
- `scripts/build-site.js` - static site renderer
