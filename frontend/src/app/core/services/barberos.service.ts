import { Injectable } from '@angular/core';
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
  private apiUrl = `${environment.apiUrl}/api/barberos`;

  constructor(private http: HttpClient) {}

  // Obtener solo activos (para clientes/panel público)
  getBarberosActivos(): Observable<BarberoModel[]> {
    return this.http
      .get<ApiResponse<BarberoModel[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  // Obtener todos (incluyendo inactivos) para el Panel Admin
  getAll(): Observable<BarberoModel[]> {
    return this.http
      .get<ApiResponse<BarberoModel[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  // Crear un nuevo barbero
  create(barbero: Partial<BarberoModel>): Observable<BarberoModel> {
    return this.http
      .post<ApiResponse<BarberoModel>>(this.apiUrl, barbero)
      .pipe(map((response) => response.data));
  }

  // Actualizar o hacer soft-delete (ej. enviando { activo: 0 })
  update(id: number, barbero: Partial<BarberoModel>): Observable<BarberoModel> {
    return this.http
      .patch<ApiResponse<BarberoModel>>(`${this.apiUrl}/${id}`, barbero)
      .pipe(map((response) => response.data));
  }
}
