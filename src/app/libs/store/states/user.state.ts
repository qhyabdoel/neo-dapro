import { EntityState } from '@ngrx/entity';
import { User, QueryParamsModel } from 'src/app/libs/models';

export interface UsersState extends EntityState<User> {
  listLoading: boolean;
  actionsloading: boolean;
  totalCount: number;
  lastCreatedUserId: number;
  lastQuery: QueryParamsModel;
  showInitWaitingMessage: boolean;
}
