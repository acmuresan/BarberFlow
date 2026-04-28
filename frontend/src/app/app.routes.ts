import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role.guard';
import { PanelAdminComponent } from './pages/panel-admin/panel-admin.component';
import { BarberoPanelComponent } from './pages/panel-barbero/panel-barbero.component';
import { PanelVivoComponent } from './pages/panel-vivo/panel-vivo.component';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MisCitasComponent } from './pages/mis-citas/mis-citas.component';
import { ReservaComponent } from './pages/reserva/reserva.component';

export const routes: Routes = [
  //Ruta pública
  {
    path: 'panel-publico',
    loadComponent: () =>
      import('./pages/panel-publico/panel-publico.component').then((m) => m.PanelPublicoComponent),
  },

  {
    path: 'panel-admin',
    component: PanelAdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['admin'] },
  },
  {
    path: 'panel-barbero',
    component: BarberoPanelComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['admin', 'barbero'] },
  },
  {
    path: 'panel-vivo',
    component: PanelVivoComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['admin', 'barbero'] },
  },

  { path: '', redirectTo: '/panel-vivo', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'mis-citas',
    component: MisCitasComponent,
    canActivate: [authGuard],
  },

  { path: 'reserva', component: ReservaComponent, canActivate: [authGuard] },
];
