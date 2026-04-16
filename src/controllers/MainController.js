import { SceneView } from '../views/SceneView.js';
import { UIView } from '../views/UIView.js';
import * as THREE from 'three';

export class MainController {
  constructor() {
    this.sceneView = new SceneView(document.getElementById('canvas-container'));
    this.uiView = new UIView();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.currentHotspotId = null;

    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    window.addEventListener('pointerdown', this.onPointerDown.bind(this));

    this.uiView.setCloseInfoCallback(() => {
      this.sceneView.focusOnTarget(null);
      this.uiView.hideInfoCard();
      this.currentHotspotId = null;
    });
  }

  onPointerDown(event) {
    // Don't raycast when user is clicking inside the overlay
    if (event.target.closest('#info-card-container')) return;

    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.sceneView.getCamera());
    const intersects = this.raycaster.intersectObjects(this.sceneView.getInteractableObjects());

    if (intersects.length > 0) {
      const clicked = intersects[0].object;
      const id = clicked.userData.id;
      if (!id) return;

      if (this.currentHotspotId === id && this.uiView.isInfoCardVisible()) return;

      this.currentHotspotId = id;
      this.sceneView.focusOnTarget(clicked);

      const contentMap = {

        dot_brochure_rack: {
          title: 'IEC Materials',
          html: `
            <ul class="styled-list">
              <li>Downloadable pamphlets and brochures</li>
              <li>Pig husbandry best practices handouts</li>
              <li>ATI Learning Sites product catalogs</li>
              <li>Annual reports and newsletters</li>
            </ul>
          `
        },

        dot_left_shelf: {
          title: 'Key Takeaways',
          html: `
            <ul class="styled-list">
              <li>ITCPH meets the international standard of training management</li>
              <li>Globalization and high-impact technologies is an integral part of Organizational Strategy (The IOP Era, #IOPEra)</li>
              <li>Agricultural Research and Futuring Project</li>
              <li>Network of SEA leaders in Agriculture</li>
            </ul>
          `
        },

        dot_banner: {
          title: 'Final Outcome',
          html: `
            <ul class="styled-list">
              <li>Zero Biosecurity Risk</li>
              <li>24/7 Availability</li>
              <li>Real Time Data Share</li>
              <li>Low Logistics Cost</li>
            </ul>
            <h3 style="margin-top:20px;color:#1a6ab4;">Interactive Hotspots Include:</h3>
            <ul class="styled-list">
              <li>Virtual tour</li>
              <li>IEC Materials</li>
              <li>Corporate Materials</li>
              <li>Success Stories</li>
              <li>Newsletters</li>
              <li>Chat with us</li>
              <li>E-Learning (LMS)</li>
              <li>Bebu Game</li>
              <li>Digital Calculators</li>
            </ul>
          `
        },

        dot_table: {
          title: 'Visitor Registration',
          html: `
            <form class="reg-form" onsubmit="event.preventDefault();this.querySelector('.reg-success').style.display='block';this.querySelector('.reg-fields').style.display='none';">
              <div class="reg-fields">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="e.g. Juan dela Cruz" required>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="City / Province" required>
                </div>
                <div class="form-group">
                  <label>Affiliations</label>
                  <input type="text" placeholder="Organization / Agency">
                </div>
                <div class="form-group">
                  <label>Gender</label>
                  <select>
                    <option value="">Select gender...</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Type of Client</label>
                  <select>
                    <option value="">Select type...</option>
                    <option>Farmer / Livestock Raiser</option>
                    <option>Student</option>
                    <option>Government Employee</option>
                    <option>Private Sector</option>
                    <option>NGO / Cooperatives</option>
                    <option>Researcher / Academic</option>
                    <option>Others</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="email@example.com">
                </div>
                <div class="form-group">
                  <label>Items Collected</label>
                  <input type="text" placeholder="e.g. Pamphlets, Brochures">
                </div>
                <div class="form-group">
                  <label>Feedback</label>
                  <textarea rows="3" placeholder="Share your thoughts or concerns..."></textarea>
                </div>
                <button type="submit" class="submit-button">Submit Registration</button>
              </div>
              <div class="reg-success" style="display:none;text-align:center;padding:30px 0;">
                <div style="font-size:2.5rem;">✅</div>
                <h3 style="color:#1a6ab4;margin-top:12px;">Thank you!</h3>
                <p style="margin-top:8px;color:#555;">Your registration has been recorded.</p>
              </div>
            </form>
          `
        },

        dot_right_shelf: {
          title: 'Intermediate Outcome',
          html: `
            <p>ITCPH Digital Agri-Booth is linked to the Center's Website, ensuring that the service provided by the physical booth is also available virtually.</p>
            <p style="margin-top:12px;">It ensures data needed for Farm Business Advisories is collected, including names, addresses, a list of downloaded IEC materials, and other feedback and concerns.</p>
          `
        },

        dot_top_sign: {
          title: 'ATI International Training Center',
          html: `
            <p><strong>ISO 9001:2015 Certified</strong></p>
            <p style="margin-top:10px;">ATI International Training Center on Pig Husbandry (ITCPH) — <em>Learning by Doing... Do it the #ITCPHway!</em></p>
            <p style="margin-top:12px;">Providing world-class training and extension services in swine production and pig husbandry across Southeast Asia.</p>
          `
        },

        dot_chairs: {
          title: 'Output',
          html: `
            <p>Establishing the Digital Agri-Booth requires a strategic transition from static content to a <strong>dynamic ecosystem</strong>, beginning with creating an intuitive virtual booth environment that maps to a user-friendly digital journey.</p>
            <p style="margin-top:12px;">To ensure true <strong>nationwide / international reach</strong>, the modality must be optimized for low-bandwidth mobile access and include backend analytics to track user engagement.</p>
          `
        }
      };

      const card = contentMap[id];
      if (card) this.uiView.showInfoCard(card.title, card.html);

    } else {
      // Clicked empty space — reset everything
      this.sceneView.focusOnTarget(null);
      this.uiView.hideInfoCard();
      this.currentHotspotId = null;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.sceneView.render();
  }
}
