const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const today = "2026-06-07";
const siteUrl = "https://comeback2000.github.io/Car-news";
const postsPath = path.join(root, "data", "posts.json");
const logPath = path.join(root, "data", "daily-publisher-log.json");

const readJson = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) : fallback;
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const slugify = (value) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const selections = [
  { niche: "car", keyword: "Best SUV Under 15 Lakhs" },
  { niche: "car", keyword: "Electric Car vs Petrol Car" },
  { niche: "bike", keyword: "Hero VIDA VX2 electric scooter battery rental India" },
  { niche: "bike", keyword: "Royal Enfield Hunter 350 2026 update" },
  { niche: "mobile", keyword: "Apple WWDC 2026 AI iPhone India" },
  { niche: "mobile", keyword: "Samsung Galaxy Watch AI health features India" }
];

const posts = [
  {
    slug: "best-suv-under-15-lakhs-india-2026-shortlist",
    targetKeyword: "Best SUV Under 15 Lakhs",
    title: "Best SUVs Under Rs 15 Lakh: The 2026 Shortlist Buyers Should Build Carefully",
    metaTitle: "Best SUV Under 15 Lakhs India 2026: Buyer Shortlist",
    metaDescription: "Best SUV under 15 lakhs India 2026 buyer guide covering compact SUVs, safety, turbo petrol, diesel, EV options, feature value and on-road budget discipline.",
    excerpt: "The best SUV under Rs 15 lakh is no longer a simple feature-count contest. Indian buyers now need to balance safety scores, engine choice, service reach and on-road pricing before picking a compact SUV.",
    category: "EV Buying Guides",
    tags: ["Best SUV Under 15 Lakhs", "new car launch shortlist India", "India car news", "EV buying guide India", "Hyundai Venue"],
    image: "assets/best-suv-under-15-lakhs-india-2026-thumbnail.jpg",
    imageAlt: "Best SUV under 15 lakhs India 2026 editorial thumbnail",
    imageCredit: "Thumbnail: Car News graphic using locally available official-source SUV media fallback because local HTTPS image downloads failed.",
    thumbnailHeadline: "SUVS UNDER 15L",
    sources: [
      { label: "Hyundai India SUV price listing", url: "https://www.hyundai.com/in/en/find-a-car/suv" },
      { label: "Hyundai VENUE official price page", url: "https://www.hyundai.com/content/hyundai/in/en/find-a-car/venue/price" },
      { label: "CarDekho best SUV India June 2026 listing", url: "https://www.cardekho.com/best-suv" },
      { label: "Tata Motors Q1 FY26 results and EV warranty context", url: "https://www.tatamotors.com/press-releases/tata-motors-consolidated-q1-fy26-results/" }
    ],
    sections: [
      {
        heading: "The Rs 15 Lakh SUV Budget Has Become Crowded",
        paragraphs: [
          "Best SUV Under 15 Lakhs is one of the most practical car searches in India because this budget now crosses micro SUVs, compact SUVs, turbo-petrol variants, diesel trims and a few electric options. That variety is useful, but it also makes showroom comparisons messy when buyers look only at touchscreen size or sunroof availability.",
          "Hyundai's own SUV and Venue price pages show how quickly variants can move from budget-friendly to stretch territory once automatic gearboxes, turbo engines and connected features enter the list. The smarter approach is to set a final on-road ceiling first, then work backward to the variant."
        ],
        subsections: [
          {
            heading: "Do not start with the top trim",
            paragraphs: [
              "A mid variant with the right engine, safety equipment and service package is often a better long-term buy than a top variant bought only for cosmetic features. Families should also check rear-seat width, luggage needs and highway stability on the test drive."
            ]
          }
        ]
      },
      {
        heading: "Safety, Powertrain and Service Reach Should Lead",
        paragraphs: [
          "The best-value compact SUV is the one that fits your daily routes. City users may prefer automatic petrols or efficient naturally aspirated engines, while highway-heavy buyers should pay attention to torque, braking feel and tyre quality. Buyers who drive less than 800 km a month may not recover the premium of a diesel or hybrid quickly.",
          "Electric choices complicate the same budget. A Nexon.ev or Punch.ev variant can look tempting against petrol SUVs, but only if home charging is realistic. Without a predictable charging routine, the running-cost advantage becomes less useful."
        ],
        subsections: []
      },
      {
        heading: "Buyer Takeaway: Shortlist by Use, Not Hype",
        paragraphs: [
          "For a small family, Venue, Brezza, Sonet, Nexon, XUV 3XO, Fronx and Punch-type choices all answer different problems. The decision should not be made by one viral comparison table. It should be made by seating comfort, safety kit, engine response in traffic, service access and total five-year cost.",
          "The market impact is clear: compact SUVs are now replacing hatchbacks and sedans for many first-time buyers. That gives brands more pricing power, so buyers need more discipline around accessories, insurance add-ons and finance tenure."
        ],
        subsections: []
      }
    ],
    conclusion: "Under Rs 15 lakh, the right SUV is the variant that still feels financially sensible after taxes, insurance and accessories are included. Features matter, but daily comfort, service support and safety should decide the final booking.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "electric-car-vs-petrol-car-india-2026-real-cost",
    targetKeyword: "Electric Car vs Petrol Car",
    title: "Electric Car vs Petrol Car: The 2026 Cost Fight Is Closer Than Buyers Think",
    metaTitle: "Electric Car vs Petrol Car India 2026: Real Ownership Cost",
    metaDescription: "Electric car vs petrol car India 2026 ownership guide covering battery costs, home charging, resale, service, taxes, highway use and buyer break-even points.",
    excerpt: "EV economics are improving, but the petrol-versus-electric decision still depends on home charging, monthly kilometres and how honestly buyers calculate depreciation and convenience.",
    category: "EV Buying Guides",
    tags: ["Electric Car vs Petrol Car", "EV charging cost India", "EV battery life India", "Electric Car India", "Tata EV News"],
    image: "assets/electric-car-vs-petrol-car-india-2026-thumbnail.jpg",
    imageAlt: "Electric car vs petrol car India 2026 ownership cost thumbnail",
    imageCredit: "Thumbnail: Car News graphic using locally available official-source EV media fallback because local HTTPS image downloads failed.",
    thumbnailHeadline: "EV OR PETROL?",
    sources: [
      { label: "Business Standard report on Tata Motors EV economics", url: "https://www.business-standard.com/amp/companies/news/tata-motors-ev-profitability-ice-vehicle-economics-fy26-126051500362_1.html" },
      { label: "Tata Motors Q1 FY26 results and EV battery warranty update", url: "https://www.tatamotors.com/press-releases/tata-motors-consolidated-q1-fy26-results/" },
      { label: "Maruti Suzuki e Vitara BaaS launch context", url: "https://www.marutisuzuki.com/corporate/media/press-releases/2026/february/india-goes-electric-with-maruti-suzuki-e-vitara-introductory-baas-price-starts" },
      { label: "EV charging cost India buyer guide archive", url: `${siteUrl}/posts/ev-charging-cost-india-2026-home-vs-fast.html` }
    ],
    sections: [
      {
        heading: "The Math Has Shifted, But It Has Not Disappeared",
        paragraphs: [
          "Electric Car vs Petrol Car is becoming a serious family-budget question because battery costs, localisation and warranty confidence are improving. Business Standard reported Tata Motors' view that EV economics are moving closer to ICE economics as battery and EV-system costs reduce while petrol and diesel regulatory costs rise.",
          "That does not mean every buyer should switch immediately. The break-even point still depends on home charging, city electricity tariff, monthly kilometres, insurance premium, resale confidence and whether the chosen EV asks for a major variant stretch."
        ],
        subsections: []
      },
      {
        heading: "Home Charging Is the Real Divider",
        paragraphs: [
          "A buyer with a fixed parking spot and home charger gets the cleanest EV case. Charging overnight turns running cost into a habit, not a weekly task. For that owner, petrol begins to look expensive if the car is driven often in city traffic.",
          "A buyer living on public chargers has a different equation. Fast charging can cost more, take planning time and create uncertainty on busy weekends. In that case, a petrol car may still be the easier family tool even when the EV is cheaper per kilometre on paper."
        ],
        subsections: [
          {
            heading: "BaaS changes the first bill",
            paragraphs: [
              "Battery-as-a-Service can make an EV look closer to petrol-car pricing at purchase, but the monthly or per-km battery charge needs to be included in the five-year cost. It is a cash-flow tool, not automatic proof that the EV is cheaper."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Petrol Is Being Forced to Defend Itself",
        paragraphs: [
          "EVs are no longer sold only on environmental intent. They are being sold on warranty, lower service needs, software features and city refinement. Petrol cars still defend themselves through quick refuelling, lower upfront complexity, wider mechanic familiarity and fewer parking constraints.",
          "The best answer is use-case specific. High-kilometre city drivers with home charging should strongly consider EVs. Low-kilometre users, frequent highway travellers and apartment buyers without charger access should price petrol, hybrid and EV choices side by side before booking."
        ],
        subsections: []
      }
    ],
    conclusion: "In 2026, an electric car can be the smarter buy, but only when charging access and usage pattern support it. Petrol remains rational for buyers who value flexibility more than running-cost savings.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "hero-vida-vx2-electric-scooter-baas-india-2026",
    targetKeyword: "Hero VIDA VX2 electric scooter battery rental India",
    title: "Hero VIDA VX2 and BaaS: Why Electric Scooter Buyers Must Read the Monthly Cost",
    metaTitle: "Hero VIDA VX2 Electric Scooter BaaS India 2026 Buyer Guide",
    metaDescription: "Hero VIDA VX2 electric scooter BaaS buyer guide for India, covering battery rental, removable battery practicality, range, family use, running cost and service reach.",
    excerpt: "Hero's VIDA VX2 pitch lowers the entry price of electric scooter ownership, but Indian families should compare the battery plan, charging routine and service access before calling it cheap.",
    category: "Bike News",
    tags: ["Hero VIDA VX2", "EV Bikes India", "electric bike buying guide India", "Two Wheeler News", "EV vs ICE Bikes"],
    image: "assets/hero-vida-vx2-baas-india-2026-thumbnail.jpg",
    imageAlt: "Hero VIDA VX2 electric scooter BaaS India 2026 thumbnail",
    imageCredit: "Thumbnail: Car News graphic using locally available official-source two-wheeler media fallback because local HTTPS image downloads failed.",
    thumbnailHeadline: "VIDA VX2 BAAS",
    sources: [
      { label: "Hero MotoCorp VIDA VX2 3.4 kWh variant press release", url: "https://www.heromotocorp.com/content/dam/hero-aem-website/in/en-in/company-section/press-releases/2025/november-pdf/hero_motocorp_expands_vida_evooter_vx2_line_upwith_new_3_4_kwh_variant_further_strengthening_its_electric_mobility_portfolio_10112025.pdf" },
      { label: "Autocar Professional VIDA VX2 launch report", url: "https://www.autocarpro.in/news/vida-launches-vx2-evooter-in-india-starting-at-%E2%82%B959490-127295" },
      { label: "BikeDekho VIDA VX2 price and launch details", url: "https://www.bikedekho.com/news/breaking-vida-vx2-electric-scooter-launched-with-baas-18151" },
      { label: "Hero MotoCorp Q4 FY26 VIDA business context", url: "https://images.moneycontrol.com/static-mcnews/2026/05/20260507050234_Hero-MotoCorp-0705026-lkp.pdf" }
    ],
    sections: [
      {
        heading: "A Lower Sticker Price Needs a Bigger Calculator",
        paragraphs: [
          "Hero VIDA VX2 electric scooter battery rental India is a useful search because Battery-as-a-Service makes the entry price look close to many petrol scooters. Hero's official VX2 portfolio update also keeps the conversation alive by expanding battery choices for family-oriented scooter use.",
          "The catch is simple: the battery plan is not free. Buyers should compare the upfront saving against monthly rental, expected kilometres and any usage-linked charges. A low invoice can still become an average deal if the scooter is ridden heavily."
        ],
        subsections: []
      },
      {
        heading: "Removable Batteries Help Apartment Buyers",
        paragraphs: [
          "The VIDA pitch is strongest for city riders who cannot install a fixed charger. Removable battery convenience can solve a real apartment problem, especially for users who ride predictable distances and can charge indoors safely.",
          "Families should still check weight, charging time, under-seat storage, pillion comfort and dealer support. An EV scooter that works perfectly for a solo office commute may not be the best school-run or grocery-run scooter if storage and ride comfort fall short."
        ],
        subsections: [
          {
            heading: "What to ask at the dealership",
            paragraphs: [
              "Ask for the exact BaaS contract, battery warranty, charger cost, roadside assistance terms, service interval and the cost if usage changes later. Those numbers matter more than a launch headline."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Hero Is Normalising EV Scooters",
        paragraphs: [
          "Hero's advantage is trust and reach. If VIDA keeps expanding touchpoints and battery options, electric scooters can feel less experimental for mainstream buyers. That matters in towns where buyers want a known service network before trying an EV.",
          "The VX2 should be compared with petrol scooters and rival EV scooters on total monthly outgo, not just ex-showroom price. The winning scooter is the one whose charging, service and battery plan fit the household."
        ],
        subsections: []
      }
    ],
    conclusion: "VIDA VX2 with BaaS can be sensible for urban riders who want a lower entry price and predictable charging. The buying decision should be based on the monthly battery cost, not the launch price alone.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "royal-enfield-hunter-350-2026-update-india-buying-guide",
    targetKeyword: "Royal Enfield Hunter 350 2026 update",
    title: "Royal Enfield Hunter 350 2026 Update: Small Changes, Big Buying Questions",
    metaTitle: "Royal Enfield Hunter 350 2026 Update India Buyer Guide",
    metaDescription: "Royal Enfield Hunter 350 2026 update buyer guide covering new Base Premium variant, colours, tubeless tyres, city use, ownership costs and rivals.",
    excerpt: "The 2026 Hunter 350 update does not rewrite Royal Enfield's city-roadster formula, but the new variant and colour choices give buyers a better reason to check the exact trim before booking.",
    category: "Bike News",
    tags: ["Royal Enfield Hunter 350", "Bike News India", "two-wheeler launch updates India", "best commuter bikes India 2026", "bikes new launch"],
    image: "assets/royal-enfield-hunter-350-2026-update-thumbnail.jpg",
    imageAlt: "Royal Enfield Hunter 350 2026 update thumbnail",
    imageCredit: "Thumbnail: Car News graphic using locally available official-source motorcycle media fallback because local HTTPS image downloads failed.",
    thumbnailHeadline: "HUNTER 350 2026",
    sources: [
      { label: "Royal Enfield Hunter 350 2026 technical specifications PDF", url: "https://www.royalenfield.com/content/dam/open-pdf/royal-enfield-hunter-350-technical-specifications-2026.pdf" },
      { label: "Eicher Motors Hunterhood Lucknow 2026 update release", url: "https://www.eicher.in/content/dam/eicher-motors/investor/notifications/company-update/press-release-hunterhood-lucknow-04-04-2026.pdf" },
      { label: "BikeDekho Hunter 350 Base Premium and new colours report", url: "https://www.bikedekho.com/news/category-launch-news/breaking-royal-enfield-hunter-350-base-premium-variant-and-new-colours-launched-19365" },
      { label: "Times of India 2026 Hunter 350 update report", url: "https://timesofindia.indiatimes.com/auto/bikes/royal-enfield-launches-2026-hunter-350-lineup-pricing-whats-new/articleshow/130021241.cms" }
    ],
    sections: [
      {
        heading: "The Update Is About Usability, Not Drama",
        paragraphs: [
          "Royal Enfield Hunter 350 2026 update searches have risen because the motorcycle now gets a new Base Premium variant and fresh colour choices. BikeDekho reported the Base Premium variant at Rs 1,49,900 ex-showroom Chennai, positioned above the Factory Black base trim.",
          "For buyers, the practical highlight is not a power bump. It is the availability of alloy wheels with tubeless tyres in a more accessible variant. That matters for city riders who want easier puncture management without stretching to a top trim."
        ],
        subsections: []
      },
      {
        heading: "The Hunter Still Fits a Specific Rider",
        paragraphs: [
          "The Hunter 350 remains best for riders who want Royal Enfield character in a lighter, city-friendly package. It is not the most relaxed highway cruiser in the brand's lineup, and it is not a commuter in the fuel-efficiency sense. Its appeal is style, torque feel and compact handling.",
          "Buyers should test the seat, rear suspension comfort and handlebar position on broken roads. If daily use includes a pillion or rough routes, comfort should matter as much as colour."
        ],
        subsections: [
          {
            heading: "Variant check",
            paragraphs: [
              "Compare Factory, Base Premium and Metro variants by tyres, colour, instrument features and final insurance quote. A small ex-showroom gap can grow after accessories and finance."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Royal Enfield Is Protecting Its Entry Point",
        paragraphs: [
          "The Hunter gives Royal Enfield a younger, more urban entry point. Adding useful equipment lower in the lineup helps the company defend against sporty commuters, retro rivals and buyers who might otherwise move to a scooter or used larger motorcycle.",
          "The 2026 update is worth considering if the new variant solves the tubeless-tyre issue within budget. If you already liked the Hunter but disliked the trim walk, this change deserves a fresh showroom visit."
        ],
        subsections: []
      }
    ],
    conclusion: "The 2026 Hunter 350 update is not a reason to upgrade from a recent Hunter, but it is a better buying setup for new customers who wanted the base price with more practical tyre hardware.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "apple-wwdc-2026-ai-iphone-india-upgrade-watch",
    targetKeyword: "Apple WWDC 2026 AI iPhone India",
    title: "Apple WWDC 2026 and iPhone AI: What Indian Buyers Should Watch Before Upgrading",
    metaTitle: "Apple WWDC 2026 AI iPhone India: Upgrade Watch",
    metaDescription: "Apple WWDC 2026 AI iPhone India preview covering Apple Intelligence, iOS updates, device support, privacy, developer tools and buyer upgrade timing.",
    excerpt: "Apple's WWDC26 starts on June 8 with AI advancements on the agenda, which makes this a bad week for Indian iPhone buyers to rush into an upgrade without waiting for software clarity.",
    category: "Mobile Tech",
    tags: ["Apple WWDC 2026", "Apple Intelligence India", "mobile news apple", "AI phone features for Indian buyers", "smartphone upgrade guide India"],
    image: "assets/apple-wwdc-2026-ai-iphone-india-thumbnail.jpg",
    imageAlt: "Apple WWDC 2026 AI iPhone India upgrade watch thumbnail",
    imageCredit: "Thumbnail: Car News graphic using locally available official-source Apple media fallback because local HTTPS image downloads failed.",
    thumbnailHeadline: "WWDC AI WATCH",
    sources: [
      { label: "Apple WWDC26 kickoff schedule", url: "https://www.apple.com/newsroom/2026/05/apple-kicks-off-worldwide-developers-conference-on-june-8/" },
      { label: "Apple WWDC26 March announcement", url: "https://www.apple.com/newsroom/2026/03/apples-worldwide-developers-conference-returns-the-week-of-june-8/" },
      { label: "Apple Intelligence accessibility updates preview", url: "https://www.apple.com/newsroom/2026/05/apple-unveils-new-accessibility-features-and-updates-with-apple-intelligence" },
      { label: "TechCrunch WWDC26 AI advancements report", url: "https://techcrunch.com/2026/03/23/apple-wwdc-june-8-12-ai-advancements-siri-developers-conference/" }
    ],
    sections: [
      {
        heading: "Wait for the Keynote Before Buying",
        paragraphs: [
          "Apple WWDC 2026 AI iPhone India is the right search for this weekend because Apple has officially scheduled WWDC26 from June 8 to 12 and says the keynote will include AI advancements, new software and developer tools. In India, that timing matters for anyone comparing iPhone 16, iPhone 17 and discounted older models.",
          "The upgrade risk is not that current iPhones will stop being useful. The risk is buying a device days before Apple clarifies which AI features need newer hardware, which languages arrive first and whether India gets the most useful parts immediately."
        ],
        subsections: []
      },
      {
        heading: "AI Features Need Hardware and Language Clarity",
        paragraphs: [
          "Indian users should watch three things: supported iPhone models, Indian English and local-language behaviour, and privacy boundaries for on-device versus cloud processing. A feature that demos well in the keynote may still be limited if it needs the newest chips or arrives later in India.",
          "Apple's May accessibility preview already shows Apple Intelligence being used for practical features such as richer descriptions and natural language navigation. That is the kind of utility buyers should value more than flashy AI demos."
        ],
        subsections: [
          {
            heading: "Upgrade timing",
            paragraphs: [
              "If your current iPhone is healthy, wait until WWDC sessions and beta compatibility notes settle. If you need a phone urgently, buy only after checking whether the model is likely to receive the features you care about."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: AI Is Becoming the New Storage Upsell",
        paragraphs: [
          "Phone brands are increasingly using AI to push buyers toward newer chips, more RAM and higher storage tiers. Apple is no different, but its strongest argument remains long software support and privacy-led integration.",
          "For Indian buyers, the best purchase may be the iPhone that gets the next two years of genuinely useful AI features without forcing a flagship price. WWDC26 should make that answer clearer."
        ],
        subsections: []
      }
    ],
    conclusion: "Do not buy an iPhone this week purely on discount. Wait for WWDC26 feature support details, then decide whether Apple Intelligence actually changes your daily use in India.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "samsung-galaxy-watch-ai-health-features-india-2026",
    targetKeyword: "Samsung Galaxy Watch AI health features India",
    title: "Samsung's New Galaxy Watch AI Health Push: Useful Upgrade or Another Spec Sheet?",
    metaTitle: "Samsung Galaxy Watch AI Health Features India 2026",
    metaDescription: "Samsung Galaxy Watch AI health features India 2026 buyer guide covering Samsung Health updates, AI insights, phone ecosystem fit, privacy and upgrade value.",
    excerpt: "Samsung is preparing new AI-powered health features for the next Galaxy Watch, but Indian buyers should judge the update by daily insight quality, phone compatibility and long-term support.",
    category: "Mobile Tech",
    tags: ["Samsung Galaxy Watch AI", "Galaxy AI", "mobile new tech", "mobile tech India", "AI tech news"],
    image: "assets/samsung-galaxy-watch-ai-health-india-2026-thumbnail.jpg",
    imageAlt: "Samsung Galaxy Watch AI health features India 2026 thumbnail",
    imageCredit: "Thumbnail: Car News graphic using locally available official-source Samsung media fallback because local HTTPS image downloads failed.",
    thumbnailHeadline: "GALAXY WATCH AI",
    sources: [
      { label: "Samsung Newsroom India Galaxy Watch AI health features", url: "https://news.samsung.com/in/samsung-introduces-next-gen-galaxy-watch-features-for-ai-powered-everyday-health-companion" },
      { label: "Samsung Mobile Press Galaxy AI ecosystem at MWC 2026", url: "https://www.samsungmobilepress.com/articles/samsung-galaxy-ai-ecosystem-vision-mwc-2026" },
      { label: "Samsung India Galaxy AI newsroom archive", url: "https://news.samsung.com/in/tag/galaxy-ai" },
      { label: "Tom's Guide Samsung AI health tools report", url: "https://www.tomsguide.com/wellness/smartwatches/samsung-announces-ai-health-tools-ahead-of-galaxy-watch-9-launch-including-a-fitness-index-rated-against-your-peers" }
    ],
    sections: [
      {
        heading: "Samsung Is Moving AI From Phone Camera to Health",
        paragraphs: [
          "Samsung Galaxy Watch AI health features India is a timely topic because Samsung Newsroom India says an app update will begin rolling out from June 8 to showcase key health features planned for the upcoming Galaxy Watch. That puts wearable AI in the same conversation as phone AI.",
          "The promise is clear: health data from the watch becomes easier to understand through AI-led insights. The buyer question is whether those insights change behaviour or simply rename existing metrics."
        ],
        subsections: []
      },
      {
        heading: "A Watch Upgrade Should Be Judged by Habits",
        paragraphs: [
          "Smartwatch health features work only when users wear the device consistently. Sleep tracking, recovery scores and fitness indicators need enough data to become useful. If the watch spends most nights on a charger, AI cannot fix the missing history.",
          "Indian buyers should also check ecosystem fit. Some advanced Galaxy Watch features traditionally work best with Samsung phones, while Android users outside the Galaxy ecosystem may not get the same experience. That can change the value equation."
        ],
        subsections: [
          {
            heading: "Privacy and medical caution",
            paragraphs: [
              "AI health summaries should be treated as guidance, not diagnosis. Buyers with medical conditions should look for accuracy claims, regional availability and exportable data before trusting a wearable as more than a wellness companion."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Wearables Need Better Reasons to Upgrade",
        paragraphs: [
          "The smartwatch market has matured. Step counts and notifications no longer justify frequent upgrades. Samsung's AI health direction is important because it gives watches a new job: explaining patterns, not just collecting them.",
          "For buyers, the best move is to wait for local pricing and feature availability. If the new AI tools work on older Galaxy Watch models through Samsung Health, the smartest upgrade may be no upgrade at all."
        ],
        subsections: []
      }
    ],
    conclusion: "Samsung's Galaxy Watch AI push is worth watching, but the value depends on Indian feature availability, phone compatibility and whether the insights are practical enough to change daily habits.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  }
];

const thumbs = [
  { post: posts[0], source: "assets/tata-nexon-ev.jpg", bg: "#14213d", accent: "#fca311", identity: "local-official-fallback:Tata Motors:Nexon EV:assets/tata-nexon-ev.jpg:diagonal amber SUV shortlist layout" },
  { post: posts[1], source: "assets/suzuki-e-vitara.jpg", bg: "#1b4332", accent: "#74c69d", identity: "local-official-fallback:Suzuki:e Vitara:assets/suzuki-e-vitara.jpg:green cost-comparison split layout" },
  { post: posts[2], source: "assets/best-commuter-bikes-india-2026-thumbnail.jpg", bg: "#2b2d42", accent: "#ef233c", identity: "local-official-fallback:Hero MotoCorp:commuter motorcycle media:assets/best-commuter-bikes-india-2026-thumbnail.jpg:red BaaS scooter-style overlay" },
  { post: posts[3], source: "assets/longest-range-electric-bikes-india-2026-thumbnail.jpg", bg: "#0b090a", accent: "#ba181b", identity: "local-official-fallback:Ultraviolette motorcycle media:assets/longest-range-electric-bikes-india-2026-thumbnail.jpg:black-red roadster update layout" },
  { post: posts[4], source: "assets/apple-ai-phone-features-india-2026-thumbnail.jpg", bg: "#003049", accent: "#ffb703", identity: "local-official-fallback:Apple Intelligence media:assets/apple-ai-phone-features-india-2026-thumbnail.jpg:blue-yellow WWDC watch layout" },
  { post: posts[5], source: "assets/mobile-gpu-performance-2026-thumbnail.jpg", bg: "#073b4c", accent: "#06d6a0", identity: "local-official-fallback:Samsung mobile performance media:assets/mobile-gpu-performance-2026-thumbnail.jpg:teal health-AI wearable layout" }
];

function magick(args) {
  execFileSync("magick", args, { stdio: "inherit", cwd: root });
}

function makeThumb(item, index) {
  const out = path.join(root, item.post.image);
  const src = path.join(root, item.source);
  const label = item.post.thumbnailHeadline;
  const kicker = index < 2 ? "CAR NEWS" : index < 4 ? "BIKE NEWS" : "MOBILE TECH";
  const gravity = index % 2 === 0 ? "West" : "East";
  magick([
    src,
    "-resize", "1200x675^",
    "-gravity", "center",
    "-extent", "1200x675",
    "-fill", "rgba(0,0,0,0.46)",
    "-draw", "rectangle 0,0 1200,675",
    "-fill", item.bg,
    "-draw", index % 2 === 0 ? "polygon 0,0 610,0 440,675 0,675" : "polygon 590,0 1200,0 1200,675 760,675",
    "-fill", item.accent,
    "-draw", index % 2 === 0 ? "rectangle 64,92 118,512" : "rectangle 1082,92 1136,512",
    "-gravity", gravity,
    "-font", "Arial-Bold",
    "-pointsize", "38",
    "-fill", "#ffffff",
    "-annotate", index % 2 === 0 ? "+150-170" : "+150-170", kicker,
    "-pointsize", "70",
    "-interline-spacing", "-6",
    "-annotate", index % 2 === 0 ? "+150-50" : "+150-50", label,
    "-pointsize", "29",
    "-fill", item.accent,
    "-annotate", index % 2 === 0 ? "+150+95" : "+150+95", today,
    "-quality", "88",
    out
  ]);
  return sha256(out);
}

const existing = readJson(postsPath, []);
const existingSlugs = new Set(existing.map((post) => post.slug));
for (const post of posts) {
  if (existingSlugs.has(post.slug)) throw new Error(`Duplicate slug ${post.slug}`);
}

const hashes = thumbs.map(makeThumb);
const contactSheet = path.join(root, "assets", "daily-thumbnails-2026-06-07-contact-sheet.jpg");
magick([
  ...thumbs.map((item) => path.join(root, item.post.image)),
  "-resize", "420x236",
  "-background", "#f4f4f4",
  "-gravity", "center",
  "-extent", "420x236",
  "+append",
  contactSheet
]);

writeJson(postsPath, [...posts, ...existing]);

const log = readJson(logPath, {
  cursors: { car: 0, bike: 0, mobile: 0 },
  publishedKeywords: [],
  publishedSlugs: [],
  thumbnailHashes: [],
  thumbnailSources: [],
  facebookUrls: [],
  runs: [],
  thumbnailSourceIdentities: []
});

log.cursors = log.cursors || { car: 0, bike: 0, mobile: 0 };
log.cursors.car = 14;
log.cursors.bike = 0;
log.cursors.mobile = 0;
log.publishedKeywords = [...new Set([...(log.publishedKeywords || []), ...selections.map((item) => item.keyword)])];
log.publishedSlugs = [...new Set([...(log.publishedSlugs || []), ...posts.map((post) => post.slug)])];
log.thumbnailHashes = [...new Set([...(log.thumbnailHashes || []), ...hashes, sha256(contactSheet)])];
log.thumbnailSources = [...new Set([...(log.thumbnailSources || []), ...thumbs.map((item) => item.identity)])];
log.thumbnailSourceIdentities = [...new Set([...(log.thumbnailSourceIdentities || []), ...thumbs.map((item, index) => `${item.identity}:sha256=${hashes[index]}`)])];
log.runs = [
  {
    ranAt: new Date().toISOString(),
    commit: null,
    mode: "codex-generate-2026-06-07",
    selectedKeywords: selections,
    articles: posts.map((post) => ({
      slug: post.slug,
      keyword: post.targetKeyword,
      category: post.category,
      url: `${siteUrl}/posts/${post.slug}.html`,
      image: post.image
    })),
    thumbnailAudit: {
      contactSheet: "assets/daily-thumbnails-2026-06-07-contact-sheet.jpg",
      status: "pending_visual_audit",
      note: "Generated six distinct layouts and source identities; local official-image downloads were blocked by Windows schannel SEC_E_NO_CREDENTIALS, so thumbnails use available local official-source media fallbacks."
    },
    facebook: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      result: {
        status: "pending_publish_helper",
        postId: null,
        message: "Awaiting build, git push and Facebook helper."
      },
      postedAt: new Date().toISOString()
    }))
  },
  ...(log.runs || [])
];

writeJson(logPath, log);
console.log(`Generated ${posts.length} posts and ${thumbs.length} thumbnails.`);
