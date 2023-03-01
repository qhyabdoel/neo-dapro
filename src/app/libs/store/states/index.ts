import { EntityState } from '@ngrx/entity';
import { Params } from '@angular/router';

import { User, Permission, QueryParamsModel, Role } from 'src/app/libs/models';

import { AuthenticationState } from './authentication.state';
import { DataProcessingState } from './dataprocessing.state';
import { QueuesState } from './queues.state';
import { UsersState } from './user.state';
import { DataVisualizationState } from './datavisualization.state';
import { GeneralState } from './general.states';

export { AuthenticationState, DataProcessingState, QueuesState, UsersState };

export interface AuthState {
  loggedIn: boolean;
  user: User;
  authToken: string;
  refreshToken: string;
  isUserLoaded: boolean;
}

export interface PermissionsState extends EntityState<Permission> {
  _isAllPermissionsLoaded: boolean;
}

export interface RolesState extends EntityState<Role> {
  isAllRolesLoaded: boolean;
  queryRowsCount: number;
  queryResult: Role[];
  lastCreatedRoleId: number;
  listLoading: boolean;
  actionsloading: boolean;
  lastQuery: QueryParamsModel;
  showInitWaitingMessage: boolean;
}

export interface RouterState {
  url: string;
  params: Params;
  queryParams?: Params;
  data?: any;
  area?: 'cms' | 'lms' | 'admin' | 'support';
}

export interface AppState {
  auth: AuthState;
  authentication: AuthenticationState;
  permissions: PermissionsState;
  roles: RolesState;
  users: UsersState;
  router: RouterState;
  dataprocessing: DataProcessingState;
  datavisualization: DataVisualizationState;
  queues: QueuesState;
  general: GeneralState;
}
