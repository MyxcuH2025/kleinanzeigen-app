/**
 * Haptic Feedback Service für Mobile Touch-Interaktionen
 * Bietet Vibration-Feedback für bessere Mobile UX
 */

export class HapticService {
  private static instance: HapticService;
  private isSupported: boolean = false;

  private constructor() {
    this.isSupported = this.checkHapticSupport();
  }

  public static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  private checkHapticSupport(): boolean {
    return 'vibrate' in navigator;
  }

  /**
   * Leichtes Vibration-Feedback für Taps
   */
  public light(): void {
    if (this.isSupported) {
      navigator.vibrate(10);
    }
  }

  /**
   * Mittleres Vibration-Feedback für wichtige Aktionen
   */
  public medium(): void {
    if (this.isSupported) {
      navigator.vibrate(20);
    }
  }

  /**
   * Starkes Vibration-Feedback für kritische Aktionen
   */
  public heavy(): void {
    if (this.isSupported) {
      navigator.vibrate(30);
    }
  }

  /**
   * Erfolgs-Feedback (doppeltes kurzes Vibrieren)
   */
  public success(): void {
    if (this.isSupported) {
      navigator.vibrate([10, 50, 10]);
    }
  }

  /**
   * Fehler-Feedback (langes Vibrieren)
   */
  public error(): void {
    if (this.isSupported) {
      navigator.vibrate([50, 50, 50]);
    }
  }

  /**
   * Warnung-Feedback (mittleres Vibrieren)
   */
  public warning(): void {
    if (this.isSupported) {
      navigator.vibrate([30, 100, 30]);
    }
  }

  /**
   * Swipe-Feedback (kurzes Vibrieren)
   */
  public swipe(): void {
    if (this.isSupported) {
      navigator.vibrate(15);
    }
  }

  /**
   * Long Press Feedback (langes Vibrieren)
   */
  public longPress(): void {
    if (this.isSupported) {
      navigator.vibrate(100);
    }
  }

  /**
   * Prüft ob Haptic Feedback unterstützt wird
   */
  public isHapticSupported(): boolean {
    return this.isSupported;
  }
}

// Singleton-Instanz exportieren
export const hapticService = HapticService.getInstance();
