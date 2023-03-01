import { Action } from '@ngrx/store';
import { User } from 'src/app/libs/models';

export enum AuthActionTypes {
  Login = '[Login] Action',
  LoginSuccess = '[LoginSuccess] Action',
  LoginFailed = '[LoginFailed] Action',
  Logout = '[Logout] Action',
  LogoutSucceed = '[LogoutSucceed] Action',
  LogoutFailed = '[LogoutFailed] Action',
  LogoutApp = '[LogoutApp] Action',
  Register = '[Register] Action',
  UserRequested = '[Request User] Action',
  UserLoaded = '[Load User] Auth API',
  RefreshToken = '[RefreshToken] Action',
  RefreshTokenSuccess = '[RefreshTokenSuccess] Action',
  RefreshTokenFailed = '[RefreshTokenFailed] Action',
}

export class Login implements Action {
  readonly type = AuthActionTypes.Login;
  constructor(public payload: { userCredential: UserCredential }) {}
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.LoginSuccess;
  constructor(public payload: { user: User; authToken: string; refreshToken: string }) {}
}

export class LoginFailed implements Action {
  readonly type = AuthActionTypes.LoginFailed;
  constructor(public payload: { error: any }) {}
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
  constructor(public payload: { authToken: string }) {}
}

export class LogoutSucceed implements Action {
  readonly type = AuthActionTypes.LogoutSucceed;
}

export class LogoutFailed implements Action {
  readonly type = AuthActionTypes.LogoutFailed;
}

export class LogoutApp implements Action {
  readonly type = AuthActionTypes.LogoutApp;
}

export class Register implements Action {
  readonly type = AuthActionTypes.Register;
  constructor(public payload: { authToken: string }) {}
}

export class UserLoaded implements Action {
  readonly type = AuthActionTypes.UserLoaded;
  constructor(public payload: { user: User }) {}
}

// REFRESH TOKEN
export class RefreshToken implements Action {
  readonly type = AuthActionTypes.RefreshToken;
  constructor(public payload: {}) {}
}

export class RefreshTokenSuccess implements Action {
  readonly type = AuthActionTypes.RefreshTokenSuccess;
  constructor(public payload: { user: User; authToken: string; refreshToken: string }) {}
}

export class RefreshTokenFailed implements Action {
  readonly type = AuthActionTypes.RefreshTokenFailed;
}
// REFRESH TOKEN
export type AuthActions =
  | Login
  | LoginSuccess
  | LoginFailed
  | Logout
  | LogoutSucceed
  | LogoutFailed
  | LogoutApp
  | Register
  | UserLoaded
  | RefreshToken
  | RefreshTokenSuccess
  | RefreshTokenFailed;
