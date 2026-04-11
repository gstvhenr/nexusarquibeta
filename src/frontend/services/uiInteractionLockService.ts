type InteractionLockListener = (isLocked: boolean) => void;

class UiInteractionLockService {
  private activeLocks = 0;
  private listeners = new Set<InteractionLockListener>();

  private notify(): void {
    const locked = this.activeLocks > 0;
    for (const listener of this.listeners) {
      listener(locked);
    }
  }

  acquire(): () => void {
    this.activeLocks += 1;

    if (this.activeLocks === 1) {
      this.notify();
    }

    let released = false;
    return () => {
      if (released) {
        return;
      }

      released = true;
      this.activeLocks = Math.max(0, this.activeLocks - 1);

      if (this.activeLocks === 0) {
        this.notify();
      }
    };
  }

  isLocked(): boolean {
    return this.activeLocks > 0;
  }

  subscribe(listener: InteractionLockListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  resetForTest(): void {
    this.activeLocks = 0;
    this.listeners.clear();
  }
}

export const uiInteractionLockService = new UiInteractionLockService();
