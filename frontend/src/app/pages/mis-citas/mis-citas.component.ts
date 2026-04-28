import { Component, OnInit, inject, signal } from '@angular/core';
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

  // Signal para controlar el modal. Si tiene un número (ID), el modal se abre. Si es null, se cierra
  citaACancelar = signal<number | null>(null);

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
      .pipe(
        finalize(() => {
          this.isLoading.set(false); // Se apaga el loader de forma reactiva
        }),
      )
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.citas.set(res.data); // Se guarda la cita en el Signal
          }
        },
        error: (err) => {
          this.feedback.showToast('Error de conexión.', 'error');
        },
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
        // El array se actualiza dentro del Signal
        const currentCitas = this.citas();
        const citaIndex = currentCitas.findIndex((c) => c.id === id);
        if (citaIndex !== -1) {
          currentCitas[citaIndex].estado = 'cancelada';
          this.citas.set([...currentCitas]); // Fuerza la reactividad
        }

        this.feedback.showToast('Cita cancelada correctamente', 'success');
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al cancelar:', err);
        if (err.status === 403) {
          this.feedback.showToast(
            'Acceso denegado: El servidor cree que no tienes permiso.',
            'error',
          );
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
      pendiente: 'chip-warning',
      confirmada: 'chip-info',
      completada: 'chip-success',
      cancelada: 'chip-danger',
    };
    return clases[estado] || 'chip-default';
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
