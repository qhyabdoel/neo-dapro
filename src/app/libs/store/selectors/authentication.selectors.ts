import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthenticationState } from '../states/authentication.state';

const authenticationSelector = createFeatureSelector<AuthenticationState>('authentication');

export const loggedInSelector = createSelector(authenticationSelector, (authentication) => authentication.loggedIn);

export const authTokenSelector = createSelector(authenticationSelector, (authentication) => authentication.authToken);

export const refreshTokenSelector = createSelector(
  authenticationSelector,
  (authentication) => authentication.refreshToken
);

export const UserSelector = createSelector(authenticationSelector, (authentication) => authentication.user);

export const authTokenRefreshStatusSelector = createSelector(
  authenticationSelector,
  (authentication) => authentication.authTokenRefreshStatus
);

export const captchaSelector = createSelector(authenticationSelector, (authentication) => authentication.captcha);
export const loginFailedSelector = createSelector(
  authenticationSelector,
  (authentication) => authentication.loginFailed
);
