import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  // Obtener citas de un usuario específico
  getCitasByUsuario(usuarioId: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${usuarioId}`);
  }

  // GET /api/citas (Requiere JWT de Admin)
  getAllCitas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Cambiar estado (Cancelar)
  cambiarEstado(citaId: number, nuevoEstado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${citaId}/estado`, { estado: nuevoEstado });
  }

  crearCita(datosCita: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datosCita);
  }
}
