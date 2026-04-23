import { Routes } from '@angular/router';
import { authGuard } from './core/guards//auth-guard';
import { roleGuard } from './core/guards/role.guard';
import { AdminPanel } from './pages/admin/admin';
import { BarberoPanel } from './pages/barbero-panel/barbero-panel';
import { VivoPanel } from './pages/vivo-panel/vivo-panel';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { MisCitasComponent } from './pages/appointments/mis-citas/mis-citas';
import { ReservarCitaComponent } from './pages/appointments/reservar-cita/reservar-cita';

export const routes: Routes = [
  {
    path: 'panel-admin',
    component: PanelAdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['admin'] },
  },
  {
    path: 'panel-barbero',
    component: PanelBarberoComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['barbero'] }, // El guard permite entrar a admins con barbero_id
  },
  { path: 'panel-vivo', component: PanelVivoComponent }, // Pública
  { path: '', redirectTo: '/panel-vivo', pathMatch: 'full' }

  { path: 'login', component: LoginComponent },
  //{ path: 'register', component: RegisterComponent },
  //{ path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'mis-citas',
    component: MisCitasComponent,
    canActivate: [authGuard],
  },
  //{ path: 'reservar', component: ReservarCitaComponent },
];
