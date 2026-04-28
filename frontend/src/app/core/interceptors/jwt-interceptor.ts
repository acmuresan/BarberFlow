import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (isApiUrl) {
    // El header redirigue a la API para evitar bloqueos de Ngrok

    let headersConfig: any = {
      'ngrok-skip-browser-warning': '69420',
    };

    // Se le añade un token si el usuario esta conectado
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    // Se clona la petición inyectando todas los headers preparados
    req = req.clone({
      setHeaders: headersConfig,
    });
  }

  return next(req);
};
