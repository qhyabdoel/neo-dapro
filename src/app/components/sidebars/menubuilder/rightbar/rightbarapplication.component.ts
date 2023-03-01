import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { DialogAlertComponent } from 'src/app/components/dialogs/dialogAlert/dialog-alert.component';
import { ModalGlossaryComponent } from 'src/app/components/modals/modalGlossary/modalGlossary';
import { ModalIconDefault } from 'src/app/components/modals/modalIconDefault/modalIconDefault';
import { ModalLoginListComponent } from 'src/app/components/modals/modalLoginList/modalLoginList';
import { rest_api } from 'src/app/libs/configs';
import {
  findTypeCheckByUrl,
  handleExpandedNestedObject,
  handleMovedNestedObject,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  loadChartData,
} from 'src/app/libs/helpers/data-visualization-helper';
import { copy_url } from 'src/app/libs/helpers/utility';
import {
  ApiService,
  JsonService,
  LayoutUtilsService,
  NotificationService,
  TranslationService,
} from 'src/app/libs/services';
import {
  FlagingDynamicComponent,
  GetApplicationList,
  PostSharedChartData,
  SetActiveCollapseRightbar,
  SetFormData,
  SetMenuBuilderDetail,
  SetMenuBuilderSelectedItem,
  SetMenuList,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  dashboardListSelector,
  formDataChartSelector,
  menuBuilderSelectedItemSelector,
  menuBuilderSelector,
  menuListSelector,
  rightbarActiveCollapseSelector,
  sharedChartDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { environment } from 'src/environments/environment';
import apps from './../../../../../assets/data/applications.json';
import {
  findMenuAndChangeTitle,
  helperGenerateFormData,
  isValidate,
  setFormData,
  static_action_right_bar,
  static_form_data,
  sub_top_bar_type_action,
  top_bar_type_action,
  validateForm,
} from './helperRightbar';

@Component({
  selector: 'rightbar-application',
  templateUrl: './rightbarapplication.component.html',
})
/**
 *  centralize right bar
 *CHART
  - Datasource
  - Visualization Type
  - Query
  - Chart Option
  - Time
  - Filter
 *DASHBOARD
  - Dashboard Property
  - Dashboard Option

  Set up
  - Collapsible by Type
  - parsing data
 *APPLICATION
  - Application Property
  - Topbar Option
  - Sub topbar option
  - Option
 */
export class RightbarMenuBuilderComponent implements OnInit {
  @Output() itemto: EventEmitter<any> = new EventEmitter<any>();
  static_url = rest_api.API_APPLICATION_LIST;

  isDisabledProtectModule: boolean = true;
  isCheckedProtectModule: boolean = false;
  isLoadingContent: boolean = false;
  isRightBarToggle = true;
  isShow_global_search = false;

  // varibale string
  loadUrl: string;
  slugId: string;
  menuContentSelected: string;
  shareUrl: string;
  style1 = 'style1';
  style2 = 'style2';
  glosaryInformation = '';

  // variable any
  modalReference: NgbModalRef;
  messages: any;
  // textAction = '';
  formData: any = {};
  propertyMenuSelected: any = {};
  dashboardList: any = [];
  assetJsonData: any = [];
  menu: any = [];
  popupMessage: any = {
    title: '',
    desc: '',
  };
  iconStyle = [
    { id: 'style1', title: " {{ 'MODULE.DATA_APPLICATIONS.RIGHT_BAR.DI' | translate }}", value: true },
    { id: 'style2', title: "{{ 'MODULE.DATA_APPLICATIONS.RIGHT_BAR.CI' | translate }}", value: false },
  ];
  // buat ulang variable
  typePage: string;
  activeColapse: any = null;
  action_rightbar: any = null;
  // for chart only
  form_data_chart: any = null;
  visualType;
  explore: any = null;
  exploreJson: any = null;
  shareChartData: any;
  isFormValidate: boolean = false;
  validate_messages: Array<any> = [];
  constructor(
    private route: Router,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private store: Store<AppState>,
    private service: ApiService,
    private changeDetector: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    private modalService: NgbModal,
    private notificationService: NotificationService,
    private activedRoute: ActivatedRoute
  ) {
    this.loadUrl = this.route.url.replace('pds', 'api');
    const split = this.loadUrl.split('?');
    this.slugId = split.length > 1 ? split[1].split('=')[1] : '';
    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        this.initial(res);
      }
    });
    this.store.select(menuBuilderSelectedItemSelector).subscribe((res) => {
      if (res) {
        this.setActiveOptions(res);
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
    this.store.select(menuListSelector).subscribe((res) => {
      if (res) {
        this.menu = res;
        this.changeDetector.detectChanges();
      }
    });
    this.store.select(rightbarActiveCollapseSelector).subscribe((res) => {
      if (res) {
        this.activeColapse = res;
      }
    });

    this.store.select(formDataChartSelector).subscribe((res) => {
      if (res) {
        this.form_data_chart = res;
        this.visualType = res.viz_type;
      }
    });
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          this.shareChartData = result;
          this.visualType = result.typeChart;
          this.explore = result.explore;
          this.exploreJson = result.exploreJson;
          this.form_data_chart = result.exploreJson.form_data;

          this.changeDetector.detectChanges();
        }
      });
  }
  environtmentType: any;

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.isShow_global_search = data.global_search;
        this.environtmentType = environment.type;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
    this.assetJsonData = apps;
    this.typePage = findTypeCheckByUrl();

    this.activedRoute.queryParams.subscribe((params) => {
      if ('id' in params) {
        //set initial id and slug when dashboard have a id
        this.formData = this.dashboardList.find((obj) => obj.slug == this.slugId);
      }
    });
  }

  initial = (item?) => {
    if (item) {
      this.formData = item;
    } else {
      this.formData = static_form_data(this.assetJsonData);
      this.menu = [];
      this.propertyMenuSelected = {};
    }
    this.setRightBarValue();
  };

  initialSidebarOptions(item) {
    switch (this.typePage) {
      case 'application':
        this.action_rightbar = static_action_right_bar(
          item && item.options.publish ? this.messages.APPLICATIONS.UP : this.messages.APPLICATIONS.P,
          'zmdi zmdi-globe f-12 ml-1 p-0'
        );

        break;
      case 'chart':
        this.action_rightbar = static_action_right_bar(
          'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.APPLY_CHANGES',
          'zmdi zmdi-play f-12 ml-1'
        );
        break;
      default:
        break;
    }
  }

  setActiveOptions = (item) => {
    if (item) {
      this.menuContentSelected = item.title;
      this.propertyMenuSelected = item;
      if (item.options.topbar_option) {
        this.isLogoImage = item.options.topbar_option.logo !== '';
      }
    }
    this.setRightBarValue();

    if (this.propertyMenuSelected.slug) {
      this.isLoadingContent = true;
    }
    this.store.dispatch(SetMenuBuilderSelectedItem({ item: null }));
  };
  setRightBarValue() {
    if (this.formData.__application_id) {
      this.isLogoImage = this.formData.options.topbar_option.logo != '' ? true : false;
      this.glosaryInformation = `<h2>WYSIWYG Editor</h2>`;
      // topbar Property
      $('input#isLogoImage').prop('checked', this.formData.options.topbar_option.logo !== '');
      $('input#enable_global_search').prop('checked', this.formData.options.topbar_option.enable_global_search);
      $('input#enable_notification_center').prop(
        'checked',
        this.formData.options.topbar_option.enable_notification_center
      );
      $('input#enable_application_setting').prop(
        'checked',
        this.formData.options.topbar_option.enable_application_setting
      );
      $('input#checkboxGlossary').prop('checked', this.formData.options.topbar_option.enable_information_glossary);
      // subtopbar Property
      $('input#enable_breadcrumb').prop('checked', this.formData.options.sub_topbar_option.enable_breadcrumb);
      $('input#enable_refresh_page_button').prop(
        'checked',
        this.formData.options.sub_topbar_option.enable_refresh_page_button
      );
      if (this.propertyMenuSelected.id) {
        this.isCheckedProtectModule = this.propertyMenuSelected.enable_protect_module;
      }

      this.glosaryInformation = this.formData.options.topbar_option.text_information_glossary;
    }
  }

  collapseOnClick(collapseType: string) {
    this.activeColapse = { ...this.activeColapse, [collapseType]: !this.activeColapse[collapseType] };
  }

  async getShareUrl() {
    const url = 'api/dashboard/view?link=' + this.propertyMenuSelected.slug;
    const rest = await this.service.getApi(url);
    const result = rest.status ? (rest.result.response ? rest.result.response : rest.result) : rest;
    this.shareUrl = result.dashboard_data.share_url;
    setTimeout(() => {
      const item = {
        shareUrl: result.dashboard_data.share_url,
        menu: this.menu,
      };
      this.store.dispatch(FlagingDynamicComponent({ item: item }));
    }, 100);
  }

  openModalTemplate = (type) => {
    switch (type) {
      case 'loginList':
        this.modalReference = this.modalService.open(ModalLoginListComponent, {
          size: 'md',
          centered: true,
        });
        this.modalReference.componentInstance.assetJsonData = this.assetJsonData;
        this.modalReference.componentInstance.formData = this.formData;
        this.modalReference.componentInstance.menu = this.menu;
        this.modalReference.result.then(async (res: any) => {
          this.formData = res;
          this.submit();
        });
        break;
      case 'glossary':
        this.modalReference = this.modalService.open(ModalGlossaryComponent, {
          size: 'md',
          centered: true,
        });
        this.modalReference.componentInstance.glosaryInformation = this.glosaryInformation;
        this.modalReference.result.then(
          async (res: any) => {
            this.handleChangeApplication({ type: 'topbar_option', name: 'text_information_glossary', value: res });
          },
          (reason: any) => {}
        );
        break;
      default:
        break;
    }
  };

  async submit() {
    let url = '';
    if (this.formData.slug) {
      url = `${this.static_url}/${this.formData.slug}`;
    }

    const val = await this.service.postApi(url, this.formData, true);
    if (val.status) {
      if (val.result.response != null) {
        this.notificationService.setNotif();
        this.formData = val.result.response;
        this.menu = this.formData.options.menu;
        this.reMadeMenu();
      }
      // call api for application list
      this.store.dispatch(GetApplicationList());
      this.changeDetector.detectChanges();
    }
  }

  copyUrl = async () => {
    this.messages = await this.jsonService.retMessage();
    if (this.formData.options.publish) {
      const val =
        location.origin + '/#/auth/application_login?' + 'slug=' + this.formData.slug.trim().replace(/\s/gi, '_');
      copy_url(val);
      this.popupMessage.title = this.messages.APPLICATIONS.S;
      this.popupMessage.desc = this.messages.APPLICATIONS.MSG_ACS;
    } else {
      this.popupMessage.title = this.messages.APPLICATIONS.W;
      this.popupMessage.desc = this.messages.APPLICATIONS.MSG_VPAF;
    }
    this.service.openModal(this.popupMessage.title, this.popupMessage.desc);
  };

  iconMenuChange(e) {
    const value = e.target.value;
    this.propertyMenuSelected = {
      ...this.propertyMenuSelected,
      icon: '',
      options: {
        ...this.propertyMenuSelected.options,
        icon: '',
      },
    };

    if (value === 'style2') {
      this.modalReference = this.modalService.open(ModalIconDefault, {
        centered: true,
      });
      this.modalReference.result.then(
        async (res: any) => {
          this.propertyMenuSelected = {
            ...this.propertyMenuSelected,
            icon: res,
            options: {
              ...this.propertyMenuSelected.options,
              icon: res,
            },
          };
          this.menu = [...this.menu].map((data, i) => {
            if (data.id === this.propertyMenuSelected.id) {
              data = this.propertyMenuSelected;
            }
            return data;
          });
          console.log(this.menu);
          this.changeDetector.detectChanges();
          // let x = handleExpandedNestedObject(this.menu, this.propertyMenuSelected, this.propertyMenuSelected.id);
          // this.menu = x;
          // const targetIndex = this.menu.findIndex((c) => c.id === this.propertyMenuSelected.id);
          // console.log(this.propertyMenuSelected);
        },
        (reason: any) => {}
      );

      this.propertyMenuSelected.enable_icon_default = true;
      this.propertyMenuSelected.options.enable_icon_default = true;
    } else {
      this.propertyMenuSelected.enable_icon_default = false;
      this.propertyMenuSelected.options.enable_icon_default = false;
      this.updateMenu();
    }
  }

  errorHandler(event) {
    event.target.src = '/assets/images/logo_paques.svg';
  }

  updateMenuChildren(menuData:any, eventData:any) {
    if (menuData.children?.length > 0) {
      return {
        ...menuData,
        children: menuData.children.map((child:any) => {
          if (child.id === this.propertyMenuSelected.id) {
            child = { 
              ...child, 
              dashboard_id: eventData.id, 
              dashboard: { id: eventData.id, slug: eventData.slug }, 
              slug: eventData.slug 
            };
          } else {
            child = this.updateMenuChildren(child, eventData); 
          }

          return child;
        })
      }
    }

    return menuData;
  }

  updateMenu(event?) {
    let me = this;
    if (event) {
      this.propertyMenuSelected = {
        ...this.propertyMenuSelected,
        dashboard_id: event.id,
        dashboard: { id: event.id, slug: event.slug },
        slug: event.slug,
      };
      let test = this.menu.map((data) => {
        if (data.id === this.propertyMenuSelected.id) {
          data = { ...data, dashboard_id: event.id, dashboard: { id: event.id, slug: event.slug }, slug: event.slug };
        } else {
          data = this.updateMenuChildren(data, event);
        }

        return data;
      });

      this.menu = test;
      this.getShareUrl();
    }

    let terus = true;

    this.menu.forEach((element) => {
      if (element.id == this.propertyMenuSelected.id) {
        element = this.propertyMenuSelected;
        terus = false;
        this.changeDetector.detectChanges();
      }
      if (element.children && terus) {
        element.children.forEach((el) => {
          if (el.id == this.propertyMenuSelected.id) {
            el = this.propertyMenuSelected;
            terus = false;
            this.changeDetector.detectChanges();
          }
          if (el.children && terus) {
            el.children.forEach((e) => {
              if (e.id == this.propertyMenuSelected.id) {
                e = this.propertyMenuSelected;
                this.changeDetector.detectChanges();
              }
            });
          }
        });
      }
    });
    this.store.dispatch(SetMenuList({ item: this.menu }));
    this.formData = {
      ...this.formData,
      menu: this.menu,
      options: {
        ...this.formData.options,
        menu: this.menu,
      },
    };
    this.store.dispatch(SetMenuBuilderDetail({ item: this.formData }));
  }

  hideAndShowRightbar() {
    this.isRightBarToggle = !this.isRightBarToggle;
    this.layoutUtilsService.addRemoveBodyClass('right', false, this.isRightBarToggle);
  }
  reMadeMenu() {
    if (this.formData.options.menu == null) {
      return;
    }
    for (let i = 0; i < this.formData.options.menu.length; i++) {
      const element = this.formData.options.menu[i];
      element.enable_icon_default = element.options.enable_icon_default;
      element.enable_protect_module = element.options.enable_protect_module;
      element.icon = element.options.icon;
      if (element.children) {
        element.children.forEach((el) => {
          el.enable_icon_default = el.options.enable_icon_default;
          el.enable_protect_module = el.options.enable_protect_module;
          el.icon = el.options.icon;
          if (el.children) {
            el.children.forEach((e) => {
              e.enable_icon_default = e.options.enable_icon_default;
              e.enable_protect_module = e.options.enable_protect_module;
              e.icon = e.options.icon;
            });
          }
        });
      }
    }
  }
  checkboxActionMenu() {
    this.propertyMenuSelected.enable_protect_module = !this.propertyMenuSelected.enable_protect_module;
    this.propertyMenuSelected.options.enable_protect_module = !this.propertyMenuSelected.options.enable_protect_module;
    this.updateMenu();
  }

  validationPage = () => {
    let result = null;
    result = isValidate(this.menu, this.popupMessage, this.messages);
    this.popupMessage = result.popupMessage;
    return (result = result.validate);
  };
  async buttonPublish() {
    this.messages = await this.jsonService.retMessage();
    if (!this.formData.slug) {
      this.popupMessage.title = this.messages.APPLICATIONS.W;
      this.popupMessage.desc = this.messages.APPLICATIONS.MSG_PABP;
      this.service.openModal(this.popupMessage.title, this.popupMessage.desc);
      return;
    }
    if (!this.validationPage()) {
      this.service.openModal(this.popupMessage.title, this.popupMessage.desc);
      return;
    }
    this.isLoadingContent = true;
    const dialogRef = this.layoutUtilsService.saveElement(
      this.messages.APPLICATIONS.C,
      this.messages.APPLICATIONS.MSG_DYCPA,
      this.messages.APPLICATIONS.MSG_PAP,
      '',
      false
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      this.isLoadingContent = false;
      if (!res) {
        return;
      }
      this.formData = {
        ...this.formData,
        options: {
          ...this.formData.options,
          publish: !this.formData.options.publish,
        },
      };
      this.submit();
    });
  }
  async deleteByOne(item) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.APPLICATIONS.C,
      this.messages.APPLICATIONS.MSG_DN,
      this.messages.APPLICATIONS.AD
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      const url = `${this.static_url}/${item.slug}/delete`;
      await this.service.postApi(url, {}, true);
      this.initial();
      this.formData = static_form_data(this.assetJsonData);
      this.store.dispatch(GetApplicationList());
    });
  }
  onAccessProtectionChange(password: string) {
    if (password === '') this.isDisabledProtectModule = true;
    else this.isDisabledProtectModule = false;
  }

  isLogoImage: boolean;
  logoUrl: string;

  checkboxAction(type) {
    // minus isLogoImage
    if (top_bar_type_action.includes(type)) {
      this.formData = setFormData(this.formData, 'topbar_option', type);
    } else if (sub_top_bar_type_action.includes(type)) {
      this.formData = setFormData(this.formData, 'sub_topbar_option', type);
    } else {
      this.isLogoImage = !this.isLogoImage;
      if (this.isLogoImage) {
      } else {
        this.logoUrl = '';
      }
      this.formData = {
        ...this.formData,
        options: {
          ...this.formData.options,
          logo_login: this.logoUrl,
          topbar_option: {
            ...this.formData.options.topbar_option,
            logo: this.logoUrl,
          },
        },
      };
    }

    this.store.dispatch(SetMenuBuilderDetail({ item: this.formData }));
  }

  handleChange = (event) => {
    this.propertyMenuSelected = { ...this.propertyMenuSelected, title: event };
    this.store.dispatch(SetMenuBuilderSelectedItem({ item: this.propertyMenuSelected }));
    this.store.dispatch(SetMenuList({ item: findMenuAndChangeTitle(this.menu, this.propertyMenuSelected.id, event) }));
  };

  handleActionRightbar = () => {
    if (this.typePage === 'application') {
      this.buttonPublish();
    } else {
      this.runQuery();
    }
  };

  refreshDashboard = (item) => {
    this.itemto.emit(item);
  };

  getDataChart = async (params) => {
    // code for get explore for create chart on card
    let explore_json = await loadChartData(`/api/v2/chart/explore_json/`, params, this.messages, this.service);
    if (typeof explore_json !== 'string') {
      const sharedChartDataObj = {
        ...this.shareChartData,
        typeChart: this.visualType ? this.visualType : this.explore.form_data.viz_type,
        explore: this.form_data_chart
          ? {
              ...this.explore,
              form_data: {
                ...explore_json.form_data,
              },
            }
          : null,
        exploreJson: explore_json ? explore_json : null,
      };
      this.store.dispatch(PostSharedChartData(sharedChartDataObj));
      // this.store.dispatch(SetFormData({ item: sharedChartDataObj.exploreJson.form_data }));
    }
    this.isLoadingContent = false;
    this.changeDetector.detectChanges();
  };

  runQuery = async () => {
    let form_data = null;
    let datasource = '';
    let datasource_name = '';
    let result = null;
    result = await validateForm(this.visualType, this.form_data_chart, this.messages);
    this.validate_messages = result.validate_messages;
    if (result.isFormValidate) {
      this.alertDialog();
    } else {
      let objectModify = helperGenerateFormData(this.visualType, this.form_data_chart);
      form_data = objectModify.modify_form_data;
      this.formData = objectModify.form_data;
      datasource = this.explore.form_data.datasource;
      if (this.visualType == 'table') {
        datasource = this.explore.form_data.datasource.split('__')[0];
      }
      datasource_name = this.explore.form_data.datasource_name;
      form_data = {
        ...form_data,
        datasource: this.explore.form_data.datasource,
        datasource_name: this.explore.form_data.datasource_name,
        slice_id: this.explore.form_data.slice_id,
      };
      let param = { form_data: JSON.stringify(form_data) };
      this.isLoadingContent = true;
      await this.getDataChart(param);
    }
  };

  alertDialog = () => {
    if (this.validate_messages.length > 0) {
      this.modalReference = this.modalService.open(DialogAlertComponent, {
        centered: true,
      });
      this.modalReference.componentInstance.isFormValidate = this.isFormValidate;
      this.modalReference.componentInstance.validate_messages = this.validate_messages;
      this.validate_messages = [];
    }
  };
  helperDisplayViewTable = (name, value) => {
    /**if choose table
     * !table_grid_view && !gridview_list_view
     *
     * if choose grid
     * form_data.table_grid_view && !form_data.gridview_list_view
     *
     * if chose list
     * form_data.table_grid_view && form_data.gridview_list_view
     */
    if (value.target.value === 'table') {
      this.form_data_chart = {
        ...this.form_data_chart,
        [name]: value.target.value,
        table_grid_view: false,
        gridview_list_view: false,
      };
    }

    if (value.target.value === 'grid') {
      this.form_data_chart = {
        ...this.form_data_chart,
        [name]: value.target.value,
        table_grid_view: true,
        gridview_list_view: false,
      };
    }

    if (value.target.value === 'list') {
      this.form_data_chart = {
        ...this.form_data_chart,
        [name]: value.target.value,
        table_grid_view: true,
        gridview_list_view: false,
      };
    }
  };

  handleChangeFormData = (event) => {
    const { type, value, name } = event;
    switch (type) {
      case 'select':
      case 'select_specific_object':
        if (name === 'display_view_table') {
          this.helperDisplayViewTable(name, value);
        } else {
          this.form_data_chart = {
            ...this.form_data_chart,
            [name]: value.target.value,
          };
        }
        break;
      case 'checkbox':
        this.form_data_chart = {
          ...this.form_data_chart,
          [name]: value.target.checked,
        };
        break;
      case 'radio':
        this.form_data_chart = {
          ...this.form_data_chart,
          [name]: value.value,
        };
        break;
      case 'ng-select':
      case 'date':
      case 'input':
        this.form_data_chart = {
          ...this.form_data_chart,
          [name]: value,
        };
        break;
      default:
        break;
    }
    this.store.dispatch(SetFormData({ item: this.form_data_chart }));
  };
  handleChangeApplication = (event) => {
    const { type, value, name } = event;
    switch (type) {
      case 'options':
        this.formData = {
          ...this.formData,
          options: {
            ...this.formData.options,
            [name]: value,
          },
        };
        break;
      case 'form_data':
        this.formData = {
          ...this.formData,
          [name]: value,
        };
        break;
      case 'topbar_option':
        this.formData = {
          ...this.formData,
          options: {
            ...this.formData.options,
            topbar_option: {
              ...this.formData.options.topbar_option,
              [name]: value,
            },
          },
        };
        break;

      default:
        break;
    }
    this.store.dispatch(SetMenuBuilderDetail({ item: this.formData }));
  };
}
