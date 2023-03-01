import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
  ElementRef,
  AfterViewInit,
  Input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SafeHtml } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { ApiService, LayoutUtilsService, JsonService, TranslationService } from 'src/app/libs/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { InjectDirective } from 'src/app/libs/directives';
import { ModalComponent } from 'src/app/components/modals/modal/modal.component';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { NotificationService } from 'src/app/libs/services';
import * as introJs from 'intro.js/intro.js';
const moment = _rollupMoment || _moment;
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as echarts from 'echarts';
import * as FileSaver from 'file-saver';
import { KeyValue } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import {
  GetColorPallete,
  LoadChartById,
  PostDetailChartExporeFormDataChart,
  SetExploreJSON,
  SetItemDataset,
  SetRunQuery,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  chartDatasourceSelector,
  colorPalleteListSelector,
  datasetItemSelector,
  exploreJSONSelector,
  loadChartByIdSelector,
  runQuerySelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { hexToRgbA } from 'src/app/libs/helpers/color';
import {
  convertNum,
  getDismissReason,
  getRandomInt,
  helperValidateFormVisualType,
  helperVisualType,
  helperRequireFormValue,
  initialFormDataHelper,
  reformatDataTable,
  setbaseColumnDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import {
  staticcolumnFormatList,
  staticfilterDateList,
  staticfilterDateTypeList,
  staticfontFamilyList,
  staticinitialFilterDateList,
  static_bottom_margin,
  static_charge,
  static_dist_bar_sorter,
  static_gauge_label_type,
  static_granularity,
  static_horizontal_bar_sorter,
  static_layout_directed,
  static_legend_orient,
  static_legend_type,
  static_line_interpolation,
  static_link_length,
  static_mode,
  static_operators_arr,
  static_page_length,
  static_page_length2,
  static_pandas_aggfunc,
  static_pie_label_type,
  static_rotate_axis,
  static_rotation,
  static_row_limit,
  static_scale,
  static_select_country,
  static_select_country_overlay,
  static_select_province,
  static_shape,
  static_spectrums,
  static_spiral,
  static_style_tooltips,
  static_table_timestamp_format,
  static_time_grain_sqla,
  static_y_axis_format,
} from 'src/app/libs/helpers/constant_datavisualization';
import { ITableChartColStyle, ITableColStyle } from 'src/app/libs/store/states/datavisualization.state';
import { MatDialog } from '@angular/material/dialog';
import { ModalQueryComponent } from 'src/app/components/modals/modalQuery/modal-query.component';
import { ModalCustomColorComponent } from 'src/app/components/modals/modalCustomColor/modal-custom-color.component';
import { ModalMetricLegendComponent } from 'src/app/components/modals/modalMetricLegend/modal-metric-legend';
import { ModalColumnWidthSettingComponent } from 'src/app/components/modals/modalColumWidthSetting/modal-column-width-setting.component';
import { ModalCustomColumnFormatComponent } from 'src/app/components/modals/modalColumnFormat/modal-column-format.component';
import { ModalAddValueComponent } from 'src/app/components/modals/modalAddValue/modal-add-value.component';
import { ModalNotificationsComponent } from 'src/app/components/modals/modalNotifications/modal-notifications.component';
import { ModalFormulaNotificationsComponent } from 'src/app/components/modals/modalFormulaNotifications/modal-formula-notifications.component';
import { ModalComparisonComponent } from 'src/app/components/modals/modalComparison/modal-comparison.component';
import { DialogAlertComponent } from 'src/app/components/dialogs/dialogAlert/dialog-alert.component';
import { ModalColorPickerComponent } from 'src/app/components/modals/modalColorPicker/modal-color-picker.component';
import { ModalMarkupCSSComponent } from 'src/app/components/modals/modalMarkup/modalCss/modal-markup-css.component';
import { ModalMarkupJSComponent } from 'src/app/components/modals/modalMarkup/modalJs/modal-markup-js.component';
import { ModalMarkupCodeComponent } from 'src/app/components/modals/modalMarkup/modalCode/modal-markup-code.component';
import { ModalSaveChartComponent } from 'src/app/components/modals/modalSaveChart/modal-save-chart.component';
import { ModalDuplicateChartComponent } from 'src/app/components/modals/modalDuplicateChart/modal-duplicate-chart.component';
import { ModalCustomConditionComponent } from 'src/app/components/modals/modalCustomCondition/modal-custom-condition.component';

declare var d3: any;
declare var $: any;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'rightbar-datavisualization',
  templateUrl: './rightsidebarvisualization.component.html',
  styleUrls: ['./chartsidebar.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class RightbarChartVisualizationComponent implements OnInit, AfterViewInit {
  slicingForm: FormGroup;
  @Input() addCompChart: (
    type,
    ID,
    title,
    url,
    data,
    themes?,
    geoMap?,
    exploreJson?,
    explore?,
    index?,
    palleteDefault?,
    columns?,
    records?
  ) => void;
  @Input() removeComp: () => void;
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  modalReference: NgbModalRef;
  formControl = new FormControl();

  colorpicker: string = '#f5f5f7';
  formulaValue: string = '';
  metricsOri: any = [];
  // chips/tags
  visible = true;
  statusFlag = false;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  dateStaticComparison = moment();

  notifications: any = [];
  notifications2: any = [];
  filters: any = [];
  colorpickers: any;
  colorpickers2: any;
  groupby_arrs: any;
  // gauge
  custom_condition: boolean = false;
  custom_condition_arr: any;
  list_mode: any = [];
  list_gauge_label_type: any = [];
  gauge_label_type: any = 'value';
  max_value: number = 100;
  show_axis_label: boolean = true;
  area_chart: boolean = false;
  stack_area_chart: boolean = false;
  hide_overlay: boolean = false;
  label_position: any;
  show_border: boolean = false;
  is_filterable: boolean = true;
  label_initial_date: boolean = false;
  border_position: any;
  data_charts: any = [];
  data_charts2: any = [];
  data_exploreJson: any = [];
  submit_form_data = [];
  form_data: any = {};
  mydata: any = {};
  chartList: any = [];
  selectedChartListforDelete: any = [];
  datasetList: any = [];
  component: any = [];
  columns: any = [];
  records: any = [];
  charts = [];
  scatterDatas = [];
  total: number = 0;
  coloringPie: any = [];
  isLeftToggle: boolean = false;
  isRightToggle: boolean = false;
  searchDatasetText: string;
  searchChartText: string;
  masterDataDataset: any;
  masterDataChart: any;
  result: any;
  clicked: boolean = false;
  isLoadingCharts: boolean = false;
  isLoadingDataset: boolean = false;
  isLoadingContent: boolean = false;
  datasourceTitle: string;
  paramCreate: ParamCreateChart;
  paramEdit: ParamEditChart;
  queryName: string;
  datasetName: string;
  index: number = 0;
  palleteDefault = 'palette1';
  user = JSON.parse(localStorage.getItem('user'));

  list_legend_orient: Array<any>;
  list_legend_type: Array<any>;
  list_dist_bar_sorter: Array<any>;
  list_row_limit: Array<any>;
  operatorsArr: Array<any>;
  list_page_length: Array<any>;
  list_page_length2: Array<any>;
  list_time_grain_sqla: Array<any>;
  list_table_timestamp_format: Array<any>;
  legend_position: any = 'top';
  legend_orient: string = 'horizontal';
  legend_type: string = 'scroll';
  legend_width: Number = 400;
  table_timestamp_format: any;
  include_search: boolean = false;
  search_multi_columns: boolean = false;
  static_number: boolean = false;
  include_time;
  order_desc: boolean;
  show_only_one_value: boolean = false;
  page_length;
  granularity_sqla;
  filter_date: any;
  filter_date_type: any;
  since: any = null;
  until: any = null;
  size_from: Number;
  size_to: Number;
  subheader: string;
  subheaderfontsize: number;
  zoomsize: number;
  shape: string;
  rotation: string;
  x_axis_format: string;
  y_axis_2_format: string;
  format_number_tooltips: string;
  metric_2: string;
  list_shape: Array<any>;
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
  show_row_limit: boolean = false;
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
  table_filter_column: any;
  table_sort_desc: boolean = false;
  show_total_numeric_column: boolean = false;
  table_grid_view: boolean = false;
  search_main_column: boolean = false;
  search_second_column: boolean = false;
  gridview_list_view: boolean = false;
  page_size: number;
  page_index: number;
  page_sort: any = [];
  table_font_size: number;
  table_font_family: string;
  chart_on_click_specific_col: boolean = false;
  chart_on_click_col: string;
  custom_column_format_arr: any = [];
  table_selected_column: any = [];
  custom_width_column_arr: any = [];
  // pie
  pie_label_type: string = 'key';
  list_pie_label_type: any = [];
  hide_label: boolean = false;
  hide_value: boolean = false;
  is_point_tooltip: boolean = false;
  point_comparations: any = [];
  donut: boolean = false;
  labels_outside: boolean = true;
  pie_sort_asc: boolean = false;
  // bar
  all_columns: any = [];
  list_y_axis_format: Array<any> = [];
  list_bottom_margin: Array<any>;
  show_bar_value: boolean = false;
  bar_stacked: boolean = false;
  count_stacked: boolean = false;
  dist_bar_sorter: string;
  x_as_date: boolean = false;
  y_axis_format: string = '.3s';
  bottom_margin: string = 'auto';
  x_axis_label: string = '';
  y_axis_label: string = '';
  y_axis_line: string = '';
  reduce_x_ticks: boolean = false;
  show_controls: boolean = false;
  // map
  tempClick = 'INDONESIA';
  temp = 'INDONESIA';
  entity;
  map_label: string = null;
  tooltips: any = [];
  select_country: any = 'indonesia';
  list_select_country;
  list_select_country_overlay;
  select_province;
  list_select_province;
  number_format;
  linear_color_scheme;
  color_scheme: string;
  random_color: boolean = false;
  lower_limit: number = 1000;
  upper_limit: number = 100000;
  // line
  timeseries_limit_metric: string = '';
  show_brush: boolean = false;
  rich_tooltip: boolean = true;
  show_markers: boolean = false;
  line_interpolation: string = 'basic';
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
  filter_item: any;
  filter_label: any;
  listVs: any = [];
  colorSchema: any = [];
  listChartType: object[] = [];
  searchText: string;
  visualType: string;
  visualName: string;
  displaySelected: string;
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
  alphabet_filter: boolean = false;
  filter_control_alphabetic: any;
  filter_checkbox: boolean = false;
  filter_control_checkbox: any;
  filter_checkbox_columns: any = [];
  alphabetic_filter_columns: any = [];
  filter_alignment_horizontal: boolean = false;
  // treemap
  treemap_ratio: any;
  // directed_force
  group: any;
  link_length: any;
  charge: any;
  stateloadDataset: boolean = false;
  checkHasError: boolean = false;
  having_filters: any = [];
  horizontal_bar_sorter: any;
  list_horizontal_bar_sorter: any = [];
  show_label: boolean = false;
  show_needle: boolean = true;
  with_animation: string;
  curvenes: string;
  repulsion: number;
  pandas_aggfunc: string;
  pivot_margins: true;
  combine_metric: false;

  // bar line
  with_line: boolean = false;
  line_metric: any;
  line_const: number;
  show_label_sort: boolean = false;
  hide_title: boolean = false;
  hide_background: boolean = false;
  list_pandas_aggfunc: any = [];
  list_filters: any = [];
  list_cols: any = [];
  list_cols_notification: any = [];
  persen: string;

  items: FormArray;
  rotate_axis;
  list_rotate_axis: any = [];
  layout_directed;
  list_layout_directed: any = [];
  validate_messages: any = [];
  messages: any;

  flaging: boolean = true;
  flaging2: boolean = false;
  urlChart: string;
  format_number_id: boolean = false;
  initial_date_filter: any;
  sort_aggregate_column: string = 'option1';
  choose_pallete: string = 'default_pallete';
  hasFlaging: string = 'overwrite';
  hasFlagingControl = new FormControl('', Validators.required);
  isViewMessage: boolean = true;
  isFormValidate: boolean = false;
  isCheckedAllItem: boolean = false;
  chart_on_click: boolean = true;
  link_to: string = '';
  dashboardList: any = [];
  colorPalette = {};
  objArr: any = [[]];
  filterDateList: any = [];
  filterDateTypeList: any = [];
  columnFormatList: any = [];
  style_tooltips: any;
  list_style_tooltips: any = [];
  base_columns: any = [];
  comparison: any = [];
  filter_comparison: any = 'latest_date';
  fontFamilyList: any = [];
  initialFilterDateList: any = [];
  initial_chart_blank: boolean = false;
  is_hide_togle_filter: boolean = false;
  hide_date_picker: boolean = false;
  is_first_axis_label: boolean = false;
  is_axis_reverse: boolean = false;
  set_default_series: any = [];
  spiral: any;
  list_spiral: any;
  scale: any;
  list_scale: any;
  font_size: number = 10;
  font_family: any = '';
  one_word_perline: boolean;
  orientation: any;
  orientation_from: any;
  orientation_to: any;
  distance: any;
  range: any;
  domain: any;
  chart_tooltip: boolean = false;
  column_target: Array<string> = [];
  heat_map: any = {
    metric_heat_map: null,
    x_heat_map: null,
    y_heat_map: null,
    sort_asc_x: true,
    sort_asc_y: true,
    limit_x: 10,
    limit_y: 10,
  };
  sort_asc_x: boolean;
  sort_asc_y: boolean;
  listFormula: any = {
    description: null,
    expression: 'Sum(column_name)',
    metric_name: 'sum__column_name',
    verbose_name: 'column_name (Sum)',
    warning_text: null,
    is_formula: true,
  };
  notifFormulaEditorOpts = {
    language: 'sql',
    automaticLayout: true,
  };
  notifFormulaValue = '';
  notifID = '';
  column_styles: ITableColStyle[] = [];
  columnStyles: ITableChartColStyle[] = [];
  public explorJsonState = null;
  public runQueryState = null;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private _apicall: ApiService,
    private modalService: NgbModal,
    private router: Router,
    private layoutUtilsService: LayoutUtilsService,
    private componentFactoryResolver: ViewContainerRef,
    private httpFile: HttpClient,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private translate: TranslateService,
    // new integration
    private store: Store<AppState>,
    public dialog: MatDialog
  ) {
    this.store.select(datasetItemSelector).subscribe((res) => (res ? this.loadDatasetTo(res) : null));
    // this.store.select(exploreJSONSelector).subscribe((res) => (res ? (this.explorJsonState = res) : null));
    // this.store.select(runQuerySelector).subscribe((res) => (res ? (this.runQueryState = res) : null));
    this.store.select(loadChartByIdSelector).subscribe((res) => {
      if (res) {
        this.loadChartbyId(res);
        this.loadChart();
      }
    });
  }

  environtmentType: any;
  introJS = introJs();
  async getIntro(user?: any) {
    if (!user.isFirst.isDataVisualizationChart) return;
    user.isFirst = { ...user.isFirst, isDataVisualizationChart: false };
    localStorage.setItem('user', JSON.stringify(user));
    let intro: any = await this.jsonService.retIntro(this.translationService.getSelectedLanguage());
    this.introJS
      .setOptions({
        steps: intro.configurechart,
        skipLabel: 'Skip',
        showBullets: true,
        hintButtonLabel: 'OK',
        showProgress: false,
        hidePrev: true,
        exitOnOverlayClick: false,
        hideNext: false,
      })
      .start();
  }

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.environtmentType = environment.type;
    this.introJS.start();
    this.getSchema();
    this.initial();
    this.loadDataset();
    // this.loadChart();
    this.initFormData();
    this.route.queryParams.subscribe((params) => {
      if (params.slice_id != undefined) {
        this.isViewMessage = false;
        Promise.resolve(this.loadChartbyId(params.slice_id, params.notifications));
      }
    });
  }

  ngAfterViewInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.changeLang();
    });
  }

  async changeLang() {
    this.messages = await this.jsonService.retMessage();
    this.list_time_grain_sqla = static_time_grain_sqla(this.messages);
    this.filterDateList = staticfilterDateList(this.messages);
    this.filterDateTypeList = staticfilterDateTypeList(this.messages);
  }

  initFormData() {
    this.form_data = {
      sort_asc_x: this.sort_asc_x || null,
      sort_asc_y: this.sort_asc_y || null,
      heat_map: this.heat_map,
      is_first_axis_label: this.is_first_axis_label || false,
      is_axis_reverse: this.is_axis_reverse || false,
      set_default_series: this.set_default_series || [],
      filter_comparison: this.filter_comparison || 'latest_date',
      comparison: this.comparison || [],
      base_columns: this.base_columns || [],
      style_tooltips: this.style_tooltips || 'item',
      with_line: this.with_line || false,
      line_metric: this.line_metric || null,
      line_const: this.line_const,
      hide_title: this.hide_title,
      hide_background: this.hide_background,
      show_label_sort: this.show_label_sort,
      sort_aggregate_column: this.sort_aggregate_column || 'option1',
      choose_pallete: this.choose_pallete || 'default_pallete',
      legend_width: this.legend_width || 400,
      legend_position: this.legend_position || 'top',
      legend_type: this.legend_type || 'scroll',
      legend_orient: this.legend_orient || 'horizontal',
      show_label: this.show_label || false,
      label_position: this.label_position || 'bottom',
      show_border: this.show_border || false,
      is_filterable: this.is_filterable || true,
      label_initial_date: this.label_initial_date || false,
      border_position: this.border_position || null,
      with_animation: this.with_animation || false,
      curvenes: this.curvenes || null,
      repulsion: this.repulsion || 100,
      layout_directed: this.layout_directed || 'force',
      rotate_axis: this.rotate_axis || 0,
      list_rotate_axis: this.list_rotate_axis,
      zoomsize: this.zoomsize || 4,
      subheaderfontsize: this.subheaderfontsize || 2,
      color_scheme: this.color_scheme,
      horizontal_bar_sorter: this.horizontal_bar_sorter || 'value',
      filters: this.filters || [],
      colorpickers: this.colorpickers || [],
      colorpickers2: this.colorpickers2 || [],
      groupby_arrs: this.groupby_arrs || [],
      area_chart: this.area_chart || false,
      stack_area_chart: this.stack_area_chart || false,
      having_filters: this.having_filters,
      palleteDefault: this.palleteDefault || 'palette1',
      component: this.component || [],
      columns: this.columns || [],
      records: this.records || [],
      table_timestamp_format: this.table_timestamp_format || '%d/%m/%Y',
      include_search: this.include_search || false,
      search_multi_columns: this.search_multi_columns || false,
      static_number: this.static_number || false,
      include_time: this.include_time || false,
      order_desc: this.order_desc || false,
      page_length: this.page_length,
      granularity_sqla: this.granularity_sqla || null,
      since: this.since,
      until: this.until,
      size_to: this.size_to || 60,
      subheader: this.subheader || null,
      rotation: this.rotation || 'random',
      shape: this.shape || 'diamond',
      x_axis_format: this.x_axis_format,
      y_axis_2_format: this.y_axis_2_format || '.3s',
      metric_2: this.metric_2 || null,
      list_shape: this.list_shape,
      list_rotation: this.list_rotation,
      metric: this.metric || [],
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
      metrics: this.metrics || [],
      groupby: this.groupby || [],
      show_legend: this.show_legend || false,
      show_row_limit: this.show_row_limit || false,
      row_limit: this.row_limit || 1000,
      time_grain_sqla: this.time_grain_sqla || null,
      mapGeoJSON: this.mapGeoJSON,
      myHtml: this.myHtml,
      typeHtml: this.typeHtml,
      order_by_cols: this.order_by_cols || [],
      granularity: this.granularity || null,
      druid_time_origin: this.druid_time_origin || null,
      table_filter_column: this.table_filter_column || null,
      table_sort_desc: this.table_sort_desc || false,
      table_grid_view: this.table_grid_view || false,
      search_main_column: this.search_main_column || false,
      search_second_column: this.search_second_column || false,
      gridview_list_view: this.gridview_list_view || false,
      table_font_size: this.table_font_size || 10,
      table_font_family: this.table_font_family || null,
      pie_label_type: this.pie_label_type || 'key_value',
      donut: this.donut || false,
      labels_outside: this.labels_outside || false,
      pie_sort_asc: this.pie_sort_asc || false,
      all_columns: this.all_columns || [],
      show_bar_value: this.show_bar_value || false,
      bar_stacked: this.bar_stacked || false,
      count_stacked: this.count_stacked || false,
      show_only_one_value: this.show_only_one_value || false,
      dist_bar_sorter: this.dist_bar_sorter || null,
      x_as_date: this.x_as_date || false,
      show_total_numeric_column: this.show_total_numeric_column,
      page_size: this.page_size || 10,
      page_index: this.page_index || 1,
      page_sort: this.page_sort || [],
      y_axis_format: this.y_axis_format || '.3s',
      format_number_tooltips: this.format_number_tooltips || '.3s',
      bottom_margin: this.bottom_margin || 'auto',
      x_axis_label: this.x_axis_label || null,
      y_axis_label: this.y_axis_label || null,
      y_axis_line: this.y_axis_line || null,
      reduce_x_ticks: this.reduce_x_ticks || false,
      show_controls: this.show_controls || false,
      entity: this.entity || null,
      map_label: this.map_label || null,
      tooltips: this.tooltips || [],
      select_country: this.select_country || 'indonesia',
      select_province: this.select_province,
      number_format: this.number_format || '.3s',
      linear_color_scheme: this.linear_color_scheme,
      lower_limit: this.lower_limit || 1000,
      upper_limit: this.upper_limit || 100000,
      timeseries_limit_metric: this.timeseries_limit_metric || null,
      show_brush: this.show_brush || false,
      rich_tooltip: this.rich_tooltip || true,
      show_markers: this.show_markers || false,
      line_interpolation: this.line_interpolation || 'basic',
      list_line_interpolation: this.list_line_interpolation || [],
      contribution: this.contribution || false,
      x_axis_showminmax: this.x_axis_showminmax || true,
      left_margin: this.left_margin || 'auto',
      y_axis_showminmax: this.y_axis_showminmax || true,
      y_log_scale: this.y_log_scale || false,
      y_axis_bounds: this.y_axis_bounds || [null, null],
      code2: this.code2,
      js: this.js,
      css: this.css,
      markup_type: this.markup_type || 'html',
      series: this.series || null,
      size: this.size,
      max_bubble_size: this.max_bubble_size || '25',
      x: this.x,
      x_log_scale: this.x_log_scale || false,
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
      y_axis_bounds_min: this.y_axis_bounds_min || null,
      y_axis_bounds_max: this.y_axis_bounds_max || null,
      pred_actual: this.pred_actual || null,
      pred_line: this.pred_line || null,
      pred_upper: this.pred_upper || null,
      pred_lower: this.pred_lower || null,
      date_filter: this.date_filter || false,
      instant_filtering: this.instant_filtering || false,
      alphabet_filter: this.alphabet_filter || false,
      filter_control_alphabetic: this.filter_control_alphabetic || null,
      filter_checkbox: this.filter_checkbox || false,
      filter_control_checkbox: this.filter_control_checkbox || null,
      filter_alignment_horizontal: this.filter_alignment_horizontal || false,
      treemap_ratio: this.treemap_ratio,
      link_length: this.link_length,
      charge: this.charge,
      chart_on_click: this.chart_on_click,
      link_to: this.link_to,
      format_number_id: this.format_number_id || false,
      custom_condition: this.custom_condition,
      custom_condition_arr: this.custom_condition_arr,
      list_gauge_label_type: this.list_gauge_label_type,
      max_value: this.max_value,
      show_axis_label: this.show_axis_label || false,
      gauge_label_type: this.gauge_label_type || 'value',
      show_needle: this.show_needle || true,
      hide_overlay: this.hide_overlay || false,
      hide_label: this.hide_label || false,
      hide_value: this.hide_value || false,
      is_point_tooltip: this.is_point_tooltip || false,
      point_comparations: this.point_comparations || [],
      filterDateList: this.filterDateList || [],
      filterDateTypeList: this.filterDateTypeList || [],
      columnFormatList: this.columnFormatList || [],
      fontFamilyList: this.fontFamilyList || [],
      filter_item: this.filter_item || null,
      filter_label: this.filter_label || null,
      filter_date: this.filter_date || null,
      filter_date_type: this.filter_date_type || null,
      filter_checkbox_columns: this.filter_checkbox_columns || [],
      alphabetic_filter_columns: this.alphabetic_filter_columns || [],
      initialFilterDateList: this.initialFilterDateList || [],
      initial_date_filter: this.initial_date_filter || null,
      notifications: this.notifications || null,
      notifications2: this.notifications2 || null,
      chart_on_click_specific_col: this.chart_on_click_specific_col || false,
      chart_on_click_col: this.chart_on_click_col || null,
      custom_column_format_arr: this.custom_column_format_arr || [],
      table_selected_column: this.table_selected_column || [],
      initial_chart_blank: this.initial_chart_blank || false,
      is_hide_togle_filter: this.is_hide_togle_filter || false,
      hide_date_picker: this.hide_date_picker || false,
      custom_width_column_arr: this.custom_width_column_arr || [],
      spiral: this.spiral,
      scale: this.scale,
      font_size: this.font_size,
      font_family: this.font_family,
      one_word_perline: this.one_word_perline,
      orientation: this.orientation,
      orientation_from: this.orientation_from,
      orientation_to: this.orientation_to,
      distance: this.distance,
      column_styles: this.column_styles,
    };
    return this.form_data;
  }

  // Preserve original property order
  originalOrder = (a: KeyValue<any, any>, b: KeyValue<any, any>): any => {
    return 0;
  };

  initial() {
    this.chart_on_click = true;
    this.format_number_id = false;
    this.initial_date_filter = null;
    this.link_to = null;
    this.chart_on_click_specific_col = false;
    this.chart_on_click_col = null;
    this.initial_chart_blank = false;
    // this.loadDashboard();
    this.slice = {};
    this.mydata = {};
    this.component = [];
    this.charts = [];
    this.isLoadingCharts = false;
    this.isLoadingDataset = false;
    this.queryName = null;
    this.datasetName = null;
    this.visualName = '-';
    this.datasourceTitle = null;
    this.paramEdit = {
      form_data: '{}',
      action: 'saveas',
      slice_id: null,
      slice_name: null,
      add_to_dash: null,
      goto_dash: false,
    };
    this.chartLinks = {};
    this.paramCreate = {
      action: null,
      slice_name: null,
    };
    this.list_layout_directed = static_layout_directed;
    this.list_rotate_axis = static_rotate_axis;
    this.list_style_tooltips = static_style_tooltips;
    this.list_horizontal_bar_sorter = static_horizontal_bar_sorter;
    this.list_pandas_aggfunc = static_pandas_aggfunc;
    this.list_granularity = static_granularity;
    this.list_line_interpolation = static_line_interpolation;
    this.list_spectrums = static_spectrums;
    this.list_shape = static_shape;
    this.list_spiral = static_spiral;
    this.list_scale = static_scale;
    this.list_rotation = static_rotation;
    this.list_select_country_overlay = static_select_country_overlay;
    this.list_select_country = static_select_country;
    this.list_select_province = static_select_province;
    this.list_legend_orient = static_legend_orient;
    this.list_legend_type = static_legend_type;
    this.list_dist_bar_sorter = static_dist_bar_sorter;
    this.operatorsArr = static_operators_arr;
    this.list_time_grain_sqla = static_time_grain_sqla(this.messages);
    this.list_link_length = static_link_length;
    this.list_charge = static_charge;
    this.list_row_limit = static_row_limit;
    this.list_page_length = static_page_length;
    this.list_page_length2 = static_page_length2;
    this.list_table_timestamp_format = static_table_timestamp_format;
    this.list_y_axis_format = static_y_axis_format;
    this.list_bottom_margin = static_bottom_margin;
    this.list_mode = static_mode;
    this.list_gauge_label_type = static_gauge_label_type;
    this.list_pie_label_type = static_pie_label_type;
    this.filterDateList = staticfilterDateList(this.messages);
    this.filterDateTypeList = staticfilterDateTypeList(this.messages);
    this.columnFormatList = staticcolumnFormatList;
    this.fontFamilyList = staticfontFamilyList;
    this.initialFilterDateList = staticinitialFilterDateList;
    this.table_selected_column = [];
    this.columnStyles = [];
    this.changeDetector.detectChanges();
  }

  async getSchema() {
    // this.store.dispatch(GetColorPallete());
    this.store
      .select(colorPalleteListSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.colorSchema = result;
          for (var i = 0; i < result.length; i++) {
            this.colorPalette['palette' + (i + 1)] = result[i];
          }
        }
      });
  }

  addTagFn(val) {
    return val;
  }

  onDelFilters(index) {
    this.list_filters.splice(index, 1);
    this.form_data.filters.splice(index, 1);
  }

  onAddFilters() {
    this.list_filters.push({
      index: this.list_filters.length,
      value: this.list_filters.length + 1,
    });
    if (this.form_data.filters != undefined) {
      this.form_data.filters.push({
        col: '',
        op: 'in',
        val: [],
      });
    }
    this.changeDetector.detectChanges();
    return;
  }

  chooseColor(palette, idx) {
    this.form_data = {
      ...this.form_data,
      color_scheme: palette,
    };
    this.index = idx;
  }

  onExtraChange(yAxisLabel: string): void {
    if (yAxisLabel != '') this.form_data = { ...this.form_data, show_controls: true };
  }

  onReduceChange(xAxisLabel: string): void {
    if (xAxisLabel != '') this.form_data = { ...this.form_data, reduce_x_ticks: true };
  }

  async loadDataset() {
    this.isViewMessage = true;
    this.getSchema();
    this.listVs = await this.jsonService.retVisual(this.translationService.getSelectedLanguage());
    this.slice = {};
    this.searchDatasetText = '';
    this.isLoadingDataset = true;
    this.masterDataDataset = [];
    this.datasetList = [];
    this.store
      .select(chartDatasourceSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.masterDataDataset = result.response;
          this.datasetList = result.response;
          this.isLoadingDataset = false;
          this.changeDetector.detectChanges();
        }
      });
  }

  async loadChartbyId(slice_id, notifications?) {
    this.store.dispatch(LoadChartById({ data: null }));
    this.resetFormula();
    this.loadDataset();
    this.isViewMessage = false;
    this.stateloadDataset = true;
    this.loaded = true;
    this.slice_id = slice_id;
    this.slice = { slice_id: this.slice_id };
    this.paramEdit['slice_id'] = this.slice_id;
    this.isLoadingContent = true;
    this.submit_form_data = [];
    let exploreUrl = 'api/chart/explore/?form_data=%7B%22slice_id%22%3A' + Number(slice_id) + '%7D';
    let explore = await this.loadChartData(exploreUrl, {});
    this.store.dispatch(PostDetailChartExporeFormDataChart({ param: explore }));
    let exploreJsonUrl = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + Number(slice_id) + '%7D';
    if (typeof explore == 'string' || explore == undefined) {
      this.isLoadingContent = false;
      this.errors = true;
      this.checkHasError = true;
      return false;
    }
    if (explore.form_data.granularity_sqla !== undefined) {
      if (
        explore.form_data.initial_date_filter !== undefined &&
        explore.form_data.initial_date_filter === 'latest_date'
      ) {
        if (explore.form_data.filter_date_type === 'date') {
          explore = {
            ...explore,
            form_data: {
              ...explore.form_data,
              since: moment(explore.latest_date).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
              until: moment(explore.latest_date).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
            },
          };
        } else if (explore.form_data.filter_date_type === 'month') {
          explore = {
            ...explore,
            form_data: {
              ...explore.form_data,
              since: moment(explore.latest_date).startOf('month').format('YYYY-MM-DDTHH:mm:ss'),
              until: moment(explore.latest_date).endOf('month').format('YYYY-MM-DDTHH:mm:ss'),
            },
          };
        } else if (explore.form_data.filter_date_type === 'year') {
          explore = {
            ...explore,
            form_data: {
              ...explore.form_data,
              since: moment(explore.latest_date).startOf('year').startOf('month').format('YYYY-MM-DDTHH:mm:ss'),
              until: moment(explore.latest_date).endOf('year').endOf('month').format('YYYY-MM-DDTHH:mm:ss'),
            },
          };
        }
      }
    }
    if (this.form_data.set_default_series && this.form_data.set_default_series.length != 0)
      explore = {
        ...explore,
        form_data: {
          ...explore.form_data,
          set_default_series: this.form_data.set_default_series,
        },
      };

    if (this.visualType == 'table_comparison') {
      let latest_date = explore.latest_date;
      if (explore.form_data.base_columns !== undefined) {
        for (let i = 0; i < explore.form_data.base_columns.length; i++) {
          let column_filter = explore.form_data.base_columns[i].column;
          let filter_date_type = explore.form_data.base_columns[i].filter_date_type;
          explore = {
            ...explore,
            form_data: {
              ...explore.form_data,
              base_columns: explore.form_data.base_columns.map((obj, index) => {
                if (index === i) {
                  obj = {
                    ...obj,
                    filters: setbaseColumnDate(latest_date, column_filter, filter_date_type),
                  };
                }
                return obj;
              }),
            },
          };
        }
      }
    }
    this.submit_form_data.push(explore.form_data);
    // this.store.dispatch(SetRunQuery({ data: this.submit_form_data }));
    localStorage.setItem('runQuery', JSON.stringify(this.submit_form_data));
    let param = { form_data: JSON.stringify(explore.form_data) };
    let exploreJson = await this.loadChartData(exploreJsonUrl, param);

    if (typeof exploreJson == 'string') {
      this.isLoadingContent = false;
      this.errors = true;
      this.errorMessage = exploreJson;
      this.changeDetector.detectChanges();
      return false;
    }
    // for edit metric & save chart
    this.row = {
      slice_chart_name: explore.slice.slice_name,
    };
    this.slice = explore.slice;
    // get data right bar & has error if metadata changed
    let datasource_name = explore.slice.datasource;
    let datapencarian = this.datasetList.filter((a) =>
      [a.name.toLowerCase(), a.dataset_alias.toLowerCase()].includes(datasource_name)
    );
    this.queryName = datapencarian.length > 0 ? datapencarian[0].query : '';
    this.datasetName = datapencarian.length > 0 ? datapencarian[0].dataset_alias : '';
    if (explore.form_data.viz_type2 != undefined) {
      this.visualType = explore.form_data.viz_type2;
      this.visualName = this.visualType.toString().toUpperCase();
      this.displaySelected = this.visualType;
    } else {
      this.visualType = explore.form_data.viz_type;
      this.visualName =
        explore.form_data.viz_type != 'country_map2'
          ? explore.form_data.viz_type.toString().toUpperCase()
          : 'OVERLAY MAP';
      this.displaySelected = this.visualType;
    }
    this.chartLinks = explore;
    let metricOpts = this.chartLinks.datasource.metrics;
    if (this.chartLinks.form_data.metrics) {
      metricOpts = [
        ...metricOpts,
        ...this.chartLinks.form_data.metrics.map((x) => ({
          description: null,
          expression: x,
          metric_name: x,
          verbose_name: x,
          warning_text: null,
        })),
      ];
    }
    if (this.chartLinks.form_data.metric && this.chartLinks.form_data.metric !== '') {
      metricOpts = [
        ...metricOpts,
        {
          description: null,
          expression: this.chartLinks.form_data.metric,
          metric_name: this.chartLinks.form_data.metric,
          verbose_name: this.chartLinks.form_data.metric,
          warning_text: null,
        },
      ];
    }
    this.chartLinks = { ...this.chartLinks, datasource: { ...this.chartLinks.datasource, metrics: metricOpts } };
    this.metricsOri = this.chartLinks.datasource.metrics.map((item) => item.metric_name);
    this.datasourceTitle = explore.slice.slice_name;
    // get map selected value right bar
    this.form_data = explore.form_data;
    if (exploreJson.form_data.notifications && exploreJson.form_data.notifications.length > 0) {
      const { id, condition, criterias } = exploreJson.form_data.notifications[0];
      this.notifID = id;
      this.form_data = {
        ...this.form_data,
        notifications: criterias.map((x) => {
          const { id, col, op, val } = x;
          return { id, col, op, val };
        }),
      };
      this.notifFormulaValue = condition;
    }
    if (this.form_data.notifications2 == undefined) this.form_data = { ...this.form_data, notifications2: [] };
    if (this.visualType == 'predictive')
      this.form_data = { ...this.form_data, viz_type: 'scatter', viz_type2: this.visualType };
    if (this.visualType == 'histogram')
      this.form_data = { ...this.form_data, viz_type: 'histogram', viz_type2: this.visualType };
    if (this.visualType == 'osmmap')
      this.form_data = { ...this.form_data, viz_type: 'histogram', viz_type2: this.visualType };
    if (this.form_data.viz_type2 != undefined) {
      this.visualName = String(this.form_data.viz_type2).toString().toUpperCase();
    }
    if (this.form_data.slice_id != undefined) {
      this.form_data = Object.assign({}, this.form_data, {
        slice_id: this.form_data.slice_id,
      });
    }
    this.index = Object.keys(this.colorPalette).indexOf(exploreJson.form_data.color_scheme);
    this.palleteDefault = exploreJson.form_data.color_scheme;
    let config = await this.getConfigChart(exploreJson);
    this.data_exploreJson = exploreJson;
    this.data_charts = await this.removeDuplicateObject(exploreJson.data);
    this.data_charts2 = await this.removeDuplicateObject(exploreJson.data, 'df');
    this.remappingColorpicker('ts', exploreJson);
    if (explore.form_data.viz_type == 'table') {
      this.columns = exploreJson.data.columns;
      this.records = await reformatDataTable(exploreJson.data.columns, exploreJson.data.records);
      this.column_styles = exploreJson.form_data.column_styles || [];
      this.initColStyles();
    }
    this.urlChart = exploreUrl;
    this.addCompChart(
      this.visualType,
      slice_id,
      explore.slice.slice_name,
      exploreUrl,
      config[0],
      this.palleteDefault,
      config[1],
      exploreJson,
      explore
      // this.index,
      // this.palleteDefault,
      // this.columns,
      // this.records
    );
    this.isLoadingContent = false;
    if (notifications) this.openModalTemplateCustom('modalNotifications');
    this.changeDetector.detectChanges();
  }

  async loadChart() {
    this.searchChartText = '';
    this.clicked = true;
    this.isLoadingCharts = true;
    this.masterDataChart = [];
    this.chartList = [];

    let result = await this._apicall.getApi('/api/chart/list');
    if (result.status) {
      this.masterDataChart =
        result.result.response == null ? null : result.result.response ? result.result.response : result.result;
      this.chartList =
        result.result.response == null ? null : result.result.response ? result.result.response : result.result;
      if (this.chartList != undefined && this.chartList.length > 0) {
        this.chartList[0] = { ...this.chartList[0], isChecked: false };
      }
    }
    this.isLoadingCharts = false;
    this.changeDetector.detectChanges();
  }

  async loadDashboard() {
    this.dashboardList = [];
    let result = await this._apicall.getApi('api/dashboard/list');
    if (result.status) {
      let dashboardList =
        result.result.response == null ? null : result.result.response ? result.result.response : result.result;
      if (dashboardList != undefined) {
        if (dashboardList == null) this.dashboardList = [];
        else {
          this.dashboardList = dashboardList;
          this.dashboardList[0] = { ...this.dashboardList[0], isChecked: false };
        }
      }
    }
    this.changeDetector.detectChanges();
  }

  async loadChartData(url, param) {
    this.messages = await this.jsonService.retMessage();
    let errorMessage = this.messages.CHART.MSG_ERR;
    let rest = await this._apicall.postApi(url, param);
    let result;
    if (rest.status) {
      result = rest.result.response ? rest.result.response : rest.result;
    } else {
      if (rest.result.status != 500) {
        this.errorMessage = errorMessage;
        this._apicall.openModal(this.messages.CHART.MSG_ERR, this.errorMessage);
        return this.errorMessage;
      } else {
        if (rest.result.status == 0) {
          this.errorMessage = this.messages.CHART.ERR_RTO;
          return this.errorMessage;
        }
        if (rest.result.hasOwnProperty('error')) {
          this.errorMessage = await rest.result.error.message;
          if (this.errorMessage == this.messages.CHART.MSG_NIL) {
            this.errorMessage = errorMessage;
            this._apicall.openModal(this.messages.CHART.F, this.errorMessage);
          } else this._apicall.openModal(this.messages.CHART.F, errorMessage);
          if (rest.result.statusText == 'Internal Server Error' && this.errorMessage == undefined) {
            this.errorMessage = errorMessage;
          }
          return this.errorMessage;
        }
      }
    }
    return result;
  }

  async loadDatasetData(url) {
    this.messages = await this.jsonService.retMessage();
    let result = await this._apicall.getApi(url);
    let value;
    if (result.status) {
      value = result.result.response ? result.result.response : result.result;
      return value;
    } else {
      this.isLoadingContent = false;
      this.errorMessage = this.messages.CHART.ERR_DT;
      this.removeChartFromContent();
      if (result.result.status == 0) {
        this.errorMessage = this.messages.CHART.ERR_RTO;
        this._apicall.openModal(this.messages.CHART.F, this.errorMessage);
        return this.errorMessage;
      }
      this._apicall.openModal(this.messages.CHART.F, this.errorMessage);
      return {};
    }
  }

  async loadDatasetToProps(item) {
    if (item == undefined) return this.router.navigate(['/pds/newdatavisualization']);
    this.resetFormula();
    this.initFormData();
    // this.store.dispatch(SetItemDataset({ item: item }));
    localStorage.setItem('dataset', JSON.stringify([item]));
    this.queryName = item.query;
    this.datasetName = item.dataset_alias;
    const [ds, dsType] = item.uid.split('__');
    const uri = `api/chart/explore/`;
    const url = `${uri}${dsType}/${ds}`;
    let explore = await this.loadDatasetData(url);
    this.chartLinks = explore;
    let metricOpts = this.chartLinks.datasource.metrics;
    if (this.chartLinks.form_data.metrics) {
      metricOpts = [
        ...metricOpts,
        ...this.chartLinks.form_data.metrics.map((x) => ({
          description: null,
          expression: x,
          metric_name: x,
          verbose_name: x,
          warning_text: null,
        })),
      ];
    }
    if (this.chartLinks.form_data.metric && this.chartLinks.form_data.metric !== '') {
      metricOpts = [
        ...metricOpts,
        {
          description: null,
          expression: this.chartLinks.form_data.metric,
          metric_name: this.chartLinks.form_data.metric,
          verbose_name: this.chartLinks.form_data.metric,
          warning_text: null,
        },
      ];
    }
    this.chartLinks.datasource.metrics = metricOpts;
    let urlnext = '/api/chart/explore_json/';
    let formdata = {
      datasource: explore.form_data.datasource,
      viz_type: explore.form_data.viz_type || 'preview',
      groupby: explore.form_data.groupby || [],
      metrics: explore.form_data.metrics || [],
      include_time: explore.form_data.include_time || false,
      timeseries_limit_metric: explore.form_data.timeseries_limit_metric || null,
      order_desc: explore.form_data.order_desc || true,
      all_columns: explore.form_data.all_columns || [],
      order_by_cols: explore.form_data.order_by_cols || [],
      granularity_sqla: explore.form_data.granularity_sqla || null,
      filter_date: explore.form_data.filter_date || null,
      filter_date_type: explore.form_data.filter_date_type || null,
      time_grain_sqla: explore.form_data.time_grain_sqla || null,
      since: explore.form_data.since || null,
      until: explore.form_data.until || null,
      filters: explore.form_data.filters || [],
      datasource_name: explore.form_data.datasource_name,
    };
    let param = { form_data: JSON.stringify(formdata) };
    let exploreJson = await this.loadChartData(urlnext, param);
    // this.store.dispatch(SetExploreJSON({ data: exploreJson }));
    localStorage.setItem('exploreJson', JSON.stringify(exploreJson));
    this.urlChart = url;
    if (this.slice && this.slice.slice_id != undefined && this.data_exploreJson.form_data) {
      this.form_data = this.data_exploreJson.form_data;
      let vizType = this.form_data.viz_type;
      if (this.form_data.viz_type2 != undefined) vizType = this.form_data.viz_type2;
      let isRun = await this.setValRequiredForm(vizType);
      if (isRun) await this.runQuery(vizType);
    } else this.slice = undefined;

    this.changeDetector.detectChanges();
  }
  setValRequiredForm(viz) {
    if (!this.data_exploreJson.form_data) return;

    return helperRequireFormValue(viz, this.chartLinks, this.form_data, this.data_exploreJson);
  }
  async loadDatasetTo(item) {
    this.store.dispatch(SetItemDataset({ item: null }));
    this.messages = await this.jsonService.retMessage();
    if (item == undefined) return this.router.navigate(['/pds/newdatavisualization']);
    this.initFormData();
    this.stateloadDataset = true;
    this.isViewMessage = false;
    // this.store.dispatch(SetItemDataset({ item: item }));
    localStorage.setItem('dataset', JSON.stringify([item]));
    this.removeChartFromContent();
    this.isLoadingContent = true;
    this.queryName = item.query;
    this.datasetName = item.dataset_alias;
    this.datasourceTitle = this.messages.CHART.U || 'Untitled';
    this.displaySelected = '';
    // for edit metric & save chart
    this.row = {
      slice_chart_name: this.datasourceTitle,
    };
    const [ds, dsType] = item.uid.split('__');
    const uri = `api/chart/explore/`;
    const url = `${uri}${dsType}/${ds}`;
    let explore = await this.loadDatasetData(url);
    this.store.dispatch(PostDetailChartExporeFormDataChart({ param: explore }));
    let urlnext = '/api/chart/explore_json/';
    let formdata = {
      datasource: explore.form_data.datasource,
      viz_type: explore.form_data.viz_type || 'preview',
      groupby: explore.form_data.groupby || [],
      metrics: explore.form_data.metrics || [],
      include_time: explore.form_data.include_time || false,
      timeseries_limit_metric: explore.form_data.timeseries_limit_metric || null,
      table_filter_column: explore.form_data.table_filter_column || null,
      table_sort_desc: explore.form_data.table_sort_desc || false,
      table_font_size: explore.form_data.table_font_size || 10,
      table_font_family: explore.form_data.table_font_family || null,
      page_size: explore.form_data.page_size || 10,
      page_index: explore.form_data.page_index || 1,
      page_sort: explore.form_data.page_sort || [],
      order_desc: explore.form_data.order_desc || true,
      all_columns: explore.form_data.all_columns || [],
      order_by_cols: explore.form_data.order_by_cols || [],
      granularity_sqla: explore.form_data.granularity_sqla || null,
      time_grain_sqla: explore.form_data.time_grain_sqla || null,
      since: explore.form_data.since || null,
      until: explore.form_data.until || null,
      filters: explore.form_data.filters || [],
      datasource_name: explore.form_data.datasource_name,
      filter_date: explore.form_data.filter_date || null,
      filter_date_type: explore.form_data.filter_date_type || null,
    };
    let param = { form_data: JSON.stringify(formdata) };
    let exploreJson = await this.loadChartData(urlnext, param);
    // this.store.dispatch(SetExploreJSON({ data: exploreJson }));
    localStorage.setItem('exploreJson', JSON.stringify(exploreJson));
    if (typeof exploreJson == 'string') {
      this.isLoadingContent = false;
      this.errors = true;
      this.checkHasError = true;
      this.errorMessage = exploreJson;
      this.changeDetector.detectChanges();
      return false;
    }
    this.visualType = explore.form_data.viz_type;
    this.visualName =
      explore.form_data.viz_type != 'country_map2'
        ? explore.form_data.viz_type.toString().toUpperCase()
        : 'OVERLAY MAP';
    if (explore.form_data.viz_type2 != undefined) {
      this.visualName = String(explore.form_data.viz_type2).toString().toUpperCase();
    }
    this.chartLinks = explore;
    let config = await this.getConfigChart(exploreJson);

    if (item.type == 'table') {
      this.columns = exploreJson.data.columns;
      this.records = await reformatDataTable(exploreJson.data.columns, exploreJson.data.records);
    }

    this.urlChart = url;
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
    this.isLoadingContent = false;
    this.changeDetector.detectChanges();
  }

  async getConfigChart(data) {
    let config = {};
    let jsonFile = null;
    let result = [];
    if (data.form_data.viz_type == 'country_map2') {
      let url = `assets/data/geojson/countries/${data.form_data.select_country2.toString().toLowerCase()}.geojson.json`;
      jsonFile = await this._apicall.loadGetData(url);
      config = this.setConfigMapOverlay(data, jsonFile);
    }
    result = [config, jsonFile];
    return result;
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

  async buttonNew() {
    this.messages = await this.jsonService.retMessage();
    if (!this.stateloadDataset) return;
    const dialogRef = this.layoutUtilsService.saveElement(
      this.messages.CHART.MSG_DWC,
      this.messages.CHART.MSG_YWCSABC,
      this.messages.CHART.MSG_CIS
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (res === true || res === 'load') {
        if (res === true) {
          this.hasFlaging = 'slice_id' in this.slice ? 'overwrite' : 'saveas';
          await this.saveChartsName([this.row], null);
        }
        this.stateloadDataset = false;
        this.isViewMessage = true;
        this.removeChartFromContent();
        this.router.navigate(['/pds/newdatavisualization']);
        return;
      }
    });
  }
  async duplicateChart(flag: any = [], slice?: any) {
    this.messages = await this.jsonService.retMessage();
    var query = {};
    if (flag.length == 0) {
      this.loadChart();
      return false;
    }
    this.modalService.dismissAll();
    $('button#btn-danger').trigger('click');
    this.isViewMessage = false;
    this.isLoadingContent = true;
    this.alertMessage = this.messages.CHART.MSG_PD;
    let slice_chart_name = slice.name.replace(/\s+/g, '-');
    if (flag.length > 0 && flag[0].hasOwnProperty('slice_chart_name')) {
      if (slice.name.replace(/\s+/g, '-') == flag[0].slice_chart_name.replace(/\s+/g, '-')) {
        slice_chart_name = flag[0].slice_chart_name + '-duplicate';
      } else {
        slice_chart_name = flag[0].slice_chart_name;
      }
    }
    query = {
      form_data: '%7B%22slice_id%22%3A' + slice.id + '%7D',
      action: 'saveas',
      slice_id: slice.id,
      slice_name: slice_chart_name,
      add_to_dash: 'noSave',
      goto_dash: false,
    };
    var queryString = Object.keys(query)
      .map((key) => key + '=' + query[key])
      .join('&');
    var url = 'api/chart/explore/?form_data=%7B%22slice_id%22%3A' + Number(slice.id) + '%7D';
    let explore = await this.loadChartData(url, {});
    if (typeof explore == 'string' || explore == undefined) {
      this.isLoadingContent = false;
      this.errors = true;
      this.errorMessage = explore;
      this.changeDetector.detectChanges();
      return false;
    }
    var param = { form_data: JSON.stringify(explore.form_data) };

    const [ds, dsType] = explore.form_data.datasource.split('__');
    var url2 = `api/chart/explore/${dsType}/${ds}?${queryString}`;
    await this.loadChartData(url2, param);
    this.isLoadingContent = false;
    await this.loadChart();
    await this.loadChartbyId(slice.id);
    await this._apicall.openModal(this.messages.CHART.S, this.messages.CHART.MSG_ASP);
  }

  async saveChartsName(flag: any = [], slice?: any) {
    this.messages = await this.jsonService.retMessage();
    if (this.form_data.viz_type == '' || this.form_data.viz_type == 'preview') {
      await this._apicall.openModal(this.messages.CHART.W, this.messages.CHART.MSG_PCVT, 'sm');
      this.changeDetector.detectChanges();
      return false;
    }
    var query = {};
    if (flag.length == 0) {
      this.loadChart();
      return false;
    }

    this.isLoadingContent = true;

    let slice_chart_name = (this.datasourceTitle || '').replace(/\s+/g, '+');
    if (flag.length > 0 && flag[0].hasOwnProperty('slice_chart_name')) {
      slice_chart_name = flag[0].slice_chart_name;
    }

    if (!this.slice || this.slice.slice_id == undefined) {
      query = {
        action: 'saveas',
        slice_name: slice_chart_name,
      };
    } else {
      if (this.hasFlaging == 'saveas') {
        query = {
          form_data: '%7B%22slice_id%22%3A' + this.slice.slice_id + '%7D',
          action: 'saveas',
          slice_id: this.slice.slice_id,
          slice_name: slice_chart_name,
          add_to_dash: 'noSave',
          goto_dash: false,
        };
      } else {
        query = {
          form_data: '%7B%22slice_id%22%3A' + this.slice.slice_id + '%7D',
          action: 'overwrite',
          slice_id: this.slice.slice_id,
          slice_name: slice_chart_name,
          add_to_dash: 'noSave',
          goto_dash: false,
        };
      }
    }
    var queryString = Object.keys(query)
      .map((key) => key + '=' + query[key])
      .join('&');

    let vizType = this.form_data.viz_type;
    if (this.form_data.viz_type2 != undefined) vizType = this.form_data.viz_type2;
    await this.validateForm(vizType);

    if (this.validate_messages.length > 0) {
      this.isLoadingContent = false;
      this.alertDialog();
      this.changeDetector.detectChanges();
      return;
    }
    if (!this.slice || this.slice.slice_id == undefined) {
      var datasource = localStorage.getItem('exploreJson') ? JSON.parse(localStorage.getItem('exploreJson')) : [];
      const [ds, dsType] = datasource.form_data.datasource.split('__');
      var url = `api/chart/explore/${dsType}/${ds}?${queryString}`;
      var params = this.runQueryState;

      this.modalService.dismissAll();
      $('button#btn-danger').trigger('click');
      this.isLoadingContent = false;
      if (params.length > 0) {
        params[0].since = '';
        params[0].until = '';
        if (this.form_data.set_default_series) params[0].set_default_series = this.form_data.set_default_series;
        if (this.form_data.colorpickers && this.form_data.colorpickers.length > 0)
          params[0].colorpickers = this.form_data.colorpickers;
        let param = { form_data: JSON.stringify(params[0]) };
        let slice_chart = await this.loadChartData(url, param);
        this.form_data = Object.assign({}, this.form_data, slice_chart.data.form_data);

        var url =
          'api/chart/explore/?form_data=%7B%22slice_id%22%3A' + parseInt(slice_chart.data.slice.slice_id) + '%7D';
        this.chartLinks = await this.loadChartData(url, {});
        localStorage.setItem('slice_chart', JSON.stringify([slice_chart]));

        this.isLoadingContent = false;
        if (this.chartLinks['can_add'] != null) {
          this.notificationService.setNotif();
          this.loadChart();
          await this.loadChartbyId(slice_chart.data.slice.slice_id);
          await this._apicall.openModal(this.messages.CHART.S, this.messages.CHART.MSG_ASP);
        } else {
          await this.loadChartbyId(slice_chart.data.slice.slice_id);
          await this._apicall.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
        }
      } else {
        this._apicall.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
      }
    } else {
      const [ds, dsType] = this.slice.form_data.datasource.split('__');
      var url = `api/chart/explore/${dsType}/${ds}?${queryString}`;
      var params = localStorage.getItem('runQuery') != undefined ? JSON.parse(localStorage.getItem('runQuery')) : [];
      // var params = this.runQueryState;
      params[0].since = '';
      params[0].until = '';
      if (this.form_data.set_default_series) params[0].set_default_series = this.form_data.set_default_series;
      if (this.form_data.colorpickers && this.form_data.colorpickers.length > 0)
        params[0].colorpickers = this.form_data.colorpickers;
      this.modalService.dismissAll();
      $('button#btn-danger').trigger('click');
      let param = { form_data: JSON.stringify(params[0]) };
      let slice_chart = await this.loadChartData(url, param);
      this.form_data = Object.assign({}, this.form_data, slice_chart.data.form_data);

      var url = 'api/chart/explore/?form_data=%7B%22slice_id%22%3A' + parseInt(this.slice.slice_id) + '%7D';
      this.chartLinks = await this.loadChartData(url, {});
      this.isLoadingContent = false;
      localStorage.setItem('slice_chart', JSON.stringify([slice_chart]));
      if (this.chartLinks['can_add'] != null) {
        this.notificationService.setNotif();
        this.loadChart();
        await this.loadChartbyId(this.slice.slice_id);
        await this._apicall.openModal(this.messages.CHART.S, this.messages.CHART.MSG_ASP);
      } else {
        await this.loadChartbyId(this.slice.slice_id);
        await this._apicall.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
      }
    }
    return;
  }

  setConfigBigNumber(data) {
    let format = data.form_data.y_axis_format || '.3s';
    let f = d3.format(format);
    return {
      value: data.form_data.y_axis_format == '.3s' ? convertNum(data.data.data[0][0]) : f(data.data.data[0][0]),
      text: data.data.subheader,
      zoomSizeValue: Number(data.form_data.zoomsize) || 4,
      zoomSizeText: Number(data.form_data.subheaderfontsize) || 1,
    };
  }

  setConfigMapOverlay(data, mapGeoJson) {
    let datamap = [];
    let datamapPie = [];
    let dataPieValue = [];
    let colorRandom = [];
    let visualMapColor = [];
    let visualMapText = [];
    let nameMap = {};
    let me = data.data;
    let scatterData = {};
    let scheme =
      data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
        ? data.form_data.color_scheme
        : 'palette1';
    let ini = this;
    let colorPalette = ini.colorPalette[scheme] || [];
    let colors = [];
    if (data.form_data.random_color) {
      let array = me.group;
      for (let index = 0; index < array.length; index++) {
        colors.push(colorPalette[getRandomInt(0, colorPalette.length)]);
      }
    }
    let f = d3.format(
      data.form_data.number_format != '' || data.form_data.number_format != undefined
        ? data.form_data.number_format
        : '.3s'
    );
    var title = data.form_data.select_country2;
    // for coloring
    let coloring = [];
    let coloringPie = [];
    for (var i = 0; i < me.group.length; i++) {
      let warna = colorPalette[i > colorPalette.length - 1 ? colorPalette.length - 1 : i];
      coloring.push(hexToRgbA(warna));
      coloringPie.push(warna);
    }
    this.coloringPie = coloringPie;
    let obj = {};
    ini.total = 0;
    for (var j = 0; j < me.data.length; j++) {
      ini.total += me.data[j][me.series_keys.indexOf('sumTot')];
      obj = {};
      obj = {
        name: me.data[j][me.series_keys.indexOf('name')],
        value: me.data[j][me.series_keys.indexOf('sumTot')],
        id: me.data[j][me.series_keys.indexOf('id')],
        sumTot: me.data[j][me.series_keys.indexOf('sumTot')],
        data: [],
      };
      let groupArr = [];
      for (var i = 0; i < me.group.length; i++) {
        obj['data'].push({
          name: me.group[i],
          color: coloring[i],
          value: me.data[j][me.series_keys.indexOf(me.group[i])],
        });
        if (obj['value'] == 0) {
          obj['value'] = me.data[j][me.series_keys.indexOf(me.group[i])];
        } else {
          obj['value'] =
            obj['value'] < me.data[j][me.series_keys.indexOf(me.group[i])]
              ? me.data[j][me.series_keys.indexOf(me.group[i])]
              : obj['value'];
        }
        groupArr.push(me.data[j][me.series_keys.indexOf(me.group[i])]);
      }
      let idxMaxVal = groupArr.indexOf(Math.max.apply(null, groupArr));
      // maps
      for (var k = 0; k < mapGeoJson.features.length; k++) {
        if (
          String(me.data[j][me.series_keys.indexOf('name')]).toLowerCase() ==
            String(mapGeoJson.features[k].properties.ISO).toLowerCase() ||
          String(me.data[j][me.series_keys.indexOf('name')]).toLowerCase() ==
            String(mapGeoJson.features[k].properties.NAME_1).toLowerCase()
        ) {
          let random = colorPalette[getRandomInt(0, colorPalette.length)];
          let colorResult = random == null ? colorPalette[colorPalette.length - 1] : random;
          colorRandom.push(colorResult);
          datamap.push({
            id: mapGeoJson.features[k].properties.ISO,
            name: mapGeoJson.features[k].properties.NAME_1,
            value: obj['value'],
            label: {
              show: true,
              color: coloring[idxMaxVal], //colorResult,
            },
          });
          // map pie
          obj['label'] = {
            show: true,
            color: coloring[idxMaxVal], //colorResult,
          };
          obj['id'] = mapGeoJson.features[k].properties.ISO;
          obj['name'] = mapGeoJson.features[k].properties.NAME_1;
          datamapPie.push(obj);
          mapGeoJson.features[k].properties['name'] = mapGeoJson.features[k].properties.NAME_1;
          // visual map
          visualMapColor.push(hexToRgbA(coloring[idxMaxVal]));
          visualMapText.push(mapGeoJson.features[k].properties.NAME_1);
          break;
        } else {
        }
      }
    }
    let seriesData = [];
    ini.scatterDatas = datamapPie;
    var title = data.form_data.select_country2 != 'Pemilu - overlay' ? data.form_data.select_country2 : 'indonesia';
    var min = Math.min.apply(null, dataPieValue);
    var max = Math.max.apply(null, dataPieValue);

    echarts.registerMap(title, mapGeoJson);
    seriesData.push({
      name: 'Peta ' + title + 'Maps',
      type: 'map',
      mapType: title, // add map type should be registered
      geoIndex: 0,
      data: datamapPie,
      // add
      zoom: 1.25,
      roam: false,
      aspectScale: 1,
    });

    return {
      grid: {
        left: '0%',
        right: '5%',
        bottom: '5%',
        containLabel: true,
      },
      title: {
        text: title,
        subtext: '',
        left: 'center',
      },
      legend: {
        show: true,
        type: 'scroll',
        orient: 'horizontal',
        left: 'left',
        width: 275,
        data: me.group,
        textStyle: {
          fontSize: 10,
        },
      },
      tooltip: {
        trigger: 'item',
        renderMode: 'html',
        confine: true,
        extraCssText: 'z-index: 1000',
        formatter: function (params) {
          if (params['data'] == undefined) return '0';
          if (data.form_data.number_format) {
            var f = d3.format(data.form_data.number_format);
            let html = '';
            params['data'].data.map((v, idx) => {
              html +=
                v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + data.form_data.y_axis_format == 'd'
                  ? convertNum(v.value)
                  : f(v.value) + '<br>';
            });
            return params['data'].name +
              '<br>' +
              html +
              '<br/><hr style="border-top: 1px solid red;"/>Total: ' +
              data.form_data.y_axis_format ==
              'd'
              ? convertNum(params['data'].value)
              : f(params['data'].value) + '<br>';
          }
          let html = '';
          params['data'].data.map((v, idx) => {
            html += v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + v.value + '<br>';
          });
          return (
            params['data'].name +
            '<br>' +
            html +
            '<br/><hr style="border-top: 1px solid red;"/>Total: ' +
            params['data'].value
          );
        },
      },
      toolbox: {
        show: true,

        left: 'right',
        top: 'top',
        feature: {},
      },
      visualMap: {
        show: false,
        min: 0,
        max: coloring.length - 1, //ini.total,
        left: 'left',

        text: me.group, //visualMapText,
        seriesIndex: [0],
        inRange: {
          color: coloring,
        },
        calculable: true,
      },
      geo: {
        map: title,
        show: true,
        roam: false,
        zoom: 1.2,
        aspectScale: 1,
        seriesIndex: [0],
      },
      series: seriesData,
    };
  }

  onSelectFilterCol(item) {
    this.form_data.filter_checkbox_columns = [];
    this.form_data.alphabetic_filter_columns = [];
    for (var i = 0; i < item.length; i++) {
      let arr = [];
      for (var j = 0; j < 2; j++) {
        arr.push(item[i]);
      }
      this.form_data.filter_checkbox_columns.push(arr);
      this.form_data.alphabetic_filter_columns.push(arr);
    }
  }
  onChartDelete(index: number) {
    let componentRef = this.component.filter((x) => x.instance.index == index)[0];
    let componentInstance = componentRef.instance;
    let vcrIndex: number = this.injectComp.viewContainerRef.indexOf(componentRef);
    this.injectComp.viewContainerRef.remove(vcrIndex);
    this.component = this.component.filter((x) => x.instance.index !== index);
    this.charts = this.charts.filter((x) => x.id !== componentInstance.myChartID);
    window.dispatchEvent(new Event('resize'));
    this.changeDetector.detectChanges();
  }

  async onChartDownload(id) {
    if (id == undefined) return;
    let url = this.urlChart;
    let mydata = await this.loadChartData(url, {});
    let urlnext = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + id + '%7D&csv=true';
    let param = { form_data: JSON.stringify(mydata.form_data) };
    this._apicall.post(urlnext, param).subscribe((resp: any) => {
      FileSaver.saveAs(resp, mydata.slice.datasource + ' ' + mydata.slice.slice_name + `.csv`);
    });
  }

  async onOpenModal(fomdata) {
    this.modalService.dismissAll();
    $('button#btn-danger').trigger('click');
    let viz_type = this.form_data.viz_type ? this.form_data.viz_type : this.visualType;
    await this.runQuery(viz_type);
    this.changeDetector.detectChanges();
  }

  onChartEdit(id) {
    this.router.navigate(['/pds/newdatavisualization'], {
      queryParams: { slice_id: id },
    });
  }

  async onChartRefresh(item) {
    await this.loadChartbyId(item.id);
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

  openModal(title?, msg?, size?, isFooter?, footerLeftText?, footerRightText?) {
    if (footerLeftText != null && footerRightText != null) {
      let modalRef;
      modalRef = this.modalService.open(ModalComponent, {
        centered: true,
        size: size || 'lg',
      });
      modalRef.componentInstance.title = title ? title : '';
      modalRef.componentInstance.msg = msg ? msg : this.messages.CHART.MSG_UPS;
      modalRef.componentInstance.isFooter = isFooter ? isFooter : false;
      modalRef.componentInstance.footerLeftText = footerLeftText ? footerLeftText : this.messages.CHART.Y || 'Yes';
      modalRef.componentInstance.footerRightText = footerRightText
        ? footerRightText
        : this.messages.CHART.MSG_UPS || 'No';
    } else {
      this.validate_messages = [];
      let message = msg ? msg : this.messages.CHART.MSG_UPS;
      this.validate_messages.push(message);
      $('#alertDialog').modal();
      this.changeDetector.detectChanges();
    }
  }

  openModalTemplate(content) {
    const modalRef = this.modalService.open(content, {
      centered: true,
    });
  }

  // BEGIN FUNGSIONAL GENERATE CHART
  setPickerComparison(val, index, filter_date_type?) {
    let _this = this;
    if (!['static_date', 'static_month', 'static_year'].includes(filter_date_type)) {
      return this.onChangeFilterComparison(filter_date_type, index);
    } else {
      let filter_date_type = _this.form_data.base_columns[index].filter_date_type;
      if (filter_date_type == 'static_month') {
        $('#static_value_' + index).bootstrapMaterialDatePicker({
          format: 'YYYY-MM',
          clearButton: true,
          weekStart: 1,
          time: false,
        });
      } else if (filter_date_type == 'static_year') {
        $('#static_value_' + index).bootstrapMaterialDatePicker({
          format: 'YYYY',
          clearButton: true,
          weekStart: 1,
          time: false,
        });
      } else {
        $('#static_value_' + index).bootstrapMaterialDatePicker({
          format: 'YYYY-MM-DD',
          clearButton: true,
          weekStart: 1,
          time: false,
        });
      }
      $('#static_value_' + index)
        .bootstrapMaterialDatePicker()
        .on('change', function (e, time) {
          let column_filter = _this.form_data.base_columns[index].column;
          let latest_date = e.target.value;
          let isUtc = new Date(latest_date);
          if (String(isUtc) != 'Invalid Date') latest_date = moment(latest_date).format('YYYY-MM-DD HH:mm:ss');
          else latest_date = latest_date;
          let type = 'date';
          if (filter_date_type == 'static_month') {
            type = 'month';
            _this.form_data.base_columns[index].static_value = moment(latest_date).format('YYYY-MM');
          } else if (filter_date_type == 'static_year') {
            type = 'year';
            _this.form_data.base_columns[index].static_value = moment(latest_date).format('YYYY');
          } else {
            _this.form_data.base_columns[index].static_value = moment(latest_date).format('YYYY-MM-DD HH:mm:ss');
          }
          _this.onChangeFilterComparison(type, index, latest_date);
        });
    }
    this.changeDetector.detectChanges();
  }

  setPicker(event: MatDatepickerInputEvent<Date>, type) {
    switch (type) {
      case 'since':
        this.form_data = { ...this.form_data, since: moment(event.value).format() };
        this.since = moment(event.value).format();
        break;
      case 'until':
        this.form_data = { ...this.form_data, until: moment(event.value).format() };
        this.until = moment(event.value).format();
        break;
    }
  }

  async setVisualType(row) {
    this.displaySelected = row.value;
    this.visualType = row.value;
    this.visualName = row.label.toString().toUpperCase();
    if (this.slice && this.slice.slice_id != undefined && this.data_exploreJson.form_data) {
      if (!this.form_data.heat_map) this.form_data.heat_map = this.heat_map;
      try {
        await this.setValRequiredForm(this.visualType);
      } catch (e) {
        await this.validateForm(this.visualType);
      }
    } else {
      switch (this.visualType) {
        // for disable default chart on click
        case 'big_number_total':
        case 'country_map':
        case 'dist_bar':
        case 'horizontal_bar':
        case 'table':
          this.form_data = {};
          break;
        default:
          this.form_data = this.initFormData();
          this.form_data.base_columns = [];
          this.form_data.comparison = [];
          break;
      }
    }
    this.since = '';
    this.until = '';
    await this.runQuery(this.visualType);
    this.changeDetector.detectChanges();
  }

  async validateForm(viz) {
    this.messages = await this.jsonService.retMessage();
    this.isFormValidate = false;
    this.validate_messages = [];
    let vizType = this.form_data.viz_type == undefined ? viz : this.form_data.viz_type;

    if (this.form_data.viz_type == 'scatter' && viz == 'predictive') {
      vizType = 'predictive';
    }

    if (this.form_data.viz_type == 'histogram' && viz == 'histogram') {
      vizType = 'histogram';
    }

    if (this.form_data.viz_type == 'osmmap' && viz == 'histogram') {
      vizType = 'histogram';
    }

    if (vizType == 'preview') {
      this.isFormValidate = false;
      return this.validate_messages.push(this.messages.CHART.MSG_PCVT);
    }
    //Time validation
    if (this.form_data.initial_date_filter !== null && this.form_data.initial_date_filter !== undefined) {
      if (this.form_data.granularity_sqla === null || this.form_data.granularity_sqla === undefined) {
        this.validate_messages.push(this.messages.CHART.MSG_TCR);
      }
      if (this.form_data.filter_date === null || this.form_data.filter_date === undefined) {
        this.validate_messages.push(this.messages.CHART.MSG_DFR);
      }
      if (this.form_data.filter_date_type === null || this.form_data.filter_date_type === undefined) {
        this.validate_messages.push(this.messages.CHART.MSG_DFTCR);
      }
    }

    this.validate_messages = helperValidateFormVisualType(
      vizType,
      this.isFormValidate,
      this.form_data,
      this.messages,
      this.validate_messages
    );
    if (this.validate_messages.length > 0) {
      this.isFormValidate = true;
    }
  }

  setLegendPosition(value) {
    if (value == this.form_data.legend_position) value = '';
    this.form_data = {
      ...this.form_data,
      legend_position: value,
    };
  }
  setLabelPosition(value) {
    if (value == this.form_data.label_position) value = '';
    this.form_data = {
      ...this.form_data,
      label_position: value,
    };
  }
  setBorderPosition(value) {
    if (value == this.form_data.border_position) value = '';
    this.form_data = {
      ...this.form_data,
      border_position: value,
    };
  }

  async runQuery(visualType) {
    this.messages = await this.jsonService.retMessage();
    if (!this.stateloadDataset) return;
    this.isLoadingContent = true;

    this.visualType = visualType;
    var form_data = {};
    this.submit_form_data = [];
    var params = {
      form_data: {
        datasource: null,
        datasource_name: null,
      },
    };
    var datasource = '';
    var datasource_name = '';
    let since = this.since;
    let until = this.until;
    if (this.form_data.granularity_sqla !== undefined) {
      if (this.form_data.initial_date_filter !== undefined && this.form_data.initial_date_filter === 'latest_date') {
        if (this.form_data.filter_date_type === 'date') {
          since = moment(this.data_exploreJson.latest_date).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
          until = moment(this.data_exploreJson.latest_date).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
        } else if (this.form_data.filter_date_type === 'month') {
          since = moment(this.data_exploreJson.latest_date).startOf('month').format('YYYY-MM-DDTHH:mm:ss');
          until = moment(this.data_exploreJson.latest_date).endOf('month').format('YYYY-MM-DDTHH:mm:ss');
        } else if (this.form_data.filter_date_type === 'year') {
          since = moment(this.data_exploreJson.latest_date)
            .startOf('year')
            .startOf('month')
            .format('YYYY-MM-DDTHH:mm:ss');
          until = moment(this.data_exploreJson.latest_date).endOf('year').endOf('month').format('YYYY-MM-DDTHH:mm:ss');
        }
      }
    }
    if (this.form_data.viz_type == 'pivot_table' && visualType == 'table') {
      visualType = 'pivot_table';
    }
    if (this.form_data.viz_type == 'horizontal_bar' && visualType == 'dist_bar') {
      visualType = 'horizontal_bar';
    }
    if (this.form_data.viz_type == 'dual_line' && visualType == 'line') {
      visualType = 'dual_line';
    }
    if (this.form_data.viz_type == 'country_map2' && visualType == 'country_map') {
      visualType = 'country_map2';
    }

    switch (visualType) {
      case 'table':
      case 'pivot_table':
        if (this.form_data.granularity_sqla === 'null') {
          this.form_data.granularity_sqla = null;
          this.form_data.time_grain_sqla = null;
          this.form_data.filter_date = null;
          this.form_data.filter_date_type = null;
          this.form_data.initial_date_filter = null;
        }
        form_data = {
          groupby: this.form_data.groupby || [],
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          sort_aggregate_column: this.form_data.sort_aggregate_column || 'option1',
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          metrics:
            this.form_data.metrics != undefined && this.form_data.metrics.length > 0 ? this.form_data.metrics : [],
          granularity: this.form_data.granularity,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          number_format: this.form_data.number_format || ',',
          initial_date_filter: this.form_data.initial_date_filter || null,
          chart_on_click_specific_col: this.form_data.chart_on_click_specific_col || false,
          chart_on_click_col: this.form_data.chart_on_click_col || false,
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          column_styles: this.column_styles,
          granularity_sqla: this.form_data.granularity_sqla || null,
        };
        if (visualType == 'pivot_table') {
          form_data = {
            ...form_data,
            viz_type: visualType || 'pivot_table',
            columns: this.form_data.columns || [],
            pandas_aggfunc: this.form_data.pandas_aggfunc || 'sum',
            pivot_margins: this.form_data.pivot_margins || true,
            combine_metric: this.form_data.combine_metric || false,
            granularity_sqla: this.form_data.granularity_sqla || null,
          };
        } else {
          this.page_sort = [];

          if (this.form_data.table_filter_column !== undefined) {
            if (this.form_data.table_filter_column !== null) {
              this.page_sort = [];
              let sortOrder = this.form_data.table_sort_desc === true ? 'desc' : 'asc';
              let sortObj = {
                column: this.form_data.table_filter_column,
                order: sortOrder,
              };
              this.page_sort.push(sortObj);
            }
          }
          if (this.form_data.timeseries_limit_metric !== undefined) {
            if (
              this.form_data.timeseries_limit_metric !== null &&
              this.form_data.timeseries_limit_metric !== 'undefined'
            ) {
              this.page_sort = [];
              let sortOrder = this.form_data.order_desc === true ? 'desc' : 'asc';
              let sortObj = {
                column: this.form_data.timeseries_limit_metric,
                order: sortOrder,
              };
              this.page_sort.push(sortObj);
            }
          }
          form_data = {
            ...form_data,
            granularity_sqla: this.form_data.granularity_sqla,
            viz_type: visualType || 'table',
            include_time: this.form_data.include_time || false,
            timeseries_limit_metric: String(this.form_data.timeseries_limit_metric) || null,
            order_desc: this.form_data.order_desc,
            all_columns: this.form_data.all_columns || [],
            order_by_cols: this.form_data.order_by_cols || [],
            table_timestamp_format: this.form_data.table_timestamp_format || '%d/%m/%Y',

            page_length: Number(this.form_data.page_length) || 0,
            include_search: this.form_data.include_search,
            search_multi_columns: this.form_data.search_multi_columns || false,
            table_filter_column: this.form_data.table_filter_column || null,
            table_sort_desc: this.form_data.table_sort_desc || false,
            table_grid_view: this.form_data.table_grid_view || false,
            search_main_column: this.form_data.search_main_column || false,
            search_second_column: this.form_data.search_second_column || false,
            gridview_list_view: this.form_data.gridview_list_view || false,
            table_font_size: this.form_data.table_font_size || 10,
            table_font_family: this.form_data.table_font_family || null,
            show_total_numeric_column: this.form_data.show_total_numeric_column || false,
            having_filters: this.form_data.having_filters || [],
            page_size: Number(this.form_data.page_size) || 10,
            page_index: this.form_data.page_index || 1,
            page_sort: this.page_sort || [],
            static_number: this.form_data.static_number || false,
            notifications: this.form_data.notifications || [],
            custom_column_format_arr: this.form_data.custom_column_format_arr || [],
            custom_width_column_arr: this.form_data.custom_width_column_arr || [],
          };
        }
        break;
      case 'table_comparison':
        if (this.form_data.base_columns && this.form_data.base_columns.length == 0) this.onChangeFilterComparison();
        form_data = {
          viz_type: visualType,
          groupby: this.form_data.groupby || [],
          number_format: this.form_data.number_format || ',',
          comparison: this.form_data.comparison || [],
          base_columns: this.form_data.base_columns || [],
          filter_comparison: this.form_data.filter_comparison || 'latest_date',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          y_axis_format: this.form_data.y_axis_format || ',',
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          notifications: this.form_data.notifications || [],
          custom_column_format_arr: this.form_data.custom_column_format_arr || [],
          initial_date_filter: this.form_data.initial_date_filter || null,
        };
        break;
      case 'pie':
        form_data = {
          viz_type: visualType,
          metrics: this.form_data.metrics,
          tooltips: this.form_data.tooltips || [],
          hide_label: this.form_data.hide_label || false,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          groupby: this.form_data.groupby || [],
          y_axis_format: this.form_data.y_axis_format || ',',
          limit: Number(this.form_data.limit) || 10,
          pie_label_type: this.form_data.pie_label_type || 'key',
          donut: this.form_data.donut,
          show_legend: this.form_data.show_legend,
          labels_outside: this.form_data.labels_outside,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          notifications2: this.form_data.notifications2 || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          pie_sort_asc: this.form_data.pie_sort_asc || false,
        };
        break;
      case 'horizontal_bar':
      case 'dist_bar':
        form_data = {
          metrics: this.form_data.metrics,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          show_label_sort: this.form_data.show_label_sort,
          tooltips: this.form_data.tooltips || [],
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          groupby: this.form_data.groupby || [],
          columns: this.form_data.columns || [],
          row_limit: Number(this.form_data.row_limit) || 100,
          rotate_axis: this.form_data.rotate_axis || null,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          show_legend: this.form_data.show_legend || false,
          show_bar_value: this.form_data.show_bar_value || false,
          bar_stacked: this.form_data.bar_stacked || false,
          count_stacked: this.form_data.count_stacked || false,
          order_desc: this.form_data.order_desc || false,
          y_axis_format: this.form_data.y_axis_format || ',',
          format_number_tooltips: this.form_data.format_number_tooltips || ',',
          y_axis_2_format: this.form_data.y_axis_2_format || ',',
          bottom_margin: this.form_data.bottom_margin || 'auto',
          x_axis_label: this.form_data.x_axis_label,
          y_axis_label: this.form_data.y_axis_label,
          y_axis_line: this.form_data.y_axis_line,
          reduce_x_ticks: this.form_data.reduce_x_ticks,
          show_controls: this.form_data.show_controls,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          with_line: this.form_data.with_line || false,
          style_tooltips: this.form_data.style_tooltips || 'item',
          show_dual_axis_line: this.form_data.show_dual_axis_line || false,
          initial_date_filter: this.form_data.initial_date_filter || null,
          y_axis_bounds_min: this.form_data.y_axis_bounds_min || null,
          y_axis_bounds_max: this.form_data.y_axis_bounds_max || null,
          notifications: this.form_data.notifications || [],
          show_only_one_value: this.form_data.show_only_one_value || false,
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          is_first_axis_label: this.form_data.is_first_axis_label || false,
          is_axis_reverse: this.form_data.is_axis_reverse || false,
          set_default_series: this.form_data.set_default_series || null,
        };
        if (this.form_data.with_line) {
          form_data = {
            ...form_data,
            line_metric: this.form_data.line_metric || null,
            line_const: Number(this.form_data.line_const) || undefined,
          };
        }
        if (visualType == 'horizontal_bar') {
          form_data = {
            ...form_data,
            viz_type: visualType || 'horizontal_bar',
            horizontal_bar_sorter: this.form_data.horizontal_bar_sorter || 'value',
            left_margin: this.form_data.left_margin || 'auto',
            x_as_date: this.form_data.x_as_date || false,
          };
        } else {
          form_data = {
            ...form_data,
            viz_type: visualType || 'dist_bar',
            dist_bar_sorter: this.form_data.dist_bar_sorter || 'value',
            x_as_date: this.form_data.x_as_date || false,
          };
        }
        break;
      case 'histogram':
        form_data = {
          viz_type: visualType,
          range: this.form_data.range,
          domain: this.form_data.domain,
          column_target: this.form_data.column_target,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          chart_tooltip: this.form_data.chart_tooltip || false,
          link_to: this.form_data.link_to || null,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          show_border: this.form_data.show_border || false,
          is_filterable: this.form_data.is_filterable,
          label_initial_date: this.form_data.label_initial_date || true,
          x_axis_label: this.form_data.x_axis_label,
          y_axis_label: this.form_data.y_axis_label,
          y_axis_format: this.form_data.y_axis_format || ',',
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;

      case 'osmmap':
        form_data = {
          viz_type: visualType,
          range: this.form_data.range,
          domain: this.form_data.domain,
          column_target: this.form_data.column_target,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          chart_tooltip: this.form_data.chart_tooltip || false,
          link_to: this.form_data.link_to || null,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          show_border: this.form_data.show_border || false,
          is_filterable: this.form_data.is_filterable,
          label_initial_date: this.form_data.label_initial_date || true,
          x_axis_label: this.form_data.x_axis_label,
          y_axis_label: this.form_data.y_axis_label,
          y_axis_format: this.form_data.y_axis_format || ',',
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;
      case 'country_map2':
      case 'country_map':
      case 'map':
        form_data = {
          viz_type: visualType || 'country_map',
          entity: this.form_data.entity || null,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          metric: this.form_data.metric != undefined && this.form_data.metric.length > 0 ? this.form_data.metric : null,
          number_format: this.form_data.number_format || ',',
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          show_legend: this.form_data.show_legend || false,
        };

        if (visualType == 'country_map') {
          form_data = {
            ...form_data,
            viz_type: visualType || 'country_map',
            select_country: this.form_data.select_country || 'indonesia',
            select_province: this.form_data.select_country == 'indonesia' ? this.form_data.select_province : null,
            map_label:
              this.form_data.map_label != undefined && this.form_data.map_label.length > 0
                ? this.form_data.map_label
                : null || null,
            tooltips:
              this.form_data.tooltips != undefined && this.form_data.tooltips.length > 0
                ? this.form_data.tooltips
                : [] || [],
            lower_limit: this.form_data.lower_limit || 1000,
            upper_limit: this.form_data.upper_limit || 100000,
            hide_label: this.form_data.hide_label || false,
            hide_value: this.form_data.hide_value || false,
            is_point_tooltip: this.form_data.is_point_tooltip || false,
            point_comparations: this.form_data.point_comparations || [],
            map_label_reference: this.form_data.map_label_reference || null,
            notifications: this.form_data.notifications || [],
            notifications2: this.form_data.notifications2 || [],
          };
        } else {
          form_data = {
            ...form_data,
            viz_type: visualType || 'country_map2',
            columns: this.form_data.columns || null,
            groupby: this.form_data.groupby || null,
            select_country2: this.form_data.select_country2 || 'indonesia',
            show_label: this.form_data.show_label || false,
            hide_overlay: this.form_data.hide_overlay || false,
          };
        }
        break;
      case 'gauge':
        form_data = {
          viz_type: visualType,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          color_scheme: this.form_data.color_scheme || 'palette1',
          metric: this.form_data.metric || null,
          custom_condition: this.form_data.custom_condition || false,
          show_needle: this.form_data.show_needle,
          custom_condition_arr: this.form_data.custom_condition_arr || [],
          show_label: this.form_data.show_label,
          show_axis_label: this.form_data.show_axis_label,
          max_value: this.form_data.max_value,
          number_format: this.form_data.number_format || ',',
          format_number_id: this.form_data.format_number_id || false,
          gauge_label_type: this.form_data.gauge_label_type || 'value',
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;
      case 'big_number_total':
        form_data = {
          viz_type: visualType,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          filter_item: this.form_data.filter_item || null,
          filter_label: this.form_data.filter_label || null,
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          label_position: this.form_data.label_position || 'bottom',
          show_border: this.form_data.show_border || false,
          is_filterable: this.form_data.is_filterable,
          label_initial_date: this.form_data.label_initial_date || false,
          border_position: this.form_data.border_position || null,
          metric: this.form_data.metric || 'count',
          zoomsize: Number(this.form_data.zoomsize) || 5,
          subheader: this.form_data.subheader || null,
          subheaderfontsize: Number(this.form_data.subheaderfontsize) || 2,
          y_axis_format: this.form_data.y_axis_format || ',',
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;

      case 'word_cloud':
        form_data = {
          viz_type: visualType,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          series: this.form_data.series != undefined && this.form_data.series.length > 0 ? this.form_data.series : null,
          metric: this.form_data.metric != undefined && this.form_data.metric.length > 0 ? this.form_data.metric : null,
          row_limit: Number(this.form_data.row_limit) || 100,
          rotation: this.form_data.rotation || 'random',
          spiral: this.form_data.spiral,
          scale: this.form_data.scale,
          font_size: this.form_data.font_size,
          font_family: this.form_data.font_family,
          one_word_perline: this.form_data.one_word_perline,
          distance: this.form_data.distance,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;
      case 'line':
      case 'dual_line':
        form_data = {
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          x_axis_format: this.form_data.x_axis_format || '%d/%m/%Y',
          y_axis_format: this.form_data.y_axis_format || null,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          colorpickers: this.form_data.colorpickers || [],
          area_chart: this.form_data.area_chart,
          stack_area_chart: this.form_data.stack_area_chart,
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          style_tooltips: this.form_data.style_tooltips || 'item',
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };

        if (visualType == 'dual_line') {
          form_data = {
            ...form_data,
            viz_type: visualType || 'dual_line',
            metric:
              this.form_data.metric != undefined && this.form_data.metric.length > 0 ? this.form_data.metric : null,
            metric_2: this.form_data.metric_2 || null,
            y_axis_2_format: this.form_data.y_axis_2_format || ',',
          };
        } else {
          form_data = {
            ...form_data,
            viz_type: visualType || 'line',
            metrics:
              this.form_data.metrics != undefined && this.form_data.metrics.length > 0
                ? typeof this.form_data.metrics[0] == 'string'
                  ? this.form_data.metrics
                  : this.form_data.metrics
                : null,
            groupby: this.form_data.groupby || [],
            timeseries_limit_metric:
              this.form_data.timeseries_limit_metric != 'null' ? this.form_data.timeseries_limit_metric : null || null,
            limit: Number(this.form_data.limit) || 1000,
            row_limit: Number(this.form_data.row_limit) || 1000,
            order_desc: this.form_data.order_desc,
            show_brush: this.form_data.show_brush || false,
            show_legend: this.form_data.show_legend || false,
            rich_tooltip: this.form_data.rich_tooltip || true,
            show_markers: this.form_data.show_markers || false,
            line_interpolation: this.form_data.line_interpolation || 'basic',
            contribution: this.form_data.contribution || false,
            x_axis_label: this.form_data.x_axis_label || null,
            bottom_margin: this.form_data.bottom_margin || 'auto',
            x_axis_showminmax: this.form_data.x_axis_showminmax || true,
            y_axis_label: this.form_data.y_axis_label || null,
            left_margin: this.form_data.left_margin || 'auto',
            y_axis_showminmax: this.form_data.y_axis_showminmax || true,
            y_log_scale: this.form_data.y_log_scale || false,
            y_axis_bounds: [this.form_data.y_axis_bounds_min || null, this.form_data.y_axis_bounds_max || null],
            y_axis_bounds_min: this.form_data.y_axis_bounds_min,
            y_axis_bounds_max: this.form_data.y_axis_bounds_max,
          };
        }
        break;
      case 'markup':
        let all_columns = [];
        if (this.form_data.groupby_arrs != undefined && this.form_data.groupby_arrs.length > 0) {
          for (let item of this.form_data.groupby_arrs) {
            all_columns.push(item.value);
          }
        }
        form_data = {
          viz_type: visualType || 'markup',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          markup_type: this.form_data.markup_type || 'markdown',
          code: this.form_data.code || null,
          groupby_arrs: this.form_data.groupby_arrs || [],
          row_limit: 1,
          groupby: [],
          metrics: [],
          all_columns: all_columns,
          records: this.records != undefined && this.records.length > 0 ? this.records : this.form_data.records || [],
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          since: since || null,
          until: until || null,
        };
        if (this.form_data.markup_type == 'html')
          form_data = {
            ...form_data,
            js: this.form_data.js,
            css: this.form_data.css,
          };
        break;
      case 'bubble':
        form_data = {
          viz_type: visualType || 'buble',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          series: this.form_data.series || null,
          entity: this.form_data.entity || null,
          size: this.form_data.size || null,
          limit: Number(this.form_data.limit) || 1000,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          show_legend: this.form_data.show_legend || true,
          max_bubble_size: this.form_data.max_bubble_size || '25',
          x_axis_label: this.form_data.x_axis_label || null,
          left_margin: this.form_data.left_margin || 'auto',
          x: this.form_data.x || null,
          x_axis_format: this.form_data.x_axis_format || ',',
          x_log_scale: this.form_data.x_log_scale || false,
          x_axis_showminmax: this.form_data.x_axis_showminmax || true,
          y_axis_label: this.form_data.y_axis_label || null,
          bottom_margin: this.form_data.bottom_margin || 'auto',
          y: this.form_data.y || null,
          y_axis_format: this.form_data.y_axis_format || ',',
          y_log_scale: this.form_data.y_log_scale || false,
          y_axis_showminmax: this.form_data.y_axis_showminmax || true,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;
      case 'filter_box':
        form_data = {
          viz_type: visualType || 'filter_box',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          groupby: this.form_data.groupby || [],
          metric: this.form_data.metric != undefined && this.form_data.metric.length > 0 ? this.form_data.metric : null,
          date_filter: this.form_data.date_filter || false,
          instant_filtering: this.form_data.instant_filtering,
          alphabet_filter: this.form_data.alphabet_filter || false,
          filter_control_alphabetic: this.form_data.filter_control_alphabetic || null,
          filter_checkbox: this.form_data.filter_checkbox || false,
          filter_control_checkbox: this.form_data.filter_control_checkbox || null,
          filter_checkbox_columns: this.form_data.groupby != undefined ? this.form_data.groupby.map((s) => [s, s]) : [],
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          filter_alignment_horizontal: this.form_data.filter_alignment_horizontal || false,
          initial_date_filter: this.form_data.initial_date_filter || null,
        };
        break;
      case 'predictive':
        form_data = {
          viz_type: 'scatter',
          viz_type2: visualType || 'predictive',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          pred_line: this.form_data.pred_line || null,
          pred_upper: this.form_data.pred_upper || null,
          pred_lower: this.form_data.pred_lower || null,
          pred_actual: this.form_data.pred_actual || null,
          x_axis_label: this.form_data.x_axis_label || null,
          bottom_margin: this.form_data.bottom_margin || 'auto',
          x_axis_showminmax: this.form_data.x_axis_showminmax || true,
          x_axis_format: this.form_data.x_axis_format || null,
          y_axis_label: this.form_data.y_axis_label || null,
          left_margin: this.form_data.left_margin || 'auto',
          y_axis_showminmax: this.form_data.y_axis_showminmax || true,
          y_log_scale: this.form_data.y_log_scale || false,
          y_axis_format: this.form_data.y_axis_format || null,
          y_axis_bounds: [this.form_data.y_axis_bounds_min || null, this.form_data.y_axis_bounds_max || null],
          y_axis_bounds_min: this.form_data.y_axis_bounds_min,
          y_axis_bounds_max: this.form_data.y_axis_bounds_max,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;
      case 'scatter':
        form_data = {
          datasource: this.form_data.datasource,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          viz_type: visualType || 'scatter',
          metric: this.form_data.metrics || null,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          pred_line: this.form_data.pred_line || null,
          pred_upper: this.form_data.pred_upper || null,
          pred_lower: this.form_data.pred_lower || null,
          pred_actual: this.form_data.pred_actual || null,
          x_axis_label: this.form_data.x_axis_label || null,
          left_margin: this.form_data.left_margin || 'auto',
          x: this.form_data.x || null,
          x_axis_format: this.form_data.x_axis_format || ',',
          x_log_scale: this.form_data.x_log_scale || false,
          x_bounds: this.form_data.y_bounds || true,
          y_axis_label: this.form_data.y_axis_label || null,
          bottom_margin: this.form_data.bottom_margin || 'auto',
          y: this.form_data.y || null,
          y_axis_format: this.form_data.y_axis_format || ',',
          y_log_scale: this.form_data.y_log_scale || false,
          y_bounds: this.form_data.y_bounds || true,
          x_axis_showminmax: this.form_data.x_axis_showminmax || true,
          y_axis_showminmax: this.form_data.y_axis_showminmax || true,
          y_axis_bounds: [this.form_data.y_axis_bounds_min || null, this.form_data.y_axis_bounds_max || null],
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: this.form_data.since || null,
          until: this.form_data.until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          datasource_name: this.form_data.datasource_name,
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
        };
        break;
      case 'treemap':
        form_data = {
          viz_type: visualType || 'treemap',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          groupby: this.form_data.groupby || [],
          metrics:
            this.form_data.metrics != undefined && this.form_data.metrics.length > 0
              ? typeof this.form_data.metrics[0] == 'string'
                ? [this.form_data.metrics[0]]
                : this.form_data.metrics[0]
              : null,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          treemap_ratio: Number(this.form_data.treemap_ratio) || 1,
          number_format: this.form_data.number_format || '.3s',
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
        };
        break;
      case 'sunburst':
        form_data = {
          viz_type: 'sunburst',
          viz_type2: visualType || 'sunburst',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          groupby: this.form_data.groupby || [],
          metrics:
            this.form_data.metrics != undefined && this.form_data.metrics.length > 0 ? this.form_data.metrics : null,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          treemap_ratio: Number(this.form_data.treemap_ratio) || 1,
          number_format: this.form_data.number_format || '.3s',
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          hide_label: this.form_data.hide_label || false,
          labels_outside: this.form_data.labels_outside || false,
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
        };
        break;
      case 'directed_force':
        form_data = {
          viz_type: visualType || 'directed_force',
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          groupby: this.form_data.groupby || [],
          group: this.form_data.group || undefined,
          metric: this.form_data.metric != undefined && this.form_data.metric.length > 0 ? this.form_data.metric : null,
          show_label: this.form_data.show_label,
          format_number_id: this.form_data.format_number_id || false,
          number_format: this.form_data.number_format || ',',
          show_legend: this.form_data.show_legend || false,
          show_row_limit: this.form_data.show_row_limit || false,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          row_limit: Number(this.form_data.row_limit) || 100,
          link_length: this.form_data.link_length || null,
          charge: this.form_data.charge || null,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          colorpickers: this.form_data.colorpickers || [],
          colorpickers2: this.form_data.colorpickers2 || [],
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
        };
        break;
      case 'heatmap':
        form_data = {
          viz_type: 'heatmap',
          metrics: this.form_data.metrics || [],
          heat_map: {
            metric_heat_map: this.form_data.heat_map.metric_heat_map || null,
            x_heat_map: this.form_data.heat_map.x_heat_map || null,
            y_heat_map: this.form_data.heat_map.y_heat_map || null,
            sort_asc_x: this.form_data.heat_map.sort_asc_x && true,
            sort_asc_y: this.form_data.heat_map.sort_asc_y && true,
            limit_x: parseInt(this.form_data.heat_map.limit_x, 10) || 10,
            limit_y: parseInt(this.form_data.heat_map.limit_y, 10) || 10,
          },
          all_columns: [],
          hide_title: this.form_data.hide_title,
          show_label: this.form_data.show_label || false,
          hide_background: this.form_data.hide_background,
          show_label_sort: this.form_data.show_label_sort,
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_width: this.form_data.legend_width || 400,
          groupby: this.form_data.groupby || [],
          row_limit: Number(this.form_data.row_limit) || 100,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          show_legend: this.form_data.show_legend || false,
          order_desc: this.form_data.order_desc || false,
          format_number_tooltips: this.form_data.format_number_tooltips || ',',
          bottom_margin: this.form_data.bottom_margin || 'auto',
          x_axis_label: this.form_data.x_axis_label,
          y_axis_label: this.form_data.y_axis_label,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filters: this.form_data.filters || [],
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          colorpickers: this.form_data.colorpickers || [],
          number_format: this.form_data.number_format || ',',
          format_number_id: this.form_data.format_number_id || false,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          style_tooltips: this.form_data.style_tooltips || 'item',
          initial_date_filter: this.form_data.initial_date_filter || null,
          notifications: this.form_data.notifications || [],
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          is_axis_reverse: this.form_data.is_axis_reverse || false,
          left_margin: this.form_data.left_margin || 'auto',
          x_as_date: this.form_data.x_as_date || false,
        };
        break;
      case 'box_plot':
        form_data = {
          viz_type: visualType,
          viz_type2: visualType || 'box_plot',
          groupby: this.form_data.groupby || [],
          columns: this.form_data.columns || [],
          metrics:
            this.form_data.metrics != undefined && this.form_data.metrics.length > 0
              ? typeof this.form_data.metrics[0] == 'string'
                ? this.form_data.metrics
                : this.form_data.metrics
              : null,
          order_desc: this.form_data.order_desc,
          limit: Number(this.form_data.limit) || 1000,
          row_limit: Number(this.form_data.row_limit) || 1000,
          color_scheme: this.form_data.color_scheme || 'palette1',
          random_color: this.form_data.random_color || false,
          colorpickers: this.form_data.colorpickers || [],
          choose_pallete: this.form_data.choose_pallete || 'default_pallete',
          show_brush: this.form_data.show_brush || false,
          y_axis_bounds: [this.form_data.y_axis_bounds_min || null, this.form_data.y_axis_bounds_max || null],
          y_axis_bounds_min: this.form_data.y_axis_bounds_min,
          y_axis_bounds_max: this.form_data.y_axis_bounds_max,
          format_number_id: this.form_data.format_number_id || false,
          y_axis_format: this.form_data.y_axis_format || null,
          format_number_tooltips: this.form_data.format_number_tooltips || ',',
          bottom_margin: this.form_data.bottom_margin || 'auto',
          left_margin: this.form_data.left_margin || 'auto',
          x_axis_label: this.form_data.x_axis_label || null,
          y_axis_label: this.form_data.y_axis_label || null,
          show_legend: this.form_data.show_legend || false,
          legend_orient: this.form_data.legend_orient || 'horizontal',
          legend_position: this.form_data.legend_position || 'top',
          legend_type: this.form_data.legend_type || 'scroll',
          legend_width: this.form_data.legend_width || 400,
          chart_on_click: this.form_data.chart_on_click,
          link_to: this.form_data.link_to || null,
          initial_chart_blank: this.form_data.initial_chart_blank || false,
          is_hide_togle_filter: this.form_data.is_hide_togle_filter || false,
          hide_date_picker: this.form_data.hide_date_picker || false,
          hide_title: this.form_data.hide_title,
          hide_background: this.form_data.hide_background,
          granularity_sqla: this.form_data.granularity_sqla || null,
          time_grain_sqla: this.form_data.time_grain_sqla || null,
          since: since || null,
          until: until || null,
          filter_date: this.form_data.filter_date || null,
          filter_date_type: this.form_data.filter_date_type || null,
          initial_date_filter: this.form_data.initial_date_filter || null,
          filters: this.form_data.filters || [],
        };
        break;
    }
    let sliceID = 'pq_chart_id_' + Math.floor(Math.random() * 100) + 1;
    if (!this.slice || this.slice.slice_id == undefined) {
      // params = this.explorJsonState;
      params = localStorage.getItem('exploreJson') ? JSON.parse(localStorage.getItem('exploreJson')) : [];
      if (params.form_data == undefined) {
        this.isLoadingContent = false;
        this.errors = true;
        this.errorMessage = this.messages.CHART.MSG_DE;
        this._apicall.openModal(this.messages.CHART.W, this.messages.CHART.MSG_DE);
        this.changeDetector.detectChanges();
        return false;
      }
      datasource = params.form_data.datasource;
      if (visualType == 'table') {
        datasource = params.form_data.datasource.split('__')[0];
      }
      datasource_name = params.form_data.datasource_name;
      form_data = {
        ...form_data,
        datasource: datasource,
        datasource_name: datasource_name,
      };

      if (visualType == 'table') {
        if ((this.form_data.groupby == undefined || this.form_data.groupby.length == 0) && this.columns.length > 0) {
          form_data = {
            ...form_data,
            all_columns: this.form_data.all_columns !== undefined ? this.form_data.all_columns : this.columns,
          };
        }
      }
    } else {
      datasource = this.slice.form_data.datasource;
      if (visualType == 'table') {
        datasource = this.slice.form_data.datasource.split('__')[0];
      }
      datasource_name = this.slice.form_data.datasource_name;
      form_data = {
        ...form_data,
        datasource: this.slice.form_data.datasource,
        datasource_name: this.slice.form_data.datasource_name,
        slice_id: this.slice.slice_id,
      };

      if (visualType == 'table') {
        if ((this.form_data.groupby == undefined || this.form_data.groupby.length == 0) && this.columns.length > 0) {
          form_data = {
            ...form_data,
            all_columns: this.form_data.all_columns !== undefined ? this.form_data.all_columns : this.columns,
          };
        }
      }

      sliceID = this.slice.slice_id;
    }

    this.form_data = form_data;
    this.submit_form_data.push(form_data);
    // this.store.dispatch(SetRunQuery({ data: this.submit_form_data }));
    localStorage.setItem('runQuery', JSON.stringify(this.submit_form_data));
    let param = { form_data: JSON.stringify(form_data) };
    let vizType = this.form_data.viz_type;
    if (this.form_data.viz_type2 != undefined) vizType = this.form_data.viz_type2;
    await this.validateForm(vizType);
    if (this.form_data.viz_type == undefined) {
      this.isLoadingContent = false;
      this.changeDetector.detectChanges();
      return false;
    }
    if (this.validate_messages.length === 0) {
      this.removeComp();
      var exploreJsonUrl = `api/chart/explore_json/`;
      let exploreJson = await this.loadChartData(exploreJsonUrl, param);
      this.data_exploreJson = exploreJson;
      this.data_charts = await this.removeDuplicateObject(exploreJson.data);
      this.data_charts2 = await this.removeDuplicateObject(exploreJson.data, 'df');
      if (typeof exploreJson == 'string' || exploreJson == undefined) {
        this.isLoadingContent = false;
        this.errors = true;
        this.checkHasError = true;
        return false;
      }
      let explore;
      let exploreUrl;
      let slice_id = exploreJson.form_data.slice_id;
      if (slice_id) {
        exploreUrl = 'api/chart/explore/?form_data=%7B%22slice_id%22%3A' + slice_id + '%7D';
        let exploreResult = await this._apicall.loadPostData(exploreUrl, {});
        explore = exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
        // this.store.dispatch(PostDetailChartExporeFormDataChart({ param: explore }));
      } else {
        const [ds, dsType] = exploreJson.form_data.datasource.split('__');
        let url = `api/chart/explore/`;
        exploreUrl = `${url}${dsType}/${ds}`;
        let exploreResult = await this._apicall.loadGetData(exploreUrl);
        explore = exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
        // this.store.dispatch(PostDetailChartExporeFormDataChart({ param: explore }));
      }

      explore.form_data = exploreJson.form_data;

      let config = await this.getConfigChart(exploreJson);
      if (exploreJson.form_data.viz_type == 'table') {
        this.columns = exploreJson.data.columns;
        this.records = await reformatDataTable(exploreJson.data.columns, exploreJson.data.records);
      }

      this.palleteDefault =
        exploreJson.form_data.color_scheme != undefined && exploreJson.form_data.color_scheme != null
          ? exploreJson.form_data.color_scheme
          : 'palette1';
      this.chooseColor(this.palleteDefault, Number(this.palleteDefault.toString().replace('palette', '')) - 1);
      this.urlChart = exploreJsonUrl;
      this.store.dispatch(PostDetailChartExporeFormDataChart({ param: explore }));
      this.addCompChart(
        vizType,
        sliceID,
        this.datasourceTitle,
        exploreJsonUrl,
        config[0],
        this.palleteDefault,
        config[1],
        exploreJson,
        explore,
        this.index,
        this.palleteDefault,
        this.columns,
        this.records
      );
      if (this.checkHasError) {
        this.addCompChart(
          vizType,
          sliceID,
          this.datasourceTitle,
          exploreJsonUrl,
          config[0],
          this.palleteDefault,
          config[1],
          exploreJson,
          explore,
          this.index,
          this.palleteDefault,
          this.columns,
          this.records
        );
        this.checkHasError = false;
      }
      this.remappingColorpicker('ts', exploreJson);
      this.notificationService.setNotif();
      this.changeDetector.detectChanges();
    } else {
      this.isLoadingContent = false;
      this.alertDialog();
      this.changeDetector.detectChanges();
    }
  }

  eventDriver(opt, data) {
    var url = '';
    var params = {};
    switch (opt) {
      case 'dup':
        url = '';
        break;
      case 'del':
        url = 'api/chart/delete';
        params = {
          id: data.id,
        };
        break;
    }
    this._apicall.post(url, params).subscribe((v) => {
      this.modalService.dismissAll();
      $('button#btn-danger').trigger('click');
      $('a#reload__chart').trigger('click');
    });
  }

  // begin modal
  openModalTemplateCustom(content, data = null) {
    if (!this.stateloadDataset && content != 'duplicateCharts') return;

    this.IsmodelShow = true;
    this.row = {
      slice_chart_name: this.datasourceTitle,
    };
    if (content == 'duplicateCharts') {
      this.row = {
        slice_chart_name: data.hasOwnProperty('name') ? data.name : 'duplicate',
      };
    }
    switch (content) {
      case 'formulaModal':
        this.resetFormula();
        this.isAction = 'a';
        this.modalReference = this.modalService.open(ModalQueryComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.isAction = this.isAction;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.chartLinks = this.chartLinks;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.applyFormula = this.applyFormula;
        this.modalReference.componentInstance.formulaValue = this.formulaValue;

        break;
      case 'formulaModalNotifications':
        this.modalReference = this.modalService.open(ModalFormulaNotificationsComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.chartLinks = this.chartLinks;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.notifID = this.notifID;
        this.modalReference.componentInstance.notifFormulaValue = this.notifFormulaValue;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.loadChartData2 = this.loadChartData2;
        break;

      case 'modalNotifications':
        this.modalReference = this.modalService.open(ModalNotificationsComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.chartLinks = this.chartLinks;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.notifID = this.notifID;
        this.modalReference.componentInstance.notifFormulaValue = this.notifFormulaValue;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.loadChartData2 = this.loadChartData2;
        break;
      case 'modalComparison':
        if (this.form_data.base_columns == undefined || this.form_data.base_columns.length == 0) {
          for (let i = 0; i < 1; i++) {
            let duplicateArr = [...this.form_data.base_columns];
            duplicateArr.push({
              key: Number(i) + 1,
              id: '',
              label: '',
              column: '',
              metric: '',
              filter_date_type: '',
              static_value: '',
              filters: [],
            });
            this.form_data = { ...this.form_data, base_columns: duplicateArr };
            this.setPickerComparison(this.form_data.base_columns[i].static_value, i);
          }
        }
        if (this.form_data.comparison == undefined || this.form_data.comparison.length == 0) {
          for (let i = 0; i < 1; i++) {
            let duplicateArr = [...this.form_data.comparison];
            duplicateArr.push({
              key: Number(i + 1),
              id: '',
              label: '',
              formula: '',
            });
            this.form_data = { ...this.form_data, comparison: duplicateArr };
          }
        }

        this.modalReference = this.modalService.open(ModalComparisonComponent, {
          size: 'xl',
          centered: true,
        });
        this.modalReference.componentInstance.chartLinks = this.chartLinks;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.runQuery = this.runQuery;
        this.modalReference.componentInstance.setPickerComparison = this.setPickerComparison;
        break;
      case 'modalAddValue':
        this.modalReference = this.modalService.open(ModalAddValueComponent, {
          size: 'md',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.chartLinks = this.chartLinks;
        break;
      case 'modalCustomCondition':
        if (this.form_data.custom_condition_arr == undefined || this.form_data.custom_condition_arr.length == 0) {
          for (let i = 1; i < 3; i++) {
            this.form_data.custom_condition_arr.push({
              label: 'Condition ' + i,
              mode: this.form_data.gauge_label_type || 'value',
              size_from: 0,
              size_to: '',
              status: '',
              colorpicker: '#808080',
            });
          }
        }

        this.modalReference = this.modalService.open(ModalCustomConditionComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.result.then(
          () => {
            this.saveAndRunQuery();
            this.modalService.dismissAll();
          },
          (reason: any) => {
            this.closeResult = `Dismissed ${getDismissReason(reason)}`;
          }
        );
        break;
      case 'modalColorPicker':
        this.modalReference = this.modalService.open(ModalColorPickerComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.messages = this.messages;
        this.modalReference.componentInstance.data_charts = this.data_charts;
        this.modalReference.result.then(
          () => {
            this.saveAndRunQuery();
            this.modalService.dismissAll();
          },
          (reason: any) => {
            this.closeResult = `Dismissed ${getDismissReason(reason)}`;
          }
        );
        break;
      case 'modalEditMetricLegendOptions':
        this.modalReference = this.modalService.open(ModalMetricLegendComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.metric = this.metric;
        this.modalReference.componentInstance.showVerboseName = this.showVerboseName;
        this.modalReference.componentInstance.slice = this.slice;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.loadChartbyId = this.loadChartbyId;
        this.modalReference.componentInstance.loadDatasetTo = this.loadDatasetTo;
        this.modalReference.componentInstance.chartLinks = this.chartLinks;

        break;
      case 'modalCustomColumnFormat':
        this.modalReference = this.modalService.open(ModalCustomColumnFormatComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.columnFormatList = this.columnFormatList;
        this.modalReference.componentInstance.table_selected_column = this.table_selected_column;
        this.modalReference.componentInstance.list_table_timestamp_format = this.list_table_timestamp_format;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.list_y_axis_format = this.list_y_axis_format;
        this.modalReference.componentInstance.runQuery = this.runQuery;
        this.modalReference.componentInstance.data_exploreJson = this.data_exploreJson;
        this.modalReference.componentInstance.chartLinks = this.chartLinks;
        this.modalReference.componentInstance.format_number_id = this.format_number_id;

        break;
      case 'modalSettingWidthColumn':
        this.modalReference = this.modalService.open(ModalColumnWidthSettingComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.runQuery = this.runQuery;
        break;
      case 'duplicateCharts':
        this.modalReference = this.modalService.open(ModalDuplicateChartComponent, {
          size: 'md',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.hasFlaging = this.hasFlaging;
        this.modalReference.componentInstance.slice = this.slice;
        this.modalReference.componentInstance.row = this.row;
        this.modalReference.result.then(
          (res: any) => {
            this.duplicateChart([res], data);
            this.modalService.dismissAll();
          },
          (reason: any) => {
            this.closeResult = `Dismissed ${getDismissReason(reason)}`;
          }
        );

        break;

      case 'codeModal':
        this.modalReference = this.modalService.open(ModalMarkupCodeComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.result.then(
          (visualType: any) => {
            this.runQuery(visualType);
          },
          (reason: any) => {
            this.closeResult = `Dismissed ${getDismissReason(reason)}`;
          }
        );

        break;
      case 'jsModal':
        this.modalReference = this.modalService.open(ModalMarkupJSComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;

        break;
      case 'cssModal':
        this.modalReference = this.modalService.open(ModalMarkupCSSComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.result.then(
          (visualType: any) => {
            this.runQuery(visualType);
          },
          (reason: any) => {
            this.closeResult = `Dismissed ${getDismissReason(reason)}`;
          }
        );
        break;
      case 'modalColumnStyler':
        this.resetFormula();
        this.isAction = 'a';
        this.modalReference = this.modalService.open(ModalCustomColorComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.column_styles = this.column_styles;
        this.modalReference.componentInstance.columnStyles = this.columnStyles;
        this.modalReference.componentInstance.columns = this.columns;

        break;
    }
  }

  onOptionsSelected(viz_type: string) {
    if (viz_type === 'pivot_table') {
      this.form_data.pandas_aggfunc = this.form_data.pandas_aggfunc || 'sum';
      this.form_data.number_format = this.form_data.number_format || ',';
    }
  }

  //colorpicker
  async removeDuplicateObject(array, opts?) {
    const result = [];
    const map = new Map();
    if (array != undefined && array.length > 0) {
      for (const item of array) {
        if (['pie'].includes(this.form_data.viz_type) || ['pie'].includes(this.visualType)) {
          // pie
          if (!map.has(item.x)) {
            map.set(item.x, true);
            result.push({
              x: item.x,
              y: item.y,
            });
          }
        }
        if (
          ['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'bubble'].includes(this.form_data.viz_type) ||
          ['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'bubble'].includes(this.visualType)
        ) {
          if (!map.has(item.key)) {
            map.set(item.key, true);
            result.push({
              key: item.key,
              values: item.values,
            });
          }
        }
        if (['directed_force'].includes(this.form_data.viz_type) || ['directed_force'].includes(this.visualType)) {
          let obj = {
            source: item.source,
            target: item.target,
          };
          if (item.group != undefined) obj = Object.assign({}, obj, { group: item.group });
          if (opts != undefined) {
            if (item.target != undefined && !map.has(item.target)) {
              map.set(item.target, true);
              result.push(obj);
            }
          } else {
            if (item.source != undefined && !map.has(item.source)) {
              map.set(item.source, true);
              result.push(obj);
            }
          }
        }
        if (['treemap'].includes(this.form_data.viz_type) || ['treemap'].includes(this.visualType)) {
          if (!map.has(item.name)) {
            map.set(item.name, true);
            result.push({
              name: item.name,
              children: item.children,
            });
          }
        }
        if (['big_number_total'].includes(this.form_data.viz_type) || ['big_number_total'].includes(this.visualType)) {
          if (!map.has(item.subheader)) {
            map.set(item.subheader, true);
            result.push({
              subheader: item.subheader,
              data: item.data,
            });
          }
        }
      }
    }
    return result;
  }

  async loadChartData2(url, param) {
    this.messages = await this.jsonService.retMessage();
    let errorMessage = this.messages.CHART.MSG_ERR;
    let rest = await this._apicall.postApi(url, param);
    let result;
    if (rest) {
      result = rest.result.response ? rest.result.response : rest.result;
    } else {
      if (rest.result.status != 500) {
        this.errorMessage = errorMessage;
        return this.errorMessage;
      } else {
        if (rest.result.status == 0) {
          this.errorMessage = this.messages.CHART.ERR_RTO;
          return this.errorMessage;
        }
        if (rest.result.hasOwnProperty('error')) {
          this.errorMessage = await rest.result.error.message;
          if ((this.errorMessage = this.messages.CHART.MSG_F)) {
            this.errorMessage = errorMessage;
            this._apicall.openModal(this.messages.CHART.F, this.errorMessage);
          }
          if ((rest.result.statusText = 'Internal Server Error' && this.errorMessage == undefined)) {
            this.errorMessage = errorMessage;
          }
          return this.errorMessage;
        }
      }
    }
    return result;
  }

  async showAlert(opt) {
    this.isFormValidate = false;
    this.validate_messages = [];
    let msg = this.messages.CHART.MSG_UPS;
    switch (opt) {
      case 'custom_color':
        msg = this.messages.CHART.MSG_CC;
        break;
      case 'edit_metric':
        msg = this.messages.CHART.MSG_EM;
        break;
    }
    this.validate_messages = [msg];
    this.alertDialog();
    this.changeDetector.detectChanges();
  }

  async remappingColorpicker(opt = '', exploreJson) {
    if (opt != 'ts') {
      // fetch data dahulu
      if (typeof exploreJson == 'string' || exploreJson == undefined) return;
      this.data_charts = exploreJson.data;
      this.data_charts = await this.removeDuplicateObject(exploreJson.data);
      this.data_charts2 = await this.removeDuplicateObject(exploreJson.data, 'df');
    }

    // if has existing or editable
    if (this.form_data.colorpickers != undefined && this.form_data.colorpickers.length > 0) {
      let objArr = [],
        objArr2 = [];
      let colorPick = [];
      if (
        ['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'bubble', 'box_plot'].includes(this.form_data.viz_type) ||
        ['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'bubble', 'box_plot'].includes(this.visualType)
      ) {
        for (var i = 0; i < this.form_data.colorpickers.length; i++) {
          if (exploreJson.data[i] && this.form_data.colorpickers[i].entity !== exploreJson.data[i].key) {
            let staticObj = [...this.form_data.colorpickers];
            colorPick.push({
              ...staticObj[i],
              entity: exploreJson.data[i].key,
            });
            this.form_data = { ...this.form_data, colorpickers: colorPick };
          }
        }

        for (let i = 0; i < this.data_charts.length; i++) {
          let arr = [];
          for (let j = 0; j < this.form_data.colorpickers.length; j++) {
            let entity =
              !['line', 'dual_line'].includes(this.form_data.viz_type) ||
              !['line', 'dual_line'].includes(this.visualType)
                ? this.form_data.colorpickers[j].entity
                : this.form_data.colorpickers[j].entity[0];
            let key =
              !['line', 'dual_line'].includes(this.form_data.viz_type) ||
              !['line', 'dual_line'].includes(this.visualType)
                ? this.data_charts[i].key
                : this.data_charts[i].key[0];
            if (entity == key) {
              objArr.push({
                entity: this.form_data.colorpickers[j].entity,
                colorpicker: this.form_data.colorpickers[j].colorpicker,
              });
              arr = objArr;
            }
          }
          if (arr.length == 0) {
            objArr.push({
              entity: this.data_charts[i].key,
              colorpicker: '#808080',
            });
          }
        }
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
      if (['directed_force'].includes(this.form_data.viz_type) || ['directed_force'].includes(this.visualType)) {
        if (this.data_charts != undefined && this.data_charts.length > 0) {
          for (let i = 0; i < this.data_charts.length; i++) {
            let arr = [];
            for (let j = 0; j < this.form_data.colorpickers.length; j++) {
              if (this.form_data.colorpickers[j].entity == this.data_charts[i].source) {
                objArr.push({
                  entity: this.form_data.colorpickers[j].entity,
                  colorpicker: this.form_data.colorpickers[j].colorpicker,
                });
                arr = objArr;
              }
            }
            if (arr.length == 0) {
              objArr.push({
                entity: this.data_charts[i].source,
                colorpicker: '#808080',
              });
            }
          }
          for (let i = 0; i < this.data_charts2.length; i++) {
            let arr2 = [];
            if (this.form_data.colorpickers2 != undefined && this.form_data.colorpickers2.length > 0) {
              for (let j = 0; j < this.form_data.colorpickers2.length; j++) {
                if (this.form_data.colorpickers2[j].entity == this.data_charts2[i].target) {
                  objArr2.push({
                    entity: this.form_data.colorpickers2[j].entity,
                    colorpicker: this.form_data.colorpickers2[j].colorpicker,
                  });
                  arr2 = objArr2;
                }
              }
            }
            if (arr2.length == 0) {
              objArr2.push({
                entity: this.data_charts2[i].target,
                colorpicker: '#808080',
              });
            }
          }
          this.form_data = { ...this.form_data, colorpickers: objArr, colorpickers2: objArr2 };
        }
      }
      if (['treemap'].includes(this.form_data.viz_type) || ['treemap'].includes(this.visualType)) {
        for (let i = 0; i < this.form_data.groupby.length; i++) {
          let arr = [];
          for (let j = 0; j < this.form_data.colorpickers.length; j++) {
            if (this.form_data.colorpickers[j].entity == this.form_data.groupby[i]) {
              objArr.push({
                entity: this.form_data.colorpickers[j].entity,
                colorpicker: this.form_data.colorpickers[j].colorpicker,
              });
              arr = objArr;
            }
          }
          if (arr.length == 0) {
            objArr.push({
              entity: this.form_data.groupby[i],
              colorpicker: '#808080',
            });
          }
        }
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
      if (['pie'].includes(this.form_data.viz_type) || ['pie'].includes(this.visualType)) {
        for (var i = 0; i < this.form_data.colorpickers.length; i++) {
          if (exploreJson.data[i] && this.form_data.colorpickers[i].entity !== exploreJson.data[i].x) {
            this.form_data.colorpickers[i].entity = exploreJson.data[i].x;
          }
        }

        for (let i = 0; i < this.data_charts.length; i++) {
          let arr = [];
          for (let j = 0; j < this.form_data.colorpickers.length; j++) {
            if (this.form_data.colorpickers[j].entity == this.data_charts[i].x) {
              objArr.push({
                entity: this.form_data.colorpickers[j].entity,
                colorpicker: this.form_data.colorpickers[j].colorpicker,
              });
              arr = objArr;
            }
          }
          if (arr.length == 0) {
            objArr.push({
              entity: this.data_charts[i].x,
              colorpicker: '#808080',
            });
          }
        }
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
      if (['big_number_total'].includes(this.form_data.viz_type) || ['big_number_total'].includes(this.visualType)) {
        objArr.push(
          {
            entity: 'Value',
            colorpicker:
              this.form_data.colorpickers[0].colorpicker != undefined ||
              this.form_data.colorpickers[0].colorpicker != ''
                ? this.form_data.colorpickers[0].colorpicker
                : '#808080',
          },
          {
            entity: 'Label Name',
            colorpicker:
              this.form_data.colorpickers[1] != undefined &&
              (this.form_data.colorpickers[1].colorpicker != undefined ||
                this.form_data.colorpickers[1].colorpicker != '')
                ? this.form_data.colorpickers[1].colorpicker
                : '#808080',
          }
        );
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
      if (['histogram'].includes(this.form_data.viz_type) || ['histogram'].includes(this.visualType)) {
        objArr.push(
          {
            entity: 'Value',
            colorpicker:
              this.form_data.colorpickers[0].colorpicker != undefined ||
              this.form_data.colorpickers[0].colorpicker != ''
                ? this.form_data.colorpickers[0].colorpicker
                : '#117A8B',
          },
          {
            entity: 'Label Name',
            colorpicker:
              this.form_data.colorpickers[1] != undefined &&
              (this.form_data.colorpickers[1].colorpicker != undefined ||
                this.form_data.colorpickers[1].colorpicker != '')
                ? this.form_data.colorpickers[1].colorpicker
                : '#117A8B',
          }
        );
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
      if (['osmmap'].includes(this.form_data.viz_type) || ['histogram'].includes(this.visualType)) {
        objArr.push(
          {
            entity: 'Value',
            colorpicker:
              this.form_data.colorpickers[0].colorpicker != undefined ||
              this.form_data.colorpickers[0].colorpicker != ''
                ? this.form_data.colorpickers[0].colorpicker
                : '#117A8B',
          },
          {
            entity: 'Label Name',
            colorpicker:
              this.form_data.colorpickers[1] != undefined &&
              (this.form_data.colorpickers[1].colorpicker != undefined ||
                this.form_data.colorpickers[1].colorpicker != '')
                ? this.form_data.colorpickers[1].colorpicker
                : '#117A8B',
          }
        );
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
      if (['country_map'].includes(this.form_data.viz_type) || ['country_map'].includes(this.visualType)) {
        for (let j = 0; j < this.form_data.colorpickers.length; j++) {
          objArr.push({
            entity: 'Color In Range ' + Number(j),
            colorpicker: this.form_data.colorpickers[j].colorpicker,
          });
        }
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
      if (['gauge'].includes(this.form_data.viz_type) || ['gauge'].includes(this.visualType)) {
        for (let j = 0; j < this.form_data.colorpickers.length; j++) {
          objArr.push({
            entity: 'Condition ' + Number(j + 1),
            colorpicker: this.form_data.colorpickers[j].colorpicker,
          });
        }
        this.form_data = { ...this.form_data, colorpickers: objArr };
      }
    } else {
      // initial
      this.form_data.colorpickers = [];
      this.form_data.colorpickers2 = [];
      if (
        ['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'bubble', 'box_plot'].includes(this.form_data.viz_type) ||
        ['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'bubble', 'box_plot'].includes(this.visualType)
      ) {
        for (let i = 0; i < this.data_charts.length; i++) {
          this.form_data.colorpickers.push({
            entity: this.data_charts[i].key,
            colorpicker: '#808080',
          });
        }
      }
      if (['pie'].includes(this.form_data.viz_type) || ['pie'].includes(this.visualType)) {
        for (let i = 0; i < this.data_charts.length; i++) {
          this.form_data.colorpickers.push({
            entity: this.data_charts[i].x,
            colorpicker: '#808080',
          });
        }
      }
      if (
        (['treemap'].includes(this.form_data.viz_type) || ['treemap'].includes(this.visualType)) &&
        this.form_data.groupby &&
        this.form_data.groupby.length > 0
      ) {
        for (let i = 0; i < this.form_data.groupby.length; i++) {
          this.form_data.colorpickers.push({
            entity: this.form_data.groupby[i],
            colorpicker: '#808080',
          });
        }
      }
      if (
        (['directed_force'].includes(this.form_data.viz_type) || ['directed_force'].includes(this.visualType)) &&
        this.form_data.group != ''
      ) {
        if (this.data_charts != undefined && this.data_charts.length > 0) {
          for (let i = 0; i < this.data_charts.length; i++) {
            this.form_data.colorpickers.push({
              entity: this.data_charts[i].group == undefined ? this.data_charts[i].source : this.data_charts[i].group,
              colorpicker: '#808080',
            });
          }
        }
        if (this.data_charts2 != undefined && this.data_charts2.length > 0) {
          for (let i = 0; i < this.data_charts2.length; i++) {
            this.form_data.colorpickers2.push({
              entity: this.data_charts2[i].target,
              colorpicker: '#808080',
            });
          }
        }
      }
      if (['big_number_total'].includes(this.form_data.viz_type) || ['big_number_total'].includes(this.visualType)) {
        this.form_data.colorpickers.push(
          {
            entity: 'Value',
            colorpicker: '#808080',
          },
          {
            entity: 'Label Name',
            colorpicker: '#808080',
          }
        );
      }
      if (['histogram'].includes(this.form_data.viz_type) || ['histogram'].includes(this.visualType)) {
        this.form_data.colorpickers.push(
          {
            entity: 'Value',
            colorpicker: '#5CC5CD',
          },
          {
            entity: 'Label Name',
            colorpicker: '#808080',
          }
        );
      }
      if (['osmmap'].includes(this.form_data.viz_type) || ['histogram'].includes(this.visualType)) {
        this.form_data.colorpickers.push(
          {
            entity: 'Value',
            colorpicker: '#5CC5CD',
          },
          {
            entity: 'Label Name',
            colorpicker: '#808080',
          }
        );
      }
      if (['country_map'].includes(this.form_data.viz_type) || ['country_map'].includes(this.visualType)) {
        for (let i = 1; i < 4; i++) {
          this.form_data.colorpickers.push({
            entity: 'Color In Range ' + i,
            colorpicker: '#808080',
          });
        }
      }
      if (['gauge'].includes(this.form_data.viz_type) || ['gauge'].includes(this.visualType)) {
        for (let i = 1; i < 3; i++) {
          this.form_data.colorpickers.push({
            entity: 'Condition ' + i,
            colorpicker: '#808080',
          });
        }
      }
    }
  }

  onChangeFilterComparison(opt?, index?, latest_date?) {
    var date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    var f = new Date(y, m, 1);
    var l = new Date(y, m + 1, 0);
    var fdy = new Date(new Date().getFullYear(), 0, 1);
    var ldy = new Date(new Date().getFullYear(), 11, 31);
    if (this.form_data.filter_comparison == null || this.form_data.filter_comparison == undefined)
      this.form_data.filter_comparison = 'date';
    let option = this.form_data.filter_comparison || 'latest_date';
    if (opt != undefined && opt != '') {
      // from latest_date exploreJson not default
      option = opt;
    }
    switch (option) {
      case 'latest_date':
        if (this.form_data.base_columns.length > 0) {
          for (let i = 0; i < this.form_data.base_columns.length; i++) {
            let column_filter = this.form_data.base_columns[i].column;
            let latest_date =
              this.data_exploreJson.latest_date && this.data_exploreJson.latest_date != '0001-01-01T00:00:00Z'
                ? this.data_exploreJson.latest_date
                : date;
            let isUtc = new Date(latest_date);
            if (String(isUtc) != 'Invalid Date') latest_date = moment(latest_date).format('YYYY-MM-DD HH:mm:ss');
            else latest_date = latest_date;
            if (column_filter != null) {
              this.form_data.base_columns[i].filters = [];
              this.form_data.base_columns[i].filters.push({
                col: column_filter,
                op: '<=',
                val: latest_date,
              });
            }
          }
        }
        break;
      case 'month':
        if (this.form_data.base_columns.length > 0) {
          if (index != undefined) {
            if (latest_date == undefined)
              latest_date =
                this.data_exploreJson.latest_date && this.data_exploreJson.latest_date != '0001-01-01T00:00:00Z'
                  ? this.data_exploreJson.latest_date
                  : date;
            let isUtc = new Date(latest_date);
            if (String(isUtc) != 'Invalid Date') {
              (date = new Date(latest_date)), (y = date.getFullYear()), (m = date.getMonth());
              f = new Date(y, m, 1);
              l = new Date(y, m + 1, 0);
            }
            let column_filter = this.form_data.base_columns[index].column;
            this.form_data.base_columns[index].filters = [];
            this.form_data.base_columns[index].filters.push(
              {
                col: column_filter,
                op: '>=',
                val: moment(f).format('YYYY-MM-DD'),
              },
              {
                col: column_filter,
                op: '<=',
                val: moment(l).format('YYYY-MM-DD'),
              }
            );
          } else {
            for (let i = 0; i < this.form_data.base_columns.length; i++) {
              let column_filter = this.form_data.base_columns[i].column;
              this.form_data.base_columns[i].filters = [];
              this.form_data.base_columns[i].filters.push(
                {
                  col: column_filter,
                  op: '>=',
                  val: moment(f).format('YYYY-MM-DD'),
                },
                {
                  col: column_filter,
                  op: '<=',
                  val: moment(l).format('YYYY-MM-DD'),
                }
              );
            }
          }
        }
        break;
      case 'year':
        if (this.form_data.base_columns.length > 0) {
          if (index != undefined) {
            if (latest_date == undefined)
              latest_date =
                this.data_exploreJson.latest_date && this.data_exploreJson.latest_date != '0001-01-01T00:00:00Z'
                  ? this.data_exploreJson.latest_date
                  : date;
            let isUtc = new Date(latest_date);
            if (String(isUtc) != 'Invalid Date') {
              fdy = new Date(new Date(latest_date).getFullYear(), 0, 1);
              ldy = new Date(new Date(latest_date).getFullYear(), 11, 31);
            }
            let column_filter = this.form_data.base_columns[index].column;
            this.form_data.base_columns[index].filters = [];
            this.form_data.base_columns[index].filters.push(
              {
                col: column_filter,
                op: '>=',
                val: moment(fdy).format('YYYY-MM-DD'),
              },
              {
                col: column_filter,
                op: '<=',
                val: moment(ldy).format('YYYY-MM-DD'),
              }
            );
          } else {
            for (let i = 0; i < this.form_data.base_columns.length; i++) {
              let column_filter = this.form_data.base_columns[i].column;
              this.form_data.base_columns[i].filters = [];
              this.form_data.base_columns[i].filters.push(
                {
                  col: column_filter,
                  op: '>=',
                  val: moment(fdy).format('YYYY-MM-DD'),
                },
                {
                  col: column_filter,
                  op: '<=',
                  val: moment(ldy).format('YYYY-MM-DD'),
                }
              );
            }
          }
        }
        break;
      default:
        // date
        if (this.form_data.base_columns.length > 0) {
          if (index != undefined) {
            if (latest_date == undefined)
              latest_date =
                this.data_exploreJson.latest_date && this.data_exploreJson.latest_date != '0001-01-01T00:00:00Z'
                  ? this.data_exploreJson.latest_date
                  : date;
            let isUtc = new Date(latest_date);
            if (String(isUtc) != 'Invalid Date') latest_date = moment(latest_date).format('YYYY-MM-DD');
            let column_filter = this.form_data.base_columns[index].column;
            this.form_data.base_columns[index].filters = [];
            this.form_data.base_columns[index].filters.push(
              {
                col: column_filter,
                op: '>=',
                val: moment(latest_date).format('YYYY-MM-DD'),
              },
              {
                col: column_filter,
                op: '<=',
                val: moment(latest_date, 'YYYY-MM-DD').add(1, 'days'),
              }
            );
          } else {
            for (let i = 0; i < this.form_data.base_columns.length; i++) {
              let column_filter = this.form_data.base_columns[i].column;
              if (column_filter != null) {
                this.form_data.base_columns[i].filters = [];
                this.form_data.base_columns[i].filters.push(
                  {
                    col: column_filter,
                    op: '<',
                    val: moment(date, 'YYYY-MM-DD').add(1, 'days'),
                  },
                  {
                    col: column_filter,
                    op: '>=',
                    val: moment(date).format('YYYY-MM-DD'),
                  }
                );
              }
            }
          }
        }
        break;
    }
  }

  // comparison deleted all function

  //column format deleted all function
  //apply markup
  listFormulaOld: string = '';

  resetFormula() {
    this.formulaValue = '';
  }

  isAction;
  showFormula(item, opt?) {
    this.formulaValue = item.verbose_name;
    this.isAction = opt;
    this.listFormulaOld = this.listFormula;
    if (this.metricsOri.includes(item.metric_name)) return;
    this.modalReference = this.modalService.open(ModalQueryComponent, {
      size: 'lg',
      centered: true,
    });
    this.modalReference.componentInstance.isAction = this.isAction;
    this.modalReference.componentInstance.visualType = this.visualType;
    this.modalReference.componentInstance.chartLinks = this.chartLinks;
    this.modalReference.componentInstance.form_data = this.form_data;
    this.modalReference.componentInstance.applyFormula = this.applyFormula;
    this.modalReference.componentInstance.formulaValue = this.formulaValue;
  }

  async applyMarkup(visualType) {
    await this.runQuery(visualType);
  }

  initColStyles() {
    let result: ITableChartColStyle[] = [];
    for (let i = 0; i < this.column_styles.length; i++) {
      const style = this.column_styles[i];
      for (let j = 0; j < style.criterias.length; j++) {
        const criteria = style.criterias[j];
        result.push({
          col: style.column,
          op: criteria.op,
          values: criteria.values,
          format: criteria.format,
        });
      }
    }
    this.columnStyles = result;
  }

  // END FUNGSIONAl
  public activeColapse: any = {
    datasource: false,
    chartOption: false,
    filter: false,
    time: false,
    visualization: true,
    notification: false,
    query: false,
    chartGridView: false,
    commonGroup: false,
    chartFormatGroup: false,
    chartColorGroup: false,
    chartSortGroup: false,
    chartMarginGroup: false,
    dualAxisGroup: false,
    chartLabelGroup: false,
    chartLagendGroup: false,
    chartFilterGroup: false,
    customDisplayGroup: false,
  };
  collapseOnClick(collapseType: string) {
    this.activeColapse = { ...this.activeColapse, [collapseType]: !this.activeColapse[collapseType] };
  }

  editorOptions = {
    language: 'sql',
    automaticLayout: true,
  };

  applyFormula() {
    // todo logic here for this.formulaValue
    let obj = {
      description: this.listFormula.description,
      expression: this.formulaValue || this.listFormula.expression,
      metric_name: this.formulaValue || this.listFormula.metric_name,
      verbose_name: this.formulaValue || this.listFormula.verbose_name,
      warning_text: this.listFormula.warning_text,
      is_formula: this.listFormula.is_formula,
    };
    if (this.isAction == 'e') {
      if (this.visualType == 'histogram' || this.visualType == 'osmmap') {
        this.chartLinks.datasource.columns.splice(this.chartLinks.datasource.columns.indexOf(this.listFormulaOld), 1);
        this.chartLinks.datasource.columns.push(obj);
        this.chartLinks.datasource.columns = this.chartLinks.datasource.columns.slice(0);
      } else {
        this.chartLinks.datasource.metrics.splice(this.chartLinks.datasource.metrics.indexOf(this.listFormulaOld), 1);
        this.chartLinks.datasource.metrics.push(obj);
        this.chartLinks.datasource.metrics = this.chartLinks.datasource.metrics.slice(0);
      }
      if (this.visualType == 'heatmap') this.form_data.heat_map.metric_heat_map = this.formulaValue;
      else if (this.visualType == 'histogram') this.form_data.column_target = this.formulaValue;
      else if (this.visualType == 'osmmap') this.form_data.column_target = this.formulaValue;
      else if (['big_number_total', 'gauge', 'filter_box', 'directed_force'].includes(this.visualType))
        this.form_data.metric = this.formulaValue;
      else {
        this.form_data.metrics.splice(this.form_data.metrics.indexOf(this.listFormulaOld), 1);
        this.form_data.metrics.push(this.formulaValue);
        this.form_data.metrics = this.form_data.metrics.slice(0);
      }
    } else {
      if (this.visualType == 'histogram' || this.visualType == 'osmmap') {
        this.chartLinks.datasource.columns.push(obj);
        this.chartLinks.datasource.columns = this.chartLinks.datasource.columns.slice(0);
      } else {
        this.chartLinks.datasource.metrics.push(obj);
        this.chartLinks.datasource.metrics = this.chartLinks.datasource.metrics.slice(0);
      }
      if (this.visualType == 'heatmap') {
        if (!this.form_data.heat_map) this.form_data.heat_map = this.heat_map;
        this.form_data.heat_map.metric_heat_map = this.formulaValue;
      } else if (this.visualType == 'histogram') this.form_data.column_target = this.formulaValue;
      else if (this.visualType == 'osmmap') this.form_data.column_target = this.formulaValue;
      else if (['big_number_total', 'gauge', 'filter_box', 'directed_force'].includes(this.visualType))
        this.form_data.metric = this.formulaValue;
      else {
        if (!this.form_data.metrics) this.form_data.metrics = [];
        let data = [...this.form_data.metrics];
        data.push(this.formulaValue);
        this.form_data = {
          ...this.form_data,
          metrics: data,
        };
      }
    }
    this.modalService.dismissAll();
    this.changeDetector.markForCheck();
    this.changeDetector.detectChanges();
  }

  closeFormula = () => {
    this.modalService.dismissAll();
  };

  //column format
  onAddColumnFormat() {
    this.form_data.custom_column_format_arr.push({
      column: '',
      format_type: '',
      format: '',
    });
    this.changeDetector.detectChanges();
  }

  onDelColumnFormat(index) {
    this.form_data.custom_column_format_arr.splice(index, 1);
  }
  async saveAndRunQuery() {
    this.modalService.dismissAll();
    let viz_type = this.form_data.viz_type ? this.form_data.viz_type : this.visualType;
    if (this.visualType == 'histogram') viz_type = 'histogram';
    if (this.visualType == 'osmmap') viz_type = 'histogram';
    await this.runQuery(viz_type);
    this.changeDetector.detectChanges();
  }
  // dialog

  alertDialog = () => {
    this.modalReference = this.modalService.open(DialogAlertComponent, {
      centered: true,
    });
    this.modalReference.componentInstance.isFormValidate = this.isFormValidate;
    this.modalReference.componentInstance.validate_messages = this.validate_messages;
  };

  handleIcon = (row) => {
    let link = '';
    if (row.value === 'country_map') {
      link = `./.${row.image}`;
    } else {
      link = `./${row.image}`;
    }
    return link;
  };
}
