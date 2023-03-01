// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { JsonService, MenuConfigService, TranslationService } from 'src/app/libs/services';
import { environment } from 'src/environments/environment';
// AppState

@Component({
  selector: 'pq-notifications',
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  /**
   * Component constructor
   *
   * @param store: Store<AppState>
   * @param router: Router
   */
  isShow_user_management: boolean = false;
  constructor(
    private menuConfigService: MenuConfigService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.menuConfigService.setShowMenu(true);
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.isShow_user_management = data.user_management;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }
}
