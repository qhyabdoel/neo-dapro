import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  ActivatedRoute,
  RouterStateSnapshot,
  NavigationEnd,
} from "@angular/router";
import { Observable } from "rxjs";

import { ApiService } from "src/app/libs/services";
import { environment } from "src/environments/environment";

@Injectable()
export class RouteGuard implements CanActivate {

  constructor( private router: Router, private _apicall: ApiService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    let url = 'assets/data/config/'+ environment.type +'.json';
    return this._apicall.get(url)
      .toPromise()
      .then((data)=>{
        let isAllow = data.user_management;
        if (!isAllow) {
          this.router.navigate(['/']);
        }
        return isAllow;
      }).catch((error)=>{
        this.router.navigate(['/']);
        return false;
      }); 
  }
};