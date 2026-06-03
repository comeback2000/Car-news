const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const publishMode = process.argv.includes("--publish");

const paths = {
  posts: path.join(root, "data", "posts.json"),
  homepage: path.join(root, "index.html"),
  sitemap: path.join(root, "sitemap.xml"),
  facebookQueue: path.join(root, "data", "facebook-queue.json"),
  facebookLog: path.join(root, "data", "facebook-published-log.json"),
  facebookState: path.join(root, "data", "facebook-state.json")
};

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: { ...process.env, ...(options.env || {}) }
  });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, "utf8").trim();
  return raw ? JSON.parse(raw) : fallback;
}

function fileSnapshot(files) {
  const snapshot = new Map();
  for (const file of files) {
    snapshot.set(file, fs.existsSync(file) ? fs.readFileSync(file) : null);
  }
  return snapshot;
}

function restoreSnapshot(snapshot) {
  for (const [file, content] of snapshot.entries()) {
    if (content === null) {
      fs.rmSync(file, { force: true });
    } else {
      fs.writeFileSync(file, content);
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertProductionPost(post) {
  const text = [post.slug, post.targetKeyword, post.title, post.category, ...(post.tags || [])].join(" ");
  assert(!/(workflow[-\s]?test|sample article|placeholder|dummy post)/i.test(text), `Non-production post detected: ${post.slug}`);
}

function checkLinks() {
  const script = `
from pathlib import Path
import re
errors=[]
for html in Path('.').rglob('*.html'):
    if any(part.startswith('.') for part in html.parts):
        continue
    text=html.read_text(encoding='utf-8')
    for attr in re.findall(r'(?:href|src)="([^"]+)"', text):
        if attr.startswith(('http://','https://','#','mailto:')):
            continue
        clean=attr.split('#')[0]
        if clean and not (html.parent/clean).resolve().exists():
            errors.append(f'{html}: missing {attr}')
print('OK' if not errors else '\\n'.join(errors))
raise SystemExit(0 if not errors else 1)
`;
  return run("python", ["-c", script], { capture: true }).trim();
}

function verifyGeneratedPost(post) {
  const articleFile = path.join(root, "posts", `${post.slug}.html`);
  const imageFile = path.join(root, post.image);
  const article = fs.readFileSync(articleFile, "utf8");
  const homepage = fs.readFileSync(paths.homepage, "utf8");
  const sitemap = fs.readFileSync(paths.sitemap, "utf8");
  const articleUrl = `${siteUrl}/posts/${post.slug}.html`;

  assert(fs.existsSync(articleFile), `Article was not generated: posts/${post.slug}.html`);
  assert(fs.existsSync(imageFile), `Thumbnail is missing: ${post.image}`);
  assert(article.includes(`<h1>${post.title}</h1>`), "Article H1 title is missing.");
  assert(article.includes(`<img src="../${post.image}"`), "Featured thumbnail is missing from the article.");
  assert(article.includes(`property="og:image" content="${siteUrl}/${post.image}"`), "Open Graph image metadata is missing.");
  assert(article.includes(`name="twitter:image" content="${siteUrl}/${post.image}"`), "Twitter image metadata is missing.");
  assert(homepage.includes(`posts/${post.slug}.html`), "Homepage card/link was not generated.");
  assert(homepage.includes(post.image), "Homepage thumbnail was not generated.");
  assert(sitemap.includes(articleUrl), "Sitemap does not include the latest article URL.");
  assert(!homepage.includes("workflow-test-article"), "Homepage still contains workflow test content.");
  assert(!sitemap.includes("workflow-test-article"), "Sitemap still contains workflow test content.");

  return articleUrl;
}

function verifySocialCaption(post) {
  const snapshot = fileSnapshot([paths.facebookQueue, paths.facebookLog, paths.facebookState]);
  try {
    run("node", ["scripts/FB_Post.js"], {
      env: {
        FB_DRY_RUN: "true",
        FB_ONLY_SLUG: post.slug,
        FB_FORCE_DUE: "true",
        FB_PAGE_ID: process.env.FB_PAGE_ID || "176747645744060",
        FB_POST_INTERVAL_MINUTES: "240",
        FB_MAX_POSTS_PER_RUN: "1"
      }
    });
    const queue = readJson(paths.facebookQueue, []);
    const matching = queue.find((item) => item.sourcePostSlug === post.slug);
    assert(matching, "Facebook dry-run did not prepare a social post queue item.");
    assert(matching.caption.includes(post.title), "Facebook caption does not include the article title.");
    assert(matching.caption.includes(`${siteUrl}/posts/${post.slug}.html`), "Facebook caption does not include the article URL.");
    return matching.captionHash || "generated";
  } finally {
    restoreSnapshot(snapshot);
  }
}

function checkScheduledTasks() {
  const tasks = [
    "CarNewsDripPublisher-Check",
    "CarNewsDripPublisher-Startup",
    "AutoTechDailyFBPost-Check",
    "AutoTechDailyFBPost-Startup"
  ];
  const results = [];
  for (const task of tasks) {
    try {
      const output = run("schtasks", ["/Query", "/TN", task, "/FO", "LIST"], { capture: true });
      results.push({ task, installed: output.includes(task) || output.includes(`\\${task}`) });
    } catch {
      results.push({ task, installed: false });
    }
  }
  return results;
}

function main() {
  if (publishMode) {
    throw new Error("workflow:test -- --publish is disabled. The workflow test now verifies the latest real article only; publish real keyword articles through the production article workflow.");
  }

  const posts = readJson(paths.posts, []);
  assert(posts.length, "No posts found in data/posts.json.");
  const latestPost = posts[0];
  assertProductionPost(latestPost);

  run("node", ["scripts/build-site.js"]);
  const articleUrl = verifyGeneratedPost(latestPost);
  const linkStatus = checkLinks();
  const socialCaption = verifySocialCaption(latestPost);
  const taskStatus = checkScheduledTasks();

  console.log("");
  console.log("Production workflow verification:");
  console.log(`- Latest real article: ${latestPost.title}`);
  console.log(`- Article URL: ${articleUrl}`);
  console.log(`- Article file: posts/${latestPost.slug}.html`);
  console.log(`- Thumbnail: ${latestPost.image}`);
  console.log(`- Homepage card: OK`);
  console.log(`- Sitemap entry: OK`);
  console.log(`- Link check: ${linkStatus}`);
  console.log(`- Facebook caption dry-run: ${socialCaption}`);
  console.log("- Duplicate protection: enforced by scripts/build-site.js");
  for (const item of taskStatus) {
    console.log(`- Scheduled task ${item.task}: ${item.installed ? "installed" : "not installed"}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
