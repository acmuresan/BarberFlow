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
  //private apiUrl = `${environment.apiUrl}/api/barberos`;
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}/api`;
  private barberosUrl = `${this.apiBase}/barberos`;

  // Obtener solo activos (para clientes/panel público)
  getBarberosActivos(): Observable<BarberoModel[]> {
    return this.http
      .get<ApiResponse<BarberoModel[]>>(this.barberosUrl)
      .pipe(map((response) => response.data));
  }

  // Obtener todos (incluyendo inactivos) para el Panel Admin
  getAll(): Observable<BarberoModel[]> {
    return this.http
      .get<ApiResponse<BarberoModel[]>>(this.barberosUrl)
      .pipe(map((response) => response.data));
  }

  // Crear un nuevo barbero
  create(barbero: Partial<BarberoModel>): Observable<BarberoModel> {
    return this.http
      .post<ApiResponse<BarberoModel>>(this.barberosUrl, barbero)
      .pipe(map((response) => response.data));
  }

  // Actualizar o hacer soft-delete (ej. enviando { activo: 0 })
  update(id: number, barbero: Partial<BarberoModel>): Observable<BarberoModel> {
    return this.http
      .patch<ApiResponse<BarberoModel>>(`${this.barberosUrl}/${id}`, barbero)
      .pipe(map((response) => response.data));
  }

  //Métodos pata el panel Barbero

  // Citas del día para el barbero logueado
  getCitasHoy(barberoId: number): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiBase}/citas/barbero/${barberoId}`)
      .pipe(map((response) => response.data));
  }

  // Panel global para extraer los walk-ins en cola
  getWalkinsPanel(): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiBase}/panel/hoy`)
      .pipe(map((response) => response.data));
  }

  // Cambio de estado de un walk-in desde el panel del barbero
  updateWalkinEstado(
    id: number,
    estado: 'atendiendo' | 'completado' | 'cancelado',
  ): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiBase}/walkins/${id}/estado`, { estado })
      .pipe(map((response) => response.data));
  }
}
