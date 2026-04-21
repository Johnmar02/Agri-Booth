<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * VIEW: ThreeCanvas
 * Renders the 3D environment of the ITCPH Digital Agri-Booth.
 * Primarily handles GLB loading, lighting, and frame-by-frame rendering.
 * Communicates with the Booth Controller for interaction logic.
 */

const emit = defineEmits(["hotspot-click", "background-click"]);

const canvasContainer = ref(null);

let scene, camera, renderer, controls, gltfLoader;
let interactableObjects = [];
let hotspots = [];
let isLerpingToTarget = false;
let targetCameraPos = new THREE.Vector3();
let targetLookAt = new THREE.Vector3();
let defaultCameraPos = new THREE.Vector3(0, 5, 12);
let defaultLookAt = new THREE.Vector3(0, 3, -2);
let hoveredHotspot = null;
const hoveredLabel = ref("");
const tooltipPos = ref({ x: 0, y: 0 });
const hotspotLabels = {
  "hotspot-virtual-tour": "360 Virtual Tour",
  "hotspot-iec": "IEC Training Materials",
  "hotspot-newsletters": "Farm Newsletters",
  "hotspot-corporate": "Success Stories",
  "hotspot-chat": "Technical Advisory Chat",
  "hotspot-calculators": "Digital ROI Calculators",
  "hotspot-elearning": "E-Learning Portal",
  "hotspot-bebu": "Bebu Game & Trivia",
};

const initThree = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd0d0d6);
  scene.fog = new THREE.FogExp2(0xd0d0d6, 0.015);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.copy(defaultCameraPos);
  camera.lookAt(defaultLookAt);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  canvasContainer.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.target.copy(defaultLookAt);

  setupLighting();
  loadBooth();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerdown", onPointerDown);
};

const setupLighting = () => {
  const ambient = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(ambient);

  const main = new THREE.DirectionalLight(0xffffff, 3.0);
  main.position.set(5, 25, 10);
  main.castShadow = true;
  scene.add(main);

  const fill = new THREE.DirectionalLight(0xffffff, 2.0);
  fill.position.set(-15, 10, -15);
  scene.add(fill);
};

const loadBooth = () => {
  gltfLoader = new GLTFLoader();
  gltfLoader.load("/models/custom_booth/3DAgri-booth.glb", (gltf) => {
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

    defaultLookAt.copy(modelCenter);
    controls.target.copy(modelCenter);

    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(object);
    buildHotspots(modelCenter);
  });
};

const buildHotspots = (modelCenter) => {
  const cx = modelCenter.x;
  const cy = modelCenter.y;
  const cz = modelCenter.z;

  const texture = createHotspotTexture();
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const addHotspot = (id, x, y, z) => {
    const sprite = new THREE.Sprite(material.clone());
    sprite.position.set(x, y, z);
    sprite.scale.set(0.5, 0.5, 1);
    sprite.userData = { id };
    scene.add(sprite);
    interactableObjects.push(sprite);
    hotspots.push({ mesh: sprite, baseScale: 0.5 });
  };

  // The 3D model hotspots mapped to the centralized boothModel 'hotspot-' IDs
  addHotspot("hotspot-virtual-tour", cx + 0.3, cy - 0.3, cz - 1.2);
  addHotspot("hotspot-iec", cx - 0.4, cy - 0.3, cz + 1.0); // was dot_brochure_rack
  addHotspot("hotspot-newsletters", cx - 1.2, cy - 0.4, cz + 1.0); // was dot_left_shelf
  addHotspot("hotspot-corporate", cx - 0.5, cy + 0.1, cz + .9); // was dot_banner
  addHotspot("hotspot-chat", cx + 0.95, cy - 0.4, cz + 0.9); // was dot_table
  addHotspot("hotspot-calculators", cx + 1.4, cy - 0.2, cz + 0.9); // was dot_right_shelf
  addHotspot("hotspot-elearning", cx + 1.0, cy + 0.8, cz + 1.8); // was dot_top_sign
  addHotspot("hotspot-bebu", cx - 1.2, cy + 0.1, cz + 1.0); // was dot_chairs
};

const createHotspotTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
};

const focusOnTarget = (object) => {
  isLerpingToTarget = true;
  if (object) {
    targetLookAt.copy(object.position);
    targetCameraPos.copy(object.position).add(new THREE.Vector3(0, 0.5, 3.5));
  } else {
    targetCameraPos.copy(defaultCameraPos);
    targetLookAt.copy(defaultLookAt);
  }
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const onPointerMove = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(interactableObjects);

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
    hoveredHotspot = intersects[0].object;
    hoveredLabel.value = hotspotLabels[hoveredHotspot.userData.id] || "";
    tooltipPos.value = { x: event.clientX + 20, y: event.clientY + 20 };
  } else {
    document.body.style.cursor = "default";
    hoveredHotspot = null;
    hoveredLabel.value = "";
  }
};

const onPointerDown = (event) => {
  // Ignore clicks on UI
  if (event.target.closest("#overlay-ui")) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(interactableObjects);

  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    // Brief "click" visual feedback
    clicked.scale.set(0.7, 0.7, 1);

    emit("hotspot-click", { id: clicked.userData.id, object: clicked });
  } else {
    emit("background-click");
  }
};

defineExpose({
  focusOnTarget,
});

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const animate = () => {
  requestAnimationFrame(animate);

  if (isLerpingToTarget) {
    camera.position.lerp(targetCameraPos, 0.05);
    controls.target.lerp(targetLookAt, 0.05);
    if (camera.position.distanceTo(targetCameraPos) < 0.1)
      isLerpingToTarget = false;
  }

  controls.update();

  const time = Date.now() * 0.003;
  hotspots.forEach((h) => {
    // If hovered, grow significantly. Otherwise, subtle pulse.
    const isHovered = hoveredHotspot === h.mesh;
    const hoverScale = isHovered ? 0.25 : 0;
    const pulse = Math.sin(time) * 0.08;

    const s = h.baseScale + pulse + hoverScale;
    h.mesh.scale.set(s, s, 1);
  });

  renderer.render(scene, camera);
};

onMounted(() => {
  initThree();
  animate();
});

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerdown", onPointerDown);
  document.body.style.cursor = "default";
});
</script>

<template>
  <div ref="canvasContainer" class="canvas-container">
    <Transition name="tooltip-fade">
      <div 
        v-if="hoveredLabel" 
        class="hotspot-tooltip" 
        :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
      >
        <div class="tooltip-icon">✦</div>
        <span>{{ hoveredLabel }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.hotspot-tooltip {
  position: fixed;
  pointer-events: none;
  z-index: 200;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(26, 106, 180, 0.2);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translate(-5%, -5%);
}

.tooltip-icon {
  width: 20px;
  height: 20px;
  background: #1a6ab4;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.hotspot-tooltip span {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a6ab4;
  white-space: nowrap;
}

.tooltip-fade-enter-active, .tooltip-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.tooltip-fade-enter-from, .tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translate(-5%, -5%);
}
</style>
