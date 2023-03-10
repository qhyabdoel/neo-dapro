import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { RoleActions, RoleActionTypes } from 'src/app/libs/store/actions/auth/role.actions';
import { QueryParamsModel, Role } from 'src/app/libs/models';
import { RolesState } from '../../states';

export const adapter: EntityAdapter<Role> = createEntityAdapter<Role>();

export const initialRolesState: RolesState = adapter.getInitialState({
    isAllRolesLoaded: false,
    queryRowsCount: 0,
    queryResult: [],
    lastCreatedRoleId: undefined,
    listLoading: false,
    actionsloading: false,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function rolesReducer(state = initialRolesState, action: RoleActions): RolesState {
    switch  (action.type) {
        case RoleActionTypes.RolesPageToggleLoading: return {
                ...state, listLoading: action.payload.isLoading, lastCreatedRoleId: undefined
        };
        case RoleActionTypes.RolesActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case RoleActionTypes.RoleOnServerCreated: return {
            ...state
        };
        case RoleActionTypes.RoleCreated: return adapter.addOne(action.payload.role, {
            ...state, lastCreatedRoleId: action.payload.role.id
        });
        case RoleActionTypes.RoleUpdated: return adapter.updateOne(action.payload.partialrole, state);
        case RoleActionTypes.RoleDeleted: return adapter.removeOne(action.payload.id, state);
        case RoleActionTypes.AllRolesLoaded: return adapter.addMany(action.payload.roles, {
            ...state, isAllRolesLoaded: true
        });
        case RoleActionTypes.RolesPageCancelled: return {
            ...state, listLoading: false, queryRowsCount: 0, queryResult: [], lastQuery: new QueryParamsModel({})
        };
        case RoleActionTypes.RolesPageLoaded: return adapter.addMany(action.payload.roles, {
            ...initialRolesState,
            listLoading: false,
            queryRowsCount: action.payload.totalCount,
            queryResult: action.payload.roles,
            lastQuery: action.payload.page,
            showInitWaitingMessage: false
        });
        default: return state;
    }
}

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
