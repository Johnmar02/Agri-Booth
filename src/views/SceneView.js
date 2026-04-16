import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class SceneView {
  constructor(canvasContainer) {
    this.container = canvasContainer;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd0d0d6);
    this.scene.fog = new THREE.FogExp2(0xd0d0d6, 0.015);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.defaultCameraPos = new THREE.Vector3(0, 5, 12);
    this.defaultLookAt = new THREE.Vector3(0, 3, -2); // Target placed deeper inside the booth
    this.targetCameraPos = this.defaultCameraPos.clone();
    this.targetLookAt = this.defaultLookAt.clone();
    this.camera.position.copy(this.defaultCameraPos);
    this.camera.lookAt(this.defaultLookAt);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // VERY IMPORTANT FOR GLTF / Physical lighting
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below the floor
    this.controls.target.copy(this.defaultLookAt);

    // Let the user manually scroll to zoom, and left-drag to rotate
    this.controls.autoRotate = false;
    this.controls.minDistance = 0.5; // Allow zooming very very close/inside 
    this.controls.maxDistance = 30;

    this.isLerpingToTarget = false;

    // Stop lerping if the user manually grabs the camera
    this.controls.addEventListener('start', () => {
      this.isLerpingToTarget = false;
    });

    this.interactableObjects = [];
    this.hotspots = [];

    this.gltfLoader = new GLTFLoader();

    this.setupLighting();
    this.setupEnvironment();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
    mainLight.position.set(5, 25, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    mainLight.shadow.bias = -0.0005;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
    fillLight.position.set(-15, 10, -15);
    this.scene.add(fillLight);

    // Extra front light to eliminate dark faces
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
    frontLight.position.set(0, 5, 20);
    this.scene.add(frontLight);
  }

  createSignageTexture(width, height, designCallback) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    designCallback(ctx, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  createHotspotTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw glowing white circle
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    // Solid core
    ctx.beginPath();
    ctx.arc(64, 64, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  drawAgrisensoLogo(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Simple mock logo
    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "#1e5c3e"; // Green
    ctx.fillText("AGRi", -80, 0);
    ctx.fillStyle = "#d18b32"; // Orange/Yellow
    ctx.fillText("Sens", 60, 0);

    // Draw leaf shape
    ctx.beginPath();
    ctx.arc(-80, -30, 20, 0, Math.PI);
    ctx.fillStyle = "#1e5c3e";
    ctx.fill();

    ctx.restore();
  }

  /**
   * buildHotspots(modelCenter)
   * ─────────────────────────────────────────────────────────────────
   * Creates 7 interactive white glowing dots placed on key booth items.
   * Each dot is a THREE.Sprite that pulses and can be clicked by the user.
   *
   * HOW TO MODIFY POSITIONS:
   *   - cx = left/right   → increase to move RIGHT, decrease to move LEFT
   *   - cy = up/down      → increase to move UP, decrease to move DOWN
   *   - cz = front/back   → increase to move TOWARD the camera, decrease to move AWAY
   *
   * @param {THREE.Vector3} modelCenter - The calculated center of the loaded GLB model.
   */
  buildHotspots(modelCenter) {
    const group = new THREE.Group();
    const texture = this.createHotspotTexture();
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending });

    // modelCenter coordinates — all hotspot positions are RELATIVE to these
    const cx = modelCenter.x;  // center X of the 3D model (left/right)
    const cy = modelCenter.y;  // center Y of the 3D model (up/down)
    const cz = modelCenter.z;  // center Z of the 3D model (front/back)

    /**
     * addHotspot(id, x, y, z)
     * Helper function that creates one white glowing dot.
     *   - id: unique string name used to identify which dot was clicked
     *   - x, y, z: world position coordinates for the dot
     */
    const addHotspot = (id, x, y, z) => {
      const sprite = new THREE.Sprite(material.clone());
      sprite.position.set(x, y, z);
      sprite.scale.set(0.5, 0.5, 1);  // Size of the dot (increase for bigger dots)
      sprite.userData = { id: id };
      group.add(sprite);
      this.interactableObjects.push(sprite);
      this.hotspots.push({ mesh: sprite, baseScale: 0.5 });
    };

    // ── DOT 1: BROCHURE RACK ──────────────────────────────────────
    // The zig-zag pamphlet/brochure stand on the FAR LEFT of the booth.
    // Modify: move left (decrease cx offset) or right (increase cx offset)
    addHotspot('dot_brochure_rack', cx - 0.4, cy - 0.3, cz + 1.0);

    // ── DOT 2: LEFT DISPLAY SHELF ─────────────────────────────────
    // The black metal shelf unit (center-left) holding pig toys, pamphlets, trays.
    addHotspot('dot_left_shelf', cx - 1.2, cy - 0.4, cz + 1.0);

    // ── DOT 3: ORANGE BACK BANNER ─────────────────────────────────
    // The large orange ITCPH banner on the back wall center of the booth.
    addHotspot('dot_banner', cx + 0.3, cy - 0.3, cz - 1.2);

    // ── DOT 4: RECEPTION TABLE ────────────────────────────────────
    // The front-right table covered with orange cloth and the Agrisenso sign panel.
    addHotspot('dot_table', cx + 0.95, cy - 0.4, cz + 0.9);

    // ── DOT 5: RIGHT WALL SHELVES ─────────────────────────────────
    // The white shelves mounted on the right wall, holding books and materials.
    addHotspot('dot_right_shelf', cx + 1.4, cy - 0.2, cz + 0.9);

    // ── DOT 6: TOP SIGNAGE / HEADER ───────────────────────────────
    // The large "ATI INTERNATIONAL TRAINING CENTER ON PIG HUSBANDRY" header sign
    // mounted above the entire booth.
    addHotspot('dot_top_sign', cx + 1.0, cy + 0.8, cz + 1.8);

    // ── DOT 7: CHAIRS / SEATING AREA ──────────────────────────────
    // The white folding chairs placed in front of the reception table
    // where visitors sit during consultations.
    addHotspot('dot_chairs', cx - 1.2, cy + 0.1, cz + 1.0);

    return group;
  }

  // --- DELETED PROGRAMMATIC FUNCTIONS ---

  buildExhibitionRoom() {
    // The background is now handled brilliantly by the thick Fog tracking the deep 0x0f172a color.
    // We don't need a massive cylinder wrapper anymore!
    return new THREE.Group();
  }

  setupEnvironment() {
    const hallFloorGeo = new THREE.PlaneGeometry(500, 500);
    const hallFloorMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0c8,
      roughness: 0.25,
      metalness: 0.15
    });
    const hallFloor = new THREE.Mesh(hallFloorGeo, hallFloorMat);
    hallFloor.rotation.x = -Math.PI / 2;
    hallFloor.receiveShadow = true;
    this.scene.add(hallFloor);


    // Build the panoramic 360 wrapper
    this.scene.add(this.buildExhibitionRoom());

    // Load the massive custom GLB
    this.gltfLoader.load(
      '/models/custom_booth/3dbooth.glb',
      (gltf) => {
        const object = gltf.scene;
        // Dynamically scale the huge model down to our camera viewport size
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());

        if (size.x > 0) {
          const scale = 8 / size.x;
          object.scale.set(scale, scale, scale);
        }

        // Drop it to the floor level securely, and lift it noticeably higher as requested
        const boxScaled = new THREE.Box3().setFromObject(object);
        object.position.y = -boxScaled.min.y + 2.5;

        // Automatically calculate the new physical dead-center of the entire 3D model
        const finalBox = new THREE.Box3().setFromObject(object);
        const modelCenter = finalBox.getCenter(new THREE.Vector3());

        // Re-target the camera's invisible pivot point directly to its volumetric core
        this.defaultLookAt.copy(modelCenter);
        this.targetLookAt.copy(modelCenter);
        this.controls.target.copy(modelCenter);
        this.controls.update();

        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(object);

        // Place interactive hotspots relative to the model center
        this.scene.add(this.buildHotspots(modelCenter));
      },
      undefined,
      (error) => {
        console.error('Failed to load GLB booth:', error);
      }
    );

    // Old floating hotspots temporarily disabled per user request
    // this.scene.add(this.buildHotspots());
  }

  getInteractableObjects() {
    return this.interactableObjects;
  }

  focusOnTarget(object) {
    this.isLerpingToTarget = true;
    if (object) {
      const offset = new THREE.Vector3(0, 0.5, 3.5);
      this.targetLookAt.copy(object.position);
      this.targetCameraPos.copy(object.position).add(offset);
    } else {
      this.targetCameraPos.copy(this.defaultCameraPos);
      this.targetLookAt.copy(this.defaultLookAt);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    if (this.isLerpingToTarget) {
      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetLookAt, 0.05);

      // Stop lerping when close enough
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.1) {
        this.isLerpingToTarget = false;
      }
    }

    this.controls.update();

    // Animate Hotspots
    const time = Date.now() * 0.003;
    this.hotspots.forEach(hotspot => {
      const scale = hotspot.baseScale + Math.sin(time) * 0.1;
      hotspot.mesh.scale.set(scale, scale, 1);
    });

    this.renderer.render(this.scene, this.camera);
  }

  getRendererDomElement() {
    return this.renderer.domElement;
  }

  getCamera() {
    return this.camera;
  }
}
