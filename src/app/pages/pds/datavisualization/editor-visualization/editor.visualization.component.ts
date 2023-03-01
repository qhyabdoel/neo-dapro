import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  helperGenerateFormData,
  isValidate,
  setDataSave,
  static_active_collapse_application,
  static_active_collapse_chart,
  static_active_collapse_dashboard,
  static_form_data,
} from 'src/app/components/sidebars/menubuilder/rightbar/helperRightbar';
import { JsonService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import { AppState } from 'src/app/libs/store/states';
import { ApiService, NotificationService, TranslationService } from 'src/app/libs/services';
import { rest_api } from 'src/app/libs/configs';
import {
  default_state,
  initial_form_data,
  leftbar_option_application,
  leftbar_option_chart,
  leftbar_option_dashboard,
  setCreateDashboard,
  setWorkspaceData,
  topbar_option_chart,
} from './helper.editor.visualization';
import {
  isReloadCard,
  PostDashboardChartData,
  PostSharedChartData,
  SetActiveCollapseRightbar,
  SetExtraFilter,
  SetFormData,
  SetInsertChartDashboard,
  SetItemDataset,
  SetMenuBuilderDetail,
  SetMenuBuilderSelectedItem,
  SetMenuList,
  SetOptionLeftbar,
  GetDashboardList,
  GetChartList,
  GetApplicationList,
  setApplicationById,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  findTypeCheckByUrl,
  helperPostData,
  loadExploreJson,
  loadChartData,
  helperGetData,
  addChildren,
} from 'src/app/libs/helpers/data-visualization-helper';
import apps from './../../../../../assets/data/applications.json';
import {
  applicationListSelector,
  chartListSelector,
  dashboardListSelector,
  menuBuilderSelector,
  menuListSelector,
  sharedChartDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { BasicChartComponent } from 'src/app/components/chartasync/basic/basic.component';
import {
  initialOptionGridStack,
  initialOptionGridStackOnViewOnly,
  remapingChartPosition,
} from '../dashboardeditor/helperDashboardEditor';
import { copy_url, on_full_screen, on_full_screen_id } from 'src/app/libs/helpers/utility';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalSaveChartComponent } from 'src/app/components/modals/modalSaveChart/modal-save-chart.component';
import { FormControl, Validators } from '@angular/forms';
import { Menu } from 'src/app/libs/models';
declare var GridStack: any;
@Component({
  selector: '[editor]',
  templateUrl: './editor.visualization.component.html',
})

/*
Semua editor topbar, leftbar, workspace, rightbar (app,chart dan dashbord) akan menggunakan component ini

Remove Comp
  - Editor di menu builder
  - leftbar chart
  - leftbar dashboard 

NOTED UNTUK SELANJUTNYA
- RAPIHIN CODINGAN UNTUK SHAREDASHBOARD DAN SHARECHART
- KARENA ADA ISSUE KETIKA APPLICATION
*/
export class EditorComponent implements OnInit {
  @ViewChild(InjectDirective, { static: true }) injectComp: InjectDirective;
  grid: any;
  static_url = rest_api.API_APPLICATION_LIST;
  topbarOptions: any = topbar_option_chart(null, '', null, null, null);
  //   leftbarOptions: any = {};
  messages: any;
  formData: any;
  applicationList: any = [];
  chartList: any = [];
  dashboardList: any = [];
  loadUrl = '';
  slugId = '';
  menu: any = [];
  popupMessage: any = {
    title: '',
    desc: '',
  };
  shareUrl: string;
  loadingGeneral: boolean;
  isLoadingContent: boolean = false;
  typePage: string;
  previewMode: boolean = true;
  modalReference: NgbModalRef;
  hasFlaging: string = 'overwrite';
  hasFlagingControl = new FormControl('', Validators.required);
  shareChartData: any = null;
  eventButtonData: any;
  isSharePage: boolean = false;
  parameter: string = 'test';
  selectedMenu: Menu;
  skin: string;

  constructor(
    private jsonService: JsonService,
    private route: Router,
    private store: Store<AppState>,
    private service: ApiService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
    private translationService: TranslationService,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private httpFile: HttpClient
  ) {
    this.store
      .select(applicationListSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.applicationList = result.response;
        }
      });

    this.store
      .select(chartListSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.chartList = result.response;
        }
      });
    this.store
      .select(dashboardListSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.dashboardList = result.response;
        }
      });

    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        this.setFormData(res);
      }
    });

    this.store.select(menuListSelector).subscribe((res) => {
      if (res) {
        this.menu = res;
      }
    });
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          this.shareChartData = result;
          this.eventButtonData =
            this.typePage === 'dashboard'
              ? result.typeChart === 'filter_box'
                ? [{ type: 'Apply', icon: 'zmdi zmdi-check ml-1' }]
                : [
                    { type: 'refresh', icon: 'zmdi zmdi-refresh-alt' },
                    { type: 'edit', icon: 'zmdi zmdi-edit' },
                    { type: 'download', icon: 'zmdi zmdi-download' },
                  ]
              : [];
        }
      });
  }

  setFormData = (res) => {
    this.formData = res;

    if (this.typePage === 'application') {
      this.menu = res.menu;
    }
    this.initialTopbarOptions();
  };

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    this.activeRoute.queryParams.subscribe((params) => {
      this.typePage = findTypeCheckByUrl();
      this.slugId = params.slice_id || params.link;
      this.skin = params.theme ? params.theme : '';
    });
    this.intialEditor();
  }

  changeSkin(): void {
    // this.model.login.self.skin = this.skin;
    // this.layoutConfigService.setConfig(this.model, true);
    document.body.className = '';
    document.body.className =
      this.skin == 'dark'
        ? 'theme-light-pqs theme-pds ng-tns-0-0 theme-dark theme-cyan kt-header--fixed kt-header-mobile--fixed kt-subheader--fixed kt-subheader--enabled kt-subheader--solid kt-aside--enabled kt-aside--fixed kt-aside--minimize kt-header-base-dark kt-header-menu-dark kt-brand-dark kt-aside-dark kt-page--loaded'
        : 'theme-light-pqs theme-pds ng-tns-0-0 kt-header--fixed kt-header-mobile--fixed kt-subheader--fixed kt-subheader--enabled kt-subheader--solid kt-aside--enabled kt-aside--fixed kt-aside--minimize kt-header-base-dark kt-header-menu-dark kt-brand-dark kt-aside-dark kt-page--loaded';
  }

  intialEditor = () => {
    this.preparingApplication();
    this.initialTopbarOptions();
    this.initialSidebarOptions();
    this.initialOnLoadData();
  };

  preparingApplication = () => {
    if (this.typePage === 'application') {
      if (!this.slugId) {
        this.store.dispatch(SetMenuBuilderDetail({ item: static_form_data(apps) }));
        this.store.dispatch(SetMenuBuilderSelectedItem({ item: null }));
        this.store.dispatch(SetMenuList({ item: [] }));
      }
    }
  };

  loadApplicationPreview = async () => {
    this.previewMode = true;
    this.store.dispatch(GetDashboardList());
    this.store.dispatch(GetChartList());
    let result = await this.service.loadGetData(`api/applications/${this.slugId}`);
    if (result) {
      this.selectedMenu = result.response.menu && result.response.menu.length > -1 ? result.response.menu[0] : null;
      this.prepareApplication(result.response.menu);
      // let item = this.dashboardList.find((obj) => obj.slug == result.response.menu[0].slug);
      let item = await helperGetData(`/api/dashboard/view?link=${result.response.menu[0].slug}`, this.service);
      item = setWorkspaceData({ ...item.dashboard_data, charts: this.handleAppPreview(item.dashboard_data.slices) });
      return item;  
    }

    return;
  };

  handleAppPreview = (chart) => {
    let arr = [];
    chart.map((data) =>
      arr.push({
        ds_name: data.form_data.datasource_name,
        id: data.slice_id,
        name: data.slice_name,
        url: data.slice_url,
        viz_type: data.form_data.viz_type,
      })
    );
    return arr;
  };
  initialOnLoadData = async (itemSelected?) => {
    this.isLoadingContent = true;
    let item = null;
    this.isSharePage = this.route.url.includes('pdsshare') || this.route.url.includes('app_preview');
    switch (this.typePage) {
      case 'app_preview':
        item = itemSelected ? itemSelected : await this.loadApplicationPreview();
        if (itemSelected) {
          item.charts.map((data) => {
            let position_json = item.position_json.find((obj) => obj.id.includes(data.id));
            // let obj = this.chartList.find((obj) => obj.id == data);
            this.store.dispatch(SetInsertChartDashboard({ item: { ...data, position_json: position_json } }));
          });
        }
        break;
      case 'application':
        this.previewMode = false;
        item = this.applicationList.find((obj) => obj.slug == this.slugId);
        this.store.dispatch(setApplicationById({ item }));
        break;
      case 'dashboard':
      case 'dashboardview':
        this.store.dispatch(SetExtraFilter({ extraFilter: [] }));
        if (this.isSharePage) {
          /**
           * need
           * item.id
           * item.name
           * item.viz_type
           */
          this.changeSkin();
          item = await helperGetData(
            `api/dashboard/view/shared?token=${this.activeRoute.snapshot.queryParams.token}`,
            this.service
          );
          if (item) {
            item.dashboard_data.slices.map((data) => {
              let obj = { id: data.slice_id, name: data.slice_name, viz_type: data.form_data.viz_type };
              this.store.dispatch(SetInsertChartDashboard({ item: obj }));
            });
            item = item.dashboard_data;
          } else {
            // remove for initial first page
            this.store.dispatch(SetInsertChartDashboard({ item: null }));
            this.store.dispatch(PostDashboardChartData({ dashboardCharts: [] }));
          }
        } else {
          this.previewMode = false;
          item = this.dashboardList.find((obj) => obj.slug == this.slugId);
          if (item) {
            item.charts.map((data) => {
              let obj = this.chartList.find((obj) => obj.id == data);
              this.store.dispatch(SetInsertChartDashboard({ item: obj }));
            });
          } else {
            // remove for initial first page
            this.store.dispatch(SetInsertChartDashboard({ item: null }));
            this.store.dispatch(PostDashboardChartData({ dashboardCharts: [] }));
          }
        }
        if (window.location.href.includes('view')) {
          this.previewMode = true;
        }
        break;
      case 'chart':
        if (this.isSharePage) {
          item = await helperGetData(
            `api/chart/explore/shared?token=${this.activeRoute.snapshot.queryParams.token}`,
            this.service
          );
          item = {
            id: item.slice.slice_id,
          };
        } else {
          this.previewMode = false;
          item = this.chartList.find((obj) => obj.id == this.slugId);
        }
        break;

      default:
        break;
    }
    this.preparingData(item);
  };

  preparingData = async (item) => {
    this.isLoadingContent = true;
    if (item) {
      if (this.typePage === 'chart') {
        await this.getDataChart(item);
      }
      if (['dashboard', 'dashboardview', 'app_preview'].includes(this.typePage)) {
        let charts = [];
        if (this.route.url.includes('pdsshare')) {
          item = { ...item, charts: item.slices };
        } else {
          item = setWorkspaceData(item);
          if (this.typePage !== 'app_preview') {
            item.charts.map((id) => {
              // find chart detail on chartlist by item dashboard
              let chartDetail = this.chartList.find((obj) => obj.id === id);
              if (chartDetail) {
                charts.push(chartDetail);
              }
            });
            item = { ...item, charts };
          }
        }
      }
      if (this.typePage === 'application') {
        this.store.dispatch(SetMenuList({ item: item.menu }));
      }
      this.store.dispatch(SetMenuBuilderDetail({ item: item }));
      this.formData = item;
      this.topbarOptions.title = item.title || item.name || item.dashboard_title;
    } else {
      let objectDefault = null;
      if (this.typePage === 'chart') {
        objectDefault = default_state;
        this.getDataChart(item);
      }
      if (this.typePage === 'dashboard') {
        objectDefault = setWorkspaceData(null);
      }
      if (this.typePage === 'application') {
        objectDefault = static_form_data(apps);
      }
      if (this.typePage === 'app_preview') {
        objectDefault = setWorkspaceData(null);
      }
      this.store.dispatch(SetMenuBuilderDetail({ item: objectDefault }));
      this.formData = objectDefault;
      this.topbarOptions.title = objectDefault.title || objectDefault.name || objectDefault.dashboard_title;
    }
    this.isLoadingContent = false;
  };

  getDataChart = async (params) => {
    // code for get explore for create chart on card
    const exploreObj = params ? await loadExploreJson(params, this.service, this.messages) : null;
    if (exploreObj.explore && exploreObj.exploreJson) {
      const sharedChartDataObj = {
        themes: exploreObj && params.id ? exploreObj.explore.form_data.color_scheme : [],
        title: exploreObj && params.id ? exploreObj.explore.slice.slice_name : 'Untitled',
        hasActivity: true,
        index: null,
        myChartID: params && params.id ? params.slice_id || params.id : '',
        data: null,
        typeChart: exploreObj ? exploreObj.explore.form_data.viz_type : 'preview',
        mapGeoJSON: null,
        url: null,
        explore: exploreObj.explore
          ? {
              ...exploreObj.explore,
              form_data: initial_form_data(exploreObj.explore.form_data ? exploreObj.explore.form_data : null),
            }
          : {
              form_data: initial_form_data(null),
            },
        exploreJson: exploreObj.exploreJson
          ? {
              ...exploreObj.exploreJson,
              form_data: initial_form_data(exploreObj.exploreJson.form_data ? exploreObj.exploreJson.form_data : null),
            }
          : {
              form_data: initial_form_data(null),
            },
      };
      this.shareChartData = sharedChartDataObj;
      this.store.dispatch(PostSharedChartData(sharedChartDataObj));
      this.store.dispatch(SetFormData({ item: sharedChartDataObj.exploreJson.form_data }));
    } else {
      this.service.openModal(this.messages.CHART.F, 'Failed to load chart');
    }

    this.isLoadingContent = false;
    this.changeDetector.detectChanges();
  };
  initialTopbarOptions() {
    this.topbarOptions = topbar_option_chart(
      this.topbarOptions,
      this.typePage,
      this.messages,
      this.translationService,
      this.formData,
      this.route.url.includes('pdsshare')
    );
  }

  initialSidebarOptions() {
    switch (this.typePage) {
      case 'application':
        this.store.dispatch(SetOptionLeftbar({ options: leftbar_option_application }));
        this.store.dispatch(SetActiveCollapseRightbar({ options: static_active_collapse_application }));
        break;
      case 'dashboard':
        this.store.dispatch(SetOptionLeftbar({ options: leftbar_option_dashboard }));
        this.store.dispatch(SetActiveCollapseRightbar({ options: static_active_collapse_dashboard }));
        break;
      case 'chart':
        this.store.dispatch(SetOptionLeftbar({ options: leftbar_option_chart }));
        this.store.dispatch(SetActiveCollapseRightbar({ options: static_active_collapse_chart }));

        break;
      default:
        break;
    }
  }

  validationPage = () => {
    let result = null;
    switch (this.typePage) {
      case 'application':
        result = isValidate(this.menu, this.popupMessage, this.messages);
        break;
      case 'dashboard':
        break;
      case 'chart':
        break;
      default:
        break;
    }

    this.popupMessage = result && result.popupMessage;
    return result ? result.validate : true;
  };

  async buttonSave(res) {
    if (!this.validationPage()) {
      this.service.openModal(this.popupMessage.title, this.popupMessage.desc);
      return;
    }
    switch (this.typePage) {
      case 'application':
        if (!res) {
          return;
        }
        this.handleSaveApplication();
        break;
      case 'dashboard':
        this.isLoadingContent = true;
        this.handleSaveDashboard();
        break;
      case 'chart':
        this.openModalTemplateCustom();
        break;
      default:
        break;
    }

    this.changeDetector.detectChanges();
  }

  handleSaveApplication = () => {
    this.formData = {
      ...this.formData,
      options: {
        ...this.formData.options,
        menu: this.menu,
      },
    };
    this.submit(setDataSave(this.formData, this.menu));
    this.changeDetector.detectChanges();
  };

  handleSaveChart = async () => {
    let form_data = null;
    let datasource = '';

    if (this.topbarOptions.title.includes('&')) {
      this.modalService.dismissAll();
      this.service.openModal(this.messages.CHART.F, this.messages.CHART.ERR_SC);
    } else {
      let objectModify = helperGenerateFormData(this.shareChartData.typeChart, this.shareChartData.explore.form_data);
      form_data = objectModify.modify_form_data;
      this.formData = objectModify.form_data;
      datasource = this.shareChartData.explore.form_data.datasource;
      if (this.shareChartData.typeChart == 'table') {
        datasource = this.shareChartData.explore.form_data.datasource.split('__')[0];
      }
      form_data = {
        ...form_data,
        datasource: datasource,
        datasource_name: this.shareChartData.explore.form_data.datasource_name,
        slice_id: this.shareChartData.explore.form_data.slice_id,
      };
      let param = { form_data: JSON.stringify(form_data) };
      // post data save and edit
      let query = null;
      if (!this.shareChartData.myChartID) {
        query = {
          action: 'saveas',
          slice_name: this.topbarOptions.title,
        };
      } else {
        query = {
          action: this.hasFlaging,
          slice_name: this.topbarOptions.title,
          slice_id: this.shareChartData.myChartID,
          form_data: `%7B%22slice_id%22%3A${this.shareChartData.myChartID}%7D`,
          add_to_dash: 'noSave',
          goto_dash: false,
        };
      }
      let queryString = Object.keys(query)
        .map((key) => key + '=' + query[key])
        .join('&');
      const [ds, dsType] = this.shareChartData.exploreJson.form_data.datasource.split('__');
      var url = `api/chart/explore/${dsType}/${ds}?${queryString}`;
      this.isLoadingContent = true;
      let result = null;
      result = await this.service.postApi(url, param);
      if (result.status) {
        let id = result.result.response.data.form_data.slice_id;
        this.route.navigate(['/pds/newdatavisualization'], {
          queryParams: { slice_id: id },
        });
        await this.getDataChart({ id });
        await this.service.openModal(this.messages.CHART.S, this.messages.CHART.MSG_ASP);
        this.isLoadingContent = false;
      } else {
        this.service.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
      }
      // this.modalService.dismissAll();
    }
  };

  helperPostDashboard = async (remaping) => {
    let result = await this.service.postApi('/api/dashboard/save', remaping);
    if (result.status) {
      this.route.navigate(['/pds/dashboardeditor'], {
        queryParams: { link: result.result.response.slug },
      });
      // after save dashboard then update dashboard list
      this.store.dispatch(GetDashboardList());

      this.service.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_ASP);
      this.isLoadingContent = false;
    } else {
      this.service.openModal(this.messages.DASHBOARD.F, this.messages.DASHBOARD.MSG_PF);
    }
  };

  handleSaveDashboard = async () => {
    // check if chart is empty break the function
    if (this.formData.charts.length == 0) return;
    // intial grid to get existing chart n workspaces
    let grid = await GridStack.init();

    // remaping chart position yang berada di workspace sekarang
    // tujuan nya agar position chart selalu mengikuti yang ada di workspace
    let remaping = remapingChartPosition(grid.engine.nodes, setWorkspaceData(this.formData));
    if (remaping.id == null) {
      // start create dashboard
      // hit end point create to get id dashboard
      let resultCreateDashboard = await helperPostData(
        '/api/dashboard/create',
        setCreateDashboard(remaping),
        this.service
      );
      // set id from resultCreateDashboard
      remaping.id = resultCreateDashboard.id;
      // set slug from resultCreateDashboard
      remaping.slug = resultCreateDashboard.slug;
      // hit end point edit to get set position grid dashboard
      this.helperPostDashboard(remaping);
    } else {
      // remaping chart position yang berada di workspace sekarang
      // tujuan nya agar position chart selalu mengikuti yang ada di workspace
      this.helperPostDashboard(remaping);
    }
    this.isLoadingContent = false;
  };

  async submit(data) {
    let url = this.static_url;
    if (this.formData.slug) {
      url = `${this.static_url}/${this.formData.slug}`;
    }

    const val = await this.service.postApi(url, data, true);
    if (val.status) {
      if (val.result.response != null) {
        this.store.dispatch(setApplicationById({ item: val.result.response }));
        this.route.navigate(['/pds/applicationbuilder_app'], {
          queryParams: { link: val.result.response.slug },
        });
        this.notificationService.setNotif();
        this.formData = val.result.response;
        this.store.dispatch(SetMenuBuilderDetail({ item: this.formData }));
        this.store.dispatch(GetApplicationList());
      }
      this.changeDetector.detectChanges();
    }
  }
  handleAction = (event) => {
    switch (event.name) {
      case 'share':
        this.actionShare();
        break;
      case 'refresh':
        this.store.dispatch(SetExtraFilter({ extraFilter: [] }));
        this.store.dispatch(isReloadCard({ status: true }));
        break;
      case 'download':
        this.onChartDownload();
        break;
      case 'share_chart':
        this.shareAction('chart');
        break;
      case 'share_api':
        this.shareAction('api');
        break;
      case 'embed_chart':
        this.shareAction('embed');
        break;
      case 'fullscreen':
        on_full_screen();
        break;
      case 'dark':
      case 'light':
        this.actionShare(event.name);
        break;
      case 'send_email':
        this.shareToEmail();
        break;
      default:
        break;
    }
  };

  handleResetObjectChart = () => {
    const sharedChartDataObj = {
      themes: [],
      title: 'Untitled',
      hasActivity: true,
      index: null,
      myChartID: '',
      data: null,
      typeChart: 'preview',
      mapGeoJSON: null,
      url: null,
      explore: {
        form_data: initial_form_data(null),
      },
      exploreJson: {
        form_data: initial_form_data(null),
      },
    };
    this.store.dispatch(PostSharedChartData(sharedChartDataObj));
    this.store.dispatch(SetFormData({ item: sharedChartDataObj.exploreJson.form_data }));
  };

  buttonNew(event) {
    // set slug id
    this.slugId = '';
    // new ruoute
    switch (this.typePage) {
      case 'application':
        // new ruoute
        this.route.navigate(['/pds/applicationbuilder_app']);

        // create intial form data
        this.intialEditor();
        break;
      case 'dashboard':
        this.route.navigate(['/pds/dashboardeditor']);
        this.intialEditor();
        break;
      case 'chart':
        if (event == 'save') {
          this.handleSaveChart();
        } else {
          this.handleResetObjectChart();
          this.route.navigate(['/pds/newdatavisualization']);
        }

        break;
      default:
        break;
    }

    // intial variable baru
    this.ngOnInit();
  }
  async buttonView() {
    this.messages = await this.jsonService.retMessage();
    const me = this;
    if (!this.slugId) {
      let detailMessage =
        this.typePage === 'application' ? this.messages.APPLICATIONS.MSG_PSAF : this.messages.DASHBOARD.MSG_PSDF;
      this.service.openModal(this.messages.APPLICATIONS.W, detailMessage);
      return;
    } else {
      if (this.typePage === 'application') {
        const url = this.route.serializeUrl(
          this.route.createUrlTree(['pds', 'app_preview'], {
            queryParams: {},
          })
        );
        window.open(`#${url}?link=${me.formData.slug}`, '_blank');
      } else if (this.typePage === 'dashboardview') {
        this.route.navigate(['/pds/dashboardeditor'], {
          queryParams: { link: this.slugId },
        });
      } else {
        this.route.navigate(['/pds/dashboard/view'], {
          queryParams: { link: this.slugId },
        });
      }
    }
  }

  titleChange(title) {
    switch (this.typePage) {
      case 'chart':
        this.formData = { ...this.formData, name: title };
        break;
      case 'application':
        this.formData = {
          ...this.formData,
          title: title,
          menu: this.menu,
          options: {
            ...this.formData.options,
            menu: this.menu,
          },
        };
        break;
      case 'dashboard':
        this.formData = { ...this.formData, dashboard_title: title };
        break;
      default:
        break;
    }
    this.topbarOptions.title = title;
    this.store.dispatch(SetMenuBuilderDetail({ item: this.formData }));
    this.changeDetector.detectChanges();
  }

  async loadItem(item) {
    this.isLoadingContent = true;
    switch (this.typePage) {
      case 'chart':
        if (item.action === 'dataset') {
          this.topbarOptions.title = 'Untitled';
          await this.getDataChart(item);
        } else {
          this.topbarOptions.title = item.name;
          this.loadChartTo(item);
        }

        break;
      case 'application':
        this.topbarOptions.title = item.title;
        this.store.dispatch(setApplicationById({ item }));
        this.loadApplicationTo(item);
        break;
      case 'dataset':
        this.topbarOptions.title = 'Untitled';
        break;
      case 'dashboard':
        if (item.from === 'dashboard' && item.action === 'dashboard') {
          this.store.dispatch(PostDashboardChartData({ dashboardCharts: [] }));
          this.loadDashboardTo(item);
        } else if (item.from === 'dashboard' && item.action === 'chart') {
          this.loadChartToWorkspace(item);
        }
        break;
      default:
        break;
    }
    this.isLoadingContent = false;
  }

  async loadApplicationTo(item) {
    this.messages = await this.jsonService.retMessage();
    this.route.navigate(['/pds/applicationbuilder_app'], {
      queryParams: { link: item.slug },
    });
    this.preparingData(item);
  }

  async loadChartTo(item) {
    this.route.navigate(['/pds/newdatavisualization'], {
      queryParams: { slice_id: item.id },
    });
    this.preparingData(item);
  }
  async loadDatasetTo(item) {
    this.store.dispatch(SetItemDataset({ item: item }));
  }
  async loadDashboardTo(item) {
    this.route.navigate(['/pds/dashboardeditor'], {
      queryParams: { link: item.slug, id: item.id },
    });
    this.preparingData(item);
  }

  // start for chart

  createChart() {
    // code for create viewcontainer ref
    const viewContainerRef = this.injectComp.viewContainerRef;
    viewContainerRef.createComponent(BasicChartComponent);
  }

  async handleEventButton(event: any) {
    switch (event.type) {
      case 'refresh':
        this.onChartRefresh(event.slice_id);
        break;
      case 'download':
        this.onChartDownload(event.slice_id);
        break;
      case 'edit':
        this.onChartEdit();
        break;

      case 'fullscreen':
        on_full_screen_id(event.element_id);
        break;
    }
  }

  onChartDownload = async (id?) => {
    let resultExplorer = await loadChartData(
      `api/chart/explore/?form_data=%7B%22slice_id%22%3A${Number(id ? id : this.slugId)}%7D`,
      {},
      this.messages,
      this.service
    );
    let param = { form_data: JSON.stringify(resultExplorer.form_data) };
    await this.httpFile
      .post(
        `/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A${Number(id ? id : this.slugId)}%7D&csv=true`,
        param,
        {
          responseType: 'blob',
        }
      )
      .subscribe((resp: any) => {
        FileSaver.saveAs(resp, resultExplorer.slice.datasource + ' ' + resultExplorer.slice.slice_name + `.csv`);
      });
  };
  shareAction = async (type) => {
    this.loadingGeneral = true;
    let result = null;
    result = await this.service.postApi(`api/chart/getshare/chart`, { id: Number(this.slugId) });

    let message = '';
    switch (type) {
      case 'api':
        copy_url(`${location.origin}/api/chart/api?${result.result.response}`);
        message = this.messages.CHART.MSG_SAS;
        break;
      case 'chart':
        copy_url(`${location.origin}/#/pdsshare/sharevisualization?${result.result.response}`);
        message = this.messages.CHART.MSG_CUS;
        break;
      case 'embed':
        copy_url(`<iframe width="600" height="400" seamless frameBorder="0" scrolling="no"
          src="${location.origin}/chart/shared?${result.result.response}&height=400">
         </iframe>`);
        message = this.messages.CHART.MSG_SES;
        break;
      default:
        break;
    }
    this.loadingGeneral = false;
    this.service.openModal(this.messages.CHART.S, message);
  };

  onChartEdit() {
    alert('edit');
  }

  onChartRefresh(id) {
    this.isLoadingContent = true;
    setTimeout(() => {
      this.isLoadingContent = false;
      this.changeDetector.detectChanges();
    }, 1000);
  }

  openModalTemplateCustom() {
    this.modalReference = this.modalService.open(ModalSaveChartComponent, {
      size: 'md',
      centered: true,
    });
    this.modalReference.componentInstance.hasFlaging = this.hasFlaging;
    this.modalReference.componentInstance.slice = { slice_id: this.slugId };
    this.modalReference.componentInstance.data = this.topbarOptions;
    this.modalReference.componentInstance.hasFlagingControl = this.hasFlagingControl;
    this.modalReference.result.then(
      (res) => {
        this.hasFlaging = res.hasFlaging;
        this.topbarOptions = { ...this.topbarOptions, title: res.title };

        this.handleSaveChart();
      },
      (reason: any) => {}
    );
  }

  // end for chart

  // start for dashboard
  loadChartToWorkspace = (item, isSelect?) => {
    const chartIdList = this.formData.position_json?.map((item: any) => item.slice_id) || [];

    if (chartIdList.some((id: string) => Number(id) === item.id)) {
      this.service.openModal(this.messages.DASHBOARD.F, this.messages.DASHBOARD.MSG_CAECAC);
      return;
    }

    this.store.dispatch(SetInsertChartDashboard({ item }));
  };

  async actionShare(skin?) {
    this.loadingGeneral = true;
    this.messages = await this.jsonService.retMessage();
    let result = await this.service.postApi('api/dashboard/getshareurl', { id: this.formData.id });
    let token = result.result['response'] ? result.result['response'].split('token=') : result.result.split('token=');
    this.shareUrl = token[1];
    // set data share url with token
    let shareUrl = `${location.origin}/#/pdsshare/dashboard/view/shared?token=${token[1]}${
      skin ? `&theme=${skin}` : ''
    }`;
    copy_url(shareUrl);
    this.loadingGeneral = false;
    this.service.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_DSC);
  }

  shareToEmail() {
    let subject = this.topbarOptions.title;
    let body = location.origin + '/#/pdsshare/dashboard/view/shared?token=' + this.shareUrl;
    location.href = 'mailto:?subject=' + subject + '&body=' + body;
  }

  // end for dashboard

  // start app_preview
  toggleCustomMenu() {
    $('body').toggleClass('menu-displayed');
  }

  // menu = [];
  async setSelectedItem(event) {
    this.grid = GridStack.init(initialOptionGridStackOnViewOnly);
    this.grid.removeAll();
    this.store.dispatch(PostDashboardChartData({ dashboardCharts: [] }));
    this.selectedMenu = event;
    // let item = this.dashboardList.find((obj) => obj.slug == event.slug);
    this.isLoadingContent = true;
    let item = await helperGetData(`/api/dashboard/view?link=${event.slug}`, this.service);
    item = setWorkspaceData({ ...item.dashboard_data, charts: this.handleAppPreview(item.dashboard_data.slices) });
    this.initialOnLoadData(item);
  }
  prepareApplication(menus) {
    let obj = [];
    menus.map((data) => {
      obj.push({ ...data, children: data.children ? addChildren(data.children) : [] });
    });
    obj.forEach((node) => {
      this.prepareApplication(node.children);
    });
    this.menu = obj;
    this.changeDetector.detectChanges();
    // console.log(JSON.stringify(obj));
  }
  // end app_preview
}
