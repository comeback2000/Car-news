const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const allPosts = JSON.parse(fs.readFileSync(path.join(root, "data", "posts.json"), "utf8").replace(/^\uFEFF/, ""));
const posts = allPosts.filter((post) => post.status !== "unpublished" && post.unpublished !== true && post.published !== false);
const imageSizeCache = new Map();

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
}[char]));

const slugify = (value) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const postUrl = (post) => `${siteUrl}/posts/${post.slug}.html`;
const rootHref = (href, depth = 0) => `${"../".repeat(depth)}${href}`;
const fmtDate = (date) => `${date}T00:00:00+05:30`;
const latestDate = posts[0]?.datePublished || "2026-06-04";

function imageSize(imagePath) {
  if (imageSizeCache.has(imagePath)) return imageSizeCache.get(imagePath);
  const file = fs.readFileSync(path.join(root, imagePath));
  let size = { width: 1600, height: 900 };
  if (file[0] === 0xff && file[1] === 0xd8) {
    let offset = 2;
    while (offset < file.length) {
      while (file[offset] === 0xff) offset++;
      const marker = file[offset++];
      const length = file.readUInt16BE(offset);
      if (marker >= 0xc0 && marker <= 0xc3) {
        size = { height: file.readUInt16BE(offset + 3), width: file.readUInt16BE(offset + 5) };
        break;
      }
      offset += length;
    }
  }
  imageSizeCache.set(imagePath, size);
  return size;
}

function headTags({ title, description, url, image, type = "website", schema, imageWidth = 1200, imageHeight = 675 }) {
  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${esc(url)}">
    <meta property="og:type" content="${esc(type)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${esc(url)}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:image:secure_url" content="${esc(image)}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="${esc(imageWidth)}">
    <meta property="og:image:height" content="${esc(imageHeight)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(image)}">
    <link rel="stylesheet" href="${url.includes("/posts/") || url.includes("/category/") || url.includes("/tags/") || url.includes("/admin/") ? "../styles.css" : "styles.css"}">
    ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}`;
}

function header(depth = 0) {
  return `<header class="site-header">
      <a class="brand" href="${rootHref("index.html", depth)}">Car News</a>
      <nav aria-label="Main navigation">
        <a href="${rootHref("index.html#top-stories", depth)}">Top Stories</a>
        <a href="${rootHref("tags/india-ev-sales.html", depth)}">India EV News</a>
        <a href="${rootHref("sitemap.xml", depth)}">Sitemap</a>
        <a href="${rootHref("admin/index.html", depth)}">Admin</a>
      </nav>
    </header>`;
}

function autoLink(text, currentPost) {
  let linked = esc(text);
  const targets = posts
    .filter((post) => post.slug !== currentPost.slug)
    .flatMap((post) => [post.targetKeyword, ...post.tags.slice(0, 2)].map((keyword) => ({ keyword, post })))
    .sort((a, b) => b.keyword.length - a.keyword.length);

  const linkedSlugs = new Set();
  for (const { keyword, post } of targets) {
    if (linkedSlugs.has(post.slug)) continue;
    const escapedKeyword = esc(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b(${escapedKeyword})\\b`, "i");
    const parts = linked.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi);
    const index = parts.findIndex((part) => !/^<a\b/i.test(part) && pattern.test(part));
    if (index !== -1) {
      parts[index] = parts[index].replace(pattern, `<a href="${post.slug}.html">$1</a>`);
      linked = parts.join("");
      linkedSlugs.add(post.slug);
    }
  }
  return linked;
}

function relatedPosts(currentPost) {
  return posts
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => ({
      post,
      score: (post.category === currentPost.category ? 5 : 0) + post.tags.filter((tag) => currentPost.tags.includes(tag)).length
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post);
}

function autoLinkContentHtml(html, currentPost) {
  // Apply auto-linking within contentHtml - link keyword occurrences
  let linked = html;
  const targets = posts
    .filter((post) => post.slug !== currentPost.slug)
    .flatMap((post) => [post.targetKeyword, ...post.tags.slice(0, 2)].map((keyword) => ({ keyword, post })))
    .sort((a, b) => b.keyword.length - a.keyword.length);

  const linkedSlugs = new Set();
  for (const { keyword, post } of targets) {
    if (linkedSlugs.has(post.slug)) continue;
    const escapedKeyword = esc(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b(${escapedKeyword})\\b`, "i");
    const parts = linked.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi);
    const index = parts.findIndex((part) => !/^<a\b/i.test(part) && pattern.test(part));
    if (index !== -1) {
      parts[index] = parts[index].replace(pattern, `<a href="${post.slug}.html">$1</a>`);
      linked = parts.join("");
      linkedSlugs.add(post.slug);
    }
  }
  return linked;
}

function sanitizeArticleHtml(value, currentPost) {
  let clean = String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?h1[^>]*>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/href=["']\/electric-vehicle-news["']/gi, 'href="../tags/electric-vehicles.html"')
    .replace(/href=["']\/automotive-industry["']/gi, 'href="../category/automotive-news.html"')
    .trim();
  // Apply auto-linking within contentHTML
  if (currentPost) {
    clean = autoLinkContentHtml(clean, currentPost);
  }
  return clean;
}

function sectionHtml(post) {
  if (post.contentHtml) {
    return `<div class="article-content">${sanitizeArticleHtml(post.contentHtml, post)}</div>`;
  }

  return post.sections.map((section) => `
        <section id="${esc(slugify(section.heading))}">
          <h2>${esc(section.heading)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${autoLink(paragraph, post)}</p>`).join("")}
          ${(section.subsections || []).map((subsection) => `
          <h3>${esc(subsection.heading)}</h3>
          ${subsection.paragraphs.map((paragraph) => `<p>${autoLink(paragraph, post)}</p>`).join("")}`).join("")}
        </section>`).join("");
}

function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
      ${items.map((item, index) => item.href
        ? `<a href="${esc(item.href)}">${esc(item.label)}</a>`
        : `<span aria-current="page">${esc(item.label)}</span>`).join("<span>/</span>")}
    </nav>`;
}

function extractHeadingsFromHtml(html) {
  const headings = [];
  const pattern = /<h([234])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    const id = slugify(text);
    headings.push({ level, text, id });
  }
  return headings;
}

function articlePage(post) {
  const index = posts.findIndex((p) => p.slug === post.slug);
  const prevPost = index > 0 ? posts[index - 1] : null;
  const nextPost = index < posts.length - 1 ? posts[index + 1] : null;
  const related = relatedPosts(post).slice(0, 4);
  const featuredImage = imageSize(post.image);
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.metaDescription,
    "image": [`${siteUrl}/${post.image}`],
    "datePublished": fmtDate(post.datePublished),
    "dateModified": fmtDate(post.dateModified),
    "author": { "@type": "Organization", "name": post.author },
    "publisher": {
      "@type": "Organization",
      "name": "Car News",
      "logo": { "@type": "ImageObject", "url": `${siteUrl}/assets/tata-nexon-ev.jpg` }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": postUrl(post) },
    "keywords": [...new Set([post.targetKeyword, ...post.tags])].join(", ")
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": post.category, "item": `${siteUrl}/category/${slugify(post.category)}.html` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": postUrl(post) }
    ]
  };

  // Process contentHtml to add IDs to headings for TOC anchor links
  let contentHtml = '';
  let headings = [];
  if (post.contentHtml) {
    const raw = sanitizeArticleHtml(post.contentHtml, post);
    // Add id attributes to h2/h3 headings for anchor linking
    contentHtml = raw.replace(/<h([234])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
      const cleanText = text.replace(/<[^>]+>/g, "").trim();
      const id = slugify(cleanText);
      return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
    });
    headings = extractHeadingsFromHtml(raw);
  }

  return `<!doctype html>
<html lang="en">
  <head>
${headTags({ title: post.metaTitle, description: post.metaDescription, url: postUrl(post), image: `${siteUrl}/${post.image}`, type: "article", schema: [schema, breadcrumbSchema], imageWidth: featuredImage.width, imageHeight: featuredImage.height })}
  </head>
  <body>
    ${header(1)}
    <main>
      <article class="article-body">
        ${breadcrumb([
          { label: "Home", href: "../index.html" },
          { label: post.category, href: `../category/${slugify(post.category)}.html` },
          { label: post.title }
        ])}
        <h1>${esc(post.title)}</h1>
        <figure class="article-featured-image">
          <img src="../${esc(post.image)}" alt="${esc(post.imageAlt)}" width="${featuredImage.width}" height="${featuredImage.height}" fetchpriority="high">
          ${post.imageCredit ? `<figcaption>${esc(post.imageCredit)}</figcaption>` : ""}
        </figure>
        <p class="lede article-lede">${autoLink(post.excerpt, post)}</p>

        ${headings.length > 0 ? `<nav class="toc" aria-label="Table of contents">
          <p class="toc-title">In this article</p>
          ${headings.map((h) => `<a href="#${h.id}" style="padding-left:${(h.level - 2) * 12}px">${esc(h.text)}</a>`).join("")}
        </nav>` : ""}

        ${post.contentHtml ? `<div class="article-content">${contentHtml}</div>` : sectionHtml(post)}
        ${post.contentHtml ? "" : `<section>
          <h2>Conclusion</h2>
          <p>${esc(post.conclusion || "The smartest next step is to match the headline trend with real-world needs before booking or upgrading. Price, availability, service support, warranty terms and long-term usability should matter more than the first wave of hype.")}</p>
        </section>`}

        ${post.sources && post.sources.length > 0 ? `<section>
          <h2>Sources & References</h2>
          <ul class="source-list">
            ${post.sources.map((source) => `<li><a href="${esc(source.url)}" rel="nofollow" target="_blank">${esc(source.label)}</a></li>`).join("")}
          </ul>
        </section>` : ""}

        <section class="tag-list" aria-label="Article tags">
          ${post.tags.map((tag) => `<a href="../tags/${slugify(tag)}.html">${esc(tag)}</a>`).join("")}
        </section>
      </article>

      ${prevPost || nextPost ? `<nav class="prev-next-nav" aria-label="Previous and next articles">
        ${prevPost ? `<a href="${prevPost.slug}.html" class="prev-next-link prev-link">
          <span class="prev-next-direction">Previous</span>
          <span class="prev-next-title">${esc(prevPost.title)}</span>
        </a>` : `<span class="prev-next-link prev-link disabled"></span>`}
        ${nextPost ? `<a href="${nextPost.slug}.html" class="prev-next-link next-link">
          <span class="prev-next-direction">Next</span>
          <span class="prev-next-title">${esc(nextPost.title)}</span>
        </a>` : `<span class="prev-next-link next-link disabled"></span>`}
      </nav>` : ""}

      ${related.length > 0 ? `<section class="related-section">
        <p class="eyebrow">Related articles</p>
        <div class="story-grid related-grid">
          ${related.map((p) => storyCard(p, { depth: 1, context: "post" })).join("")}
        </div>
      </section>` : ""}
    </main>
    <footer class="site-footer">
      <p>Car News — India automotive news, EV trends and analysis</p>
    </footer>
  </body>
</html>`;
}

function storyCard(post, options = {}) {
  const { depth = 0, context = "root" } = options;
  const href = context === "post" ? `${post.slug}.html` : rootHref(`posts/${post.slug}.html`, depth);
  const image = rootHref(post.image, depth);
  const size = imageSize(post.image);
  return `<article class="story-card">
          <a href="${href}">
            <figure class="thumb-frame">
              <img src="${image}" alt="${esc(post.imageAlt)}" width="${size.width}" height="${size.height}" loading="lazy">
            </figure>
            <div class="story-body">
              <p class="tag">${esc(post.category)}</p>
              <h3>${esc(post.title)}</h3>
              <p>${esc(post.excerpt)}</p>
            </div>
          </a>
        </article>`;
}

function indexPage() {
  const heroPosts = posts.slice(0, 4);
  const featuredImage = imageSize(heroPosts[0].image);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Car News",
    "url": siteUrl,
    "description": "India car news, EV trends and viral auto stories."
  };
  return `<!doctype html>
<html lang="en">
  <head>
${headTags({
  title: "Car News | India EV Trends, Tata, Mahindra and Maruti Updates",
  description: "Read SEO-optimized India car news on Tata EV sales, Mahindra BE 6 and XEV 9e, and Maruti e Vitara charging network trends.",
  url: `${siteUrl}/`,
  image: `${siteUrl}/${posts[0].image}`,
  schema
})}
  </head>
  <body>
    ${header(0)}
    <main>
      <section class="hero" id="trends" aria-label="Viral car news headlines">
        <figure class="hero-media" aria-hidden="true">
          <img id="viralHeroImage" src="${esc(heroPosts[0].image)}" alt="" width="${featuredImage.width}" height="${featuredImage.height}" fetchpriority="high">
        </figure>
        <div class="hero-shine" aria-hidden="true"></div>
        <div class="hero-copy">
          <p class="eyebrow">Latest India auto brief | June 4, 2026</p>
          <div class="hero-panel">
            <p class="hero-kicker" id="viralHeroCategory">${esc(heroPosts[0].category)}</p>
            <h1 id="viralHeroTitle">${esc(posts[0].title)}</h1>
            <p class="hero-summary" id="viralHeroSummary">${esc(heroPosts[0].excerpt)}</p>
            <a class="hero-cta" id="viralHeroLink" href="posts/${heroPosts[0].slug}.html">Read the latest story</a>
          </div>
        </div>
        <div class="viral-stack" aria-label="Latest featured story links">
          ${heroPosts.map((post, index) => `<a class="viral-card${index === 0 ? " is-active" : ""}" href="posts/${post.slug}.html" data-title="${esc(post.title)}" data-image="${esc(post.image)}" data-category="${esc(post.category)}" data-excerpt="${esc(post.excerpt)}">
            <span class="rank">${String(index + 1).padStart(2, "0")}</span>
            <span class="viral-copy">
              <span class="viral-title">${esc(post.title)}</span>
              <span class="viral-meta">${esc(post.category)}</span>
            </span>
          </a>`).join("")}
        </div>
      </section>

      <section class="section-heading" id="top-stories">
        <p class="eyebrow">Latest car news posts</p>
      </section>
      <section class="story-grid" aria-label="Top car news stories">
        ${posts.map((post) => storyCard(post)).join("")}
      </section>
    </main>
    <footer class="site-footer">
      <p>Updated June 4, 2026. Trend cues from Google News, public auto-market signals, and current India auto reports; sources are linked in each post.</p>
    </footer>
    <script>
      const viralCards = Array.from(document.querySelectorAll(".viral-card"));
      const heroTitle = document.getElementById("viralHeroTitle");
      const heroImage = document.getElementById("viralHeroImage");
      const heroCategory = document.getElementById("viralHeroCategory");
      const heroSummary = document.getElementById("viralHeroSummary");
      const heroLink = document.getElementById("viralHeroLink");
      let activeStory = 0;
      function setActiveStory(index) {
        activeStory = index % viralCards.length;
        viralCards.forEach((card, cardIndex) => card.classList.toggle("is-active", cardIndex === activeStory));
        heroTitle.classList.remove("title-pop");
        heroTitle.textContent = viralCards[activeStory].dataset.title;
        heroImage.src = viralCards[activeStory].dataset.image;
        heroCategory.textContent = viralCards[activeStory].dataset.category;
        heroSummary.textContent = viralCards[activeStory].dataset.excerpt;
        heroLink.href = viralCards[activeStory].href;
        requestAnimationFrame(() => heroTitle.classList.add("title-pop"));
      }
      viralCards.forEach((card, index) => {
        card.addEventListener("mouseenter", () => setActiveStory(index));
        card.addEventListener("focus", () => setActiveStory(index));
      });
      setInterval(() => setActiveStory(activeStory + 1), 4200);
    </script>
  </body>
</html>`;
}

function listingPage({ title, description, url, image, items, heading }) {
  return `<!doctype html>
<html lang="en">
  <head>
${headTags({ title, description, url, image })}
  </head>
  <body>
    ${header(1)}
    <main>
      <section class="section-heading listing-heading">
        ${breadcrumb([{ label: "Home", href: "../index.html" }, { label: heading }])}
        <p class="eyebrow">Archive</p>
        <h1>${esc(heading)}</h1>
        <p>${esc(description)}</p>
      </section>
      <section class="story-grid">
        ${items.map((post) => storyCard(post, { depth: 1 })).join("")}
      </section>
    </main>
  </body>
</html>`;
}

function uniqueLabelsBySlug(labels) {
  const bySlug = new Map();
  for (const label of labels) {
    const key = slugify(label);
    if (!bySlug.has(key)) bySlug.set(key, label);
  }
  return [...bySlug.values()];
}

function sitemap() {
  const categories = uniqueLabelsBySlug(posts.map((post) => post.category));
  const tags = uniqueLabelsBySlug(posts.flatMap((post) => post.tags));
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/admin/`,
    ...posts.map(postUrl),
    ...categories.map((category) => `${siteUrl}/category/${slugify(category)}.html`),
    ...tags.map((tag) => `${siteUrl}/tags/${slugify(tag)}.html`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${esc(url)}</loc><lastmod>${latestDate}</lastmod><changefreq>daily</changefreq><priority>${url.endsWith("/") ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>`;
}

function adminPage() {
  const published = {};
  const publishedDir = path.join(root, "data", "published");
  if (fs.existsSync(publishedDir)) {
    for (const file of fs.readdirSync(publishedDir).filter((item) => item.endsWith(".json"))) {
      try {
        const item = JSON.parse(fs.readFileSync(path.join(publishedDir, file), "utf8"));
        published[item.slug || file.replace(/\.json$/, "")] = {
          articleUrl: item.github_article_url || item.article_url || "",
          thumbnailUrl: item.github_thumbnail_url || item.thumbnail_url || "",
          publishedAt: item.published_at || item.publish_date || "",
          localThumbnail: item.local_files?.thumbnail || "",
          thumbnailGeneration: item.thumbnail_generation || {}
        };
      } catch {
        published[file.replace(/\.json$/, "")] = { error: "Could not parse metadata" };
      }
    }
  }
  const adminPosts = posts.map((post) => {
    const articlePath = path.join(root, "posts", `${post.slug}.html`);
    const imagePath = path.join(root, post.image || "");
    return {
      ...post,
      tags: post.tags || [],
      admin: {
        articleUrl: postUrl(post),
        expectedPath: `posts/${post.slug}.html`,
        imageUrl: post.image ? `${siteUrl}/${post.image}` : "",
        localArticleExists: Boolean(post.slug) || fs.existsSync(articlePath),
        localImageExists: Boolean(post.image && fs.existsSync(imagePath)),
        published: published[post.slug] || null
      }
    };
  });
  const adminData = {
    generatedAt: new Date().toISOString(),
    posts: adminPosts,
    published,
    siteUrl
  };
  return `<!doctype html>
<html lang="en">
  <head>
${headTags({
  title: "Admin | Car News",
  description: "Local publishing admin panel for Car News articles, thumbnails, metadata and audit status.",
  url: `${siteUrl}/admin/`,
  image: `${siteUrl}/${posts[0]?.image || "assets/tata-nexon-ev.jpg"}`,
  type: "website"
})}
    <meta name="robots" content="noindex, nofollow">
  </head>
  <body class="admin-body">
    ${header(1)}
    <main class="admin-shell">
      <section class="admin-login" id="loginPanel">
        <p class="eyebrow">Publishing control</p>
        <h1>Admin Login</h1>
        <p>This is a static GitHub Pages admin panel. It edits data in-browser and exports files for the local publisher to apply.</p>
        <label>
          Access key
          <input id="adminPassword" type="password" autocomplete="current-password" placeholder="Enter local admin key">
        </label>
        <button id="adminLogin" type="button">Open Admin</button>
        <p class="admin-hint">Default local key: <code>autotech-admin</code>. Change it in <code>scripts/build-site.js</code> before public use.</p>
      </section>

      <section class="admin-app" id="adminApp" hidden>
        <div class="admin-topbar">
          <div>
            <p class="eyebrow">Car News Admin</p>
            <h1>Published Articles</h1>
          </div>
          <div class="admin-actions">
            <button id="validateAll" type="button">Check live URLs</button>
            <button id="downloadBrokenReport" type="button">Export 404 report</button>
            <button id="downloadPosts" type="button">Export posts.json</button>
            <button id="downloadReport" type="button">Export status report</button>
          </div>
        </div>

        <div class="admin-metrics" id="adminMetrics"></div>
        <div class="admin-grid">
          <aside class="admin-list">
            <input id="adminSearch" type="search" placeholder="Search posts, tags, slugs">
            <select id="statusFilter" aria-label="Filter by status">
              <option value="all">All posts</option>
              <option value="broken">Broken or missing</option>
              <option value="ok">Live OK</option>
              <option value="unchecked">Unchecked</option>
              <option value="queued">Rebuild queued</option>
            </select>
            <div id="postList"></div>
          </aside>
          <section class="admin-editor">
            <div id="editorEmpty">
              <h2>Select a post</h2>
              <p>Review article status, edit metadata, change thumbnails, delete posts, then export updated data.</p>
            </div>
            <form id="postEditor" hidden>
              <label>Title<input name="title"></label>
              <label>Slug<input name="slug"></label>
              <label>Category<input name="category"></label>
              <label>Target keyword<input name="targetKeyword"></label>
              <label>Meta title<input name="metaTitle"></label>
              <label>Meta description<textarea name="metaDescription" rows="3"></textarea></label>
              <label>Excerpt<textarea name="excerpt" rows="4"></textarea></label>
              <label>Image path<input name="image"></label>
              <label>Image alt<input name="imageAlt"></label>
              <label>Tags, comma separated<input name="tags"></label>
              <label>Publish date<input name="datePublished"></label>
              <div class="admin-preview">
                <img id="thumbnailPreview" alt="">
                <div>
                  <p id="liveStatusDetails"></p>
                  <p id="statusDetails"></p>
                  <p id="publishDetails"></p>
                </div>
              </div>
              <div class="admin-actions">
                <a id="openArticle" class="button-link" target="_blank" rel="noopener">Open article</a>
                <button id="checkPost" type="button">Check URL</button>
                <button id="unpublishPost" type="button">Unpublish</button>
                <button id="queueRebuild" type="button">Queue rebuild</button>
                <button id="fixUrlMapping" type="button">Fix URL mapping</button>
                <button id="savePost" type="button">Save edits</button>
                <button id="deletePost" type="button" class="danger">Delete post</button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
    <script id="adminData" type="application/json">${JSON.stringify(adminData).replace(/</g, "\\u003c")}</script>
    <script>
      const ADMIN_KEY = "autotech-admin";
      const state = JSON.parse(document.getElementById("adminData").textContent);
      let postsData = state.posts.map((post) => ({ ...post, tags: [...(post.tags || [])] }));
      let selectedSlug = "";
      const liveStatus = new Map(postsData.map((post) => [post.slug, {
        articleStatus: "unchecked",
        imageStatus: post.admin?.localImageExists ? "unchecked" : "missing-local",
        checkedAt: "",
        checking: false
      }]));
      const rebuildQueue = new Set();
      const loginPanel = document.getElementById("loginPanel");
      const adminApp = document.getElementById("adminApp");
      const postList = document.getElementById("postList");
      const postEditor = document.getElementById("postEditor");
      const editorEmpty = document.getElementById("editorEmpty");
      const search = document.getElementById("adminSearch");
      const statusFilter = document.getElementById("statusFilter");
      const fields = ["title", "slug", "category", "targetKeyword", "metaTitle", "metaDescription", "excerpt", "image", "imageAlt", "tags", "datePublished"];

      function slugify(value) {
        return String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      function articleUrl(post) {
        return \`\${state.siteUrl}/posts/\${post.slug}.html\`;
      }
      function imageUrl(post) {
        return post.image ? \`\${state.siteUrl}/\${post.image}\` : "";
      }
      function postStatus(post) {
        const status = liveStatus.get(post.slug) || {};
        if (rebuildQueue.has(post.slug) || post.rebuildRequested) return "queued";
        if (status.checking) return "checking";
        if ([404, 0, "missing-local"].includes(status.articleStatus) || [404, 0, "missing-local"].includes(status.imageStatus)) return "broken";
        if (status.articleStatus === 200 && status.imageStatus === 200) return "ok";
        return "unchecked";
      }
      function statusLabel(post) {
        const status = liveStatus.get(post.slug) || {};
        const stateName = postStatus(post);
        if (stateName === "ok") return "Live OK";
        if (stateName === "broken") return \`Broken: article \${status.articleStatus || "?"}, image \${status.imageStatus || "?"}\`;
        if (stateName === "queued") return "Rebuild queued";
        if (stateName === "checking") return "Checking...";
        return "Unchecked";
      }
      function renderMetrics() {
        const missingImages = postsData.filter((post) => !post.image).length;
        const metadataCount = Object.keys(state.published || {}).length;
        const brokenCount = postsData.filter((post) => postStatus(post) === "broken").length;
        const okCount = postsData.filter((post) => postStatus(post) === "ok").length;
        document.getElementById("adminMetrics").innerHTML = [
          ["Posts", postsData.length],
          ["Live OK", okCount],
          ["Broken/missing", brokenCount],
          ["Rebuild queued", rebuildQueue.size],
          ["Published metadata", metadataCount],
          ["Missing image paths", missingImages],
          ["Generated", state.generatedAt]
        ].map(([label, value]) => \`<div><span>\${label}</span><strong>\${value}</strong></div>\`).join("");
      }
      function renderList() {
        const query = search.value.trim().toLowerCase();
        const filter = statusFilter.value;
        const items = postsData.filter((post) => {
          const matchesQuery = !query || JSON.stringify(post).toLowerCase().includes(query);
          const matchesStatus = filter === "all" || postStatus(post) === filter;
          return matchesQuery && matchesStatus;
        });
        postList.innerHTML = items.map((post) => \`
          <button type="button" class="admin-post is-\${postStatus(post)} \${post.slug === selectedSlug ? "is-active" : ""}" data-slug="\${post.slug}">
            <strong>\${post.title}</strong>
            <span>\${post.category} · \${post.slug}</span>
            <em>\${statusLabel(post)}</em>
          </button>
        \`).join("");
        postList.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => selectPost(button.dataset.slug)));
        renderMetrics();
      }
      function selectPost(slug) {
        selectedSlug = slug;
        const post = postsData.find((item) => item.slug === slug);
        if (!post) return;
        editorEmpty.hidden = true;
        postEditor.hidden = false;
        for (const name of fields) {
          postEditor.elements[name].value = Array.isArray(post[name]) ? post[name].join(", ") : (post[name] || "");
        }
        document.getElementById("thumbnailPreview").src = "../" + post.image;
        document.getElementById("thumbnailPreview").alt = post.imageAlt || "";
        document.getElementById("openArticle").href = "../posts/" + post.slug + ".html";
        const published = state.published[post.slug] || {};
        document.getElementById("liveStatusDetails").textContent = \`\${statusLabel(post)} · Article: \${articleUrl(post)} · Image: \${imageUrl(post) || "missing"}\`;
        document.getElementById("statusDetails").textContent = \`Local article: \${post.admin?.localArticleExists ? "exists" : "missing"} · Local image: \${post.admin?.localImageExists ? "exists" : "missing"} · Image path: \${post.image || "missing"}\`;
        document.getElementById("publishDetails").textContent = published.articleUrl ? \`Published metadata: \${published.articleUrl}\` : "No published metadata found.";
        renderList();
      }
      function saveSelected() {
        const index = postsData.findIndex((post) => post.slug === selectedSlug);
        if (index < 0) return;
        const updated = { ...postsData[index] };
        for (const name of fields) {
          const value = postEditor.elements[name].value.trim();
          updated[name] = name === "tags" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value;
        }
        if (!updated.slug) updated.slug = slugify(updated.title);
        postsData[index] = updated;
        selectedSlug = updated.slug;
        if (!liveStatus.has(updated.slug)) {
          liveStatus.set(updated.slug, { articleStatus: "unchecked", imageStatus: "unchecked", checkedAt: "" });
        }
        selectPost(updated.slug);
      }
      async function checkUrl(url) {
        if (!url) return 0;
        try {
          let response = await fetch(url, { method: "HEAD", cache: "no-store", redirect: "follow" });
          if (response.status === 405) response = await fetch(url, { method: "GET", cache: "no-store", redirect: "follow" });
          return response.status;
        } catch {
          return 0;
        }
      }
      async function validatePost(post) {
        liveStatus.set(post.slug, { ...(liveStatus.get(post.slug) || {}), checking: true });
        renderList();
        const [articleStatus, imageStatus] = await Promise.all([checkUrl(articleUrl(post)), checkUrl(imageUrl(post))]);
        liveStatus.set(post.slug, { articleStatus, imageStatus, checkedAt: new Date().toISOString(), checking: false });
        if (selectedSlug === post.slug) selectPost(post.slug);
        renderList();
      }
      async function validateAll() {
        for (const post of postsData) {
          await validatePost(post);
        }
      }
      function unpublishSelected() {
        const post = postsData.find((item) => item.slug === selectedSlug);
        if (!post || !confirm(\`Unpublish "\${post.title}" from future builds?\`)) return;
        post.status = "unpublished";
        post.unpublished = true;
        selectPost(post.slug);
      }
      function queueSelectedRebuild() {
        const post = postsData.find((item) => item.slug === selectedSlug);
        if (!post) return;
        post.rebuildRequested = true;
        rebuildQueue.add(post.slug);
        selectPost(post.slug);
      }
      function fixSelectedUrlMapping() {
        const post = postsData.find((item) => item.slug === selectedSlug);
        if (!post) return;
        const nextSlug = prompt("Enter the correct URL slug. The article URL will be /posts/<slug>.html", post.slug);
        if (!nextSlug) return;
        post.slug = slugify(nextSlug.replace(/\\.html$/i, "").replace(/^.*\\/posts\\//i, ""));
        selectedSlug = post.slug;
        saveSelected();
      }
      function deleteSelected() {
        if (!selectedSlug) return;
        const post = postsData.find((item) => item.slug === selectedSlug);
        if (!post || !confirm(\`Delete "\${post.title}" from exported posts.json?\`)) return;
        postsData = postsData.filter((item) => item.slug !== selectedSlug);
        selectedSlug = "";
        postEditor.hidden = true;
        editorEmpty.hidden = false;
        renderList();
      }
      function downloadJson(filename, value) {
        const blob = new Blob([JSON.stringify(value, null, 2) + "\\n"], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
      function statusReport() {
        return {
          generatedAt: new Date().toISOString(),
          posts: postsData.map((post) => ({
            slug: post.slug,
            title: post.title,
            category: post.category,
            datePublished: post.datePublished || "",
            articleUrl: articleUrl(post),
            image: post.image,
            imageUrl: imageUrl(post),
            status: postStatus(post),
            live: liveStatus.get(post.slug) || null,
            rebuildRequested: Boolean(post.rebuildRequested || rebuildQueue.has(post.slug)),
            metadata: state.published[post.slug] || null
          }))
        };
      }
      function brokenReport() {
        return {
          generatedAt: new Date().toISOString(),
          brokenPosts: statusReport().posts.filter((post) => post.status === "broken")
        };
      }
      document.getElementById("adminLogin").addEventListener("click", () => {
        if (document.getElementById("adminPassword").value !== ADMIN_KEY) {
          alert("Invalid admin key");
          return;
        }
        loginPanel.hidden = true;
        adminApp.hidden = false;
        renderList();
      });
      search.addEventListener("input", renderList);
      statusFilter.addEventListener("change", renderList);
      document.getElementById("savePost").addEventListener("click", saveSelected);
      document.getElementById("deletePost").addEventListener("click", deleteSelected);
      document.getElementById("unpublishPost").addEventListener("click", unpublishSelected);
      document.getElementById("queueRebuild").addEventListener("click", queueSelectedRebuild);
      document.getElementById("fixUrlMapping").addEventListener("click", fixSelectedUrlMapping);
      document.getElementById("checkPost").addEventListener("click", () => {
        const post = postsData.find((item) => item.slug === selectedSlug);
        if (post) validatePost(post);
      });
      document.getElementById("validateAll").addEventListener("click", validateAll);
      document.getElementById("downloadPosts").addEventListener("click", () => downloadJson("posts.json", postsData));
      document.getElementById("downloadReport").addEventListener("click", () => downloadJson("admin-status-report.json", statusReport()));
      document.getElementById("downloadBrokenReport").addEventListener("click", () => downloadJson("broken-posts-404-report.json", brokenReport()));
    </script>
  </body>
</html>`;
}

function redirectPage(targetPost) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Moved: ${esc(targetPost.title)}</title>
    <link rel="canonical" href="${postUrl(targetPost)}">
    <meta name="robots" content="noindex, follow">
    <meta http-equiv="refresh" content="0; url=${targetPost.slug}.html">
  </head>
  <body>
    <p>This article moved to <a href="${targetPost.slug}.html">${esc(targetPost.title)}</a>.</p>
  </body>
</html>`;
}

function genericRedirectPage({ title, target, robots = "noindex, follow" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${esc(title)}</title>
    <meta name="robots" content="${esc(robots)}">
    <meta http-equiv="refresh" content="0; url=${esc(target)}">
  </head>
  <body>
    <p>Continue to <a href="${esc(target)}">${esc(title)}</a>.</p>
  </body>
</html>`;
}

function ensureDir(dir) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content.trimStart().replace(/[ \t]+$/gm, ""), "utf8");
}

function cleanHtmlDir(dir) {
  for (const stale of fs.readdirSync(path.join(root, dir)).filter((file) => file.endsWith(".html"))) {
    fs.unlinkSync(path.join(root, dir, stale));
  }
}

function writeUtilityRedirects() {
  const redirects = [
    ["guides/car-buying-guide", "../category/automotive-news.html", "Car Buying Guide"],
    ["guides/ev-buying-guide", "../tags/ev-buying-guide.html", "EV Buying Guide"],
    ["guides/two-wheeler-buying-guide", "../tags/bikes.html", "Two-Wheeler Buying Guide"],
    ["topics/latest-launch-coverage", "../tags/new-car-launches.html", "Latest Launch Coverage"],
    ["topics/ev-buying-guide", "../tags/ev-buying-guide.html", "EV Buying Guide"],
    ["electric-vehicle-news", "tags/electric-vehicles.html", "Electric Vehicle News"],
    ["automotive-industry", "category/automotive-news.html", "Automotive Industry"]
  ];
  for (const [file, target, title] of redirects) {
    ensureDir(path.dirname(file));
    write(file, genericRedirectPage({ title, target }));
  }
}

function cleanUtilityRedirects() {
  for (const dir of ["guides", "topics"]) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) continue;
    for (const stale of fs.readdirSync(full)) {
      fs.unlinkSync(path.join(full, stale));
    }
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function failDuplicate(map, key, label, post) {
  if (!key) return;
  if (map.has(key)) {
    throw new Error(`${label} duplicate detected: "${key}" is used by ${map.get(key)} and ${post.slug}`);
  }
  map.set(key, post.slug);
}

function validatePosts() {
  const slugs = new Map();
  const keywords = new Map();
  const imagePaths = new Map();
  const imageHashes = new Map();
  const blockedPostPattern = /\b(workflow test|sample article|placeholder|dummy post)\b/i;
  const blockedSlugPattern = /(^|[-_])(workflow-test|sample|placeholder|dummy)([-_]|$)/i;

  for (const post of posts) {
    if (blockedSlugPattern.test(post.slug) || blockedPostPattern.test([post.targetKeyword, post.title, post.category, ...(post.tags || [])].join(" "))) {
      throw new Error(`Non-production article blocked: ${post.slug}. Use a real keyword and production article content only.`);
    }

    failDuplicate(slugs, normalize(post.slug), "Slug", post);
    failDuplicate(keywords, normalize(post.targetKeyword), "Target keyword", post);
    failDuplicate(imagePaths, normalize(post.image), "Thumbnail path", post);

    const imageFile = path.join(root, post.image);
    if (!fs.existsSync(imageFile)) {
      throw new Error(`Thumbnail is missing for ${post.slug}: ${post.image}`);
    }
    const imageHash = crypto.createHash("sha256").update(fs.readFileSync(imageFile)).digest("hex");
    failDuplicate(imageHashes, imageHash, "Thumbnail image", post);
  }
}

validatePosts();

ensureDir("posts");
ensureDir("category");
ensureDir("tags");
ensureDir("admin");

cleanHtmlDir("posts");
cleanHtmlDir("category");
cleanHtmlDir("tags");
cleanUtilityRedirects();

write("index.html", indexPage());
write("admin/index.html", adminPage());
writeUtilityRedirects();
for (const post of posts) {
  write(`posts/${post.slug}.html`, articlePage(post));
  for (const alias of post.aliases || []) {
    write(`posts/${alias}.html`, redirectPage(post));
  }
}

for (const category of uniqueLabelsBySlug(posts.map((post) => post.category))) {
  const categoryPosts = posts.filter((post) => post.category === category);
  write(`category/${slugify(category)}.html`, listingPage({
    title: `${category} News | Car News`,
    description: `Latest ${category} car news, India EV trends and related viral auto stories.`,
    url: `${siteUrl}/category/${slugify(category)}.html`,
    image: `${siteUrl}/${categoryPosts[0].image}`,
    items: categoryPosts,
    heading: `${category} News`
  }));
}

for (const tag of uniqueLabelsBySlug(posts.flatMap((post) => post.tags))) {
  const tagSlug = slugify(tag);
  const tagPosts = posts.filter((post) => post.tags.some((item) => slugify(item) === tagSlug));
  write(`tags/${slugify(tag)}.html`, listingPage({
    title: `${tag} | Car News`,
    description: `Articles tagged ${tag}, including India car news, EV sales and viral auto updates.`,
    url: `${siteUrl}/tags/${slugify(tag)}.html`,
    image: `${siteUrl}/${tagPosts[0].image}`,
    items: tagPosts,
    heading: tag
  }));
}

write("sitemap.xml", sitemap());
write("robots.txt", `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`);

console.log(`Built ${posts.length} posts, category pages, tag pages and sitemap.xml`);
