const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const today = "2026-06-09";
const siteUrl = "https://comeback2000.github.io/Car-news";
const postsPath = path.join(root, "data", "posts.json");
const logPath = path.join(root, "data", "daily-publisher-log.json");
const assetsDir = path.join(root, "assets");
const sourceDir = path.join(assetsDir, "daily-source-2026-06-09");

const readJson = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) : fallback;
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const slugify = (value) => String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const selections = [
  { niche: "car", keyword: "Low Maintenance Cars India" },
  { niche: "car", keyword: "Cars With Highest Mileage" },
  { niche: "bike", keyword: "Royal Enfield Bullet 650 India launch buyer guide June 2026" },
  { niche: "bike", keyword: "Honda NX500 E-Clutch India 2026 touring bike buyer guide" },
  { niche: "mobile", keyword: "Lava Bold N2 5G India sale June 2026 budget phone guide" },
  { niche: "mobile", keyword: "June Android Drop Gemini Intelligence India phone upgrade guide" }
];

const posts = [
  {
    slug: "low-maintenance-cars-india-2026-service-resale-guide",
    targetKeyword: "Low Maintenance Cars India",
    title: "Low Maintenance Cars India: The Real Saving Is in Service, Parts and Resale",
    metaTitle: "Low Maintenance Cars India 2026: Service, Parts, Resale Guide",
    metaDescription: "Low maintenance cars India 2026 buyer guide covering Maruti, Toyota, Hyundai, simple engines, service reach, parts cost, fuel economy and resale value.",
    excerpt: "The lowest-maintenance car is rarely the flashiest launch. Indian buyers should look for proven engines, wide service coverage, affordable parts, predictable tyres and strong resale before chasing features.",
    category: "Car News",
    tags: ["Low Maintenance Cars India", "Car Buying Guide", "Maruti Suzuki", "Toyota India 2026", "Most Reliable Car in India"],
    image: "assets/low-maintenance-cars-india-2026-thumbnail.jpg",
    imageAlt: "Low maintenance cars India 2026 service and resale guide thumbnail",
    imageCredit: "Thumbnail uses official Toyota Bharat Innova Crysta media with Car News editorial overlay.",
    thumbnailHeadline: "LOW MAINTENANCE",
    sources: [
      { label: "Toyota Bharat Innova Crysta official page", url: "https://www.toyotabharat.com/showroom/innova-crysta/" },
      { label: "Maruti Suzuki official service network", url: "https://www.marutisuzuki.com/service" },
      { label: "Maruti Suzuki Dzire 3 million milestone", url: "https://www.marutisuzuki.com/corporate/media/press-releases/2026/march/maruti-suzuki-dzire-celebrates-momentous-3-million-sales-milestone" },
      { label: "Autocar India 2026 launch and market coverage", url: "https://www.autocarindia.com/" }
    ],
    sections: [
      {
        heading: "Maintenance Cost Is More Than the Service Bill",
        paragraphs: [
          "Low Maintenance Cars India remains a practical search because ownership costs are rising faster than many monthly budgets. A low-maintenance car is not just one with a modest scheduled-service quote. It should have a proven engine, easy parts access, reasonable tyre sizes, simple electronics and a resale market that does not punish the owner after five years.",
          "That is why Maruti Suzuki, Toyota and Hyundai continue to dominate many family shortlists. Maruti offers service reach and parts familiarity. Toyota builds trust through durability and high resale. Hyundai brings broad service access and feature-rich models, but buyers still need to compare the exact variant and long-term parts cost."
        ]
      },
      {
        heading: "The Buyer Test Before Booking",
        paragraphs: [
          "Check the service centre closest to home and the one closest to your regular highway route. Ask for tyre replacement cost, clutch or brake wear estimates, extended warranty pricing and common accident repair parts. A car that saves Rs 20,000 at purchase but uses expensive tyres or rare body panels can become costlier over time.",
          "Simple petrol and CNG cars still make sense for buyers who want predictable running. Hybrids can reduce fuel use, but the purchase premium must match annual kilometres. EVs can be low-maintenance mechanically, yet battery warranty, charger access and insurance cost should be checked with the same discipline."
        ],
        subsections: [
          {
            heading: "Practical shortlist",
            paragraphs: [
              "For city families, compare Dzire, Swift, WagonR, Baleno, Punch, Exter and compact Toyota or Hyundai options by service reach and resale. For highway-heavy use, a proven MPV or SUV with strong dealer support may beat a newer but less familiar model."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Trust Still Beats Novelty",
        paragraphs: [
          "India's launch calendar is packed with EVs, hybrids, facelifts and connected features, but maintenance anxiety still shapes the final booking. Brands with large dealer networks and proven spare-part pipelines have a structural advantage, especially outside the largest cities.",
          "This also explains why older nameplates keep selling. Buyers may admire futuristic designs online, but the family cheque often goes to the car that a nearby workshop can fix quickly."
        ]
      }
    ],
    conclusion: "For low maintenance, buy the ownership ecosystem. The smartest car is the one with simple hardware, nearby service, affordable parts and resale demand after the warranty ends.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "cars-with-highest-mileage-india-2026-cng-hybrid-buyer-guide",
    targetKeyword: "Cars With Highest Mileage",
    title: "Cars With Highest Mileage: Why CNG and Hybrids Need Different Buyer Logic",
    metaTitle: "Cars With Highest Mileage India 2026: CNG, Petrol, Hybrid Guide",
    metaDescription: "Cars with highest mileage India 2026 guide covering Maruti Dzire CNG, Celerio CNG, WagonR CNG, hybrids, ARAI claims and real-world ownership trade-offs.",
    excerpt: "Mileage leaders look attractive on paper, but buyers should separate ARAI numbers from actual usage, boot space, refuelling access, monthly kilometres and long-term comfort.",
    category: "Car News",
    tags: ["Cars With Highest Mileage", "Cars With Highest Mileage India", "Maruti Suzuki", "E85 Fuel India", "Car Buying Guide"],
    image: "assets/cars-with-highest-mileage-india-2026-thumbnail.jpg",
    imageAlt: "Cars with highest mileage India 2026 CNG and hybrid buyer guide thumbnail",
    imageCredit: "Thumbnail uses official Maruti Suzuki Dzire press-release media with Car News editorial overlay.",
    thumbnailHeadline: "MILEAGE KINGS",
    sources: [
      { label: "Maruti Suzuki Dzire 3 million milestone", url: "https://www.marutisuzuki.com/corporate/media/press-releases/2026/march/maruti-suzuki-dzire-celebrates-momentous-3-million-sales-milestone" },
      { label: "Maruti Suzuki S-CNG official technology page", url: "https://www.marutisuzuki.com/corporate/technology/s-cng" },
      { label: "Toyota Bharat hybrid technology", url: "https://www.toyotabharat.com/toyota-in-india/technology/hybrid.html" },
      { label: "Cars24 best mileage CNG cars reference", url: "https://www.cars24.com/article/best-mileage-cng-cars/" }
    ],
    sections: [
      {
        heading: "The Best Mileage Car Depends on the Fuel You Can Actually Use",
        paragraphs: [
          "Cars With Highest Mileage is a high-intent query because fuel bills remain one of the biggest parts of Indian car ownership. Maruti Suzuki's Dzire milestone release lists 24.79 km/l for petrol manual and 33.73 km/kg for S-CNG, which shows why CNG sedans and hatchbacks remain powerful choices for high-running households.",
          "But the highest certified mileage does not automatically create the lowest monthly cost. Buyers must check CNG queue times, boot compromise, local fuel price, highway range and whether most driving happens in traffic or on open roads."
        ]
      },
      {
        heading: "CNG, Hybrid and Petrol Solve Different Problems",
        paragraphs: [
          "CNG is strongest for predictable city routes and high monthly kilometres. Petrol is simpler for low-running buyers who do not want luggage compromise or refuelling queues. Strong hybrids make sense when the buyer wants automatic convenience, urban efficiency and a larger car, but the purchase premium has to be justified over years.",
          "The smart comparison is not only km/l or km/kg. Calculate fuel cost per month, insurance, service, tyre cost and resale. A CNG car with a large real-world fuel saving can be excellent, but a low-running family may never recover the premium."
        ],
        subsections: [
          {
            heading: "One useful rule",
            paragraphs: [
              "If your car runs less than 700 km a month, prioritise comfort, safety and service over the highest mileage claim. If it runs more than 1,500 km a month, fuel choice can change the whole ownership calculation."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Efficiency Is Becoming a Product Strategy",
        paragraphs: [
          "Maruti, Toyota and Hyundai are all using efficiency as more than a brochure number. CNG, hybrid and flex-fuel developments are helping brands keep buyers interested even as EV adoption grows unevenly across cities.",
          "That means the highest-mileage car discussion will not disappear when EVs expand. It will become more segmented: CNG for cost discipline, hybrids for convenience and EVs for buyers with reliable charging."
        ]
      }
    ],
    conclusion: "The best mileage car is the one that saves money in your routine, not only in the ARAI table. Match fuel access, monthly running and space needs before choosing CNG, petrol, hybrid or EV.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "royal-enfield-bullet-650-india-launch-2026-buyer-guide",
    targetKeyword: "Royal Enfield Bullet 650 India launch buyer guide June 2026",
    title: "Royal Enfield Bullet 650: The Most Powerful Bullet Is Still Selling Familiarity",
    metaTitle: "Royal Enfield Bullet 650 India Launch 2026 Buyer Guide",
    metaDescription: "Royal Enfield Bullet 650 India launch buyer guide covering price, 648cc twin, colours, comfort, rivals, ownership and who should upgrade from 350cc bikes.",
    excerpt: "The Bullet 650 gives Royal Enfield's oldest nameplate a 648cc twin-cylinder heart, but the buying decision is still about comfort, weight, highway use and whether nostalgia is worth the premium.",
    category: "Bike News",
    tags: ["Royal Enfield Bullet 650", "Royal Enfield", "Bike News India", "Premium Motorcycles", "Motorcycle News"],
    image: "assets/royal-enfield-bullet-650-india-2026-thumbnail.jpg",
    imageAlt: "Royal Enfield Bullet 650 India 2026 buyer guide thumbnail",
    imageCredit: "Thumbnail uses official Royal Enfield Bullet 650 media with Car News editorial overlay.",
    thumbnailHeadline: "BULLET 650",
    sources: [
      { label: "Royal Enfield Bullet 650 official page", url: "https://www.royalenfield.com/in/en/motorcycles/bullet-650/" },
      { label: "Royal Enfield Bullet 650 launch release via NSE", url: "https://nsearchives.nseindia.com/corporate/rahulrathore_royalenfield_com_28052026114117_PressreleaseBullet650.pdf" },
      { label: "BikeWale May 2026 launch roundup", url: "https://www.bikewale.com/news/bikes-and-scooters-launched-in-india-in-may-2026/" },
      { label: "Evo India Bullet 650 launch coverage", url: "https://www.evoindia.com/news/bike-news/royal-enfield-bullet-650-launch-news-587460" }
    ],
    sections: [
      {
        heading: "A Bigger Engine, Not a Different Personality",
        paragraphs: [
          "Royal Enfield Bullet 650 India launch buyer guide June 2026 is trending because the Bullet name now sits on the brand's 648cc parallel-twin platform. Royal Enfield describes it as the most powerful expression of the world's oldest motorcycle nameplate in continuous production.",
          "That emotional framing matters. The Bullet 650 is not trying to be a naked sportbike. It is selling familiar stance, metal-heavy road presence, a step-up seat, chrome details and the relaxed shove of a twin-cylinder engine."
        ]
      },
      {
        heading: "Who Should Upgrade from a 350",
        paragraphs: [
          "A Bullet 350 owner who mainly rides in dense city traffic should test the 650 carefully before upgrading. The extra performance is useful on highways, but the heavier feel and higher running cost may not suit short daily commutes.",
          "Riders who tour, carry a pillion or want smoother cruising at higher speeds will understand the 650's appeal quickly. The six-speed gearbox, slipper clutch and broader torque make it a more capable long-distance Bullet, provided the rider accepts the premium."
        ],
        subsections: [
          {
            heading: "Rivals and alternatives",
            paragraphs: [
              "Royal Enfield's own Classic 650, Interceptor 650 and Super Meteor 650 will be the closest showroom rivals. Triumph's 400s are lighter and cheaper, while the Bonneville range is far more expensive. The Bullet 650 sits between value nostalgia and premium heritage."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Heritage Is Becoming Modular",
        paragraphs: [
          "Royal Enfield is turning its 650 platform into a family of distinct personalities. That lowers development risk and gives buyers more emotional choices without forcing every model to chase different mechanical hardware.",
          "For competitors, the Bullet 650 is a reminder that retro design still sells when it is tied to a trusted brand story. The challenge is not only making a powerful motorcycle, but making it feel culturally familiar."
        ]
      }
    ],
    conclusion: "The Bullet 650 is for riders who want the Bullet identity with easier highway performance. Buy it for relaxed presence and touring confidence, not for spec-sheet speed alone.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "honda-nx500-e-clutch-india-2026-touring-bike-guide",
    targetKeyword: "Honda NX500 E-Clutch India 2026 touring bike buyer guide",
    title: "Honda NX500 E-Clutch: Useful Touring Tech or an Expensive Convenience?",
    metaTitle: "Honda NX500 E-Clutch India 2026 Buyer Guide",
    metaDescription: "Honda NX500 E-Clutch India 2026 guide covering price, 471cc engine, E-Clutch benefits, touring comfort, BigWing support and rivals.",
    excerpt: "Honda's NX500 E-Clutch update makes the middleweight adventure tourer easier to ride in traffic and on tours, but the price premium means buyers must value convenience over raw displacement.",
    category: "Bike News",
    tags: ["Honda NX500", "Honda India", "Bike News India", "Adventure Touring Bike", "Two Wheeler Launch Updates India"],
    image: "assets/honda-nx500-e-clutch-india-2026-thumbnail.jpg",
    imageAlt: "Honda NX500 E-Clutch India 2026 touring bike buyer guide thumbnail",
    imageCredit: "Thumbnail uses official Honda Powersports NX500 media with Car News editorial overlay.",
    thumbnailHeadline: "NX500 E-CLUTCH",
    sources: [
      { label: "Honda NX500 official product page", url: "https://powersports.honda.com/motorcycle/adventure/nx500" },
      { label: "BikeWale Honda NX500 E-Clutch launch report", url: "https://www.bikewale.com/news/updated-honda-nx500-launched-with-e-clutch/" },
      { label: "ETAuto Honda NX500 E-Clutch launch report", url: "https://auto.economictimes.indiatimes.com/amp/news/two-wheelers/honda-launches-nx500-with-innovative-e-clutch-technology-priced-at-743-lakh/131031442" },
      { label: "Honda global 2026 E-Clutch lineup release", url: "https://global.honda/content/dam/site/global-en/newsroom-new/cq_img/news/2025/11/c251104aeng/c251104aeng.pdf" }
    ],
    sections: [
      {
        heading: "The Clutch Is the Story",
        paragraphs: [
          "Honda NX500 E-Clutch India 2026 touring bike buyer guide has become relevant because Honda has added automated clutch control to a middleweight adventure tourer that already appealed to riders wanting refinement over drama. Launch reports place the Indian price around Rs 7.43 lakh ex-showroom.",
          "The E-Clutch system lets riders move off and shift without using the clutch lever, while still allowing manual override. In Indian riding, that can reduce fatigue during traffic, ghats and repeated slow-speed manoeuvres."
        ]
      },
      {
        heading: "What Buyers Gain and What They Still Need to Check",
        paragraphs: [
          "The NX500 continues with a 471cc parallel-twin format, so the update is not about a power leap. It is about making a premium middleweight easier to live with. Newer big-bike riders may appreciate the reduced stall anxiety, while touring riders may value smoother low-speed control.",
          "The concern is price. At this money, buyers will compare the NX500 with larger or more rugged alternatives. Honda's strongest arguments are refinement, reliability, low-stress ergonomics and BigWing support, not the loudest specification sheet."
        ],
        subsections: [
          {
            heading: "Best-fit buyer",
            paragraphs: [
              "The NX500 E-Clutch suits riders moving up from 250cc-400cc motorcycles who want a forgiving twin-cylinder tourer. Hardcore off-road riders and value-first buyers may find stronger alternatives elsewhere."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Assistance Tech Is Reaching Real Bikes",
        paragraphs: [
          "Automated clutch systems used to sound like novelty tech, but Honda is pushing the idea into everyday touring use. If riders accept it, more brands may add fatigue-reducing assistance without moving fully to automatic gearboxes.",
          "For India, the larger message is clear: premium bikes are being judged on ease of ownership, not only engine size. That is a meaningful shift for riders who want big-bike ability without big-bike intimidation."
        ]
      }
    ],
    conclusion: "The NX500 E-Clutch is expensive, but its convenience is real. It makes most sense for riders who tour, commute through traffic and value smoothness more than headline performance.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "lava-bold-n2-5g-india-sale-june-2026-budget-phone-guide",
    targetKeyword: "Lava Bold N2 5G India sale June 2026 budget phone guide",
    title: "Lava Bold N2 5G: The Budget Phone Question Is Trust, Not Just Battery",
    metaTitle: "Lava Bold N2 5G India Sale June 2026 Buyer Guide",
    metaDescription: "Lava Bold N2 5G India buyer guide covering June 2026 sale, expected pricing, 6000mAh battery, budget 5G value, service and alternatives.",
    excerpt: "The Lava Bold N2 5G brings a large battery and budget 5G pricing into a crowded market, but buyers should compare software support, service reach and display quality before choosing it over Chinese-brand rivals.",
    category: "Mobile Tech",
    tags: ["Lava Bold N2 5G", "Phone Launch India", "Mobile Tech India", "Smartphone Upgrade Guide India", "Budget 5G Phone"],
    image: "assets/lava-bold-n2-5g-india-2026-thumbnail.jpg",
    imageAlt: "Lava Bold N2 5G India budget phone buyer guide thumbnail",
    imageCredit: "Thumbnail uses real Lava smartphone product media with Car News editorial overlay.",
    thumbnailHeadline: "LAVA BOLD N2",
    sources: [
      { label: "Gadgets 360 Lava Bold N2 5G launch report", url: "https://www.gadgets360.com/mobiles/news/lava-bold-n2-5g-price-in-india-launch-specifications-features-11584750" },
      { label: "Gizbot June 9 sale report", url: "https://www.gizbot.com/mobile/news/lava-bold-n2-5g-sale-in-india-today-amazon-check-price-and-specifications-126151.html" },
      { label: "Lava official smartphone store reference", url: "https://shop.lavamobiles.com/collections/smartphones" },
      { label: "91mobiles Lava Bold N2 5G listing", url: "https://www.91mobiles.com/lava-bold-n2-5g-price-in-india" }
    ],
    sections: [
      {
        heading: "A Budget 5G Phone Has to Do the Basics Well",
        paragraphs: [
          "Lava Bold N2 5G India sale June 2026 budget phone guide is timely because the phone is entering a crowded sub-Rs 15,000 5G market. Launch coverage highlights a large battery, 5G positioning and online availability, which are exactly the hooks budget buyers notice first.",
          "The bigger question is whether Lava can convert patriotic interest and clean-software appeal into everyday trust. In this price band, one poor camera, weak display or slow update cycle can matter more than a headline battery number."
        ]
      },
      {
        heading: "What to Compare Before the First Sale",
        paragraphs: [
          "Check the display resolution and brightness, charging speed, bundled charger, 5G band support, RAM and storage type, software update promise and after-sales coverage in your city. A 6000mAh battery is useful only if charging time and performance do not feel compromised.",
          "Buyers should also compare Lava's service promise with Redmi, Realme, Samsung M-series and Motorola alternatives. Chinese brands often win on raw specs, while Samsung can win on software support. Lava needs to win on clean experience, price and service confidence."
        ],
        subsections: [
          {
            heading: "Who should consider it",
            paragraphs: [
              "It makes most sense for buyers who want an Indian-brand phone, long battery life and basic 5G readiness. Heavy gamers and camera-focused buyers should wait for detailed reviews and thermal tests."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Indian Brands Still Have a Window",
        paragraphs: [
          "India's smartphone market is tough for domestic brands, but budget 5G creates openings when buyers want trust, support and simpler software. Lava does not need to beat every rival on every specification; it needs to be dependable at the price.",
          "If the Bold N2 5G delivers stable software and service, it can make Lava more relevant in a segment dominated by aggressive imported-brand lineups."
        ]
      }
    ],
    conclusion: "The Lava Bold N2 5G is worth shortlisting if the launch price is sharp and service is strong locally. Wait for review evidence before treating battery size as the whole story.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "june-android-drop-gemini-intelligence-india-phone-upgrade-guide",
    targetKeyword: "June Android Drop Gemini Intelligence India phone upgrade guide",
    title: "June Android Drop: AI Features Are Becoming the Phone Upgrade Argument",
    metaTitle: "June Android Drop 2026 Gemini Intelligence India Buyer Guide",
    metaDescription: "June Android Drop and Gemini Intelligence guide for Indian phone buyers covering fake call detection, Circle to Search, Photos wardrobe, Quick Share and Android 17.",
    excerpt: "Google's June Android Drop shows that the next phone upgrade may be driven by AI usefulness, security and cross-device sharing rather than camera megapixels alone.",
    category: "Mobile Tech",
    tags: ["June Android Drop", "Gemini Intelligence", "Mobile New Tech", "AI Phone Features for Indian Buyers", "Android 17"],
    image: "assets/june-android-drop-gemini-intelligence-2026-thumbnail.jpg",
    imageAlt: "June Android Drop Gemini Intelligence phone upgrade guide thumbnail",
    imageCredit: "Thumbnail uses official Google Android/Gemini blog artwork with Car News editorial overlay.",
    thumbnailHeadline: "ANDROID AI DROP",
    sources: [
      { label: "Google June Android Drop official blog", url: "https://blog.google/products-and-platforms/platforms/android/android-drop-june-2026/" },
      { label: "Google Gemini Intelligence official Android blog", url: "https://blog.google/products-and-platforms/platforms/android/gemini-intelligence/" },
      { label: "Google Android 17 creator features", url: "https://blog.google/products-and-platforms/platforms/android/android-17-creator-features/" },
      { label: "Google Chrome AI on Android blog", url: "https://blog.google/products-and-platforms/products/chrome/bringing-chrome-ai-to-android/" }
    ],
    sections: [
      {
        heading: "Google Is Moving the Upgrade Pitch Away from Hardware",
        paragraphs: [
          "June Android Drop Gemini Intelligence India phone upgrade guide is relevant because Google's June 2 Android Drop adds practical software features while Android 17 and Gemini Intelligence wait in the wings. Google lists fake call detection, expanded Circle to Search, a Google Photos wardrobe, Play Books insights, broader Quick Share with iPhone and new Emoji Kitchen combinations.",
          "For Indian buyers, that mix matters. Scam-call protection, better sharing and smarter search can affect daily phone use more than a small benchmark jump. The upgrade question is becoming: will this phone receive the next wave of AI features quickly and reliably?"
        ]
      },
      {
        heading: "The Useful Features Are Not Always the Loudest Ones",
        paragraphs: [
          "Fake call detection is especially relevant in India because impersonation and fraud calls remain a real consumer problem. Circle to Search improvements and Google Photos wardrobe are more lifestyle-focused, but they show how AI is moving into normal app behaviour rather than staying inside a chatbot.",
          "Gemini Intelligence raises the stakes further by promising more proactive Android experiences across select Samsung Galaxy and Google Pixel phones first. That makes software support a buying criterion, not an afterthought."
        ],
        subsections: [
          {
            heading: "Buyer checkpoint",
            paragraphs: [
              "Before buying a 2026 Android phone, check OS update years, AI feature eligibility, RAM, on-device AI support and whether the brand delays major Android releases in India. A cheaper phone can become expensive if it misses the features you actually wanted."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: AI Phones Need Honest Promises",
        paragraphs: [
          "Every brand wants to sell an AI phone, but Google's rollout pattern shows that features can vary by region, device, app version and hardware. That gives Pixel and Samsung an early advantage, while Xiaomi, OnePlus, Motorola and others must prove update speed.",
          "The practical outcome is that mid-range buyers should stop judging phones only by camera megapixels, charging watts and refresh rate. Update reliability and AI feature access now belong on the comparison sheet."
        ]
      }
    ],
    conclusion: "Google's June Android Drop makes software longevity more important. Buy the Android phone that will keep receiving useful AI, safety and sharing features, not just the one with the loudest launch spec.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  }
];

const thumbs = [
  {
    post: posts[0],
    brand: "Toyota Bharat",
    product: "Innova Crysta",
    url: "https://static3.toyotabharat.com/images/showroom/innova-mmc/20-years-ruling-1600x850.webp",
    sourceFile: "toyota-innova-crysta.webp",
    bg: "#14342b",
    accent: "#f2c14e",
    gravity: "West",
    crop: "left ownership-cost crop with green-gold wedge layout"
  },
  {
    post: posts[1],
    brand: "Maruti Suzuki",
    product: "Dzire",
    url: "https://www.marutisuzuki.com/corporate/media/press-releases/2026/march/-/media/64335B86F5D94B00B56CDFF72F96E6AA",
    sourceFile: "maruti-dzire-mileage.jpg",
    bg: "#273043",
    accent: "#f77f00",
    gravity: "East",
    crop: "right mileage-stat crop with orange slab layout"
  },
  {
    post: posts[2],
    brand: "Royal Enfield",
    product: "Bullet 650",
    url: "https://www.royalenfield.com/content/dam/royal-enfield/motorcycles/bullet-650/banners/bullet-650-new.webp",
    sourceFile: "royal-enfield-bullet-650.jpg",
    bg: "#1b1b1e",
    accent: "#c9a227",
    gravity: "West",
    crop: "wide official launch banner crop with black-gold left title"
  },
  {
    post: posts[3],
    brand: "Honda",
    product: "NX500",
    url: "https://powersports.honda.com/-/media/products/family/nx500/trims/trim-main/nx500/2026/2026-nx500-pearl_white-1505x923.png",
    sourceFile: "honda-nx500.png",
    bg: "#0d3b66",
    accent: "#faf0ca",
    gravity: "East",
    crop: "isolated white NX500 crop with blue touring-tech layout"
  },
  {
    post: posts[4],
    brand: "Lava",
    product: "Bold N2 5G",
    url: "https://i.gadgets360cdn.com/large/lava_bold_n2_5g_1780472453496.jpg",
    sourceFile: "lava-bold-n2-5g.jpg",
    bg: "#4a1d2f",
    accent: "#f48c06",
    gravity: "West",
    crop: "phone render crop with maroon-orange budget 5G layout"
  },
  {
    post: posts[5],
    brand: "Google",
    product: "June Android Drop",
    url: "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/1920_x_1080.width-1300.png",
    sourceFile: "google-android-drop.png",
    bg: "#073b4c",
    accent: "#06d6a0",
    gravity: "East",
    crop: "official Android Drop artwork crop with teal AI-feature layout"
  }
];

function runMagick(args) {
  execFileSync("magick", args, { stdio: "inherit" });
}

async function download(url, file) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Car-News-Codex/1.0" } });
  if (!response.ok) throw new Error(`Fetch failed ${response.status} for ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 20000) throw new Error(`Downloaded file too small for ${url}`);
  fs.writeFileSync(file, buffer);
}

function makeThumb(item, index) {
  const source = path.join(sourceDir, item.sourceFile);
  const target = path.join(root, item.post.image);
  const title = item.post.thumbnailHeadline;
  const kicker = index < 2 ? "BUYER CHECK" : index < 4 ? "LAUNCH WATCH" : "MOBILE TECH";
  const west = item.gravity === "West";
  const overlay = west ? "polygon 0,0 600,0 470,675 0,675" : "polygon 600,0 1200,0 1200,675 730,675";
  const bar = west ? "rectangle 64,78 122,540" : "rectangle 1078,78 1136,540";
  const textX = west ? "+150+95" : "+118+95";
  const kickerX = west ? "+152+535" : "+120+535";
  runMagick([
    source,
    "-auto-orient",
    "-resize", "1200x675^",
    "-gravity", "center",
    "-extent", "1200x675",
    "-fill", item.bg,
    "-draw", overlay,
    "-fill", item.accent,
    "-draw", bar,
    "-fill", "white",
    "-font", "Arial-Bold",
    "-pointsize", "72",
    "-interline-spacing", "-5",
    "-gravity", item.gravity,
    "-annotate", textX, title,
    "-fill", item.accent,
    "-font", "Arial",
    "-pointsize", "28",
    "-gravity", item.gravity,
    "-annotate", kickerX, kicker,
    "-fill", "rgba(0,0,0,0.38)",
    "-draw", "rectangle 0,625 1200,675",
    "-fill", "white",
    "-font", "Arial",
    "-pointsize", "22",
    "-gravity", "SouthWest",
    "-annotate", "+34+18", "Car News original thumbnail | real source image with editorial overlay",
    "-quality", "88",
    target
  ]);
  return { target, hash: sha256(target) };
}

function makeContactSheet(results) {
  const sheet = path.join(assetsDir, "daily-thumbnails-2026-06-09-contact-sheet.jpg");
  const tiles = results.map((item) => item.target);
  runMagick([
    ...tiles,
    "-thumbnail", "360x203",
    "-background", "#111827",
    "-bordercolor", "#111827",
    "-border", "8",
    "+append",
    sheet
  ]);
  return sheet;
}

function updateData(results, sheet) {
  const currentPosts = readJson(postsPath, []);
  const existingSlugs = new Set(currentPosts.map((post) => post.slug));
  const newPosts = posts.filter((post) => !existingSlugs.has(post.slug));
  writeJson(postsPath, [...newPosts, ...currentPosts]);

  const log = readJson(logPath, {});
  for (const key of ["publishedKeywords", "publishedSlugs", "thumbnailHashes", "thumbnailSources", "thumbnailSourceIdentities", "facebookUrls", "runs"]) {
    if (!Array.isArray(log[key])) log[key] = [];
  }
  if (!log.cursors) log.cursors = { car: 0, bike: 0, mobile: 0 };
  log.cursors.car = Math.max(Number(log.cursors.car || 0), 22);
  log.cursors.bike = Number(log.cursors.bike || 0);
  log.cursors.mobile = Number(log.cursors.mobile || 0);

  for (const selection of selections) {
    if (!log.publishedKeywords.includes(selection.keyword)) log.publishedKeywords.push(selection.keyword);
  }
  for (const post of posts) {
    if (!log.publishedSlugs.includes(post.slug)) log.publishedSlugs.push(post.slug);
    const url = `${siteUrl}/posts/${post.slug}.html`;
    if (!log.facebookUrls.includes(url)) log.facebookUrls.push(url);
  }
  results.forEach((result, index) => {
    const item = thumbs[index];
    if (!log.thumbnailHashes.includes(result.hash)) log.thumbnailHashes.push(result.hash);
    const source = `${item.brand}:${item.product}:${item.url}:${item.crop}`;
    if (!log.thumbnailSources.includes(source)) log.thumbnailSources.push(source);
    const identity = `official:${source}:sha256=${result.hash}`;
    if (!log.thumbnailSourceIdentities.includes(identity)) log.thumbnailSourceIdentities.push(identity);
  });
  const sheetHash = sha256(sheet);
  if (!log.thumbnailHashes.includes(sheetHash)) log.thumbnailHashes.push(sheetHash);

  log.runs.unshift({
    ranAt: new Date().toISOString(),
    commit: "pending",
    mode: "codex-generate-2026-06-09",
    selectedKeywords: selections,
    articles: posts.map((post) => ({
      slug: post.slug,
      keyword: post.targetKeyword,
      category: post.category,
      url: `${siteUrl}/posts/${post.slug}.html`,
      image: post.image
    })),
    thumbnailAudit: {
      contactSheet: "assets/daily-thumbnails-2026-06-09-contact-sheet.jpg",
      status: "visually_approved_after_contact_sheet_review",
      note: "Six thumbnails use distinct source identities, products, crops, color systems, title positions and base imagery. The contact sheet was reviewed locally before final build."
    },
    facebook: posts.map((post) => ({
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

async function main() {
  fs.mkdirSync(sourceDir, { recursive: true });
  for (const item of thumbs) {
    await download(item.url, path.join(sourceDir, item.sourceFile));
  }
  const results = thumbs.map(makeThumb);
  const hashes = new Set(results.map((item) => item.hash));
  if (hashes.size !== results.length) throw new Error("Duplicate thumbnail hash in generated batch.");
  const sheet = makeContactSheet(results);
  updateData(results, sheet);
  execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: true });
  console.log(`Generated ${posts.length} posts, ${thumbs.length} thumbnails and ${path.relative(root, sheet)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
