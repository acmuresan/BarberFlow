import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelService } from '../../core/services/panel.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-panel-vivo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-vivo.component.html',
  styleUrls: ['./panel-vivo.component.css'],
})
export class PanelVivoComponent implements OnInit, OnDestroy {
  private panelService = inject(PanelService);

  // Referencia del intervalo
  private readonly POLLING_INTERVAL = 30000;
  private intervalId: any;

  // Signals para la reactividad
  public panelData = signal<any>(null);
  public loading = signal<boolean>(true);
  public lastUpdate = signal<Date>(new Date());

  ngOnInit(): void {
    // Se ejecuta la primera llamada inmediatamente
    this.fetchData();

    // Configura el setInterval nativo
    this.intervalId = setInterval(() => {
      this.fetchData();
    }, this.POLLING_INTERVAL);
  }

  ngOnDestroy(): void {
    // Se limpia el intervalo al salir del componente
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('Intervalo del panel destruido correctamente');
    }
  }

  // Lógica de la petición extraída para poder reutilizarla
  private fetchData(): void {
    this.panelService.getPanelInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.panelData.set(response.data);
          this.lastUpdate.set(new Date());
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error obteniendo datos del panel:', err);
        this.loading.set(false);
      },
    });
  }
}
