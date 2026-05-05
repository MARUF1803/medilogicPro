import { Injectable, signal, computed } from '@angular/core';

export interface AuthUser {
  token: string;
  userName: string;
  roles: string[];
}

const MVC_LOGIN_URL = 'http://localhost:5050/Account/Login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<AuthUser | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly userName = computed(() => this.userSignal()?.userName ?? '');
  readonly roles = computed(() => this.userSignal()?.roles ?? []);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        this.userSignal.set(JSON.parse(saved));
      } catch {
        this.clearSession();
      }
    }
  }

  setAuth(user: AuthUser): void {
    this.userSignal.set(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    return this.roles().some(r => r.toLowerCase() === role.toLowerCase());
  }

  logout(): void {
    this.clearSession();
    window.location.href = MVC_LOGIN_URL;
  }

  private clearSession(): void {
    this.userSignal.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeBranchId');
  }
}
