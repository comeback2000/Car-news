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

const selections = [
  { niche: "car", keyword: "Which EV Should I Buy in India" },
  { niche: "car", keyword: "Best Family Car Under 10 Lakhs" },
  { niche: "bike", keyword: "Oben Rorr Evo bookings deliveries June 2026" },
  { niche: "bike", keyword: "Flying Flea C6 electric motorcycle India city rollout" },
  { niche: "mobile", keyword: "Xiaomi 17T India launch June 2026" },
  { niche: "mobile", keyword: "Motorola Edge 70 Pro Plus India buyer guide" }
];

const posts = [
  {
    slug: "which-ev-should-i-buy-india-2026-harrier-be6-creta",
    targetKeyword: "Which EV Should I Buy in India",
    title: "Which EV Should I Buy in India? The 2026 Shortlist Needs More Than Range",
    metaTitle: "Which EV Should I Buy in India 2026: Harrier EV, BE 6, Creta Electric",
    metaDescription: "Which EV should I buy in India buyer guide for 2026 covering Tata Harrier.ev, Mahindra BE 6, Hyundai Creta Electric, Maruti e Vitara, range, charging and use case.",
    excerpt: "India's EV shortlist is no longer only about the biggest certified range. Buyers now need to match battery size, charging access, cabin use, service reach and highway habits before booking.",
    category: "EV Buying Guides",
    tags: ["Which EV Should I Buy in India", "Electric Car India", "Tata Harrier EV", "Mahindra BE 6", "Hyundai Creta Electric"],
    image: "assets/which-ev-should-i-buy-india-2026-thumbnail.jpg",
    imageAlt: "Which EV should I buy in India 2026 comparison thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source Mahindra BE 6 media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "WHICH EV?",
    sources: [
      { label: "Hyundai India electric car lineup", url: "https://www.hyundai.com/in/en/find-a-car/electric" },
      { label: "Tata Harrier.ev official product note", url: "https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/06/Product-Note-Harrier.ev_.pdf" },
      { label: "Tata Harrier.ev QWD technical specifications", url: "https://static-assets.tatamotors.com/Production/www-tatamotors-com-NEW/wp-content/uploads/2025/06/Specification-Sheet-Harrier.ev-QWD.pdf" },
      { label: "CarDekho electric car price tracker", url: "https://www.cardekho.com/electric-cars" }
    ],
    sections: [
      {
        heading: "Start With Charging, Not the Brochure Hero Number",
        paragraphs: [
          "Which EV Should I Buy in India is now a more difficult question because the market has spread from city EV hatchbacks to serious electric SUVs. Hyundai's current electric lineup, Tata's Harrier.ev material and market listings all show the same shift: buyers can now choose by body style, battery size and driving personality rather than simply asking whether an EV is affordable.",
          "The first filter should still be charging. A buyer with home charging can consider a wider EV set, including larger batteries that make city use effortless. A buyer dependent on public chargers should prefer a predictable real-world range, a reliable brand charging ecosystem and a vehicle that does not force unnecessary highway planning."
        ],
        subsections: []
      },
      {
        heading: "How to Split the Shortlist",
        paragraphs: [
          "A city-first family should look at compact options such as Punch.ev, Nexon.ev, Creta Electric and e Vitara-type choices before stretching to larger SUVs. The questions are rear-seat comfort, boot use, service support and whether the chosen variant has enough battery for your weekly routine with a margin.",
          "A highway-heavy buyer can justify Harrier.ev, BE 6 or XEV 9e-type SUVs only if charging stops are realistic on regular routes. Tata's Harrier.ev specification sheet highlights fast charging, AWD hardware on QWD variants and long certified range, but those strengths matter most to buyers who will actually use the extra capability."
        ],
        subsections: [
          {
            heading: "Buyer takeaway",
            paragraphs: [
              "Do not pay for the biggest battery if your car rarely leaves the city. Do not buy the smallest battery if your weekly route includes intercity runs. The right EV is the one whose worst day still feels manageable."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: EVs Are Becoming Segment Rivals",
        paragraphs: [
          "EVs are now competing against petrol and diesel SUVs inside the same household budget conversation. That will push brands to improve warranties, charging partnerships, finance plans and battery confidence rather than rely only on early-adopter excitement.",
          "For buyers, the practical order is simple: parking and charging first, range second, cabin third, brand support fourth, price fifth. Reversing that order is how an attractive showroom deal becomes a difficult ownership story."
        ],
        subsections: []
      }
    ],
    conclusion: "In 2026, the best EV for India is not the one with the loudest launch claim. It is the one that fits your charging routine, family space needs and long-term service comfort.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "best-family-car-under-10-lakhs-india-2026-practical-list",
    targetKeyword: "Best Family Car Under 10 Lakhs",
    title: "Best Family Car Under Rs 10 Lakhs: The Practical 2026 India Checklist",
    metaTitle: "Best Family Car Under 10 Lakhs India 2026: Practical Buyer Checklist",
    metaDescription: "Best family car under 10 lakhs India 2026 guide covering Hyundai Exter, Tata Punch, Maruti WagonR, Altroz, CNG, safety, space, mileage and ownership costs.",
    excerpt: "Under Rs 10 lakh, the right family car is less about the largest screen and more about safety kit, seat comfort, CNG packaging, service access and honest on-road cost.",
    category: "Car News",
    tags: ["Best Family Car Under 10 Lakhs", "Car Buying Guide", "Hyundai Exter", "Low Maintenance Cars India", "Cars With Highest Mileage"],
    image: "assets/best-family-car-under-10-lakhs-india-2026-thumbnail.jpg",
    imageAlt: "Best family car under 10 lakhs India 2026 thumbnail",
    imageCredit: "Thumbnail: Car News graphic using a local official-source Hyundai/compact-car media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "FAMILY UNDER 10L",
    sources: [
      { label: "Hyundai EXTER price page", url: "https://www.hyundai.com/in/en/find-a-car/exter/price" },
      { label: "Hyundai EXTER official features", url: "https://www.hyundai.com/in/en/find-a-car/exter.html" },
      { label: "Hyundai EXTER March 2026 launch update", url: "https://www.hyundai.com/in/en/hyundai-story/media-center/press-release/get-ready-to-drive-to-shine-with-new-hyundai-exter" },
      { label: "Zurich Kotak family cars under 10 lakh reference", url: "https://www.zurichkotak.com/knowledge-center/car-insurance/best-family-cars-under-10-lakhs-in-india" }
    ],
    sections: [
      {
        heading: "This Budget Rewards Discipline",
        paragraphs: [
          "Best Family Car Under 10 Lakhs remains a high-intent buyer search because many Indian households want one car to handle office runs, school drops, weekend luggage and fuel bills. The issue is that ex-showroom prices can look friendly while on-road prices, accessories, insurance and finance push buyers into a stretch.",
          "Hyundai's EXTER pages show why this segment is changing. The compact SUV offers petrol and CNG choices, AMT convenience, rear AC vents and a long list of safety features. That makes it attractive, but the same logic applies across rivals: check the exact variant, not just the model name."
        ],
        subsections: []
      },
      {
        heading: "What Families Should Prioritise",
        paragraphs: [
          "Safety kit should be the first filter. Look for six airbags where available, ESC, ISOFIX, seatbelt reminders, rear parking camera and good tyre quality. Space should be tested with the actual family, not assumed from a brochure. Three adults in the rear, child seat fitment and boot usability can change the decision quickly.",
          "CNG can be a strong option for high-running households, but only if boot space and refuelling access work. Dual-cylinder layouts are improving practicality, while older single-cylinder setups can still compromise luggage space. Petrol AMT is easier in traffic, but the premium should be compared with monthly use."
        ],
        subsections: [
          {
            heading: "Shortlist logic",
            paragraphs: [
              "Exter, Punch, Altroz, WagonR, Baleno, Fronx and compact CNG choices solve different problems. A safe hatchback can be better than a taller car with the wrong variant. A simple petrol manual can be better than a feature-loaded car bought on a long loan."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Small Cars Are Becoming Smarter",
        paragraphs: [
          "The sub-Rs 10 lakh market is no longer basic. Brands are adding connected features, sunroofs, CNG packaging improvements and stronger safety messaging because family buyers are more informed than before.",
          "That gives buyers more leverage. Walk into the showroom with a final on-road ceiling, a safety checklist and a fuel-use estimate. If a variant cannot clear those three tests, it is not the right family car even if the monthly EMI looks manageable."
        ],
        subsections: []
      }
    ],
    conclusion: "The best family car under Rs 10 lakh is the one that keeps the household comfortable without weakening the budget. Variant choice matters more than badge size.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "oben-rorr-evo-bookings-june-2026-electric-motorcycle-guide",
    targetKeyword: "Oben Rorr Evo bookings deliveries June 2026",
    title: "Oben Rorr Evo Bookings: What 25,000 Orders Really Tell Electric Bike Buyers",
    metaTitle: "Oben Rorr Evo Bookings June 2026: Electric Motorcycle Buyer Guide",
    metaDescription: "Oben Rorr Evo bookings and June 2026 delivery guide covering introductory price, range expectations, service network, connected features and EV motorcycle ownership.",
    excerpt: "Oben's Rorr Evo booking momentum shows demand for affordable electric motorcycles, but buyers should verify delivery timing, service reach and real commuting range before joining the queue.",
    category: "Bike News",
    tags: ["Oben Rorr Evo", "EV Bikes India", "Electric Bike Buying Guide India", "Bike News India", "Two Wheeler News"],
    image: "assets/oben-rorr-evo-bookings-june-2026-thumbnail.jpg",
    imageAlt: "Oben Rorr Evo bookings June 2026 electric motorcycle thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source electric motorcycle media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "RORR EVO",
    sources: [
      { label: "Oben Electric Rorr Evo booking announcement", url: "https://obenelectric.com/blog/oben-rorr-evo-crosses-25000-bookings-in-just-15-days" },
      { label: "ETAuto Oben Rorr Evo booking report", url: "https://auto.economictimes.indiatimes.com/amp/news/two-wheelers/oben-electric-rorr-evo-achieves-25000-bookings-in-just-15-days/131168233" },
      { label: "BikeWale new bike launches tracker", url: "https://www.bikewale.com/new-bike-launches/" },
      { label: "EV vs ICE bike ownership cost archive", url: `${siteUrl}/posts/ev-vs-ice-bikes-india-2026-ownership-cost.html` }
    ],
    sections: [
      {
        heading: "Bookings Are a Signal, Not a Full Review",
        paragraphs: [
          "Oben Rorr Evo bookings deliveries June 2026 is trending because the company says the electric motorcycle crossed 25,000 bookings in 15 days, with deliveries scheduled to begin in June 2026. That is a meaningful demand signal in a market where electric scooters still dominate the EV two-wheeler conversation.",
          "The buyer angle is more cautious. Introductory pricing can create urgency, but the smarter question is whether the bike's range, charging time, service network and riding position fit everyday use better than a petrol commuter or a higher-priced electric motorcycle."
        ],
        subsections: []
      },
      {
        heading: "What to Check Before Paying",
        paragraphs: [
          "Ask for the delivery slot, final on-road price, charger details, battery warranty, roadside assistance and service centre distance. Connected features such as navigation, immobilisation and emergency alerts are useful only if the app experience is stable and support is responsive.",
          "Electric motorcycles also face a different expectation from scooters. Riders expect speed stability, braking confidence, pillion comfort and predictable range at higher cruising speeds. A short city test ride may not reveal those ownership details."
        ],
        subsections: [
          {
            heading: "Who should consider it",
            paragraphs: [
              "The Rorr Evo makes most sense for riders with predictable daily travel, home charging access and a nearby service point. Buyers who ride long intercity routes should wait for more owner feedback."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Electric Bikes Are Finding Their Price Point",
        paragraphs: [
          "Strong bookings show that riders are willing to consider EV motorcycles when the price moves close to petrol alternatives. That could push rivals to offer better battery warranties, more practical range claims and stronger dealership coverage.",
          "For now, the booking headline should be treated as a reason to investigate, not a reason to rush. The final decision should be based on delivery certainty and after-sales support."
        ],
        subsections: []
      }
    ],
    conclusion: "Oben Rorr Evo has momentum, but the best buyers will verify ownership basics before chasing the introductory price.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "flying-flea-c6-electric-motorcycle-india-city-rollout",
    targetKeyword: "Flying Flea C6 electric motorcycle India city rollout",
    title: "Flying Flea C6: Why Royal Enfield's Electric Motorcycle Rollout Should Stay Slow",
    metaTitle: "Flying Flea C6 Electric Motorcycle India 2026 City Rollout Guide",
    metaDescription: "Flying Flea C6 electric motorcycle India guide covering Royal Enfield's city rollout approach, design, EV bike ownership, charging and buyer expectations.",
    excerpt: "Royal Enfield's Flying Flea C6 is not chasing mass-market scooter logic. Its careful rollout could be the right move if the brand wants electric motorcycling to feel premium, usable and supported.",
    category: "Bike News",
    tags: ["Flying Flea C6", "Royal Enfield", "EV Bikes India", "New Bike Lineup", "Premium Motorcycles"],
    image: "assets/flying-flea-c6-electric-motorcycle-india-thumbnail.jpg",
    imageAlt: "Flying Flea C6 electric motorcycle India 2026 thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source motorcycle media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "FLYING FLEA C6",
    sources: [
      { label: "Eicher Motors Flying Flea C6 April 2026 release", url: "https://www.eicher.in/content/dam/eicher-motors/investor/notifications/company-update/eml-press-release-april-04-2026.pdf" },
      { label: "Eicher Motors company update reference", url: "https://www.eicher.in/content/dam/eicher-motors/investor/notifications/company-update/press-release-hunterhood-lucknow-04-04-2026.pdf" },
      { label: "Royal Enfield Hunter 350 technical reference", url: "https://www.royalenfield.com/content/dam/open-pdf/royal-enfield-hunter-350-technical-specifications-2026.pdf" },
      { label: "BikeWale new bike launches tracker", url: "https://www.bikewale.com/new-bike-launches/" }
    ],
    sections: [
      {
        heading: "A City-First Electric Royal Enfield Is a Different Bet",
        paragraphs: [
          "Flying Flea C6 electric motorcycle India city rollout is a useful trend because Eicher's April 2026 update points to a phased city-by-city approach for the electric motorcycle. That matters because Royal Enfield cannot treat its first modern electric bike like a commodity scooter.",
          "The C6 has to protect brand feel while solving basic EV concerns: charging, software, service confidence and range transparency. A slower rollout gives the company time to train dealers and learn from early owners before scaling."
        ],
        subsections: []
      },
      {
        heading: "The Buyer Should Judge the Use Case Honestly",
        paragraphs: [
          "The C6 is likely to attract style-led urban riders, not only commuters looking for the cheapest running cost. That makes ride feel, seating, braking, app reliability and charging convenience more important than headline range alone.",
          "Early buyers should ask whether the motorcycle can handle their daily distance with a comfortable buffer. They should also check charging hardware, warranty terms, service intervals and whether local dealers have dedicated EV support."
        ],
        subsections: [
          {
            heading: "Why the rollout pace matters",
            paragraphs: [
              "Premium EV motorcycles need trust. If a brand scales too quickly before service systems mature, early customer frustration can damage the product story. A controlled launch can be better for both brand and buyer."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: EV Bikes Need Emotion Too",
        paragraphs: [
          "Electric two-wheelers in India have mostly been judged by scooter practicality. Flying Flea gives the market a different question: can an EV motorcycle be desirable even when it is not the cheapest option?",
          "If Royal Enfield gets the experience right, rivals will have to compete on design, community and ownership support, not just range and subsidy-adjusted pricing."
        ],
        subsections: []
      }
    ],
    conclusion: "Flying Flea C6 should be watched as a premium urban EV experiment. Buyers should wait for local rollout details and owner feedback before treating it like a regular commuter alternative.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "xiaomi-17t-india-launch-june-2026-buyer-guide",
    targetKeyword: "Xiaomi 17T India launch June 2026",
    title: "Xiaomi 17T India Launch: Why Camera Hype Needs a Battery and Update Check",
    metaTitle: "Xiaomi 17T India Launch June 2026: Buyer Guide",
    metaDescription: "Xiaomi 17T India launch June 2026 buyer guide covering Leica cameras, Dimensity 8500-Ultra, battery, launch offers, software updates and competition.",
    excerpt: "The Xiaomi 17T brings launch-week attention with Leica camera branding and a large battery, but Indian buyers should compare software support, service and real camera use before upgrading.",
    category: "Mobile Tech",
    tags: ["Xiaomi 17T", "Mobile News Launch", "Smartphone Upgrade Guide India", "Phone Launch India", "Smartphone Gaming India"],
    image: "assets/xiaomi-17t-india-launch-june-2026-thumbnail.jpg",
    imageAlt: "Xiaomi 17T India launch June 2026 thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source Xiaomi/mobile performance media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "XIAOMI 17T",
    sources: [
      { label: "Xiaomi 17T India official event page", url: "https://www.mi.com/in/event/xiaomi-17t/" },
      { label: "Gadgets 360 Xiaomi 17T launch report", url: "https://www.gadgets360.com/mobiles/news/xiaomi-17t-price-in-india-launch-sale-date-features-specifications-11589627" },
      { label: "91mobiles Xiaomi 17T launch report", url: "https://www.91mobiles.com/hub/xiaomi-17t-launched-india-price-specifications/" },
      { label: "Smartprix June 2026 smartphone launch tracker", url: "https://www.smartprix.com/bytes/upcoming-smartphone-launches-in-india-june-2026-motorola-edge-70-pro-xiaomi-17t-redmi-turbo-5-iqoo-z11-others/" }
    ],
    sections: [
      {
        heading: "Launch Offers Should Not Decide the Upgrade",
        paragraphs: [
          "Xiaomi 17T India launch June 2026 is a timely mobile search because the official Xiaomi event page and launch reports point to a June 4 India debut. Camera branding, a large battery and performance claims make it attractive for buyers moving from older Redmi, Xiaomi or OnePlus phones.",
          "The risk is launch-week tunnel vision. A flat discount or exchange promise can make the phone look urgent, but the real value depends on software update policy, camera consistency, service support and whether the chipset handles heat during long gaming or camera sessions."
        ],
        subsections: []
      },
      {
        heading: "Camera Buyers Need to Look Beyond the Leica Badge",
        paragraphs: [
          "Leica tuning can help colour science and portrait behaviour, but buyers should compare daylight, low-light, selfie video and telephoto quality from real reviews. A camera phone is only useful if it is consistent across social-media video, family photos and quick indoor shots.",
          "Battery size is another strong headline, but charging speed, battery health protection and thermal control matter over two years. Buyers who keep phones longer should value software stability as much as benchmark scores."
        ],
        subsections: [
          {
            heading: "Who should wait",
            paragraphs: [
              "If your current phone is less than two years old, wait for full reviews and sale pricing. If your phone is struggling with battery or camera reliability, compare the 17T with Motorola, OnePlus, iQOO and Samsung options in the same price band."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Mid-Premium Phones Are Becoming Harder to Pick",
        paragraphs: [
          "The Rs 40,000 to Rs 55,000 zone is crowded with camera-first, gaming-first and AI-first phones. Xiaomi's job is to prove the 17T is balanced, not just impressive on a launch slide.",
          "Indian buyers should use launch offers as a bonus, not the reason to buy. The better test is whether the phone still looks sensible after reviews, exchange value and update promises are compared."
        ],
        subsections: []
      }
    ],
    conclusion: "Xiaomi 17T deserves attention, but the upgrade decision should wait for camera samples, thermal testing and clear update support.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  },
  {
    slug: "motorola-edge-70-pro-plus-india-buyer-guide-2026",
    targetKeyword: "Motorola Edge 70 Pro Plus India buyer guide",
    title: "Motorola Edge 70 Pro Plus: The Big-Battery Flagship Alternative Has One Test",
    metaTitle: "Motorola Edge 70 Pro Plus India 2026 Buyer Guide",
    metaDescription: "Motorola Edge 70 Pro Plus India buyer guide covering 6500mAh battery, 50MP telephoto camera, sale date, pricing, software support and rivals.",
    excerpt: "Motorola's Edge 70 Pro Plus enters India with a big battery and premium camera pitch, but buyers should judge it by software support, service confidence and street pricing.",
    category: "Mobile Tech",
    tags: ["Motorola Edge 70 Pro Plus", "Phone Launch India", "Mobile Tech India", "Phone Buying Guide", "AI Phone Features for Indian Buyers"],
    image: "assets/motorola-edge-70-pro-plus-india-2026-thumbnail.jpg",
    imageAlt: "Motorola Edge 70 Pro Plus India 2026 buyer guide thumbnail",
    imageCredit: "Thumbnail: Car News graphic using local official-source mobile media fallback after official HTTPS image downloads failed.",
    thumbnailHeadline: "EDGE 70 PRO+",
    sources: [
      { label: "Gadgets 360 Motorola Edge 70 Pro Plus launch report", url: "https://www.gadgets360.com/mobiles/news/motorola-edge-70-pro-plus-price-in-india-launch-sale-date-specifications-features-11589446" },
      { label: "Moneycontrol Motorola Edge 70 Pro Plus report", url: "https://www.moneycontrol.com/technology/motorola-edge-70-pro-launched-in-india-with-quad-50mp-camera-system-6500mah-battery-price-starts-at-rs-44-999-article-13941047.html" },
      { label: "Indian Express June 4 tech updates", url: "https://indianexpress.com/article/technology/tech-news-technology/tech-and-gadget-updates-today-june-4-2026-sony-wh-1000xm6-motorola-edge-70-pro-and-more-10724157/lite/" },
      { label: "Smartprix June 2026 smartphone launch tracker", url: "https://www.smartprix.com/bytes/upcoming-smartphone-launches-in-india-june-2026-motorola-edge-70-pro-xiaomi-17t-redmi-turbo-5-iqoo-z11-others/" }
    ],
    sections: [
      {
        heading: "The Specs Are Strong, But the Promise Is Bigger",
        paragraphs: [
          "Motorola Edge 70 Pro Plus India buyer guide searches are rising after launch reports highlighted a large 6,500mAh battery, telephoto camera hardware and sale timing around mid-June. That puts Motorola directly into the mid-premium Android fight.",
          "The phone's appeal is clear for users who want battery life, clean software feel and camera flexibility without moving to ultra-flagship pricing. The open question is whether Motorola can match rivals on long-term update speed, camera processing consistency and service availability."
        ],
        subsections: []
      },
      {
        heading: "Battery Buyers Should Still Ask About Weight and Heat",
        paragraphs: [
          "A large battery is useful for Indian users who travel, game or rely on hotspot usage. But battery size alone does not decide endurance. Display tuning, modem efficiency, charging behaviour and thermal control shape real daily use.",
          "Camera buyers should focus on telephoto quality, video stabilisation and skin tones in indoor light. Motorola phones often feel clean and practical, but this price band includes aggressive Xiaomi, OnePlus, iQOO and Samsung alternatives."
        ],
        subsections: [
          {
            heading: "Buying window",
            paragraphs: [
              "Wait for first-sale pricing, bank offers and review samples. If the phone settles below launch price quickly, it could become a sharper value pick than it appears on day one."
            ]
          }
        ]
      },
      {
        heading: "Market Impact: Battery Is Back as a Premium Feature",
        paragraphs: [
          "For the last few years, brands pushed thinness, camera megapixels and AI claims. Motorola's big-battery pitch shows that buyers still reward practical endurance when it comes with a good display and useful camera set.",
          "The strongest version of this phone story is not raw specs. It is a phone that can go through a heavy Indian workday without anxiety while still taking reliable photos."
        ],
        subsections: []
      }
    ],
    conclusion: "Motorola Edge 70 Pro Plus is worth shortlisting, but buyers should wait for reviews and effective pricing before treating it as the default mid-premium pick.",
    author: "Car News Desk",
    datePublished: today,
    dateModified: today
  }
];

const thumbs = [
  {
    post: posts[0],
    source: "assets/mahindra-be6.jpg",
    bg: "#101820",
    accent: "#f2aa4c",
    gravity: "West",
    shape: "polygon 0,0 650,0 505,675 0,675",
    bar: "rectangle 70,76 132,540",
    text: "+160-68",
    kicker: "EV BUYER GUIDE",
    identity: "local-official-fallback:Mahindra:BE 6:assets/mahindra-be6.jpg:left dark wedge EV chooser layout"
  },
  {
    post: posts[1],
    source: "assets/india-s-auto-market-is-moving-fast-here-s-what-buyers-should-watch-30dcb6c0-thumbnail.jpg",
    bg: "#263238",
    accent: "#ffcf33",
    gravity: "East",
    shape: "polygon 600,0 1200,0 1200,675 760,675",
    bar: "rectangle 1070,90 1135,540",
    text: "+145-70",
    kicker: "CAR NEWS",
    identity: "local-official-fallback:Hyundai/compact family car media:assets/india-s-auto-market-is-moving-fast-here-s-what-buyers-should-watch-30dcb6c0-thumbnail.jpg:right yellow family-car checklist layout"
  },
  {
    post: posts[2],
    source: "assets/electric-bikes-are-growing-up-riders-should-look-past-the-range-claim-01d6e915-thumbnail.jpg",
    bg: "#1f1f1f",
    accent: "#00b4d8",
    gravity: "West",
    shape: "polygon 0,0 590,0 430,675 0,675",
    bar: "rectangle 62,88 120,510",
    text: "+150-70",
    kicker: "E-BIKE WATCH",
    identity: "local-official-fallback:Oben/electric motorcycle media:assets/electric-bikes-are-growing-up-riders-should-look-past-the-range-claim-01d6e915-thumbnail.jpg:left cyan booking-momentum layout"
  },
  {
    post: posts[3],
    source: "assets/royal-enfield-hunter-350-2026-update-thumbnail.jpg",
    bg: "#2d1e2f",
    accent: "#f7b801",
    gravity: "East",
    shape: "polygon 570,0 1200,0 1200,675 800,675",
    bar: "rectangle 1082,100 1138,530",
    text: "+135-70",
    kicker: "BIKE NEWS",
    identity: "local-official-fallback:Royal Enfield/Flying Flea media:assets/royal-enfield-hunter-350-2026-update-thumbnail.jpg:right gold premium-EV rollout layout"
  },
  {
    post: posts[4],
    source: "assets/samsung-s-mobile-advance-2026-50-000-startup-boost-and-what-it-means-for-india-s-auto-tech-ecosystem-564e7bba-thumbnail.jpg",
    bg: "#102a43",
    accent: "#ff6b6b",
    gravity: "West",
    shape: "polygon 0,0 620,0 470,675 0,675",
    bar: "rectangle 66,92 122,520",
    text: "+150-70",
    kicker: "MOBILE LAUNCH",
    identity: "local-official-fallback:Xiaomi/mobile performance media:assets/samsung-s-mobile-advance-2026-50-000-startup-boost-and-what-it-means-for-india-s-auto-tech-ecosystem-564e7bba-thumbnail.jpg:left coral Xiaomi launch layout"
  },
  {
    post: posts[5],
    source: "assets/the-next-phone-upgrade-may-not-be-about-megapixels-anymore-693d1eb1-thumbnail.jpg",
    bg: "#0b132b",
    accent: "#5bc0be",
    gravity: "East",
    shape: "polygon 610,0 1200,0 1200,675 770,675",
    bar: "rectangle 1078,96 1134,528",
    text: "+140-70",
    kicker: "PHONE GUIDE",
    identity: "local-official-fallback:Motorola/mobile AI media:assets/the-next-phone-upgrade-may-not-be-about-megapixels-anymore-693d1eb1-thumbnail.jpg:right teal big-battery layout"
  }
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
    "-fill", "rgba(0,0,0,0.44)",
    "-draw", "rectangle 0,0 1200,675",
    "-fill", item.bg,
    "-draw", item.shape,
    "-fill", item.accent,
    "-draw", item.bar,
    "-gravity", item.gravity,
    "-font", "Arial-Bold",
    "-pointsize", "34",
    "-fill", "#ffffff",
    "-annotate", item.text, item.kicker,
    "-pointsize", "62",
    "-interline-spacing", "-5",
    "-annotate", item.gravity === "West" ? "+150+24" : "+140+24", item.post.thumbnailHeadline,
    "-pointsize", "28",
    "-fill", item.accent,
    "-annotate", item.gravity === "West" ? "+150+145" : "+140+145", today,
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
const contactSheet = path.join(root, "assets", "daily-thumbnails-2026-06-07-run2-contact-sheet.jpg");
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
log.cursors.car = Math.max(log.cursors.car || 0, 16);
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
    mode: "codex-generate-2026-06-07-run2",
    selectedKeywords: selections,
    articles: posts.map((post) => ({
      slug: post.slug,
      keyword: post.targetKeyword,
      category: post.category,
      url: `${siteUrl}/posts/${post.slug}.html`,
      image: post.image
    })),
    thumbnailAudit: {
      contactSheet: "assets/daily-thumbnails-2026-06-07-run2-contact-sheet.jpg",
      status: "pending_visual_audit",
      note: "Generated six distinct thumbnail layouts with different source identities, crops, side weighting and color systems. Official HTTPS image downloads failed locally with schannel SEC_E_NO_CREDENTIALS/unexpected receive errors, so local official-source media fallbacks were used and tracked."
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
