import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se recuperan los datos guardados en el login
  const rol = localStorage.getItem('rol');
  const barbero_id = localStorage.getItem('barbero_id');
  const expectedRole = route.data['expectedRole'];

  // Lógica de admin
  if (rol === 'admin' && barbero_id !== null) {
    return true;
  }

  // Lógica de rol normal
  if (rol === expectedRole) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
