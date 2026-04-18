import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../../core/services/appointments/appointments.service';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-reservar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-cita.html',
  styleUrl: './reservar-cita.css',
})
export class ReservarCitaComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);

  //  Estado del Wizard
  pasoActual: number = 1;
  totalPasos: number = 3;

  //  Arrays que guardaran los datos del backEnd
  servicios: any[] = [];
  barberos: any[] = [];

  // Selecciones elegidas por el usuario en el frontEnd
  servicioSeleccionado: any = null;
  barberoSeleccionado: any = null;

  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  minFecha: string = ''; // Para limitar el calendario e impedir seleccionar fechas pasadas a la actual

  //Array de horas
  horasManana: string[] = ['09:00', '10:00', '11:00', '12:00'];
  horasTarde: string[] = ['16:00', '17:00', '18:00', '19:00', '20:00'];

  //Disparador
  ngOnInit() {
    // Al cargar el componente, se traen los datos de la base de datos con dos peticiones GET
    this.cargarDatos();
    this.configurarCalendario();
  }

  configurarCalendario() {
    // Se obtiene la fecha de "hoy"
    const hoy = new Date();
    this.minFecha = hoy.toISOString().split('T')[0]; //Se trasnforma la fecha de "hoy"
  }

  cargarDatos() {
    // Llamada para obtener los servicios (con su nombre y precio) (Paso1)
    this.appointmentsService.getServicios().subscribe((data) => (this.servicios = data));
    // Llamada para obtener a los trabajadores (Paso 2)
    this.appointmentsService.getBarberos().subscribe((data) => (this.barberos = data));
  }

  // Selecciones disponibles SOLO PARA SIMULACIÓN INTERNA
  seleccionarServicio(servicio: any) {
    this.servicioSeleccionado = servicio;
  }

  seleccionarBarbero(barbero: any) {
    this.barberoSeleccionado = barbero;
  }
  //

  irSiguiente() {
    if (this.pasoActual === 1 && this.servicioSeleccionado) {
      this.pasoActual = 2;
    } else if (this.pasoActual === 2 && this.barberoSeleccionado) {
      this.pasoActual = 3;
    }
  }

  irAnterior() {
    if (this.pasoActual > 1) this.pasoActual--;
  }

  //Método para simulación
  confirmarReserva() {
    console.log('Datos de la reserva:', {
      servicio: this.servicioSeleccionado,
      barbero: this.barberoSeleccionado,
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
    });

    alert('¡Reserva realizada con éxito!');
  }
}
