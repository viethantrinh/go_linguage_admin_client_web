import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SIGN_IN_PATH, SIGN_OUT_PATH, SIGN_UP_PATH, TOKEN_KEY} from '../../shared/utils/app.constants';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!request.url.includes(SIGN_IN_PATH) && !request.url.includes(SIGN_UP_PATH)
    && !request.url.includes(SIGN_OUT_PATH)
    && token) {
    const reqWithHeader = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
    console.log('add token to header', reqWithHeader.headers);
    return next(reqWithHeader);
  }

  return next(request);
}


