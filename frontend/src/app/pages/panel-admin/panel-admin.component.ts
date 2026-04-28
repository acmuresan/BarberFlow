import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { BarberosService } from '../../core/services/barberos.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { ServicioModel } from '../../core/models/servicio.model';
import { BarberoModel } from '../../core/models/barbero.model';
import { CitasService } from '../../core/services/citas.service';
import { WalkinsService } from '../../core/services/walkins.service';
import { finalize } from 'rxjs/operators';

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
  private walkinsService = inject(WalkinsService);
  private router = inject(Router);

  barberos = signal<BarberoModel[]>([]);
  servicios = signal<ServicioModel[]>([]);
  citas = signal<any[]>([]);
  walkins = signal<any[]>([]);

  //Citas computadas para el filtro automático
  citasActivas = computed(() =>
    this.citas().filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada'),
  );

  citasHistorial = computed(() =>
    this.citas().filter((c) => c.estado === 'completada' || c.estado === 'cancelada'),
  );
  walkinsEnCola = computed(() =>
    this.walkins().filter((w) => w.estado === 'esperando' || w.estado === 'atendiendo'),
  );
  walkinsHistorial = computed(() =>
    this.walkins().filter((w) => w.estado === 'completado' || w.estado === 'cancelado'),
  );

  view: 'dashboard' | 'barberos' | 'servicios' | 'citas' | 'walkins' = 'dashboard';
  subViewCitas: 'activas' | 'historial' = 'activas';
  subViewWalkins: 'cola' | 'historial' = 'cola';

  private pollingInterval: any;

  barberoForm: FormGroup;
  servicioForm: FormGroup;
  editingId: number | null = null;

  //Estado de la UI
  isLoading = signal<boolean>(false);
  uiMessage: { text: string; type: 'success' | 'error' } | null = null;

  // Helper para saber si una fecha es hoy
  isToday(fechaString: string): boolean {
    const d = new Date(fechaString);
    const hoy = new Date();
    return (
      d.getDate() === hoy.getDate() &&
      d.getMonth() === hoy.getMonth() &&
      d.getFullYear() === hoy.getFullYear()
    );
  }

  // Citas exclusivas de hoy (ordenadas por hora)
  citasHoy = computed(() => {
    return this.citas()
      .filter((c) => this.isToday(c.fecha_hora) && c.estado !== 'cancelada')
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  });

  // Estadísticas rápidas
  stats = computed(() => {
    const esperando = this.walkins().filter((w) => w.estado === 'esperando').length;
    const atendiendo = this.walkins().filter((w) => w.estado === 'atendiendo').length;
    const citasPendientesHoy = this.citasHoy().filter(
      (c) => c.estado === 'pendiente' || c.estado === 'confirmada',
    ).length;

    return { esperando, atendiendo, citasPendientesHoy };
  });

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

    // Motor del panel en vivo ( se refresca cada 3 segundos)
    this.pollingInterval = setInterval(() => {
      this.loadData();
    }, 30000);
  }

  ngOnDestroy(): void {
    // Limpieza, si el admin se va a otra página se apaga el motor
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadData() {
    this.bService.getAll().subscribe((data) => this.barberos.set(data));
    this.sService.getAll().subscribe((data) => this.servicios.set(data));
    this.citasService.getAllCitas().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.citas.set(res.data);
        }
      },
      error: (err) => console.error('Error al cargar historial de citas:', err),
    });
    // Cargar cola de Walk-ins global
    this.walkinsService.getWalkins().subscribe({
      next: (res: any) => {
        if (res && res.data) this.walkins.set(res.data);
      },
      error: (err) => console.error('Error al cargar walk-ins:', err),
    });
  }

  showFeedback(text: string, type: 'success' | 'error') {
    setTimeout(() => {
      this.uiMessage = { text, type };
    });
    setTimeout(() => {
      this.uiMessage = null;
    }, 4000); // Se oculta automaticamente a los 4 segundos
  }

  // LÓGICA DE BARBEROS
  onSaveBarbero() {
    if (this.barberoForm.invalid) return;

    this.isLoading.set(true);

    const payload = { ...this.barberoForm.value };
    if (this.editingId && !payload.password) {
      delete payload.password;
    }

    const action = this.editingId
      ? this.bService.update(this.editingId, payload)
      : this.bService.create(payload);

    action.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.showFeedback(this.editingId ? 'Barbero actualizado' : 'Barbero creado', 'success');
        this.resetForms();
        this.loadData();
      },
      error: (err) => {
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

    action.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.showFeedback('Servicio guardado correctamente', 'success');
        this.resetForms();
        this.loadData();
      },
      error: (err) => {
        this.showFeedback(err.error?.error || 'Error al guardar el servicio', 'error');
      },
    });
  }

  editEntity(entity: any, type: 'b' | 's') {
    this.editingId = entity.id;
    if (type === 'b') {
      this.view = 'barberos';
      this.barberoForm.get('password')?.clearValidators(); //El requisito de la contraseña se vuelve opcional
      this.barberoForm.get('password')?.updateValueAndValidity(); //Desbloquea el botón para editar incluso sin contraseña
      this.barberoForm.patchValue(entity);
    } else {
      this.view = 'servicios';
      this.servicioForm.patchValue(entity);
    }
  }

  eliminarServicio(id: number) {
    if (!confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
      return;
    }

    this.sService.delete(id).subscribe({
      next: () => {
        this.showFeedback('Servicio eliminado correctamente', 'success');
        this.loadData(); // Recargamos la lista para actualizar los Signals
      },
      error: (err) => {
        // Si el backend devuelve un error de clave foránea (cita asociada)
        const msg =
          err.error?.error || 'No se puede eliminar: El servicio está asociado a citas existentes.';
        this.showFeedback(msg, 'error');
      },
    });
  }

  // LÓGICA DE WALK-IN
  cambiarEstadoWalkin(id: number, nuevoEstado: 'atendiendo' | 'completado' | 'cancelado') {
    this.walkinsService.updateWalkinEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.showFeedback(`Walk-in actualizado a ${nuevoEstado}`, 'success');
        this.loadData();
      },
      error: () => this.showFeedback('Error al actualizar el walk-in', 'error'),
    });
  }

  resetForms() {
    this.editingId = null;
    this.barberoForm.reset();
    this.barberoForm.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
    this.barberoForm.get('password')?.updateValueAndValidity();
    this.servicioForm.reset();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
