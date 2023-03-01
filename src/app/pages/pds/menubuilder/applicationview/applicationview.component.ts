import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NestableSettings } from 'ngx-nestable/lib/nestable.models';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { take } from 'rxjs/operators';
import { InjectDirective } from 'src/app/libs/directives';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Application, Menu } from 'src/app/libs/models';
import { ApiService, JsonService, LayoutUtilsService, MessageType, TranslationService } from 'src/app/libs/services';
import { DashboardViewShareComponent } from '../../datavisualization/pdsshare/dashboardviewShare/dashboardviewshared.component';
import { MatTableDataSource } from '@angular/material/table';
import { addChildren, findNestedObj, handleExpandedNestedObject } from 'src/app/libs/helpers/data-visualization-helper';
@Component({
  selector: 'pq-applicationview',
  templateUrl: './applicationview.component.html',
  styleUrls: ['./applicationview.component.scss'],
})
export class ApplicationviewComponent implements OnInit {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // data type []
  notificationList: any = [];
  array: any = [];
  breadcrumb: any = [];
  extraFilter: any = [];
  listIdMenu: any = [];
  listIdDashboard: any = [];

  // data type any {}
  formData: any = {};
  application: Application;
  selectedMenu: Menu;
  applicationMenuMapping: { [key: string]: Menu } = {};
  dataSearchResult: any = {};
  // homeMenu: Menu;
  options = {
    fixedDepth: false,
    maxDepth: 3,
    disableDrag: true,
  } as NestableSettings;
  pageEvent: PageEvent;
  dataSource: any;

  // data type string
  // shareUrl = '';
  password = '';
  // slugApplication = '';
  titleSearch = 'Title';
  inputSearch = '';

  // data type boolean
  showPassword = false;
  // isProtectModul = false;
  isSearchResult = false;
  isDateFilter = false;
  isNotificationApp = false;
  isNotiMenuDashboard = false;
  isLoadingSearch = false;
  fieldTextType = false;

  // data type number
  notificationLength: number;
  pageIndex: number;
  totalSize = -1;
  pageSize = 6;
  length = 100;
  currentPage = 0;
  messages: any;
  // redirectUrl: string;

  // loading component
  loadingPage: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private service: ApiService,
    public loader: LoadingBarService,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private layoutUtilsService: LayoutUtilsService
  ) {}

  async ngOnInit() {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((params) => {
      const { link: slug } = params;
      // this.redirectUrl = `${window.location.pathname}${window.location.search}`;
      this.intialPage(slug);
    });
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
  }
  getBreadcrumb() {
    this.breadcrumb = [];
    let parent: Menu;

    // If selected menu doesn't have dashboard, assign empty strings
    if (!this.selectedMenu.dashboard) {
      this.selectedMenu.dashboard = {
        id: 0,
        share_url: '',
        slug: '',
      };
    }

    this.breadcrumb.push(this.selectedMenu);
    let currentMenu = this.selectedMenu;

    // Iterate over parent menus
    while ((parent = this.getMenuParent(currentMenu))) {
      this.breadcrumb.push(parent);
      currentMenu = parent;
    }

    this.breadcrumb.reverse();
  }
  getMenuParent(child: Menu): Menu {
    if (child.parent_id && child.parent_id in this.applicationMenuMapping) {
      return this.applicationMenuMapping[child.parent_id];
    }

    return null;
  }
  intialPage = async (slug) => {
    let app = await this.loadData(`api/applications/${slug}`);
    this.application = app;
    this.prepareApplication(app.menu);
    this.setNotification(slug);
    this.selectedMenu = this.application.menu && this.application.menu.length > -1 ? this.application.menu[0] : null;

    if (!app.options.enable_protect_module) {
      this.getBreadcrumb();
    }
    if (this.selectedMenu !== null) {
      if (!this.selectedMenu.options.enable_protect_module) {
        this.setSelectedItem(this.selectedMenu);
      }
    }
    this.changeDetector.detectChanges();
  };
  setNotification = async (slug) => {
    this.isNotificationApp = true;
    this.notificationList = [];
    let result = await this.loadData(`api/notification/log/get?slug=${slug}`);
    if (result.length > 0) {
      this.application.menu.map((data) => {
        result.menu.map((obj, index) => {
          if (obj.menu && data.id === obj.id) {
            this.notificationList.push({
              ...obj,
              index,
              clicked: false,
            });
          }
        });
      });

      this.notificationLength = this.notificationList.length;
      for (const item of this.notificationList) {
        this.listIdMenu.push(item.menu !== undefined ? item.menu.id : 0);
        this.listIdDashboard.push(item.menu !== undefined ? item.menu.dashboard_id : 0);
      }
    } else {
      const errorMessage = this.messages.APPLICATIONS.MSG_UPS;
      this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
    }
  };

  loadData = async (url) => {
    let result = null;
    result = await this.service.loadGetData(url);
    let value = result.response ? result.response : null;
    return value;
  };

  menu = [];
  dropTargetIds;

  prepareApplication(menus) {
    let obj = [];
    menus.map((data) => {
      obj.push({ ...data, children: data.children ? addChildren(data.children) : [] });
    });
    obj.forEach((node) => {
      this.prepareApplication(node.children);
    });
    this.menu = obj;

    // console.log(JSON.stringify(obj));
  }

  async setSelectedItem(item) {
    this.isSearchResult = false;
    this.totalSize = 0;
    if (item.slug) {
      this.loadingPage = true;
      this.selectedMenu = item;

      this.getBreadcrumb();
      const url = 'api/dashboard/view?link=' + item.slug;
      const rest = await this.service.getApi(url);
      const result = rest.status ? (rest.result.response ? rest.result.response : rest.result) : rest;
      setTimeout(() => {
        this.selectedMenu = result.dashboard_data;
        this.addDynamic(result.dashboard_data.share_url);
        this.loadingPage = false;
      }, 100);
    } else {
      this.service.openModal(this.messages.APPLICATIONS.F, this.messages.APPLICATIONS.MSG_UPS);
      return;
    }
  }

  public addDynamic = async (url) => {
    const viewContainerRef = await this.injectComp.viewContainerRef;
    viewContainerRef.clear();
    const componentRefer = viewContainerRef.createComponent(DashboardViewShareComponent);
    let currentComponent = componentRefer.instance;
    currentComponent.queryParams = url;
    currentComponent.paramsFromApp = this.application;
    currentComponent.isSearchResult = this.isSearchResult;
    currentComponent.dataSearchResult = this.dataSearchResult;
    currentComponent.breadcrumb = this.breadcrumb;
    currentComponent.extraFilter = this.extraFilter;
    currentComponent.isDateFilter = this.isDateFilter;
    // currentComponent.itemDashboard.subscribe((val) => this.loadDashboardTo(val));
    // currentComponent.linkToFilter.subscribe((val) => this.jumpToDashboard(val));
    this.changeDetector.detectChanges();
  };

  async globalSearch(e) {
    const viewContainerRef = await this.injectComp.viewContainerRef;
    viewContainerRef.clear();
    this.inputSearch = e;
    this.loadingPage = true;
    const params = {
      keywords: e,
      application_slug: this.application.slug,
    };
    const url = '/api/query/index/search';
    const result = await this.service.postApi(url, params);
    const slice = [];
    if (result.status) {
      const response = result.result.response;
      this.isSearchResult = true;
      this.titleSearch = this.messages.APPLICATIONS.SR;
      if (response.length > 0) {
        for (const item of response) {
          for (const chartSlices of item.dashboard_data.slices) {
            chartSlices.slug = item.dashboard_data.slug;
            if (slice.length < 6) {
              slice.push(chartSlices);
            }

            this.array.push(chartSlices);
          }
        }
        this.totalSize = this.array == null || this.array.length === 0 ? -1 : this.array.length;
        this.showResultSearch(slice);
      } else {
        this.totalSize = 0;
      }
      this.changeDetector.detectChanges();
    } else {
      this.service.openModal(this.messages.APPLICATIONS.MSG_UPS);
    }
    this.loadingPage = false;
  }
  showResultSearch = async (slice) => {
    this.dataSearchResult = {
      dashboard_data: {
        dashboard_title: this.messages.APPLICATIONS.SR,
        position_json: null,
        slices: slice,
      },
    };
    this.dataSource = new MatTableDataSource<Element>(this.dataSearchResult);
    this.dataSource.paginator = this.paginator;
    this.iterator();
    setTimeout(() => {
      this.addDynamic(this.selectedMenu.share_url);
    }, 0);
  };

  iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    this.dataSource = this.array != null ? this.array.slice(start, end) : 0;
  }

  toggleCustomMenu() {
    $('body').toggleClass('menu-displayed');
  }
  handleClickMenu = (event) => {
    let objectChanged = findNestedObj(this.menu, 'id', event.id);
    this.menu = handleExpandedNestedObject(this.menu, objectChanged, objectChanged.id);
  };

  showHidePassword = () => {};
  toggleFieldTextType = () => {};
  loadDashboardTo = (event) => {};
}
