export class SpeechGuidanceService {
  private static instance: SpeechGuidanceService;
  private synthesis: SpeechSynthesis | null = null;
  private isMuted: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public static getInstance(): SpeechGuidanceService {
    if (!SpeechGuidanceService.instance) {
      SpeechGuidanceService.instance = new SpeechGuidanceService();
    }
    return SpeechGuidanceService.instance;
  }

  public speak(text: string): void {
    if (this.isMuted || !this.synthesis) return;

    try {
      this.synthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      this.synthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech guidance synthesis error:', err);
    }
  }

  public stop(): void {
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch {}
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public isSupported(): boolean {
    return !!this.synthesis;
  }
}

export const speechService = SpeechGuidanceService.getInstance();
