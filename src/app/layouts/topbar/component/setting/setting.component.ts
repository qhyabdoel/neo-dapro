import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { LayoutConfigService, TranslationService, JsonService } from 'src/app/libs/services';
import { LayoutConfigModel } from 'src/app/libs/models';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { UserSelector } from 'src/app/libs/store/selectors/authentication.selectors';

@Component({
  selector: 'pq-setting',
  templateUrl: './setting.component.html',
})
export class SettingComponent implements OnInit {
  @Input() isHideUserManagement;
  @ViewChild('toggleButton2') toggleButton: ElementRef;
  @ViewChild('menu2') menu: ElementRef;
  isOpen: boolean = false;
  model: LayoutConfigModel;
  user: any;
  isAdministrator: boolean = false;

  constructor(
    private layoutConfigService: LayoutConfigService,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private router: Router,
    public cdRef: ChangeDetectorRef,
    private store: Store<AppState>,
    private renderer: Renderer2
  ) {
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

    this.store.select(UserSelector).subscribe((res) => {
      if (res) {
        this.user = res;
        if (this.user.scopes) {
          this.isAdministrator = Object.keys(this.user.scopes).indexOf('administration') >= 0;
        }
      }
    });
  }

  environtmentType: any;

  ngOnInit(): void {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.model = this.layoutConfigService.getConfig();
    this.jsonService
      .retEnvironment(environment.type)
      .then((env) => {
        this.environtmentType = environment.type;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }

  changeSkin(e): void {
    this.model.login.self.skin = e;
    this.layoutConfigService.setConfig(this.model, true);
    document.body.className = '';
    document.body.className =
      e == 'dark'
        ? 'theme-light-pqs theme-pds theme-dark theme-cyan kt-page--loaded'
        : 'theme-light-pqs theme-pds kt-page--loaded';
    this.handleDialog();
  }

  checkOnPrem() {
    let version: any = JSON.parse(localStorage.getItem('version'));
    if (environment.type == 'on_premise' && version.allow_notification_center) return true;
    return false;
  }

  handleRedirect = (url) => {
    this.router.navigate([url], {
      queryParams: {},
    });
  };
  handleDialog = () => {
    this.isOpen = !this.isOpen;
  };
}
