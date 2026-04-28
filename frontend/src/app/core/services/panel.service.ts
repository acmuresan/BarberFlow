import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PanelService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/panel/hoy`;

  // Para la petición HTTP
  getPanelInfo(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
