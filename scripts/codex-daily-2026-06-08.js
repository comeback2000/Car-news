const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const today = "2026-06-08";
const siteUrl = "https://comeback2000.github.io/Car-news";
const postsPath = path.join(root, "data", "posts.json");
const logPath = path.join(root, "data", "daily-publisher-log.json");

const readJson = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) : fallback;
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const selections = [
  { niche: "car", keyword: "Best SUV for Long Drive India" },
  { niche: "car", keyword: "Most Reliable Car in India" },
  { niche: "bike", keyword: "Hero Splendor HF Deluxe flex fuel motorcycles India June 2026" },
  { niche: "bike", keyword: "Bajaj Avenger 220 Street India 2026 relaunch" },
  { niche: "mobile", keyword: "OnePlus 15 India Snapdragon 8 Elite Gen 5 gaming phone" },
  { niche: "mobile", keyword: "iQOO Z11x India 7200mAh battery phone buyer guide" }
];

const posts = [
  {
    slug: "best-suv-for-long-drive-india-2026-comfort-range-guide",
    targetKeyword: "Best SUV for Long Drive India",
    title: "Best SUV for Long Drive India: Comfort, Range and Highway Calm Matter Most",
    metaTitle: "Best SUV for Long Drive India 2026: Buyer Guide",
    metaDescription: "Best SUV for long drive India 2026 guide covering highway comfort, diesel, hybrid and EV choices, luggage space, ADAS, service reach and real ownership checks.",
    excerpt: "The best long-drive SUV is not simply the biggest or most powerful model. Indian buyers should judge seat comfort, tank or battery range, tyre quality, service access and fatigue-reducing features before booking.",
    category: "Car News",
    tags: ["Best SUV for Long Drive India", "Car Buying Guide", "Electric SUV India", "India Car News", "Long Drive SUV"],
    image: "assets/best-suv-for-long-drive-india-2026-thumbnail.jpg",
    imageAlt: "Best SUV for long drive India 2026 buyer guide thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source Tata EV media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "LONG DRIVE SUV",
    sources: [
      { label: "Autopunditz June 2026 new car launch tracker", url: "https://www.autopunditz.com/post/new-car-launches-june-2026-india" },
      { label: "Mahindra XUV700 official product page", url: "https://auto.mahindra.com/suv/xuv700" },
      { label: "Toyota Innova Hycross official page", url: "https://www.toyotabharat.com/showroom/innova-hycross/" },
      { label: "Hyundai Creta Electric official price page", url: "https://www.hyundai.com/in/en/find-a-car/creta-electric/price" }
    ],
    sections: [
      {
        heading: "A Long-Drive SUV Has to Reduce Fatigue",
        paragraphs: [
          "Best SUV for Long Drive India remains a strong buyer query because Indian highways are improving, but real trips still combine expressways, broken diversions, heat, luggage and uncertain fuel or charging stops. A good long-distance SUV should make the driver less tired after 500 km, not just feel impressive in a showroom.",
          "The June 2026 launch cycle is also pushing buyers toward bigger crossovers, hybrid SUVs and electric options. That makes the decision more complex: a large screen, panoramic roof or headline power figure cannot replace stable high-speed manners, supportive seats and a predictable refill or recharge plan."
        ]
      },
      {
        heading: "What to Prioritise Before Body Style",
        paragraphs: [
          "Seat cushioning, under-thigh support, tyre profile, cabin noise and air-conditioning performance matter more than brochure drama. A diesel or hybrid SUV still has an advantage for frequent remote highway use, while an EV can be excellent on fixed routes if charging stops are reliable.",
          "ADAS can help on open highways, but buyers should test how smoothly adaptive cruise and lane support behave in Indian traffic. A system that brakes nervously or nags constantly can add stress instead of removing it."
        ],
        subsections: [
          {
            heading: "Buyer checkpoint",
            paragraphs: [
              "Take the family on the test drive, load the boot mentally with real luggage, and compare service coverage along routes you actually use. The right SUV should feel relaxed at your normal cruising speed, not only in a short city loop."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Touring Comfort Is Back",
        paragraphs: [
          "Brands are again selling highway comfort because Indian buyers are using SUVs as one-car family solutions. That helps models with strong seats, high-speed stability, diesel torque, hybrid economy or carefully planned EV charging support.",
          "The smartest shortlist should include a mainstream petrol or diesel SUV, one hybrid if budget allows and one EV only if the route map is clear. That comparison keeps excitement grounded in actual ownership."
        ]
      }
    ],
    conclusion: "For long drives, choose the SUV that makes repeated highway days easy. Comfort, stability, service reach and refill confidence should beat cosmetic features.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "most-reliable-car-in-india-2026-service-resale-guide",
    targetKeyword: "Most Reliable Car in India",
    title: "Most Reliable Car in India: Why the Safest Bet Is Usually Boring on Paper",
    metaTitle: "Most Reliable Car in India 2026: Service and Resale Guide",
    metaDescription: "Most reliable car in India 2026 buyer guide covering Maruti Dzire, Toyota reliability, Hyundai service, maintenance cost, resale, safety and ownership risks.",
    excerpt: "Reliability is not only about engines that last. Indian buyers should weigh service network depth, parts cost, resale demand, safety upgrades and how calmly the car handles abuse over five years.",
    category: "Car News",
    tags: ["Most Reliable Car in India", "Low Maintenance Cars India", "Cars With Highest Mileage", "Maruti Suzuki", "Toyota India 2026"],
    image: "assets/most-reliable-car-in-india-2026-thumbnail.jpg",
    imageAlt: "Most reliable car in India 2026 service and resale guide thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source Toyota/MPV media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "RELIABLE CAR?",
    sources: [
      { label: "Maruti Suzuki Dzire 3 million sales milestone", url: "https://www.marutisuzuki.com/corporate/media/press-releases/2026/march/maruti-suzuki-dzire-celebrates-momentous-3-million-sales-milestone" },
      { label: "Toyota Innova Crysta 2026 launch coverage", url: "https://economictimes.indiatimes.com/industry/auto/cars-uvs/toyota-innova-crysta-2026-launched-with-new-upgrades-check-variant-wise-prices-features-and-other-details/articleshow/131499362.cms" },
      { label: "MotorTrend 2026 reliability brand reference", url: "https://www.motortrend.com/features/most-reliable-dependable-car-brands" },
      { label: "Maruti Suzuki official service network", url: "https://www.marutisuzuki.com/service" }
    ],
    sections: [
      {
        heading: "Reliability Is a System, Not a Badge",
        paragraphs: [
          "Most Reliable Car in India is a buyer search that often turns into a brand argument. The practical answer is broader. A reliable car is one that starts every morning, has affordable parts, can be fixed quickly, holds resale value and does not punish the owner when the nearest highway town has only one workshop.",
          "Maruti Suzuki's Dzire milestone shows why ordinary cars dominate reliability conversations: high sales volume, familiar engines, service reach and strong used demand reduce ownership anxiety. Toyota earns a different kind of trust through long-term mechanical durability, especially in models like Innova."
        ]
      },
      {
        heading: "What Buyers Should Actually Compare",
        paragraphs: [
          "Check service interval cost, tyre size, parts availability, warranty terms and common owner complaints. A car with a sophisticated turbo engine or dual-clutch gearbox can be enjoyable, but it may not be the best reliability bet for a low-maintenance household.",
          "Safety now belongs in the reliability discussion too. A car that is cheap to maintain but weak on crash protection, tyres or braking confidence is not a complete family choice."
        ],
        subsections: [
          {
            heading: "Shortlist logic",
            paragraphs: [
              "For tight budgets, compare Dzire, Swift, WagonR, Baleno and Punch variants by safety kit and running cost. For higher budgets, Toyota and Hyundai options make sense when service quality and resale are strong in your city."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Trust Still Sells",
        paragraphs: [
          "Even as EVs, hybrids and connected cars gain attention, many buyers still reward predictable ownership. That is why Maruti, Toyota and Hyundai remain powerful in family-car decisions despite flashier launches elsewhere.",
          "The buyer mistake is assuming reliability means no compromise. It often means accepting simpler tech, fewer dramatic features and a proven service ecosystem. For many Indian households, that is exactly the point."
        ]
      }
    ],
    conclusion: "The most reliable car is usually the one with proven hardware, nearby service, strong resale and no expensive surprises. Buy the ownership record, not just the launch brochure.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "hero-splendor-hf-deluxe-flex-fuel-june-2026-buyer-guide",
    targetKeyword: "Hero Splendor HF Deluxe flex fuel motorcycles India June 2026",
    title: "Hero Flex-Fuel Splendor and HF Deluxe: The Big Question Is Fuel Access",
    metaTitle: "Hero Splendor HF Deluxe Flex Fuel June 2026 Buyer Guide",
    metaDescription: "Hero Splendor+ and HF Deluxe flex-fuel June 2026 buyer guide covering E20-E85 compatibility, prices, rollout, running cost and commuter ownership.",
    excerpt: "Hero's first flex-fuel commuters bring ethanol-ready technology to India's highest-volume motorcycle space, but buyers should check fuel availability and price before treating it as an automatic saving.",
    category: "Bike News",
    tags: ["Hero Splendor Flex Fuel", "HF Deluxe Flex Fuel", "Bike News India", "E85 Fuel India", "Best Commuter Bike Ownership Cost"],
    image: "assets/hero-splendor-hf-deluxe-flex-fuel-2026-thumbnail.jpg",
    imageAlt: "Hero Splendor and HF Deluxe flex fuel motorcycles India 2026 thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source Hero commuter motorcycle media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "FLEX FUEL HERO",
    sources: [
      { label: "Hero MotoCorp June 3 2026 flex-fuel motorcycle release", url: "https://www.heromotocorp.com/content/dam/hero-aem-website/in/en-in/company-section/press-releases/2026/june-pdf%27s/press_release_hero_motocorp_unveils_its_first_flex_fuel_motorcycles_to_power_indias_self_reliant_mobility_future.pdf" },
      { label: "Autocar India Hero flex-fuel launch report", url: "https://www.autocarindia.com/bike-news-amp/hero-launches-flex-fuel-splendor-and-hf-deluxe-prices-start-at-rs-72792-439875" },
      { label: "Business Standard Hero flex-fuel rollout interview", url: "https://www.business-standard.com/companies/news/hero-could-roll-out-flex-fuel-variants-across-all-12-bikes-in-2-years-ceo-126060301110_1.html" },
      { label: "Financial Express Hero flex-fuel launch report", url: "https://www.financialexpress.com/auto/bike-news/hero-launches-flex-fuel-splendor-hf-deluxe-eyes-entire-portfolio-in-2-years/4258423/" }
    ],
    sections: [
      {
        heading: "The Mass-Market Angle Is the Real Story",
        paragraphs: [
          "Hero Splendor HF Deluxe flex fuel motorcycles India June 2026 is more important than a niche technology headline. Hero says the Splendor+ and HF Deluxe flex-fuel models can run on ethanol blends from E20 to E85, putting alternative-fuel hardware into two of India's most familiar commuter names.",
          "That matters because commuter buyers are highly cost-sensitive. A small premium can work only if fuel availability, price difference and everyday reliability are clear in the buyer's city."
        ]
      },
      {
        heading: "Do Not Buy Before Checking the Pump",
        paragraphs: [
          "A flex-fuel bike is useful when E85 or higher ethanol blends are accessible and priced sensibly. If the local pump network still mainly offers petrol or E20, the technology may be future-ready but not immediately cheaper.",
          "Riders should also ask whether service centres are trained for the revised fuel system, ECU calibration and filters. Ethanol compatibility is not just a sticker; long-term ownership depends on parts and technician readiness."
        ],
        subsections: [
          {
            heading: "Who should shortlist it",
            paragraphs: [
              "High-running commuters in Delhi and select Maharashtra regions should investigate first because rollout begins there. Low-running buyers can wait until fuel access and real owner feedback are stronger."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Alternative Fuel Moves Downmarket",
        paragraphs: [
          "Flex fuel was easier to discuss in concept cars and premium demonstrations. Hero moving it to 100cc commuters is more consequential because this is where India's daily two-wheeler fuel bill lives.",
          "If the rollout works, rivals will have to respond with cleaner commuter options that do not make ownership complicated. If fuel access lags, buyers will treat the technology as a promise rather than a reason to switch immediately."
        ]
      }
    ],
    conclusion: "Hero's flex-fuel commuters are worth watching, but the ownership case depends on ethanol availability, service readiness and real running cost in your city.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "bajaj-avenger-220-street-2026-relaunch-city-cruiser-guide",
    targetKeyword: "Bajaj Avenger 220 Street India 2026 relaunch",
    title: "Bajaj Avenger 220 Street Returns: A Simple Cruiser Still Has a Job",
    metaTitle: "Bajaj Avenger 220 Street 2026 Relaunch India Buyer Guide",
    metaDescription: "Bajaj Avenger 220 Street 2026 relaunch buyer guide covering price, 220cc engine, city comfort, Street vs Cruise differences and rivals.",
    excerpt: "The Avenger 220 Street is back in India's cruiser conversation, but buyers should see it as a comfort-first city cruiser rather than a modern feature-loaded motorcycle.",
    category: "Bike News",
    tags: ["Bajaj Avenger 220 Street", "Bike News India", "New Bike Lineup", "Two Wheeler Launch Updates India", "Cruiser Bike India"],
    image: "assets/bajaj-avenger-220-street-2026-thumbnail.jpg",
    imageAlt: "Bajaj Avenger 220 Street 2026 buyer guide thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local motorcycle media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "AVENGER RETURNS",
    sources: [
      { label: "Bajaj Avenger 220 Street official page", url: "https://www.bajajauto.com/bikes/avenger/avenger-street-220" },
      { label: "Bajaj Avenger 220 Street specifications", url: "https://www.bajajauto.com/bikes/avenger/avenger-street-220/specifications" },
      { label: "BikeWale Avenger 220 Street 2026 launch report", url: "https://www.bikewale.com/news/2026-bajaj-avenger-street-launched-in-india-at-rs-130-lakh/" },
      { label: "BikeDekho Avenger 220 Street launch report", url: "https://www.bikedekho.com/news/category-launch-news/breaking-2026-bajaj-avenger-220-street-launched-priced-at-rs-130-lakh-19586" }
    ],
    sections: [
      {
        heading: "The Return Is About Comfort, Not Spec Racing",
        paragraphs: [
          "Bajaj Avenger 220 Street India 2026 relaunch is trending because the Street badge gives cruiser buyers another low-seat option at a time when many motorcycles are becoming taller, sharper and more expensive.",
          "Bajaj's official page lists the familiar 220cc oil-cooled DTS-i engine, single-channel ABS, a 13-litre tank and street-style ergonomics. That is not a radical update, but it may be enough for riders who want an easy daily cruiser."
        ]
      },
      {
        heading: "Street or Cruise Depends on Posture",
        paragraphs: [
          "The Street version is the more urban-looking Avenger, with blacked-out styling and a less chrome-heavy personality. The Cruise remains better aligned with relaxed highway imagery. Buyers should decide by handlebar feel, foot position and pillion comfort rather than colour alone.",
          "The Avenger's strength is accessibility: low saddle, manageable power and a calm riding position. Its weakness is that rivals now offer more features, newer platforms and stronger performance for riders who want excitement."
        ],
        subsections: [
          {
            heading: "Test-ride focus",
            paragraphs: [
              "Check U-turn comfort, rear suspension over bad roads, braking feel and whether the handlebar suits your shoulder width. Cruiser comfort is personal, so a spec sheet cannot settle the decision."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Simple Bikes Still Sell",
        paragraphs: [
          "The Avenger 220 Street shows that not every buyer wants a tech-heavy motorcycle. Some riders want a known engine, relaxed posture and predictable maintenance from a widespread brand.",
          "That gives Bajaj a narrow but useful space if pricing stays sensible. The bike should appeal to commuters who want cruiser style without moving into a much larger, heavier or costlier segment."
        ]
      }
    ],
    conclusion: "The Avenger 220 Street is a practical city cruiser for riders who value posture and simplicity. Buy it for comfort, not for the newest feature list.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "oneplus-15-india-gaming-phone-snapdragon-8-elite-gen-5-guide",
    targetKeyword: "OnePlus 15 India Snapdragon 8 Elite Gen 5 gaming phone",
    title: "OnePlus 15 India: The Gaming Phone Pitch Now Needs Heat and Battery Proof",
    metaTitle: "OnePlus 15 India Snapdragon 8 Elite Gen 5 Gaming Phone Guide",
    metaDescription: "OnePlus 15 India buyer guide covering Snapdragon 8 Elite Gen 5, 165Hz display, 7300mAh battery, OxygenOS 16, gaming performance and upgrade timing.",
    excerpt: "OnePlus is leaning hard into gaming power, but Indian buyers should wait for heat, battery drain and camera consistency tests before calling the OnePlus 15 a no-brainer flagship.",
    category: "Mobile Tech",
    tags: ["OnePlus 15", "Mobile GPU Performance", "Phone Launch India", "Smartphone Gaming India", "Phone Buying Guide"],
    image: "assets/oneplus-15-india-gaming-phone-2026-thumbnail.jpg",
    imageAlt: "OnePlus 15 India gaming phone 2026 buyer guide thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source mobile performance media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "ONEPLUS 15",
    sources: [
      { label: "OnePlus 15 official India product page", url: "https://www.oneplus.in/15" },
      { label: "Android Central OnePlus 16 timeline report", url: "https://www.androidcentral.com/phones/oneplus/oneplus-16-could-be-here-sooner-than-expected" },
      { label: "Smartprix June 2026 smartphone launch tracker", url: "https://www.smartprix.com/bytes/upcoming-smartphone-launches-in-india-june-2026-motorola-edge-70-pro-xiaomi-17t-redmi-turbo-5-iqoo-z11-others/" },
      { label: "Gadgets 360 June 2026 smartphone launch tracker", url: "https://www.gadgets360.com/mobiles/features/upcoming-smartphones-in-june-2026-motorola-edge-70-pro-plus-xiaomi-17t-price-specifications-expected-11564592" }
    ],
    sections: [
      {
        heading: "The Spec Sheet Is Built for Gamers",
        paragraphs: [
          "OnePlus 15 India Snapdragon 8 Elite Gen 5 gaming phone is a natural buyer topic because the official page pushes the first-in-India chip claim, a 165Hz display, a 7,300mAh battery and OxygenOS 16. On paper, that is exactly the mix heavy users want.",
          "The practical question is whether the performance stays stable after 20 minutes of gaming in Indian heat. Peak benchmark numbers matter less than sustained frame rate, thermal comfort and battery drain."
        ]
      },
      {
        heading: "Battery Size Is the Strongest Everyday Hook",
        paragraphs: [
          "A large battery changes the flagship conversation because many premium phones still force users to ration screen time. If OnePlus manages heat and charging health well, the 15 can appeal beyond gamers to travelers, creators and work-heavy users.",
          "Camera buyers should still be careful. Performance-first phones can look strong on hardware while lagging Samsung, Apple or Vivo in skin tones, video processing or low-light consistency."
        ],
        subsections: [
          {
            heading: "Upgrade timing",
            paragraphs: [
              "Wait for first-sale offers and independent thermal tests. If the OnePlus 16 chatter grows quickly, late buyers should watch whether the OnePlus 15 gets sharper pricing."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Big Batteries Are Back",
        paragraphs: [
          "The Indian premium phone fight is moving from thinness to endurance. OnePlus, iQOO and gaming-focused rivals are all showing that buyers care about battery size when displays, cameras and AI features already feel mature.",
          "That helps consumers because brands will have to prove not only speed, but also comfort, update support and long-term battery health."
        ]
      }
    ],
    conclusion: "OnePlus 15 is a strong gaming shortlist candidate, but buyers should verify thermals, camera tuning and effective price before upgrading.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "iqoo-z11x-india-7200mah-battery-phone-buyer-guide",
    targetKeyword: "iQOO Z11x India 7200mAh battery phone buyer guide",
    title: "iQOO Z11x India: The 7,200mAh Battery Phone Makes One Demand",
    metaTitle: "iQOO Z11x India 7200mAh Battery Phone Buyer Guide",
    metaDescription: "iQOO Z11x India buyer guide covering 7200mAh battery, Dimensity 7400-Turbo, 44W charging, IP ratings, AI features, gaming and software support.",
    excerpt: "The iQOO Z11x promises a huge battery and tough build, but buyers should compare software support, camera quality and weight before choosing it over slimmer mid-range phones.",
    category: "Mobile Tech",
    tags: ["iQOO Z11x", "Mobile New Tech", "Phone Launch India", "Smartphone Upgrade Guide India", "Mobile Tech India"],
    image: "assets/iqoo-z11x-india-7200mah-battery-phone-thumbnail.jpg",
    imageAlt: "iQOO Z11x India 7200mAh battery phone buyer guide thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source smartphone media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "7200mAh PHONE",
    sources: [
      { label: "iQOO Z11x official India product page", url: "https://www.iqoo.com/in/products/z11x" },
      { label: "iQOO India community Z11x launch note", url: "https://community.iqoo.com/in/thread/145029" },
      { label: "Digit June 2026 smartphone launch tracker", url: "https://www.digit.in/features/mobile-phones/upcoming-smartphone-launches-in-june-2026-motorola-edge-70-pro-xiaomi-17t-iqoo-z11-and-more.html" },
      { label: "Smartprix June 2026 smartphone launch tracker", url: "https://www.smartprix.com/bytes/upcoming-smartphone-launches-in-india-june-2026-motorola-edge-70-pro-xiaomi-17t-redmi-turbo-5-iqoo-z11-others/" }
    ],
    sections: [
      {
        heading: "Battery Anxiety Is the Target",
        paragraphs: [
          "iQOO Z11x India 7200mAh battery phone buyer guide is a timely topic because iQOO's official page highlights a 7,200mAh battery, 44W FlashCharge, Dimensity 7400-Turbo and durability claims. That combination is aimed at students, commuters and gamers who hate mid-day charging.",
          "A huge battery is useful, but it also changes the buyer test. Weight, grip, charging time and long-term battery health matter more than a normal mid-range phone."
        ]
      },
      {
        heading: "Performance Looks Practical, Not Just Loud",
        paragraphs: [
          "The Dimensity 7400-Turbo positioning should be enough for everyday gaming, multitasking and media use if thermal management is handled well. The official 4K video and AI tool claims add appeal, but buyers should wait for real camera samples before assuming it is a camera-first phone.",
          "Software support is the second check. A battery phone can last physically for years, but it only remains a good buy if security updates and app performance keep pace."
        ],
        subsections: [
          {
            heading: "Who should consider it",
            paragraphs: [
              "The Z11x makes sense for buyers who stream, commute, game lightly and want fewer charging stops. Buyers who prioritise slim design, premium cameras or wireless charging may prefer a different phone."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Mid-Range Phones Are Splitting",
        paragraphs: [
          "Some brands are chasing thin AI phones, while others are building endurance-first devices. iQOO's Z11x sits clearly in the second group, which is useful for Indian buyers who value battery over fashion.",
          "The best comparison is not only with similarly priced phones. Compare it with your current phone's worst day. If the Z11x fixes that pain without adding too much bulk, it has a clear role."
        ]
      }
    ],
    conclusion: "iQOO Z11x is a strong battery-first phone candidate. Buy it if endurance is the main problem, but verify camera output, software policy and in-hand comfort first.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  }
];

const thumbs = [
  { post: posts[0], source: "assets/tata-nexon-ev.jpg", bg: "#172026", accent: "#ffb703", gravity: "West", shape: "polygon 0,0 660,0 500,675 0,675", bar: "rectangle 74,82 132,540", text: "+150-64", kicker: "HIGHWAY GUIDE", identity: "local-official-fallback:Tata Motors:Nexon EV:assets/tata-nexon-ev.jpg:left amber highway-SUV layout" },
  { post: posts[1], source: "assets/2026-toyota-innova-crysta-launched-at-rs-19-72-lakh-what-s-new-for-buyers-abd371ce-thumbnail.jpg", bg: "#293241", accent: "#e0fbfc", gravity: "East", shape: "polygon 575,0 1200,0 1200,675 785,675", bar: "rectangle 1080,88 1138,536", text: "+136-66", kicker: "OWNERSHIP CHECK", identity: "local-official-fallback:Toyota:Innova Crysta media:assets/2026-toyota-innova-crysta-launched-at-rs-19-72-lakh-what-s-new-for-buyers-abd371ce-thumbnail.jpg:right ice reliability layout" },
  { post: posts[2], source: "assets/best-commuter-bikes-india-2026-thumbnail.jpg", bg: "#20302a", accent: "#b7e000", gravity: "West", shape: "polygon 0,0 610,0 455,675 0,675", bar: "rectangle 66,86 124,524", text: "+146-64", kicker: "COMMUTER TECH", identity: "local-official-fallback:Hero MotoCorp:commuter motorcycle media:assets/best-commuter-bikes-india-2026-thumbnail.jpg:left lime flex-fuel layout" },
  { post: posts[3], source: "assets/ducati-to-launch-10-new-bikes-in-india-in-2026-full-lineup-and-what-it-means-for-riders-0450badd-thumbnail.jpg", bg: "#1d1d1d", accent: "#d62828", gravity: "East", shape: "polygon 610,0 1200,0 1200,675 760,675", bar: "rectangle 1078,88 1136,528", text: "+132-66", kicker: "CRUISER WATCH", identity: "local-motorcycle-fallback:Bajaj Avenger context:assets/ducati-to-launch-10-new-bikes-in-india-in-2026-full-lineup-and-what-it-means-for-riders-0450badd-thumbnail.jpg:right red cruiser-return layout" },
  { post: posts[4], source: "assets/mobile-gpu-performance-2026-thumbnail.jpg", bg: "#111827", accent: "#7dd3fc", gravity: "West", shape: "polygon 0,0 630,0 462,675 0,675", bar: "rectangle 68,86 126,532", text: "+145-64", kicker: "PERFORMANCE", identity: "local-official-fallback:Mobile performance media:assets/mobile-gpu-performance-2026-thumbnail.jpg:left blue OnePlus gaming layout" },
  { post: posts[5], source: "assets/motorola-edge-70-pro-plus-india-2026-thumbnail.jpg", bg: "#2b1f3a", accent: "#f9c74f", gravity: "East", shape: "polygon 585,0 1200,0 1200,675 790,675", bar: "rectangle 1076,92 1134,532", text: "+136-66", kicker: "BATTERY PHONE", identity: "local-official-fallback:Smartphone battery media:assets/motorola-edge-70-pro-plus-india-2026-thumbnail.jpg:right gold iQOO battery layout" }
];

function magick(args) {
  execFileSync("magick", args, { stdio: "inherit", cwd: root });
}

function makeThumb(item) {
  const out = path.join(root, item.post.image);
  const src = path.join(root, item.source);
  magick([
    src,
    "-resize", "1200x675^",
    "-gravity", "center",
    "-extent", "1200x675",
    "-fill", "rgba(0,0,0,0.46)",
    "-draw", "rectangle 0,0 1200,675",
    "-fill", item.bg,
    "-draw", item.shape,
    "-fill", item.accent,
    "-draw", item.bar,
    "-gravity", item.gravity,
    "-font", "Arial-Bold",
    "-pointsize", "32",
    "-fill", "#ffffff",
    "-annotate", item.text, item.kicker,
    "-pointsize", "58",
    "-interline-spacing", "-4",
    "-annotate", item.gravity === "West" ? "+150+20" : "+134+20", item.post.thumbnailHeadline,
    "-pointsize", "26",
    "-fill", item.accent,
    "-annotate", item.gravity === "West" ? "+150+142" : "+134+142", today,
    "-quality", "88",
    out
  ]);
  return sha256(out);
}

const existing = readJson(postsPath, []);
const existingSlugs = new Set(existing.map((post) => post.slug));
const existingKeywords = new Set(existing.map((post) => String(post.targetKeyword).toLowerCase()));
for (const post of posts) {
  if (existingSlugs.has(post.slug)) throw new Error(`Duplicate slug ${post.slug}`);
  if (existingKeywords.has(String(post.targetKeyword).toLowerCase())) throw new Error(`Duplicate keyword ${post.targetKeyword}`);
}

const hashes = thumbs.map(makeThumb);
const contactSheet = path.join(root, "assets", "daily-thumbnails-2026-06-08-contact-sheet.jpg");
magick([
  ...thumbs.map((item) => path.join(root, item.post.image)),
  "-resize", "400x225",
  "-background", "#f5f5f5",
  "-gravity", "center",
  "-extent", "400x225",
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
log.cursors.car = Math.max(log.cursors.car || 0, 20);
log.cursors.bike = log.cursors.bike || 0;
log.cursors.mobile = log.cursors.mobile || 0;
log.publishedKeywords = [...new Set([...(log.publishedKeywords || []), ...selections.map((item) => item.keyword)])];
log.publishedSlugs = [...new Set([...(log.publishedSlugs || []), ...posts.map((post) => post.slug)])];
log.thumbnailHashes = [...new Set([...(log.thumbnailHashes || []), ...hashes, sha256(contactSheet)])];
log.thumbnailSources = [...new Set([...(log.thumbnailSources || []), ...thumbs.map((item) => item.identity)])];
log.thumbnailSourceIdentities = [...new Set([...(log.thumbnailSourceIdentities || []), ...thumbs.map((item, index) => `${item.identity}:sha256=${hashes[index]}`)])];

const runStamp = new Date().toISOString();
log.runs = [
  {
    ranAt: runStamp,
    commit: null,
    mode: "codex-generate-2026-06-08",
    selectedKeywords: selections,
    articles: posts.map((post) => ({
      slug: post.slug,
      keyword: post.targetKeyword,
      category: post.category,
      url: `${siteUrl}/posts/${post.slug}.html`,
      image: post.image
    })),
    thumbnailAudit: {
      contactSheet: "assets/daily-thumbnails-2026-06-08-contact-sheet.jpg",
      status: "pending_visual_audit",
      note: "Generated six distinct thumbnail layouts using separate local official-source or launch-context fallback images. Direct official HTTPS media downloads failed in this environment with schannel receive errors, so source identities, crops/layouts and hashes are tracked for duplicate prevention."
    },
    facebook: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      result: {
        status: "pending_publish_helper",
        postId: null,
        message: "Awaiting build, push and Facebook publish step."
      },
      postedAt: runStamp
    })),
    push: {
      status: "pending",
      message: "Awaiting git commit and push."
    }
  },
  ...(log.runs || [])
];

writeJson(logPath, log);
console.log(`Generated ${posts.length} posts, ${thumbs.length} thumbnails and ${path.relative(root, contactSheet)}.`);
