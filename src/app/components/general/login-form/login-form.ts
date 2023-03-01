import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { ApiService, AuthNoticeService, JsonService, LayoutUtilsService } from 'src/app/libs/services';
import { Captcha } from 'src/app/libs/store/actions/authentication.actions';
import { captchaSelector } from 'src/app/libs/store/selectors/authentication.selectors';
import { AppState } from 'src/app/libs/store/states';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'login-form',
  templateUrl: './login-form.html',
})
export class LoginFormComponent implements OnInit {
  @Input() public isApplication;
  @Output() submitAction: EventEmitter<any> = new EventEmitter<any>();
  loginForm: FormGroup;
  changePasswordForm: FormGroup;
  fieldTextType: boolean;
  enableForgotPassword: boolean = false;
  staticAlertClosed = true;
  alertMessage = 'Wrong email or password';
  captchaBase64;
  captchaId: string;

  DEMO_PARAMS = {
    EMAIL: '',
    PASSWORD: '',
    CAPTCHA: '',
  };
  constructor(
    private layoutUtilsService: LayoutUtilsService,
    private service: ApiService,
    private store: Store<AppState>,
    private jsonService: JsonService,
    private authNoticeService: AuthNoticeService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef
  ) {
    this.store
      .select(captchaSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          const url = 'data:image;base64,' + result.captcha_blob;
          this.captchaBase64 = this.sanitizer.bypassSecurityTrustUrl(url);
          this.captchaId = result.captcha_id;
          // this.changeDetector.detectChanges();
        }
      });
  }

  ngOnInit() {
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.enableForgotPassword = data.forgot_password;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });

    this.initLoginForm();
    // this.setCaptcha();
  }

  initLoginForm() {
    // demo message to show
    if (!this.authNoticeService.onNoticeChanged$.getValue()) {
      const initialNotice = `Use account
			<strong>${this.DEMO_PARAMS.EMAIL}</strong> and password
			<strong>${this.DEMO_PARAMS.PASSWORD}</strong> to continue.`;
      this.authNoticeService.setNotice(initialNotice, 'info');
    }

    this.loginForm = this.fb.group({
      email: [
        this.DEMO_PARAMS.EMAIL,
        Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(200)]),
      ],
      password: [this.DEMO_PARAMS.PASSWORD, Validators.compose([Validators.required, Validators.minLength(3)])],
      captcha: [this.DEMO_PARAMS.CAPTCHA, Validators.compose([Validators.required, Validators.minLength(1)])],
    });

    this.changePasswordForm = this.fb.group({
      oldPassword: [
        this.DEMO_PARAMS.EMAIL,
        Validators.compose([Validators.required, Validators.email, Validators.minLength(3)]),
      ],
      newPassword: [
        this.DEMO_PARAMS.PASSWORD,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/), //(/^[A-Za-z0-9_@.#$=!%^)(\]:\*;\?\/\,}{'\|<>\[&\+-]*$/), //(/^[a-zA-Z0-9!@#$%^&*()]+$/), // /^(?=.{10,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()])
          Validators.minLength(3),
        ]),
      ],
      confirmPassword: [this.DEMO_PARAMS.PASSWORD, Validators.compose([Validators.required, Validators.minLength(3)])],
    });
  }
  submit() {
    const controls = this.loginForm.controls;
    if (!controls.email.value.includes('@')) {
      if (this.loginForm.invalid && !controls.email.value.includes('paques')) {
        Object.keys(controls).forEach((controlName) => controls[controlName].markAsTouched());
        return;
      }
    }
    const userCredential: UserCredential = {
      email: controls.email.value,
      password: controls.password.value,
      // captcha
      captcha: controls.captcha.value,
      captcha_id: this.captchaId,
    };

    this.submitAction.emit(userCredential);
  }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
  isControlHasError(controlName: string, validationType: string): boolean {
    const control = this.loginForm.controls[controlName];
    if (!control) {
      return false;
    }
    const result = control.hasError(validationType) && (control.dirty || control.touched);
    return result;
  }
  forgotPassword() {
    if (!this.enableForgotPassword) {
      this.staticAlertClosed = false;
      this.alertMessage = 'Please, contact administrator!';
      return;
    }
    const dialogRef = this.layoutUtilsService.requestResetPasswordElement('Request Reset Passwords', 'send mail ...');
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      let url = '/api/password/reset';
      this.service.postApi(url, res, true);
    });
  }

  // async setCaptcha() {
  //   this.store.dispatch(Captcha());
  // }
}
