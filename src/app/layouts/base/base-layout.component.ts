import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import * as objectPath from "object-path";
import { select, Store } from "@ngrx/store";
import { NgxPermissionsService } from "ngx-permissions";

import {
  HtmlClassService,
  LayoutConfigService,
  MenuConfigService,
  PageConfigService,
  HeaderConfigService,
} from 'src/app/libs/services';

import { LayoutConfig, MenuConfig, PageConfig } from 'src/app/libs/configs';
import { Permission } from 'src/app/libs/models';
import { currentUserPermissions } from 'src/app/libs/store/selectors/auth/auth.selectors';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: "kt-base",
  templateUrl: "./base-layout.component.html",
  styleUrls: ["./base-layout.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BaseLayoutComponent implements OnInit, OnDestroy {
  // Public variables
  selfLayout: string;
  asideDisplay: boolean;
  asideSecondary: boolean;
  subheaderDisplay: boolean;
  desktopHeaderDisplay: boolean;
  fitTop: boolean;
  fluid: boolean;
  isShowHeader$: Observable<boolean>;

  // Private properties
  private unsubscribe: Subscription[] = [];
  private currentUserPermissions$: Observable<Permission[]>;

  /**
   * Component constructor
   *
   * @param layoutConfigService: LayoutConfigService
   * @param menuConfigService: MenuConfifService
   * @param pageConfigService: PageConfigService
   * @param htmlClassService: HtmlClassService
   * @param store
   * @param permissionsService
   */
  constructor(
    private layoutConfigService: LayoutConfigService,
    private menuConfigService: MenuConfigService,
    private pageConfigService: PageConfigService,
    private htmlClassService: HtmlClassService,
    private store: Store<AppState>,
    private permissionsService: NgxPermissionsService,
    private headerConfigService: HeaderConfigService
  ) {
    this.loadRolesWithPermissions();

    // register configs by demos
    this.layoutConfigService.loadConfigs(new LayoutConfig().configs);
    this.menuConfigService.loadConfigs(new MenuConfig().configs);
    this.pageConfigService.loadConfigs(new PageConfig().configs);

    // setup element classes
    this.htmlClassService.setConfig(this.layoutConfigService.getConfig());

    const subscr = this.layoutConfigService.onConfigUpdated$.subscribe(
      (layoutConfig) => {
        // reset body class based on global and page level layout config, refer to html-class.service.ts
        document.body.className = "";
        this.htmlClassService.setConfig(layoutConfig);
      }
    );
    this.unsubscribe.push(subscr);
  }

  ngOnInit(): void {
    const config = this.layoutConfigService.getConfig();
    this.selfLayout = objectPath.get(config, "self.layout");
    this.asideDisplay = objectPath.get(config, "aside.self.display");
    this.subheaderDisplay = objectPath.get(config, "subheader.display");
    this.desktopHeaderDisplay = objectPath.get(
      config,
      "header.self.fixed.desktop"
    );
    this.isShowHeader$ = this.headerConfigService.getShowHeader;
    this.fitTop = objectPath.get(config, "content.fit-top");
    this.fluid = objectPath.get(config, "content.width") === "fluid";

    // let the layout type change
    const subscr = this.layoutConfigService.onConfigUpdated$.subscribe(
      (cfg) => {
        setTimeout(() => {
          this.selfLayout = objectPath.get(cfg, "self.layout");
        });
      }
    );
    this.unsubscribe.push(subscr);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  loadRolesWithPermissions() {
    this.currentUserPermissions$ = this.store.pipe(
      select(currentUserPermissions)
    );

    const subscr = this.currentUserPermissions$.subscribe((res) => {
      if (!res || res.length === 0) {
        return;
      }

      this.permissionsService.flushPermissions();
      res.forEach((pm: Permission) =>
        this.permissionsService.addPermission(pm.name)
      );
    });
    
    this.unsubscribe.push(subscr);
  }
}
