import { defineStore } from 'pinia';

/**
 * MODEL: Booth Store
 * Manages the interactive "hotspots" and booth-specific content.
 * Centralizes all educational hub content for easy maintenance.
 */
export const useBoothStore = defineStore('booth', {
  state: () => ({
    activeHotspotId: null,
    hotspots: {
      dot_brochure_rack: {
        id: 'dot_brochure_rack',
        title: 'IEC Materials',
        requiresRegistration: true,
        content: {
          description: 'Downloadable content for pig husbandry best practices.',
          items: ['Feeding Guide PDF', 'Biosecurity Protocol PDF', 'Breed Selection Guide']
        }
      },
      dot_left_shelf: {
        id: 'dot_left_shelf',
        title: 'Key Takeaways',
        content: {
          description: 'Standardizing IOP-driven swine farming as a benchmark for smart agriculture.',
          points: [
            'International Standard of Training Management',
            'IOP Era Organizational Strategy',
            'Agricultural Research and Futuring',
            'SEA Leaders Network'
          ]
        }
      },
      dot_banner: {
        id: 'dot_banner',
        title: 'Final Outcome',
        content: {
          description: 'The ITCPH vision for sustainable agriculture.',
          metrics: [
            { label: 'Biosecurity Risk', value: 'Zero' },
            { label: 'Availability', value: '24/7' },
            { label: 'Logistics Cost', value: 'Low' }
          ]
        }
      },
      dot_table: {
        id: 'dot_table',
        title: 'Visitor Registration',
        type: 'modal' // Handled specially by the UI
      },
      dot_corporate: {
        id: 'dot_corporate',
        title: 'Corporate Materials & Success Stories',
        badge: 'Institutional Showcase',
        summary: 'A leadership and impact area for ATI, ITCPH, and partner success narratives.',
        content: {
          description: 'Explore the transformational journeys of ITCPH trainees and partner cooperatives.',
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

Today, Riza enjoys the company of fellow pig raisers while seeing the progress she has made in their lives.`
            },
            {
              title: "Beyond the Target: How Tilambo MPC Set the Gold Standard for Community-Based Swine Farming",
              date: "November 26, 2025",
              image: "/images/stories/success2.png",
              quote: `"Sa kasalukuyan po mayroon na kaming 1,194 na produkto ng INSPIRE Project. May karagdagan po na 42 heads na ilalabas ngayong December. Kung susumahin po ay nasa 1,236 which is 106% na ng accomplishment ng Tilambo Multipurpose Cooperative."`,
              text: `The Tilambo Multipurpose Cooperative (Tilambo MPC) in Taysan, Batangas, is a farmer group that offers various services to its members, including savings and deposits, lending, rental and catering services, a fuel refilling station, a water distribution system, and agricultural services. Established in 1997, the cooperative is now consists of 1798 members. In 2022, Tilambo MPC started a 300 Finisher Production, Community-based swine farm. This is part of the Department of Agriculture’s (DA) commitment to rebooting the swine industry through the National Livestock Program (NLP) and ATI-ITCPH. This 5-million-peso project includes the establishment of farm buildings, a farm office, feed storage, a biosecurity area, a waste management facility, and the provision of farm equipment.

The Project aims to produce and promote good quality meat in the market, adopt modern facilities with climate-controlled systems and biosecurity, provide a venue for training, extension and learning of farmers, students, and interested individuals, support the DA and other government agencies’ swine-based livelihood programs by producing adequate and quality meat to supply these program’s needs, and provide an additional source of food and income to the farmer members.

Three years after its inauguration, the Tilambo MPC produced a total of 1236 fatteners. It exceeds the 1,164 target. Given the value of animals supplied to the local market, the 106% success rate covers the full investment cost of the Department of Agriculture-National Livestock Program. Likewise, as a techno-demo farm, the project has successfully operated a modern facility with climate-controlled systems and biosecurity and provided a venue for training, extension, and learning for farmers.

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

Another impact of the SPF-LABS training is its agro-entrepreneurial benefits. This is realized by enabling pig farmers to develop premium, niche markets for antibiotic-free and naturally raised pork. This approach helps diversify their income sources and boost brand differentiation through value-added and waste-to-resource models, allowing farmers, as well as young people, to sell excess LABS or high-quality organic compost made from their waste. Most importantly, its use enhances economic efficiency by significantly cutting veterinary costs and improving the Feed Conversion Ratio (FCR), transforming pig farming from a commodity business into a more profitable, sustainable, and high-value entrepreneurial venture.

He also emphasizes the importance of transitioning from traditional methods to innovative practices in pig farming due to the urgent need to increase profitability, enhance biosecurity, and meet stringent market demands for welfare and sustainability. Traditional farming struggles with high operating costs, particularly for feed, and is highly vulnerable to devastating disease outbreaks.

Moreover, Gil advocates the importance of continuous learning. Farmers must dedicate time to pig farming training because ongoing education is essential for running a profitable and resilient modern operation. Training provides the specialized knowledge needed to adopt innovative practices.`
            }
          ]
        }
      },
      dot_newsletters: {
        id: 'dot_newsletters',
        title: 'Newsletters',
        content: {
          description: 'Monthly updates on pig husbandry and ATI initiatives.'
        }
      },
      dot_elearning: {
        id: 'dot_elearning',
        title: 'E-Learning (LMS)',
        content: {
          description: 'Access the Virtual Training Portal and manage your courses.'
        }
      },
      dot_bebu: {
        id: 'dot_bebu',
        title: 'Bebu Game & Trivia',
        content: {
          description: 'Interactive pig husbandry trivia to test your knowledge.'
        }
      },
      dot_calculators: {
        id: 'dot_calculators',
        title: 'Digital Calculators',
        content: {
          description: 'Tools for feed conversion ratios, ROI, and farm management.'
        }
      }
    }
  }),

  getters: {
    activeHotspot: (state) => state.hotspots[state.activeHotspotId]
  },

  actions: {
    setActiveHotspot(id) {
      this.activeHotspotId = id;
    },
    clearActiveHotspot() {
      this.activeHotspotId = null;
    }
  }
});
