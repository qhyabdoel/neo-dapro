import { routerReducer } from '@ngrx/router-store';
import { ActionReducer, ActionReducerMap, MetaReducer, INIT, UPDATE } from '@ngrx/store';
import { AppState } from '../states';
import { authReducer } from './auth/auth.reducers';
import { authenticationReducer } from './authentication.reducer';
import { permissionsReducer } from './auth/permission.reducers';
import { rolesReducer } from './auth/role.reducers';
import { usersReducer } from './auth/user.reducers';
import { dataProcessingReducer } from './pds/dataprocessing.reducer';
import { dataVisualizationReducer } from './pds/datavisualization/datavisualization.reducer';
import { queuesReducer } from './queues.reducer';
import { generalReducer } from './general.reducer';

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  authentication: authenticationReducer,
  permissions: permissionsReducer,
  roles: rolesReducer,
  users: usersReducer,
  router: routerReducer,
  dataprocessing: dataProcessingReducer,
  datavisualization: dataVisualizationReducer,
  queues: queuesReducer,
  general: generalReducer,
};

export function storageMetaReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return function (state, action) {
    if (action.type === INIT || action.type === UPDATE) {
      const storageValue = localStorage.getItem('__paques_root__');
      if (storageValue) {
        try {
          return JSON.parse(storageValue);
        } catch {
          localStorage.removeItem('__paques_root__');
        }
      }
    }

    const nextState = reducer(state, action);
    localStorage.setItem('__paques_root__', JSON.stringify(nextState));
    return nextState;
  };
}

export const metaReducers: MetaReducer<AppState>[] = [storageMetaReducer];
