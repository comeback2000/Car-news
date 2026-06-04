const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const dataDir = path.join(root, "data");
const postsPath = path.join(dataDir, "posts.json");
const statePath = path.join(dataDir, "auto-publish-state.json");
const logPath = path.join(dataDir, "auto-published-log.json");
const keywordFiles = [
  path.join(root, "Keywords.txt"),
  path.join(root, "keywords.txt"),
  path.join(root, "data", "keywords.txt")
];

const dryRun = process.env.AUTO_DRY_RUN === "true" || process.argv.includes("--dry-run");
const forceWindow = process.env.AUTO_FORCE_WINDOW || "";
const publishBranch = process.env.PUBLISH_BRANCH || "main";
const pagesBranch = process.env.PAGES_BRANCH || "gh-pages";
const catchupDays = Number(process.env.AUTO_CATCHUP_DAYS || 14);
const maxWindowsPerRun = Number(process.env.AUTO_MAX_WINDOWS_PER_RUN || 8);

const schedule = [
  { id: "morning", label: "morning", hour: 9, minute: 15, count: 4 },
  { id: "afternoon", label: "afternoon", hour: 16, minute: 0, count: 4 }
];

const generatedPaths = [
  "index.html",
  "posts",
  "category",
  "tags",
  "sitemap.xml",
  "robots.txt",
  "assets",
  "data/posts.json",
  "data/auto-publish-state.json",
  "data/auto-published-log.json"
];

const imageSources = {
  mahindra: [
    "assets/mahindra-be6.jpg",
    "https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dwe95fdf3d/press-release/26nov/desktop/1.2.jpg",
    "https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dw6e27f812/press-release/26nov/desktop/1.1.jpg",
    "https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dw78666b69/press-release/26nov/desktop/4.1a.jpg",
    "https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dwe55d768e/press-release/26nov/desktop/4.1b.jpg"
  ],
  tata: [
    "assets/tata-nexon-ev.jpg",
    "https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/07/th-040725.jpg",
    "https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/06/thumb.jpg",
    "https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/02/th-280225.jpg"
  ],
  maruti: [
    "assets/suzuki-e-vitara.jpg"
  ],
  hyundai: [
    "https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/creta-electric/highlights/cretahyundai-electric-kv-pc.jpg"
  ],
  kia: [
    "https://www.kia.com/content/dam/kwcms/in/en/images/our-vehicles/carens-clavis-ev/showroom/carens-clavis-ev/kia-carens-clavis-ev-showroom-1920x1080.jpg"
  ],
  mg: [
    "https://mgmotor.scene7.com/is/image/mgmotor/hd-img-dsc-068?fit=constrain&fmt=jpg&qlt=90&resMode=bisharp&wid=1600"
  ],
  byd: [
    "https://www.byd.com/content/dam/byd-site/in/product/byd-sealion-7/gallery/BYD-SEALION-7-gallery-1.jpg"
  ]
};

const imageSourceProfiles = [
  {
    match: (lower) => lower.includes("harrier") && lower.includes("xev"),
    brand: "TATA VS MAHINDRA",
    sourceLabel: "Official Tata Harrier.ev and Mahindra XEV imagery",
    accentColor: [255, 204, 0],
    sources: [
      "https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/07/th-040725.jpg",
      "https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dw6e27f812/press-release/26nov/desktop/1.1.jpg"
    ]
  },
  {
    match: (lower) => lower.includes("curvv"),
    brand: "TATA CURVV.EV",
    sourceLabel: "Official Tata Curvv.ev vehicle imagery",
    accentColor: [0, 183, 255],
    sources: ["https://www.tatamotors.com/wp-content/uploads/2024/08/EV-Front-3-4-scaled.jpg"]
  },
  {
    match: (lower) => lower.includes("cheap") || lower.includes("affordable") || lower.includes("under"),
    brand: "MG COMET EV",
    sourceLabel: "Official MG Comet EV vehicle imagery",
    accentColor: [0, 220, 170],
    sources: ["https://mgmotor.scene7.com/is/image/mgmotor/hd-img-dsc-068?fit=constrain&fmt=jpg&qlt=90&resMode=bisharp&wid=1600"]
  },
  {
    match: (lower) => lower.includes("battery") || lower.includes("range"),
    brand: "TATA HARRIER.EV",
    sourceLabel: "Official Tata Motors Harrier.ev imagery",
    accentColor: [255, 194, 0],
    sources: ["https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/06/thumb.jpg"]
  },
  {
    match: (lower) => lower.includes("creta") || lower.includes("hyundai"),
    brand: "HYUNDAI CRETA EV",
    sourceLabel: "Official Hyundai Creta Electric imagery",
    accentColor: [0, 160, 255],
    sources: imageSources.hyundai
  },
  {
    match: (lower) => lower.includes("mg") || lower.includes("comet"),
    brand: "MG MOTOR",
    sourceLabel: "Official MG Motor EV imagery",
    accentColor: [0, 220, 170],
    sources: imageSources.mg
  },
  {
    match: (lower) => lower.includes("mahindra") || lower.includes("xev") || lower.includes("be 6") || lower.includes("be6"),
    brand: "MAHINDRA EV",
    sourceLabel: "Official Mahindra Electric Origin SUV imagery",
    accentColor: [255, 204, 0],
    sources: imageSources.mahindra
  },
  {
    match: (lower) => lower.includes("maruti") || lower.includes("vitara") || lower.includes("charging") || lower.includes("launch"),
    brand: "MARUTI SUZUKI",
    sourceLabel: "Real Suzuki e Vitara imagery",
    accentColor: [0, 128, 255],
    sources: imageSources.maruti
  },
  {
    match: (lower) => lower.includes("tata") || lower.includes("ev") || lower.includes("electric"),
    brand: "TATA EV",
    sourceLabel: "Official Tata Motors EV imagery",
    accentColor: [0, 183, 255],
    sources: imageSources.tata
  }
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
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: { ...process.env, ...(options.env || {}) }
  });
}

function gitOutput(args) {
  return run("git", args, { capture: true }).trim();
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function esc(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function istDateParts(date = new Date()) {
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return {
    date: ist.toISOString().slice(0, 10),
    minutes: ist.getUTCHours() * 60 + ist.getUTCMinutes(),
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth(),
    day: ist.getUTCDate()
  };
}

function fromIst(date, hour, minute) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0));
}

function formatIstDate(date) {
  return istDateParts(date).date;
}

function datesBetween(startDate, endDate) {
  const dates = [];
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  for (let current = start; current <= end; current = new Date(current.getTime() + 24 * 60 * 60 * 1000)) {
    dates.push(current.toISOString().slice(0, 10));
  }
  return dates.slice(-catchupDays);
}

function dueWindows(state, now = new Date()) {
  if (forceWindow) {
    const today = formatIstDate(now);
    const item = schedule.find((entry) => entry.id === forceWindow) || schedule[0];
    return [{ ...item, key: `${today}-${item.id}`, date: today, scheduledAt: fromIst(today, item.hour, item.minute).toISOString(), forced: true }];
  }

  const today = formatIstDate(now);
  const lastCheckedDate = state.lastCheckedAt ? formatIstDate(new Date(state.lastCheckedAt)) : today;
  const completed = new Set(state.completedWindows || []);
  const windows = [];

  for (const date of datesBetween(lastCheckedDate, today)) {
    for (const item of schedule) {
      const scheduledAt = fromIst(date, item.hour, item.minute);
      const key = `${date}-${item.id}`;
      if (scheduledAt <= now && !completed.has(key)) {
        windows.push({ ...item, key, date, scheduledAt: scheduledAt.toISOString() });
      }
    }
  }

  return windows.slice(0, maxWindowsPerRun);
}

function readKeywords() {
  const file = keywordFiles.find((candidate) => fs.existsSync(candidate));
  if (!file) throw new Error("Keyword file not found. Create Keywords.txt or data/keywords.txt.");
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^https?:\/\//i.test(line))
    .filter((line, index, all) => all.findIndex((item) => item.toLowerCase() === line.toLowerCase()) === index);
}

function usedKeywordSet(posts, log) {
  const used = new Set();
  for (const post of posts) {
    used.add(String(post.targetKeyword || "").toLowerCase());
    used.add(String(post.title || "").toLowerCase());
  }
  for (const entry of log) {
    used.add(String(entry.targetKeyword || "").toLowerCase());
    used.add(String(entry.slug || "").toLowerCase());
  }
  return used;
}

function chooseKeyword(keywords, state, posts, log, reserved) {
  const used = usedKeywordSet(posts, log);
  const start = Number(state.keywordCursor || 0);
  for (let offset = 0; offset < keywords.length; offset += 1) {
    const index = (start + offset) % keywords.length;
    const keyword = keywords[index];
    const key = keyword.toLowerCase();
    if (used.has(key) || reserved.has(key)) continue;
    state.keywordCursor = (index + 1) % keywords.length;
    reserved.add(key);
    return keyword;
  }
  throw new Error("No unused keywords remain in the keyword file.");
}

async function fetchNews(keyword) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${keyword} India auto car latest`)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Google News research failed for "${keyword}": ${response.status}`);
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6).map((match) => {
    const block = match[1];
    const title = esc((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
    const link = esc((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1]);
    const source = esc((block.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1]) || "Google News";
    const pubDate = esc((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]);
    return { title, link, source, pubDate };
  }).filter((item) => item.title && item.link);

  return items.length ? items : [{
    title: `${keyword} latest India auto market update`,
    link: `https://news.google.com/search?q=${encodeURIComponent(keyword)}`,
    source: "Google News",
    pubDate: new Date().toUTCString()
  }];
}

function brandFor(keyword) {
  const lower = keyword.toLowerCase();
  for (const brand of ["mahindra", "tata", "maruti", "hyundai", "kia", "mg", "byd"]) {
    if (lower.includes(brand)) return brand;
  }
  if (lower.includes("charging")) return "maruti";
  if (lower.includes("battery") || lower.includes("range")) return "tata";
  if (lower.includes("cheap") || lower.includes("under")) return "mg";
  if (lower.includes("launch") || lower.includes("upcoming")) return "maruti";
  if (lower.includes("suv")) return "hyundai";
  return lower.includes("ev") || lower.includes("electric") ? "tata" : "tata";
}

function titleFor(keyword, research) {
  const lower = keyword.toLowerCase();
  if (lower.includes("launch") || lower.includes("upcoming")) return `${keyword}: The Fresh India Launch Watch Buyers Should Track Now`;
  if (lower.includes("cost") || lower.includes("price") || lower.includes("under")) return `${keyword}: The Smart Buyer Guide Before You Book`;
  if (lower.includes("vs")) return `${keyword}: Which One Makes More Sense for Indian Buyers?`;
  if (lower.includes("news")) return `${keyword}: Latest Updates, Buyer Signals and What Changes Next`;
  return `${keyword}: What the Latest Auto News Means for Indian Buyers`;
}

function categoryFor(keyword) {
  const lower = keyword.toLowerCase();
  if (lower.includes("tata")) return "Tata Motors";
  if (lower.includes("mahindra")) return "Mahindra EVs";
  if (lower.includes("maruti")) return "Maruti Suzuki";
  if (lower.includes("hyundai")) return "Hyundai India";
  if (lower.includes("kia")) return "Kia India";
  if (lower.includes("mg")) return "MG Motor India";
  if (lower.includes("byd")) return "BYD India";
  if (lower.includes("ev") || lower.includes("electric")) return "EV Buying Guides";
  return "India Car News";
}

function tagsFor(keyword) {
  const lower = keyword.toLowerCase();
  const tags = [keyword, "India car news"];
  if (lower.includes("ev") || lower.includes("electric")) tags.push("Electric SUV India", "EV buying guide");
  if (lower.includes("tata")) tags.push("Tata Motors");
  if (lower.includes("mahindra")) tags.push("Mahindra EVs");
  if (lower.includes("maruti")) tags.push("Maruti Suzuki");
  if (lower.includes("launch") || lower.includes("upcoming")) tags.push("New car launch India");
  return [...new Set(tags)].slice(0, 5);
}

function sourceSummary(research) {
  return research.slice(0, 4).map((item) => `${item.source}: ${item.title}`).join(" | ");
}

function makeArticle(keyword, research, datePublished, existingSlugs) {
  const baseSlug = slugify(keyword);
  let slug = baseSlug;
  let suffix = 2026;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  existingSlugs.add(slug);

  const title = titleFor(keyword, research);
  const category = categoryFor(keyword);
  const tags = tagsFor(keyword);
  const latestSignals = sourceSummary(research);
  const metaDescription = `${keyword} update for India: latest news signals, buyer intent, launch context, rivals and practical checks before booking.`;

  return {
    slug,
    aliases: [],
    targetKeyword: keyword,
    title,
    metaTitle: `${keyword} India Update 2026 | Car News`,
    metaDescription: metaDescription.slice(0, 155),
    excerpt: `${keyword} is drawing fresh attention as recent India auto news points to new buyer questions around price, timing, range, service support and rivals.`,
    category,
    tags,
    image: `assets/${slug}-thumbnail.jpg`,
    imageAlt: `${keyword} thumbnail for latest India car news update`,
    imageCredit: `Thumbnail: Car News uses real ${brandFor(keyword)} vehicle imagery matched to the article topic.`,
    author: "Car News Desk",
    datePublished,
    dateModified: datePublished,
    sources: research.slice(0, 5).map((item) => ({ label: `${item.source}: ${item.title}`.slice(0, 120), url: item.link })),
    sections: [
      {
        heading: `${keyword}: Why This Topic Is Trending Now`,
        paragraphs: [
          `${keyword} has become a useful search for Indian car buyers because the latest news cycle is no longer only about one headline. It is about how launch timing, pricing, charging confidence, service reach and rival models come together before a buyer makes a booking decision.`,
          `Current Google News signals for this topic include ${latestSignals}. Those reports point to active market interest, but this article focuses on the buyer impact rather than repeating the news copy.`
        ],
        subsections: [{
          heading: "Search intent: what readers want answered",
          paragraphs: [
            `Most readers searching ${keyword} want a quick but practical answer: what changed, which models are affected, how soon it matters, and whether the latest update should change their shortlist.`
          ]
        }]
      },
      {
        heading: `What ${keyword} Means for Indian Buyers`,
        paragraphs: [
          `For buyers, the strongest takeaway is to compare the headline with real ownership needs. A viral launch or sales report is useful only when it translates into easier availability, clearer pricing, dependable charging or service support, and a model that fits daily use.`,
          `The India market is moving quickly, especially around EVs and SUVs. That means shoppers should track official prices, delivery dates, warranty terms, charger installation cost and early owner feedback before treating any new update as a final buying recommendation.`
        ],
        subsections: [{
          heading: "The practical checklist",
          paragraphs: [
            `Before booking around ${keyword}, compare on-road price, waiting period, real-world range or mileage, service-center access, insurance cost, resale confidence and how the vehicle fits your city and highway driving pattern.`
          ]
        }]
      },
      {
        heading: `${keyword} Rivals and Market Impact`,
        paragraphs: [
          `The competitive pressure is rising because Tata, Mahindra, Maruti Suzuki, Hyundai, Kia, MG and BYD are all using different strengths. Some are leaning on service reach, some on aggressive pricing, and others on design, range or premium cabin technology.`,
          `That makes ${keyword} more than a single article topic. It is part of a broader India car market shift where buyers expect launches to come with a complete ownership story, not just attractive specifications.`
        ],
        subsections: [{
          heading: "Buyer takeaway",
          paragraphs: [
            `Shortlist two or three models, test drive them on the same day if possible, and compare the total ownership package. The best choice is the one that handles your daily use with the least compromise, not only the one getting the most attention online.`
          ]
        }]
      }
    ]
  };
}

async function downloadFile(url, file) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(file, bytes);
}

function imageSourceKey(sources) {
  return sources.map((source) => path.basename(String(source).split("?")[0]).toLowerCase()).join("+");
}

function sourceCandidatesFor(keyword, post, posts) {
  const lower = keyword.toLowerCase();
  const usedSourceKeys = new Set(posts.map((item) => item.imageSourceKey).filter(Boolean));
  const profiles = imageSourceProfiles.filter((profile) => profile.match(lower));
  const fallback = imageSourceProfiles.find((profile) => profile.match("tata ev"));
  const candidates = [...profiles, fallback].filter(Boolean).map((profile) => ({
    ...profile,
    sources: [...new Set(profile.sources.filter(Boolean))]
  }));

  return candidates.filter((candidate) => candidate.sources.length && !usedSourceKeys.has(imageSourceKey(candidate.sources)));
}

function createThumbnailWithPython(post, keyword, profile, sourceFiles, publishedHashes) {
  const helper = path.join(root, "scripts", "create-auto-thumbnail.py");
  const payload = {
    sourceFile: sourceFiles[0],
    sourceFiles,
    outputFile: path.join(root, post.image),
    keyword,
    headline: keyword.toUpperCase(),
    deck: profile.brand.toUpperCase(),
    sourceLabel: profile.sourceLabel,
    accentColor: profile.accentColor,
    slug: post.slug,
    layoutVariant: [...post.slug].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0) % 4,
    publishedHashes: [...publishedHashes]
  };
  const payloadFile = path.join(root, "data", ".thumbnail-payload.json");
  fs.writeFileSync(payloadFile, JSON.stringify(payload), "utf8");
  try {
    run("python", [helper, payloadFile]);
  } finally {
    fs.rmSync(payloadFile, { force: true });
  }
}

async function createThumbnail(post, keyword, posts) {
  const publishedHashes = new Set(posts
    .map((item) => path.join(root, item.image || ""))
    .filter((file) => fs.existsSync(file))
    .map(hashFile));

  let selectedProfile = null;
  let sourceFiles = [];
  const tempFiles = [];
  for (const candidate of sourceCandidatesFor(keyword, post, posts)) {
    sourceFiles = [];
    tempFiles.length = 0;
    try {
      for (const [index, source] of candidate.sources.entries()) {
        if (/^https?:\/\//i.test(source)) {
          const temp = path.join(root, "assets", `.${post.slug}-source-${index}.jpg`);
          await downloadFile(source, temp);
          tempFiles.push(temp);
          sourceFiles.push(temp);
        } else {
          sourceFiles.push(path.join(root, source));
        }
      }
      if (sourceFiles.every((file) => fs.existsSync(file))) {
        selectedProfile = candidate;
        break;
      }
    } catch {
      for (const temp of tempFiles) fs.rmSync(temp, { force: true });
      sourceFiles = [];
    }
  }

  if (!selectedProfile || !sourceFiles.length) {
    throw new Error(`No real manufacturer vehicle image could be resolved for "${keyword}".`);
  }

  post.imageSourceKey = imageSourceKey(selectedProfile.sources);
  post.imageSourceLabel = selectedProfile.sourceLabel;
  post.imageCredit = `Thumbnail: Car News graphic using ${selectedProfile.sourceLabel}.`;
  post.imageAlt = `${keyword} thumbnail using real vehicle imagery for India car buyers`;

  createThumbnailWithPython(post, keyword, selectedProfile, sourceFiles, publishedHashes);
  for (const temp of tempFiles) fs.rmSync(temp, { force: true });

  const outputFile = path.join(root, post.image);
  const outputHash = hashFile(outputFile);
  if (publishedHashes.has(outputHash)) {
    throw new Error(`Generated thumbnail duplicates a previous image: ${post.image}`);
  }
}

function isManagedPath(file) {
  return generatedPaths.some((managed) => file === managed || file.startsWith(`${managed}/`));
}

function dirtyTrackedFilesOutsideManagedPaths() {
  const status = run("git", ["status", "--porcelain", "--untracked-files=no"], { capture: true }).trimEnd();
  if (!status) return [];
  return status
    .split(/\r?\n/)
    .map((line) => line.slice(3).replace(/^"|"$/g, ""))
    .map((file) => file.includes(" -> ") ? file.split(" -> ").pop() : file)
    .filter((file) => !isManagedPath(file) && !file.startsWith("data/facebook-"));
}

function commitAndPush(windowInfo, slugs) {
  run("node", ["scripts/build-site.js"]);
  run("git", ["add", "-A", ...generatedPaths]);
  const staged = gitOutput(["diff", "--cached", "--name-only"]);
  if (!staged) {
    console.log("No generated changes to commit.");
    return null;
  }
  const message = `Auto publish ${windowInfo.label} batch: ${slugs.join(", ")}`.slice(0, 180);
  run("git", ["commit", "-m", message]);
  const commit = gitOutput(["rev-parse", "--short", "HEAD"]);
  run("git", ["push", "origin", `HEAD:${publishBranch}`]);
  run("git", ["push", "origin", `HEAD:${pagesBranch}`]);
  return commit;
}

function publishFacebook(slug) {
  try {
    run("node", ["scripts/FB_Post.js"], {
      env: {
        FB_ONLY_SLUG: slug,
        FB_FORCE_DUE: "true",
        FB_MAX_POSTS_PER_RUN: "1",
        FB_DRY_RUN: process.env.FB_DRY_RUN || "false"
      }
    });
    return { status: process.env.FB_DRY_RUN === "true" ? "dry_run" : "published" };
  } catch (error) {
    return { status: "failed", message: error.message };
  }
}

async function publishWindow(windowInfo, context) {
  const { posts, log, state, keywords } = context;
  const existingSlugs = new Set(posts.map((post) => post.slug));
  const reservedKeywords = new Set();
  const newPosts = [];
  const today = windowInfo.date;

  for (let index = 0; index < windowInfo.count; index += 1) {
    const keyword = chooseKeyword(keywords, state, posts, log, reservedKeywords);
    const research = await fetchNews(keyword);
    const post = makeArticle(keyword, research, today, existingSlugs);
    if (!dryRun) {
      await createThumbnail(post, keyword, [...posts, ...newPosts]);
    }
    newPosts.push(post);
  }

  if (dryRun) {
    console.log(`[DRY RUN] ${windowInfo.key}: would publish ${newPosts.length} article(s): ${newPosts.map((post) => post.targetKeyword).join(", ")}`);
    return;
  }

  for (const post of newPosts.reverse()) {
    posts.unshift(post);
  }

  const slugs = newPosts.map((post) => post.slug);
  const logEntry = {
    windowKey: windowInfo.key,
    scheduledAt: windowInfo.scheduledAt,
    publishedAt: new Date().toISOString(),
    articleCount: newPosts.length,
    articles: newPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      targetKeyword: post.targetKeyword,
      url: `${siteUrl}/posts/${post.slug}.html`,
      image: post.image
    })),
    facebook: []
  };

  writeJson(postsPath, posts);
  writeJson(statePath, state);
  log.unshift(logEntry);
  writeJson(logPath, log);

  const commit = commitAndPush(windowInfo, slugs);
  logEntry.commit = commit;

  for (const post of newPosts) {
    const result = publishFacebook(post.slug);
    logEntry.facebook.push({ slug: post.slug, ...result, postedAt: new Date().toISOString() });
  }

  state.completedWindows = [...new Set([...(state.completedWindows || []), windowInfo.key])].slice(-120);
  state.lastSuccessfulWindow = windowInfo.key;
  state.lastCheckedAt = new Date().toISOString();
  writeJson(statePath, state);
  writeJson(logPath, log);
  console.log(`Published ${newPosts.length} article(s) for ${windowInfo.key}.`);
}

async function main() {
  fs.mkdirSync(path.join(root, "assets"), { recursive: true });
  const posts = readJson(postsPath, []);
  const state = readJson(statePath, {
    keywordCursor: 0,
    completedWindows: [],
    lastCheckedAt: null,
    lastSuccessfulWindow: null
  });
  const log = readJson(logPath, []);
  const keywords = readKeywords();
  const windows = dueWindows(state);

  if (!windows.length) {
    if (!dryRun) {
      state.lastCheckedAt = new Date().toISOString();
      writeJson(statePath, state);
    }
    console.log("No auto-publish windows are due right now.");
    return;
  }

  const dirtyOutsideManagedPaths = dirtyTrackedFilesOutsideManagedPaths();
  if (!dryRun && dirtyOutsideManagedPaths.length) {
    throw new Error(`Tracked files outside auto-publisher paths have local changes: ${dirtyOutsideManagedPaths.join(", ")}.`);
  }

  for (const windowInfo of windows) {
    await publishWindow(windowInfo, { posts, log, state, keywords });
    if (dryRun) break;
  }

  if (!dryRun) {
    state.lastCheckedAt = new Date().toISOString();
    writeJson(statePath, state);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
