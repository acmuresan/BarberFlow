import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PanelPublicoData {
  total_personas: number;
  tiempo_espera_estimado_min: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class PanelPublicoService {
  private http = inject(HttpClient);

  getDatosPanel(): Observable<PanelPublicoData> {
    return this.http.get<PanelPublicoData>(`${environment.apiUrl}/api/panel/publico`);
  }
}
