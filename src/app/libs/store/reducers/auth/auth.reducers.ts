import { AuthActions, AuthActionTypes } from 'src/app/libs/store/actions/auth/auth.actions';
import { User } from 'src/app/libs/models';
import { AuthState } from '../../states';

export const initialAuthState: AuthState = {
  loggedIn: false,
  authToken: undefined,
  user: undefined,
  refreshToken: undefined,
  isUserLoaded: false
};

export function authReducer(state = initialAuthState, action: AuthActions): AuthState {
  switch (action.type) {
    case AuthActionTypes.LoginSuccess: {
      return {
        ...state,
        loggedIn: true,
        authToken: action.payload.authToken,
        user: action.payload.user,
        refreshToken: action.payload.refreshToken,
        isUserLoaded: false
      };
    }

    case AuthActionTypes.Register: {
      const _token: string = action.payload.authToken;
      return {
        ...state,
        loggedIn: true,
        // authToken: _token,
        user: undefined,
        isUserLoaded: false
      };
    }

    case AuthActionTypes.LogoutSucceed:
      return {
        ...state,
        loggedIn: false,
        authToken: '',
        refreshToken: '',
        user: undefined,
        isUserLoaded: false,
      };

    case AuthActionTypes.UserLoaded: {
      const _user: User = action.payload.user;
      return {
        ...state,
        user: _user,
        isUserLoaded: true
      };
    }

    // REFRESH TOKEN REDUCER
    case AuthActionTypes.RefreshTokenSuccess: {
      return {
        ...state,
        loggedIn: true,
        authToken: action.payload.authToken,
        user: action.payload.user,
        refreshToken: action.payload.refreshToken,
        isUserLoaded: false
      };
    }
    // REFRESH TOKEN REDUCER

    default:
      return state;
  }
}
