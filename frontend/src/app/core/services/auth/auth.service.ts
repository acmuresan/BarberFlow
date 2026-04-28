import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

// Interfaz estricta para el estado de la sesión
export interface UserSession {
  token: string;
  rol: 'admin' | 'barbero' | 'cliente';
  usuario_id: number;
  barbero_id: number | null;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/auth`; // La base de auth en el backend es /api/auth
  private http = inject(HttpClient); //Uso de inject() en lugar del constructor
  // SIGNAL: Fuente de la verdad reactiva para toda la app
  public currentUser = signal<UserSession | null>(this.loadInitialSession());

  // Envía los datos al servidor y reacciona a la respuesta
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.success) {
          const session: UserSession = {
            token: response.data.token,
            rol: response.data.rol,
            usuario_id: response.data.usuario_id,
            barbero_id: response.data.barbero_id || null, // Null seguro para admin puro/cliente
          };
          this.guardarSesion(session);
        }
      }),
      catchError(this.handleError),
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, userData).pipe(catchError(this.handleError));
  }

  private guardarSesion(session: UserSession) {
    localStorage.setItem('session', JSON.stringify(session)); // Se guarda todo en un solo string JSON
    this.currentUser.set(session); // Notifica a toda la app al instante
  }

  // Se ejecuta al arrancar el servicio para recuperar la sesión si existe
  private loadInitialSession(): UserSession | null {
    const data = localStorage.getItem('session');
    return data ? JSON.parse(data) : null;
  }

  // Helper para el Interceptor JWT
  getToken(): string | null {
    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) return null;
    const session = JSON.parse(sessionStr);
    return session.token;
  }

  isLoggedIn(): boolean {
    // Devuelve true si el token existe en localStorage
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('session');
    localStorage.clear(); // Borra todo (token, rol, id)
    this.currentUser.set(null);
  }

  private handleError(error: HttpErrorResponse) {
    // Se propaga el error para que el componente decida cómo mostrarlo
    return throwError(() => error);
  }
}
