import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import * as introJs from 'intro.js/intro.js';
import { ModalDuplicateChartComponent } from 'src/app/components/modals/modalDuplicateChart/modal-duplicate-chart.component';
import { search_regex_four, search_regex_two } from 'src/app/libs/helpers/utility';
import { TranslationService, JsonService, LayoutUtilsService, ApiService } from 'src/app/libs/services';
import {
  DeleteChart,
  DeleteDashboard,
  GetChartDatasource,
  GetChartList,
  SetItemDataset,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { chartDatasourceSelector, chartListSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: 'leftbar-datavisualization',
  templateUrl: './leftsidebarvisualization.component.html',
  styleUrls: ['./chartsidebar.scss'],
})
export class LeftbarChartVisualizationComponent implements OnInit {
  public modalReference: NgbModalRef;
  public isLoadingDataset: boolean = false;
  public datasetList: any = [];
  public masterDataDataset: any;
  public searchDatasetText: string;
  public isLeftToggle: boolean = false;
  public isRightToggle: boolean = false;
  public messages: any;
  public slice: any = {};
  public isLoadingCharts: boolean = false;
  public searchChartText: string;
  public masterDataChart: any;
  public clicked: boolean = false;
  public chartList: any = [];
  public selectedChartListforDelete: any = [];
  public activeTab: string = 'tab1';
  public isCheckedAllItem: boolean = false;
  public selectedOptionId: any = 0;
  public selectedTypeOption: string = '';

  constructor(
    private translationService: TranslationService,
    private jsonService: JsonService,
    private cdRef: ChangeDetectorRef,
    private store: Store<AppState>,
    private layoutUtilsService: LayoutUtilsService,
    private router: Router,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  introJS = introJs();
  async getIntro(user?: any) {
    if (!user.isFirst.isListVisualizationChart) return;
    user.isFirst = { ...user.isFirst, isListVisualizationChart: false };
    localStorage.setItem('user', JSON.stringify(user));
    let intro: any = await this.jsonService.retIntro(this.translationService.getSelectedLanguage());
    this.introJS
      .setOptions({
        steps: intro.listchart,
        skipLabel: 'Skip',
        showBullets: true,
        hintButtonLabel: 'OK',
        showProgress: false,
        hidePrev: true,
        hideNext: false,
      })
      .start();
  }

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.loadDataset();
    this.loadChart();
    this.route.queryParams.subscribe((params) => {
      if (params.slice_id != undefined) {
        this.slice = { slice_id: params.slice_id };
        this.tabOnClick('tab2');
      }
    });
  }

  async loadChart() {
    this.searchChartText = '';
    this.clicked = true;
    this.isLoadingCharts = true;
    this.masterDataChart = [];
    this.chartList = [];
    await this.store.dispatch(GetChartList());
    this.store
      .select(chartListSelector)
      .pipe()
      .subscribe((result) => {
        this.masterDataChart = result.response ? result.response : null;
        this.chartList = result.response
          ? result.response.map((item) => ({
              ...item,
              isChecked: false,
            }))
          : null;
      });
    this.isLoadingCharts = false;
    this.cdRef.detectChanges();
  }

  async loadDataset() {
    this.isLoadingDataset = true;
    this.masterDataDataset = [];
    this.datasetList = [];
    this.searchDatasetText = '';
    this.store.dispatch(GetChartDatasource());
    this.store
      .select(chartDatasourceSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.masterDataDataset = result.response;
          this.datasetList = result.response;
          this.isLoadingDataset = false;
        }

        this.cdRef.detectChanges();
      });
  }

  searchDataset() {
    this.isLoadingDataset = true;
    this.datasetList = search_regex_two(this.masterDataDataset, this.searchDatasetText.toLowerCase(), 'query', 'name');
    this.isLoadingDataset = false;
  }

  addRemoveBodyClass(className, type) {
    if (type == 'left') {
      this.isLeftToggle = !this.isLeftToggle;
      if (this.isLeftToggle) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
      window.dispatchEvent(new Event('resize'));
      return;
    }
    if (type == 'right') {
      this.isRightToggle = !this.isRightToggle;
      if (this.isRightToggle) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
      window.dispatchEvent(new Event('resize'));
    }
  }

  searchChart() {
    this.isLoadingCharts = true;
    this.chartList = search_regex_four(
      this.masterDataChart,
      this.searchChartText.toLowerCase(),
      'name',
      'viz_type',
      'ds_name'
    );
    this.isLoadingCharts = false;
  }

  openModalTemplateCustom(data) {
    this.modalReference = this.modalService.open(ModalDuplicateChartComponent, {
      centered: true,
    });
    this.modalReference.componentInstance.loadChart = this.loadChart;
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

  checkUncheckAll() {
    this.selectedChartListforDelete = [];
    this.isCheckedAllItem = !this.isCheckedAllItem;
    this.chartList = this.chartList.map((item) => {
      let data = {
        ...item,
        isChecked: !item.isChecked,
      };
      !item.isChecked && this.selectedChartListforDelete.push(data);
      return data;
    });
  }

  async multipleDelete() {
    this.messages = await this.jsonService.retMessage();
    let me = this;
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.CHART.C,
      this.messages.CHART.MSG_DYWDT +
        this.selectedChartListforDelete.length +
        this.messages.CHART.SELECTED +
        (this.selectedChartListforDelete.length > 1 ? ' charts' : ' chart') +
        ' ?',
      this.messages.CHART.MSG_DYWDT +
        this.selectedChartListforDelete.length +
        (this.selectedChartListforDelete.length > 1 ? ' charts' : ' chart') +
        '...'
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      let rest = await this.selectedChartListforDelete.map(async (item) => {
        return await me.apiService.postApi(
          '/api/chart/delete',
          {
            id: item.id,
          },
          false
        );
      });

      if (rest) {
        me.apiService.openModal(this.messages.CHART.S, this.messages.CHART.MSG_PC);
        this.selectedChartListforDelete = [];
        this.removeChartFromContent();
        this.loadChart();
      } else {
        me.apiService.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
      }
    });
  }

  getCheckedQuery(id, isChecked) {
    if (isChecked) {
      let selectedChart = this.chartList.filter((x) => x.id === id)[0];
      this.selectedChartListforDelete.push(selectedChart);
    } else {
      let selectedChart = this.selectedChartListforDelete.filter((x) => x.id !== id);
      this.selectedChartListforDelete = selectedChart;
    }
  }

  async onDelete(type, item) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.CHART.C,
      this.messages.CHART.MSG_DYWDT + ' ' + type + '?',
      type + this.messages.CHART.DN
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      if (type == 'dashboard') {
        await this.store.dispatch(DeleteDashboard({ id: item.id }));
        this.loadDataset();
        this.removeChartFromContent();
      } else {
        await this.store.dispatch(DeleteChart({ id: item.id }));
        await this.loadChart();
        this.removeChartFromContent();
      }
      this.selectedTypeOption = '';
      this.selectedOptionId = 0;
    });
  }

  async loadChartTo(item) {
    this.selectedTypeOption = '';
    this.selectedOptionId = 0;
    this.removeChartFromContent();
    return this.router.navigate(['/pds/newdatavisualization'], {
      queryParams: { slice_id: item.id },
    });
  }

  removeChartFromContent() {
    let element = document.getElementById('workspace');
    var nodes = Array.from(element.getElementsByTagName('pq-chartdetailasync'));
    if (nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {}
    }
  }

  tabOnClick(tab: string) {
    this.activeTab = tab;
  }

  async loadDatasetTo(item) {
    this.selectedTypeOption = '';
    this.selectedOptionId = 0;
    this.store.dispatch(SetItemDataset({ item: item }));
  }

  handleSelectOption = (type, id) => {
    this.selectedTypeOption = type;
    this.selectedOptionId = this.selectedOptionId !== id ? id : 0;
  };
}
