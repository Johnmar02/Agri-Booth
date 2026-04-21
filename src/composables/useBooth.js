import { useBoothStore } from '@/stores/booth';
import { useVisitorStore } from '@/stores/visitor';

/**
 * CONTROLLER: useBooth
 * Encapsulates the logic for interacting with the 3D Agri-Booth.
 * It manages camera targets, hotspot clicks, and bridges the View (ThreeCanvas) with the Model (Stores).
 */
export function useBooth() {
  const boothStore = useBoothStore();
  const visitorStore = useVisitorStore();

  // References to be set by the View
  let sceneView = null;

  const initController = (viewInstance) => {
    sceneView = viewInstance;
  };

  /**
   * Handles clicking on a 3D hotspot.
   * Logic: 
   * 1. Check if the hotspot exists.
   * 2. If it's the registration table, open the portal.
   * 3. If it requires registration and user isn't registered, force portal.
   * 4. Otherwise, zoom in and show content.
   */
  const handleHotspotClick = (hotspotId, hotspotObject) => {
    console.log(`CONTROLLER: Interacting with hotspot: ${hotspotId}`);
    
    if (hotspotId === 'dot_table') {
      boothStore.setActiveHotspot(hotspotId);
      sceneView.focusOnTarget(hotspotObject);
      return;
    }

    // Check if registration is required for this specific section
    const hotspotData = boothStore.hotspots[hotspotId];
    if (hotspotData?.requiresRegistration && !visitorStore.isRegistered) {
      console.log('CONTROLLER: Registration required for this module.');
      boothStore.setActiveHotspot('dot_table'); // Redirect to registration
      return;
    }

    boothStore.setActiveHotspot(hotspotId);
    sceneView.focusOnTarget(hotspotObject);
  };

  const closeOverlay = () => {
    boothStore.clearActiveHotspot();
    if (sceneView) sceneView.focusOnTarget(null);
  };

  return {
    initController,
    handleHotspotClick,
    closeOverlay
  };
}
