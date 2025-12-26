export interface SafeInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type Listener = (inset: SafeInset) => void;

class SafeAreaManager {
  private el: HTMLDivElement | null = null;
  private inset: SafeInset = { top: 0, right: 0, bottom: 0, left: 0 };
  private listeners: Listener[] = [];
  public debug = (import.meta as any)?.env?.DEV ?? false;

  init() {
    if (this.el) return;
    const el = document.createElement('div');
    el.id = '__safe_area_probe';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '0';
    el.style.height = '0';
    el.style.paddingTop = 'env(safe-area-inset-top)';
    el.style.paddingRight = 'env(safe-area-inset-right)';
    el.style.paddingBottom = 'env(safe-area-inset-bottom)';
    el.style.paddingLeft = 'env(safe-area-inset-left)';
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    this.el = el;
    this.update();
    window.addEventListener('resize', this.updateBound);
    window.addEventListener('orientationchange', this.updateBound);
  }

  dispose() {
    if (this.el) {
      document.body.removeChild(this.el);
      this.el = null;
    }
    window.removeEventListener('resize', this.updateBound);
    window.removeEventListener('orientationchange', this.updateBound);
    this.listeners = [];
  }

  private updateBound = () => this.update();

  update() {
    if (!this.el) return;
    const cs = getComputedStyle(this.el);
    const top = parseFloat(cs.paddingTop) || 0;
    const right = parseFloat(cs.paddingRight) || 0;
    const bottom = parseFloat(cs.paddingBottom) || 0;
    const left = parseFloat(cs.paddingLeft) || 0;
    const newInset = { top, right, bottom, left };
    this.inset = newInset;
    if (this.debug) console.log('SafeArea updated', newInset);
    this.listeners.forEach(l => l(newInset));
  }

  getInset() {
    return this.inset;
  }

  onChange(fn: Listener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}

export const SafeArea = new SafeAreaManager();
