import { ThreeOverlayRenderer } from './ThreeOverlayRenderer';

/**
 * Global 3D overlay manager - ensures overlay only shows in appropriate scenes
 */
class ThreeOverlayManager {
    private static instance: ThreeOverlayManager;
    private overlay: ThreeOverlayRenderer | null = null;

    private constructor() { }

    static getInstance(): ThreeOverlayManager {
        if (!ThreeOverlayManager.instance) {
            ThreeOverlayManager.instance = new ThreeOverlayManager();
        }
        return ThreeOverlayManager.instance;
    }

    getOverlay(): ThreeOverlayRenderer | null {
        return this.overlay;
    }

    setOverlay(overlay: ThreeOverlayRenderer | null) {
        this.overlay = overlay;
    }

    hideAll() {
        if (this.overlay) {
            this.overlay.hide();
        }
    }
}

export const threeOverlayManager = ThreeOverlayManager.getInstance();
