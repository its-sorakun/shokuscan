/**
 * Creates a debounced version of a callback function.
 *
 * After the first invocation, subsequent calls within `delayMs` are silently
 * dropped. This prevents the barcode scanner's 30-60 fps frame callbacks
 * from firing dozens of duplicate API requests for the same barcode.
 *
 * Unlike a traditional trailing-edge debounce (which delays execution),
 * this is a leading-edge throttle: the FIRST call executes immediately,
 * and all subsequent calls within the cooldown window are ignored.
 */
export function createBarcodeDebouncer(
  delayMs: number = 3000,
): {
  shouldProcess: (barcode: string) => boolean;
  reset: () => void;
} {
  let lastBarcode: string | null = null;
  let lastTimestamp: number = 0;

  return {
    /**
     * Returns true if this barcode should be processed (i.e., it's either
     * a new barcode or enough time has passed since the last detection).
     */
    shouldProcess(barcode: string): boolean {
      const now = Date.now();

      if (barcode === lastBarcode && now - lastTimestamp < delayMs) {
        // Same barcode detected within the cooldown window — skip
        return false;
      }

      // New barcode or cooldown expired — allow processing
      lastBarcode = barcode;
      lastTimestamp = now;
      return true;
    },

    /**
     * Reset the debouncer state. Call this when navigating back
     * to the scanner screen so the user can re-scan the same barcode.
     */
    reset(): void {
      lastBarcode = null;
      lastTimestamp = 0;
    },
  };
}
