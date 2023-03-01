import { User } from '../../models';
export enum AuthTokenRefreshStatus {
  IDLE,
  IN_PROGRESS,
  DONE,
}

export interface AuthenticationState {
  loggedIn: boolean;
  user: User;
  authToken: string;
  refreshToken: string;
  isUserLoaded: boolean;
  authTokenRefreshStatus: AuthTokenRefreshStatus;
  captcha: CaptchaInteface;
  loginFailed: any;
}
