import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {APP_ROUTE_TOKEN} from '../routes/app.routes.constants';
import {AuthService} from '../../features/auth/services/auth.service';

export const GuestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate([`/${APP_ROUTE_TOKEN.DASHBOARD}`]);
    return false;
  }
  return true;
};
