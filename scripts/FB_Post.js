const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const dataDir = path.join(root, "data");
const postsPath = path.join(dataDir, "posts.json");
const queuePath = path.join(dataDir, "facebook-queue.json");
const logPath = path.join(dataDir, "facebook-published-log.json");
const statePath = path.join(dataDir, "facebook-state.json");
const envPath = path.join(root, ".env");

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsAt = trimmed.indexOf("=");
    if (equalsAt === -1) continue;
    const key = trimmed.slice(0, equalsAt).trim();
    let value = trimmed.slice(equalsAt + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, "utf8").trim();
  return raw ? JSON.parse(raw) : fallback;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function articleUrl(post) {
  return `${siteUrl}/posts/${post.slug}.html`;
}

function imageUrl(post) {
  return `${siteUrl}/${post.image}`;
}

function hashtags(post) {
  const base = [post.targetKeyword, ...(post.tags || []), "CarNews", "AutoTechDaily"];
  return [...new Set(base)]
    .map((tag) => `#${String(tag).replace(/[^a-zA-Z0-9]/g, "")}`)
    .filter((tag) => tag.length > 1)
    .slice(0, 8);
}

function captionFor(post) {
  const tags = hashtags(post).join(" ");
  return [
    `${post.title}`,
    "",
    post.excerpt,
    "",
    `Read the full story: ${articleUrl(post)}`,
    "",
    tags
  ].join("\n");
}

function isProductionPost(post) {
  const text = [post.slug, post.targetKeyword, post.title, post.category, ...(post.tags || [])].join(" ");
  return !/(workflow[-\s]?test|sample article|placeholder|dummy post)/i.test(text);
}

function scheduledAtFor(index, state, intervalMinutes, options = {}) {
  if (options.forceDue) return new Date().toISOString();
  const base = state.nextScheduledAt ? new Date(state.nextScheduledAt) : new Date();
  return new Date(base.getTime() + index * intervalMinutes * 60 * 1000).toISOString();
}

function enqueueNewArticles(posts, queue, publishedLog, state, intervalMinutes, options = {}) {
  const queuedUrls = new Set(queue.map((item) => item.url));
  const publishedUrls = new Set(publishedLog.filter((item) => item.status === "published").map((item) => item.url));
  let added = 0;

  for (const post of posts) {
    if (options.onlySlug && post.slug !== options.onlySlug) continue;
    if (!isProductionPost(post)) continue;

    const url = articleUrl(post);
    if (queuedUrls.has(url) || publishedUrls.has(url)) continue;

    const caption = captionFor(post);
    queue.push({
      id: `${slugify(post.slug)}-${Date.now()}-${added}`,
      sourcePostSlug: post.slug,
      title: post.title,
      url,
      imageUrl: imageUrl(post),
      caption,
      captionHash: hash(caption),
      scheduledAt: scheduledAtFor(queue.length, state, intervalMinutes, options),
      status: "pending",
      attempts: 0,
      createdAt: new Date().toISOString()
    });
    queuedUrls.add(url);
    added += 1;
  }

  return added;
}

function assertConfig(config) {
  const required = {
    graphApiVersion: config.graphApiVersion,
    pageId: config.pageId
  };
  if (!config.dryRun) {
    required.pageAccessToken = config.pageAccessToken;
  }
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing required Facebook config: ${missing.join(", ")}. Copy .env.example to .env and add a long-lived Page Access Token.`);
  }
}

async function graphPost(pathname, params, config) {
  const url = new URL(`https://graph.facebook.com/${config.graphApiVersion}/${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("access_token", config.pageAccessToken);

  const response = await fetch(url, { method: "POST" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body.error ? `${body.error.message} (code ${body.error.code || "unknown"})` : response.statusText;
    throw new Error(message);
  }

  return body;
}

async function publishQueueItem(item, config) {
  if (config.dryRun) {
    return {
      id: `dry-run-${Date.now()}`,
      post_id: `dry-run-${Date.now()}`
    };
  }

  return graphPost(`${config.pageId}/photos`, {
    url: item.imageUrl,
    caption: item.caption,
    published: "true"
  }, config);
}

async function main() {
  loadDotEnv(envPath);

  const config = {
    graphApiVersion: process.env.GRAPH_API_VERSION || "v23.0",
    pageId: process.env.FB_PAGE_ID || "176747645744060",
    pageAccessToken: process.env.FB_PAGE_ACCESS_TOKEN,
    dryRun: process.env.FB_DRY_RUN === "true"
  };
  const intervalMinutes = Number(process.env.FB_POST_INTERVAL_MINUTES || 240);
  const maxPerRun = Number(process.env.FB_MAX_POSTS_PER_RUN || 1);
  const onlySlug = process.env.FB_ONLY_SLUG || "";
  const forceDue = process.env.FB_FORCE_DUE === "true";

  assertConfig(config);

  const posts = readJson(postsPath, []);
  const productionSlugs = new Set(posts.filter(isProductionPost).map((post) => post.slug));
  const queue = readJson(queuePath, []).filter((item) => productionSlugs.has(item.sourcePostSlug));
  const publishedLog = readJson(logPath, []);
  const state = readJson(statePath, {
    lastRunAt: null,
    nextScheduledAt: null,
    intervalMinutes
  });

  state.intervalMinutes = intervalMinutes;
  const added = enqueueNewArticles(posts, queue, publishedLog, state, intervalMinutes, { onlySlug, forceDue });
  if (added) {
    const pending = queue.filter((item) => item.status === "pending");
    state.nextScheduledAt = pending.length ? pending[pending.length - 1].scheduledAt : state.nextScheduledAt;
    console.log(`Queued ${added} new article(s) for Facebook.`);
  }

  if (onlySlug && forceDue) {
    const dueAt = new Date().toISOString();
    for (const item of queue) {
      if (item.sourcePostSlug === onlySlug && item.status === "pending") {
        item.scheduledAt = dueAt;
      }
    }
  }

  const now = new Date();
  let publishedThisRun = 0;
  const alreadyPublished = new Set(publishedLog.filter((item) => item.status === "published").map((item) => item.url));

  for (const item of queue) {
    if (publishedThisRun >= maxPerRun) break;
    if (onlySlug && item.sourcePostSlug !== onlySlug) continue;
    if (item.status !== "pending") continue;
    if (new Date(item.scheduledAt) > now) continue;

    if (alreadyPublished.has(item.url)) {
      item.status = "skipped_duplicate";
      item.updatedAt = now.toISOString();
      publishedLog.unshift({
        title: item.title,
        url: item.url,
        facebookPostId: null,
        publishDate: now.toISOString(),
        status: "skipped_duplicate",
        message: "URL already published"
      });
      continue;
    }

    if (config.dryRun) {
      console.log(`DRY RUN: would publish "${item.title}" to Facebook.`);
      console.log(`DRY RUN: image=${item.imageUrl}`);
      console.log(`DRY RUN: url=${item.url}`);
      publishedThisRun += 1;
      continue;
    }

    try {
      item.status = "publishing";
      item.attempts = Number(item.attempts || 0) + 1;
      item.updatedAt = now.toISOString();
      const result = await publishQueueItem(item, config);
      const facebookPostId = result.post_id || result.id;

      item.status = "published";
      item.facebookPostId = facebookPostId;
      item.publishedAt = new Date().toISOString();
      alreadyPublished.add(item.url);

      publishedLog.unshift({
        title: item.title,
        url: item.url,
        facebookPostId,
        publishDate: item.publishedAt,
        status: "published",
        imageUrl: item.imageUrl,
        captionHash: item.captionHash,
        dryRun: config.dryRun
      });

      publishedThisRun += 1;
      console.log(`Published to Facebook: ${item.title}`);
    } catch (error) {
      item.status = "pending";
      item.lastError = error.message;
      item.updatedAt = new Date().toISOString();
      publishedLog.unshift({
        title: item.title,
        url: item.url,
        facebookPostId: null,
        publishDate: new Date().toISOString(),
        status: "failed",
        message: error.message
      });
      console.error(`Facebook publish failed for "${item.title}": ${error.message}`);
      break;
    }
  }

  const pendingQueue = queue.filter((item) => item.status === "pending");
  state.lastRunAt = new Date().toISOString();
  state.nextScheduledAt = pendingQueue.length ? pendingQueue[0].scheduledAt : null;

  writeJson(queuePath, queue);
  writeJson(logPath, publishedLog);
  writeJson(statePath, state);

  if (!publishedThisRun) {
    const next = pendingQueue[0]?.scheduledAt;
    console.log(next ? `No Facebook posts due yet. Next scheduled post: ${next}` : "No pending Facebook posts.");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
