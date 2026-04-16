import { DialogueModel } from '../models/DialogueModel.js';
import { SceneView } from '../views/SceneView.js';
import { UIView } from '../views/UIView.js';
import * as THREE from 'three';

export class MainController {
  constructor() {
    this.model = new DialogueModel();
    this.sceneView = new SceneView(document.getElementById('canvas-container'));
    this.uiView = new UIView();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.currentNPCId = null;

    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    // Interaction with 3D objects
    window.addEventListener('pointerdown', this.onPointerDown.bind(this));
    
    // Listen for chat messages sent by the user
    this.uiView.setSendCallback(this.onUserSendMessage.bind(this));

    // Listen for info card close
    this.uiView.setCloseInfoCallback(() => {
        this.sceneView.focusOnTarget(null); // zoom out
        this.uiView.hideInfoCard();
        this.currentNPCId = null;
    });
  }

  async onPointerDown(event) {
    // Prevent raycasting if clicking on the chat UI
    if (event.target.closest('#chat-container')) {
        return;
    }

    // Calculate pointer position in normalized device coordinates (-1 to +1)
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    this.raycaster.setFromCamera(this.pointer, this.sceneView.getCamera());

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.sceneView.getInteractableObjects());

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const npcId = clickedObject.userData.id;

      if (npcId) {
        // If clicking the SAME NPC twice, don't restart unless everything is closed
        if (this.currentNPCId === npcId && (this.uiView.isChatContainerVisible() || this.uiView.isInfoCardVisible())) return;
        
        this.currentNPCId = npcId;
        
        // Command SceneView to smoothly zoom in on the chosen NPC
        this.sceneView.focusOnTarget(clickedObject);
        
        if (npcId === 'hotspot_takeaways') {
            this.uiView.hideChatContainer();
            if (!this.uiView.isInfoCardVisible()) {
                const title = "Key Takeaways";
                const content = `
                  <ul class="styled-list">
                    <li>TMT: ITCPH meets the international standard of training management</li>
                    <li>Globalization and high-impact technologies is an integral part of Organizational Strategy (The IOP Era, #IOPEra)</li>
                    <li>Agricultural Research and Futuring Project</li>
                    <li>Network of SEA leaders in Agriculture</li>
                  </ul>
                `;
                this.uiView.showInfoCard(title, content);
            }
        } else if (npcId === 'hotspot_data') {
            this.uiView.hideChatContainer();
            if (!this.uiView.isInfoCardVisible()) {
                const title = "Data Collection";
                const content = `
                  <form class="mock-form" onsubmit="event.preventDefault()">
                     <div class="form-group"><label>Name</label><input type="text" placeholder="Your Name"></div>
                     <div class="form-group"><label>Address</label><input type="text" placeholder="Your Address"></div>
                     <div class="form-group"><label>Affiliations</label><input type="text" placeholder="Your Affiliations"></div>
                     <div class="form-group"><label>Gender</label><input type="text" placeholder="Your Gender"></div>
                     <div class="form-group"><label>Type Client</label><input type="text" placeholder="Client Type"></div>
                     <div class="form-group"><label>Email Address</label><input type="email" placeholder="Your Email"></div>
                     <div class="form-group"><label>Items collected</label><input type="text" placeholder="Items"></div>
                     <div class="form-group"><label>Feedback</label><textarea placeholder="Your Feedback"></textarea></div>
                     <button type="submit" class="submit-button">Submit (Mockup)</button>
                  </form>
                `;
                this.uiView.showInfoCard(title, content);
            }
        } else if (npcId === 'hotspot_intermediate') {
            this.uiView.hideChatContainer();
            if (!this.uiView.isInfoCardVisible()) {
                const title = "Intermediate Outcome";
                const content = `
                  <p>ITCPH Digital Agri-Booth, which is linked to the Center's Website. As such, this ensures that the service provided by the ITCPH physical booth is also available virtually.</p>
                  <p>It also ensures that the data needed for the Farm Business Advisories is collected, including names, addresses, a list of downloaded IEC materials, and other feedback and concerns.</p>
                  <div class="image-placeholder" style="background:#e0e0e0; color: #333; padding: 20px; text-align: center; border-radius: 8px; margin-top: 15px;">
                     <em>[Replace with your Slide 4 booth interaction photo here]</em><br/>
                     <code>&lt;img src="/assets/slide4_photo.jpg" alt="Intermediate Outcome" style="width:100%; border-radius:8px;"&gt;</code>
                  </div>
                `;
                this.uiView.showInfoCard(title, content);
            }
        } else if (npcId === 'hotspot_output') {
            this.uiView.hideChatContainer();
            if (!this.uiView.isInfoCardVisible()) {
                const title = "Output";
                const content = `
                  <p>Establishing the Digital Agri-Booth requires a strategic transition from static content to a <strong>dynamic ecosystem</strong>, beginning with creating an intuitive virtual booth environment that maps to a user-friendly digital journey.</p>
                  <p>To ensure true <strong>nationwide/ international reach</strong>, the modality must be optimized for low-bandwidth mobile access and include backend analytics to track user engagement, creating a scalable, biosecure, and data-driven e-extension tool that empowers farmers regardless of their physical location.</p>
                  <div class="image-placeholder" style="background:#e0e0e0; color: #333; padding: 20px; text-align: center; border-radius: 8px; margin-top: 15px;">
                     <em>[Replace with your Slide 5 people talking photo here]</em><br/>
                     <code>&lt;img src="/assets/slide5_photo.jpg" alt="Output" style="width:100%; border-radius:8px;"&gt;</code>
                  </div>
                `;
                this.uiView.showInfoCard(title, content);
            }
        } else if (npcId === 'hotspot_final') {
            this.uiView.hideChatContainer();
            if (!this.uiView.isInfoCardVisible()) {
                const title = "Final Outcome";
                const content = `
                  <ul class="styled-list">
                    <li>Zero Biosecurity Risk</li>
                    <li>24/7 Availability</li>
                    <li>Real Time Data Share</li>
                    <li>Low Logistics Cost</li>
                  </ul>
                  <h3 style="margin-top: 20px; color: #1e5c3e;">Some of the Interactive Hotspots that will be included:</h3>
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
                `;
                this.uiView.showInfoCard(title, content);
            }
        }
      }
    } else {
        // Did not click any NPC (clicked wall, floor, empty space)
        // Zoom back out to overview default camera
        this.sceneView.focusOnTarget(null);
        
        if (this.uiView.isChatContainerVisible()) this.uiView.hideChatContainer();
        if (this.uiView.isInfoCardVisible()) this.uiView.hideInfoCard();
        
        this.currentNPCId = null;
    }
  }

  async onUserSendMessage(text) {
    if (!this.currentNPCId) return;

    this.uiView.showLoadingState();
    
    // Simulate sending message to backend and getting a response
    const responseData = await this.model.sendMessage(this.currentNPCId, text);
    
    this.uiView.showNPCMessage(responseData);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.sceneView.render();
  }
}
