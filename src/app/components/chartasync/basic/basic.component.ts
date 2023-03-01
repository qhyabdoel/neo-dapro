import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import * as FileSaver from 'file-saver';
import { ApiService, DataVisualizationService, JsonService } from 'src/app/libs/services';
import { default as _rollupMoment } from 'moment';
import { getConfigChart } from './helper';
import {
  extraFilterSelector,
  isReloadCardSelector,
  selectedValueChartSelector,
  sharedChartDataSelector,
  sharedDashboardDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { alphabeth } from '../filterbox/helperFilterBox.component';
import { checked_unchecked_all, on_full_screen_id } from 'src/app/libs/helpers/utility';
import { loadChartData } from 'src/app/libs/helpers/data-visualization-helper';
import { helperGenerateFormData } from '../../sidebars/menubuilder/rightbar/helperRightbar';
import {
  isReloadCard,
  PostDashboardChartData,
  PostSharedChartData,
  SetExtraFilter,
  DeleteChartDashboard,
  setSelectedValueChart,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';
import { static_floating_card_dashboard } from 'src/app/libs/helpers/constant_datavisualization';
import { HttpClient } from '@angular/common/http';
import { static_row_limit } from 'src/app/libs/helpers/constant_datavisualization';
import { SetFormData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { ActivatedRoute, Router } from '@angular/router';
import {
  findSelectedValue,
  helperHandleExtraFilter,
  helperHandleFilterChartOnDashboard,
  helperInitialDate,
  helperLineChartOnClick,
} from './helper/helperBasic';

@Component({
  selector: '[pq-basic-chart-async]',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BasicChartComponent implements OnInit {
  @Input() myChartID: string;
  @Input() id: string;
  @Input() index: number;
  @Input() themes: any;
  @Input() autoResize: any;
  @Input() exploreJson: any;
  @Input() typeChart: string;
  @Input() data: any;
  // Input for dashboard
  @Input() isTemplate: string;
  @Input() chartIndex: number;
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  @Output() height: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeChart: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('myiFrame') public myiFrame;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  mycharts: any;
  chartOption: any;
  echartsInstance: any;
  activeClass = '';
  noData: boolean = false;
  isFullscreen: boolean = false;
  dataSource: MatTableDataSource<any>;
  displayedColumns = [];
  searchMultiCols: any = {};
  pagelength: any = [];
  alphabethList: any = alphabeth;
  datePickerView: string;
  filterCheckboxList: Array<any> = [];
  since = '';
  until = '';
  activeAlphabet: string = '';
  explore: any;
  pageIndex: number = 1;
  myHtml: SafeHtml;
  displayGrid: Array<any> = [];
  shareChartData: any;
  messages: any;
  realRecords: any;
  eventButtonData = static_floating_card_dashboard;
  viewColumnTable: boolean = false;
  tableColumnsList: Array<any> = [];
  listOfChartOnDashboard: Array<any> = [];
  isExtraFilter: Array<any> = [];
  isApplyDashboard: boolean = false;
  isPickDate: boolean = false;
  list_row_limit = static_row_limit;
  title: string;
  typePage: string;
  loadingChart: boolean = false;
  listFilterColumn: Array<any> = [];
  zoomCountryMap: number = 0;
  centroidMap: Array<any> = [];
  selectedFilter: string = '';
  indexSelected: string = '';
  idFilter: number;
  filteredChartType: string;
  constructor(
    private changeDetector: ChangeDetectorRef,
    private dataVisualizationService: DataVisualizationService,
    private store: Store<AppState>,
    private _apicall: ApiService,
    private _sanitizer: DomSanitizer,
    private jsonService: JsonService,
    private httpFile: HttpClient,
    private activeRoute: ActivatedRoute,
    private route: Router
  ) {
    let typePage = findTypeCheckByUrl();

    if (['dashboard', 'dashboardview', 'app_preview'].includes(typePage)) {
      this.store
        .select(sharedDashboardDataSelector)
        .pipe()
        .subscribe((result) => {
          this.typePage = typePage;
          if (this.chartIndex !== undefined && result.dashboardCharts.length > 0) {
            const chartData = result.dashboardCharts[this.chartIndex];

            if (chartData) {
              // share variable
              this.themes = chartData.themes;
              this.myChartID = chartData.myChartID;
              this.title = chartData.title;
              this.data = chartData.data;
              this.typeChart = chartData.typeChart;
              this.autoResize = chartData.autoResize;
              this.index = chartData.index;
              this.exploreJson = chartData.exploreJson;
              this.explore = chartData.explore;
              this.shareChartData = chartData;
              if (!chartData.exploreJson.form_data.initial_chart_blank) {
                this.setInitialPage();
              }
            }
            this.listOfChartOnDashboard = result.dashboardCharts;
          }
        });
    } else {
      this.store
        .select(sharedChartDataSelector)
        .pipe()
        .subscribe((result) => {
          this.typePage = typePage;
          // share variable
          this.themes = result.themes;
          this.myChartID = result.myChartID;
          this.data = result.data;
          this.typeChart = result.typeChart;
          this.autoResize = result.autoResize;
          this.index = result.index;
          this.exploreJson = result.exploreJson;
          this.explore = result.explore;
          this.shareChartData = result;
          this.setInitialPage();
        });
    }
    this.store
      .select(extraFilterSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.isExtraFilter = result;
        }
      });
    this.store
      .select(isReloadCardSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          if (result.status) {
            this.handleGenerate(this.exploreJson.form_data, '', true);
          }
        }
      });
    this.store
      .select(selectedValueChartSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          let a = result.split('+');
          this.filteredChartType = a[0];
          this.selectedFilter = a[2];
          this.idFilter = Number(a[1]);
        } else {
          this.selectedFilter = '';
          this.idFilter = 0;
          this.filteredChartType = '';
        }
      });

    this.dataVisualizationService.invokeRefreshAllChart.subscribe(() => {
      // console.log('ok invoked!')      
      this.handleGenerate(this.exploreJson.form_data, '', true);
    });
  }

  addSearchMultiColumn() {
    const searchColObj = {};

    for (const [key] of Object.entries(this.chartOption.dataSource.filteredData[0])) {
      searchColObj[key] = 'searchInput';
      this.searchMultiCols[key] = this.searchMultiCols[key] || '';
    }
    this.dataSource.data = [searchColObj].concat(this.chartOption.dataSource.filteredData);
  }
  // initial page ketika halaman pertama di render
  setInitialPage = async () => {
    this.noData = false;
    const exploreJson = this.exploreJson;
    let selected = findSelectedValue(
      this.selectedFilter,
      exploreJson,
      this.isExtraFilter,
      this.filteredChartType,
      this.idFilter
    );
    this.chartOption = await getConfigChart(
      exploreJson,
      this.explore.form_data.viz_type,
      this._apicall,
      this.explore,
      this._sanitizer,
      this.sort,
      this.zoomCountryMap,
      this.centroidMap,
      ['pie', 'dist_bar', 'horizontal_bar', 'line'].includes(this.exploreJson.form_data.viz_type)
        ? this.filteredChartType === this.explore.form_data.viz_type
          ? selected
          : ''
        : this.selectedFilter,
      this.idFilter
    );

    if (!this.isPickDate) {
      this.handleInitialDate();
    }

    switch (this.explore.form_data.viz_type) {
      case 'preview':
      case 'table_comparison':
      case 'table':
        this.pagelength = exploreJson.rowtotal;
        this.dataSource = this.chartOption.dataSource;
        this.displayedColumns = this.chartOption.displayedColumns;
        this.handleTableColumnList();
        this.setGridView();
        this.realRecords = exploreJson.data.records;
        if (exploreJson.form_data.search_multi_columns) this.addSearchMultiColumn();
        break;
      case 'pivot_table':
        this.myHtml = this.chartOption.html;
        break;
      case 'filter_box':
        this.initialFormFilterBox(this.exploreJson);
        break;
      default:
        break;
    }
    this.changeDetector.detectChanges();
  };

  handleInitialDate = () => {
    const { since, until } = helperInitialDate(this.exploreJson);
    this.since = since;
    this.until = until;
  };

  handleExtraFilter = (exploreJson) => {
    let extraFilter = helperHandleExtraFilter(this.isExtraFilter, exploreJson, this.since, this.until);
    // set for visual on html
    this.listFilterColumn = extraFilter.filter((item) => !item.col.includes('__'));
    // filter not duplicate
    extraFilter = extraFilter.filter((value, index, self) => index === self.findIndex((t) => t.col === value.col));
    // set to variable
    this.isExtraFilter = extraFilter;
    //  set to store reducer
    this.store.dispatch(SetExtraFilter({ extraFilter: this.isExtraFilter }));
  };
  initialFormFilterBox = (exploreJson) => {
    this.handleInitialDate();
    this.handleExtraFilter(exploreJson);
    // set filter checkbox
    if (exploreJson.form_data.filter_control_checkbox && this.filterCheckboxList.length === 0) {
      this.filterCheckboxList = this.chartOption.data[exploreJson.form_data.filter_control_checkbox];
      if (this.filterCheckboxList.length > 0) {
        this.filterCheckboxList = this.filterCheckboxList.map((item) => ({
          ...item,
          isChecked: false,
        }));
      }
    }
  };

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    this.store.dispatch(setSelectedValueChart({ item: `` }));
    setTimeout(() => {
      var $head = $('#myiFrame').contents().find('head');
      $head.append(
        $('<link/>', {
          rel: 'stylesheet',
          href: 'assets/css/style.min.css',
          type: 'text/css',
        })
      );
    }, 500);
  }

  onChartInit(e: any) {
    this.echartsInstance = e;
    let me = this;
    if (this.typePage === 'dashboardview' || this.typePage === 'app_preview') {
      this.echartsInstance.on('click', function (params) {
        me.filterOnChart(params);
      });
    }
  }

  handleFilterGeneralChart = (extraFilter) => {
    this.isExtraFilter = extraFilter;
    this.handleApplyFilter(false, this.exploreJson.form_data.viz_type);
    this.isApplyDashboard = true;
  };

  handleFilterLine = (params) => {
    if (this.exploreJson.form_data.chart_on_click) {
      const { extraFilter, idFilter, selectedFilter } = helperLineChartOnClick(
        this.exploreJson,
        params,
        this.selectedFilter
      );
      this.idFilter = idFilter;
      this.selectedFilter = selectedFilter;
      this.filteredChartType = this.exploreJson.form_data.viz_type;
      this.store.dispatch(
        setSelectedValueChart({
          item: `${this.exploreJson.form_data.viz_type}+${this.exploreJson.form_data.slice_id}+${this.selectedFilter}`,
        })
      );
      this.handleFilterGeneralChart(extraFilter);
    }
  };
  filterOnChart = async (params) => {
    if (this.exploreJson.form_data.chart_on_click) {
      let index = 0;
      // let me = this;
      this.filteredChartType = this.exploreJson.form_data.viz_type;
      this.initialFormFilterBox(this.exploreJson);
      if (this.exploreJson.form_data.viz_type === 'line') {
        this.handleFilterLine(params);
      }
      if (['pie', 'country_map', 'dist_bar', 'horizontal_bar'].includes(this.exploreJson.form_data.viz_type)) {
        /**
         * value is 0 or not always zoom in
         * zoom out is only valid when user refreshe card
         * indexSelected get from index chart for as a sign to slice selected
         */
        if (['dist_bar', 'horizontal_bar'].includes(this.exploreJson.form_data.viz_type)) {
          /**
           * condition when bar is stack bar and tooltips is single
           */
          if (this.exploreJson.form_data.style_tooltips === 'item') {
            const seriesName = params.seriesName.split('::')[0];
            let splitseriesname = seriesName.split(' - ');
            this.exploreJson.form_data.columns.map((data) => {
              /**
               * find index in extraFilter
               */
              let indexColumn = this.isExtraFilter.findIndex((item) => item.col === data);
              /**
               * condition if indexColumn not found
               * set new data to extra filter
               */
              if (indexColumn === -1) {
                let extraFilter = Object.assign([], this.isExtraFilter);
                extraFilter.push({
                  col: data,
                  op: 'in',
                  val: [],
                });
                this.isExtraFilter = extraFilter;
                indexColumn = this.isExtraFilter.findIndex((item) => item.col === data);
              }
              /**
               * params 1 = value
               * params 2 = index changed in extraFilter
               * params 3 = auto filter or not
               */
              this.setValueFilterDashboard(
                this.selectedFilter === params.data.selected && this.idFilter === this.exploreJson.form_data.slice_id
                  ? []
                  : [splitseriesname[1]],
                indexColumn
              );
            });
          }
          index = 0;
        } else {
          index = this.isExtraFilter.findIndex((item) => item.col === params.data.key);
        }
        this.idFilter = this.exploreJson.form_data.slice_id;
        if (
          ['dist_bar', 'horizontal_bar'].includes(this.exploreJson.form_data.viz_type)
            ? this.exploreJson.form_data.style_tooltips === 'axis'
              ? this.selectedFilter === params.name
              : this.selectedFilter === params.data.selected
            : this.selectedFilter === params.name
        ) {
          this.indexSelected = '';
          this.selectedFilter = '';
          this.zoomCountryMap = 0;
          this.centroidMap = [];
        } else {
          this.indexSelected = params.dataIndex;
          this.selectedFilter = ['dist_bar', 'horizontal_bar'].includes(this.exploreJson.form_data.viz_type)
            ? this.exploreJson.form_data.style_tooltips === 'axis'
              ? params.name
              : params.data.selected
            : params.name;
          this.zoomCountryMap = this.exploreJson.form_data.viz_type === 'country_map' ? 6 : 0;
          this.centroidMap = this.exploreJson.form_data.viz_type === 'country_map' ? params.data.coordinate : [];
        }
        if (['dist_bar', 'horizontal_bar', 'pie'].includes(this.exploreJson.form_data.viz_type)) {
          this.store.dispatch(
            setSelectedValueChart({
              item: `${this.exploreJson.form_data.viz_type}+${this.exploreJson.form_data.slice_id}+${this.selectedFilter}`,
            })
          );
        }

        this.chartOption = await getConfigChart(
          this.exploreJson,
          this.explore.form_data.viz_type,
          this._apicall,
          this.explore,
          this._sanitizer,
          this.sort,
          this.zoomCountryMap,
          this.centroidMap,
          this.selectedFilter
        );
        this.changeDetector.detectChanges();
      }
      if (!['line'].includes(this.exploreJson.form_data.viz_type)) {
        if (params.name.includes(':')) {
          // remove space and split from string
          let name = params.name.split(':');
          this.setValueFilterDashboard(!this.selectedFilter ? [] : [name[0].trim()], index, true);
        } else {
          this.setValueFilterDashboard(!this.selectedFilter ? [] : [params.name], index, true);
        }
      }
    }
  };

  // screenChange() {
  //   if (window.innerHeight === screen.height) this.isFullscreen = true;
  //   else this.isFullscreen = false;
  // }

  onCheckboxFilter(event, name) {
    if (name === 'all') {
      checked_unchecked_all(!event.target.checked, this.filterCheckboxList);
    } else {
      let listChecked = [];
      this.filterCheckboxList.map((item) => {
        if (name === item.id) {
          item = {
            ...item,
            isChecked: event.target.checked,
          };
        }
        listChecked.push(item);
      });
      this.filterCheckboxList = listChecked;
    }
    let data = [];

    let index = this.isExtraFilter.findIndex((item) => item.col === this.explore.form_data.filter_control_checkbox);
    this.filterCheckboxList.map((obj) => {
      if (obj.isChecked) {
        data.push(obj.id);
      }
    });
    this.setValueFilterDashboard(data, index);
  }

  onAlphabetFilter = (event) => {
    this.activeAlphabet = event === this.activeAlphabet ? '' : event;
  };

  filter_function(e, index) {
    let collectSelectedValue = e.reduce(function (s, a) {
      s.push(a.id);
      return s;
    }, []);
    this.setValueFilterDashboard(collectSelectedValue, index);
  }

  setValueFilterDashboard = (collectValue, index, filterOnChart?) => {
    let extraFilter = Object.assign([], this.isExtraFilter);

    extraFilter = extraFilter.map((data, i) => {
      let modify = { ...data };
      if (i === index) {
        modify.val = collectValue;
      }
      return modify;
    });
    this.isExtraFilter = extraFilter;

    this.store.dispatch(SetExtraFilter({ extraFilter: this.isExtraFilter }));
    if (this.explore.form_data.instant_filtering || filterOnChart) {
      this.handleApplyFilter(false, this.exploreJson.form_data.viz_type);
      this.isApplyDashboard = true;
    }
  };
  setState = (event) => {
    const { type, value } = event;
    this.isPickDate = true;
    if (type === 'since') {
      this.exploreJson = {
        ...this.exploreJson,
        form_data: {
          ...this.exploreJson.form_data,
          since: value,
          until: this.exploreJson.form_data.filter_date === 'date_picker' ? value : null,
        },
      };
      this.since = value;
    } else {
      this.exploreJson = {
        ...this.exploreJson,
        form_data: {
          ...this.exploreJson.form_data,
          until: value,
        },
      };
      this.until = value;
    }
    this.handleGenerate(this.exploreJson.form_data);
  };

  setGridView = () => {
    this.displayGrid = [];
    if (this.explore.form_data.table_grid_view) {
      for (var i = 0; i < this.exploreJson.data.records.length; i++) {
        let dataArr = [];
        let index = 0;
        for (let prop in this.exploreJson.data.records[i]) {
          dataArr[index] = this.exploreJson.data.records[i][prop];
          index++;
        }
        this.displayGrid.push(dataArr);
      }
    }
  };

  handleGenerate = async (form_data, viz_type?, onRefresh?) => {
    this.loadingChart = true;
    let objectModify = helperGenerateFormData(viz_type ? viz_type : this.exploreJson.form_data.viz_type, form_data);
    form_data = objectModify.modify_form_data;
    form_data = {
      ...form_data,
      datasource: viz_type ? objectModify.form_data.datasource : this.explore.form_data.datasource,
      datasource_name: viz_type ? objectModify.form_data.datasource_name : this.explore.form_data.datasource_name,
      slice_id: viz_type ? objectModify.form_data.slice_id : this.explore.form_data.slice_id,
      extra_filters: onRefresh ? [] : form_data.extra_filters,
    };
    let param = { form_data: JSON.stringify(form_data) };
    if (onRefresh) {
      this.store.dispatch(setSelectedValueChart({ item: `` }));
    }
    await this.getDataChart(param);
  };

  getDataChart = async (params) => {
    // console.log('params', params)
    let url = '';
    if (this.route.url.includes('pdsshare')) {
      url = `/api/v2/chart/explore_json/?token=${this.activeRoute.snapshot.queryParams.token}`;
    } else {
      url = `/api/v2/chart/explore_json/`;
    }
    // code for get explore for create chart on card
    let explore_json = await loadChartData(url, params, this.messages, this._apicall);
    if (explore_json) {
      const sharedChartDataObj = {
        ...this.shareChartData,
        typeChart: this.explore.form_data.viz_type,
        explore: {
          ...this.explore,
          form_data: {
            ...explore_json.form_data,
          },
        },
        exploreJson: explore_json ? explore_json : null,
      };
      if (['dashboard', 'dashboardview', 'app_preview'].includes(this.typePage)) {
        this.handleFilterChartOnDashboard(explore_json);
      }
      this.store.dispatch(PostSharedChartData(sharedChartDataObj));
    }
    this.loadingChart = false;
    this.changeDetector.detectChanges();
  };
  /**
   * dont remove for dashboard toogle column
   */
  handleTableColumnList() {
    this.tableColumnsList = [];
    for (var i = 0; i < this.displayedColumns.length; i++) {
      let formatColClass = this.displayedColumns[i].replace(/[`~!\s@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '-');
      let colObj = {
        colName: this.displayedColumns[i],
        colClass: formatColClass,
      };
      this.tableColumnsList.push(colObj);
    }
  }
  /**
   * dont remove for dashboard toogle column
   */
  handleFilterChartOnDashboard = (explore_json) => {
    let collectingAfterFilter = helperHandleFilterChartOnDashboard(
      this.listOfChartOnDashboard,
      explore_json,
      this.isApplyDashboard,
      this.chartIndex
    );

    this.store.dispatch(PostDashboardChartData({ dashboardCharts: collectingAfterFilter }));
  };
  handleApplyFilter = (isReload?, typeChart?) => {
    let dashboardList = Object.assign([], this.listOfChartOnDashboard);

    dashboardList.map(async (data) => {
      if (
        (
          this.idFilter !== data.exploreJson.form_data.slice_id &&
          !['filter_box'].includes(data.exploreJson.form_data.viz_type)
        ) 
        || ['country_map'].includes(data.exploreJson.form_data.viz_type)
      ) {
        let formData = {
          ...data.exploreJson.form_data,
          extra_filters: isReload ? [] : this.isExtraFilter,

          initial_chart_blank: data.exploreJson.form_data.initial_chart_blank
            ? !data.exploreJson.form_data.initial_chart_blank
            : false,
        };

        if (['table', 'table_comparison'].includes(formData.viz_type)) {
          formData.page_index = 1;
        }

        data = {
          ...data,
          exploreJson: {
            ...data.exploreJson,
            form_data: formData,
          },
        };
        await this.handleGenerate(data.exploreJson.form_data, data.exploreJson.form_data.viz_type);
      }
    });
    this.isApplyDashboard = false;
    this.store.dispatch(isReloadCard({ status: false }));
  };

  handleExtraFilterWhenApply = (isReload, vizType) => {
    let advanceFilter = [];
    if (vizType === 'pie' && this.isExtraFilter.length > 0) {
      this.isExtraFilter.map((data) => {
        if (data.val.length > 0) {
          if (!this.exploreJson.data.key.includes(data.val[0])) {
            advanceFilter.push(data);
          }
        }
      });
    }
    if (isReload) {
      return [];
    } else if (vizType === 'pie') {
      return this.isExtraFilter;
    } else {
      return this.isExtraFilter;
    }
  };

  handleEventButton(type: string) {
    switch (type) {
      case 'Apply':
        if (this.typeChart === 'filter_box') {
          this.handleApplyFilter(false, 'filter_box');
          this.isApplyDashboard = true;
        }
        break;
      case 'refresh':
        this.since = this.explore.form_data.since;
        this.until = this.explore.form_data.until;
        this.handleGenerate(this.explore.form_data, '', true);
        break;
      case 'column_table':
        this.viewColumnTable = !this.viewColumnTable;
        break;
      case 'download':
        this.onChartDownload();
        break;
      case 'fullscreen':
        on_full_screen_id(this.id);
        break;
      case 'edit':
        this.onChartEdit();
        break;
      case 'delete':
        this.onChartDelete();
        break;
    }
  }

  onChartDelete() {
    this.store.dispatch(DeleteChartDashboard({ item: { value: { id: this.myChartID } } }));
  }

  onChartEdit() {
    var url = `#/pds/newdatavisualization?slice_id=${this.myChartID}`;
    window.open(url, '_blank');
    return;
  }

  onChartDownload = async () => {
    let resultExplorer = await loadChartData(
      `api/chart/explore/?form_data=%7B%22slice_id%22%3A${Number(this.myChartID)}%7D`,
      {},
      this.messages,
      this._apicall
    );
    let param = { form_data: JSON.stringify(resultExplorer.form_data) };
    await this.httpFile
      .post(`/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A${Number(this.myChartID)}%7D&csv=true`, param, {
        responseType: 'blob',
      })
      .subscribe((resp: any) => {
        FileSaver.saveAs(resp, resultExplorer.slice.datasource + ' ' + resultExplorer.slice.slice_name + `.csv`);
      });
  };

  handleSelectRowLimit = (event: any) => {
    const rowLimit = event.value.target.value;
    let form_data = { ...this.exploreJson.form_data, row_limit: rowLimit };
    this.store.dispatch(SetFormData({ item: form_data }));
    this.handleGenerate(form_data);
  };
}
