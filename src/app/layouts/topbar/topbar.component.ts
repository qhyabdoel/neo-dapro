// Angular
import { Component, HostBinding, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuConfigService } from 'src/app/libs/services';
@Component({
  selector: 'kt-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  @HostBinding('class') classList = 'navbar-nav right-nav ml-auto item-center';
  mystyle: string;
  serviceSubscription: Subscription;
  constructor(private menuConfigService: MenuConfigService, public cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.serviceSubscription = this.menuConfigService.getShowMenu.subscribe(
      (val) => {
        if (val) {
          this.mystyle = '35px';
        } else {
          this.mystyle = '0';
        }
      },
      (error) => console.log('Error :: ' + error)
    );
  }

  ngOnDestroy(): void {
    this.serviceSubscription.unsubscribe();
  }
}
