<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * COMPONENT: BoothModelView
 * Renders the local GLB booth preview inside the current MVC-based dashboard.
 */
const props = defineProps({
  modelUrl: {
    type: String,
    default: '/models/custom_booth/3DAgri-booth.glb',
  },
  label: {
    type: String,
    default: 'Interactive 3D preview of the ITCPH Digital Agri-Booth',
  },
});

const canvasHost = ref(null);
const isLoading = ref(true);
const loadError = ref('');

let scene;
let camera;
let renderer;
let controls;
let previewGroup;
let animationFrameId = 0;
let resizeObserver;

function updateRendererSize() {
  if (!canvasHost.value || !camera || !renderer) {
    return;
  }

  const width = canvasHost.value.clientWidth;
  const height = canvasHost.value.clientHeight;

  if (!width || !height) {
    return;
  }

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function fitModelToView(model) {
  const originalBounds = new THREE.Box3().setFromObject(model);
  const originalSize = originalBounds.getSize(new THREE.Vector3());
  const originalMaxDimension = Math.max(originalSize.x, originalSize.y, originalSize.z);

  if (originalMaxDimension > 0) {
    const scale = 3.2 / originalMaxDimension;
    model.scale.setScalar(scale);
  }

  const centeredBounds = new THREE.Box3().setFromObject(model);
  const centeredPoint = centeredBounds.getCenter(new THREE.Vector3());
  model.position.sub(centeredPoint);

  const groundedBounds = new THREE.Box3().setFromObject(model);
  model.position.y -= groundedBounds.min.y;

  const finalBounds = new THREE.Box3().setFromObject(model);
  const finalSize = finalBounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(finalSize.x, finalSize.y, finalSize.z);
  const cameraDistance = Math.max(4.6, maxDimension * 1.55);

  camera.near = 0.1;
  camera.far = cameraDistance * 12;
  camera.position.set(cameraDistance * 0.85, cameraDistance * 0.55, cameraDistance);

  controls.target.set(0, finalSize.y * 0.32, 0);
  controls.minDistance = Math.max(2.4, maxDimension * 0.8);
  controls.maxDistance = cameraDistance * 2.35;
  controls.update();
}

function disposeMaterial(material) {
  if (!material) {
    return;
  }

  const materials = Array.isArray(material) ? material : [material];

  materials.forEach((entry) => {
    Object.values(entry).forEach((value) => {
      if (value?.isTexture) {
        value.dispose();
      }
    });
    entry.dispose?.();
  });
}

function disposePreviewAssets() {
  if (!previewGroup) {
    return;
  }

  previewGroup.traverse((child) => {
    child.geometry?.dispose?.();
    disposeMaterial(child.material);
  });
}

function animate() {
  animationFrameId = window.requestAnimationFrame(animate);
  controls?.update();
  renderer?.render(scene, camera);
}

function mountScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 0);

  canvasHost.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.minPolarAngle = Math.PI / 5.2;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.7;

  previewGroup = new THREE.Group();
  scene.add(previewGroup);

  previewGroup.add(new THREE.HemisphereLight(0xffffff, 0xd6d0c2, 2.2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(4.5, 7, 6);
  previewGroup.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf8f2e7, 1.8);
  fillLight.position.set(-6, 4, -3);
  previewGroup.add(fillLight);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 3.15, 0.18, 48),
    new THREE.MeshStandardMaterial({
      color: 0xf5efe3,
      roughness: 0.94,
      metalness: 0.04,
    }),
  );
  platform.position.y = -0.09;
  previewGroup.add(platform);

  const loader = new GLTFLoader();
  loader.load(
    props.modelUrl,
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = true;
        }
      });

      previewGroup.add(model);
      fitModelToView(model);
      updateRendererSize();
      isLoading.value = false;
    },
    undefined,
    () => {
      loadError.value = 'The 3D booth model could not be loaded from the local asset path.';
      isLoading.value = false;
    },
  );

  resizeObserver = new ResizeObserver(() => {
    updateRendererSize();
  });
  resizeObserver.observe(canvasHost.value);

  updateRendererSize();
  animate();
}

onMounted(() => {
  mountScene();
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrameId);
  resizeObserver?.disconnect();
  controls?.dispose();
  disposePreviewAssets();
  renderer?.dispose();

  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
});
</script>

<template>
  <section class="booth-model">
    <div ref="canvasHost" class="booth-model__canvas" :aria-label="label"></div>

    <div v-if="isLoading" class="booth-model__overlay">
      Loading 3D booth preview...
    </div>

    <div v-else-if="loadError" class="booth-model__overlay booth-model__overlay--error">
      {{ loadError }}
    </div>

    <p class="booth-model__hint">Drag to orbit. Scroll to zoom.</p>
  </section>
</template>

<style scoped>
.booth-model {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  border-radius: inherit;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.94), rgba(244, 238, 226, 0.84) 42%, rgba(225, 233, 221, 0.76) 100%);
}

.booth-model__canvas {
  width: 100%;
  height: 100%;
}

.booth-model__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  text-align: center;
  font-weight: 700;
  color: var(--color-ink-soft);
  background: rgba(253, 252, 247, 0.74);
  backdrop-filter: blur(4px);
}

.booth-model__overlay--error {
  color: var(--color-danger);
}

.booth-model__hint {
  position: absolute;
  left: 0.85rem;
  right: 0.85rem;
  bottom: 0.65rem;
  margin: 0;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(20, 55, 34, 0.08);
  color: var(--color-ink-soft);
  font-size: 0.74rem;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
}
</style>
