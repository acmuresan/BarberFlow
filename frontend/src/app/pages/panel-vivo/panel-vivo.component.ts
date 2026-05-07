import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelService } from '../../core/services/panel.service';
import { FeedbackService } from '../../core/services/feedback.service';

@Component({
  selector: 'app-panel-vivo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-vivo.component.html',
  styleUrls: ['./panel-vivo.component.css'],
})
export class PanelVivoComponent implements OnInit, OnDestroy {
  private panelService = inject(PanelService);
  private feedback = inject(FeedbackService);

  private readonly POLLING_INTERVAL = 30000;
  private intervalId: any;

  public panelData = signal<any>(null);
  public loading = signal<boolean>(true);
  public lastUpdate = signal<Date>(new Date());

  tiempoRedondeado = computed(() => {
    const val = this.panelData()?.tiempo_espera_estimado_min;
    if (val === null || val === undefined) return null;
    return Math.round(val); //Math.round() porque el backend devuelve decimales largos
  });

  walkinsEnEspera = computed(() => {
    const cola: any[] = this.panelData()?.walkins_cola ?? [];
    return cola.filter((w: any) => w.estado === 'esperando');
  });

  // Personas contadas: citas próximas + walkins en espera real
  personasEsperando = computed(() => {
    const citas: any[] = this.panelData()?.proximas_citas ?? [];
    return citas.length + this.walkinsEnEspera().length;
  });

  ngOnInit(): void {
    this.fetchData();
    this.intervalId = setInterval(() => this.fetchData(), this.POLLING_INTERVAL);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private fetchData(): void {
    this.panelService.getPanelInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.panelData.set(response.data);
          this.lastUpdate.set(new Date());
        }
        this.loading.set(false);
      },
      error: () => {
        if (this.loading()) {
          this.feedback.showToast('No se pudo conectar con el panel', 'error');
        }
        this.loading.set(false);
      },
    });
  }
}
