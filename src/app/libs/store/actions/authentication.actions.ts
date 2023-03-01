import { createAction, props } from '@ngrx/store';
import { User } from 'src/app/libs/models';

export const Login = createAction('[Login] Action', props<{ userCredential: UserCredential }>());

export const LoginSucceed = createAction(
  '[LoginSucceed] Action',
  props<{ user: User; authToken: string; refreshToken: string }>()
);

export const LoginSucceedRedirect = createAction('[LoginSucceedRedirect] Action');

// export const LoginFailed = createAction('[LoginFailed] Action');
export const LoginFailed = createAction('[LoginFailed] Action', props<{ error: any }>());

export const Logout = createAction('[Logout] Action');

export const LogoutSucceed = createAction('[LogoutSucceed] Action');

export const LogoutSucceedRedirect = createAction('[LogoutSucceedRedirect] Action');

export const LogoutFailed = createAction('[LogoutFailed] Action');

export const RefreshToken = createAction('[RefreshToken] Action', props<{ refreshToken: string }>());

export const RefreshTokenSucceed = createAction(
  '[RefreshTokenSucceed] Action',
  props<{ user: User; authToken: string; refreshToken: string }>()
);

export const RefreshTokenFailed = createAction('[RefreshTokenFailed] Action');

export const ResetAuthentication = createAction('[ResetAuthentication] Action');

export const ResetAuthTokenRefreshStatus = createAction('[ResetAuthTokenRefreshStatus] Action');

// CAPTCHA
export const Captcha = createAction('[Captcha] Action');

export const CaptchaSucceed = createAction('[CaptchaSucceed] Action', props<any>());
