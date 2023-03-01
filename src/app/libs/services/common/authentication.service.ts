import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import { rest_api } from 'src/app/libs/configs/restapi';
import { AppState } from 'src/app/libs/store/states';
import { ResetAuthentication } from 'src/app/libs/store/actions/authentication.actions';

@Injectable()
export class AuthenticationService {
  constructor(private store: Store<AppState>, private apiService: ApiService, private http: HttpClient) {}

  login(userCredential: UserCredential): Observable<any> {
    return this.apiService.post(rest_api.AUTH_LOGIN, userCredential);
  }

  logout(): Observable<any> {
    console.log('Service - Logout');
    return this.apiService.post(rest_api.AUTH_LOGOUT);
  }

  // refreshToken(): Observable<any> {
  //   return this.apiService.post(
  //     rest_api.REFRESH_TOKEN
  //     // null,
  //     // new HttpHeaders({
  //     //   Authorization: refreshToken,
  //     // })
  //   );
  // }

  refreshToken(token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: token,
      }),
    };
    return this.http.post<any[]>(rest_api.REFRESH_TOKEN, {}, httpOptions);
  }

  getCaptcha(): Observable<any> {
    return this.apiService.get(rest_api.CAPTCHA);
  }

  resetAuthentication() {
    this.store.dispatch(ResetAuthentication());
  }
}
