import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="auth-callback">
      <div class="spinner"></div>
      <p>Authenticating...</p>
    </div>
  `,
  styles: [`
    .auth-callback {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: #0f172a;
      color: #94a3b8;
      font-family: 'Inter', sans-serif;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(148,163,184,0.2);
      border-top-color: #0c63e4;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const authData = this.route.snapshot.queryParamMap.get('auth');

    if (authData) {
      try {
        const decoded = JSON.parse(atob(authData));
        if (decoded.token) {
          this.auth.setAuth({
            token: decoded.token,
            userName: decoded.userName,
            roles: decoded.roles || []
          });
          this.router.navigate(['/pos'], { replaceUrl: true });
          return;
        }
      } catch (err) {
        console.error('Failed to decode auth data:', err);
      }
    }

    // No valid auth — redirect to MVC login
    window.location.href = 'http://localhost:5050/Account/Login';
  }
}
