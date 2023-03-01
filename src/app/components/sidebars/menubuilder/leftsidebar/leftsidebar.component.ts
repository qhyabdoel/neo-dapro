import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ModalDuplicateChartComponent } from 'src/app/components/modals/modalDuplicateChart/modal-duplicate-chart.component';
import { JsonService, MenuConfigService, TranslationService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';
import {
  checked_unchecked_all,
  checked_unchecked_list,
  search_regex,
  search_regex_four,
  search_regex_two,
} from 'src/app/libs/helpers/utility';
import { ApiService, LayoutUtilsService } from 'src/app/libs/services';
import {
  GetApplicationList,
  GetChartDatasource,
  GetChartList,
  GetDashboardList,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  applicationListSelector,
  chartDatasourceSelector,
  chartListSelector,
  dashboardListSelector,
  leftbarOptionSelector,
  menuBuilderSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { collectingChartByDashboardId } from 'src/app/pages/pds/datavisualization/dashboardeditor/helperDashboardEditor';
import {
  dropdownApplication,
  dropdownChart,
  dropdownChartOnDashboard,
  dropdownDashboard,
  dropdownDataset,
} from './helper-leftbar';
@Component({
  selector: '[leftbar-component]',
  templateUrl: './leftsidebar.component.html',
})
export class LeftbarMenuBuilderComponent implements OnInit {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  isShowLeftMenu$: Observable<boolean>;
  @Output() itemto: EventEmitter<any> = new EventEmitter<any>();
  modalReference: NgbModalRef;
  // variable boolean
  isCheckedAll: boolean = false;
  isLeftToggle: boolean = false;
  isLoadingList: boolean = true;
  // varibale string
  searchText: string = '';
  url: string = '';
  selectedTypeOption: string = '';
  // variable any
  messages: any;
  valSelected: any = {};
  loaderIncludes: any = [];
  masterDatas: any = [];
  lists: any = [];
  selectedItemFromList: any;
  selectedlistforDelete: any = [];
  selectedOptionId: any = 0;
  options: any = [];
  dropdownOptions: any = [];
  tempItemSelected: any;
  visualizationTypeList: [];
  chartList: [];
  activeId: any = 0;
  constructor(
    private menuService: MenuConfigService,
    private _apicall: ApiService,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private modalService: NgbModal,
    private activeRoute: ActivatedRoute
  ) {
    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        this.setSelectedItem(res);
      }
    });

    this.store
      .select(leftbarOptionSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.options = result;
          if (['dashboard', 'application', 'chart'].includes(findTypeCheckByUrl())) {
            this.initial();
          }
        }
      });
    this.store
      .select(applicationListSelector)
      .pipe()
      .subscribe((result) => {
        if (result && this.valSelected.name === 'application') {
          this.lists = [];
          this.setState(result);
          this.changeDetector.detectChanges();
        }
      });
    this.store
      .select(chartListSelector)
      .pipe()
      .subscribe((result) => {
        if (result && (this.valSelected.name === 'chart' || this.valSelected.name === 'dashboard')) {
          if (this.valSelected.name === 'chart') {
            this.setState(result);
            // this.setSelectedItem(result.response);
          } else if (this.valSelected.name === 'dashboard') {
            this.chartList = result.response;
          }
          this.changeDetector.detectChanges();
        }
      });
    this.store
      .select(dashboardListSelector)
      .pipe()
      .subscribe((result) => {
        if (result && this.valSelected.name === 'dashboard') {
          this.setState(result);
          this.setSelectedItem(result.response);
          this.changeDetector.detectChanges();
        }
      });
    this.store
      .select(chartDatasourceSelector)
      .pipe()
      .subscribe((result) => {
        if (result && this.valSelected.name === 'dataset') {
          this.setState(result);
          this.changeDetector.detectChanges();
        }
      });
    // this.handleCheckSelector();
  }

  handleCheckSelector = async () => {
    if (this.valSelected.name) {
      switch (this.valSelected.name) {
        case 'application':
          this.store
            .select(applicationListSelector)
            .pipe()
            .subscribe((result) => {
              if (result && this.valSelected.name === 'application') {
                this.setState(result);
                this.changeDetector.detectChanges();
              }
            });
          break;
        case 'chart':
        case 'dashboard':
          this.store
            .select(chartListSelector)
            .pipe()
            .subscribe((result) => {
              if (result && (this.valSelected.name === 'chart' || this.valSelected.name === 'dashboard')) {
                if (this.valSelected.name === 'chart') {
                  this.setState(result);
                  // this.setSelectedItem(result.response);
                } else if (this.valSelected.name === 'dashboard') {
                  this.chartList = result.response;
                }
                this.changeDetector.detectChanges();
              }
            });
          this.store
            .select(dashboardListSelector)
            .pipe()
            .subscribe((result) => {
              if (result && this.valSelected.name === 'dashboard') {
                this.setState(result);
                this.setSelectedItem(result.response);
                this.changeDetector.detectChanges();
              }
            });
          break;
        case 'dataset':
          this.store
            .select(chartDatasourceSelector)
            .pipe()
            .subscribe((result) => {
              if (result && this.valSelected.name === 'dataset') {
                this.setState(result);
                this.changeDetector.detectChanges();
              }
            });
          break;

        default:
          this.store
            .select(leftbarOptionSelector)
            .pipe()
            .subscribe((result) => {
              if (result) {
                this.options = result;
                if (['dashboard', 'application', 'chart'].includes(findTypeCheckByUrl())) {
                  this.initial();
                }
              }
            });

          this.store.select(menuBuilderSelector).subscribe((res) => {
            if (res) {
              if (res) {
                this.setSelectedItem(res);
              }
              this.changeDetector.detectChanges();
            }
          });
          break;
      }
    }
  };

  setSelectedItem = (res) => {
    const [base_route, param] = window.location.hash.split('?');
    let params = new URLSearchParams(param);
    if (params.get('slice_id')) {
      this.selectedItemFromList = res;
    } else if (params.get('link') && findTypeCheckByUrl() === 'dashboard') {
      let item = this.lists.find((data) => data.slug == params.get('link'));
      this.selectedItemFromList = item;
    } else {
      this.selectedItemFromList = res;
    }
    this.changeDetector.detectChanges();
  };

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.isShowLeftMenu$ = this.menuService.getLeftShowMenu;
    let visualType = await this._apicall.getApi(
      '/assets/data/datavisualization/visual_type_' + this.translationService.getSelectedLanguage() + '.json'
    );
    this.visualizationTypeList = visualType.result[0].visual_type_chart_list.slice();
  }

  async initial() {
    this.isCheckedAll = false;
    this.selectedlistforDelete = [];
    const [base_route, param] = window.location.hash.split('?');
    let params = new URLSearchParams(param);
    if (this.options && ['dashboard', 'application', 'chart'].includes(findTypeCheckByUrl())) {
      if (params.get('slice_id')) {
        this.setActiveTab(1);
      } else if (params.get('link') && findTypeCheckByUrl() === 'dashboard') {
        this.setActiveTab(1);
      } else {
        this.setActiveTab(0);
      }
    }
  }

  setActiveTab = async (indexActive) => {
    await this.options.map((data, index) => {
      if (index === indexActive) {
        this.valSelected = data;
        this.url = data.getUrl;
      }
    });
    this.tabOnClick(this.valSelected.name);
  };

  setState = (result) => {
    this.isLoadingList = false;
    if (this.lists.length === 0) {
      let res = result.response;
      if (res.length > 0) {
        res = res.map((item) => ({
          ...item,
          isChecked: false,
        }));
      }
      this.masterDatas = res;
      this.lists = res;
    }
    this.changeDetector.detectChanges();
  };

  loadList = async () => {
    this.isLoadingList = true;
    this.lists = [];
    let typePage = findTypeCheckByUrl();
    // call api for application list
    switch (this.valSelected.name) {
      case 'chart':
        this.store.dispatch(GetChartList());
        this.store.dispatch(GetChartDatasource());
        this.dropdownOptions = ['dashboard', 'dashboardview'].includes(typePage)
          ? dropdownChartOnDashboard
          : dropdownChart;
        break;
      case 'application':
        this.store.dispatch(GetApplicationList());
        this.store.dispatch(GetDashboardList());
        this.dropdownOptions = dropdownApplication;
        break;
      case 'dataset':
        this.store.dispatch(GetChartDatasource());
        this.dropdownOptions = dropdownDataset;
        break;
      case 'dashboard':
        this.store.dispatch(GetChartList());
        this.store.dispatch(GetDashboardList());
        this.dropdownOptions = dropdownDashboard;
        break;
      default:
        break;
    }
  };

  searchList() {
    switch (this.valSelected.name) {
      case 'chart':
        this.lists = search_regex_four(
          this.masterDatas,
          this.searchText.toLowerCase(),
          'name',
          'viz_type',
          this.valSelected.searchField
        );
        break;
      case 'application':
        this.lists = search_regex(this.masterDatas, this.searchText.toLowerCase(), this.valSelected.searchField);
        break;
      case 'dataset':
        this.lists = search_regex_two(
          this.masterDatas,
          this.searchText.toLowerCase(),
          this.valSelected.searchField,
          'name'
        );
        break;
      case 'dashboard':
        this.lists = search_regex(this.masterDatas, this.searchText.toLowerCase(), this.valSelected.searchField);
        break;
      default:
        break;
    }
  }

  checkedList(id, isChecked) {
    this.selectedlistforDelete = checked_unchecked_list(
      isChecked,
      this.lists,
      this.selectedlistforDelete,
      id,
      this.valSelected.deleteIdField
    );
    if (this.selectedlistforDelete.length != 0 && this.selectedlistforDelete.length == this.lists.length)
      this.isCheckedAll = true;
  }

  checkUncheckAll() {
    let result = checked_unchecked_all(this.isCheckedAll, this.lists);
    this.lists = result[0];
    this.selectedlistforDelete = result[1];
    this.isCheckedAll = !this.isCheckedAll;
  }

  async multipleDelete() {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      `${this.messages.APPLICATIONS.C}!`,
      `${this.messages.DASHBOARD.MSG_DN} ${this.selectedlistforDelete.length} ${this.valSelected.name} ?`,
      `Deleting ${this.selectedlistforDelete.length} ${this.valSelected.name} ...`
    );

    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      this.selectedlistforDelete.map(async (data) => {
        await this.handleDeleteWithType(data);
      });
      this.selectedlistforDelete = [];
      this.initial();
      await this.loadList();
    });
  }

  async deletebyone(item) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      `${this.messages.APPLICATIONS.C}!`,
      `${this.messages.DASHBOARD.MSG_DN} ${this.valSelected.name} ?`,
      `${this.valSelected.title} is deleting ...`
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      await this.handleDeleteWithType(item);

      this.initial();
      this.loadList();
    });
  }

  handleDeleteWithType = async (item) => {
    switch (this.valSelected.name) {
      case 'chart':
        await this._apicall.postApi(this.valSelected.deleteUrl, { id: item.id }, true);
        break;
      case 'application':
        await this._apicall.postApi(`${this.valSelected.getUrl}/${item.slug}/delete`, {}, true);
        break;
      case 'dashboard':
        await this._apicall.getApi(`${this.valSelected.deleteUrl}?id=${item.id}`, true);
        break;
      default:
        break;
    }
  };

  tabOnClick = async (type) => {
    this.searchText = '';
    let itemFound = this.options.find((x) => x.name == type);
    if (itemFound) {
      this.valSelected = itemFound;
    }
    this.loadList();
    this.changeDetector.detectChanges();
  };

  duplicateChart(data) {
    this.modalReference = this.modalService.open(ModalDuplicateChartComponent, {
      centered: true,
    });
    this.modalReference.componentInstance.loadChart = this.loadList;
    this.modalReference.componentInstance.data = data;
    this.modalReference.componentInstance.handleSelectOption = this.handleSelectOption;

    this.modalReference.result.then(
      (res) => {
        this.modalService.dismissAll();
        this.selectedOptionId = 0;
      },
      (reason: any) => {}
    );
  }

  loadTo(item) {
    this.selectedItemFromList = item;
    this.selectedOptionId = 0;
    if (item.action.includes('delete')) {
      this.deletebyone(this.tempItemSelected);
    } else if (item.action.includes('duplicate')) {
      this.duplicateChart(this.tempItemSelected);
    } else {
      this.doubleClickAction(this.tempItemSelected);
    }
  }

  doubleClickAction = (item) => {
    let obj = {
      ...item,
      from: findTypeCheckByUrl(),
      action: this.valSelected.name,
    };
    this.setSelectedItem(obj);
    this.itemto.emit(obj);
  };

  hideAndShowLeftbar() {
    this.isLeftToggle = !this.isLeftToggle;
    this.layoutUtilsService.addRemoveBodyClass('left', this.isLeftToggle, false);
  }

  handleSelectOption = (item) => {
    this.tempItemSelected = item;
    this.selectedTypeOption =
      this.valSelected.name === 'dataset' ? 'uid' : this.valSelected.name === 'application' ? '__application_id' : 'id';
    this.selectedOptionId = this.selectedOptionId !== item[this.selectedTypeOption] ? item[this.selectedTypeOption] : 0;
  };

  getChartNameById(dashboardId) {
    if (this.chartList && this.visualizationTypeList) {
      return collectingChartByDashboardId(dashboardId, this.chartList, this.visualizationTypeList);
    }
  }

  collapseDashboardAccordion = (id) => {
    if (this.valSelected.name === 'dashboard') {
      this.activeId = this.activeId !== id ? id : 0;
    }
  };
}
