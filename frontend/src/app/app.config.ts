import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { feedbackInterceptor } from './core/interceptors/feedback.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    //Habilitamos HttpClient y le decimos que acepte interceptores basados en clases
    provideHttpClient(withInterceptors([jwtInterceptor, feedbackInterceptor])),
    provideBrowserGlobalErrorListeners(),
  ],
};
