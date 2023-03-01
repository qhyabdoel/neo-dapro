import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ComponentFactoryResolver,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SafeHtml } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment';
import * as echarts from 'echarts';
import * as FileSaver from 'file-saver';

import { KeyValue } from '@angular/common';
import { ApiService, LayoutUtilsService, JsonService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import { ChartddetailasyncComponent } from '../../chartdetailasync/chartdetailasync.component';
import {
  helperGenerateExploreJsonUrl,
  helperGetData,
  helperGetExplorerChart,
  loadChartData,
  reformatDataTable,
} from 'src/app/libs/helpers/data-visualization-helper';
import { date_picker_handler, month_picker_handler, year_picker_handler } from 'src/app/libs/helpers/utility';
import { getConfigChart } from './helperChartShare';
import {
  static_bottom_margin,
  static_charge,
  static_cols,
  static_dist_bar_sorter,
  static_granularity,
  static_horizontal_bar_sorter,
  static_link_length,
  static_operators_arr,
  static_page_length2,
  static_pandas_aggfunc,
  static_pie_label_type,
  static_rotation,
  static_row_limit,
  static_select_country,
  static_select_province,
  static_spectrums,
  static_table_timestamp_format,
  static_y_axis_format,
} from 'src/app/libs/helpers/constant_datavisualization';

declare var d3: any;

@Component({
  selector: 'pq-sharevisualization',
  templateUrl: './chartShare.component.html',
})
export class ChartShareComponent implements OnInit, AfterViewInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  @ViewChild('confirmationModal', { static: false })
  confirmationModal: ElementRef;
  @ViewChild('saveCharts', { static: true }) saveCharts: ElementRef;
  @ViewChild('modalEditMetricLegendOptions', { static: true })
  modalEditMetricLegendOptions: ElementRef;
  @ViewChild('deleteCharts', { static: true }) deleteCharts: ElementRef;
  @ViewChild('duplicateCharts', { static: true }) duplicateCharts: ElementRef;
  @ViewChild('modalDatasource', { static: true }) modalDatasource: ElementRef;
  @ViewChild('modalVisualtype', { static: true }) modalVisualtype: ElementRef;
  @ViewChild('confirmLoadData', { static: true }) confirmLoadData: ElementRef;
  @ViewChild('codeModal', { static: true }) codeModal: ElementRef;
  @ViewChild('jsModal', { static: true }) jsModal: ElementRef;
  @ViewChild('cssModal', { static: true }) cssModal: ElementRef;

  filters: any;
  submit_form_data: any = {};
  form_data: any = {};
  mydata: any = {};
  chartList: any = [];
  datasetList: any = [];
  component: any = [];
  columns: any = [];
  records: any = [];
  charts = [];
  isLeftToggle: boolean = false;
  isRightToggle: boolean = false;
  searchDatasetText: string;
  searchChartText: string;
  masterDataDataset: any;
  masterDataChart: any;
  clicked: boolean = false;
  isLoadingCharts: boolean = false;
  isLoadingDataset: boolean = false;
  isLoadingContent: boolean = false;
  datasourceTitle: string;
  paramCreate: ParamCreateChart;
  paramEdit: ParamEditChart;
  queryName: string;
  index: number = 0;
  palleteDefault = 'palette3';
  user = JSON.parse(localStorage.getItem('user'));

  list_dist_bar_sorter: Array<any>;
  list_row_limit: Array<any>;
  operatorsArr: Array<any>;
  list_page_length: Array<any>;
  list_time_grain_sqla: Array<any>;
  list_table_timestamp_format: Array<any>;

  table_timestamp_format: any;
  include_search: boolean = false;
  include_time;
  order_desc: boolean = true;
  page_length;
  granularity_sqla;
  since: string = '';
  until: string = '';
  size_from: Number;
  size_to: Number;
  subheader: string;
  subheaderfontsize: number;
  zoomsize: number;
  rotation: string;
  x_axis_format: string;
  y_axis_2_format: string;
  metric_2: string;
  list_rotation: Array<any>;
  metric: Array<string> = [];
  errorMessage: string;
  showVerboseName: boolean = false;
  loaded: boolean = false;
  errors: boolean = false;
  getRenderChart: Promise<boolean>;
  datasource: object[] = [];
  notGroupBy: Array<string> = [];
  leftSidebar: boolean = true;
  rightSidebar: boolean = true;
  chartName: string;
  metrics: Array<any> = [];
  groupby: Array<any> = [];
  show_legend: boolean = true;
  row_limit: number;
  time_grain_sqla;
  // chart
  mapGeoJSON: any;
  // markup
  myHtml: SafeHtml;
  typeHtml: string;

  // table
  order_by_cols: any;
  granularity: string;
  list_granularity: any = [];
  druid_time_origin: any = null;
  // pie
  pie_label_type: any;
  list_pie_label_type: any = [];
  donut: boolean = false;
  labels_outside: boolean = true;
  // bar
  all_columns: any = [];
  list_y_axis_format: Array<any> = [];
  list_bottom_margin: Array<any>;
  show_bar_value: boolean = false;
  bar_stacked: boolean = false;
  dist_bar_sorter: string;
  y_axis_format: string = '.3s';
  bottom_margin: string = 'auto';
  x_axis_label: string = '';
  y_axis_label: string = '';
  reduce_x_ticks: boolean = false;
  show_controls: boolean = false;
  // map
  tempClick = 'INDONESIA';
  temp = 'INDONESIA';
  entity;
  map_label: string;
  select_country: any;
  list_select_country;
  select_province;
  list_select_province;
  number_format;
  linear_color_scheme;
  color_scheme: string;
  lower_limit: number = 1000;
  upper_limit: number = 100000;
  // line
  timeseries_limit_metric: string = null;
  show_brush: boolean = false;
  rich_tooltip: boolean = true;
  show_markers: boolean = false;
  line_interpolation: string = 'linear';
  list_line_interpolation: any = [];
  contribution: boolean = false;
  x_axis_showminmax: boolean = true;
  left_margin: string = 'auto';
  y_axis_showminmax: boolean = true;
  y_log_scale: boolean = false;
  y_axis_bounds: Array<any> = [0, 15];
  // markup
  code2: string;
  js: string;
  css: string;
  markup_type: string = 'html';
  // buble
  series: string;
  size: string;
  max_bubble_size: string;
  x: string;
  x_log_scale: string;
  y: string;

  viz_type: string = '';
  row: any;
  onKeyupDebounce = new Subject<string>();
  slice: any = {};
  list_spectrums: any;

  dataSlice$: Promise<boolean>;
  getRenderTables$: Observable<any[]>;
  getRenderCharts$: Array<any>;
  chartLinks: any = [];
  listCharts$: Observable<any[]>;
  listDs$: Observable<any[]>;
  listVs$: Observable<any[]>;
  listVs: any = [];
  colorSchema: any = [];
  listChartType: object[] = [];
  searchText: string;
  visualType: string;
  visualName: string;
  staticAlertClosed = true;
  alertMessage: string;
  people$: Observable<any[]>;
  dsName: string;
  closeResult: string;
  IsmodelShow: boolean = false;
  chooseDs: string;
  formData: any = {
    visualType: '',
  };
  sharedData: any;
  slice_id: string;
  // scatter/predictive
  y_axis_bounds_min: any = null;
  y_axis_bounds_max: any = null;
  pred_actual: string = '';
  pred_line: string = '';
  pred_upper: string = '';
  pred_lower: string = '';
  list_link_length: any;
  list_charge: any;
  // filter_box
  date_filter: boolean = false;
  instant_filtering: boolean = false;
  // treemap
  treemap_ratio: any;
  // directed_force
  link_length: any;
  charge: any;
  stateloadDataset: boolean = false;
  checkHasError: boolean = false;
  having_filters: any = [];
  horizontal_bar_sorter: any;
  list_horizontal_bar_sorter: any = [];

  pandas_aggfunc: string;
  pivot_margins: true;
  combine_metric: false;

  list_pandas_aggfunc: any = [];
  list_filters: any = [];
  list_cols: any = [];
  persen: string;
  validate_messages: any = [];

  messages: any;
  token: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private _apicall: ApiService,
    private router: Router,
    private layoutUtilsService: LayoutUtilsService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private httpFile: HttpClient,

    private route: ActivatedRoute,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.getSchema();
    this.initial();
    this.route.queryParams.subscribe((params) => {
      Promise.resolve(this.loadChartbyId(params.token));
      this.token = params.token;
    });
    this.messages = await this.jsonService.retMessage();
  }

  ngAfterViewInit() {}
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  initFormData() {
    this.form_data = {
      zoomsize: this.zoomsize,
      subheaderfontsize: this.subheaderfontsize,
      color_scheme: this.color_scheme,
      horizontal_bar_sorter: this.horizontal_bar_sorter,
      filters: this.filters,
      having_filters: this.having_filters,
      palleteDefault: this.palleteDefault || 'palette3',
      component: this.component || [],
      columns: this.columns || [],
      records: this.records || [],
      table_timestamp_format: this.table_timestamp_format,
      include_search: this.include_search,
      include_time: this.include_time,
      order_desc: this.order_desc,
      page_length: this.page_length,
      granularity_sqla: this.granularity_sqla,
      since: this.since,
      until: this.until,
      size_to: this.size_to,
      subheader: this.subheader,
      rotation: this.rotation,
      x_axis_format: this.x_axis_format,
      y_axis_2_format: this.y_axis_2_format,
      metric_2: this.metric_2,
      list_rotation: this.list_rotation,
      metric: this.metric,
      errorMessage: this.errorMessage,
      showVerboseName: this.showVerboseName,
      loaded: this.loaded,
      errors: this.errors,
      getRenderChart: this.getRenderChart,
      datasource: this.datasource,
      notGroupBy: this.notGroupBy,
      leftSidebar: this.leftSidebar,
      rightSidebar: this.rightSidebar,
      chartName: this.chartName,
      metrics: this.metrics,
      groupby: this.groupby,
      show_legend: this.show_legend,
      row_limit: this.row_limit,
      time_grain_sqla: this.time_grain_sqla,
      mapGeoJSON: this.mapGeoJSON,
      myHtml: this.myHtml,
      typeHtml: this.typeHtml,
      order_by_cols: this.order_by_cols,
      granularity: this.granularity,
      druid_time_origin: this.druid_time_origin,
      pie_label_type: this.pie_label_type,
      donut: this.donut,
      labels_outside: this.labels_outside,
      all_columns: this.all_columns,
      show_bar_value: this.show_bar_value,
      bar_stacked: this.bar_stacked,
      dist_bar_sorter: this.dist_bar_sorter,
      y_axis_format: this.y_axis_format || '.3s',
      bottom_margin: this.bottom_margin || 'auto',
      x_axis_label: this.x_axis_label || '',
      y_axis_label: this.y_axis_label || '',
      reduce_x_ticks: this.reduce_x_ticks || false,
      show_controls: this.show_controls || false,
      entity: this.entity,
      map_label: this.map_label,
      select_country: this.select_country,
      select_province: this.select_province,
      number_format: this.number_format,
      linear_color_scheme: this.linear_color_scheme,
      lower_limit: this.lower_limit || 1000,
      upper_limit: this.upper_limit || 100000,
      timeseries_limit_metric: this.timeseries_limit_metric || null,
      show_brush: this.show_brush || false,
      rich_tooltip: this.rich_tooltip || true,
      show_markers: this.show_markers || false,
      line_interpolation: this.line_interpolation || 'linear',
      list_line_interpolation: this.list_line_interpolation || [],
      contribution: this.contribution || false,
      x_axis_showminmax: this.x_axis_showminmax || true,
      left_margin: this.left_margin || 'auto',
      y_axis_showminmax: this.y_axis_showminmax || true,
      y_log_scale: this.y_log_scale || false,
      y_axis_bounds: this.y_axis_bounds || [0, 15],
      code2: this.code2,
      js: this.js,
      css: this.css,
      markup_type: this.markup_type || 'html',
      series: this.series,
      size: this.size,
      max_bubble_size: this.max_bubble_size,
      x: this.x,
      x_log_scale: this.x_log_scale,
      y: this.y,
      viz_type: this.viz_type,
      row: this.row,
      onKeyupDebounce: this.onKeyupDebounce,
      slice: this.slice,
      searchText: this.searchText,
      visualType: this.visualType,
      visualName: this.visualName,
      formData: this.formData,
      sharedData: this.sharedData,
      slice_id: this.slice_id,
      y_axis_bounds_min: this.y_axis_bounds_min,
      y_axis_bounds_max: this.y_axis_bounds_max || null,
      pred_actual: this.pred_actual || '',
      pred_line: this.pred_line || '',
      pred_upper: this.pred_upper || '',
      pred_lower: this.pred_lower || '',
      date_filter: this.date_filter || false,
      instant_filtering: this.instant_filtering || false,
      treemap_ratio: this.treemap_ratio,
      link_length: this.link_length,
      charge: this.charge,
    };
  }

  // Preserve original property order
  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };

  // Order by ascending property value
  valueAscOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return a.value.localeCompare(b.value);
  };

  // Order by descending property key
  keyDescOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  };

  initial() {
    this.slice = {};
    this.mydata = {};
    this.component = [];
    this.charts = [];
    this.isLoadingCharts = false;
    this.isLoadingDataset = false;
    this.datasourceTitle = '';
    this.paramEdit = {
      form_data: '{}',
      action: 'saveas',
      slice_id: null,
      slice_name: '',
      add_to_dash: '',
      goto_dash: false,
    };
    this.chartLinks = {};
    this.paramCreate = {
      action: '',
      slice_name: '',
    };

    this.list_horizontal_bar_sorter = static_horizontal_bar_sorter;
    this.list_cols = static_cols;
    this.list_pandas_aggfunc = static_pandas_aggfunc;
    this.list_granularity = static_granularity;
    this.list_line_interpolation = ['linear', 'basis', 'cardinal', 'monotone', 'step-before', 'step-after'].map((s) => [
      s,
      s,
    ]);
    this.list_spectrums = static_spectrums;
    this.list_rotation = static_rotation;
    this.list_select_country = static_select_country;
    this.list_select_province = static_select_province;
    this.list_dist_bar_sorter = static_dist_bar_sorter;
    this.operatorsArr = static_operators_arr;
    this.list_time_grain_sqla = ['hour', 'day', 'month', 'year'].map((s) => [s, s]);
    this.list_link_length = static_link_length;
    this.list_charge = static_charge;
    this.list_row_limit = static_row_limit;
    this.list_page_length = static_page_length2;
    this.list_table_timestamp_format = static_table_timestamp_format;
    this.list_y_axis_format = static_y_axis_format;
    this.list_bottom_margin = static_bottom_margin;
    this.list_pie_label_type = static_pie_label_type;

    this.cdRef.detectChanges();
  }
  colorPalette = {};
  async getSchema() {
    let color_palette = await this._apicall.loadGetData('/assets/data/color_palette.json');
    this.colorSchema = color_palette;
    for (var i = 0; i < color_palette.length; i++) {
      this.colorPalette['palette' + (i + 1)] = color_palette[i];
    }
  }

  async loadChartbyId(token) {
    this.loaded = true;
    this.isLoadingContent = true;
    const explore = await helperGetData(`api/chart/explore/shared?token=${token}`, this._apicall);
    this.slice = explore.slice;
    this.chartLinks = explore;
    this.palleteDefault = explore.form_data.color_scheme;
    let formData = explore.form_data;
    if (explore.latest_date) {
      const initialDate =
        explore.form_data.initial_date_filter === 'current_date' ? moment(new Date()) : moment(explore.latest_date);
      let result;
      switch (explore.form_data.filter_date_type) {
        case 'date':
          result = date_picker_handler(moment, undefined, initialDate, 'date_picker');
          break;
        case 'month':
          result = month_picker_handler(moment, undefined, initialDate, 'date_picker');
          break;
        case 'year':
          result = year_picker_handler(moment, undefined, initialDate, 'date_picker');
      }
      if (result) {
        formData.since = result[0];
        formData.until = result[1];
      }
    }
    const exploreJson = await helperGetExplorerChart(
      null,
      `${helperGenerateExploreJsonUrl(formData.slice_id)}&token=${token}`,
      token,
      '',
      this._apicall,
      null,
      { form_data: JSON.stringify(formData) }
    );

    this.addCompChart(
      this.chartLinks.form_data.viz_type,
      this.chartLinks.slice.slice_id,
      this.chartLinks.slice.slice_name,
      '',
      {},
      this.palleteDefault,
      null,
      this.chartLinks,
      exploreJson
    );
  }

  async loadDatasetData(url) {
    let result = await this._apicall.getApi(url);
    let value;
    if (result.status) {
      value = result.result.response ? result.result.response : result.result;
      return value;
    } else {
      this.isLoadingContent = false;
      this.errorMessage = 'Error initializing dataset by slug!';
      this.removeChartFromContent();
      if (result.result.status == 0) {
        this.errorMessage = 'Request Timeout, Please Contact Administrator';
        this._apicall.openModal('Failed', this.errorMessage);
        return this.errorMessage;
      }
      this._apicall.openModal('Failed', this.errorMessage);
      return {};
    }
  }

  async loadChartTo(item, isSelect) {
    return this.router.navigate(['/pds/newdatavisualization'], {
      queryParams: { slice_id: item.id },
    });
  }

  async loadDatasetTo(item) {
    this.initFormData();
    this.stateloadDataset = true;
    localStorage.setItem('dataset', JSON.stringify([item]));
    this.removeDashboardFromContent();
    this.isLoadingContent = true;
    this.queryName = item.query;
    this.datasourceTitle = item.query + ' - untitled';
    // for edit metric & save chart
    this.row = {
      slice_chart_name: this.datasourceTitle,
    };
    const [ds, dsType] = item.uid.split('__');
    const uri = `api/chart/explore/`;
    const url = `${uri}${dsType}/${ds}`;
    let explore = await this.loadDatasetData(url);
    let urlnext = '/api/chart/explore_json/';
    let param = { form_data: JSON.stringify(explore.form_data) };
    let exploreJson = await loadChartData(urlnext, param, this.messages, this._apicall);
    localStorage.setItem('exploreJson', JSON.stringify(exploreJson));
    if (typeof exploreJson == 'string') {
      this.isLoadingContent = false;
      this.errors = true;
      this.checkHasError = true;
      this.errorMessage = exploreJson;
      this.cdRef.detectChanges();
      return false;
    }
    let config = await getConfigChart(exploreJson, d3, this.colorPalette, this._apicall, this.chartLinks);
    if (exploreJson.form_data.viz_type === 'country_map') {
      echarts.registerMap('ID', config[0].mapGeoJson);
    }
    if (item.type == 'table') {
      this.columns = exploreJson.data.columns;
      this.records = await reformatDataTable(exploreJson.data.columns, exploreJson.data.records);
    }

    this.queryName = explore.form_data.datasource_name;
    this.visualType = explore.form_data.viz_type;
    this.visualName = explore.form_data.viz_type.toString().toUpperCase();
    this.chartLinks = explore;

    this.addCompChart(
      item.type,
      item.uid,
      item.query,
      url,
      config[0],
      this.palleteDefault,
      config[1],
      exploreJson,
      explore
    );
    if (this.checkHasError) {
      this.addCompChart(
        item.type,
        item.uid,
        item.query,
        url,
        config[0],
        this.palleteDefault,
        config[1],
        exploreJson,
        explore
      );
    }
    this.cdRef.detectChanges();
  }

  searchChart() {
    this.isLoadingCharts = true;
    let datapencarian = this.masterDataChart;
    if (this.searchChartText.replace(/[^\w\s]/gi, '') != '') {
      datapencarian = this.masterDataChart.filter((a) =>
        new RegExp(this.searchChartText.replace(/[^\w\s]/gi, '').toLowerCase()).test(
          a.name.toLowerCase() || a.viz_type.toLowerCase() || a.ds_name.toLowerCase()
        )
      );
    }
    this.isLoadingCharts = false;
    this.chartList = datapencarian;
  }

  searchDataset() {
    this.isLoadingDataset = true;
    let datapencarian = this.masterDataDataset;
    if (this.searchDatasetText.replace(/[^\w\s]/gi, '') != '') {
      datapencarian = this.masterDataDataset.filter((a) =>
        new RegExp(this.searchDatasetText.replace(/[^\w\s]/gi, '').toLowerCase()).test(
          a.query.toLowerCase() || a.name.toLowerCase()
        )
      );
    }
    this.isLoadingDataset = false;
    this.datasetList = datapencarian;
  }

  removeDashboardFromContent() {
    let element = document.getElementById('workspace');
    var nodes = Array.from(element.getElementsByTagName('pq-chartdetailasync'));
    if (nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        this.removeComp();
      }
    }
    this.initial();
  }

  removeChartFromContent() {
    let element = document.getElementById('workspace');
    var nodes = Array.from(element.getElementsByTagName('pq-chartdetailasync'));
    if (nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        this.removeComp();
      }
    }
    this.initial();
  }

  async onDelete(type, item) {
    const dialogRef = this.layoutUtilsService.deleteElement(
      'Confirmation!',
      'Do you want to delete this ' + type + '?',
      type + ' is deleting ...'
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      if (type == 'dashboard') {
        let url = '/api/dashboard/delete?id=' + item.id;
        await this._apicall.getApi(url, true);
        this.initial();
      }
      if (type == 'chart') {
        let url = '/api/chart/delete';
        let param = { id: item.id };
        await this._apicall.postApi(url, param, true);
        this.initial();
      }
    });
  }

  addCompChart(type, ID, title, url, data, themes?, geoMap?, chartExplore?, chartExploreJson?) {
    this.removeComp();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartddetailasyncComponent);
    const viewContainerRef = this.injectComp.viewContainerRef;
    const componentRef = viewContainerRef.createComponent(componentFactory);
    let currentComponent = componentRef.instance;
    currentComponent.index = ++this.index;
    currentComponent.myChartID = ID;
    currentComponent.data = data;
    currentComponent.themes = themes ? themes : this.palleteDefault;
    currentComponent.title = title;
    currentComponent.typeChart = type;
    currentComponent.mapGeoJSON = geoMap;
    currentComponent.url = url;
    currentComponent.columns = this.columns;
    currentComponent.records = this.records;
    currentComponent.explore = chartExplore;
    currentComponent.exploreJson = chartExploreJson; //exploreJson;
    currentComponent.autoResize = true;
    currentComponent.token = this.token;
    currentComponent.delete.subscribe((val) => this.onChartDelete(val));
    currentComponent.download.subscribe((val) => this.onChartDownload(val));
    currentComponent.edit.subscribe((val) => this.onChartEdit(val));
    currentComponent.refresh.subscribe((val) => this.onChartRefresh(val));
    this.component.push(componentRef);
    // delete node old
    let element = document.getElementById('workspace');
    var nodes = Array.from(element.getElementsByTagName('pq-chartdetailasync'));
    let mod = nodes.length % 3;
    // if (nodes.length <= 3) {
    document.querySelectorAll('pq-chartdetailasync').forEach(function (el, i) {
      el.className = ' ';
      el.classList.add('col-md-12');
      window.dispatchEvent(new Event('resize'));
    });
    this.isLoadingContent = false;
    this.errors = false;
    this.cdRef.detectChanges();
  }

  removeComp() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartddetailasyncComponent);
    const viewContainerRef = this.injectComp.viewContainerRef;
    const componentRef = viewContainerRef.remove();
  }

  onChartDelete(index: number) {
    let componentRef = this.component.filter((x) => x.instance.index == index)[0];
    let componentInstance = componentRef.instance;
    let vcrIndex: number = this.injectComp.viewContainerRef.indexOf(componentRef);
    this.injectComp.viewContainerRef.remove(vcrIndex);
    this.component = this.component.filter((x) => x.instance.index !== index);
    this.charts = this.charts.filter((x) => x.id !== componentInstance.myChartID);
    window.dispatchEvent(new Event('resize'));
    this.cdRef.detectChanges();
  }

  async onChartDownload(item) {
    let mydata = await loadChartData(item.url, {}, this.messages, this._apicall);
    let urlnext = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + item.id + '%7D&csv=true';
    let param = { form_data: JSON.stringify(mydata.form_data) };
    this._apicall.post(urlnext, param).subscribe((resp: any) => {
      FileSaver.saveAs(resp, mydata.slice.datasource + ' ' + mydata.slice.slice_name + `.csv`);
    });
  }

  onChartEdit(id) {
    this.router.navigate(['/pds/datavisualization'], {
      queryParams: { slice_id: id },
    });
  }

  async onChartRefresh(item) {
    await this.loadChartbyId(item.id);
  }
}
