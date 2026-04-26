import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../core/services/citas.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { RouterModule } from '@angular/router';

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

  citas: any[] = [];
  isLoading = true;

  // Signal para controlar el modal. Si tiene un número (ID), el modal se abre. Si es null, se cierra.
  citaACancelar = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    const user = this.authService.currentUser();
    if (!user || !user.usuario_id) {
      this.isLoading = false;
      return;
    }
    this.citasService.getCitasByUsuario(user.usuario_id.toString()).subscribe({
      next: (res) => {
        this.citas = res.data;
        this.isLoading = false;
      },
      error: () => {
        // Se apga el loading
        this.isLoading = false;
        this.feedback.showToast('Error al cargar tus citas. Inténtalo de nuevo.', 'error');
      },
      // El error de carga lo notifica el Interceptor
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
        // Actualización en memoria
        const cita = this.citas.find((c) => c.id === id);
        if (cita) cita.estado = 'cancelada';

        this.feedback.showToast('Cita cancelada correctamente', 'success');
        this.cerrarModal(); // Cerramos el modal tras el éxito
      },
      error: () => this.cerrarModal(),
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
}
