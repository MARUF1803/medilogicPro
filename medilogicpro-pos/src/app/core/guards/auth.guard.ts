import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  if (auth.isAuthenticated() || localStorage.getItem('token')) {
    return true;
  }

  // Redirect to MVC login
  window.location.href = 'http://localhost:5050/Account/Login';
  return false;
};
