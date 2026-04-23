import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    //Habilitamos HttpClient y le decimos que acepte interceptores basados en clases
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),

    //Registramos el JwtInterceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true, // Fundamental para la defensa
    },
  ],
};
