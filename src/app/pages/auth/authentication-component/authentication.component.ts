import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import {
  ApiService,
  ApplicationService,
  AuthNoticeService,
  HeaderConfigService,
  JsonService,
  LayoutConfigService,
  LayoutUtilsService,
} from 'src/app/libs/services';
import { AppState } from 'src/app/libs/store/states';
import { Application, User } from 'src/app/libs/models';
import { environment } from 'src/environments/environment';
import { Captcha, Login, LoginFailed, LoginSucceedRedirect } from 'src/app/libs/store/actions/authentication.actions';
import {
  authTokenSelector,
  loginFailedSelector,
  refreshTokenSelector,
  UserSelector,
} from 'src/app/libs/store/selectors/authentication.selectors';

import * as objectPath from 'object-path';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { setApplicationById } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
@Component({
  selector: 'authentication-component',
  templateUrl: './authentication.component.html',
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  changePasswordForm: FormGroup;
  unsubscribe: Subject<any>;
  loading = false;
  staticAlertClosed = true;
  isPasswordMatchWithOld = false;
  isPasswordComfirmPasswordNotMatch = false;
  enableForgotPassword = false;
  fieldTextType: boolean;
  alertMessage = 'Wrong email or password';
  alertType = 'danger';
  application: Application;
  isPageActive: string;
  // for login
  headerBrandLogo: string;
  classHeaderBrandLogo: string;
  background: any;
  isApplication: boolean = false;
  // for login
  constructor(
    private router: Router,
    private authNoticeService: AuthNoticeService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private headerConfigService: HeaderConfigService,
    private _apicall: ApiService,
    private store: Store<AppState>,
    private modalService: NgbModal,
    private jsonService: JsonService,
    private applicationService: ApplicationService,
    private layoutConfigService: LayoutConfigService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService
  ) {
    this.unsubscribe = new Subject();
    this.store
      .select(authTokenSelector)
      .pipe()
      .subscribe((res) => {
        this.loading = false;
        if (res && this.isPageActive === 'application') {
          this.cookieService.set('token', res, { path: '/', sameSite: 'Lax' });
          this.checkApplicationUser();
        } else if (this.isPageActive === 'login') {
          this.cookieService.set('token', res, { path: '/', sameSite: 'Lax' });
          this.store.dispatch(LoginSucceedRedirect());
        }
      });
    this.store
      .select(refreshTokenSelector)
      .pipe()
      .subscribe((res) => {
        this.loading = false;
        this.cookieService.set('refresh_token', res, { path: '/', sameSite: 'Lax' });
      });
    this.store
      .select(UserSelector)
      .pipe()
      .subscribe((res) => {
        if (res) {
          localStorage.setItem('user', JSON.stringify(res));
        }
      });
    this.store
      .select(loginFailedSelector)
      .pipe()
      .subscribe((res) => {
        if (res) {
          this.loading = false;
          this.openSnackBar(res.message);
        }
      });
  }

  ngOnInit() {
    this.headerConfigService.setHeader(false);
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.enableForgotPassword = data.forgot_password;
      })
      .catch((error) => {});
    this.setCaptcha();
    this.initialPage();
  }

  initialApplicationLogin = () => {
    this.activatedRoute.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe((params: any) => {
      const { slug } = params;
      this.applicationService
        .getPublicApplicationBySlug(slug)
        .pipe(
          takeUntil(this.unsubscribe),
          tap((v) => {
            document.body.style.backgroundImage = 'url(' + v.options.background_image + ')';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundPositionX = '0';
            document.body.style.backgroundPositionY = '100%';
          })
        )
        .subscribe((value) => {
          this.application = value;
          this.cdr.detectChanges();
        });
    });
  };

  initialPage = () => {
    const config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    if (skin == 'light') {
      this.background = 'theme-blush';
      this.headerBrandLogo = objectPath.get(config, 'login.logoLight');
      this.classHeaderBrandLogo = objectPath.get(config, 'login.classTextBrandLight');
    } else {
      this.background = 'theme-dark';
      this.headerBrandLogo = objectPath.get(config, 'login.logoDark');
      this.classHeaderBrandLogo = objectPath.get(config, 'login.classTextBrandDark');
    }
    if (window.location.href.includes('application_login')) {
      this.isPageActive = 'application';
      this.isApplication = true;
      this.initialApplicationLogin();
      return 'app';
    } else if (window.location.href.includes('auth/login')) {
      this.isPageActive = 'login';
      this.isApplication = false;
    }
  };

  ngOnDestroy() {
    document.body.style.backgroundImage = null;
    document.body.style.backgroundSize = null;
    document.body.style.backgroundAttachment = null;
    document.body.style.backgroundPositionX = null;
    document.body.style.backgroundPositionY = null;
    this.headerConfigService.setHeader(true);
    this.authNoticeService.setNotice(null);
    this.unsubscribe.complete();
    this.loading = false;
  }

  openModalTemplate(content) {
    const modalRef = this.modalService.open(content, {
      centered: true,
    });
  }

  closeAlert() {
    this.staticAlertClosed = true;
  }

  submitAction = async (userCredential) => {
    this.loading = true;
    this.store.dispatch(Login({ userCredential }));
    this.store.dispatch(LoginFailed({ error: null }));
    this.loading = false;
  };

  openSnackBar(message: string) {
    this._snackBar.open(message, 'x', {
      duration: 3000,
    });
  }
  checkApplicationUser = () => {
    if (this.application) {
      const permissionCheckURL = '/api/applications/' + this.application.slug;
      this._apicall.getApi(permissionCheckURL).then((res) => {
        if (res.status) {
          this.store.dispatch(setApplicationById({ item: res.result.response }));
          this.router.navigate(['/pds/app_preview'], {
            queryParams: { link: this.application.slug },
          });
        } else {
          this.openSnackBar(
            res.result.message ||
              "You don't have permission to access this application, please contact the administrator"
          );
        }
      });
    }
  };
  setCaptcha() {
    this.store.dispatch(Captcha());
  }

  changePassword() {
    const dialogRef = this.layoutUtilsService.changePasswordElement('Changes Password', 'save changes ...');
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      console.log(res);
      let url = 'api/password/change';
      await this._apicall.postApi(url, res, true);
    });
  }
}
