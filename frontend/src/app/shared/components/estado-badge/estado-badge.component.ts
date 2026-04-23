import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Tipamos los estados exactos que vienen de nuestra BD (Citas + Walk-ins)
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
  icon: string;
}

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-badge.component.html',
  styleUrls: ['./estado-badge.component.scss'],
})
export class EstadoBadgeComponent implements OnInit {
  // Recibimos el estado desde el componente padre (ej. PanelBarberoComponent)
  @Input({ required: true }) estado!: EstadoBarberFlow;

  configActual!: EstadoConfig;

  // Diccionario de estados. Centraliza la UI de los ENUMs de MySQL
  private configuraciones: Record<EstadoBarberFlow, EstadoConfig> = {
    // Estados de Citas
    pendiente: { label: 'Pendiente', cssClass: 'badge-warning', icon: '⏳' },
    confirmada: { label: 'Confirmada', cssClass: 'badge-primary', icon: '📅' },
    completada: { label: 'Completada', cssClass: 'badge-success', icon: '✅' },
    cancelada: { label: 'Cancelada', cssClass: 'badge-danger', icon: '❌' },

    // Estados de Walk-ins (reutilizamos estilos donde tiene sentido)
    esperando: { label: 'En espera', cssClass: 'badge-warning', icon: '🚶' },
    atendiendo: { label: 'Atendiendo', cssClass: 'badge-info', icon: '✂️' },
    completado: { label: 'Completado', cssClass: 'badge-success', icon: '✅' },
    cancelado: { label: 'Cancelado', cssClass: 'badge-danger', icon: '❌' },
  };

  ngOnInit(): void {
    // Fallback de seguridad por si desde backend llega algo inesperado
    this.configActual = this.configuraciones[this.estado] || {
      label: 'Desconocido',
      cssClass: 'badge-secondary',
      icon: '❓',
    };
  }
}
