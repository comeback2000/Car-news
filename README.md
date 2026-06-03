# Car News

Static GitHub Pages site for fast automotive news briefs.

Latest update: June 3, 2026

## Publishing workflow

Add or update articles in `data/posts.json`, then run:

```bash
npm run build
```

The build generates SEO metadata, Open Graph/Twitter cards, NewsArticle schema, breadcrumbs, table of contents, automatic internal links, related posts, category pages, tag pages, redirects for old URLs, `sitemap.xml`, and `robots.txt`.

Featured trend-driven posts:

- Tata's EV Breakout: Nexon, Punch, and Tiago Help Push Sales Past 10,000
- Mahindra BE 6 and XEV 9e Are Turning India's EV SUV Race Into a Real Fight
- Maruti e Vitara Just Made EV Charging the Story, Not Just Range

Open `index.html` or publish the repo with GitHub Pages from the `main` branch root.

## Automated drip publishing on Windows

The repo includes a queue publisher for scheduled GitHub Pages releases.

- `data/post-queue.json` stores pending posts.
- `data/publish-state.json` stores the next release time.
- `data/published-log.json` records what was released.
- `scripts/drip-publish.js` publishes one queued post every 120 minutes, rebuilds the site, commits the generated files, and pushes to `main` and `gh-pages`.

This means a 10-post queue is drip-fed one post every 2 hours, which equals 2 posts every 4 hours.

### Fill the queue with Codex

Ask Codex to generate 10 complete article objects and save them in `data/post-queue.json`. Each queued post must use the same JSON shape as `data/posts.json` and must reference a real local image under `assets/`.

Example prompt:

```text
Generate 10 SEO-optimized India car news posts using the same schema as data/posts.json.
Use real images already stored in assets/ or download properly credited images into assets/.
Save them as an array in data/post-queue.json.
Do not publish them yet.
```

### Test one check manually

```powershell
npm run publish:drip
```

If the queue is empty, the script exits without publishing. If a queued post is due, it publishes one post, rebuilds the site, commits, and pushes.

### Install the background schedule

Run PowerShell from the repo root:

```powershell
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -ExecutionPolicy Bypass -File .\scripts\install-drip-publisher.ps1
```

This installs two Windows scheduled tasks:

- `CarNewsDripPublisher-Startup` checks the queue when you log in.
- `CarNewsDripPublisher-Check` checks the queue every 30 minutes.

The task checks often, but `data/publish-state.json` enforces the 2-hour release interval, so it does not publish everything at once. After a restart, the next check resumes from the saved queue and next publish time.

Logs are written to `logs/drip-publisher-*.log`.

### Change the interval

The default release interval is 120 minutes. To change it for a manual run:

```powershell
$env:PUBLISH_INTERVAL_MINUTES = "240"
npm run publish:drip
```

To publish more than one due post per run, set `PUBLISH_MAX_PER_RUN`, but keep it at `1` for a clean drip-feed schedule.

### Remove the scheduled tasks

```powershell
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -ExecutionPolicy Bypass -File .\scripts\uninstall-drip-publisher.ps1
```
