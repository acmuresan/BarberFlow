import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth/auth.service';
import { BarberosService } from '../../core/services/barberos.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { CitasService } from '../../core/services/citas.service';
import { WalkinsService } from '../../core/services/walkins.service';
import { FeedbackService } from '../../core/services/feedback.service';

import { ServicioModel } from '../../core/models/servicio.model';
import { BarberoModel } from '../../core/models/barbero.model';

import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.css'],
})
export class PanelAdminComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private bService = inject(BarberosService);
  private sService = inject(ServiciosService);
  private citasService = inject(CitasService);
  private authService = inject(AuthService);
  private walkinsService = inject(WalkinsService);
  private feedback = inject(FeedbackService);

  private router = inject(Router);

  barberos = signal<BarberoModel[]>([]);
  servicios = signal<ServicioModel[]>([]);
  citas = signal<any[]>([]);
  walkins = signal<any[]>([]);

  //Citas activas con orden ascendente (más proximas primero)
  citasActivas = computed(() =>
    this.citas()
      .filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada')
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()),
  );

  //Citas completadas o canceladas con orden descendente
  citasHistorial = computed(() =>
    this.citas()
      .filter((c) => c.estado === 'completada' || c.estado === 'cancelada')
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()),
  );

  walkinsEnCola = computed(() =>
    this.walkins().filter((w) => w.estado === 'esperando' || w.estado === 'atendiendo'),
  );

  walkinsHistorial = computed(() =>
    this.walkins().filter((w) => w.estado === 'completado' || w.estado === 'cancelado'),
  );

  // Citas de hoy (dashboard)

  // isToday() recalcula new Date() en cada llamada para que el panel que queda abierto de un día para otro no muestre datos del día anterior
  private isToday(fechaString: string): boolean {
    const d = new Date(fechaString);
    const hoy = new Date();
    return (
      d.getDate() === hoy.getDate() &&
      d.getMonth() === hoy.getMonth() &&
      d.getFullYear() === hoy.getFullYear()
    );
  }

  // Citas exclusivas de hoy (ordenadas por hora)
  citasHoy = computed(() =>
    this.citas()
      .filter((c) => this.isToday(c.fecha_hora) && c.estado !== 'cancelada')
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()),
  );

  // Estadísticas del dashboard

  stats = computed(() => ({
    esperando: this.walkins().filter((w) => w.estado === 'esperando').length,
    atendiendo: this.walkins().filter((w) => w.estado === 'atendiendo').length,
    //citasPendientesHoy usa citasHoy() que ya filtra por hoy y excluye las canceladas
    citasPendientesHoy: this.citasHoy().filter(
      (c) => c.estado === 'pendiente' || c.estado === 'confirmada',
    ).length,
  }));

  view: 'dashboard' | 'barberos' | 'servicios' | 'citas' | 'walkins' = 'dashboard';
  subViewCitas: 'activas' | 'historial' = 'activas';
  subViewWalkins: 'cola' | 'historial' = 'cola';

  private pollingInterval: any;

  barberoForm!: FormGroup;
  servicioForm!: FormGroup;
  editingId: number | null = null;

  //Estado de la UI
  isLoading = signal<boolean>(false);
  uiMessage: { text: string; type: 'success' | 'error' } | null = null;

  ngOnInit(): void {
    this.barberoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      especialidad: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracion: [30, [Validators.required, Validators.min(0)]],
    });

    this.loadData();

    // Motor del panel en vivo ( se refresca cada 30 segundos)
    this.pollingInterval = setInterval(() => this.loadData(), 30000);
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
      next: (data) => this.citas.set(data),
      error: () => this.feedback.showToast('Error al cargar las citas', 'error'),
    });

    // catchError devuelve [] si el endpoint aún no está disponible (404), asi el resto del panel siga funcionando sin romper el polling
    this.walkinsService
      .getWalkins()
      .pipe(
        catchError((err) => {
          console.warn('Walk-ins no disponibles', err.status);
          return of([]);
        }),
      )
      .subscribe((data) => this.walkins.set(data));
  }

  showFeedback(text: string, type: 'success' | 'error') {
    this.uiMessage = { text, type };
    setTimeout(() => (this.uiMessage = null), 4000);
  }

  // LÓGICA DE BARBEROS
  onSaveBarbero() {
    if (this.barberoForm.invalid) return;
    this.isLoading.set(true);

    const payload = { ...this.barberoForm.value };
    if (this.editingId && !payload.password) delete payload.password;

    const action = this.editingId
      ? this.bService.update(this.editingId, payload)
      : this.bService.create(payload);

    action.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.feedback.showToast(
          this.editingId ? 'Barbero actualizado' : 'Barbero creado',
          'success',
        );
        this.resetForms();
        this.loadData();
      },
      error: (err) =>
        this.feedback.showToast(err.error?.error || 'Error de conexión con el servidor', 'error'),
    });
  }

  toggleBarberoActivo(barbero: BarberoModel) {
    const estaActivo = barbero.activo === 1 || barbero.activo === true;
    const nuevoActivo = !estaActivo;

    this.bService.toggleActivo(barbero.id, nuevoActivo).subscribe({
      next: () => {
        this.feedback.showToast(`Barbero ${nuevoActivo ? 'activado' : 'desactivado'}`, 'success');
        this.loadData();
      },
      error: () => this.feedback.showToast('Error al cambiar el estado del barbero', 'error'),
    });
  }

  // LÓGICA DE CITAS
  cambiarEstadoCita(id: number, nuevoEstado: 'confirmada' | 'completada' | 'cancelada') {
    this.citasService.cambiarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.feedback.showToast(`Cita marcada como ${nuevoEstado}`, 'success');
        this.loadData();
      },
      error: () => this.feedback.showToast('Error al actualizar la cita', 'error'),
    });
  }

  // LÓGICA DE SERVICIOS
  onSaveServicio() {
    if (this.servicioForm.invalid) return;
    this.isLoading.set(true);

    const action = this.editingId
      ? this.sService.update(this.editingId, this.servicioForm.value)
      : this.sService.create(this.servicioForm.value);

    action.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.feedback.showToast('Servicio guardado correctamente', 'success');
        this.resetForms();
        this.loadData();
      },
      error: (err) =>
        this.feedback.showToast(err.error?.error || 'Error al guardar el servicio', 'error'),
    });
  }

  editEntity(entity: any, type: 'b' | 's') {
    this.editingId = entity.id;
    if (type === 'b') {
      this.view = 'barberos';
      // La contraseña se vuelve opcional al editar
      this.barberoForm.get('password')?.clearValidators();
      this.barberoForm.get('password')?.updateValueAndValidity();
      this.barberoForm.patchValue(entity);
    } else {
      this.view = 'servicios';
      this.servicioForm.patchValue(entity);
    }
  }

  eliminarServicio(id: number) {
    if (!confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer'))
      return;

    this.sService.delete(id).subscribe({
      next: () => {
        this.feedback.showToast('Servicio eliminado correctamente', 'success');
        this.loadData();
      },
      error: (err) => {
        const msg =
          err.error?.error || 'No se puede eliminar: el servicio está asociado a citas existentes';
        this.feedback.showToast(msg, 'error');
      },
    });
  }

  // LÓGICA DE WALK-IN
  cambiarEstadoWalkin(id: number, nuevoEstado: 'atendiendo' | 'completado' | 'cancelado') {
    this.walkinsService.updateWalkinEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.feedback.showToast(`Walk-in actualizado a ${nuevoEstado}`, 'success');
        this.loadData();
      },
      error: () => this.feedback.showToast('Error al actualizar el walk-in', 'error'),
    });
  }

  // RESET
  resetForms() {
    this.editingId = null;
    this.barberoForm.reset();
    // Restaura validators de contraseña al volver a modo "crear"
    this.barberoForm.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
    this.barberoForm.get('password')?.updateValueAndValidity();
    this.servicioForm.reset();
  }

  cambiarVista(nuevaVista: typeof this.view) {
    this.view = nuevaVista;
    this.resetForms();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
