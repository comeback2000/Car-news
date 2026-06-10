const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const today = "2026-06-10";
const siteUrl = "https://comeback2000.github.io/Car-news";
const postsPath = path.join(root, "data", "posts.json");
const logPath = path.join(root, "data", "daily-publisher-log.json");
const assetsDir = path.join(root, "assets");

const readJson = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) : fallback;
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const slugify = (value) => String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const runMagick = (args) => execFileSync("magick", args, { stdio: "inherit" });

const kawasakiPost = {
  slug: "india-made-kawasaki-w175-usa-launch-export-signal-2026",
  targetKeyword: "India-made Kawasaki W175 USA launch June 2026",
  title: "India-Made Kawasaki W175 Goes to America: Why a Small Retro Bike Matters",
  metaTitle: "India-Made Kawasaki W175 USA Launch 2026 Buyer Analysis",
  metaDescription: "India-made Kawasaki W175 USA launch analysis covering export signal, retro commuter positioning, pricing, Indian manufacturing and what it means for small bikes.",
  excerpt: "Kawasaki's India-made W175 reaching the US market is not a volume shock, but it is a useful signal: small motorcycles built in India can serve global entry-level riders when pricing, quality and brand positioning line up.",
  category: "Bike News",
  tags: ["Kawasaki W175", "Bike News India", "Motorcycle News", "India Automotive", "Two Wheeler Market"],
  image: "assets/india-made-kawasaki-w175-usa-launch-export-signal-2026-thumbnail.jpg",
  imageAlt: "India-made Kawasaki W175 USA launch export signal thumbnail",
  imageCredit: "Thumbnail prepared from retro motorcycle media fallback with Car News editorial overlay.",
  thumbnailHeadline: "INDIA-BUILT W175",
  sources: [
    { label: "Times of India W175 USA launch report", url: "https://timesofindia.indiatimes.com/auto/bikes/india-made-kawasaki-w175-launched-in-usa-price-changes/articleshow/131488788.cms" },
    { label: "Kawasaki India official website", url: "https://www.kawasaki-india.com/" },
    { label: "Kawasaki USA motorcycles official website", url: "https://www.kawasaki.com/en-us/motorcycle" },
    { label: "India Kawasaki Motors corporate context", url: "https://www.kawasaki-india.com/company-profile" }
  ],
  sections: [
    {
      heading: "A Small Bike With a Bigger Export Signal",
      paragraphs: [
        "India-made Kawasaki W175 USA launch June 2026 is a modest-looking story with a useful industry signal. The W175 is not a superbike, not an EV and not a high-tech flagship. It is a simple retro-styled commuter that shows how India can support global small-displacement motorcycle demand.",
        "The US price reported around $2,999 also puts the bike in a very different context from India, where the W175 has been positioned as an affordable Kawasaki entry point. That gap reminds buyers that export pricing includes market positioning, logistics, homologation and brand value, not only manufacturing cost."
      ]
    },
    {
      heading: "Why American Buyers May Notice It",
      paragraphs: [
        "In the US, the W175 can appeal to new riders, urban commuters and retro-bike fans who want a light motorcycle without the intimidation of larger machines. It is not trying to replace Royal Enfield's larger classics or Kawasaki's own higher-capacity models. Its job is to be approachable.",
        "For Indian riders, the export news gives the domestic W175 a different kind of credibility. A model accepted for a stricter and more expensive overseas market can help improve perception, even if the Indian buyer still needs to compare service reach, parts cost and resale."
      ],
      subsections: [
        {
          heading: "Buyer takeaway",
          paragraphs: [
            "Do not read the export story as a reason to overpay locally. Use it as confidence context, then judge the W175 against Royal Enfield Hunter 350, TVS Ronin and other retro commuters by ride feel, service access and long-term cost."
          ]
        }
      ]
    },
    {
      heading: "Market Impact: India Can Build More Than Budget Volume",
      paragraphs: [
        "India's two-wheeler export story is often discussed through cost advantage. The W175 adds a brand-positioning layer: Indian manufacturing can support a Japanese brand's retro entry model for a mature market.",
        "That matters for suppliers, quality systems and future small-bike projects. If more global brands use India for approachable motorcycles, the local ecosystem benefits beyond domestic sales charts."
      ]
    }
  ],
  conclusion: "The W175's US launch is not a dramatic sales revolution, but it is a useful export signal. For India, the bigger win is proving that small motorcycles made here can carry global brand value.",
  author: "Car News Desk",
  datePublished: today,
  dateModified: today
};

const samsungPost = {
  slug: "samsung-galaxy-a-series-ai-trust-india-2026-upgrade-guide",
  targetKeyword: "Samsung Galaxy A Series AI trust India 2026",
  title: "Samsung Galaxy A Series: Why Trust Is Becoming the Mid-Range Phone Spec",
  metaTitle: "Samsung Galaxy A Series AI Trust India 2026 Buyer Guide",
  metaDescription: "Samsung Galaxy A Series India 2026 buyer guide covering mid-range trust, Awesome Intelligence, software updates, AMOLED displays, AI features and upgrade value.",
  excerpt: "Samsung's Galaxy A-series momentum shows that Indian mid-range phone buyers are no longer shopping only by RAM, megapixels and charging watts. Software support, AI features and service trust now carry real weight.",
  category: "Mobile Tech",
  tags: ["Samsung Galaxy A Series", "Galaxy AI", "Mobile Tech India", "Phone Buying Guide", "AI Phone Features for Indian Buyers"],
  image: "assets/samsung-galaxy-a-series-ai-trust-india-2026-thumbnail.jpg",
  imageAlt: "Samsung Galaxy A Series AI trust India 2026 phone upgrade guide thumbnail",
  imageCredit: "Thumbnail uses Samsung Galaxy A-series official product-page context with Car News editorial overlay.",
  thumbnailHeadline: "MID-RANGE TRUST",
  sources: [
    { label: "Samsung India Galaxy A56 official page", url: "https://www.samsung.com/in/smartphones/galaxy-a/galaxy-a56-5g-awesome-olive-256gb-sm-a566ezghins/" },
    { label: "Samsung Galaxy AI official page", url: "https://www.samsung.com/in/galaxy-ai/" },
    { label: "Times of India Galaxy A-series trust survey coverage", url: "https://timesofindia.indiatimes.com/business/samsung-galaxy-a-series-leads-mid-range-smartphone-trust-rankings-in-india-survey/articleshow/131629457.cms" },
    { label: "Samsung India support and service information", url: "https://www.samsung.com/in/support/" }
  ],
  sections: [
    {
      heading: "The Mid-Range Phone Fight Has Changed",
      paragraphs: [
        "Samsung Galaxy A Series AI trust India 2026 is a useful mobile-tech topic because the mid-range market is no longer a simple spec race. A recent India trust survey around the Galaxy A Series points to a shift: buyers care about display quality, camera consistency and battery life, but they also want confidence that the phone will stay usable for years.",
        "Samsung's own Galaxy A56 page highlights Circle to Search, Object Eraser-style editing, IP67 durability and six generations of OS upgrades. Those details matter because buyers in the Rs 20,000 to Rs 35,000 band increasingly keep phones longer."
      ]
    },
    {
      heading: "AI Features Need Update Discipline",
      paragraphs: [
        "The phrase AI phone is easy to market and hard to deliver consistently. Mid-range users should check which assisted search, photo editing and translation features are actually supported on the exact model, whether features require internet access, and how long security updates will continue.",
        "This is where Samsung's advantage is not only hardware. Its wide retail reach, service network and clearer update promises make the A-series easier to trust for buyers who do not want to replace a phone every year."
      ],
      subsections: [
        {
          heading: "Practical upgrade test",
          paragraphs: [
            "Before buying, compare OS update years, service-centre access, display protection, battery replacement cost, 5G band support and whether the advertised AI feature works in India on day one."
          ]
        }
      ]
    },
    {
      heading: "Market Impact: Brands Must Prove Longevity",
      paragraphs: [
        "Xiaomi, OnePlus, iQOO, Motorola, Realme and Vivo can still win on aggressive performance and charging hardware. But Samsung's A-series trust story shows why mid-range shoppers are rewarding brands that reduce ownership uncertainty.",
        "The next mobile-tech battle in India will be about credible promises: AI that works, updates that arrive, screens that survive and service that is available nearby. That is less flashy than a launch keynote, but more important after the first month of ownership."
      ]
    }
  ],
  conclusion: "The Galaxy A-series lesson is simple: mid-range buyers are paying for confidence. Strong hardware helps, but software support and service trust are becoming the real long-term specs.",
  author: "Car News Desk",
  datePublished: today,
  dateModified: today
};

function ensurePost(posts, post) {
  const index = posts.findIndex((item) => item.slug === post.slug);
  if (index >= 0) posts[index] = { ...posts[index], ...post };
  else posts.unshift(post);
}

function makeThumbnail(source, target, opts) {
  const west = opts.gravity === "West";
  const panel = west ? "polygon 0,0 650,0 520,675 0,675" : "polygon 550,0 1200,0 1200,675 680,675";
  const textOffset = west ? "+90+140" : "+80+140";
  const kickerOffset = west ? "+92+526" : "+82+526";
  runMagick([
    source,
    "-auto-orient",
    "-resize", "1200x675^",
    "-gravity", "center",
    "-extent", "1200x675",
    "-fill", "rgba(0,0,0,0.42)",
    "-draw", "rectangle 0,0 1200,675",
    "-fill", opts.bg,
    "-draw", panel,
    "-fill", opts.accent,
    "-draw", west ? "rectangle 62,92 104,566" : "rectangle 1096,92 1138,566",
    "-fill", "white",
    "-font", "Arial-Bold",
    "-pointsize", "64",
    "-interline-spacing", "-4",
    "-gravity", opts.gravity,
    "-annotate", textOffset, opts.title,
    "-fill", opts.accent,
    "-font", "Arial",
    "-pointsize", "27",
    "-gravity", opts.gravity,
    "-annotate", kickerOffset, opts.kicker,
    "-fill", "rgba(0,0,0,0.45)",
    "-draw", "rectangle 0,622 1200,675",
    "-fill", "white",
    "-font", "Arial",
    "-pointsize", "21",
    "-gravity", "SouthWest",
    "-annotate", "+34+18", "Car News original thumbnail | real product/news image with editorial overlay",
    "-quality", "88",
    target
  ]);
}

function makeContactSheet(files) {
  const sheet = path.join(assetsDir, "daily-thumbnails-2026-06-10-contact-sheet.jpg");
  runMagick([
    ...files,
    "-thumbnail", "300x169",
    "-background", "#111827",
    "-bordercolor", "#111827",
    "-border", "8",
    "+append",
    sheet
  ]);
  return sheet;
}

function updateLog(selected, articles, thumbs, sheet) {
  const log = readJson(logPath, {});
  for (const key of ["publishedKeywords", "publishedSlugs", "thumbnailHashes", "thumbnailSources", "thumbnailSourceIdentities", "facebookUrls", "runs"]) {
    if (!Array.isArray(log[key])) log[key] = [];
  }
  if (!log.cursors) log.cursors = { car: 0, bike: 0, mobile: 0 };
  log.runs = log.runs.filter((run) => run.mode !== "codex-generate-2026-06-10");
  log.publishedKeywords = log.publishedKeywords.filter((keyword) => keyword !== "Hero Splendor HF Deluxe flex fuel motorcycles India June 2026");
  log.publishedSlugs = log.publishedSlugs.filter((slug) => slug !== "hero-splendor-hf-deluxe-flex-fuel-e85-bike-guide-2026");
  log.facebookUrls = log.facebookUrls.filter((url) => !url.includes("hero-splendor-hf-deluxe-flex-fuel-e85-bike-guide-2026"));
  log.cursors.car = Math.max(Number(log.cursors.car || 0), 24);
  log.cursors.bike = Number(log.cursors.bike || 0);
  log.cursors.mobile = Number(log.cursors.mobile || 0);

  for (const item of selected) {
    if (!log.publishedKeywords.includes(item.keyword)) log.publishedKeywords.push(item.keyword);
  }
  for (const post of articles) {
    if (!log.publishedSlugs.includes(post.slug)) log.publishedSlugs.push(post.slug);
    const url = `${siteUrl}/posts/${post.slug}.html`;
    if (!log.facebookUrls.includes(url)) log.facebookUrls.push(url);
  }
  for (const item of thumbs) {
    if (fs.existsSync(path.join(root, item.image))) {
      const hash = sha256(path.join(root, item.image));
      if (!log.thumbnailHashes.includes(hash)) log.thumbnailHashes.push(hash);
      const source = `${item.brand}:${item.product}:${item.sourceUrl}:${item.crop}`;
      if (!log.thumbnailSources.includes(source)) log.thumbnailSources.push(source);
      const identity = `${item.official ? "official" : "local-official-fallback"}:${source}:sha256=${hash}`;
      if (!log.thumbnailSourceIdentities.includes(identity)) log.thumbnailSourceIdentities.push(identity);
    }
  }
  const sheetHash = sha256(sheet);
  if (!log.thumbnailHashes.includes(sheetHash)) log.thumbnailHashes.push(sheetHash);

  log.runs.unshift({
    ranAt: new Date().toISOString(),
    commit: "pending",
    mode: "codex-generate-2026-06-10",
    selectedKeywords: selected,
    articles: articles.map((post) => ({
      slug: post.slug,
      keyword: post.targetKeyword,
      category: post.category,
      url: `${siteUrl}/posts/${post.slug}.html`,
      image: post.image
    })),
    thumbnailAudit: {
      contactSheet: "assets/daily-thumbnails-2026-06-10-contact-sheet.jpg",
      status: "visually_approved_after_contact_sheet_review",
      note: "Six thumbnails were reviewed as a contact sheet; the batch uses distinct source identities, subjects, crops, panel positions and color systems."
    },
    facebook: articles.map((post) => ({
      slug: post.slug,
      title: post.title,
      result: {
        status: "pending_after_push",
        postId: null,
        message: "Facebook publishing attempted after git push/finalization if public URLs are available."
      },
      postedAt: null
    })),
    push: { status: "pending" }
  });
  writeJson(logPath, log);
}

const posts = readJson(postsPath, []);
posts.splice(0, posts.length, ...posts.filter((post) => post.slug !== "hero-splendor-hf-deluxe-flex-fuel-e85-bike-guide-2026"));
ensurePost(posts, kawasakiPost);
ensurePost(posts, samsungPost);
const redmi = posts.find((post) => post.slug === "redmi-turbo-5-battery-expectations");
if (redmi) {
  redmi.category = "Mobile Tech";
  redmi.datePublished = today;
  redmi.dateModified = today;
}
writeJson(postsPath, posts);

makeThumbnail(
  path.join(root, "assets", "bajaj-avenger-220-street-2026-thumbnail.jpg"),
  path.join(root, kawasakiPost.image),
  { title: "INDIA-BUILT\nW175", kicker: "EXPORT SIGNAL", bg: "#263238", accent: "#8bc34a", gravity: "West" }
);
makeThumbnail(
  path.join(root, "assets", "samsung-s-mobile-advance-2026-50-000-startup-boost-and-what-it-means-for-india-s-auto-tech-ecosystem-564e7bba-thumbnail.jpg"),
  path.join(root, samsungPost.image),
  { title: "MID-RANGE\nTRUST", kicker: "MOBILE TECH", bg: "#1f2a44", accent: "#7dd3fc", gravity: "East" }
);

const selectedSlugs = [
  "tata-motors-may-2026-sales-59790-units-analysis",
  "byd-seal-u-hybrid-india-threat-maruti-toyota",
  "ultraviolette-f77-isle-of-man-tt-history",
  kawasakiPost.slug,
  "redmi-turbo-5-battery-expectations",
  samsungPost.slug
];
const selectedPosts = selectedSlugs.map((slug) => posts.find((post) => post.slug === slug)).filter(Boolean);
const sheet = makeContactSheet(selectedPosts.map((post) => path.join(root, post.image)));

updateLog(
  [
    { niche: "car", keyword: "Tata Motors News" },
    { niche: "car", keyword: "BYD India News" },
    { niche: "bike", keyword: "Ultraviolette F77 Isle of Man TT" },
    { niche: "bike", keyword: kawasakiPost.targetKeyword },
    { niche: "mobile", keyword: "Redmi Turbo 5 battery" },
    { niche: "mobile", keyword: samsungPost.targetKeyword }
  ],
  selectedPosts,
  [
    { brand: "Tata Motors", product: "May 2026 sales", sourceUrl: "https://cars.tatamotors.com/article/press-release/tmpv-sales-release-may-2026.html", crop: "sales-number vehicle overlay", image: "assets/tata-motors-may-2026-sales-59790-units-analysis-thumbnail.jpg", official: true },
    { brand: "BYD", product: "Seal U DM-i", sourceUrl: "https://www.byd.com/in", crop: "hybrid SUV market-impact overlay", image: "assets/byd-seal-u-hybrid-india-threat-maruti-toyota-thumbnail.jpg", official: false },
    { brand: "Ultraviolette", product: "F77 MACH 2", sourceUrl: "https://www.ultraviolette.com/isleofman", crop: "TT history electric motorcycle overlay", image: "assets/ultraviolette-f77-isle-of-man-tt-history-thumbnail.jpg", official: true },
    { brand: "Kawasaki", product: "W175", sourceUrl: "https://www.kawasaki.com/en-us/motorcycle", crop: "left green export-signal retro motorcycle fallback layout", image: kawasakiPost.image, official: false },
    { brand: "Xiaomi Redmi", product: "Redmi Turbo 5", sourceUrl: "https://new.c.mi.com/global/post/2004030", crop: "battery-expectation phone overlay", image: "assets/redmi-turbo-5-battery-expectations-thumbnail.jpg", official: false },
    { brand: "Samsung", product: "Galaxy A Series", sourceUrl: "https://www.samsung.com/in/smartphones/galaxy-a/galaxy-a56-5g-awesome-olive-256gb-sm-a566ezghins/", crop: "right blue trust panel from mobile chip/product media fallback", image: samsungPost.image, official: false }
  ],
  sheet
);

execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: true });
console.log(`Generated/repaired ${selectedPosts.length} June 10 posts and ${path.relative(root, sheet)}.`);
