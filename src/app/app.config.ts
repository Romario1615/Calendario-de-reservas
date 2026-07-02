import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Habilita el sistema de rutas (definidas en app.routes.ts)
    provideRouter(routes),
    // Habilita HttpClient y registra el interceptor que adjunta el token JWT
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
