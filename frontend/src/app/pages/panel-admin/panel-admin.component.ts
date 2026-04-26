import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BarberosService } from '../../core/services/barberos.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { ServicioModel } from '../../core/models/servicio.model';
import { BarberoModel } from '../../core/models/barbero.model';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.css'],
})
export class PanelAdminComponent implements OnInit {
  barberos: BarberoModel[] = [];
  servicios: ServicioModel[] = [];
  view: 'barberos' | 'servicios' = 'barberos';

  barberoForm: FormGroup;
  servicioForm: FormGroup;
  editingId: number | null = null;

  //Estado de la UI
  isLoading: boolean = false;
  uiMessage: { text: string; type: 'success' | 'error' } | null = null;

  constructor(
    private fb: FormBuilder,
    private bService: BarberosService,
    private sService: ServiciosService,
  ) {
    // Inicializamos formularios con validaciones de negocio
    this.barberoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      especialidad: ['', Validators.required],
      usuario_id: [null], // Opcional
    });

    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracion: [30, [Validators.required, Validators.min(15)]],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.bService.getAll().subscribe((data) => (this.barberos = data));
    this.sService.getAll().subscribe((data) => (this.servicios = data));
  }

  // Función auxiliar para notificaciones
  showFeedback(text: string, type: 'success' | 'error') {
    this.uiMessage = { text, type };
    // Se oculta automaticamente a los 4 segundos
    setTimeout(() => (this.uiMessage = null), 4000);
  }

  // LÓGICA DE BARBEROS
  onSaveBarbero() {
    if (this.barberoForm.invalid) return;

    this.isLoading = true; // Se bloquea la UI
    const action = this.editingId
      ? this.bService.update(this.editingId, this.barberoForm.value)
      : this.bService.create(this.barberoForm.value);

    action.subscribe({
      next: () => {
        this.isLoading = false;
        this.showFeedback(this.editingId ? 'Barbero actualizado' : 'Barbero creado', 'success');
        this.resetForms();
        this.loadData();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.error || 'Error de conexión con el servidor';
        this.showFeedback(errorMessage, 'error');
      },
    });
  }

  toggleBarberoActivo(barbero: BarberoModel) {
    // Soft-delete, simplemente invertimos el estado 'activo'
    this.bService.update(barbero.id, { activo: !barbero.activo }).subscribe({
      next: () => {
        this.showFeedback(`Barbero ${!barbero.activo ? 'activado' : 'desactivado'}`, 'success');
        this.loadData();
      },
      error: () => this.showFeedback('Error al cambiar el estado', 'error'),
    });
  }

  // LÓGICA DE SERVICIOS
  onSaveServicio() {
    if (this.servicioForm.invalid) return;

    this.isLoading = true;
    const action = this.editingId
      ? this.sService.update(this.editingId, this.servicioForm.value)
      : this.sService.create(this.servicioForm.value);

    action.subscribe({
      next: () => {
        this.isLoading = false;
        this.showFeedback('Servicio guardado correctamente', 'success');
        this.resetForms();
        this.loadData();
      },
      error: (err) => {
        this.isLoading = false;
        this.showFeedback(err.error?.error || 'Error al guardar el servicio', 'error');
      },
    });
  }

  editEntity(entity: any, type: 'b' | 's') {
    this.editingId = entity.id;
    if (type === 'b') {
      this.view = 'barberos';
      this.barberoForm.patchValue(entity);
    } else {
      this.view = 'servicios';
      this.servicioForm.patchValue(entity);
    }
  }

  resetForms() {
    this.editingId = null;
    this.barberoForm.reset();
    this.servicioForm.reset();
  }
}
