import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Envía los datos al servidor y reacciona a la respuesta
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.success) {
          this.guardarSesion(
            response.data.token,
            response.data.rol,
            response.data.usuario_id,
            response.data.barbero_id, // Puede ser null si es cliente o admin
          );
        }
      }),
      catchError(this.handleError),
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(catchError(this.handleError));
  }

  private guardarSesion(token: string, rol: string, usuarioId: number, barberoId?: number) {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
    localStorage.setItem('usuario_id', usuarioId.toString());
    if (barberoId) {
      localStorage.setItem('barbero_id', barberoId.toString());
    } else {
      // Limpia datos de sesiones anteriores
      localStorage.removeItem('barbero_id');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  // Lee directamente 'usuario_id' como string y lo pasa a número
  getUserId(): number {
    const idStr = localStorage.getItem('usuario_id');
    return idStr ? parseInt(idStr, 10) : 0;
  }

  getUserData(): { rol: string; barbero_id: number | null } | null {
    const rol = this.getRol();
    if (!rol) return null; // Si no hay rol, no hay sesión válida

    const barberoIdRaw = localStorage.getItem('barbero_id');
    return {
      rol: rol,
      // Manejamos el casteo de string a number de forma segura
      barbero_id: barberoIdRaw ? Number(barberoIdRaw) : null,
    };
  }

  isLoggedIn(): boolean {
    // Devuelve true si el token existe en localStorage
    return !!this.getToken();
  }

  logout() {
    localStorage.clear(); // Borra todo (token, rol, id)
  }

  private handleError(error: HttpErrorResponse) {
    // Se propaga el error para que el componente decida cómo mostrarlo
    return throwError(() => error);
  }
}
