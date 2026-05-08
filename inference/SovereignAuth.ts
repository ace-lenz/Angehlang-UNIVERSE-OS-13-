// Plan Item ID: TI-1
/**
 * SovereignAuth.ts — Internal Authorization and Credit Management
 */

export interface SovereignUser {
  id: string;
  name: string;
  isPro: boolean;
  searchCredits: number;
  memories: number;
}

export class SovereignAuth {
  private static STORAGE_KEY = 'angeh_current_user';

  static getUser(): SovereignUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return this.initializeGuest();
    return JSON.parse(raw);
  }

  static isPro(): boolean {
    return this.getUser()?.isPro || false;
  }

  static getCredits(): number {
    return this.getUser()?.searchCredits || 0;
  }

  static consumeCredit(): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (user.isPro) return true;
    if (user.searchCredits <= 0) return false;

    user.searchCredits -= 1;
    this.saveUser(user);
    return true;
  }

  static addMemory(): void {
    const user = this.getUser();
    if (!user) return;
    user.memories += 1;
    this.saveUser(user);
  }

  private static saveUser(user: SovereignUser): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  private static initializeGuest(): SovereignUser {
    const guest: SovereignUser = {
      id: `GUEST_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Sovereign Guest',
      isPro: false,
      searchCredits: 10,
      memories: 0
    };
    this.saveUser(guest);
    return guest;
  }
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
