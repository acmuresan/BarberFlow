import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUserData(); // Supongamos que devuelve { rol, barbero_id }
  const expectedRoles: string[] = route.data['expectedRoles'];

  if (!user) return router.navigate(['/login']);

  // LÓGICA ESPECIAL: Admin con perfil de barbero
  // Si la ruta pide 'barbero' y el usuario es 'admin' pero TIENE barbero_id, le dejamos pasar.
  const isAdminWithBarberProfile = user.rol === 'admin' && user.barbero_id !== null;

  const hasRole =
    expectedRoles.includes(user.rol) ||
    (expectedRoles.includes('barbero') && isAdminWithBarberProfile);

  if (hasRole) {
    return true;
  }

  // Si no tiene permiso, al panel de flujo por defecto
  router.navigate(['/panel-vivo']);
  return false;
};
