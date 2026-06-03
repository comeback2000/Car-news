const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const posts = JSON.parse(fs.readFileSync(path.join(root, "data", "posts.json"), "utf8"));

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
  const toc = post.sections.map((section) => ({ id: slugify(section.heading), heading: section.heading }));
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
      <section class="article-hero">
        <div class="article-layout">
          <div>
            <img src="../${esc(post.image)}" alt="${esc(post.imageAlt)}" width="1600" height="900" fetchpriority="high">
            <p class="image-credit">${esc(post.imageCredit)}</p>
          </div>
          <div class="article-copy">
            ${breadcrumb([
              { label: "Home", href: "../index.html" },
              { label: post.category, href: `../category/${slugify(post.category)}.html` },
              { label: post.title }
            ])}
            <p class="eyebrow">${esc(post.category)}</p>
            <h1>${esc(post.title)}</h1>
            <p class="meta">By ${esc(post.author)} | ${esc(post.datePublished)}</p>
            <p class="lede article-lede">${autoLink(post.excerpt, post)}</p>
          </div>
        </div>
      </section>

      <article class="article-body">
        <aside class="toc" aria-label="Table of contents">
          <p class="toc-title">Table of Contents</p>
          ${toc.map((item) => `<a href="#${esc(item.id)}">${esc(item.heading)}</a>`).join("")}
        </aside>
        ${post.sections.map((section) => `
        <section id="${esc(slugify(section.heading))}">
          <h2>${esc(section.heading)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${autoLink(paragraph, post)}</p>`).join("")}
        </section>`).join("")}
        <section>
          <h2>${esc(post.targetKeyword)}: Related Reading</h2>
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
    <footer class="site-footer">
      <p>Updated June 3, 2026. SEO metadata, related posts, category pages, tags and sitemap are generated automatically.</p>
    </footer>
  </body>
</html>`;
}

function storyCard(post, options = {}) {
  const { depth = 0, context = "root" } = options;
  const href = context === "post" ? `${post.slug}.html` : rootHref(`posts/${post.slug}.html`, depth);
  const image = rootHref(post.image, depth);
  return `<article class="story-card">
          <a href="${href}">
            <img src="${image}" alt="${esc(post.imageAlt)}" width="1600" height="900" loading="lazy">
            <div class="story-body">
              <p class="tag">${esc(post.category)}</p>
              <h3>${esc(post.title)}</h3>
              <p>${esc(post.excerpt)}</p>
            </div>
          </a>
        </article>`;
}

function indexPage() {
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
        <div class="hero-graphics" aria-hidden="true">
          <span class="signal signal-one"></span>
          <span class="signal signal-two"></span>
          <span class="signal signal-three"></span>
          <span class="sweep-line"></span>
        </div>
        <div class="hero-copy">
          <p class="eyebrow">Latest viral India auto posts | June 3, 2026</p>
          <div class="hero-title-wrap">
            <p class="hero-kicker">Trending now</p>
            <h1 id="viralHeroTitle">${esc(posts[0].title)}</h1>
          </div>
        </div>
        <div class="viral-stack" aria-label="Most viral story links">
          ${posts.map((post, index) => `<a class="viral-card${index === 0 ? " is-active" : ""}" href="posts/${post.slug}.html" data-title="${esc(post.title)}">
            <span class="rank">${String(index + 1).padStart(2, "0")}</span>
            <span class="viral-title">${esc(post.title)}</span>
          </a>`).join("")}
        </div>
      </section>

      <section class="section-heading" id="top-stories">
        <p class="eyebrow">Top 3 car news posts</p>
      </section>
      <section class="story-grid" aria-label="Top car news stories">
        ${posts.map((post) => storyCard(post)).join("")}
      </section>
    </main>
    <footer class="site-footer">
      <p>Updated June 3, 2026. Trend cues from public X search, Google search, and current India auto reports; sources are linked in each post.</p>
    </footer>
    <script>
      const viralCards = Array.from(document.querySelectorAll(".viral-card"));
      const heroTitle = document.getElementById("viralHeroTitle");
      let activeStory = 0;
      function setActiveStory(index) {
        activeStory = index % viralCards.length;
        viralCards.forEach((card, cardIndex) => card.classList.toggle("is-active", cardIndex === activeStory));
        heroTitle.classList.remove("title-pop");
        heroTitle.textContent = viralCards[activeStory].dataset.title;
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

function sitemap() {
  const urls = [
    `${siteUrl}/`,
    ...posts.map(postUrl),
    ...[...new Set(posts.map((post) => post.category))].map((category) => `${siteUrl}/category/${slugify(category)}.html`),
    ...[...new Set(posts.flatMap((post) => post.tags))].map((tag) => `${siteUrl}/tags/${slugify(tag)}.html`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${esc(url)}</loc><lastmod>2026-06-03</lastmod><changefreq>daily</changefreq><priority>${url.endsWith("/") ? "1.0" : "0.8"}</priority></url>`).join("\n")}
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
  fs.writeFileSync(path.join(root, file), content.trimStart(), "utf8");
}

ensureDir("posts");
ensureDir("category");
ensureDir("tags");

for (const stale of fs.readdirSync(path.join(root, "posts")).filter((file) => file.endsWith(".html"))) {
  fs.unlinkSync(path.join(root, "posts", stale));
}

write("index.html", indexPage());
for (const post of posts) {
  write(`posts/${post.slug}.html`, articlePage(post));
  for (const alias of post.aliases || []) {
    write(`posts/${alias}.html`, redirectPage(post));
  }
}

for (const category of [...new Set(posts.map((post) => post.category))]) {
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

for (const tag of [...new Set(posts.flatMap((post) => post.tags))]) {
  const tagPosts = posts.filter((post) => post.tags.includes(tag));
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
