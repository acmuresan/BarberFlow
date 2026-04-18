import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../../core/services/appointments/appointments.service';

const ESTADO_PENDIENTE = 'pendiente';
const ESTADO_CONFIRMADA = 'confirmada';
const ESTADO_CANCELADA = 'cancelada';
@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css',
})
export class MisCitasComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  citas: any[] = [];

  // citas = [
  //   //Citas de pruebas
  //   {
  //     id: '1',
  //     servicio: 'Corte de pelo',
  //     fecha: new Date('2026-04-20T10:00:00'),
  //     estado: ESTADO_PENDIENTE,
  //   },
  //   {
  //     id: '2',
  //     servicio: 'Arreglo de barba',
  //     fecha: new Date('2026-04-21T12:30:00'),
  //     estado: ESTADO_CONFIRMADA,
  //   },
  //   {
  //     id: '3',
  //     servicio: 'Corte + Barba',
  //     fecha: new Date('2026-04-22T17:00:00'),
  //     estado: ESTADO_CANCELADA,
  //   },
  // ];

  ngOnInit() {
    const usuarioId = localStorage.getItem('usuario_id'); // O el campo que devuelva tu login

    if (usuarioId) {
      this.loadAppointments(usuarioId);
    }
    //console.log('Componente cargado con datos:', this.citas);
  }

  loadAppointments(id: string) {
    this.appointmentsService.getUsuarioCitas(id).subscribe((data) => {
      this.citas = data;
    });
  }

  cancelarCita(id: string) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.appointmentsService.cancelarCita(id).subscribe(() => {
        // Recargar la lista tras cancelar
        const usuarioId = localStorage.getItem('usuario_id');
        if (usuarioId) this.loadAppointments(usuarioId);
      });
    }
  }
}
