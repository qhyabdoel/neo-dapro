import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { tap, map } from "rxjs/operators";
import { select, Store } from "@ngrx/store";
import { find } from "lodash";

import { AppState } from "src/app/libs/store/states";
import { currentUserPermissions } from "src/app/libs/store/selectors/auth/auth.selectors";
import { Permission } from "src/app/libs/models/permission.model";

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const moduleName = route.data.moduleName as string;
    if (!moduleName) {
      return of(false);
    }

    return this.store.pipe(
      select(currentUserPermissions),
      map((permissions: Permission[]) => {
        const _perm = find(permissions, (elem: Permission) => {
          return (
            elem.title.toLocaleLowerCase() === moduleName.toLocaleLowerCase()
          );
        });
        return _perm ? true : false;
      }),
      tap((hasAccess) => {
        if (!hasAccess) {
          this.router.navigateByUrl("/error/403");
        }
      })
    );
  }
}
