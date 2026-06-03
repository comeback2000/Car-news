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

## AutoTech Daily Facebook posting

The repo includes `scripts/FB_Post.js` for publishing blog articles to the AutoTech Daily Facebook Page through the official Meta Graph API.

Default Page:

```env
FB_PAGE_ID=176747645744060
```

The script:

- Reads articles from `data/posts.json`.
- Builds an engaging caption with the article URL and hashtags.
- Uses the article featured image from GitHub Pages as the Facebook photo URL.
- Adds new articles to `data/facebook-queue.json`.
- Publishes due queue items to `/{page-id}/photos`.
- Prevents duplicate posts by checking `data/facebook-published-log.json`.
- Records title, URL, Facebook post/photo ID, publish date, image URL, caption hash and status.
- Saves schedule state in `data/facebook-state.json` so it resumes after restart.

### Required Meta setup

Create or use a Meta app in the Meta Developer platform and request/configure these Page permissions:

```text
pages_show_list
pages_read_engagement
pages_manage_posts
```

Your Facebook user must have management access to the AutoTech Daily Page. The token must be a Page Access Token for:

```text
AutoTech Daily
Page ID: 176747645744060
```

### Generate a long-lived Page Access Token

1. Open Meta Graph API Explorer.
2. Select your Meta app.
3. Generate a User Access Token with:

```text
pages_show_list
pages_read_engagement
pages_manage_posts
```

4. Exchange the short-lived user token for a long-lived user token:

```text
GET https://graph.facebook.com/v23.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=META_APP_ID
  &client_secret=META_APP_SECRET
  &fb_exchange_token=SHORT_LIVED_USER_TOKEN
```

5. Use the long-lived user token to get Page tokens:

```text
GET https://graph.facebook.com/v23.0/me/accounts
  ?fields=id,name,tasks,access_token
  &access_token=LONG_LIVED_USER_TOKEN
```

6. Copy the `access_token` for Page ID `176747645744060`.

For production, prefer a Meta Business system user Page token where available. Tokens can still be invalidated by password changes, permission changes, app changes or Meta policy events, so check token status periodically in Meta's Access Token Debugger and rotate safely.

### Store credentials securely

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```env
GRAPH_API_VERSION=v23.0
FB_PAGE_ID=176747645744060
FB_PAGE_ACCESS_TOKEN=your_long_lived_page_access_token
FB_POST_INTERVAL_MINUTES=240
FB_MAX_POSTS_PER_RUN=1
FB_DRY_RUN=false
```

`.env` is ignored by git. Never commit Page tokens to GitHub.

### Test manually

Dry run without posting:

```powershell
$env:FB_DRY_RUN = "true"
npm run fb:post
Remove-Item Env:\FB_DRY_RUN
```

Live publish due queue items:

```powershell
npm run fb:post
```

### Install background schedule

```powershell
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -ExecutionPolicy Bypass -File .\scripts\install-fb-post.ps1
```

This installs:

- `AutoTechDailyFBPost-Startup`
- `AutoTechDailyFBPost-Check`

The check task runs every 30 minutes. `data/facebook-state.json` and `FB_POST_INTERVAL_MINUTES` control drip timing, so pending posts continue after restart instead of all posting at once.

Logs are written to `logs/fb-post-*.log`.

### Remove Facebook posting tasks

```powershell
& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -ExecutionPolicy Bypass -File .\scripts\uninstall-fb-post.ps1
```
