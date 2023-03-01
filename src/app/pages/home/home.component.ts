import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/libs/services';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { AuthNoticeService, AuthService } from 'src/app/libs/services';
import { MenuConfigService, HeaderConfigService, TranslationService, JsonService } from 'src/app/libs/services';
import { environment } from 'src/environments/environment';
import * as displayLayouts from './../../../assets/data/config/home_settings.json';

@Component({
  selector: 'kt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isToken: boolean = false;
  isFirst: boolean = false;
  version: any;
  desktopHeaderDisplay: boolean;
  isShowHeader$: Observable<boolean>;
  title: string = '';
  settingLayouts: any = (displayLayouts as any).default;
  constructor(
    private menuConfigService: MenuConfigService,
    private headerConfigService: HeaderConfigService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.desktopHeaderDisplay = true;
    this.isShowHeader$ = this.headerConfigService.getShowHeader;
    this.menuConfigService.setShowMenu(false);
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.title = data.title_home;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }
}
