import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavigationEnd, Router, Event, NavigationStart } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, takeWhile } from 'rxjs';
import * as objectPath from 'object-path';

import { ApiService, LayoutConfigService, SplashScreenService, TranslationService } from 'src/app/libs/services';

import idn from 'src/assets/data/config/language/id.json';
import eng from 'src/assets/data/config/language/en.json';

import { LayoutConfigModel } from 'src/app/libs/models';
import { environment } from 'src/environments/environment';
import { AppState } from './libs/store/states';
import { SetIsProgressActive, SetIsQueryRequestTriggered, SetToastrMessage } from './libs/store/actions/pds/dataprocessing.actions';
import { isError500EncounteredSelector } from './libs/store/selectors/general.selector';
import { SetIsError500Encountered } from './libs/store/actions/general.actions';

declare var $: any;
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'body[pq-root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  // Public properties
  public title = 'ng-paques';
  public loader: boolean;
  public config: LayoutConfigModel = JSON.parse(localStorage.getItem('layoutConfig'));
  
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private isNavigationStarted: boolean = false;

  constructor(
    private translationService: TranslationService,
    private _apicall: ApiService,
    private router: Router,
    private layoutConfigService: LayoutConfigService,
    private splashScreenService: SplashScreenService,
    private _elementRef: ElementRef,
    private store: Store<AppState>
  ) {
    this.translationService.loadTranslations(eng, idn);
  }

  ngOnInit(): void {
    // enable/disable loader
    this._elementRef.nativeElement.removeAttribute('ng-version');

    this.loader = this.layoutConfigService.getConfig('loader.enabled');
    
    var url = 'assets/data/config/' + environment.type + '.json';
    this._apicall
      .get(url)
      .toPromise()
      .then((data) => {
        if (data.chat_box) {
          this.loadScript('../assets/js/rocket-live-chat.js');
          this.loadScript('../assets/js/rocket-chat.js');
        }
      })
      .catch((error) => {
        // console.log('Promise rejected with ' + JSON.stringify(error));
      });
    //console.log(objectPath.get(this.config, 'login.self.skin'));
    //set background body
    
    if (objectPath.get(this.config, 'login.self.skin') == 'dark') {
      document.body.classList.add(objectPath.get(this.config, 'login.bgDark'));
      document.body.classList.add('theme-cyan');
    }
    // else{
    // 	document.body.classList.add(objectPath.get(this.config, 'login.bgLight'));
    // }

    this.unsubscribe.push(
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          // hide splash screen
          this.splashScreenService.hide();

          // scroll to top on every route change
          window.scrollTo(0, 0);

          // to display back the body content
          setTimeout(() => {
            document.body.classList.add('kt-page--loaded');
          }, 500);
        }

        if (event instanceof NavigationEnd && !this.isNavigationStarted) {
          // console.log('Browser reloaded / refreshed!');

          this.store.dispatch(SetIsQueryRequestTriggered({ isQueryRequestTriggered: false }));
          this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
        }

        if (event instanceof NavigationStart) {
          this.isNavigationStarted = true;
        }
      })
    );

    this.unsubscribe.push(
      this.store.select(isError500EncounteredSelector).subscribe((isError500Encountered) => {
        if (isError500Encountered) {
          this.store.dispatch(SetIsError500Encountered({ isError500Encountered: false }));

          setTimeout(() => {
            this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
            this.store.dispatch(SetToastrMessage({
              toastrMessage: {
                toastrType: 'error',
                message: 'Process failed due to fatal error!'
              }
            }));  
          }, 3000);
        }
      })
    );
  }

  loadScript(url: string) {
    const body = <HTMLDivElement>document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
