// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
// RxJS
import { Observable } from 'rxjs';
// NGRX
import { Permission } from 'src/app/libs/models';
import { MenuConfigService, JsonService } from 'src/app/libs/services';
// Auth
import { environment } from 'src/environments/environment';

@Component({
  selector: 'kt-user-management',
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit {
  currentUserPermission$: Observable<Permission[]>;
  isShow_user_management: boolean = false;
  /**
   * Component constructor
   *
   * @param store: Store<AppState>
   * @param router: Router
   */
  constructor(private menuConfigService: MenuConfigService, private jsonService: JsonService) {}

  ngOnInit() {
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
