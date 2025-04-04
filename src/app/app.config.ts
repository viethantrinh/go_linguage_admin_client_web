import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideRouter} from '@angular/router';

import {DropdownModule, SidebarModule} from '@coreui/angular';
import {routes} from './app.routes';
import {IconSetService} from '@coreui/icons-angular';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(SidebarModule, DropdownModule, IconSetService),
    IconSetService,
    provideAnimationsAsync()
  ],
};
