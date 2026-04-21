/**
 * MODEL: boothModel.js
 * Centralizes every mock educational module, hotspot coordinate, and guided-content
 * seed used by the ITCPH Digital Agri-Booth.
 *
 * WHY THIS FILE EXISTS:
 * The booth is meant to standardize IOP-driven swine farming knowledge across many
 * touchpoints. Keeping content definitions in a dedicated model layer prevents Views
 * from hard-coding business content, which makes audits, updates, and localization
 * safer and more predictable over time.
 */

/**
 * @typedef {'public' | 'gated'} ModuleAccessLevel
 *
 * @typedef {Object} BoothMetric
 * @property {string} label
 * @property {string} value
 *
 * @typedef {Object} BoothResource
 * @property {string} id
 * @property {string} title
 * @property {string} format
 * @property {string} description
 * @property {string} status
 *
 * @typedef {Object} BoothModule
 * @property {string} id
 * @property {string} hotspotId
 * @property {string} title
 * @property {ModuleAccessLevel} access
 * @property {string} badge
 * @property {string} summary
 * @property {string} description
 * @property {string[]} highlights
 * @property {BoothMetric[]} quickStats
 * @property {BoothResource[]} resources
 * @property {string[]} stories
 * @property {string[]} prompts
 * @property {{ title: string, caption: string } | null} placeholder
 *
 * @typedef {Object} HotspotDefinition
 * @property {string} id
 * @property {string} moduleId
 * @property {string} label
 * @property {string} shortLabel
 * @property {number} x
 * @property {number} y
 * @property {string} zone
 */

/**
 * Returns a deep copy of frozen mock data so controllers can safely derive local state
 * without mutating the source of truth.
 *
 * WHY THIS EXISTS:
 * The same mock catalog is reused in multiple controllers and views. Returning clones
 * prevents accidental cross-component mutation, which is especially important when the
 * booth is used as a reference implementation for future integrations.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

/**
 * MODEL: Brand constants stay immutable because they express the public mission of the
 * booth and should not drift as interactive modules open and close.
 */
export const AGRI_BOOTH_BRAND = Object.freeze({
  name: 'ITCPH Digital Agri-Booth',
  shortName: 'Be-Booth',
  strapline: 'Living digital twin of the ATI International Training Center on Pig Husbandry.',
  mission:
    'Standardize and broadcast IOP-driven swine farming practices as a benchmark for smart agriculture in the ASEAN region.',
});

/**
 * MODEL: Outcome metrics are rendered in the hero area to keep the strategic goals
 * visible, not buried inside module drawers.
 */
const OUTCOMES = Object.freeze([
  { label: 'Biosecurity risk', value: 'Zero contact' },
  { label: 'Availability', value: '24/7 access' },
  { label: 'Data sharing', value: 'Real-time ready' },
  { label: 'Logistics cost', value: 'Low overhead' },
]);

/**
 * MODEL: Hotspot positions are normalized percentages so the layout scales cleanly
 * across phones, tablets, and desktops without relying on a heavy 3D runtime.
 *
 * @type {readonly HotspotDefinition[]}
 */
const HOTSPOTS = Object.freeze([
  {
    id: 'hotspot-virtual-tour',
    moduleId: 'virtual-tour',
    label: 'Virtual Tour',
    shortLabel: 'VT',
    x: 52,
    y: 24,
    zone: 'Entry map',
  },
  {
    id: 'hotspot-iec',
    moduleId: 'iec-materials',
    label: 'IEC Materials',
    shortLabel: 'IEC',
    x: 34,
    y: 36,
    zone: 'Resource wall',
  },
  {
    id: 'hotspot-corporate',
    moduleId: 'corporate-materials',
    label: 'Corporate Materials',
    shortLabel: 'CM',
    x: 18,
    y: 56,
    zone: 'Center backdrop',
  },
  {
    id: 'hotspot-newsletters',
    moduleId: 'newsletters',
    label: 'Newsletters',
    shortLabel: 'NL',
    x: 72,
    y: 34,
    zone: 'Publication stack',
  },
  {
    id: 'hotspot-chat',
    moduleId: 'chat-with-us',
    label: 'Chat With Us',
    shortLabel: 'AI',
    x: 80,
    y: 56,
    zone: 'Advisory desk',
  },
  {
    id: 'hotspot-elearning',
    moduleId: 'e-learning',
    label: 'E-Learning',
    shortLabel: 'LMS',
    x: 62,
    y: 72,
    zone: 'Training kiosk',
  },
  {
    id: 'hotspot-bebu',
    moduleId: 'bebu-game',
    label: 'Bebu Game',
    shortLabel: 'BG',
    x: 40,
    y: 74,
    zone: 'Trivia corner',
  },
  {
    id: 'hotspot-calculators',
    moduleId: 'digital-calculators',
    label: 'Digital Calculators',
    shortLabel: 'DC',
    x: 24,
    y: 76,
    zone: 'Decision tools',
  },
]);

/**
 * MODEL: Module definitions intentionally separate "access policy" from "content".
 * That design allows the controller to enforce gated access without the view needing to
 * know why a given module should be locked.
 *
 * @type {readonly BoothModule[]}
 */
const MODULES = Object.freeze([
  {
    id: 'virtual-tour',
    hotspotId: 'hotspot-virtual-tour',
    title: 'Virtual Tour',
    access: 'public',
    badge: 'Low-bandwidth default',
    summary: 'Inspect the booth through a live local 3D preview while keeping the hotspot map available for guided navigation.',
    description:
      'This module now pairs a locally hosted GLB booth preview with the schematic hotspot map so visitors can inspect the structure while still keeping navigation understandable on phones and event-floor connections.',
    highlights: [
      'Loads the booth from a local GLB asset instead of relying on third-party streaming.',
      'Keeps the hotspot map visible so the 3D preview does not make navigation harder on smaller screens.',
      'Reserves room for future narrated camera stops, 360 media, and richer spatial annotations.',
    ],
    quickStats: [
      { label: 'Current mode', value: '3D preview + map' },
      { label: 'Model source', value: 'Local GLB asset' },
      { label: 'Next step', value: '360 annotations' },
    ],
    resources: [],
    stories: [],
    prompts: [],
    externalTourUrl: 'https://s3.ap-southeast-1.amazonaws.com/tours.exsight360.com/itcph/v5/tour.html',
    placeholder: {
      title: 'ITCPH 360 Explorer',
      caption:
        'Access the official high-resolution 360 immersive walkthrough of the ITCPH facilities, integrated directly into the Agri-Booth dashboard.',
    },
  },
  {
    id: 'iec-materials',
    hotspotId: 'hotspot-iec',
    title: 'IEC Materials',
    access: 'gated',
    badge: 'Controlled download zone',
    summary: 'Official ITCPH training booklets for swine management, injection techniques, and farm husbandry.',
    materials: [
      {
        id: 'mat-piglet',
        image: '/images/materials/Gabay-sa-Pag-aalaga-ng-Biik_cover.webp',
        title: 'Gabay sa Pag-aalaga ng Biik',
        subtitle: '(Piglet Management)',
        description: 'A booklet designed to provide basic guidelines on drug administration in swine. It also discusses the recommended injection techniques in swine medicine, along with the steps to ensure that medications are given properly. The source of the information in this pamphlet is the Health Manual prepared by the Center\'s technical staff and the book, Pig Signals: Look, Think and Act.',
        pdfUrl: '/materials/Gabay-sa-Pag-aalaga-ng-Biik.pdf',
      },
      {
        id: 'mat-injection',
        image: '/images/materials/Gabay-sa-Tamang-Pamamaraan-sa-Pagturok_cover.webp',
        title: 'Gabay sa Tamang Pamamaraan sa Pagturok ng Baboy',
        subtitle: '(Injection Techniques in Pigs)',
        description: 'A booklet designed to provide basic guidelines on drug administration in swine. It also discusses the recommended injection techniques in swine medicine, along with the steps to ensure that medications are given properly. The source of the information in this pamphlet is the Health Manual prepared by the Center\'s technical staff and the book, Pig Signals: Look, Think and Act.',
        pdfUrl: '/materials/Gabay-sa-Tamang-Pamamaraan-sa-Pagturok.pdf',
      },
      {
        id: 'mat-finisher',
        image: '/images/materials/Gabay-sa-Pag-aalaga-ng-Palakihing-Baboy_cover.webp',
        title: 'Gabay sa Pag-aalaga ng Palakihing Baboy',
        subtitle: '(Finisher Management)',
        description: 'A booklet showing basic steps and principles to produce finishers efficiently. It also includes the proper transport and handling of market pigs.',
        pdfUrl: '/materials/Gabay-sa-Pag-aalaga-ng-Palakihing-Baboy.pdf',
      },
    ],
    resources: [],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'corporate-materials',
    hotspotId: 'hotspot-corporate',
    title: 'Success Stories',
    access: 'gated',
    badge: 'Institutional Showcase',
    summary: 'A leadership and impact area for ATI, ITCPH, and partner success narratives.',
    description: '',
    highlights: [],
    quickStats: [],
    resources: [],
    stories: [
      {
        title: "Riza “Makamasa” Unfolding the Glamour of Community Development",
        date: "December 9, 2025",
        image: "/images/stories/success1.png",
        quote: "“Noong pandemic, na-inlove ako sa cooperative kasi ang ganda-ganda, very transparent, autonomous, at tinatangkilik ang agriculture” – Riza.",
        text: `Rizalina P. Fortes, a wife and mother of three, began her humble career in pig farming through a series of unintentional incidents. Capable of starting a pig business, Riza and his husband set out to build a 300-finisher capacity farm in Taysan, Batangas, as a possible source of additional income.

Ironic as it may seem, the farm did not materialize. “Never namin nalagyan ng baboy yung building”, Riza adds. Several piglets are sometimes placed as payment for the services rendered by his Attorneyhusband. “Minsan bayad piglets from Bulacan, pero hindi nagsu-survive, nagkakandamatay", she narrates.

Hopeful to turn the pig business into a successful venture, Riza, also shared a good amount of investment with a local feed supplier, even getting a spot as a member of the audit committee. From this, she took off to a higher stage. During the pandemic, she had the luxury of time to attend seminars. This was an eye-opener for Riza, and a turning point at the same time.

“Doon ko nalaman na andami palang government grants for pig raisers”, she shares.

Eyeing the 5-million INSPIRE Program Project, Riza sought help in Barangay Piña, Taysan, Batangas. However, farmer organizations in the area were no longer functional. “Mahirap kasi talaga doon sa amin, walang pang sustain ang farmers, sa feeds, even sa pambayad sa artificial insemination”, says Riza.

“Bakit hindi na lang ikaw ang gumawa ng kooperatiba, kasi wala pa nito sa atin?”, the Barangay Chairman responds.

Determined to be a recipient of the INSPIRE Program Project – a government-led initiative to rebuild the swine industry from thedevastating effects of African swine fever by supporting LGUs, cooperatives, and pig producers with biosecure facilities, modern technology, training, and capital for hog repopulation, Riza founded the Piña Taysan Agriculture Cooperative (PITAC) in 2022.

While working to strengthen the cooperative’s core values and functions, she also participated in training at the ATI-ITCPH. Two years later, PITAC finally received a 10-million project (300-finisher building) under the Department of Agriculture – Regional Field Office CALABARZON.

During the construction of the building, Riza was at the ITCPH attending her 5th and 6th courses, the National Trainer’s Course on Pig Husbandry, and the National Trainer’s Course on Animal Waste Management and Utilization. “Ito yung time na kino-construct yung INSPIRE sa amin, very timely kasi nababantayan ko according to standard”, Riza happily shares.

Riza serves as the General Manager of PITAC. From merely 18 pig farmers, the cooperative grew to 121 members, with half as pig producers and the other half as investors. Their (personal) empty pig pens are also transformed into a functional space for PITAC members. Currently, it houses 10 sows, 40 piglets, and 150 finishers. “Yung hindi namin nagagamit dati na mga kulungan, doon naglalagay ng baboy yung ibang members ng PITAC”, Riza adds.

Knowing the challenges faced by fellow pig raisers, Riza, ensures that the smallholders earn a profitable business. In partnership with a local feed supplier, GM Riza safeguards the feed capital through a loan once the hog market has concluded. “Unang goal ng PITAC is to supply feeds as pautang sa pig farmers”, she explains.

Now that feeds have been secured, new challenges have cropped up, such as the market for finishers. As a solution, PITAC buys the marketable hogs. To avoid further losses, haulers were welcomed to join the cooperative as members.

Pigs classified as slow growers are processed into tapa, tocino, and longganisa. Through value-adding, patronage, and refund schemes, members enjoy benefits.

From zero-knowledge in pig farming, Riza embraced the beauty of swine. Knowledge gained from the training is being disseminated through a Pre-membership education seminar (PMES) for interested individuals to join the cooperative. Members also practice ethnoveterinary medicine, using locally available plants to prevent disease and some as topical ointments for open wounds.

Working with the community has had a significant impact not only on Riza but also on the smallholder pig raisers in Taysan. “Pag may tulungan, lumalago ang negosyo”, she stressed.

Today, Riza enjoys the company of fellow pig raisers while seeing the progress she has made in their lives.

#ITCPHway #LearningByDoing`
      },
      {
        title: "Beyond the Target: How Tilambo MPC Set the Gold Standard for Community-Based Swine Farming",
        date: "November 26, 2025",
        image: "/images/stories/success2.png",
        quote: `"Sa kasalukuyan po mayroon na kaming 1,194 na produkto ng INSPIRE Project. May karagdagan po na 42 heads na ilalabas ngayong December. Kung susumahin po ay nasa 1,236 which is 106% na ng accomplishment ng Tilambo Multipurpose Cooperative." - Gregorio U. Culla Jr., General Manager, Tilambo Multipurpose Cooperative`,
        text: `The Tilambo Multipurpose Cooperative (Tilambo MPC) in Taysan, Batangas, is a farmer group that offers various services to its members, including savings and deposits, lending, rental and catering services, a fuel refilling station, a water distribution system, and agricultural services. Established in 1997, the cooperative is now consists of 1798 members. In 2022, Tilambo MPC started a 300 Finisher Production, Community-based swine farm. This is part of the Department of Agriculture’s (DA) commitment to rebooting the swine industry through the National Livestock Program (NLP) and ATI-ITCPH. This 5-million-peso project includes the establishment of farm buildings, a farm office, feed storage, a biosecurity area, a waste management facility, and the provision of farm equipment.

The Project aims to produce and promote good quality meat in the market, adopt modern facilities with climate-controlled systems and biosecurity, provide a venue for training, extension and learning of farmers, students, and interested individuals, support the DA and other government agencies’ swine-based livelihood programs by producing adequate and quality meat to supply these program’s needs, and provide an additional source of food and income to the farmer members.

"Ang INSPIRE project po ay tumulong sa pagsu-suply ng pork meat sa merkado, dahil yun po ang isa sa mga layunin bilang isang swine multiplier farm. Iyun pong naha-howl na mga fatteners, yun po ang sinusuply sa merkado." - Gregorio U. Culla Jr.

Three years after its inauguration, the Tilambo MPC produced a total of 1236 fatteners. It exceeds the 1,164 target. Given the value of animals supplied to the local market, the 106% success rate covers the full investment cost of the Department of Agriculture-National Livestock Program. Likewise, as a techno-demo farm, the project has successfully operated a modern facility with climate-controlled systems and biosecurity and provided a venue for training, extension, and learning for farmers.

"Dito sa aming kooperatiba, halos lahat ng myembro ay nag-aalaga ng baboy. Marami ang naitulong ng proyektong ito. Unanguna, yung sa kinita namin, nakabahagi ang mga kasapi, nakapagpapa-iwi na din kami sa mga kasapi kapag sumosobra ang biik. Nakaka-attend kami ng mga pagsasanay, at natututunan ang tamang sistema ng pagaalaga ng baboy. Ilan lamang ito sa mga naitutulong ng proyekto sa pamamagitan ng ITCPH." - Mr. Crispin U. Berana, Chairman of the Board, Tilambo MPC

Tilambo MPC still plans to strengthen its operations through the adaptation of the latest technology in pig farming, enhanced facilities, continuous capability building, and strict implementation of biosecurity practices.`
      },
      {
        title: "LABS so Sweet: Promoting the Aromatic LABS Concoction",
        date: "October 14, 2025",
        image: "/images/stories/success3.png",
        quote: `"Kapag mabango at matamis-tamis ang amoy ng Lactic Acid Bacteria (LAB) serum, lalo na sa natural na pagbuburo (fermentation) tulad ng sa Korean Natural Farming, ay tumutukoy sa mga senyales ng matagumpay na proseso ng paggawa at wastong pag-iimbak nito."`,
        text: `Mr. Guillermo “Gil” Z. De Castro is one of the owners of Gil Integrated Farm and Training School, Inc., located in Rizal, Majayjay, Laguna. The farm is a DA ATI- Learning Site for Agriculture and a TESDA-accredited Farm School. In 2024, he completed the course Sustainable Pig Farming – Lactic Acid Bacteria Serum (SPF-LABS). Attending this course provided him with benefits, including a solid scientific foundation combined with practical operational skills.

In his previous career, Gil served as a manager in an international bank. However, due to the COVID-19 pandemic, he decided to manage his family-owned farm and training school.

"Noon, sabi ng parents ko, ang hawakan daw namin ay papel at ballpen, kasi mahirap sa agriculture, nauulanan ka, naiinitan ka… Kinailangan ko na bumalik sa agriculture kasi isa ito sa mga sustainable businesses noong pandemic… kaya ako bumalik kasi gusto ko tumulong sa community namin na mapataas ulit ang pagpo-produce ng baboy."

Since his training school offers learners essential skills in Agro-Entrepreneurship, he must continually equip himself. He wanted to gain expertise in this field and sought out agencies that provide training. And so, he learned about ITCPH through its social media sites.

"Nakita ko po sa Facebook ang ITCPH. Tiningnan ko po ang mga schedule ng training. Nakita ko din po ang mga success stories, nabasa ko po ang kanilang progress…nag-umpisa sila ng walang kaalaman sa pagbabuyan, at dahil po sa ITCPH nagkaroon sila ng maraming kaalaman."

Through the training, Gil gained a comprehensive understanding of the microbiology of LAB serum, learning how specific strains promote gut health, strengthen the immune system, and effectively inhibit harmful pathogens. While the usual smell of properly prepared Lactic Acid Bacteria (LAB) serum is distinctly sour, acidic, or yogurt-like, he develops a more desirable sweet smell in the serum, which also indicates a successful fermentation by all the beneficial microorganisms present.

"Ang “tamis" na binabanggit ay kadalasang tumutukoy sa (sweet and sour smell), at hindi sa aktwal na lasa na matamis dahil sa molasses o asukal . Ang ganitong amoy ay indikasyon ng malinis na fermentation, na nagpapahiwatig na ang mga mabubuting LAB ang nangingibabaw at walang masamang mikroorganismo (pathogens) ang dumami at sumira sa produkto. Ang hindi kanais-nais o mabahong amoy ay senyales ng pagkasira."

Another impact of the SPF-LABS training is its agro-entrepreneurial benefits. This is realized by enabling pig farmers to develop premium, niche markets for antibiotic-free and naturally raised pork. This approach helps diversify their income sources and boost brand differentiation. LABS opens new business avenues through value-added and waste-to-resource models, allowing farmers, as well as young people, to sell excess LABS or high-quality organic compost made from their waste. Most importantly, its use enhances economic efficiency by significantly cutting veterinary costs and improving the Feed Conversion Ratio (FCR), transforming pig farming from a commodity business into a more profitable, sustainable, and high-value entrepreneurial venture.

"...kung matututunan nila ang proseso ng concoctions, maari nila itong ibenta at siguradong kikita sila. Pwede din sila gumawa ng sarili nilang feed, ito ay ilan sa mga natutunan ko sa ITCPH. Ito po ay mabisang solusyon sa mahal na presyo ng feeds."

He also emphasizes the importance of transitioning from traditional methods to innovative practices in pig farming due to the urgent need to increase profitability, enhance biosecurity, and meet stringent market demands for welfare and sustainability. Traditional farming struggles with high operating costs, particularly for feed, and is highly vulnerable to devastating disease outbreaks.

"Wag tayo nasanay sa mga tradisyonal na pamamaraan, sa pagbabago ng mundo, kailangan mabilis tayo mag-adjust. Mayroon na po ng innovative pen design na itinuturo ang ITCPH. Kahit ang dumi ng baboy, pwede sya pagkakitaan."

Moreover, Gil advocates the importance of continuous learning. Farmers must dedicate time to pig farming training because ongoing education is essential for running a profitable and resilient modern operation. Training provides the specialized knowledge needed to adopt innovative practices.

"Huwag tayo agad-agad susuko. Hindi madali ang pagbababuyan, kailangan may passion ka. Kung mawaalan tayo ng mga babuyan o hindi tayo mag-aalaga ng baboy. Anu pong kakainin [pandagdag] ng mga mamamayan sa Pilipinas?"

#ITCPHway #LearningByDoing`
      }
    ],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'newsletters',
    hotspotId: 'hotspot-newsletters',
    title: 'Newsletters',
    access: 'gated',
    badge: 'Publication archive',
    summary: 'Browse through 23 archived editions of the ITCPH Newsletters.',
    images: [
      '/images/newsletters/newsletter-1.jpg',
      '/images/newsletters/newsletter-2.webp',
      '/images/newsletters/newsletter-3.jpg',
      '/images/newsletters/newsletter-4.jpg',
      '/images/newsletters/newsletter-5.jpg',
      '/images/newsletters/newsletter-6.jpg',
      '/images/newsletters/newsletter-7.jpg',
      '/images/newsletters/newsletter-8.jpg',
      '/images/newsletters/newsletter-9.jpg',
      '/images/newsletters/newsletter-10.jpg',
      '/images/newsletters/newsletter-11.jpg',
      '/images/newsletters/newsletter-12.jpg',
      '/images/newsletters/newsletter-13.jpg',
      '/images/newsletters/newsletter-14.jpg',
      '/images/newsletters/newsletter-15.jpg',
      '/images/newsletters/newsletter-16.jpg',
      '/images/newsletters/newsletter-17.jpg',
      '/images/newsletters/newsletter-18.jpg',
      '/images/newsletters/newsletter-19.jpg',
      '/images/newsletters/newsletter-20.jpg',
      '/images/newsletters/newsletter-21.jpg',
      '/images/newsletters/newsletter-22.jpg',
      '/images/newsletters/newsletter-23.jpg'
    ],
    externalLink: 'https://www.atiitcph.com/newsletters',
    resources: [],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'chat-with-us',
    hotspotId: 'hotspot-chat',
    title: 'Chat With Us',
    access: 'gated',
    badge: 'Automated advisory UI',
    summary: 'A mock farm business advisory conversation surface for frequently asked questions and guided support.',
    description:
      'The advisory chat is gated because it simulates personalized engagement. Requiring the logbook first mirrors how future support services can stay measurable and responsibly exposed.',
    highlights: [
      'Designed as a safe mock chat without backend transmission or external AI calls.',
      'Demonstrates how visitor questions can be routed into future advisory workflows.',
      'Uses canned logic only, preventing accidental disclosure of unsupported advice.',
    ],
    quickStats: [
      { label: 'Mode', value: 'Mock assistant' },
      { label: 'Backend', value: 'None' },
      { label: 'Auditability', value: 'Deterministic' },
    ],
    resources: [],
    stories: [],
    prompts: [
      'How do I start a farm biosecurity checklist?',
      'What should a low-bandwidth advisory workflow look like?',
      'How can the booth support extension training at scale?',
    ],
    placeholder: null,
  },
  {
    id: 'e-learning',
    hotspotId: 'hotspot-elearning',
    title: 'E-Learning',
    access: 'gated',
    badge: 'Portal placeholder',
    summary: 'A launch point for future LMS and digital learning integrations without coupling the frontend to a live platform yet.',
    description:
      'The portal stays mocked in this frontend-only build so the interface can be validated now while LMS handshakes, enrollment rules, and back-office flows are handled later.',
    highlights: [
      'Supports a future handoff to ATI and ITCPH learning portals.',
      'Keeps portal navigation visible even before live authentication is attached.',
      'Protects the frontend from broken deep links while requirements are still evolving.',
    ],
    quickStats: [
      { label: 'Status', value: 'Frontend mock' },
      { label: 'Auth', value: 'Deferred' },
      { label: 'Purpose', value: 'Learning gateway' },
    ],
    resources: [
      {
        id: 'res-lms-orientation',
        title: 'LMS Orientation Tile',
        format: 'Portal mock',
        description: 'Placeholder card for orientation videos, schedules, and course walkthroughs.',
        status: 'Ready for tracking',
      },
      {
        id: 'res-course-catalog',
        title: 'Course Catalog Tile',
        format: 'Portal mock',
        description: 'Placeholder card for pig husbandry lessons, quizzes, and certificate pathways.',
        status: 'Ready for tracking',
      },
    ],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'bebu-game',
    hotspotId: 'hotspot-bebu',
    title: 'Bebu Game',
    access: 'public',
    badge: 'Engagement module',
    summary: 'A light trivia experience that turns core pig husbandry lessons into repeatable recall checks.',
    description:
      'The trivia layer keeps the booth playful without diluting its training purpose. It is public by design so visitors can engage even before completing the logbook.',
    highlights: [
      'Supports informal learning and event-floor engagement.',
      'Creates a pathway from curiosity into deeper gated modules.',
      'Uses deterministic scoring suitable for future badge logic.',
    ],
    quickStats: [
      { label: 'Audience', value: 'Open access' },
      { label: 'Mode', value: 'Single-question flow' },
      { label: 'Goal', value: 'Recall practice' },
    ],
    resources: [],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'digital-calculators',
    hotspotId: 'hotspot-calculators',
    title: 'Digital Calculators',
    access: 'public',
    badge: 'Decision support',
    summary: 'Simple farm calculators that preview how the booth can support cost and planning decisions.',
    description:
      'These calculators stay public because they are a strong demonstration of practical value. They also prove how the booth can bridge education with operational decision support.',
    highlights: [
      'Focused on lightweight calculations that run fully in the browser.',
      'Avoids network calls so farm users can still work offline or on poor signal.',
      'Acts as a foundation for future ROI and feed analytics modules.',
    ],
    quickStats: [
      { label: 'Mode', value: 'Browser-only' },
      { label: 'Latency', value: 'Instant' },
      { label: 'Use case', value: 'Planning aid' },
    ],
    resources: [],
    stories: [],
    prompts: [],
    placeholder: null,
  },
]);

/**
 * MODEL: Chat responses are deterministic and keyword-driven because the user asked for a
 * secure frontend-only build. We intentionally avoid any hidden network dependency.
 */
const ADVISORY_RESPONSE_LIBRARY = Object.freeze([
  {
    keywords: ['biosecurity', 'visitor', 'checklist', 'sanitize', 'sanitation'],
    response:
      'Start with a controlled visitor log, clear entry and exit points, sanitation steps, and a non-negotiable separation between clean and dirty workflows.',
  },
  {
    keywords: ['bandwidth', 'mobile', 'offline', 'signal'],
    response:
      'Design for text-first delivery, cache lightweight reference cards, and only introduce heavier media after a user explicitly requests it on a stable connection.',
  },
  {
    keywords: ['training', 'lms', 'extension', 'learning'],
    response:
      'Use the booth as an orientation layer first, then hand visitors to scheduled lessons, downloadable references, and short assessments inside the LMS.',
  },
  {
    keywords: ['cost', 'roi', 'calculator', 'feed'],
    response:
      'Keep the advisory focused on decision support: estimate feed cost, expected output, and labor implications before recommending any operational change.',
  },
]);

/**
 * MODEL: Seed chat messages guide the first interaction so the advisory module never
 * appears empty or broken on first load.
 */
const ADVISORY_SEED_MESSAGES = Object.freeze([
  {
    id: 'assistant-seed',
    role: 'assistant',
    text: 'Welcome to the mock Farm Business Advisory desk. Ask about biosecurity, low-bandwidth delivery, or training pathways.',
  },
]);

/**
 * MODEL: Trivia remains immutable so scoring can be reproduced consistently across
 * sessions and future QA checks.
 */
const TRIVIA_QUESTIONS = Object.freeze([
  {
    id: 'trivia-1',
    prompt: 'Which booth outcome is most directly tied to avoiding farm contamination during outreach?',
    options: [
      { id: 'a', label: 'Zero Biosecurity Risk' },
      { id: 'b', label: 'Low Logistics Cost' },
      { id: 'c', label: '24/7 Availability' },
    ],
    correctOptionId: 'a',
    explanation:
      'The booth reduces physical contact and material handling, which directly supports a zero-biosecurity-risk outreach model.',
  },
  {
    id: 'trivia-2',
    prompt: 'Why is the current virtual tour delivered as a lightweight hotspot map?',
    options: [
      { id: 'a', label: 'To avoid documenting the booth layout' },
      { id: 'b', label: 'To support low-bandwidth mobile access' },
      { id: 'c', label: 'To replace all future training modules' },
    ],
    correctOptionId: 'b',
    explanation:
      'The fallback map keeps the interface accessible even when visitors are on weak mobile or event-floor connections.',
  },
]);

/**
 * MODEL: Calculator field definitions stay outside the view so labels, limits, and
 * semantics are auditable in one place.
 */
const CALCULATOR_FIELDS = Object.freeze([
  {
    id: 'sowCount',
    label: 'Breeding sows',
    min: 0,
    max: 1000,
    step: 1,
    suffix: 'heads',
  },
  {
    id: 'pigletsPerSow',
    label: 'Piglets per sow',
    min: 0,
    max: 30,
    step: 0.5,
    suffix: 'piglets',
  },
  {
    id: 'feedCostPerKg',
    label: 'Feed cost per kilogram',
    min: 0,
    max: 500,
    step: 0.1,
    suffix: 'currency/kg',
  },
  {
    id: 'dailyFeedKg',
    label: 'Feed consumption',
    min: 0,
    max: 500,
    step: 0.1,
    suffix: 'kg/day',
  },
  {
    id: 'growOutDays',
    label: 'Grow-out days',
    min: 1,
    max: 365,
    step: 1,
    suffix: 'days',
  },
]);

/**
 * MODEL: Default calculator inputs create meaningful sample outputs immediately so the
 * calculator demonstrates value before the user enters custom values.
 */
const CALCULATOR_DEFAULTS = Object.freeze({
  sowCount: 12,
  pigletsPerSow: 10,
  feedCostPerKg: 24.5,
  dailyFeedKg: 38,
  growOutDays: 120,
});

/**
 * Returns a clone of the immutable outcome metrics.
 *
 * @returns {BoothMetric[]}
 */
export function getOutcomeMetrics() {
  return cloneValue(OUTCOMES);
}

/**
 * Returns a clone of the booth hotspot layout.
 *
 * @returns {HotspotDefinition[]}
 */
export function getHotspotLayout() {
  return cloneValue(HOTSPOTS);
}

/**
 * Returns a clone of the complete booth module catalog.
 *
 * @returns {BoothModule[]}
 */
export function getBoothModules() {
  return cloneValue(MODULES);
}

/**
 * Returns a clone of the advisory response catalog used by the chat controller.
 *
 * @returns {{ keywords: string[], response: string }[]}
 */
export function getAdvisoryResponseLibrary() {
  return cloneValue(ADVISORY_RESPONSE_LIBRARY);
}

/**
 * Returns a clone of the initial advisory conversation.
 *
 * @returns {{ id: string, role: string, text: string }[]}
 */
export function getAdvisorySeedMessages() {
  return cloneValue(ADVISORY_SEED_MESSAGES);
}

/**
 * Returns a clone of the trivia deck for the Bebu game module.
 *
 * @returns {{ id: string, prompt: string, options: { id: string, label: string }[], correctOptionId: string, explanation: string }[]}
 */
export function getTriviaDeck() {
  return cloneValue(TRIVIA_QUESTIONS);
}

/**
 * Returns the calculator field metadata used by the digital calculators module.
 *
 * @returns {{ id: string, label: string, min: number, max: number, step: number, suffix: string }[]}
 */
export function getCalculatorFieldDefinitions() {
  return cloneValue(CALCULATOR_FIELDS);
}

/**
 * Returns default calculator input values for the controller's reactive state.
 *
 * @returns {{ sowCount: number, pigletsPerSow: number, feedCostPerKg: number, dailyFeedKg: number, growOutDays: number }}
 */
export function getCalculatorDefaults() {
  return cloneValue(CALCULATOR_DEFAULTS);
}
