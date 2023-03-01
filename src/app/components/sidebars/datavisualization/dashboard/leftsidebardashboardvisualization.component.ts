import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit, Input, Output } from '@angular/core';
import { ApiService, LayoutUtilsService, JsonService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import {
  search_regex,
  search_regex_two,
  checked_unchecked_list,
  checked_unchecked_all,
} from 'src/app/libs/helpers/utility';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { chartListSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import {
  DeleteChart,
  DeleteDashboard,
  GetChartList,
  GetDashboardList,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { Router } from '@angular/router';
import { DashboarddetailasyncComponent } from 'src/app/pages/pds/datavisualization/dashboarddetailasync/dashboarddetailasync.component';

@Component({
  selector: 'leftbar-dashboard-visualization',
  templateUrl: './leftsidebardashboardvisualization.component.html',
})
export class LeftSidebarDashboardVisualizationComponent implements OnInit, AfterViewInit {
  @Input() masterDataChart;
  @Input() masterDataDashboard;
  @Input() isLoadingCharts;
  @Input() isLoadingDashboards;
  @Input() dashboardList;
  @Input() messages;
  @Input() paramEdit;
  @Input() visualizationTypeList;
  @Input() chartList;
  @Input() gridPos;
  @Input() position;
  @Input() rowPosition;
  @Input() injectComp;
  @Input() component;
  @Input() index;

  @Input() charts;
  @Input() addCompChart: (type, ID, title, url, other, reference, component) => void;
  @Input() renderOverlay: (vizType, id, name) => void;
  @Input() removeDashboardFromContent: (other, reference) => void;
  @Input() getChartToSetDashboard: (url) => void;
  @Input() initial: () => void;
  @Input() loadDashboard: () => void;
  @Input() loadChart: () => void;
  @Input() initialDragDrop: () => void;
  @Input() loadDashboardToWorkspace: (data) => void;

  // additional dashboard

  // initial active tab default
  public activeTab: string = 'tabDashboard';
  public searchChartText: string;
  public searchDashboardText: string;

  // boolean
  public isCheckedAllDashboards: boolean = false;
  public isCheckedAllCharts: boolean = false;
  public isLoadingContent: boolean = false;
  public isLeftToggle: boolean = false;

  // array
  public selectedChartListforDelete: any = [];
  public selectedDashboardListforDelete: any = [];
  // additional dashboard

  constructor(
    private layoutUtilsService: LayoutUtilsService,
    private jsonService: JsonService,
    private _apicall: ApiService,
    private cdRef: ChangeDetectorRef,
    private store: Store<AppState>,
    private router: Router
  ) {}

  async ngOnInit() {}

  ngAfterViewInit() {}

  searchChart() {
    this.chartList = search_regex_two(this.masterDataChart, this.searchChartText.toLowerCase(), 'name', 'viz_type');
  }
  // handle tab active chart list and dashboard list
  // have 2 identity tabChart and tabDashboard
  tabOnClick(tab: string) {
    this.activeTab = tab;
  }

  checkUncheckAll(type) {
    if (type === 'dashboard') {
      let result = checked_unchecked_all(this.isCheckedAllDashboards, this.dashboardList);
      this.dashboardList = result[0];
      this.selectedDashboardListforDelete = result[1];
      this.isCheckedAllDashboards = !this.isCheckedAllDashboards;
    } else {
      let result = checked_unchecked_all(this.isCheckedAllCharts, this.chartList);
      this.chartList = result[0];
      this.selectedChartListforDelete = result[1];
      this.isCheckedAllCharts = !this.isCheckedAllCharts;
    }
  }
  async multipleDelete(type) {
    this.messages = await this.jsonService.retMessage();
    let me = this;
    let len = type == 'dashboard' ? this.selectedDashboardListforDelete.length : this.selectedChartListforDelete.length;
    let word =
      len > 1 ? (type == 'dashboard' ? ' dashboards' : ' charts') : type == 'dashboard' ? ' dashboard' : ' chart';
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.DASHBOARD.C,
      this.messages.DASHBOARD.MSG_DN + len + this.messages.DASHBOARD.SELECTED + word + ' ?',
      this.messages.DASHBOARD.D + len + word + '... '
    );

    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      if (type == 'dashboard') {
        for (var i = 0; i < len; i++) {
          // await this.store.dispatch(DeleteDashboard(this.selectedDashboardListforDelete[i].id));
          let url = '/api/dashboard/delete?id=' + this.selectedDashboardListforDelete[i].id;
          await this._apicall.getApi(url, true);
        }
        this.selectedDashboardListforDelete = [];
        this.initial();
        this.removeDashboardFromContent(true, this.injectComp);
        this.loadDashboard();
      }

      if (type == 'chart') {
        let selectedChart = this.selectedChartListforDelete;
        let rest = await Object.keys(this.selectedChartListforDelete).map(async function (n) {
          return await this.store.dispatch(DeleteChart(selectedChart[n].id));
        });

        if (rest) {
          me._apicall.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_PC);
          this.selectedChartListforDelete = [];
          this.initial();
          this.loadChart();
        } else {
          me._apicall.openModal(this.messages.DASHBOARD.F, this.messages.DASHBOARD.MSG_PF);
        }
      }
    });
  }

  checkedList(id, isChecked, type) {
    if (type === 'dashboard') {
      this.selectedDashboardListforDelete = checked_unchecked_list(
        isChecked,
        this.dashboardList,
        this.selectedDashboardListforDelete,
        id,
        'id'
      );
      if (
        this.selectedDashboardListforDelete.length != 0 &&
        this.selectedDashboardListforDelete.length == this.dashboardList.length
      )
        this.isCheckedAllDashboards = true;
    } else {
      this.selectedChartListforDelete = checked_unchecked_list(
        isChecked,
        this.chartList,
        this.selectedChartListforDelete,
        id,
        'id'
      );
      if (
        this.selectedChartListforDelete.length != 0 &&
        this.selectedChartListforDelete.length == this.chartList.length
      )
        this.isCheckedAllCharts = true;
    }
  }

  async delete(type, item) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.DASHBOARD.C,
      this.messages.DASHBOARD.MSG_DN + ' ' + type + '?',
      type + this.messages.DASHBOARD.DN
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      if (type == 'dashboard') {
        this.store.dispatch(DeleteDashboard(item.id));

        this.initial();
        this.removeDashboardFromContent(true, this.injectComp);
        this.loadDashboard();
      }
      if (type == 'chart') {
        this.store.dispatch(DeleteChart(item.id));

        this.initial();
        this.removeDashboardFromContent(true, this.injectComp);
        this.loadChart();
      }
    });
  }

  searchDashboard() {
    this.dashboardList = search_regex(
      this.masterDataDashboard,
      this.searchDashboardText.toLowerCase(),
      'dashboard_title'
    );
  }

  getChartNameById(id) {
    let filter = this.chartList.filter((x) => x.id == id);
    let visualizationType = filter && filter.length > 0 ? this.getVisutalizationTypeLabel(filter[0].viz_type) : ' - ';
    let name = filter && filter.length > 0 ? filter[0].name + ' | ' + visualizationType : '';
    return name;
  }

  getVisutalizationTypeLabel(visualizationTypeName: string) {
    var visualizationTypeDetail = this.visualizationTypeList.filter((v) => v['value'] == visualizationTypeName)[0];
    var visualizationLabel = visualizationTypeDetail == null ? ' - ' : visualizationTypeDetail['label'];
    return visualizationLabel;
  }

  // hide and show left bar
  // default idenity is true
  hideAndShowLeftbar() {
    this.isLeftToggle = !this.isLeftToggle;
    this.layoutUtilsService.addRemoveBodyClass('left', this.isLeftToggle, false);
  }

  refreshDashboard = () => {
    this.store.dispatch(GetDashboardList());
  };

  refreshChart = () => {
    this.store.dispatch(GetChartList());
  };

  // event load chart when double click on list dashboard
  // parameter (item)
  // async loadDashboardToWorkspace(item) {
  //   // navigate new slug with change url on browser tab
  //   this.router.navigate(['/pds/dashboardeditor'], {
  //     queryParams: { link: item.slug, id: item.id },
  //   });
  //   // remove all content chart on workspace
  //   this.removeDashboardFromContent(true, this.injectComp);

  //   // collecting chart object base on find in chart list
  //   item.charts.map((id) => {
  //     let object = this.chartList.find((obj) => obj.id == id);
  //     this.charts.push(object);
  //   });

  //   // set object parameter edit form parent
  //   this.paramEdit = {
  //     id: item.id,
  //     charts: item.charts,
  //     dashboard_title: item.dashboard_title,
  //     position_json: [],
  //     css: item.css,
  //     slug: item.slug,
  //     default_filters: item.default_filters,
  //     duplicate_slices: item.duplicate_slices,
  //   };

  //   this.isLoadingContent = true;
  //   this.getChartToSetDashboard(`/api/dashboard/view?link=${item.slug}`);
  //   this.cdRef.detectChanges();
  // }

  loadChartToWorkspace = (item, isSelect?) => {
    this.loadChartToComponent(item, isSelect);
    let elementId = `${this.index}_${item.viz_type}_${item.id}`;
    // inisiate this as a variable
    // important because if using this only is undefined
    let pointer = this;

    // must set timeout because element available after render is ready
    // inisiate 100ms is enough for waiting element ready
    setTimeout(async () => {
      await pointer.scrollContentToId(elementId);
    }, 100);
  };

  async loadChartToComponent(item, isSelect?) {
    // set static column is 6
    let column = 6;
    // set static row is 5
    let row = 5;

    // validate if chart is already in workspace
    // cannot add redundant chart
    if (this.charts.some((x) => x.id === item.id)) {
      this._apicall.openModal(this.messages.DASHBOARD.F, this.messages.DASHBOARD.MSG_CAECAC);
      return;
    }
    if (!isSelect) {
      this.charts = [...this.charts, item];
    }
    this.isLoadingContent = true;
    this.gridPos = {
      size_x: 0,
      size_y: 0,
      col: column,
      row: row,
    };
    this.position = column;
    this.rowPosition = row;
    let vizType = item.viz_type;
    if (vizType !== 'country_map2') {
      await this.addCompChart(vizType, item.id, item.name, '', true, this.injectComp, this.component);
    } else {
      await this.renderOverlay(vizType, item.id, item.name);
    }
    this.index++;
    // this.cdRef.detectChanges();
  }

  scrollContentToId(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
