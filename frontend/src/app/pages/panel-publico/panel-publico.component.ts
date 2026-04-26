import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer, Subscription, switchMap, catchError, of } from 'rxjs';
import { PanelPublicoService, PanelPublicoData } from '../../core/services/panel-publico.service';

@Component({
  selector: 'app-panel-publico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-publico.component.html',
  styleUrls: ['./panel-publico.component.css'],
})
export class PanelPublicoComponent implements OnInit, OnDestroy {
  private panelService = inject(PanelPublicoService);
  private pollingSub?: Subscription;

  datos: PanelPublicoData | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    // Inicia en el ms 0 y luego emite cada 30 segundos
    this.pollingSub = timer(0, 30000)
      .pipe(
        switchMap(() =>
          this.panelService.getDatosPanel().pipe(
            catchError((err) => {
              console.error('Error al conectar con la API pública', err);
              this.error = true;
              return of(null); // Evita que el timer muera si hay un error
            }),
          ),
        ),
      )
      .subscribe((respuesta) => {
        if (respuesta) {
          this.datos = respuesta;
          this.error = false;
        }
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    //Se destruye la suscripcion para evitar memory leaks cuando el usuario cambie de rutas
    this.pollingSub?.unsubscribe();
  }
}
