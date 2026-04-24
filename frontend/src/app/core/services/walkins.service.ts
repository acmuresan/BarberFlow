import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WalkinsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/walkins`;

  /**
   * Registra un nuevo cliente sin cita (Walk-in) en la cola
   * @param walkinData Objeto con el nombre del cliente y el ID del barbero (opcional)
   */

  crearWalkin(walkinData: { nombre: string; barberos_id?: number }): Observable<any> {
    return this.http.post(this.apiUrl, walkinData);
  }

  updateWalkinEstado(
    id: number,
    estado: 'atendiendo' | 'completado' | 'cancelado',
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
