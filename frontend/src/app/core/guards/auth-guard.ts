import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificación simúltanea en LocalStorage
  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirección forzada al login
  router.navigate(['/login']);
  return false;
};
