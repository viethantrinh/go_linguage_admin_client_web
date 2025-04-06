import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  INTROSPECT_TOKEN_PATH,
  SIGN_IN_PATH,
  SIGN_OUT_PATH,
  SIGN_UP_PATH,
  TOKEN_KEY
} from '../../shared/utils/app.constants';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Skip authentication for these paths
  if (request.url.includes(SIGN_IN_PATH) ||
    request.url.includes(SIGN_UP_PATH) ||
    request.url.includes(SIGN_OUT_PATH) ||
    request.url.includes(INTROSPECT_TOKEN_PATH)) {
    console.log('authInterceptor: skip add header')
    return next(request);
  }

  const token = localStorage.getItem(TOKEN_KEY);

  // Only add Authorization header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('authInterceptor: add header')
    return next(request);
  }

  // No token found, proceed with original request
  return next(request);
}


