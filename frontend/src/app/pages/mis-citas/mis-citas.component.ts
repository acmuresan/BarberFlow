import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../core/services/citas.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.css'],
})
export class MisCitasComponent implements OnInit {
  private citasService = inject(CitasService);
  private feedback = inject(FeedbackService);
  private authService = inject(AuthService);
  private router = inject(Router);

  citas = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  // Signal para controlar el modal, si tiene un número (ID), el modal se abre, si no, se cierra
  citaACancelar = signal<number | null>(null);

  citasActivas = computed(
    () =>
      this.citas()
        .filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada')
        .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()), // Ascendente, las más próximas primero
  );

  citasHistorial = computed(
    () =>
      this.citas()
        .filter((c) => c.estado === 'completada' || c.estado === 'cancelada')
        .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()), // Descendente,las más recientes primero
  );

  vistaActiva: 'activas' | 'historial' = 'activas';

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    const user = this.authService.currentUser();
    if (!user || !user.usuario_id) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    this.citasService
      .getCitasByUsuario(user.usuario_id.toString())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (citas) => {
          this.citas.set(citas);
        },
        error: () => this.feedback.showToast('Error de conexión', 'error'),
      });
  }

  //Lógica del modal

  pedirConfirmacion(id: number): void {
    this.citaACancelar.set(id); // Abre el modal
  }

  cerrarModal(): void {
    this.citaACancelar.set(null); // Cierra el modal
  }

  cancelarCita(): void {
    const id = this.citaACancelar();
    if (!id) return;

    this.citasService.cambiarEstado(id, 'cancelada').subscribe({
      next: () => {
        // La cita cancelada aparecerá automáticamente en historial gracias a citasHistorial computed() sin ninguna acción adicional
        const actualizadas = this.citas().map((c) =>
          c.id === id ? { ...c, estado: 'cancelada' } : c,
        );
        this.citas.set(actualizadas);
        this.vistaActiva = 'historial';
        this.feedback.showToast('Cita cancelada correctamente', 'success');
        this.cerrarModal();
      },
      error: (err) => {
        if (err.status === 403) {
          this.feedback.showToast('No tienes permiso para cancelar esta cita.', 'error');
        } else {
          this.feedback.showToast('Error al intentar cancelar la cita.', 'error');
        }
        this.cerrarModal();
      },
    });
  }

  // Helper para asignar clases CSS según el estado
  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      pendiente: 'chip-pendiente',
      confirmada: 'chip-confirmada',
      completada: 'chip-completada',
      cancelada: 'chip-cancelada',
    };
    return clases[estado] || '';
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
