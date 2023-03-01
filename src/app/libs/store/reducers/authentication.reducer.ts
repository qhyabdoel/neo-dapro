import { createReducer, on } from '@ngrx/store';

import {
  CaptchaSucceed,
  LoginFailed,
  LoginSucceed,
  Logout,
  LogoutSucceed,
  RefreshToken,
  RefreshTokenFailed,
  RefreshTokenSucceed,
  ResetAuthentication,
  ResetAuthTokenRefreshStatus,
} from 'src/app/libs/store/actions/authentication.actions';
import { AuthenticationState, AuthTokenRefreshStatus } from 'src/app/libs/store/states/authentication.state';

export const initialAuthenticationState: AuthenticationState = {
  loggedIn: false,
  authToken: '',
  user: null,
  refreshToken: '',
  isUserLoaded: false,
  authTokenRefreshStatus: AuthTokenRefreshStatus.IDLE,
  captcha: null,
  loginFailed: null,
};

export const authenticationReducer = createReducer(
  initialAuthenticationState,
  on(LoginSucceed, (state, prop) => {
    return {
      ...state,
      loggedIn: true,
      authToken: prop.authToken,
      user: prop.user,
      refreshToken: prop.refreshToken,
    };
  }),
  on(RefreshToken, (state) => ({
    ...state,
    authTokenRefreshStatus: AuthTokenRefreshStatus.IN_PROGRESS,
  })),
  on(RefreshTokenSucceed, (state, prop) => ({
    ...state,
    loggedIn: true,
    authToken: prop.authToken,
    user: prop.user,
    refreshToken: prop.refreshToken,
    authTokenRefreshStatus: AuthTokenRefreshStatus.DONE,
  })),
  on(RefreshTokenFailed, (state) => ({
    ...state,
    authTokenRefreshStatus: AuthTokenRefreshStatus.DONE,
  })),
  on(Logout, (state) => ({
    ...state,
    authTokenRefreshStatus: AuthTokenRefreshStatus.IDLE,
  })),
  on(LogoutSucceed, (state) => ({
    ...state,
    loggedIn: false,
    authToken: '',
    refreshToken: '',
    user: undefined,
  })),
  on(ResetAuthentication, (state) => ({
    ...state,
    loggedIn: false,
    authToken: '',
    user: null,
    refreshToken: '',
  })),
  on(ResetAuthTokenRefreshStatus, (state) => {
    // console.log('Authn Reducer - ResetAuthTokenRefreshStatus');
    return {
      ...state,
      authTokenRefreshStatus: AuthTokenRefreshStatus.IDLE,
    };
  }),
  on(CaptchaSucceed, (state, result) => {
    return {
      ...state,
      captcha: result,
    };
  }),
  on(LoginFailed, (state, result) => {
    return {
      ...state,
      loginFailed: result.error,
    };
  })
);
