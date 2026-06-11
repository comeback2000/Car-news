const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const reportDir = path.join(root, "logs");
const posts = JSON.parse(fs.readFileSync(path.join(root, "data", "posts.json"), "utf8").replace(/^\uFEFF/, ""));

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function htmlFiles() {
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if ([".git", "node_modules", "logs", "secrets"].includes(entry.name)) continue;
        walk(full);
      } else if (entry.name.endsWith(".html")) {
        out.push(full);
      }
    }
  }
  walk(root);
  return out;
}

function extractLinks(html) {
  html = String(html || "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<template[\s\S]*?<\/template>/gi, "");
  const links = [];
  const attrPattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrPattern.exec(html))) {
    links.push(match[1]);
  }
  return links;
}

function isExternal(url) {
  return /^(https?:|mailto:|tel:|javascript:|#)/i.test(url);
}

function resolveLocal(baseFile, link) {
  const clean = link.split("#")[0].split("?")[0];
  if (!clean || isExternal(clean)) return null;
  return path.resolve(path.dirname(baseFile), clean);
}

async function remoteStatus(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.status === 405) {
      const fallback = await fetch(url, { method: "GET", redirect: "follow" });
      return fallback.status;
    }
    return response.status;
  } catch {
    return 0;
  }
}

async function main() {
  const checkRemote = process.argv.includes("--remote");
  const localBroken = [];
  const postIssues = [];
  const postStatuses = [];
  const duplicateSlugs = new Map();
  const duplicateImages = new Map();

  for (const post of posts) {
    const postPath = path.join(root, "posts", `${post.slug}.html`);
    const imagePath = path.join(root, post.image || "");
    const status = {
      slug: post.slug,
      title: post.title,
      category: post.category,
      url: `${siteUrl}/posts/${post.slug}.html`,
      imageUrl: post.image ? `${siteUrl}/${post.image}` : "",
      publishDate: post.datePublished || post.dateModified || "",
      localArticleExists: fs.existsSync(postPath),
      localImageExists: Boolean(post.image && fs.existsSync(imagePath)),
      articleStatus: null,
      imageStatus: null,
      status: "unchecked",
      actions: ["delete", "unpublish", "rebuild", "fix_url_mapping"]
    };
    if (!fs.existsSync(postPath)) {
      postIssues.push({ type: "missing_post_file", slug: post.slug, path: rel(postPath), recommendation: "rebuild_or_remove" });
    }
    if (!post.image || !fs.existsSync(imagePath)) {
      postIssues.push({ type: "missing_thumbnail", slug: post.slug, image: post.image || "", recommendation: "regenerate_thumbnail" });
    }
    if (duplicateSlugs.has(post.slug)) {
      postIssues.push({ type: "duplicate_slug", slug: post.slug, other: duplicateSlugs.get(post.slug), recommendation: "rename_or_remove_duplicate" });
    }
    duplicateSlugs.set(post.slug, post.title);
    if (post.image) {
      if (duplicateImages.has(post.image)) {
        postIssues.push({ type: "duplicate_image_path", slug: post.slug, image: post.image, other: duplicateImages.get(post.image), recommendation: "assign_unique_thumbnail" });
      }
      duplicateImages.set(post.image, post.slug);
    }
    postStatuses.push(status);
  }

  for (const file of htmlFiles()) {
    const html = read(file);
    for (const link of extractLinks(html)) {
      const target = resolveLocal(file, link);
      if (!target) continue;
      if (!target.startsWith(root) || !fs.existsSync(target)) {
        localBroken.push({
          source: rel(file),
          link,
          target: target.startsWith(root) ? rel(target) : target,
          recommendation: "repair_link_or_remove_reference"
        });
      }
    }
  }

  const remoteBroken = [];
  if (checkRemote) {
    const urls = [`${siteUrl}/`, `${siteUrl}/admin/`];
    for (const url of urls) {
      const status = await remoteStatus(url);
      if (status >= 400 || status === 0) {
        remoteBroken.push({
          url,
          status,
          recommendation: status === 404 ? "remove_redirect_or_republish" : "recheck_remote_availability"
        });
      }
    }
    for (const postStatus of postStatuses) {
      postStatus.articleStatus = await remoteStatus(postStatus.url);
      postStatus.imageStatus = postStatus.imageUrl ? await remoteStatus(postStatus.imageUrl) : 0;
      postStatus.status = postStatus.articleStatus === 200 && postStatus.imageStatus === 200 ? "ok" : "broken";
      if (postStatus.status === "broken") {
        remoteBroken.push({
          slug: postStatus.slug,
          title: postStatus.title,
          category: postStatus.category,
          publishDate: postStatus.publishDate,
          url: postStatus.url,
          imageUrl: postStatus.imageUrl,
          articleStatus: postStatus.articleStatus,
          imageStatus: postStatus.imageStatus,
          recommendation: postStatus.articleStatus === 404 || postStatus.imageStatus === 404 ? "remove_or_republish_missing_article" : "recheck_remote_availability"
        });
      }
    }
  } else {
    for (const postStatus of postStatuses) {
      postStatus.status = postStatus.localArticleExists && postStatus.localImageExists ? "local-ok" : "broken";
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    totals: {
      posts: posts.length,
      htmlFiles: htmlFiles().length,
      localBrokenLinks: localBroken.length,
      postIssues: postIssues.length,
      remoteBroken: remoteBroken.length
    },
    postStatuses,
    brokenPosts: postStatuses.filter((item) => item.status === "broken"),
    postIssues,
    localBroken,
    remoteBroken
  };
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `site-audit-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(reportDir, "site-audit-latest.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(root, "data", "post-status-report.json"), JSON.stringify({
    generatedAt: report.generatedAt,
    siteUrl,
    totals: report.totals,
    posts: postStatuses,
    brokenPosts: report.brokenPosts
  }, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ reportPath, ...report.totals }, null, 2));
  if (localBroken.length || postIssues.length || remoteBroken.length) {
    process.exitCode = 2;
  }
}

main();
