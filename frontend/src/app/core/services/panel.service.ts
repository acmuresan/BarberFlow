import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PanelService {
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}/panel`;

  // Para el panel en vivo completo — requiere JWT admin o barbero
  getPanelInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/hoy`);
  }
}
