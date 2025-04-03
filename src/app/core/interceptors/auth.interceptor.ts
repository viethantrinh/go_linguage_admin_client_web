// interceptors/auth.interceptor.ts
import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SIGN_IN_PATH, SIGN_OUT_PATH, SIGN_UP_PATH, TOKEN_KEY} from '../../shared/utils/app.constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!request.url.includes(SIGN_IN_PATH) && !request.url.includes(SIGN_UP_PATH)
      && !request.url.includes(SIGN_OUT_PATH)
      && token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('add token to header');
    }

    return next.handle(request);
  }
}


