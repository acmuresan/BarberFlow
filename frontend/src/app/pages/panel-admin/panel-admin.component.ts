import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { BarberosService } from '../../core/services/barberos.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { ServicioModel } from '../../core/models/servicio.model';
import { BarberoModel } from '../../core/models/barbero.model';
import { CitasService } from '../../core/services/citas.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.css'],
})
export class PanelAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bService = inject(BarberosService);
  private sService = inject(ServiciosService);
  private citasService = inject(CitasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  barberos: BarberoModel[] = [];
  servicios: ServicioModel[] = [];
  citas: any[] = [];

  view: 'barberos' | 'servicios' | 'citas' = 'barberos';

  barberoForm: FormGroup;
  servicioForm: FormGroup;
  editingId: number | null = null;

  //Estado de la UI
  isLoading = signal<boolean>(false);
  uiMessage: { text: string; type: 'success' | 'error' } | null = null;

  constructor() {
    this.barberoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      especialidad: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
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
    this.bService.getAll().subscribe((data) => {
      this.barberos = data;
      this.cdr.detectChanges();
    });
    this.sService.getAll().subscribe((data) => {
      this.servicios = data;
      this.cdr.detectChanges();
    });
    this.citasService.getAllCitas().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.citas = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al cargar historial de citas:', err),
    });
  }

  showFeedback(text: string, type: 'success' | 'error') {
    setTimeout(() => {
      this.uiMessage = { text, type };
      this.cdr.detectChanges();
    });
    setTimeout(() => {
      this.uiMessage = null;
      this.cdr.detectChanges();
    }, 4000); // Se oculta automaticamente a los 4 segundos
  }

  // LÓGICA DE BARBEROS
  onSaveBarbero() {
    if (this.barberoForm.invalid) return;

    this.isLoading.set(true);

    const payload = { ...this.barberoForm.value };

    const action = this.editingId
      ? this.bService.update(this.editingId, payload)
      : this.bService.create(payload);

    action.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showFeedback(this.editingId ? 'Barbero actualizado' : 'Barbero creado', 'success');
        this.resetForms();
        this.loadData();
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMessage = err.error?.error || 'Error de conexión con el servidor';
        this.showFeedback(errorMessage, 'error');
      },
    });
  }

  // Decisión: soft-delete — activo es 0 o 1 en BD, no boolean
  toggleBarberoActivo(barbero: BarberoModel) {
    const nuevoActivo = barbero.activo != 1;
    this.bService.toggleActivo(barbero.id, nuevoActivo).subscribe({
      next: () => {
        this.showFeedback(`Barbero ${nuevoActivo ? 'activado' : 'desactivado'}`, 'success');
        this.loadData();
      },
      error: () => this.showFeedback('Error al cambiar el estado', 'error'),
    });
  }

  // LÓGICA DE SERVICIOS
  cambiarEstadoCita(id: number, nuevoEstado: string) {
    this.citasService.cambiarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.showFeedback(`Cita marcada como ${nuevoEstado}`, 'success');
        this.loadData();
      },
      error: () => this.showFeedback('Error al actualizar la cita', 'error'),
    });
  }

  onSaveServicio() {
    if (this.servicioForm.invalid) return;

    this.isLoading.set(true);
    const action = this.editingId
      ? this.sService.update(this.editingId, this.servicioForm.value)
      : this.sService.create(this.servicioForm.value);

    action.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showFeedback('Servicio guardado correctamente', 'success');
        this.resetForms();
        this.loadData();
      },
      error: (err) => {
        this.isLoading.set(false);
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

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
