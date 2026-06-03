const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const publishMode = process.argv.includes("--publish");
const keepMode = process.argv.includes("--keep");
const now = new Date();
const stamp = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
const slug = `workflow-test-article-${stamp}`;

const paths = {
  posts: path.join(root, "data", "posts.json"),
  facebookQueue: path.join(root, "data", "facebook-queue.json"),
  facebookLog: path.join(root, "data", "facebook-published-log.json"),
  facebookState: path.join(root, "data", "facebook-state.json"),
  thumbnail: path.join(root, "assets", `${slug}-thumbnail.jpg`),
  sourceThumbnail: path.join(root, "assets", "upcoming-ev-cars-india-thumbnail.jpg"),
  article: path.join(root, "posts", `${slug}.html`),
  homepage: path.join(root, "index.html")
};

const touched = [
  paths.posts,
  paths.facebookQueue,
  paths.facebookLog,
  paths.facebookState
];

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

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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

function gitOutput(args) {
  return run("git", args, { capture: true }).trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makePost() {
  const today = new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    slug,
    aliases: [],
    targetKeyword: "Workflow Test Car News",
    title: "Workflow Test Car News: Sample Article Publish Check",
    metaTitle: "Workflow Test Car News | Sample Publish Check",
    metaDescription: "A temporary workflow test article used to verify article generation, thumbnail rendering, homepage cards, URLs, and social queue creation.",
    excerpt: "Workflow Test Car News verifies that the publishing pipeline can generate a post, render its thumbnail, update homepage cards, and prepare social captions.",
    category: "Workflow Tests",
    tags: ["Workflow Test Car News", "Car News Test", "Publishing Workflow"],
    image: `assets/${slug}-thumbnail.jpg`,
    imageAlt: "Workflow Test Car News sample thumbnail",
    imageCredit: "Image: workflow test thumbnail copied from the current Car News thumbnail set.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today,
    sources: [
      { label: "Car News workflow test", url: `${siteUrl}/` }
    ],
    sections: [
      {
        heading: "Workflow Test Car News: Article Generation",
        paragraphs: [
          "This sample article confirms that a new post can be added to the source data, rendered into the posts directory, and linked from the homepage.",
          "The test also confirms that the featured image appears directly below the H1 title while staying inside the article container."
        ],
        subsections: [
          {
            heading: "What this test validates",
            paragraphs: [
              "It checks the generated URL, thumbnail path, homepage card, social metadata, and duplicate protection data before scheduling is enabled."
            ]
          }
        ]
      },
      {
        heading: "Scheduled Publishing and Social Queue",
        paragraphs: [
          "The workflow test can run the Facebook publisher in dry-run mode so captions, hashtags, image URLs, and queue handling are validated without posting to Facebook.",
          "When run with --publish, the test commits and pushes the sample article to GitHub so the public URL can be checked before enabling background automation."
        ]
      }
    ]
  };
}

function addSamplePost(post) {
  const posts = readJson(paths.posts, []);
  assert(!posts.some((item) => item.slug === post.slug), `Sample slug already exists: ${post.slug}`);
  fs.copyFileSync(paths.sourceThumbnail, paths.thumbnail);
  posts.unshift(post);
  writeJson(paths.posts, posts);
}

function verifyGeneratedPost(post) {
  assert(fs.existsSync(paths.article), `Article was not generated: ${paths.article}`);
  assert(fs.existsSync(paths.thumbnail), `Thumbnail was not created: ${paths.thumbnail}`);

  const article = fs.readFileSync(paths.article, "utf8");
  const homepage = fs.readFileSync(paths.homepage, "utf8");
  const articleUrl = `${siteUrl}/posts/${post.slug}.html`;

  assert(article.includes(`<h1>${post.title}</h1>`), "Article H1 title is missing.");
  assert(article.includes(`<img src="../${post.image}"`), "Featured thumbnail is missing from the article.");
  assert(article.includes(`property="og:image" content="${siteUrl}/${post.image}"`), "Open Graph image metadata is missing.");
  assert(article.includes(`name="twitter:image" content="${siteUrl}/${post.image}"`), "Twitter image metadata is missing.");
  assert(homepage.includes(`posts/${post.slug}.html`), "Homepage card/link was not generated.");
  assert(homepage.includes(post.image), "Homepage thumbnail was not generated.");
  assert(article.includes(articleUrl), "Canonical/generated article URL is missing.");

  return articleUrl;
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

function verifySocialQueue(post) {
  run("node", ["scripts/FB_Post.js"], {
    env: {
      FB_DRY_RUN: "true",
      FB_PAGE_ID: process.env.FB_PAGE_ID || "176747645744060",
      FB_POST_INTERVAL_MINUTES: "240",
      FB_MAX_POSTS_PER_RUN: "1"
    }
  });

  const queue = readJson(paths.facebookQueue, []);
  const log = readJson(paths.facebookLog, []);
  const matching = queue.find((item) => item.sourcePostSlug === post.slug);
  assert(matching, "Facebook social queue item was not generated.");
  assert(matching.caption.includes(post.title), "Facebook caption does not include the article title.");
  assert(matching.caption.includes(`${siteUrl}/posts/${post.slug}.html`), "Facebook caption does not include the article URL.");
  assert(!log.some((item) => item.url === `${siteUrl}/posts/${post.slug}.html` && item.status === "published"), "Sample article is already marked as published.");
  return matching;
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

function buildSite() {
  run("node", ["scripts/build-site.js"]);
}

function publishToGit(post) {
  run("git", ["add", "data/posts.json", "index.html", "posts", "category", "tags", "sitemap.xml", "robots.txt", post.image]);
  const staged = gitOutput(["diff", "--cached", "--name-only"]);
  assert(staged, "Nothing was staged for commit.");
  run("git", ["commit", "-m", `Workflow test publish: ${post.slug}`]);
  run("git", ["push", "origin", "HEAD:main"]);
  run("git", ["push", "origin", "HEAD:gh-pages"]);
}

function main() {
  const mode = publishMode ? "PUBLISH" : "DRY RUN";
  console.log(`Workflow test mode: ${mode}`);
  console.log(`Sample slug: ${slug}`);

  const restoreFiles = [
    ...touched,
    paths.thumbnail,
    paths.article,
    path.join(root, "posts", `${slug.replace(/^workflow-test-article-/, "workflow-test-article-")}.html`)
  ];
  const snapshot = fileSnapshot(restoreFiles);
  const post = makePost();

  try {
    addSamplePost(post);
    buildSite();
    const articleUrl = verifyGeneratedPost(post);
    const linkStatus = checkLinks();
    const socialItem = verifySocialQueue(post);
    const taskStatus = checkScheduledTasks();

    console.log("");
    console.log("Verification summary:");
    console.log(`- Article generated: ${path.relative(root, paths.article)}`);
    console.log(`- Thumbnail generated: ${post.image}`);
    console.log(`- Homepage card: OK`);
    console.log(`- Article URL: ${articleUrl}`);
    console.log(`- Link check: ${linkStatus}`);
    console.log(`- Social caption generated: ${socialItem.captionHash}`);
    console.log(`- Duplicate status: not published`);
    for (const item of taskStatus) {
      console.log(`- Scheduled task ${item.task}: ${item.installed ? "installed" : "not installed"}`);
    }

    if (publishMode) {
      publishToGit(post);
      console.log("");
      console.log("Published sample article to GitHub.");
      console.log(`Live URL after Pages refresh: ${articleUrl}`);
    } else {
      console.log("");
      console.log("Dry run complete. No GitHub commit or push was made.");
      if (!keepMode) {
        restoreSnapshot(snapshot);
        fs.rmSync(paths.thumbnail, { force: true });
        fs.rmSync(paths.article, { force: true });
        buildSite();
        console.log("Temporary test files were cleaned up.");
      } else {
        console.log("Temporary test files were kept because --keep was provided.");
      }
    }
  } catch (error) {
    if (!publishMode) {
      restoreSnapshot(snapshot);
      fs.rmSync(paths.thumbnail, { force: true });
      fs.rmSync(paths.article, { force: true });
      try { buildSite(); } catch {}
    }
    throw error;
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
