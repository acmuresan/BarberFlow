import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { BarberosService } from '../../core/services/barberos.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { CitasService } from '../../core/services/citas.service';
import { ServicioModel } from '../../core/models/servicio.model';
import { BarberoModel } from '../../core/models/barbero.model';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.scss'],
})
export class ReservaComponent implements OnInit {
  // Estado del Wizard
  currentStep: number = 1;
  totalSteps: number = 5;

  selectedFecha: Date | null = null;
  hoy: Date = new Date();

  selectedHora: string | null = null;
  horasDisponibles: string[] = ['09:00', '10:00', '11:30', '12:30', '16:00', '17:30'];

  // Para la lógica del calendario
  viewDate: Date = new Date(); // Fecha que determina que mes vemos
  diasDelMes: Date[] = [];

  // Observables para la vista
  servicios$!: Observable<ServicioModel[]>;
  barberos$!: Observable<BarberoModel[]>;

  // Selección del usuario
  selectedServicio: ServicioModel | null = null;
  selectedBarbero: BarberoModel | null = null;

  constructor(
    private serviciosService: ServiciosService,
    private barberosService: BarberosService,
    private citasService: CitasService,
    private authService: AuthService,
    private router: Router,
  ) {}

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

    this.diasDelMes = [];

    // Rellenamos el array de fechas
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.diasDelMes.push(new Date(year, month, i));
    }
  }

  esFechaPasada(fecha: Date): boolean {
    const f = new Date(fecha);
    f.setHours(23, 59, 59); // Margen para el día de hoy
    return f < this.hoy;
  }

  seleccionarFecha(fecha: Date) {
    if (this.esFechaPasada(fecha)) return;
    this.selectedFecha = fecha;
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

    // Uso del operador '?.' por seguridad
    const user = this.authService.currentUser();

    if (!user) {
      alert('Error de sesión. Vuelve a iniciar sesión');
      return;
    }

    // Construimos el objeto
    const bodyCita = {
      usuario_id: user.usuario_id, // Extraído de la RAM en lugar de localStorage
      barbero_id: this.selectedBarbero.id,
      servicio_id: this.selectedServicio.id,
      fecha_hora: `${this.selectedFecha.toISOString().split('T')[0]}T${this.selectedHora}:00`,
    };

    this.citasService.crearCita(bodyCita).subscribe({
      next: (res: any) => {
        alert('¡Reserva realizada con éxito! Revisa tu email.');
        this.router.navigate(['/mis-citas']);
      },
      error: (err: any) => {
        console.error('Error de la API:', err);
        alert('Lo sentimos, el hueco acaba de ser ocupado o hubo un error.');
      },
    });
  }

  nextStep(): void {
    if (this.currentStep === 1 && !this.selectedServicio) return;
    if (this.currentStep === 2 && !this.selectedBarbero) return;
    this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
