import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { FeedbackService } from '../services/feedback.service';

export const feedbackInterceptor: HttpInterceptorFn = (req, next) => {
  const feedbackService = inject(FeedbackService);

  // Rutas que gestionan sus propios errores visualmente
  const rutasPropias = ['/auth/login', '/auth/register', '/citas/barbero'];
  const autoGestion = rutasPropias.some((route) => req.url.includes(route));

  const silentRoutes = ['/panel/hoy', '/panel/publico'];
  const isSilent = silentRoutes.some((route) => req.url.includes(route));

  //Rutas de polling silencioso, no se activa el spinner para no interrumpir
  if (isSilent) {
    return next(req);
  }

  feedbackService.showLoading();

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Las rutas de auth propagan el error sin toast
      if (autoGestion) {
        return throwError(() => error);
      }

      // Mensajes contextuales por código HTTP
      let errorMsg = 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 400:
          errorMsg = 'Datos incorrectos. Revisa el formulario';
          break;
        case 401:
          errorMsg = 'Sesión caducada. Vuelve a iniciar sesión';
          break;
        case 403:
          errorMsg = 'No tienes permisos para esta acción';
          break;
        case 404:
          errorMsg = 'Recurso no encontrado';
          break;
        case 409:
          errorMsg = 'La hora seleccionada ya está reservada';
          break;
        case 503:
          errorMsg = 'Sin conexión con el servidor. Comprueba tu red';
          break;
      }

      feedbackService.showToast(errorMsg, 'error');
      return throwError(() => error);
    }),
    finalize(() => feedbackService.hideLoading()),
  );
};
