import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {map, tap} from 'rxjs';
import {APP_ROUTE_TOKEN} from '../routes/app.routes.constants';
import {AuthService} from '../../features/auth/services/auth.service';

export const AuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ||
    authService.checkAuthStatus().pipe(
      map(response => !!response?.result?.valid),
      tap(isValid => {
        if (!isValid) {
          router.navigate([`/${APP_ROUTE_TOKEN.AUTH}`]);
        }
      })
    );
};
