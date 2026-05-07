import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
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
  private cdr = inject(ChangeDetectorRef);

  currentStep: number = 1;
  totalSteps: number = 5;

  selectedFecha: Date | null = null;
  selectedHora: string | null = null;

  horasDisponibles: string[] = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
  ];

  viewDate!: Date;
  diasDelMes: (Date | null)[] = [];

  servicios$!: Observable<ServicioModel[]>;
  barberos$!: Observable<BarberoModel[]>;

  selectedServicio: ServicioModel | null = null;
  selectedBarbero: BarberoModel | null = null;

  isSubmitting = signal<boolean>(false);

  horasOcupadas = signal<string[]>([]);
  cargandoHoras = signal<boolean>(false);

  // Mensaje de aviso visible en el paso 4 cuando la hora seleccionada está ocupada
  avisoConflicto = signal<string | null>(null);

  get hoy(): Date {
    return new Date();
  }

  ngOnInit(): void {
    this.viewDate = new Date();
    this.generarCalendario();

    this.servicios$ = this.serviciosService.getAll();
    this.barberos$ = this.barberosService.getBarberosActivos();
  }

  seleccionarServicio(servicio: ServicioModel): void {
    this.selectedServicio = servicio;
  }

  seleccionarBarbero(barbero: BarberoModel): void {
    this.selectedBarbero = barbero;
  }

  generarCalendario(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Ajuste para la semana que empieza en lunes
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    this.diasDelMes = Array(startDay).fill(null);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.diasDelMes.push(new Date(year, month, i));
    }
  }

  esFechaPasada(fecha: Date | null): boolean {
    if (!fecha) return true;
    // Se compara contra el fin del día para permitir seleccionar hoy
    const f = new Date(fecha);
    f.setHours(23, 59, 59, 999);
    return f < this.hoy;
  }

  seleccionarFecha(fecha: Date | null): void {
    if (!fecha || this.esFechaPasada(fecha)) return;
    this.selectedFecha = fecha;
    this.selectedHora = null;
    this.horasOcupadas.set([]);
    this.avisoConflicto.set(null);
  }

  esHoraPasada(horaStr: string): boolean {
    if (!this.selectedFecha) return true;
    // Solo se comprueban horas pasadas si la fecha seleccionada es hoy
    if (this.selectedFecha.toDateString() !== this.hoy.toDateString()) return false;

    const [horas, minutos] = horaStr.split(':').map(Number);
    const slotDate = new Date(); // nueva instancia para comparar con la hora actual
    slotDate.setHours(horas, minutos, 0, 0);
    return slotDate <= this.hoy;
  }

  // Se consulta las citas del barbero cuando el usuario llega al paso 4, asi se marcan los huecos ocupados de forma visaul (feedback)
  cargarHorasOcupadas(): void {
    if (!this.selectedBarbero || !this.selectedFecha) return;

    this.cargandoHoras.set(true);

    this.citasService
      .getCitasByBarbero(this.selectedBarbero.id)
      .pipe(finalize(() => this.cargandoHoras.set(false)))
      .subscribe({
        next: (citas: any[]) => {
          const fechaSelStr = this.selectedFecha!.toDateString();
          const horasDelDia = citas // Filtramos citas del barbero para el día seleccionado que no estén canceladas
            .filter((c) => {
              const fechaCita = new Date(c.fecha_hora);
              return fechaCita.toDateString() === fechaSelStr && c.estado !== 'cancelada';
            })
            .map((c) => {
              const d = new Date(c.fecha_hora); // Extraemos HH:mm de la fecha_hora ISO
              return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            });
          this.horasOcupadas.set(horasDelDia);
        },
        // Si la consulta falla, no bloqueamos al usuario, el spinner ya se apagó con finalize
        error: () => {},
      });
  }

  esHoraOcupada(horaStr: string): boolean {
    return this.horasOcupadas().includes(horaStr);
  }

  seleccionarHora(hora: string): void {
    if (this.esHoraPasada(hora) || this.esHoraOcupada(hora)) return;
    this.selectedHora = hora;
    this.avisoConflicto.set(null);
  }

  cambiarMes(delta: number) {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    this.viewDate = new Date(year, month + delta, 1);
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
    if (!user) return;

    // Construir fecha_hora en formato ISO
    const year = this.selectedFecha.getFullYear();
    const month = String(this.selectedFecha.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedFecha.getDate()).padStart(2, '0');

    const bodyCita = {
      usuario_id: user.usuario_id,
      barbero_id: this.selectedBarbero.id,
      servicio_id: this.selectedServicio.id,
      fecha_hora: `${year}-${month}-${day}T${this.selectedHora}:00`,
    };

    this.isSubmitting.set(true);

    this.citasService
      .crearCita(bodyCita)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.feedback.showToast('¡Reserva realizada con éxito!', 'success');
          this.router.navigate(['/mis-citas']);
        },
        error: (err: any) => {
          const mensajeBackend = err.error?.error || '';
          const esConflicto =
            err.status === 409 ||
            mensajeBackend.toLowerCase().includes('hora') ||
            mensajeBackend.toLowerCase().includes('disponible') ||
            mensajeBackend.toLowerCase().includes('ocupad');

          // setTimeout(0) difiere la actualización de Signals al siguiente tick para evitar ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            if (esConflicto) {
              if (this.selectedHora) {
                this.horasOcupadas.update((prev) => [...prev, this.selectedHora!]);
              }
              this.avisoConflicto.set(
                'Esa hora acaba de ser reservada por otro cliente. Elige otra',
              );
              this.feedback.showToast('Esa hora está reservada. Por favor, elige otra', 'error');
              this.currentStep = 4;
              this.selectedHora = null;
              this.cdr.detectChanges();
            } else {
              this.feedback.showToast(mensajeBackend || 'Error al guardar tu reserva', 'error');
            }
          });
        },
      });
  }

  nextStep(): void {
    if (this.currentStep === 1 && !this.selectedServicio) return;
    if (this.currentStep === 2 && !this.selectedBarbero) return;
    if (this.currentStep === 3 && !this.selectedFecha) return;
    if (this.currentStep === 4 && !this.selectedHora) return;

    // Al pasar al paso 4, cargamos las horas ocupadas de ese día
    if (this.currentStep === 3) {
      this.cargarHorasOcupadas();
    }

    this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.avisoConflicto.set(null);
      this.currentStep--;
    }
  }
}
