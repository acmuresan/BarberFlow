import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
//import { Observable } from 'rxjs';
import { of, Observable } from 'rxjs'; //PARA SIMULACION INTERNA

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  //PARA SIMULACIÓN INTERNA
  getServicios(): Observable<any[]> {
    return of([
      { id: 1, nombre: 'Corte + Lavado (Simulación)', precio: 18 },
      { id: 2, nombre: 'Afeitado Premium (Simulación)', precio: 12 },
    ]);
  }

  getBarberos(): Observable<any[]> {
    return of([
      { id: 1, nombre: 'Barbero de Prueba 1', activo: true },
      { id: 2, nombre: 'Barbero de Prueba 2', activo: true },
    ]);
  }

  // Obtener citas de un usuario específico
  getUsuarioCitas(usuarioId: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/api/citas/${usuarioId}`);
  }

  // Cancelar una cita (Cambio de estado)
  cancelarCita(appointmentId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/citas/${appointmentId}/estado`, {
      estado: 'cancelada',
    });
  }

  //Paso 1: Función para obtener servicios
  // getServicios(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/servicios`);
  // }

  //Paso 2: Función para obtener barberos
  // getBarberos(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/barberos`);
  // }

  // Enviar la cita al servidor
  crearCita(cita: any): Observable<any> {
    // Se recupera el token del almacenamiento local
    const token = localStorage.getItem('token');

    // Se crean las cabeceras con el Token de autorización (Bearer)
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // El POST envía el objeto cita y las cabeceras
    return this.http.post(`${this.apiUrl}/citas`, cita, { headers });
  }
}
