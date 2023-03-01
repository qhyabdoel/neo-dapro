import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { filter, switchMap, take, catchError, exhaustMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

import { AuthenticationService } from './authentication.service';
import { AppState } from 'src/app/libs/store/states';
import { SetIsError500Encountered } from 'src/app/libs/store/actions/general.actions';
import { getURLParameter } from '../../helpers/data-visualization-helper';

@Injectable()
export class InterceptService implements HttpInterceptor {
  private tryingRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private queue: any = [];
  constructor(
    public authService: AuthenticationService,
    private cookieService: CookieService,
    private router: Router,
    private store: Store<AppState>
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cookieService.get('token');
    request = this.addAuthorization(request, token);
    return next.handle(request).pipe(
      catchError((error) => {
        switch (error.status) {
          case 403:
            this.queue.push(request);
            return this.handle403Error(request, next);
          case 401:
            return this.handle401Error(error);
          case 500:
            return this.handle500Error(error);
          default:
            return throwError(() => error.error);
        }
      })
    );
  }

  private handle403Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.tryingRefreshing) {
      this.tryingRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refresh_token = this.cookieService.get('refresh_token');
      this.addAuthorization(request, refresh_token);
      return this.authService.refreshToken(refresh_token).pipe(
        switchMap((token: any) => {
          // console.log('queu', this.queue);
          this.tryingRefreshing = false;
          this.refreshTokenSubject.next(token);
          this.cookieService.set('token', token.response.access_token, { path: '/', sameSite: 'Lax' });
          this.cookieService.set('refresh_token', token.response.refresh_token, { path: '/', sameSite: 'Lax' });
          // this.queue.map((data) => {
          //   return this.intercept(data, next);
          // });
          // return next.handle(this.addAuthorization(request, token.response.access_token));
          return this.intercept(request, next);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          return next.handle(this.addAuthorization(request, jwt));
        })
      );
    }
  }

  private handle401Error(error) {
    this.cookieService.deleteAll();
    this.authService.resetAuthentication();
    if (window.location.href.includes('app_preview')) {
      this.router.navigate(['/auth/application_login'], {
        queryParams: { slug: getURLParameter('link') },
      });
    } else {
      this.router.navigateByUrl('/auth/login');
    }
    return throwError(() => error.error);
  }

  private handle500Error(error) {
    this.store.dispatch(SetIsError500Encountered({ isError500Encountered: true }));
    return throwError(() => error.error);
  }

  addAuthorization(httpRequest: HttpRequest<any>, token: string) {
    return (httpRequest = httpRequest.clone({
      setHeaders: {
        Authorization: httpRequest.url.includes('refresh-token') ? this.cookieService.get('refresh_token') : token,
      },
    }));
  }
}
