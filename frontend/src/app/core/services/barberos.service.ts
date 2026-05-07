import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BarberoModel } from '../models/barbero.model';
import { environment } from '../../../environments/environment';

// Interfaz para mapear la respuesta estandarizada del backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BarberosService {
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}`;
  private barberosUrl = `${this.apiBase}/barberos`;

  // Obtener solo activos (para clientes/panel público)
  getBarberosActivos(): Observable<BarberoModel[]> {
    return this.http.get<ApiResponse<BarberoModel[]>>(this.barberosUrl).pipe(map((r) => r.data));
  }

  // Obtener todos (incluyendo inactivos) para el Panel Admin
  getAll(): Observable<BarberoModel[]> {
    return this.http
      .get<ApiResponse<BarberoModel[]>>(`${this.barberosUrl}/admin/todos`)
      .pipe(map((r) => r.data));
  }

  create(barbero: Partial<BarberoModel>): Observable<BarberoModel> {
    return this.http
      .post<ApiResponse<BarberoModel>>(this.barberosUrl, barbero)
      .pipe(map((response) => response.data));
  }

  // Actualizar o hacer soft-delete
  update(id: number, barbero: Partial<BarberoModel>): Observable<BarberoModel> {
    return this.http
      .patch<ApiResponse<BarberoModel>>(`${this.barberosUrl}/${id}`, barbero)
      .pipe(map((response) => response.data));
  }

  // soft-delete en lugar de hard-delete para preservar historial de citas
  toggleActivo(id: number, activo: boolean): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(`${this.barberosUrl}/${id}/activo`, { activo: activo ? 1 : 0 })
      .pipe(map((r) => r.data));
  }
}
