import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../core/services/citas.service';

@Component({
  selector: 'app-mis-citas',
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.scss'],
})
export class MisCitasComponent implements OnInit {
  citas: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private citasService: CitasService) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) {
      this.errorMessage = 'No se encontró sesión de usuario.';
      this.isLoading = false;
      return;
    }

    this.citasService.getCitasByUsuario(usuarioId).subscribe({
      next: (res) => {
        this.citas = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar tus citas.';
        this.isLoading = false;
      },
    });
  }

  cancelarCita(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.citasService.cambiarEstado(id, 'cancelada').subscribe({
        next: () => {
          // Se cambia el estado localmente para no recargar todo
          const cita = this.citas.find((c) => c.id === id);
          if (cita) cita.estado = 'cancelada';
          alert('Cita cancelada correctamente.');
        },
        error: () => alert('No se pudo cancelar la cita. Inténtalo de nuevo.'),
      });
    }
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
