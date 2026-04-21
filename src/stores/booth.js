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
        content: {
          description: 'Celebrating achievements and institutional growth.',
          stories: ['The 2025 Smart Farm Award', 'Empowering local farmers through digital shift']
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
        title: 'Bebu Game',
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
