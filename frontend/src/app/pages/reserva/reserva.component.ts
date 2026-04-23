import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiciosService } from '../../core/services/servicios.service';
import { BarberosService } from '../../core/services/barberos.service';
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

  // Observables para la vista
  servicios$!: Observable<ServicioModel[]>;
  barberos$!: Observable<BarberoModel[]>;

  // Selección del usuario
  selectedServicio: ServicioModel | null = null;
  selectedBarbero: BarberoModel | null = null;

  constructor(
    private serviciosService: ServiciosService,
    private barberosService: BarberosService,
  ) {}

  ngOnInit(): void {
    // Cargamos los datos al iniciar el componente
    // GET /api/servicios
    this.servicios$ = this.serviciosService.getServicios();
    // GET /api/barberos (En el backend ya filtra activo=1)
    this.barberos$ = this.barberosService.getBarberosActivos();
  }

  // Métodos de navegación y selección
  seleccionarServicio(servicio: ServicioModel): void {
    this.selectedServicio = servicio;
  }

  seleccionarBarbero(barbero: BarberoModel): void {
    this.selectedBarbero = barbero;
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
