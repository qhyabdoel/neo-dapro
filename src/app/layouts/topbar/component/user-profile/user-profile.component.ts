import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { first, Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { Logout, LogoutSucceedRedirect } from 'src/app/libs/store/actions/authentication.actions';
import {
  UserSelector,
  authTokenSelector,
  loggedInSelector,
} from 'src/app/libs/store/selectors/authentication.selectors';
import { User } from 'src/app/libs/models';
import { ApiService, LayoutUtilsService, TranslationService } from 'src/app/libs/services';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { setUrlApplicationLogin } from 'src/app/libs/helpers/data-visualization-helper';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @Input() isApplicattion;
  @Input() redirect;
  @ViewChild('toggleButton3') toggleButton: ElementRef;
  @ViewChild('menu3') menu: ElementRef;
  isOpen: boolean = false;
  imagePlaceholder = './assets/media/users/default.jpg';
  enableChangePassword: boolean = true;
  dropDownDisplayed: boolean = false;

  private userObs$: Observable<User>;
  private userObsSub: Subscription;
  public user: User;

  private authTokenObs$: Observable<string>;
  private authTokenObsSub: Subscription;
  private authToken: string = '';
  url: string = '';
  open: any;

  @Input() avatar = true;
  @Input() greeting = true;
  @Input() badge: boolean;
  @Input() icon: boolean;

  constructor(
    public cdRef: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    private store: Store<AppState>,
    private _apicall: ApiService,
    private translationService: TranslationService,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.userObs$ = this.store.select(UserSelector);
    this.authTokenObs$ = this.store.select(authTokenSelector);

    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (!this.toggleButton.nativeElement.contains(e.target) && !this.menu.nativeElement.contains(e.target)) {
        this.isOpen = false;
        this.cdRef.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.checkIsApplication();
    this.userObsSub = this.userObs$.pipe(first()).subscribe((user) => {
      this.user = user;
    });
    this.authTokenObsSub = this.authTokenObs$.pipe(first()).subscribe((authToken) => {
      this.authToken = authToken;
    });

    let url = 'assets/data/config/' + environment.type + '.json';
    this._apicall
      .get(url)
      .toPromise()
      .then((data) => {
        this.enableChangePassword = data.change_password;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }

  checkIsApplication = () => {
    let check = window.location.href.includes('app_preview');
    if (check && this.redirect) {
      this.isApplicattion = true;
      this.url = setUrlApplicationLogin(this.redirect);
    }
  };

  ngOnDestroy(): void {
    this.userObsSub.unsubscribe();
    this.authTokenObsSub.unsubscribe();
  }

  logout() {
    this.handleDialog();
    this.store.dispatch(Logout());
    this.store.select(loggedInSelector).subscribe((loggedIn) => {
      if (!loggedIn) {
        if (this.isApplicattion) {
          this.router.navigateByUrl(this.url);
        } else {
          this.store.dispatch(LogoutSucceedRedirect());
        }
      }
    });
  }

  async changePassword() {
    this.handleDialog();
    const dialogRef = this.layoutUtilsService.changePasswordElement('Changes Passwords', 'save changes ...');
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      console.log(res);
      let param = {
        password: res.newPassword,
        password_confirmation: res.comfirmPassword,
      };
      let url = 'api/profile/password';
      await this._apicall.postApi(url, param, true);
      this.logout();
    });
  }

  dropDownToggleOnClick() {
    this.dropDownDisplayed = !this.dropDownDisplayed;
  }
  handleDialog = () => {
    this.isOpen = !this.isOpen;
  };
}
