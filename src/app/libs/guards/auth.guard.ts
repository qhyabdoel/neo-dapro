import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { of, Observable, lastValueFrom, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/libs/store/states';
import { loggedInSelector } from 'src/app/libs/store/selectors/authentication.selectors';
import { ApiService } from '../services';
import { HOST } from '../consts';

@Injectable()
export class AuthGuard implements CanActivate {
  version: any;
  currentUrl: any;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private service: ApiService,
    private activeRoute: ActivatedRoute
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let check =
      window.location.href.includes('application_login') ||
      window.location.href.includes('app_preview') ||
      window.location.href.includes('pdsshare');

    let isLoggedIn = await lastValueFrom(this.store.select(loggedInSelector).pipe(take(1)));
    // this.checkVersion(route, state);
    // console.log('check', check);
    // console.log('this.isLoggedIn', isLoggedIn);

    if (!isLoggedIn && !check) {
      this.router.navigateByUrl('/auth/login');
    }

    if (check && !isLoggedIn && window.location.href.includes('application_login')) {
      isLoggedIn = true;
      let url = window.location.hash.substring(1);
      this.router.navigateByUrl(url);
    }

    if (check && window.location.href.includes('app_preview')) {
      isLoggedIn = true;
      window.location.replace(window.location.href);
    }

    return isLoggedIn;
  }

  checkVersion(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // cek apakah dia punya session token & version external_auth true
    let result = {
      version: 6,
      external_auth: false,
      auth_check_url: HOST.HOST_AUTH,
    };

    this.activeRoute.queryParams.subscribe((params) => {
      this.service.get('/api/version').subscribe(
        (result) => {
          this.version = result;
          localStorage.setItem('version', JSON.stringify(this.version));
          let url = window.location.host;
          if (!window.location.origin) {
            url =
              window.location.protocol +
              '//' +
              window.location.hostname +
              (window.location.port ? ':' + window.location.port : '');
          }

          // cek has access_token
          let access_token = localStorage.getItem('access_token');
          if (access_token == undefined || access_token == null) {
            if (
              this.version.hasOwnProperty('external_auth') &&
              this.version.external_auth == true &&
              params.session_token == undefined
            ) {
              // this.isToken = false;
              console.log('backlink', HOST.HOST_LOCAL, HOST.HOSTNAME);
              if (url == HOST.HOST_LOCAL) url = HOST.HOSTNAME;
              window.location.href = `${this.version.auth_check_url}?backlink=${url}`;
            } else if (
              this.version.hasOwnProperty('external_auth') &&
              this.version.external_auth == true &&
              params.session_token != undefined
            ) {
              // this.isToken = true;
              // Promise.resolve(this.checkPCCAccess(params.session_token, url));
            } else {
              // if (!this.gotoApplicationLogin(route, state)) {
              //   return this.router.navigate(["/auth/login"]);
              // }
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }
}
