import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BarberosService } from '../../core/services/barberos.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { WalkinsService } from '../../core/services/walkins.service';
import { FeedbackService } from '../../core/services/feedback.service';

@Component({
  selector: 'app-panel-barbero',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './panel-barbero.component.html',
  styleUrls: ['./panel-barbero.component.css'],
})
export class BarberoPanelComponent implements OnInit {
  private barberoService = inject(BarberosService);
  private authService = inject(AuthService);
  private walkinsService = inject(WalkinsService);
  private feedback = inject(FeedbackService);
  private fb = inject(FormBuilder);

  // Signals para el estado de la vista
  citas = signal<any[]>([]);
  walkins = signal<any[]>([]);
  loading = signal<boolean>(true);

  barberoId!: number;

  // Formulario reactivo para registrar nuevos walk-ins
  walkinForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
  });

  ngOnInit() {
    // Obtenemos el ID vinculado del usuario logueado
    const user = this.authService.currentUser();

    if (user && user.barbero_id) {
      this.barberoId = user.barbero_id;
      this.cargarDatos();
    } else {
      this.feedback.showToast('Error de perfil. Cierre sesión y vuelva a entrar', 'error');
    }
  }

  cargarDatos() {
    this.barberoService.getCitasHoy(this.barberoId).subscribe({
      next: (data) => {
        // Asegura que data es un array antes de procesar
        if (!Array.isArray(data)) return;

        // Se ordena por hora de menor a mayor
        const citasOrdenadas = data.sort((a: any, b: any) => {
          return new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime();
        });
        // Actualiza el Signal con el array ya ordenado
        this.citas.set(citasOrdenadas);
      },
    });

    this.barberoService.getWalkinsPanel().subscribe({
      next: (data) => {
        // Filtramos walk-ins: los que no tienen barbero asignado (cola general)
        // o los que tiene asignados este barbero y están esperando/atendiendo
        const filtrados = data.walkins_cola.filter(
          (w: any) => w.barberos_id === null || w.barberos_id === this.barberoId,
        );
        this.walkins.set(filtrados);
        this.loading.set(false); //Se apaga loading inicial
      },
    });
  }

  // Lógica de registro de walk-ins
  registrarWalkin(): void {
    if (this.walkinForm.invalid) return;

    this.walkinsService
      .crearWalkin({
        nombre: this.walkinForm.value.nombre,
        barberos_id: this.barberoId, // Se asigna automáticamente al barbero actual
      })
      .subscribe({
        next: () => {
          this.feedback.showToast('Cliente añadido a la cola', 'success');
          this.walkinForm.reset();
          this.cargarDatos(); // Refrescael panel para que aparezca
        },
      });
  }

  cambiarEstadoWalkin(id: number, nuevoEstado: 'atendiendo' | 'completado') {
    this.barberoService.updateWalkinEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.cargarDatos(); // Refresh sencillo
      },
    });
  }
}
