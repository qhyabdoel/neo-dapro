import { AfterViewInit, Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ApiService, HtmlClassService, LayoutConfigService, MenuConfigService } from 'src/app/libs/services';
import { ToggleOptions } from 'src/app/libs/directives';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kt-brand',
  templateUrl: './brand.component.html',
})
export class BrandComponent implements OnInit, AfterViewInit {
  // Public properties
  // @HostBinding('class') classList = 'navbar-brand border-0 mt-1';
  @Input() menuButtonDisplay: boolean;
  applicationList: Array<any> = [];
  headerLogo: string;
  headerStickyLogo: string;
  mycolor: string;
  isAppPreview: boolean = false;
  toggleOptions: ToggleOptions = {
    target: 'body',
    targetState: 'kt-aside--minimize',
    togglerState: 'kt-aside__brand-aside-toggler--active',
  };
  loading: boolean = true;
  /**
   * Component constructor
   *
   * @param layoutConfigService: LayoutConfigService
   * @param htmlClassService: HtmlClassService
   */
  constructor(
    private layoutConfigService: LayoutConfigService,
    public htmlClassService: HtmlClassService,
    private menuService: MenuConfigService,
    private activedRoute: ActivatedRoute,
    private _apicall: ApiService,
    private changeDetector: ChangeDetectorRef
  ) {}

  /**
   * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
   */

  /**
   * On init
   */
  ngOnInit(): void {
    this.headerStickyLogo = this.layoutConfigService.getStickyLogo();
    this.isAppPreview = false;
    this.activedRoute.queryParams.subscribe(async (params) => {
      let type = findTypeCheckByUrl();
      if ('link' in params && type === 'app_preview') {
        this.loading = true;
        this.isAppPreview = true;
        this._apicall.getApi(`/api/applications/${params.link}`).then((res) => {
          if (res.status) {
            this.headerLogo = res.result.response.options.topbar_option.logo || this.layoutConfigService.getLogo();
          }
          this.loading = false;
        });
        this.changeDetector.detectChanges();
      } else {
        this.loading = false;
        this.headerLogo = this.layoutConfigService.getLogo();
      }
    });
  }

  showLeftMenu() {
    this.menuService.setLeftShowMenu(true);
  }

  /**
   * On after view init
   */
  ngAfterViewInit(): void {}
}
