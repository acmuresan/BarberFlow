import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServicioModel } from '../models/servicio.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/servicios`;

  // Obtener servicios

  getAll(): Observable<ServicioModel[]> {
    return this.http.get<ApiResponse<ServicioModel[]>>(this.apiUrl).pipe(map((r) => r.data));
  }

  // Crear un nuevo servicio
  create(servicio: Partial<ServicioModel>): Observable<ServicioModel> {
    return this.http
      .post<ApiResponse<ServicioModel>>(this.apiUrl, servicio)
      .pipe(map((r) => r.data));
  }

  // Actualizar un servicio (precio, duración)
  update(id: number, servicio: Partial<ServicioModel>): Observable<ServicioModel> {
    return this.http
      .patch<ApiResponse<ServicioModel>>(`${this.apiUrl}/${id}`, servicio)
      .pipe(map((r) => r.data));
  }

  // Eliminar un servicio
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
