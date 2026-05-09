import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getHotspotLayout, GLB_MODEL_PATH } from '@/models/boothModel';

export class SceneView {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.onHotspotClick = options.onHotspotClick || (() => {});
    this.onBackgroundClick = options.onBackgroundClick || (() => {});
    this.onHoverChange = options.onHoverChange || (() => {});
    this.onProgress = options.onProgress || (() => {});

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
    this.controls.dampingFactor = 0.08; // Slightly faster damping
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.target.copy(this.defaultLookAt);
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 30;

    this.isLerpingToTarget = false;
    this.animationId = null;
    this.activeFocusId = null; // Track current focus

    this.controls.addEventListener('start', () => {
      this.isLerpingToTarget = false;
      this.activeFocusId = null;
    });

    this.interactableObjects = [];
    this.hotspots = [];
    this.hoveredHotspot = null;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.loadingManager = new THREE.LoadingManager(
      () => this.onProgress(100),
      (url, itemsLoaded, itemsTotal) => {
        this.onProgress(Math.round((itemsLoaded / itemsTotal) * 100));
      }
    );

    this.gltfLoader = new GLTFLoader(this.loadingManager);

    this.setupLighting();
    this.setupEnvironment();

    this.onWindowResizeBound = this.onWindowResize.bind(this);
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerDownBound = this.onPointerDown.bind(this);

    window.addEventListener('resize', this.onWindowResizeBound);
    window.addEventListener('pointermove', this.onPointerMoveBound);
    window.addEventListener('pointerdown', this.onPointerDownBound);

    this.animate();
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
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  buildHotspots(modelCenter) {
    const texture = this.createHotspotTexture();
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending });

    const cx = modelCenter.x;
    const cy = modelCenter.y;
    const cz = modelCenter.z;

    const hotspotLayout = getHotspotLayout();

    hotspotLayout.forEach((hotspot) => {
      if (hotspot.coords3D) {
        const sprite = new THREE.Sprite(material.clone());
        sprite.position.set(
          cx + hotspot.coords3D.x,
          cy + hotspot.coords3D.y,
          cz + hotspot.coords3D.z
        );
        sprite.scale.set(0.5, 0.5, 1);
        sprite.userData = { id: hotspot.id };
        this.scene.add(sprite);
        this.interactableObjects.push(sprite);
        this.hotspots.push({ mesh: sprite, baseScale: 0.5 });
      }
    });
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
      GLB_MODEL_PATH,
      (gltf) => {
        const object = gltf.scene;

        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        if (size.x > 0) {
          const scale = 8 / size.x;
          object.scale.set(scale, scale, scale);
        }

        const boxScaled = new THREE.Box3().setFromObject(object);
        object.position.y = -boxScaled.min.y + 2.5;

        const finalBox = new THREE.Box3().setFromObject(object);
        const modelCenter = finalBox.getCenter(new THREE.Vector3());

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
        this.buildHotspots(modelCenter);
      },
      undefined,
      (error) => {
        console.error('Failed to load GLB booth:', error);
      }
    );
  }

  onPointerMove(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects);

    if (intersects.length > 0) {
      document.body.style.cursor = "pointer";
      this.hoveredHotspot = intersects[0].object;
      this.onHoverChange({
        id: this.hoveredHotspot.userData.id,
        clientX: event.clientX,
        clientY: event.clientY
      });
    } else {
      document.body.style.cursor = "default";
      this.hoveredHotspot = null;
      this.onHoverChange(null);
    }
  }

  onPointerDown(event) {
    if (event.target.closest("#overlay-ui")) return;

    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects);

    if (intersects.length > 0) {
      const clicked = intersects[0].object;
      clicked.scale.set(0.7, 0.7, 1);
      this.onHotspotClick({ id: clicked.userData.id, object: clicked });
    } else {
      this.onBackgroundClick();
    }
  }

  focusOnTarget(object) {
    const targetId = object?.userData?.id || null;
    
    // If clicking the already focused hotspot, don't re-calculate to avoid jitter
    if (targetId && targetId === this.activeFocusId) {
      this.isLerpingToTarget = true; 
      return;
    }

    this.isLerpingToTarget = true;
    this.activeFocusId = targetId;

    if (object) {
      // Use defaultCameraPos as reference for consistent zoom direction
      const direction = new THREE.Vector3()
        .subVectors(this.defaultCameraPos, object.position)
        .normalize();
      
      this.targetLookAt.copy(object.position);
      this.targetCameraPos.copy(object.position).add(direction.multiplyScalar(2));
      
      if (this.targetCameraPos.y < 1.0) this.targetCameraPos.y = 1.0;
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

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));

    if (this.isLerpingToTarget) {
      // Faster lerp (0.07) for a snappier feel
      this.camera.position.lerp(this.targetCameraPos, 0.07);
      this.controls.target.lerp(this.targetLookAt, 0.07);
      
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.isLerpingToTarget = false;
      }
    }

    this.controls.update();

    const time = Date.now() * 0.003;
    this.hotspots.forEach((h) => {
      const isHovered = this.hoveredHotspot === h.mesh;
      const hoverScale = isHovered ? 0.25 : 0;
      const pulse = Math.sin(time) * 0.08;
      const s = h.baseScale + pulse + hoverScale;
      h.mesh.scale.set(s, s, 1);
    });

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResizeBound);
    window.removeEventListener('pointermove', this.onPointerMoveBound);
    window.removeEventListener('pointerdown', this.onPointerDownBound);

    this.controls?.dispose();
    
    if (this.scene) {
      this.scene.traverse((child) => {
        if (child.isMesh || child.isSprite) {
          child.geometry?.dispose();
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((m) => {
              Object.values(m).forEach((v) => {
                if (v?.isTexture) v.dispose();
              });
              m.dispose?.();
            });
          }
        }
      });
    }

    this.renderer?.dispose();
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    document.body.style.cursor = "default";
  }
}

