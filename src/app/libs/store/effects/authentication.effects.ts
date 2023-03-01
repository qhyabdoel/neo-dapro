import { Injectable } from '@angular/core';
import { catchError, mergeMap, map, switchMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { AuthService, AuthenticationService } from 'src/app/libs/services';
import { User } from 'src/app/libs/models';
import {
  Login,
  LoginSucceed,
  LoginSucceedRedirect,
  LoginFailed,
  RefreshToken,
  RefreshTokenSucceed,
  RefreshTokenFailed,
  Logout,
  LogoutSucceed,
  LogoutFailed,
  LogoutSucceedRedirect,
  Captcha,
  CaptchaSucceed,
  ResetAuthTokenRefreshStatus,
} from '../actions/authentication.actions';
import { Router } from '@angular/router';
import { ResetWorkspace } from '../actions/pds/dataprocessing.actions';
import { getURLParameter } from '../../helpers/data-visualization-helper';

@Injectable()
export class AuthenticationEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Login),
      switchMap((prop: any) =>
        this.authService.login(prop.userCredential).pipe(
          map((result: ApiResult) => {
            const authUser = new User();
            authUser.transform(result.response.profile);
            return LoginSucceed({
              user: authUser,
              authToken: result.response.access_token,
              refreshToken: result.response.refresh_token,
            });
          }),
          catchError((error: any) => of(LoginFailed({ error: error })))
        )
      )
    )
  );

  loginSucceed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginSucceed),
      map(() => ResetWorkspace({ needToastr: false }))
    )
  );

  loginSucceedRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LoginSucceedRedirect),
        tap(() => {
          this.router.navigate(['/home']);
        })
      ),
    { dispatch: false }
  );

  // refreshToken$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(RefreshToken),
  //     mergeMap((prop: any) => this.authService.refreshToken()),
  //     switchMap((result: ApiResult) => {
  //       if (result.status === 'success') {
  //         const resp: RefreshTokenResponse = result.response;
  //         const authUser = new User();
  //         authUser.transform(resp.profile);
  //         return [
  //           RefreshTokenSucceed({
  //             user: authUser,
  //             authToken: resp.access_token,
  //             refreshToken: resp.refresh_token,
  //           }),
  //           ResetAuthTokenRefreshStatus(),
  //         ];
  //       }

  //       return [RefreshTokenFailed(), ResetAuthTokenRefreshStatus()];
  //     })
  //   )
  // );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Logout),
      mergeMap(() => {
        // console.log('Effects - Logout');
        return this.authService.logout().pipe(
          catchError(() =>
            of({
              status: 'success',
            })
          )
        );
      }),
      switchMap((result: ApiResult) => {
        if (result.status === 'success') {
          return [
            LogoutSucceed(),
            // LogoutSucceedRedirect()
          ];
        }

        return [LogoutFailed()];
      })
    )
  );

  logoutSucceedRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LogoutSucceedRedirect),
        tap(() => this.handleLogoutCondition())
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private auth: AuthService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  handleLogoutCondition = () => {
    if (window.location.href.includes('app_preview')) {
      this.router.navigate(['/auth/application_login'], {
        queryParams: { slug: getURLParameter('link') },
      });
    } else {
      return this.router.navigateByUrl('/auth/login');
    }
  };

  captcha$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Captcha),
      mergeMap(() => this.authService.getCaptcha()),
      switchMap((result: ApiResult) => {
        if (result.status === 'success') {
          // return [CaptchaSucceed(result.response), LoginSucceedRedirect()];
          return [CaptchaSucceed(result.response)];
        }

        return [LoginFailed({ error: result })];
      })
    )
  );
}
