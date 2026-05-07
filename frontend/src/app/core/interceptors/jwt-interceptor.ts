import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  //Solo se interceptan peticiones que van a nuestra API, evitando fugas de credenciales a terceros
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (isApiUrl) {
    // El header redirigue a la API para evitar bloqueos de Ngrok
    let headersConfig: any = {
      'ngrok-skip-browser-warning': '69420', //Header específico para el entorno de desarrollo con Ngrok
    };

    // Se le añade un token si el usuario esta conectado
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`; //Uso del estándar "Bearer Auth" exigido por la mayoría de APIs REST modernas
    }

    // Se clona la petición inyectando todas los headers preparados
    req = req.clone({
      // Debido a que las peticiones HTTP son inmutables por diseño en Angular se debe clonar la petición para poder mutar sus cabeceras
      setHeaders: headersConfig,
    });
  }

  return next(req);
};
