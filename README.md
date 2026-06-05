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
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://comeback2000.github.io/Car-news/
GOOGLE_SITEMAP_URL=https://comeback2000.github.io/Car-news/sitemap.xml
GOOGLE_SERVICE_ACCOUNT_JSON=F:\opencalw\Mass-Time\Car-news\secrets\google-search-console-service-account.json
```

The Facebook token must be a Page token with:

- `pages_manage_posts`
- `pages_read_engagement`

## Google Indexing Discovery

Google does not support bulk URL indexing requests for normal blog/news articles through the Indexing API. The supported scriptable route is to submit the sitemap through the Search Console API.

Setup:

1. Add and verify this URL-prefix property in Google Search Console:
   `https://comeback2000.github.io/Car-news/`
2. Create a Google Cloud service account and download its JSON key.
3. In Search Console, add the service account `client_email` as a user for the verified property.
4. Save the JSON key outside Git, for example:
   `secrets/google-search-console-service-account.json`
5. Set `GOOGLE_SERVICE_ACCOUNT_JSON` in `.env`.

Preview all URLs currently in the sitemap:

```powershell
npm run google:urls
```

Submit the sitemap to Google Search Console:

```powershell
npm run google:sitemap
```

This tells Google where the sitemap is and helps it discover all listed URLs. It does not guarantee immediate indexing.

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
- `scripts/Submit-GoogleSitemap.ps1` - submits the sitemap to Google Search Console
- `scripts/build-site.js` - static site renderer
