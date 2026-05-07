import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PanelPublicoService {
  total_personas: number;
  tiempo_espera_estimado_min: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class PanelPublicoService {
  private http = inject(HttpClient);

  getDatosPanel(): Observable<PanelPublicoService> {
    return this.http
      .get<ApiResponse<PanelPublicoService>>(`${environment.apiUrl}/panel/publico`)
      .pipe(map((r) => r.data));
  }
}
