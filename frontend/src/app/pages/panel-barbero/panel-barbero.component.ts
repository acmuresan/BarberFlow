import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth/auth.service';
import { WalkinsService } from '../../core/services/walkins.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { CitasService } from '../../core/services/citas.service';

import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-panel-barbero',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './panel-barbero.component.html',
  styleUrls: ['./panel-barbero.component.css'],
})
export class BarberoPanelComponent implements OnInit {
  private citasService = inject(CitasService);
  private walkinsService = inject(WalkinsService);
  private feedback = inject(FeedbackService);
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para el estado de la vista
  citas = signal<any[]>([]);
  walkins = signal<any[]>([]);
  loading = signal<boolean>(true);
  guardandoWalkin = signal<boolean>(false);

  barberoId!: number;

  // Formulario reactivo para registrar nuevos walk-ins
  walkinForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
  });

  seccion: 'citas' | 'walkins' = 'citas';
  subVistaCitas: 'activas' | 'historial' = 'activas';
  subVistaWalkin: 'activos' | 'historial' = 'activos';

  // Citas pendientes/confirmadas para el badge del nav
  citasPendientes = computed(() =>
    this.citas().filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada'),
  );

  //Citas activas con orden ascendente (más proximas primero)
  citasActivas = computed(() =>
    this.citas()
      .filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada')
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()),
  );

  //Citas completadas o canceladas con orden descendente
  citasHistorial = computed(() =>
    this.citas()
      .filter((c) => c.estado === 'completada' || c.estado === 'cancelada')
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()),
  );

  // computed() separa activos e historial sin duplicar la lógica de filtrado ni hacer dos peticiones al backend
  walkinsActivos = computed(() =>
    this.walkins().filter((w) => w.estado === 'esperando' || w.estado === 'atendiendo'),
  );

  walkinsHistorial = computed(() =>
    this.walkins().filter((w) => w.estado === 'completado' || w.estado === 'cancelado'),
  );

  ngOnInit() {
    // Obtenemos el ID vinculado del usuario logueado
    const user = this.authService.currentUser();
    if (user && user.barbero_id) {
      this.barberoId = user.barbero_id;
      this.cargarDatos();
    } else {
      this.feedback.showToast('Error de perfil. Cierre sesión y vuelva a entrar', 'error');
      this.loading.set(false);
    }
  }

  cargarDatos() {
    this.citasService.getCitasByBarbero(this.barberoId).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) return;
        this.citas.set(data);
      },
      error: () => this.feedback.showToast('Error al cargar las citas', 'error'),
    });

    this.walkinsService
      .getWalkins(this.barberoId)
      .pipe(
        catchError((err) => {
          console.warn('Walk-ins no disponibles:', err.status);
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data) => this.walkins.set(Array.isArray(data) ? data : []),
      });
  }

  // Lógica de registro de walk-ins

  registrarWalkin(): void {
    if (this.walkinForm.invalid) return;
    this.guardandoWalkin.set(true);

    this.walkinsService
      .crearWalkin({
        nombre: this.walkinForm.value.nombre,
        barberos_id: this.barberoId, // Se asigna automáticamente al barbero actual
      })
      .pipe(finalize(() => this.guardandoWalkin.set(false)))
      .subscribe({
        next: () => {
          this.feedback.showToast(`${this.walkinForm.value.nombre} añadido a la cola`, 'success');
          this.walkinForm.reset();
          this.cargarDatos();
          // Asegura que el usuario ve la lista activa tras añadir
          this.subVistaWalkin = 'activos';
        },
        error: () => this.feedback.showToast('Error al añadir el cliente', 'error'),
      });
  }

  cambiarEstadoWalkin(id: number, nuevoEstado: 'atendiendo' | 'completado' | 'cancelado') {
    this.walkinsService.updateWalkinEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.feedback.showToast(
          nuevoEstado === 'completado' ? 'Corte finalizado ' : `Walk-in: ${nuevoEstado}`,
          'success',
        );
        this.cargarDatos();
      },
      error: () => this.feedback.showToast('Error al actualizar el walk-in.', 'error'),
    });
  }

  cambiarEstadoCita(id: number, nuevoEstado: 'confirmada' | 'completada' | 'cancelada') {
    this.citasService.cambiarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.feedback.showToast(`Cita marcada como ${nuevoEstado}`, 'success');
        const actualizadas = this.citas().map((c) =>
          c.id === id ? { ...c, estado: nuevoEstado } : c,
        );
        this.citas.set(actualizadas);
        // Si se completa o cancela, mostrar historial automáticamente
        if (nuevoEstado === 'completada' || nuevoEstado === 'cancelada') {
          this.subVistaCitas = 'historial';
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.feedback.showToast('Sin permiso para cambiar el estado de esta cita.', 'error');
        } else {
          this.feedback.showToast('Error al actualizar la cita.', 'error');
        }
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
