import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth/auth.service';
import { FeedbackService } from '../../core/services/feedback.service';

import { BarberosService } from '../../core/services/barberos.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { CitasService } from '../../core/services/citas.service';
import { ServicioModel } from '../../core/models/servicio.model';
import { BarberoModel } from '../../core/models/barbero.model';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css'],
})
export class ReservaComponent implements OnInit {
  private serviciosService = inject(ServiciosService);
  private barberosService = inject(BarberosService);
  private citasService = inject(CitasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private feedback = inject(FeedbackService);

  // Estado del Wizard
  currentStep: number = 1;
  totalSteps: number = 5;

  selectedFecha: Date | null = null;
  hoy: Date = new Date();

  selectedHora: string | null = null;
  horasDisponibles: string[] = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'];

  // Para la lógica del calendario
  viewDate: Date = new Date(); // Fecha que determina que mes vemos
  diasDelMes: (Date | null)[] = [];

  // Observables para la vista
  servicios$!: Observable<ServicioModel[]>;
  barberos$!: Observable<BarberoModel[]>;

  // Selección del usuario
  selectedServicio: ServicioModel | null = null;
  selectedBarbero: BarberoModel | null = null;

  ngOnInit(): void {
    // Cargamos los datos al iniciar el componente
    // GET /api/servicios
    this.servicios$ = this.serviciosService.getServicios();
    // GET /api/barberos (En el backend ya filtra activo=1)
    this.barberos$ = this.barberosService.getBarberosActivos();
    this.generarCalendario();
  }

  // Métodos de navegación y selección
  seleccionarServicio(servicio: ServicioModel): void {
    this.selectedServicio = servicio;
  }

  seleccionarBarbero(barbero: BarberoModel): void {
    this.selectedBarbero = barbero;
  }

  generarCalendario() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);

    // En JS getDay() el Domingo es 0. Lo transformamos para que Lunes sea 0 y Domingo 6
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    // Se rellenan los huecos vacíos al principio del mes con null
    this.diasDelMes = Array(startDay).fill(null);

    // Rellenamos el array de fechas
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.diasDelMes.push(new Date(year, month, i));
    }
  }

  esFechaPasada(fecha: Date | null): boolean {
    if (!fecha) return true;
    const f = new Date(fecha);
    f.setHours(23, 59, 59);
    return f < this.hoy;
  }

  seleccionarFecha(fecha: Date | null) {
    if (!fecha || this.esFechaPasada(fecha)) return;
    this.selectedFecha = fecha;
    this.selectedHora = null; // Resetea la hora si cambia de día
  }

  // SOLUCIÓN BUG HORAS PASADAS
  esHoraPasada(horaStr: string): boolean {
    if (!this.selectedFecha) return true;

    // Si la fecha seleccionada no es hoy, no se bloquean las horas (salvo que sea un dia anterior que ya este bloqueado)
    if (this.selectedFecha.toDateString() !== this.hoy.toDateString()) {
      return false;
    }

    // Si es hoy, compara minutos y horas
    const [horas, minutos] = horaStr.split(':').map(Number);
    const fechaAComparar = new Date();
    fechaAComparar.setHours(horas, minutos, 0, 0);

    // Bloquea si la hora ya pasó
    return fechaAComparar <= this.hoy;
  }

  cambiarMes(delta: number) {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + delta));
    this.generarCalendario();
  }

  confirmarReserva() {
    if (
      !this.selectedServicio ||
      !this.selectedBarbero ||
      !this.selectedFecha ||
      !this.selectedHora
    )
      return;

    const user = this.authService.currentUser();
    if (!user) return; // Fallback de seguridad

    const year = this.selectedFecha.getFullYear();
    const month = String(this.selectedFecha.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedFecha.getDate()).padStart(2, '0');
    const fechaLocal = `${year}-${month}-${day}`;

    const bodyCita = {
      usuario_id: user.usuario_id,
      barbero_id: this.selectedBarbero.id,
      servicio_id: this.selectedServicio.id,
      fecha_hora: `${fechaLocal}T${this.selectedHora}:00`,
    };

    // Se envía la petición
    this.citasService.crearCita(bodyCita).subscribe({
      next: () => {
        this.feedback.showToast('¡Reserva realizada con éxito!', 'success');
        this.router.navigate(['/mis-citas']);
      },
      error: (err: any) => {
        console.error('Error del servidor:', err);

        if (err.status === 409) {
          this.feedback.showToast(
            '¡Vaya! Alguien acaba de reservar a esa misma hora. Por favor, elige otra.',
            'error',
          );
          this.currentStep = 4; // Devuelve al cliente a la pantalla de hora
          this.selectedHora = null; // Fuerza a que elija de nuevo
        } else {
          const mensajeError = err.error?.error || 'Error al procesar tu reserva.';
          this.feedback.showToast(mensajeError, 'error');
        }
      },
    });
  }

  nextStep(): void {
    if (this.currentStep === 1 && !this.selectedServicio) return;
    if (this.currentStep === 2 && !this.selectedBarbero) return;
    if (this.currentStep === 3 && !this.selectedFecha) return;
    if (this.currentStep === 4 && !this.selectedHora) return;
    this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
