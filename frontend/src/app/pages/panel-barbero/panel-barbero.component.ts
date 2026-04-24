import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarberosService } from '../../core/services/barberos.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-panel-barbero',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './barbero-panel.component.html',
  styleUrls: ['./barbero-panel.component.css'],
})
export class BarberoPanelComponent implements OnInit {
  private barberoService = inject(BarberosService);
  private authService = inject(AuthService);

  // Signals para el estado de la vista
  citas = signal<any[]>([]);
  walkins = signal<any[]>([]);
  loading = signal<boolean>(true);

  barberoId!: number;

  ngOnInit() {
    // Obtenemos el ID vinculado del usuario logueado
    const user = this.authService.currentUser();

    if (user && user.barbero_id) {
      this.barberoId = user.barbero_id;
      this.cargarDatos();
    } else {
      console.error('No se pudo identificar el perfil de barbero del usuario logueado');
    }
  }

  cargarDatos() {
    this.barberoService.getCitasHoy(this.barberoId).subscribe({
      next: (data) => {
        // Asegura que data es un array antes de procesar
        if (!Array.isArray(data)) return;

        // Se ordena por hora de menor a mayor
        const citasOrdenadas = data.sort((a: any, b: any) => {
          const tiempoA = new Date(a.fecha_hora).getTime(); //Convierte string ISO a Date
          const tiempoB = new Date(b.fecha_hora).getTime();
          return tiempoA - tiempoB;
        });

        // Actualiza el Signal con el array ya ordenado
        this.citas.set(citasOrdenadas);
      },
      error: (err) => console.error('Error al cargar citas:', err),
    });

    this.barberoService.getWalkinsPanel().subscribe({
      next: (data) => {
        // Filtramos walk-ins: los que no tienen barbero asignado (cola general)
        // o los que tiene asignados este barbero y están esperando/atendiendo
        const filtrados = data.walkins_cola.filter(
          (w: any) => w.barberos_id === null || w.barberos_id === this.barberoId,
        );
        this.walkins.set(filtrados);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar walkins:', err);
        this.loading.set(false);
      },
    });
  }

  cambiarEstadoWalkin(id: number, nuevoEstado: 'atendiendo' | 'completado') {
    this.barberoService.updateWalkinEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.cargarDatos(); // Refresh sencillo
      },
      error: (err) => console.error('Error al actualizar estado:', err),
    });
  }
}
