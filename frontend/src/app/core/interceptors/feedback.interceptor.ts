import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { FeedbackService } from '../services/feedback.service';

export const feedbackInterceptor: HttpInterceptorFn = (req, next) => {
  const feedbackService = inject(FeedbackService);

  // Evitamos mostrar el spinner en el polling silencioso del panel en vivo
  if (req.url.includes('/panel/hoy')) {
    return next(req);
  }

  feedbackService.showLoading();

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ha ocurrido un error inesperado';

      // Mapeo de errores
      if (error.status === 401) errorMsg = 'Sesión caducada. Vuelve a iniciar sesión.';
      if (error.status === 403) errorMsg = 'No tienes permisos para esta acción.';
      if (error.status === 409) errorMsg = 'La fecha seleccionada se solapa con otra cita.';
      if (error.status === 400) errorMsg = 'Datos incorrectos. Revisa el formulario.';

      feedbackService.showToast(errorMsg, 'error');
      return throwError(() => error);
    }),
    finalize(() => feedbackService.hideLoading()),
  );
};
