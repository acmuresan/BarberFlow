import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { feedbackInterceptor } from './core/interceptors/feedback.interceptor';

//  Importaciones para el idioma español
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es'); // Registramos el idioma
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    //Habilitamos HttpClient y le decimos que acepte interceptores funcionales
    provideHttpClient(withInterceptors([jwtInterceptor, feedbackInterceptor])),
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};
