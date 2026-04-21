<script setup>
import { defineAsyncComponent } from "vue";

const BoothModelView = defineAsyncComponent(
  () => import("@/components/BoothModelView.vue"),
);

/**
 * VIEW: HotspotMapView
 * Renders the lightweight schematic booth map and its interactive hotspots.
 *
 * WHY THIS FILE EXISTS:
 * The Digital Agri-Booth needs a stable, low-bandwidth spatial representation that can
 * later be swapped for a richer 3D or 360 view. This component stays purely visual so it
 * can be redesigned without touching access logic or data rules.
 */
defineProps({
  hotspots: {
    type: Array,
    required: true,
  },
});

defineEmits(["hotspot-select"]);
</script>

<template>
  <section class="map-card" aria-labelledby="map-title">
    <div class="map-card__header">
      <div>
        <p class="map-card__eyebrow">Virtual mapping</p>
        <h2 id="map-title">Booth hotspot map</h2>
      </div>
      <p class="map-card__description">
        The schematic hotspot map stays lightweight, while the embedded booth
        preview restores the live 3D model for richer orientation.
      </p>
    </div>

    <div
      class="map-stage"
      role="img"
      aria-label="Interactive schematic map of the ITCPH Digital Agri-Booth"
    >
      <div class="map-stage__backdrop"></div>
      <div class="map-stage__roof"></div>
      <div class="map-stage__counter map-stage__counter--left"></div>
      <div class="map-stage__counter map-stage__counter--right"></div>
      <div class="map-stage__walkway"></div>
      <div class="map-stage__model-shell">
        <BoothModelView
          label="Live 3D preview of the ITCPH Digital Agri-Booth"
        />
        <div class="map-stage__model-note">
          <span class="map-stage__model-pill">Live GLB preview</span>
          <p>
            Orbit the local booth model while using the hotspot map for
            navigation.
          </p>
        </div>
      </div>

      <button
        v-for="hotspot in hotspots"
        :key="hotspot.id"
        class="hotspot"
        :class="{
          'hotspot--active': hotspot.isActive,
          'hotspot--locked': hotspot.isLocked,
        }"
        :style="{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }"
        type="button"
        :aria-pressed="hotspot.isActive ? 'true' : 'false'"
        :aria-label="`${hotspot.label} hotspot in ${hotspot.zone}`"
        @click="$emit('hotspot-select', hotspot.id)"
      >
        <span class="hotspot__pin">{{ hotspot.shortLabel }}</span>
        <span class="hotspot__label">{{ hotspot.label }}</span>
      </button>
    </div>

    <div class="map-card__legend">
      <span class="legend-chip">Public access</span>
      <span class="legend-chip legend-chip--locked">Requires logbook</span>
      <span class="legend-chip legend-chip--active">Current focus</span>
    </div>
  </section>
</template>

<style scoped>
.map-card {
  background: rgba(253, 252, 247, 0.88);
  border: 1px solid rgba(20, 55, 34, 0.1);
  border-radius: 28px;
  box-shadow: 0 22px 50px rgba(24, 55, 39, 0.1);
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
  height: 100%;
}

.map-card__header {
  display: grid;
  gap: 0.75rem;
}

.map-card__eyebrow {
  margin: 0 0 0.3rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-brand);
}

.map-card__header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2vw, 1.9rem);
  color: var(--color-ink);
}

.map-card__description {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.map-stage {
  position: relative;
  flex: 1;
  min-height: 28rem;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(238, 245, 236, 0.92) 100%
  );
  border: 1px solid rgba(20, 55, 34, 0.08);
  display: grid;
  place-items: center;
}

.map-stage__backdrop {
  position: absolute;
  inset: 8% 10% 34%;
  border-radius: 24px;
  background:
    linear-gradient(140deg, rgba(31, 107, 82, 0.92), rgba(19, 73, 57, 0.95)),
    linear-gradient(180deg, rgba(217, 152, 43, 0.16), transparent);
  box-shadow: inset 0 -22px 40px rgba(7, 24, 18, 0.18);
}

.map-stage__roof {
  position: absolute;
  inset: 5% 16% auto;
  height: 3rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(217, 152, 43, 0.8),
    rgba(255, 229, 176, 0.88)
  );
  filter: blur(0.3px);
}

.map-stage__counter {
  position: absolute;
  bottom: 20%;
  width: 28%;
  height: 18%;
  border-radius: 22px;
  background: linear-gradient(180deg, #f5efe1, #dfd2b5);
  border: 1px solid rgba(20, 55, 34, 0.08);
  box-shadow: 0 18px 36px rgba(25, 46, 34, 0.08);
}

.map-stage__counter--left {
  left: 12%;
}

.map-stage__counter--right {
  right: 12%;
}

.map-stage__walkway {
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 8%;
  height: 14%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(20, 55, 34, 0.06),
    rgba(217, 152, 43, 0.18),
    rgba(20, 55, 34, 0.06)
  );
}

.map-stage__model-shell {
  position: absolute;
  inset: 22% 22% 19%;
  z-index: 1;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(20, 55, 34, 0.1);
  box-shadow: 0 20px 40px rgba(11, 25, 18, 0.16);
}

.map-stage__model-note {
  position: absolute;
  left: 1rem;
  right: 1rem;
  top: 1rem;
  display: grid;
  gap: 0.45rem;
  pointer-events: none;
}

.map-stage__model-note p {
  margin: 0;
  max-width: 22rem;
  color: rgba(23, 50, 29, 0.86);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.45;
}

.map-stage__model-pill {
  width: fit-content;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(20, 55, 34, 0.08);
  color: var(--color-brand-strong);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hotspot {
  position: absolute;
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  transform: translate(-50%, -50%);
  border: 0;
  background: transparent;
  padding: 0;
  z-index: 2;
  cursor: pointer;
}

.hotspot__pin {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(
    180deg,
    var(--color-brand),
    var(--color-brand-strong)
  );
  border: 3px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 0 rgba(31, 107, 82, 0.28);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.hotspot__label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-ink);
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(20, 55, 34, 0.08);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  box-shadow: 0 10px 18px rgba(25, 46, 34, 0.08);
}

.hotspot:hover .hotspot__pin,
.hotspot:focus-visible .hotspot__pin {
  transform: scale(1.06);
  box-shadow: 0 0 0 12px rgba(31, 107, 82, 0.12);
}

.hotspot--locked .hotspot__pin {
  background: linear-gradient(180deg, #b4842d, #936819);
}

.hotspot--active .hotspot__pin {
  background: linear-gradient(180deg, #17694e, #104433);
  box-shadow: 0 0 0 12px rgba(31, 107, 82, 0.16);
}

.map-card__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.legend-chip {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(31, 107, 82, 0.1);
  color: var(--color-brand-strong);
  font-size: 0.78rem;
  font-weight: 700;
}

.legend-chip--locked {
  background: rgba(217, 152, 43, 0.14);
  color: #885f16;
}

.legend-chip--active {
  background: rgba(16, 68, 51, 0.12);
}

@media (max-width: 720px) {
  .map-card {
    padding: 1rem;
  }

  .map-stage {
    min-height: 24rem;
  }

  .map-stage__model-shell {
    inset: 24% 16% 19%;
  }

  .map-stage__model-note p {
    display: none;
  }

  .hotspot__label {
    display: none;
  }
}

@media (max-width: 560px) {
  .map-card {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .map-card__header {
    gap: 0.5rem;
  }

  .map-card__eyebrow {
    font-size: 0.65rem;
  }

  .map-card__header h2 {
    font-size: 1.2rem;
  }

  .map-card__description {
    font-size: 0.8rem;
  }

  .map-stage {
    min-height: 20rem;
  }

  .map-stage__model-shell {
    inset: 20% 10% 15%;
  }

  .hotspot__pin {
    width: 2.2rem;
    height: 2.2rem;
    font-size: 0.6rem;
  }

  .map-card__legend {
    gap: 0.4rem;
  }

  .legend-chip {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
