// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// State
import { PermissionsState } from 'src/app/libs/store/states';
import * as fromPermissions from 'src/app/libs/store/reducers/auth/permission.reducers';

export const selectPermissionsState = createFeatureSelector<PermissionsState>('permissions');

export const selectPermissionById = (permissionId: number) => createSelector(
    selectPermissionsState,
    ps => ps.entities[permissionId]
);

export const selectAllPermissions = createSelector(
    selectPermissionsState,
    fromPermissions.selectAll
);

export const selectAllPermissionsIds = createSelector(
    selectPermissionsState,
    fromPermissions.selectIds
);

export const allPermissionsLoaded = createSelector(
    selectPermissionsState,
    ps  => ps._isAllPermissionsLoaded
);
