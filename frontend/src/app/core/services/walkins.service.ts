import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
export class WalkinsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/walkins`;

  //Si el formulario reactivo se valida, inscribe un nuevo cliente
  crearWalkin(walkinData: { nombre: string; barberos_id?: number }): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, walkinData).pipe(map((r) => r.data));
  }
  //Actualiza el estado del walkin (esperando -> atendiendo -> completado)
  updateWalkinEstado(
    id: number,
    estado: 'esperando' | 'atendiendo' | 'completado' | 'cancelado',
  ): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/${id}/estado`, { estado })
      .pipe(map((r) => r.data));
  }

  //Lectura de la lista de walk-in, filtrada por barberos (cada barbero ve sus propios)
  getWalkins(barberoId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (barberoId) {
      params = params.set('barbero_id', barberoId.toString());
    }
    return this.http.get<ApiResponse<any[]>>(this.apiUrl, { params }).pipe(map((r) => r.data));
  }
}
