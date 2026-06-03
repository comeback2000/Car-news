const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const postsPath = path.join(dataDir, "posts.json");
const queuePath = path.join(dataDir, "post-queue.json");
const statePath = path.join(dataDir, "publish-state.json");
const logPath = path.join(dataDir, "published-log.json");

const intervalMinutes = Number(process.env.PUBLISH_INTERVAL_MINUTES || 120);
const maxPerRun = Number(process.env.PUBLISH_MAX_PER_RUN || 1);
const allowDirtyPublish = process.env.ALLOW_DIRTY_PUBLISH === "true";
const publishBranch = process.env.PUBLISH_BRANCH || "main";
const pagesBranch = process.env.PAGES_BRANCH || "gh-pages";

const generatedPaths = [
  "index.html",
  "posts",
  "category",
  "tags",
  "sitemap.xml",
  "robots.txt",
  "data/posts.json",
  "data/post-queue.json",
  "data/publish-state.json",
  "data/published-log.json"
];

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, "utf8").trim();
  return raw ? JSON.parse(raw) : fallback;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
  });
}

function gitOutput(args) {
  return run("git", args, { capture: true }).trim();
}

function isManagedPath(file) {
  return generatedPaths.some((managed) => file === managed || file.startsWith(`${managed}/`));
}

function dirtyTrackedFilesOutsideManagedPaths() {
  const status = gitOutput(["status", "--porcelain", "--untracked-files=no"]);
  if (!status) return [];

  return status
    .split(/\r?\n/)
    .map((line) => line.slice(3).replace(/^"|"$/g, ""))
    .map((file) => file.includes(" -> ") ? file.split(" -> ").pop() : file)
    .filter((file) => !isManagedPath(file));
}

function localIsoDate(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

function normalizeQueueItem(item) {
  return item && item.post ? item.post : item;
}

function validatePost(post) {
  const required = [
    "slug",
    "targetKeyword",
    "title",
    "metaTitle",
    "metaDescription",
    "excerpt",
    "category",
    "tags",
    "image",
    "imageAlt",
    "author",
    "sections"
  ];
  const missing = required.filter((field) => !post[field] || (Array.isArray(post[field]) && !post[field].length));
  if (missing.length) {
    throw new Error(`Queued post "${post.slug || post.title || "untitled"}" is missing: ${missing.join(", ")}`);
  }
  if (!fs.existsSync(path.join(root, post.image))) {
    throw new Error(`Queued post "${post.slug}" references a missing image: ${post.image}`);
  }
  if (!Array.isArray(post.sections) || post.sections.some((section) => !section.heading || !Array.isArray(section.paragraphs))) {
    throw new Error(`Queued post "${post.slug}" must include sections with headings and paragraph arrays.`);
  }
}

function dueToPublish(state, now) {
  if (!state.nextPublishAt) return true;
  return now >= new Date(state.nextPublishAt);
}

function scheduleNext(state, now) {
  const next = new Date(now.getTime() + intervalMinutes * 60 * 1000);
  state.nextPublishAt = next.toISOString();
}

function commitAndPush(post) {
  run("npm.cmd", ["run", "build"]);
  run("git", ["add", "-A", ...generatedPaths]);

  const staged = gitOutput(["diff", "--cached", "--name-only"]);
  if (!staged) {
    console.log("No generated changes to commit.");
    return;
  }

  run("git", ["commit", "-m", `Publish queued post: ${post.slug}`]);
  run("git", ["push", "origin", `HEAD:${publishBranch}`]);
  run("git", ["push", "origin", `HEAD:${pagesBranch}`]);
}

function main() {
  const now = new Date();
  const posts = readJson(postsPath, []);
  const queue = readJson(queuePath, []);
  const state = readJson(statePath, {
    intervalMinutes,
    nextPublishAt: null,
    lastPublishedAt: null,
    publishedCount: 0
  });
  const publishedLog = readJson(logPath, []);

  state.intervalMinutes = intervalMinutes;

  const pending = queue.map(normalizeQueueItem).filter(Boolean);
  if (!pending.length) {
    console.log("No queued posts found. Add posts to data/post-queue.json.");
    writeJson(statePath, state);
    return;
  }

  if (!dueToPublish(state, now)) {
    console.log(`Next queued post is scheduled for ${state.nextPublishAt}.`);
    return;
  }

  const dirtyOutsideManagedPaths = dirtyTrackedFilesOutsideManagedPaths();
  if (!allowDirtyPublish && dirtyOutsideManagedPaths.length) {
    throw new Error(`Tracked files outside the publisher-managed paths already have local changes: ${dirtyOutsideManagedPaths.join(", ")}. Commit or stash them, or set ALLOW_DIRTY_PUBLISH=true.`);
  }

  let publishedThisRun = 0;
  while (publishedThisRun < maxPerRun && pending.length) {
    const post = pending.shift();
    validatePost(post);

    if (posts.some((existing) => existing.slug === post.slug)) {
      throw new Error(`Post slug already exists in data/posts.json: ${post.slug}`);
    }

    const today = localIsoDate(now);
    post.datePublished = post.datePublished || today;
    post.dateModified = post.dateModified || post.datePublished;
    post.sources = post.sources || [];
    post.aliases = post.aliases || [];
    post.imageCredit = post.imageCredit || "";

    posts.unshift(post);
    publishedThisRun += 1;

    publishedLog.unshift({
      slug: post.slug,
      title: post.title,
      publishedAt: now.toISOString()
    });

    console.log(`Publishing queued post: ${post.title}`);
  }

  const originalQueue = readJson(queuePath, []);
  const remainingCount = originalQueue.length - publishedThisRun;
  const remainingQueue = originalQueue.slice(publishedThisRun);

  writeJson(postsPath, posts);
  writeJson(queuePath, remainingQueue);
  state.lastPublishedAt = now.toISOString();
  state.publishedCount = Number(state.publishedCount || 0) + publishedThisRun;
  scheduleNext(state, now);
  writeJson(statePath, state);
  writeJson(logPath, publishedLog);

  commitAndPush(posts[0]);
  console.log(`Published ${publishedThisRun} post(s). ${remainingCount} post(s) remain in queue.`);
  console.log(`Next publish window: ${state.nextPublishAt}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
