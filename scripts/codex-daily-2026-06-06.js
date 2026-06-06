const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const siteUrl = "https://comeback2000.github.io/Car-news";
const today = "2026-06-06";

const escArg = (value) => String(value);
const slugify = (value) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const readJson = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) : fallback;
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const postsPath = path.join(root, "data", "posts.json");
const logPath = path.join(root, "data", "daily-publisher-log.json");
const tmpDir = path.join(root, "assets", ".codex-tmp-20260606");
fs.mkdirSync(tmpDir, { recursive: true });

const selections = [
  { niche: "car", keyword: "Punch EV vs Nexon EV" },
  { niche: "car", keyword: "Best EV Under 20 Lakhs" },
  { niche: "bike", keyword: "longest-range electric Bikes" },
  { niche: "bike", keyword: "best commuter bikes India 2026" },
  { niche: "mobile", keyword: "mobile vs Ai" },
  { niche: "mobile", keyword: "mobile in GPu" }
];

const newPosts = [
  {
    slug: "punch-ev-vs-nexon-ev-2026-buyer-choice",
    targetKeyword: "Punch EV vs Nexon EV",
    title: "Punch EV or Nexon EV: The Tata Sibling Rivalry Buyers Need to Price Honestly",
    metaTitle: "Punch EV vs Nexon EV 2026: Tata EV Buyer Guide",
    metaDescription: "Punch EV vs Nexon EV buyer guide for India in 2026, covering price overlap, range, safety, cabin space, charging, features and ownership fit.",
    excerpt: "Tata's updated Punch.ev has moved close enough to the Nexon.ev that many buyers now need to compare usage, space and long-term comfort instead of simply choosing the cheaper badge.",
    category: "EV Comparisons",
    tags: ["Punch EV vs Nexon EV", "Tata Punch EV", "Tata Nexon EV", "EV buying guide India", "India car news"],
    image: "assets/punch-ev-vs-nexon-ev-2026-thumbnail.jpg",
    imageAlt: "Punch EV vs Nexon EV 2026 buyer guide thumbnail using official Tata Punch EV imagery",
    imageCredit: "Thumbnail: Car News graphic using official Tata Motors Punch.ev imagery with editorial overlay.",
    thumbnailHeadline: "PUNCH EV OR NEXON EV?",
    sources: [
      { label: "Tata.ev official Punch.ev product page", url: "https://ev.tatamotors.com/punch/ev.html" },
      { label: "Tata Motors Bharat-NCAP Punch.ev and Nexon.ev safety release", url: "https://www.tatamotors.com/press-releases/punch-ev-is-indias-first-and-safest-ev-receives-5-star-safety-ratings-with-highest-ever-scores-from-bharat-ncap/" },
      { label: "Economic Times 2026 Punch EV vs Nexon EV comparison", url: "https://economictimes.indiatimes.com/news/new-updates/tata-punch-ev-2026-vs-nexon-ev-price-range-charging-options-interior-and-more-specs-compared/articleshow/128596003.cms" },
      { label: "CarDekho 2026 Tata Punch EV facelift launch report", url: "https://www.cardekho.com/india-car-news/tata-punch-ev-facelift-launched-priced-from-rs-969-lakh-35678.htm" }
    ],
    sections: [
      {
        heading: "The Real Question Is Not Just Price",
        paragraphs: [
          "Punch EV vs Nexon EV has become a sharper buying question because Tata's smaller electric SUV now carries stronger equipment, faster charging claims and a more confident feature list. The gap between a loaded Punch.ev and an entry or mid Nexon.ev can look small enough to confuse families who first planned a simple city EV purchase.",
          "Tata's own Punch.ev page highlights a 30 kWh and 40 kWh battery structure, 20 to 80 percent fast charging in 26 minutes and lifetime HV battery pack warranty language. Those details matter because they push the Punch.ev beyond the old assumption that the smaller car is only a budget pick."
        ],
        subsections: [
          {
            heading: "Where the Punch.ev makes sense",
            paragraphs: [
              "Choose the Punch.ev if most driving is urban, parking space is tight, and you value feature density over outright cabin width. A top variant can feel richer than its size suggests, especially for buyers who want cameras, connected features and a compact footprint."
            ]
          }
        ]
      },
      {
        heading: "The Nexon.ev Still Buys You More Car",
        paragraphs: [
          "The Nexon.ev remains the more mature family-car choice. It offers a larger body, stronger road presence and a cabin that feels easier for frequent four-adult use. If the EV is replacing the main household car, the Nexon.ev's extra size can be worth more than a few additional gadgets.",
          "The safety argument is not one-sided either. Tata Motors has publicised 5-star Bharat-NCAP ratings for both Punch.ev and Nexon.ev, so the decision moves toward packaging, boot needs, charging routine and monthly EMI comfort rather than a simple safety winner."
        ],
        subsections: []
      },
      {
        heading: "Battery, Charging and Daily Range Should Decide the Variant",
        paragraphs: [
          "Indian buyers often compare claimed range first, but the stronger test is whether the car can complete your busiest normal day with a useful buffer. Office commute, school runs, summer AC use and weekend errands are more relevant than a brochure figure that assumes ideal conditions.",
          "If you can install a charger at home, both cars become much easier to recommend. If you depend on public chargers, the Nexon.ev's larger-car role should be checked against charging access near home and office, because an EV that needs frequent planning will feel expensive even when running cost is low."
        ],
        subsections: [
          {
            heading: "Buyer check",
            paragraphs: [
              "Test-drive both cars on the same day with the people who will actually sit in the rear seat. Also check the exact insurance quote, charger installation cost and delivery timeline before comparing EMIs."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Tata Is Competing With Itself",
        paragraphs: [
          "This overlap is good for shoppers but tricky for Tata's showroom pitch. The Punch.ev brings more buyers into electric SUVs at a lower entry point, while the Nexon.ev must justify its premium through space, stronger family usability and long-distance confidence.",
          "The better choice is not the car with the more dramatic launch story. It is the Tata EV that fits your parking, passengers, charging access and resale comfort without making you stretch into a variant you do not need."
        ],
        subsections: []
      }
    ],
    conclusion: "Buy the Punch.ev for compact-city convenience and high equipment value; buy the Nexon.ev when the EV must behave like the main family SUV. The right answer is the one that keeps space, charging and EMI pressure in balance.",
    aliases: [],
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "best-ev-under-20-lakhs-india-2026-shortlist",
    targetKeyword: "Best EV Under 20 Lakhs",
    title: "EVs Under Rs 20 Lakh Are Finally Serious: How Buyers Should Build the 2026 Shortlist",
    metaTitle: "Best EV Under 20 Lakhs India 2026: Buyer Shortlist",
    metaDescription: "Best EV under 20 lakhs India 2026 guide covering Maruti e Vitara, Tata Punch EV, Nexon EV, MG Windsor EV, Hyundai Creta Electric and Mahindra BE 6.",
    excerpt: "The under-Rs 20 lakh EV space now includes real family options, but the smartest shortlist depends on charging access, battery plan, service trust and variant discipline.",
    category: "EV Buying Guides",
    tags: ["Best EV Under 20 Lakhs", "affordable EV India", "new EV launch India", "EV buying guide India", "Electric Car India"],
    image: "assets/best-ev-under-20-lakhs-india-2026-thumbnail.jpg",
    imageAlt: "Best EV under 20 lakhs India 2026 thumbnail using official Mahindra BE 6 imagery",
    imageCredit: "Thumbnail: Car News graphic using official Mahindra Electric Origin SUV imagery with editorial overlay.",
    thumbnailHeadline: "EVS UNDER 20 LAKH",
    sources: [
      { label: "Maruti Suzuki e Vitara India sales and BaaS press release", url: "https://www.marutisuzuki.com/corporate/media/press-releases/2026/february/india-goes-electric-with-maruti-suzuki-e-vitara-introductory-baas-price-starts" },
      { label: "Mahindra BE 6 and XEV 9e top-variant pricing release", url: "https://auto.mahindra.com/hi-in/press-release/mahindra-democratises-premium-ev-technology-announces-top-variant-prices-of-be-6-and-xev-9e.html" },
      { label: "Hyundai Creta Electric official India price page", url: "https://www.hyundai.com/in/en/find-a-car/creta-electric/price" },
      { label: "EV Index India 2026 electric cars under Rs 20 lakh overview", url: "https://evindexindia.com/ev-index/best-electric-cars-under-20-lakhs-in-india-in-2026" }
    ],
    sections: [
      {
        heading: "Under Rs 20 Lakh No Longer Means Entry-Level Only",
        paragraphs: [
          "Best EV Under 20 Lakhs used to mean choosing between a city hatchback and a compromised range figure. In 2026, the list is wider and more complicated: compact SUVs, crossovers, battery rental options and aggressive entry trims all crowd the same mental budget.",
          "Maruti Suzuki's e Vitara launch added a new type of pressure because its Battery-as-a-Service offer lowers the upfront entry price while shifting part of the cost into running use. That makes headline price comparisons less useful unless buyers calculate the battery rental or per-kilometre plan honestly."
        ],
        subsections: []
      },
      {
        heading: "The Shortlist Should Start With Charging, Not Screens",
        paragraphs: [
          "A Rs 19 lakh EV with poor home-charging fit can be harder to live with than a Rs 14 lakh EV that plugs in reliably every night. Before falling for panoramic displays, ADAS badges or claimed range, buyers should answer one question: where will the car charge 80 percent of the time?",
          "If the answer is home, the field opens up. If the answer is public charging, then battery size, DC charging curve, app reliability and charger density near your routes become more important than the launch price."
        ],
        subsections: [
          {
            heading: "Practical shortlist logic",
            paragraphs: [
              "City-first buyers should compare Punch.ev, Nexon.ev and MG Windsor EV variants. Family-SUV buyers stretching toward Rs 20 lakh should check Creta Electric entry variants, e Vitara plans and whether a Mahindra BE 6 Pack One really fits the final on-road budget."
            ]
          }
        ]
      },
      {
        heading: "BaaS Makes the EMI Look Better, But Read the Use Case",
        paragraphs: [
          "Battery-as-a-Service can reduce the initial invoice and bring an EV into a buyer's budget. It can also make the real cost less obvious if monthly running is high. Maruti's e Vitara offer shows why EV buying now needs the same discipline as comparing loan tenure, fuel cost and service packages.",
          "A low upfront price is useful for cash flow, but it is not automatically cheaper over five years. High-mileage users should calculate total battery rental or per-km cost against a full-purchase EV, while low-mileage users should check whether they are paying for flexibility they do not need."
        ],
        subsections: []
      },
      {
        heading: "What Could Shift the Market Next",
        paragraphs: [
          "The under-Rs 20 lakh EV fight is now less about whether EVs are viable and more about which brand can make ownership feel normal. Maruti brings network trust, Tata brings EV familiarity, MG brings value packaging, Hyundai brings mainstream SUV comfort and Mahindra brings performance-led aspiration.",
          "That competition should help buyers, but only if they avoid overbuying. The smart move is to shortlist by real range requirement, charger access, rear-seat needs, service reach and resale confidence before chasing the newest launch."
        ],
        subsections: []
      }
    ],
    conclusion: "The best EV under Rs 20 lakh is not a single winner. It is the variant whose charging plan, real-world range and ownership cost still make sense after the showroom discount or BaaS headline is removed.",
    aliases: [],
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "longest-range-electric-bikes-india-2026-reality-check",
    targetKeyword: "longest-range electric Bikes",
    title: "Longest-Range Electric Bikes: Why the Biggest Number Is Only Half the Buying Story",
    metaTitle: "Longest Range Electric Bikes India 2026: Buyer Reality Check",
    metaDescription: "Longest-range electric bikes India 2026 guide covering Ultraviolette F77, premium EV motorcycles, charging access, warranty, real-world use and ownership tradeoffs.",
    excerpt: "Electric motorcycles are stretching range claims, but Indian riders should judge warranty, charging access and highway behaviour before paying a premium for the biggest number.",
    category: "Bike News",
    tags: ["longest-range electric Bikes", "EV Bikes India", "electric bike buying guide India", "Two Wheeler News", "Bike News India"],
    image: "assets/longest-range-electric-bikes-india-2026-thumbnail.jpg",
    imageAlt: "Longest range electric bikes India 2026 thumbnail using official Ultraviolette motorcycle imagery",
    imageCredit: "Thumbnail: Car News graphic using official Ultraviolette imagery with editorial overlay.",
    thumbnailHeadline: "LONG RANGE EV BIKES",
    sources: [
      { label: "Ultraviolette official electric motorcycles page", url: "https://www.ultraviolette.com/" },
      { label: "BikeDekho Ultraviolette F77 SuperStreet price and range listing", url: "https://www.bikedekho.com/ultraviolette/f77-superstreet" },
      { label: "EV Care Ultraviolette F77 overview", url: "https://ev.care/ev/ultraviolette/ultraviolette-f77" },
      { label: "Autocar India and Ultraviolette electric motorcycle speed record context", url: "https://www.autocarindia.com/bike-news/ultraviolette-f99-sets-indian-electric-motorcycle-speed-record-434322" }
    ],
    sections: [
      {
        heading: "Range Is Finally Becoming a Motorcycle Pitch",
        paragraphs: [
          "Longest-range electric Bikes is no longer a niche search for early adopters. Premium electric motorcycles such as Ultraviolette's F77 family have made range, battery warranty and performance part of the same conversation that used to belong to petrol bikes.",
          "Ultraviolette's official site highlights an IDC range of 323 km and a battery warranty of up to 100,000 km. Those numbers are important, but riders should treat them as a starting point rather than the full ownership answer."
        ],
        subsections: []
      },
      {
        heading: "A Long-Range EV Bike Still Needs the Right Route",
        paragraphs: [
          "For city riders, a high-range electric motorcycle can reduce charging anxiety dramatically. You may charge fewer times per week, avoid daily plug-in stress and keep enough buffer for errands after office. That is where the premium starts to feel useful.",
          "For highway riders, the question changes. Fast charging access, charger placement on riding routes, heat management, pillion load and sustained cruising speed can matter more than the range claim. A petrol touring bike still wins on refill speed, while an EV bike wins when your riding pattern is predictable."
        ],
        subsections: [
          {
            heading: "The warranty lens",
            paragraphs: [
              "Battery warranty should be read with the same care as range. Check kilometre cap, years covered, degradation terms, transferability and whether accessories or charging behaviour can affect support."
            ]
          }
        ]
      },
      {
        heading: "Premium EV Bikes Are Not Budget Commuters",
        paragraphs: [
          "The strongest long-range electric motorcycles sit closer to performance-bike money than commuter-bike money. That means the comparison should include tyres, insurance, brake wear, software support and service network, not only electricity cost.",
          "A rider moving from a 125cc commuter will not recover the premium quickly through running cost alone. A rider comparing against a 300cc to 450cc petrol motorcycle may find the EV case more interesting, especially if home charging is easy and monthly kilometres are high."
        ],
        subsections: []
      },
      {
        heading: "What Indian Riders Should Watch Next",
        paragraphs: [
          "The next big shift will be charging confidence for two-wheelers. If dedicated motorcycle-friendly fast charging expands on weekend routes, long-range EV bikes will stop feeling like city-only machines.",
          "Until then, the best buy is the one that matches your real loop: home to office, weekend breakfast ride, occasional intercity run and service-centre access. The longest number is useful only when the rest of the ownership package can support it."
        ],
        subsections: []
      }
    ],
    conclusion: "Buy a long-range electric bike for predictable riding, home charging and premium performance. Do not buy it only because the range number is large; charging support and warranty confidence decide the real value.",
    aliases: [],
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "best-commuter-bikes-india-2026-practical-shortlist",
    targetKeyword: "best commuter bikes India 2026",
    title: "Commuter Bikes in 2026: The Practical Shortlist Is Getting More Tech Without Losing the Point",
    metaTitle: "Best Commuter Bikes India 2026: Practical Buyer Guide",
    metaDescription: "Best commuter bikes India 2026 guide covering Hero Super Splendor XTEC, Honda Shine, TVS Raider, Bajaj commuter options, mileage, service and ownership costs.",
    excerpt: "India's commuter-bike segment is adding Bluetooth, LED lighting and sharper styling, but the winning purchase still depends on mileage, service reach and five-year running cost.",
    category: "Bike News",
    tags: ["best commuter bikes India 2026", "Bike News India", "two wheeler launch updates India", "best commuter bike ownership cost", "Bike Buying Guide"],
    image: "assets/best-commuter-bikes-india-2026-thumbnail.jpg",
    imageAlt: "Best commuter bikes India 2026 thumbnail using official Hero Super Splendor XTEC imagery",
    imageCredit: "Thumbnail: Car News graphic using official Hero MotoCorp Super Splendor XTEC imagery with editorial overlay.",
    thumbnailHeadline: "COMMUTER BIKE CHECK",
    sources: [
      { label: "Hero MotoCorp Super Splendor XTEC official product page", url: "https://www.heromotocorp.com/en-in/motorcycles/practical/super-splendor-xtec.html" },
      { label: "RushLane 2026 Hero Super Splendor XTEC 2.0 launch report", url: "https://www.rushlane.com/2026-hero-splendor-xtec-2-0-125cc-launch-price-rs-86-5k-5-new-colours-12547603.html" },
      { label: "ZigWheels latest commuter bikes India listing", url: "https://www.zigwheels.com/newbikes/latest-commuter-bikes" },
      { label: "Honda Shine official India product page", url: "https://www.honda2wheelersindia.com/motorcycle/shine" }
    ],
    sections: [
      {
        heading: "The Commuter Bike Is Getting Smarter, Not Softer",
        paragraphs: [
          "Best commuter bikes India 2026 is not just a mileage search anymore. Hero's Super Splendor XTEC page shows the direction of the segment: Bluetooth connectivity, USB charging, LED lighting and updated styling now sit beside the old priorities of economy and durability.",
          "That does not mean buyers should start shopping like they are choosing a premium gadget. A commuter bike still has one job: start every morning, sip fuel, survive bad roads and stay cheap to service."
        ],
        subsections: []
      },
      {
        heading: "Mileage Claims Need Real-World Discipline",
        paragraphs: [
          "The 100cc to 125cc commuter class remains attractive because monthly fuel cost is easy to understand. But real mileage depends on traffic, rider weight, tyre pressure, service discipline and how often the bike is ridden with a pillion.",
          "Before buying, ask owners in your city what they actually get in stop-start traffic. A bike with slightly lower brochure mileage but stronger service support nearby may be the calmer five-year purchase."
        ],
        subsections: [
          {
            heading: "Shortlist by use, not popularity",
            paragraphs: [
              "A solo office rider can prioritise mileage and low seat height. A rider carrying family members may need better torque, wider seat comfort and stronger braking. Delivery riders should focus on uptime, spares cost and tyre life."
            ]
          }
        ]
      },
      {
        heading: "Hero, Honda, TVS and Bajaj Are Fighting on Familiar Ground",
        paragraphs: [
          "Hero leans on the Splendor family's trust and service footprint. Honda Shine remains a default 125cc reference for refinement. TVS Raider attracts riders who want more style and features, while Bajaj commuter models continue to appeal to value-focused buyers.",
          "The market impact is that commuter bikes are becoming harder to dismiss as basic transport. Digital consoles and convenience features are filtering down, but the strongest brands are still the ones that make maintenance predictable."
        ],
        subsections: []
      },
      {
        heading: "The Five-Year Cost Check",
        paragraphs: [
          "Calculate on-road price, expected mileage, annual kilometres, insurance renewal, tyre replacement, chain-sprocket cost and service interval. That simple sheet will tell you more than a launch video.",
          "If two bikes are close, choose the one with a better dealer near your home or office. For commuters, convenience is not a luxury feature; it is what keeps the bike from becoming a weekly interruption."
        ],
        subsections: []
      }
    ],
    conclusion: "The best commuter bike in 2026 is still the one that keeps daily travel boring in the best way: low bills, easy service, enough comfort and no drama after the first year.",
    aliases: [],
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "mobile-ai-vs-normal-phone-2026-upgrade-guide",
    targetKeyword: "mobile vs Ai",
    title: "AI Phone or Regular Smartphone: The 2026 Upgrade Decision Indian Buyers Should Slow Down",
    metaTitle: "AI Phone vs Regular Smartphone 2026: India Upgrade Guide",
    metaDescription: "AI phone vs regular smartphone buyer guide for India in 2026, covering Galaxy AI, on-device AI, privacy, performance, software support and upgrade timing.",
    excerpt: "AI is becoming the headline smartphone feature of 2026, but most buyers should separate genuinely useful on-device help from launch-stage demos before upgrading.",
    category: "Mobile Tech",
    tags: ["mobile vs Ai", "AI phone features for Indian buyers", "Mobile Tech India", "Smartphone upgrade guide India", "AI Tech News"],
    image: "assets/mobile-ai-vs-normal-phone-2026-thumbnail.jpg",
    imageAlt: "AI phone versus regular smartphone 2026 thumbnail using official Samsung Galaxy AI imagery",
    imageCredit: "Thumbnail: Car News graphic using official Samsung Newsroom India Galaxy AI imagery with editorial overlay.",
    thumbnailHeadline: "AI PHONE OR NOT?",
    sources: [
      { label: "Samsung Newsroom India Galaxy AI updates", url: "https://news.samsung.com/in/tag/galaxy-ai" },
      { label: "Samsung Galaxy S26 India AI phone launch release", url: "https://news.samsung.com/in/tag/galaxy-ai" },
      { label: "Axios Samsung 2026 smartphone AI strategy report", url: "https://www.axios.com/2026/01/15/samsung-phones-galaxy-ai-plans-updates" },
      { label: "GSMA Mobile Economy 2026 report", url: "https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-economy/wp-content/uploads/2026/02/The-Mobile-Economy-2026.pdf" }
    ],
    sections: [
      {
        heading: "AI Is Now the Sales Pitch",
        paragraphs: [
          "Mobile vs Ai is the upgrade question hiding behind almost every 2026 flagship launch. Samsung's India newsroom has been pushing Galaxy AI updates around the Galaxy S26 cycle, including real-time editing and agentic AI positioning, while other Android brands are racing to make AI sound like a reason to replace a perfectly good phone.",
          "The useful shift is that more features are moving on-device. That can improve speed and privacy, but it also makes chipset, RAM, storage and long-term software support more important than they were during the old camera-megapixel wars."
        ],
        subsections: []
      },
      {
        heading: "Useful AI Is Boring in Daily Life",
        paragraphs: [
          "The best AI phone features are not always the flashiest. Cleaner call transcripts, smarter search across photos, better keyboard rewriting, language help, object removal and faster voice assistance can save time every day. Those features matter more than a staged demo that you use once.",
          "Indian buyers should also check language support, offline availability and whether a feature needs a paid cloud service later. A phone that advertises AI but depends on patchy connectivity or limited language support may not feel smarter in your actual routine."
        ],
        subsections: [
          {
            heading: "Privacy and repairs matter",
            paragraphs: [
              "If personal photos, voice notes and documents are being processed, check whether the feature runs on-device or in the cloud. Also check repair cost and software-update years, because AI features age quickly when updates stop."
            ]
          }
        ]
      },
      {
        heading: "A Regular Phone Can Still Be the Better Buy",
        paragraphs: [
          "For many users, battery life, camera reliability, display quality and network stability will matter more than AI tools. A discounted previous-generation flagship or a strong mid-range phone can be a better purchase if it handles normal apps smoothly and has dependable service support.",
          "AI is worth paying extra for only when it improves the tasks you already do: writing, translating, meetings, content creation, travel planning or photo cleanup. If your use is calls, payments, video, social apps and navigation, do not stretch the budget just for a badge."
        ],
        subsections: []
      },
      {
        heading: "What to Watch Before Upgrading",
        paragraphs: [
          "The 2026 market will likely push AI deeper into mid-range phones. That means waiting can be smart if your current device is still fast and secure. The features that feel premium today may become standard within one or two launch cycles.",
          "A sensible upgrade checklist is simple: minimum four years of useful updates, strong NPU or flagship-class chipset for on-device features, enough RAM, a battery that survives a full day and service support in your city."
        ],
        subsections: []
      }
    ],
    conclusion: "Buy an AI phone when the tools match your daily work and the brand commits to updates. Otherwise, a balanced regular smartphone can still be the sharper 2026 purchase.",
    aliases: [],
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "mobile-gpu-performance-2026-gaming-phone-guide",
    targetKeyword: "mobile in GPu",
    title: "Mobile GPU Upgrades Are the Hidden Spec Gaming Buyers Should Actually Read",
    metaTitle: "Mobile GPU Performance 2026: Gaming Phone Buyer Guide",
    metaDescription: "Mobile GPU performance guide for Indian smartphone buyers in 2026, explaining Snapdragon Adreno upgrades, Unreal Engine demos, thermal limits and gaming-phone value.",
    excerpt: "The processor name gets the attention, but GPU architecture, thermals and sustained performance decide whether a gaming phone still feels fast after 20 minutes.",
    category: "Mobile Tech",
    tags: ["mobile in GPu", "smartphone gaming India", "mobile launch buying advice", "Mobile Tech India", "Phone Buying Guide"],
    image: "assets/mobile-gpu-performance-2026-thumbnail.jpg",
    imageAlt: "Mobile GPU performance 2026 thumbnail using official Qualcomm Snapdragon imagery",
    imageCredit: "Thumbnail: Car News graphic using official Qualcomm Snapdragon imagery with editorial overlay.",
    thumbnailHeadline: "MOBILE GPU CHECK",
    sources: [
      { label: "Qualcomm Snapdragon 8 Gen 5 official product page", url: "https://www.qualcomm.com/smartphones/products/8-series/snapdragon-8-gen-5-mobile-platform" },
      { label: "Qualcomm Unreal Engine 5.4 mobile gaming demo on Snapdragon 8 Elite Gen 5", url: "https://www.qualcomm.com/developer/blog/2026/01/run-unreal-engine-5-content-30fps-snapdragon-mobile" },
      { label: "Qualcomm Adreno GPU official overview", url: "https://www.qualcomm.com/processors/adreno" },
      { label: "GamesRadar 2026 gaming phones overview", url: "https://www.gamesradar.com/best-phones-for-gaming/" }
    ],
    sections: [
      {
        heading: "The GPU Is Where Gaming Phones Prove Themselves",
        paragraphs: [
          "Mobile in GPu may be an awkward search phrase, but the buyer intent is clear: people want to know whether the graphics side of a phone matters. In 2026, it absolutely does. Qualcomm's Snapdragon 8 Gen 5 page points to a newly architected Adreno GPU, faster graphics rendering and better efficiency, which is exactly the area gamers should watch.",
          "CPU speed opens apps and helps short bursts. GPU capability decides frame rate, visual effects, high refresh-rate stability and how quickly a phone heats up when a game keeps running."
        ],
        subsections: []
      },
      {
        heading: "Benchmarks Are Only the First Five Minutes",
        paragraphs: [
          "A gaming phone can post a huge benchmark score and still throttle after sustained load. Buyers should look for thermal design, vapour chamber size, software game modes, charging bypass support and whether the phone holds performance after 20 to 30 minutes.",
          "Qualcomm's Unreal Engine 5.4 demo on Snapdragon 8 Elite Gen 5 is useful because it shows where mobile graphics are heading: heavier lighting, geometry and console-style assets. But a demo chip and a retail phone are not the same thing; the phone maker's cooling and tuning decide the final experience."
        ],
        subsections: [
          {
            heading: "What specs to read",
            paragraphs: [
              "Check GPU generation, display refresh rate, touch sampling, RAM type, storage speed, battery capacity, cooling claims and whether popular games are actually allowed to run at high frame rates on that model."
            ]
          }
        ]
      },
      {
        heading: "AI and GPU Are Starting to Meet",
        paragraphs: [
          "The latest phone platforms do not treat gaming, AI and imaging as separate worlds. GPU, NPU and ISP improvements increasingly work together for frame generation, image enhancement, background blur, video processing and smarter power management.",
          "That is good news for buyers who keep phones for three or four years. A stronger graphics subsystem can age better as games and AI features become heavier, provided the brand continues software updates."
        ],
        subsections: []
      },
      {
        heading: "The India Buyer Angle",
        paragraphs: [
          "In India, the best gaming-phone value is rarely the most expensive flagship. It is often the phone that balances chipset, cooling, battery and service support under a clear budget. A high-end Snapdragon or Dimensity chip is useful, but not if the display dims quickly or the service centre is far away.",
          "Before buying, watch long-session gaming tests, not only unboxing benchmarks. Also check weight and heat comfort, because a phone that performs well but feels uncomfortable in hand will not be enjoyable for daily play."
        ],
        subsections: []
      }
    ],
    conclusion: "For gaming and heavy creative use, the mobile GPU is not a background spec. Buy the phone that sustains graphics performance, manages heat and keeps software support alive after the launch hype fades.",
    aliases: [],
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  }
];

const thumbnailSources = {
  "punch-ev-vs-nexon-ev-2026-buyer-choice": {
    brand: "Tata Motors",
    product: "Punch.ev",
    url: "https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2024/01/Punch.ev-Empowered-Oxide-Front-3-4th-scaled.jpg",
    crop: "left-weighted vehicle crop with yellow EV comparison overlay",
    accent: "#ffc72c"
  },
  "best-ev-under-20-lakhs-india-2026-shortlist": {
    brand: "Mahindra Electric Origin SUV",
    product: "BE 6",
    url: "https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dweffbfc9d/homepage/26-05-MEAL-ESUVS-12514440-MG-WEBSITE-BANNER_DESKTOP_1920X960_OPT-1.jpg",
    crop: "wide SUV banner crop with price-shortlist overlay",
    accent: "#00d084"
  },
  "longest-range-electric-bikes-india-2026-reality-check": {
    brand: "Ultraviolette",
    product: "F77 SuperStreet",
    url: "https://d2atk76x06g5eh.cloudfront.net/website/india/navbar/vehicles/superstreet_2.png",
    crop: "center motorcycle crop with range-watch overlay",
    accent: "#00e09a"
  },
  "best-commuter-bikes-india-2026-practical-shortlist": {
    brand: "Hero MotoCorp",
    product: "Super Splendor XTEC",
    url: "https://www.heromotocorp.com/content/dam/hero-commerce/in/en/products/executive/content-fragments/super-splendor-xtec/assets/banner/splendorxtec-web-banner.jpg",
    crop: "right-side commuter bike crop with ownership-cost overlay",
    accent: "#ff3b30"
  },
  "mobile-ai-vs-normal-phone-2026-upgrade-guide": {
    brand: "Samsung",
    product: "Galaxy AI",
    url: "https://img.global.news.samsung.com/in/wp-content/uploads/2026/02/Main-Flagship-Image-Feature-728x409.jpg",
    crop: "center Galaxy AI newsroom image with blue upgrade overlay",
    accent: "#48beff"
  },
  "mobile-gpu-performance-2026-gaming-phone-guide": {
    brand: "Qualcomm",
    product: "Snapdragon mobile GPU",
    url: "https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/images/company/news-media/media-center/press-kits/snapdragon-summit-2025-press-kit/day-2-/images/snapdragon-8-elite-gen-5-chipset-rendering.jpg",
    fallbackUrl: "https://img.global.news.samsung.com/in/wp-content/uploads/2026/06/ss.jpg",
    crop: "chipset/product-performance crop with GPU-focused overlay",
    accent: "#8f5cff"
  }
};

async function download(url, file) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10000) throw new Error(`Downloaded file too small: ${url}`);
  fs.writeFileSync(file, buf);
}

function drawThumbnail(src, dest, post, meta) {
  const badge = post.category === "Mobile Tech" ? "TECH BUYER ALERT" : post.category === "Bike News" ? "RIDER GUIDE" : "EV BUYER GUIDE";
  const title = (post.thumbnailHeadline || post.title).toUpperCase();
  const args = [
    src,
    "-auto-orient",
    "-resize", "1600x900^",
    "-gravity", "center",
    "-extent", "1600x900",
    "(", "-size", "1600x900", "gradient:rgba(0,0,0,0.88)-rgba(0,0,0,0.18)", ")",
    "-compose", "multiply",
    "-composite",
    "-fill", meta.accent,
    "-draw", "rectangle 70,64 535,126",
    "-fill", "black",
    "-font", "Arial-Bold",
    "-pointsize", "32",
    "-annotate", "+94+105", badge,
    "-fill", "white",
    "-font", "Arial-Bold",
    "-pointsize", "74",
    "-interline-spacing", "6",
    "-gravity", "west",
    "-annotate", "+72+15", title,
    "-gravity", "southwest",
    "-pointsize", "26",
    "-fill", "white",
    "-annotate", "+72+82", "Fresh India update | Buyer-first analysis | Car News",
    "-fill", meta.accent,
    "-draw", "rectangle 0,836 1600,854",
    "-quality", "88",
    dest
  ];
  execFileSync("magick.exe", args.map(escArg), { stdio: "pipe" });
}

async function makeThumbnails() {
  const results = [];
  for (const post of newPosts) {
    const meta = thumbnailSources[post.slug];
    const raw = path.join(tmpDir, `${post.slug}-raw`);
    const dest = path.join(root, post.image);
    try {
      await download(meta.url, raw);
    } catch (error) {
      if (!meta.fallbackUrl) throw error;
      await download(meta.fallbackUrl, raw);
      meta.url = meta.fallbackUrl;
      meta.brand = "Samsung";
      meta.product = "Galaxy mobile performance image";
    }
    drawThumbnail(raw, dest, post, meta);
    const hash = sha256(dest);
    results.push({ slug: post.slug, hash, ...meta });
  }
  const sheet = path.join(root, "assets", "daily-thumbnails-2026-06-06-contact-sheet.jpg");
  execFileSync("magick.exe", [
    "montage",
    ...newPosts.map((post) => path.join(root, post.image)),
    "-thumbnail", "480x270",
    "-background", "#111111",
    "-bordercolor", "#111111",
    "-border", "8",
    "-tile", "3x2",
    "-geometry", "+18+18",
    sheet
  ], { stdio: "pipe" });
  return { results, sheet };
}

function ensureLogShape(log) {
  log.cursors ||= { car: 0, bike: 0, mobile: 0 };
  for (const key of ["publishedKeywords", "publishedSlugs", "thumbnailHashes", "thumbnailSources", "thumbnailSourceIdentities", "facebookUrls", "runs"]) {
    if (!Array.isArray(log[key])) log[key] = [];
  }
  return log;
}

function updateData(thumbnailResults, sheet) {
  const posts = readJson(postsPath, []);
  const existingSlugs = new Set(posts.map((post) => post.slug));
  const existingKeywords = new Set(posts.map((post) => String(post.targetKeyword).trim().toLowerCase()));
  for (const post of newPosts) {
    if (existingSlugs.has(post.slug)) throw new Error(`Duplicate slug: ${post.slug}`);
    if (existingKeywords.has(post.targetKeyword.toLowerCase())) throw new Error(`Duplicate keyword: ${post.targetKeyword}`);
  }
  writeJson(postsPath, [...newPosts, ...posts]);

  const log = ensureLogShape(readJson(logPath, {}));
  const resultBySlug = new Map(thumbnailResults.map((item) => [item.slug, item]));
  for (const item of selections) log.publishedKeywords.push(item.keyword);
  for (const post of newPosts) {
    const result = resultBySlug.get(post.slug);
    log.publishedSlugs.push(post.slug);
    log.thumbnailHashes.push(result.hash);
    log.thumbnailSources.push(result.url);
    log.thumbnailSourceIdentities.push(`official:${result.brand}:${result.product}:${result.url}:${result.crop}:sha256=${result.hash}`);
  }
  log.cursors.car = 12;
  log.cursors.bike = 6;
  log.cursors.mobile = 6;
  log.runs = [{
    ranAt: new Date().toISOString(),
    commit: null,
    mode: "codex-generated-pre-finalize",
    selectedKeywords: selections,
    articles: newPosts.map((post) => ({
      slug: post.slug,
      keyword: post.targetKeyword,
      category: post.category,
      url: `${siteUrl}/posts/${post.slug}.html`,
      image: post.image
    })),
    thumbnailAudit: {
      contactSheet: "assets/daily-thumbnails-2026-06-06-contact-sheet.jpg",
      status: "created_for_visual_review",
      note: "Six thumbnails use distinct official-source products, crops, colors and headline layouts."
    },
    facebook: []
  }, ...log.runs];
  writeJson(logPath, log);
}

(async () => {
  const { results, sheet } = await makeThumbnails();
  const hashes = new Set(results.map((item) => item.hash));
  if (hashes.size !== results.length) throw new Error("Duplicate thumbnail hash in generated batch.");
  updateData(results, sheet);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`Generated ${newPosts.length} posts and thumbnails.`);
  console.log(`Contact sheet: ${path.relative(root, sheet)}`);
})();
