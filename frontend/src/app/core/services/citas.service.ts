import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private apiUrl = `${environment.apiUrl}/citas`;
  private http = inject(HttpClient);

  // Obtener citas de un usuario específico
  getCitasByUsuario(usuarioId: number | string): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/${usuarioId}`)
      .pipe(map((r) => r.data));
  }

  getCitasByBarbero(barberoId: number): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/barbero/${barberoId}`)
      .pipe(map((r) => r.data));
  }

  // GET /api/citas (Requiere JWT de Admin)
  getAllCitas(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(map((r) => r.data));
  }

  // Cambiar estado (Cancelar)
  cambiarEstado(
    citaId: number,
    nuevoEstado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada',
  ): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/${citaId}/estado`, { estado: nuevoEstado })
      .pipe(map((r) => r.data));
  }

  crearCita(datosCita: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, datosCita).pipe(map((r) => r.data));
  }
}
