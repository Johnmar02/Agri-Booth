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
    this.defaultLookAt = new THREE.Vector3(0, 3, -2);
    this.targetCameraPos = this.defaultCameraPos.clone();
    this.targetLookAt = this.defaultLookAt.clone();
    this.camera.position.copy(this.defaultCameraPos);
    this.camera.lookAt(this.defaultLookAt);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.target.copy(this.defaultLookAt);
    this.controls.autoRotate = false;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 30;

    this.isLerpingToTarget = false;

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

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
    frontLight.position.set(0, 5, 20);
    this.scene.add(frontLight);
  }

  createHotspotTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    ctx.beginPath();
    ctx.arc(64, 64, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * buildHotspots(modelCenter)
   * Creates interactive white glowing dots placed on key booth items.
   *
   * HOW TO ADJUST POSITIONS:
   *   x (cx offset) → + moves RIGHT,   − moves LEFT
   *   y (cy offset) → + moves UP,      − moves DOWN
   *   z (cz offset) → + moves FORWARD, − moves BACK
   */
  buildHotspots(modelCenter) {
    const group = new THREE.Group();
    const texture = this.createHotspotTexture();
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending });

    const cx = modelCenter.x;
    const cy = modelCenter.y;
    const cz = modelCenter.z;

    const addHotspot = (id, x, y, z) => {
      const sprite = new THREE.Sprite(material.clone());
      sprite.position.set(x, y, z);
      sprite.scale.set(0.5, 0.5, 1);
      sprite.userData = { id };
      group.add(sprite);
      this.interactableObjects.push(sprite);
      this.hotspots.push({ mesh: sprite, baseScale: 0.5 });
    };

    // Brochure/pamphlet rack — far left
    addHotspot('dot_brochure_rack', cx - 0.4, cy - 0.3, cz + 1.0);

    // Left display shelf (pig toys, trays, pamphlets)
    addHotspot('dot_left_shelf', cx - 1.2, cy - 0.4, cz + 1.0);

    // Orange back banner — ITCPH center wall
    addHotspot('dot_banner', cx + 0.3, cy - 0.3, cz - 1.2);

    // Reception/registration table — front right (click opens form)
    addHotspot('dot_table', cx + 0.95, cy - 0.4, cz + 0.9);

    // Right wall shelves — books & materials
    addHotspot('dot_right_shelf', cx + 1.4, cy - 0.2, cz + 0.9);

    // Top header signage
    addHotspot('dot_top_sign', cx + 1.0, cy + 0.8, cz + 1.8);

    // Chairs / seating area
    addHotspot('dot_chairs', cx - 1.2, cy + 0.1, cz + 1.0);

    return group;
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

    this.gltfLoader.load(
      '/models/custom_booth/3DAgri-booth.glb',
      (gltf) => {
        const object = gltf.scene;

        // Auto-scale to fit the camera viewport
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        if (size.x > 0) {
          const scale = 8 / size.x;
          object.scale.set(scale, scale, scale);
        }

        // Drop to floor
        const boxScaled = new THREE.Box3().setFromObject(object);
        object.position.y = -boxScaled.min.y + 2.5;

        // Recalculate center after positioning
        const finalBox = new THREE.Box3().setFromObject(object);
        const modelCenter = finalBox.getCenter(new THREE.Vector3());

        // Aim camera at model center
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

        // Spawn hotspots relative to model center
        this.scene.add(this.buildHotspots(modelCenter));
      },
      undefined,
      (error) => {
        console.error('Failed to load GLB booth:', error);
      }
    );
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

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.1) {
        this.isLerpingToTarget = false;
      }
    }

    this.controls.update();

    // Pulse hotspot animation
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
