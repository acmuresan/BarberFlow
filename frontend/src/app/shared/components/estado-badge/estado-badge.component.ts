import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Estados exactos que vienen de la base de datos (Citas + Walk-ins)
export type EstadoBarberFlow =
  | 'pendiente'
  | 'confirmada'
  | 'completada'
  | 'cancelada'
  | 'esperando'
  | 'atendiendo'
  | 'completado'
  | 'cancelado';

interface EstadoConfig {
  label: string;
  cssClass: string;
}

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-badge.component.html',
  styleUrls: ['./estado-badge.component.css'],
})
export class EstadoBadgeComponent {
  // Recibimos el estado desde el componente padre
  @Input({ required: true }) estado!: EstadoBarberFlow;

  get config(): EstadoConfig {
    const configuraciones: Record<EstadoBarberFlow, EstadoConfig> = {
      // Estados de citas
      pendiente: { label: 'Pendiente', cssClass: 'badge-warning' },
      confirmada: { label: 'Confirmada', cssClass: 'badge-primary' },
      completada: { label: 'Completada', cssClass: 'badge-success' },
      cancelada: { label: 'Cancelada', cssClass: 'badge-danger' },
      // Estados de walk-ins
      esperando: { label: 'En espera', cssClass: 'badge-warning' },
      atendiendo: { label: 'Atendiendo', cssClass: 'badge-info' },
      completado: { label: 'Completado', cssClass: 'badge-success' },
      cancelado: { label: 'Cancelado', cssClass: 'badge-danger' },
    };

    return (
      configuraciones[this.estado] ?? {
        label: 'Desconocido',
        cssClass: 'badge-secondary',
      }
    );
  }
}
