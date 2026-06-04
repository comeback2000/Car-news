const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const posts = JSON.parse(fs.readFileSync(path.join(root, "data", "posts.json"), "utf8").replace(/^\uFEFF/, ""));
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

function headTags({ title, description, url, image, type = "website", schema }) {
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
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(image)}">
    <link rel="stylesheet" href="${url.includes("/posts/") || url.includes("/category/") || url.includes("/tags/") ? "../styles.css" : "styles.css"}">
    ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}`;
}

function header(depth = 0) {
  return `<header class="site-header">
      <a class="brand" href="${rootHref("index.html", depth)}">Car News</a>
      <nav aria-label="Main navigation">
        <a href="${rootHref("index.html#top-stories", depth)}">Top Stories</a>
        <a href="${rootHref("tags/india-ev-sales.html", depth)}">India EV News</a>
        <a href="${rootHref("sitemap.xml", depth)}">Sitemap</a>
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
    if (pattern.test(linked)) {
      linked = linked.replace(pattern, `<a href="${post.slug}.html">$1</a>`);
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

function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
      ${items.map((item, index) => item.href
        ? `<a href="${esc(item.href)}">${esc(item.label)}</a>`
        : `<span aria-current="page">${esc(item.label)}</span>`).join("<span>/</span>")}
    </nav>`;
}

function articlePage(post) {
  const related = relatedPosts(post);
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

  return `<!doctype html>
<html lang="en">
  <head>
${headTags({ title: post.metaTitle, description: post.metaDescription, url: postUrl(post), image: `${siteUrl}/${post.image}`, type: "article", schema: [schema, breadcrumbSchema] })}
  </head>
  <body>
    ${header(1)}
    <main>
      <article class="article-body">
        <h1>${esc(post.title)}</h1>
        <figure class="article-featured-image">
          <img src="../${esc(post.image)}" alt="${esc(post.imageAlt)}" width="${featuredImage.width}" height="${featuredImage.height}" fetchpriority="high">
          ${post.imageCredit ? `<figcaption>${esc(post.imageCredit)}</figcaption>` : ""}
        </figure>
        <p class="lede article-lede">${autoLink(post.excerpt, post)}</p>
        ${post.sections.map((section) => `
        <section id="${esc(slugify(section.heading))}">
          <h2>${esc(section.heading)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${autoLink(paragraph, post)}</p>`).join("")}
          ${(section.subsections || []).map((subsection) => `
          <h3>${esc(subsection.heading)}</h3>
          ${subsection.paragraphs.map((paragraph) => `<p>${autoLink(paragraph, post)}</p>`).join("")}`).join("")}
        </section>`).join("")}
        <section>
          <h2>Conclusion</h2>
          <p>${esc(post.conclusion || "The smartest next step is to match the headline trend with real-world needs before booking or upgrading. Price, availability, service support, warranty terms and long-term usability should matter more than the first wave of hype.")}</p>
        </section>
        <section>
          <h2>Related Reading</h2>
          <p>For more context, compare this story with ${related.map((item) => `<a href="${item.slug}.html">${esc(item.title)}</a>`).join(" and ")}.</p>
        </section>
        <section>
          <h2>Sources</h2>
          <ul>
            ${post.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.label)}</a></li>`).join("")}
          </ul>
        </section>
        <section class="tag-list" aria-label="Article tags">
          ${post.tags.map((tag) => `<a href="../tags/${slugify(tag)}.html">${esc(tag)}</a>`).join("")}
        </section>
      </article>
      <section class="related-section">
        <p class="eyebrow">Related articles</p>
        <div class="story-grid related-grid">
          ${related.map((post) => storyCard(post, { depth: 1, context: "post" })).join("")}
        </div>
      </section>
    </main>
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
    ...posts.map(postUrl),
    ...categories.map((category) => `${siteUrl}/category/${slugify(category)}.html`),
    ...tags.map((tag) => `${siteUrl}/tags/${slugify(tag)}.html`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${esc(url)}</loc><lastmod>${latestDate}</lastmod><changefreq>daily</changefreq><priority>${url.endsWith("/") ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>`;
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

cleanHtmlDir("posts");
cleanHtmlDir("category");
cleanHtmlDir("tags");

write("index.html", indexPage());
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
