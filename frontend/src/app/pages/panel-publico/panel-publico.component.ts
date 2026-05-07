import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelPublicoService } from '../../core/services/panel-publico.service';
import { FeedbackService } from '../../core/services/feedback.service';

@Component({
  selector: 'app-panel-publico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-publico.component.html',
  styleUrls: ['./panel-publico.component.css'],
})
export class PanelPublicoComponent implements OnInit, OnDestroy {
  private panelPublicoService = inject(PanelPublicoService);
  private feedback = inject(FeedbackService);

  private readonly POLLING_INTERVAL = 30000;
  private intervalId: any;

  datos: PanelPublicoService | null = null;
  loading = true;
  error = false;

  lastUpdate = signal<Date>(new Date());

  tiempoRedondeado = computed(() => {
    const val = this.datos?.tiempo_espera_estimado_min;
    if (val === null || val === undefined) return null;
    return Math.round(val);
  });

  ngOnInit(): void {
    // Pide peticion cada 30 segundos
    this.fetchData();
    this.intervalId = setInterval(() => this.fetchData(), this.POLLING_INTERVAL);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private fetchData(): void {
    this.panelPublicoService.getDatosPanel().subscribe({
      next: (datos) => {
        this.datos = datos;
        this.lastUpdate.set(new Date());
        this.error = false;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        if (this.loading) {
          this.feedback.showToast('No se pudo conectar con la barbería', 'error');
        }
        this.loading = false;
      },
    });
  }
}
