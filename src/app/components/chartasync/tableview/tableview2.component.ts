import {
  Component,
  OnDestroy,
  AfterViewInit,
  HostListener,
  ElementRef,
  Input,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import * as _moment from 'moment';
import { DataTableDirective } from 'angular-datatables';
import { LayoutConfigService, ApiService, LoaderService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import {
  reformat_number,
  get_format_date,
  year_picker_handler,
  month_picker_handler,
  date_picker_handler,
  get_position,
  validate_date,
  convert_metric_to_verbose,
  convert_verbose_to_metric,
  extract_date_filter,
  on_full_screen_id,
} from 'src/app/libs/helpers/utility';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  getUrl,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { AppState } from 'src/app/libs/store/states';
import { Store } from '@ngrx/store';
import { detailChartSelector } from 'src/app/libs/store/selectors/datavisualization.selector';

const moment = _rollupMoment || _moment;
declare var $: any;
declare var d3: any;

interface IKeyValue {
  [key: string]: any;
}

interface IColStyleCriteria {
  op: string;
  values: any[];
  format: IKeyValue;
}

interface ITableColStyle {
  column: string;
  criterias: IColStyleCriteria[];
}

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
  selector: '[pq-tableview-async]',
  templateUrl: './tableview2.component.html',
  styleUrls: ['./tableview2.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class Tableview2Component implements OnInit, AfterViewInit, OnDestroy {
  @Input() cardID: string;
  @Input() myChartID: any;
  @Input() config: any;
  @Input() typeRow: string;
  @Input() title: string;
  @Input() isTemplate: string;
  @Input() rowPosition: number;
  @Input() autoResize: boolean;
  @Input() isDrag: boolean;
  @Input() url: string;
  @Input() slug: string;
  @Input() fdata: any;
  @Input() token: any;
  @Input() mapGeoJSON: any;
  @Input() index: number;
  @Input() themes: any;
  @Input() columns: any;
  @Input() records: any;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() formdata: any;
  @Input() data: any;
  @Input() extraFilter: any;
  @Input() isFilter: boolean;
  @Input() sliceArr: any;
  @Input() isSearchResult: boolean;
  @Input() searchResultOptions: any;
  @Input() isDateFilter: boolean;
  @Input() isInitialDateFilter: boolean;
  @Input() isView: boolean;

  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();
  @Output() height: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchResultJumpTo: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('dtTableElement', { static: false }) dtTableElement: ElementRef;
  @ViewChild(DataTableDirective, { static: false }) component: DataTableDirective;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  dtElement: DataTableDirective;

  pageLength$: any;
  det: any;
  newrecords: any;
  meId$: any = [];
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  sizeFontTable: any;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;

  skin = 'light';
  activeClass = '';
  searchTableValue: string;
  filter_granularity_sqla: string;

  noData: boolean = false;
  dragHandle = false;
  dragBounds = true;
  canDownload = false;
  canOverwrite = false;
  isPreview = false;
  IsmodelShow: boolean = false;
  include_search: boolean = false;
  isFullscreen: boolean = false;
  isFilterDetail: boolean = false;
  isViewToggle: boolean = false;
  numberisFormated: boolean = false;
  widthIsFormated: boolean = false;
  isOnDateFilter: boolean = false;
  isSortTable: boolean = false;

  dataSource: MatTableDataSource<any>;
  dtOptions: any = {};
  chkDtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  fontSizeTable: any = {};
  searchMultiCols: any = {};
  search_filter: any = {};
  sortObj: any = {};

  pagelength: any = [];
  displayedColumns = [];
  columnIds = [];
  mydata: any[] = [];
  formatedColumn: any = [];
  columnNumberList: any = [];
  gridViewRecords: any = [];
  columnDateList: any = [];
  searchMultiColumns: any = [];

  columnStyles: any[] = [];

  constructor(
    private _apicall: ApiService,
    private loaderService: LoaderService,
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private store: Store<AppState>
  ) {}

  findExploreJsonWhenUndefined = async () => {
    this.displayedColumns = [];
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    this.url = exploreUrl;

    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
    }
    this.explore = await helperGetExplorerChart(this.explore, '', this.token, exploreUrl, this._apicall, this.fdata);
    if (this.formdata) this.explore.form_data = this.formdata.form_data;

    if (this.explore) {
      this.canDownload = this.explore.canDownload;
      this.canOverwrite = this.explore.canOverwrite;
    }

    if (this.searchTableValue != '') this.explore.form_data['search_filter'] = this.search_filter;

    let param: any = {
      form_data: this.explore.form_data,
    };

    param = this.setFilter(param);
    param = setInitialDate(
      param,
      this.explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.isOnDateFilter,
      this.explore,
      this.sinceDate,
      this.untilDate
    );

    param.form_data = JSON.stringify(param.form_data);
    this.exploreJson = await helperGetExplorerChart(
      this.explore,
      exploreJsonUrl,
      this.token,
      '',
      this._apicall,
      this.fdata,
      param
    );
    if (this.exploreJson) {
      this.records = await this.rearrangeDataTable(this.exploreJson.data.columns, this.exploreJson.data.records);
      for (var i = 0; i < this.exploreJson.data.columns.length; i++)
        this.displayedColumns.push(this.exploreJson.data.columns[i]);

      this.setConfigChart(this.exploreJson);
    } else {
      this.include_search = false;
      this.noData = true;
    }
  };

  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    const config = this.layoutConfigService.getConfig();
    this.skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    this.isFilterDetail = true;

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      await this.findExploreJsonWhenUndefined();
    } else {
      this.displayedColumns = [];
      this.explore = this.formdata;
      if (!isNaN(this.myChartID)) {
        this.store
          .select(detailChartSelector)
          .pipe()
          .subscribe((res) => {
            if (res) {
              this.explore = res;
            }
          });

        this.explore = {
          ...this.explore,
          form_data: {
            ...this.explore.form_data,
            initial_chart_blank: false,
          },
        };

        if (this.formdata) this.explore = this.formdata;
      } else {
        if (this.formdata) {
          this.explore = this.formdata;
        } else {
          this.explore = await helperGetExplorerChart(
            this.explore,
            '',
            this.token,
            getUrl(this.exploreJson),
            this._apicall,
            this.fdata
          );
        }
      }

      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }

      if (
        !this.isFilter &&
        this.exploreJson.form_data.initial_date_filter != null &&
        this.exploreJson.form_data.initial_date_filter != '' &&
        this.sinceDate != '' &&
        this.untilDate != ''
      )
        this.isOnDateFilter = true;
      this.records = await this.rearrangeDataTable(this.exploreJson.data.columns, this.exploreJson.data.records);
      for (var i = 0; i < this.exploreJson.data.columns.length; i++) {
        this.displayedColumns.push(this.exploreJson.data.columns[i]);
      }
      this.setConfigChart(this.exploreJson);
    }

    this.det = setTimeout(() => {
      this.meId$ = this.loaderService.spliceSpesifikID(this.myChartID);
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit(): void {
    // this.dtTrigger.subscribe();
  }

  setFilter(param) {
    param = {
      form_data: Object.assign({}, this.explore.form_data, { extra_filters: this.extraFilter }),
    };

    if (this.extraFilter && this.extraFilter.length > 0 && !this.isOnDateFilter) {
      let dateFilter = extract_date_filter(moment, this.extraFilter);
      this.sinceDate = dateFilter[0];
      this.untilDate = dateFilter[1];
      this.filter_granularity_sqla = dateFilter[2];
      if (dateFilter[0] && dateFilter[1]) this.isDateFilter = true;
    }

    this.explore.form_data.since = this.sinceDate;
    this.explore.form_data.until = this.untilDate;
    param.form_data.since = this.sinceDate;
    param.form_data.until = this.untilDate;

    if (this.isDateFilter || this.isInitialDateFilter) {
      this.explore.form_data.since = '';
      this.explore.form_data.until = '';
      param.form_data.since = '';
      param.form_data.until = '';
    }

    return param;
  }

  setVerbose() {
    for (var i = 0; i < this.displayedColumns.length; i++) {
      this.displayedColumns[i] = convert_metric_to_verbose(this.displayedColumns[i], this.explore);
    }

    for (var i = 0; i < this.records.length; i++) {
      for (var prop in this.records[i]) {
        let propVerboseName = convert_metric_to_verbose(prop, this.explore);
        this.records[i][propVerboseName] = this.records[i][prop];
      }
    }
  }

  addStaticNumber(pageIndex, pageSize, rowTotal, searchMultipleCol) {
    this.displayedColumns.unshift('No');
    let indexNo = 1;
    let no = 1;
    let startIndex = 0;
    if (searchMultipleCol) {
      rowTotal = rowTotal + 1;
    }
    for (let i = 0; i < rowTotal; i++) {
      indexNo = (pageIndex - 1) * pageSize + no;
      if (i == 0 && searchMultipleCol) i++;
      if (this.records[i]) {
        this.records[i] = {
          ...this.records[i],
          No: indexNo,
        };
      }
      no++;
    }
  }

  addToggleColumn() {
    this.formatedColumn = [];
    for (var i = 0; i < this.displayedColumns.length; i++) {
      let formatColClass = this.displayedColumns[i].replace(/[`~!\s@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '-');
      let colObj = {
        colName: this.displayedColumns[i],
        colClass: formatColClass,
      };
      this.formatedColumn.push(colObj);
    }
  }

  showTotalNumber(tableSum: any) {
    let totalValueCol = {};
    let index = 0;
    for (var prop in this.records[0]) {
      if (Object.prototype.hasOwnProperty.call(this.records[0], prop)) {
        let numericCol = tableSum[prop];
        if (index == 0) {
          if (numericCol) {
            totalValueCol[prop] = 'Total - ' + numericCol;
          } else {
            totalValueCol[prop] = 'Total';
          }
        } else {
          if (numericCol) {
            totalValueCol[prop] = numericCol;
          } else {
            totalValueCol[prop] = '';
          }
        }
        index++;
      }
    }
    for (var prop in totalValueCol) {
      let propVerboseName = convert_metric_to_verbose(prop, this.explore);
      totalValueCol[propVerboseName] = totalValueCol[prop];
    }
    this.records.push(totalValueCol);
  }

  addSearchMultiColumn() {
    const searchColObj = {};
    for (const [key] of Object.entries(this.records[0])) {
      searchColObj[key] = 'searchInput';
      this.searchMultiCols[key] = this.searchMultiCols[key] || '';
    }
    this.records.unshift(searchColObj);
  }

  setConfigPreviewTable(exploreJson) {
    let previewDataSource = [];
    // this.dataSource = undefined;
    this.dataSource = new MatTableDataSource();
    this.pagelength = exploreJson.rowtotal;
    this.records = this.reformatData(exploreJson);
    for (var i = 0; i < this.records.length; i++) {
      previewDataSource.push(this.records[i]);
      if (i === 9) {
        var columns = this.displayedColumns;
        const separator = columns.reduce((accumulator, currentValue) => {
          accumulator[currentValue] = '...';
          return accumulator;
        }, {});
        previewDataSource.push(separator);
      }
    }

    var columnTotal = this.displayedColumns.reduce((accumulator, currentValue) => {
      if (currentValue === this.displayedColumns[0]) {
        accumulator[currentValue] = 'Column total';
      } else if (currentValue === this.displayedColumns[1]) {
        accumulator[currentValue] = this.exploreJson.data.col_total;
      } else {
        accumulator[currentValue] = '';
      }
      return accumulator;
    }, {});
    previewDataSource.push(columnTotal);

    var rowTotal = this.displayedColumns.reduce((accumulator, currentValue) => {
      if (currentValue === this.displayedColumns[0]) {
        accumulator[currentValue] = 'Row total';
      } else if (currentValue === this.displayedColumns[1]) {
        accumulator[currentValue] = this.exploreJson.data.row_total;
      } else {
        accumulator[currentValue] = '';
      }
      return accumulator;
    }, {});
    previewDataSource.push(rowTotal);
    this.dataSource.data = previewDataSource;
  }

  setConfigTable(exploreJson) {
    // this.dataSource = undefined;
    this.dataSource = new MatTableDataSource();
    this.pagelength = exploreJson.rowtotal;
    if (exploreJson.form_data.search_multi_columns) this.addSearchMultiColumn();
    if (exploreJson.form_data.static_number)
      this.addStaticNumber(
        exploreJson.form_data.page_index,
        exploreJson.form_data.page_size,
        exploreJson.rowcount,
        exploreJson.form_data.search_multi_columns
      );
    this.addToggleColumn();
    if (exploreJson.form_data.show_total_numeric_column === true && exploreJson.table_sum !== null)
      this.showTotalNumber(exploreJson.table_sum);
    this.dataSource.data = this.records;
  }

  setConfigGridview(exploreJson) {
    this.columnNumberList = [];
    this.displayedColumns = [];
    this.pagelength = exploreJson.rowtotal;
    for (var prop in exploreJson.data.records[0]) {
      if (!isNaN(exploreJson.data.records[0][prop]) && exploreJson.data.records[0][prop] !== '') {
        this.columnNumberList.push(prop);
      }
      this.displayedColumns.push(prop);
    }

    this.gridViewRecords = [];
    for (var i = 0; i < this.records.length; i++) {
      let dataArr = [];
      let index = 0;
      for (let prop in this.records[i]) {
        dataArr[index] = this.records[i][prop];
        index++;
      }
      this.gridViewRecords.push(dataArr);
    }
  }

  setConfigChart(exploreJson) {
    this.numberisFormated = false;
    this.widthIsFormated = false;
    let locale = exploreJson.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(this.formaterNumber[locale]);
    this.include_search =
      exploreJson.form_data && exploreJson.form_data.include_search ? exploreJson.form_data.include_search : false;
    if (exploreJson.form_data.metrics.length > 0) this.setVerbose();
    if (!exploreJson.form_data.table_grid_view && exploreJson.form_data.viz_type === 'preview')
      this.setConfigPreviewTable(exploreJson);
    else if (!exploreJson.form_data.table_grid_view && exploreJson.form_data.viz_type === 'table')
      this.setConfigTable(exploreJson);
    else if (exploreJson.form_data.table_grid_view) this.setConfigGridview(exploreJson);
    for (const [key, value] of Object.entries(exploreJson.data.records[0])) {
      let isColUtc = this.parseDate(value);
      if (isColUtc) this.columnDateList.push(key);
    }
    //set initial chart blank
    if (this.isFilter) this.explore.form_data.initial_chart_blank = false;
    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) this.onToggleFilter();
    setTimeout(() => {
      if (!this.explore.form_data.initial_chart_blank && !this.noData) {
        this.reformatTableCell(exploreJson);
      }
    }, 100);

    this.cdr.detectChanges();
  }

  onTableFilter(key, selectedColumn) {
    let mydata: any = [];
    key = convert_verbose_to_metric(key, this.explore);
    let columnNumber = this.columnNumberList.indexOf(key);

    if (columnNumber > -1) {
      let locale = this.explore.form_data.format_number_id ? 'ID' : 'EN';
      if (locale === 'ID') selectedColumn = selectedColumn.toString().replace(/[.]/g, '');
      else if (locale === 'EN') selectedColumn = selectedColumn.toString().replace(/[ ,]/g, '');
    }
    mydata[key] = [{ filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn }];
    this.screenChange();
    this.cdr.detectChanges();

    this.onFilter(mydata);
  }

  onGridviewFilter(items) {
    let key, selectedColumn;
    let mydata: any = [];
    let locale = this.explore.form_data.format_number_id ? 'ID' : 'EN';
    if (this.explore.form_data.search_main_column && this.explore.form_data.search_second_column) {
      for (var i = 0; i < items.length; i++) {
        key = this.displayedColumns[i];
        selectedColumn = items[i];
        let columnNumber = this.columnNumberList.indexOf(key);

        if (columnNumber > -1) {
          if (locale === 'ID') selectedColumn = selectedColumn.toString().replace(/[.]/g, '');
          else if (locale === 'EN') selectedColumn = selectedColumn.toString().replace(/[ ,]/g, '');
        }
        mydata[key] = [{ filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn }];
      }
    } else if (this.explore.form_data.search_main_column && !this.explore.form_data.search_second_column) {
      key = this.displayedColumns[0];
      selectedColumn = items[0];
      let columnNumber = this.columnNumberList.indexOf(key);

      if (columnNumber > -1) {
        if (locale === 'ID') selectedColumn = selectedColumn.toString().replace(/[.]/g, '');
        else if (locale === 'EN') selectedColumn = selectedColumn.toString().replace(/[ ,]/g, '');
      }
      mydata[key] = [{ filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn }];
    } else if (!this.explore.form_data.search_main_column && this.explore.form_data.search_second_column) {
      key = this.displayedColumns[1];
      selectedColumn = items[1];
      let columnNumber = this.columnNumberList.indexOf(key);

      if (columnNumber > -1) {
        if (locale === 'ID') selectedColumn = selectedColumn.toString().replace(/[.]/g, '');
        else if (locale === 'EN') selectedColumn = selectedColumn.toString().replace(/[ ,]/g, '');
      }
      mydata[key] = [{ filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn }];
    }
    this.onFilter(mydata);
  }

  onFilter(filterData) {
    let filterArr = [];
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    let urlLinkTo = '/api/dashboard/view?link=';

    if (this.isFilter) {
      for (let i = 0; i < this.extraFilter.length; i++) {
        let key = this.extraFilter[i].col;
        let selectedColumn;
        if (Array.isArray(this.extraFilter[i].val)) {
          for (let j = 0; j < this.extraFilter[i].val.length; j++) {
            selectedColumn = this.extraFilter[i].val[j];
            let extraFilterObj = { filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn };
            filterArr.push(extraFilterObj);
          }
          filterData[key] = filterArr;
        } else {
          selectedColumn = this.extraFilter[i].val;
          filterData[key] = [{ filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn }];
        }
      }
    }

    if (this.explore.form_data.filters.length > 0) {
      for (let i = 0; i < this.explore.form_data.filters.length; i++) {
        let key = this.explore.form_data.filters[i].col;
        let selectedColumn;
        if (filterData[key] && filterData[key].length > 0) {
          selectedColumn = this.explore.form_data.filters[i].val;
          let filterObj = {
            filter: selectedColumn,
            id: selectedColumn,
            metric: 2,
            text: selectedColumn,
            op: this.explore.form_data.filters[i].op,
          };
          filterData[key].push(filterObj);
        } else {
          selectedColumn = this.explore.form_data.filters[i].val;
          filterData[key] = [
            {
              filter: selectedColumn,
              id: selectedColumn,
              metric: 2,
              text: selectedColumn,
              op: this.explore.form_data.filters[i].op,
            },
          ];
        }
      }
    }

    let param = {
      id: this.myChartID,
      data: this.explore,
      filter: {
        data: filterData,
        since: this.sinceDate,
        until: this.untilDate,
        timecolumn: this.isDateFilter ? this.filter_granularity_sqla : this.explore.form_data.granularity_sqla,
      },
      url: '/api/chart/explore/?form_data=%7B%22slice_id%22%3A143%7D',
      slug: this.slug,
      isLinkTo: this.explore.form_data.chart_on_click,
      linkTo: urlLinkTo + this.explore.form_data.link_to,
      isFilter: true,
      isItemChart: true,
    };
    this.filter.emit(param);
  }

  async applyFilter() {
    this.search_filter = {};
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    let exploreJsonUrl = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + this.myChartID + '%7D';
    this.searchTableValue = this.searchTableValue.trim();
    let filters = [];

    for (var i = 0; i < this.displayedColumns.length; i++) {
      let colname = convert_verbose_to_metric(this.displayedColumns[i], this.explore);
      let metric_name = this.explore.datasource.metrics.filter((x) => x.metric_name === colname)[0];
      if (!metric_name) {
        let utcCol = this.columnDateList.indexOf(colname);
        let isSearchUtc = this.parseDate(this.searchTableValue);
        let filterObj;

        if (utcCol == -1 && !isSearchUtc) {
          filterObj = {
            col: colname,
            op: 'regex',
            val: '(?i).*' + this.searchTableValue + '.*',
          };
        } else if (utcCol > -1 && isSearchUtc) {
          filterObj = {
            col: colname,
            op: '==',
            val: this.searchTableValue,
          };
        }

        if (this.displayedColumns[i] !== 'No') {
          filters.push(filterObj);
        }
      }
    }

    this.explore.form_data.page_index = 1;
    this.search_filter = {
      filter_operator: 'or',
      filters: filters,
    };
    this.explore.form_data = { ...this.explore.form_data, search_filter: this.search_filter };
    let param = {
      form_data: this.explore.form_data,
    };

    if (this.isOnDateFilter) {
      param.form_data.since = this.sinceDate;
      param.form_data.until = this.untilDate;

      if (this.isFilter && this.extraFilter.length > 0) {
        for (var i = 0; i < this.extraFilter.length; i++) {
          if (this.extraFilter[i].col === '__from') {
            param.form_data.since = '';
            this.extraFilter[i].val = this.sinceDate;
          } else if (this.extraFilter[i].col === '__to') {
            param.form_data.until = '';
            this.extraFilter[i].val = this.untilDate;
          }
        }
      }
    }

    if (this.isSortTable) param.form_data['page_sort'] = [this.sortObj];
    if (this.searchTableValue != '') param.form_data['search_filter'] = this.search_filter;

    param = this.setFilter(param);
    param = setInitialDate(
      param,
      this.explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.isOnDateFilter,
      this.explore,
      this.sinceDate,
      this.untilDate
    );
    param.form_data = JSON.stringify(param.form_data);

    let exploreJsonResult = await this._apicall.loadPostData(exploreJsonUrl, param);
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.noData = this.exploreJson ? false : true;
    this.ngOnInit();
  }

  async applyMultipleColFilter() {
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    let exploreJsonurl = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + this.myChartID + '%7D';
    let filters = [];
    for (const [key, value] of Object.entries(this.searchMultiCols)) {
      let colname = convert_verbose_to_metric(key, this.explore);
      let metric_name = this.explore.datasource.metrics.filter((x) => x.metric_name === colname)[0];
      if (!metric_name && value) {
        let utcCol = this.columnDateList.indexOf(colname);
        let isSearchUtc = this.parseDate(value);
        if (utcCol == -1 && !isSearchUtc) {
          let filterObj = {
            col: colname,
            op: 'regex',
            val: '(?i).*' + value + '.*',
          };
          if (key !== 'No') {
            filters.push(filterObj);
          }
        } else if (utcCol > -1 && isSearchUtc) {
          let filterObj = {
            col: colname,
            op: '==',
            val: value,
          };
          if (key !== 'No') {
            filters.push(filterObj);
          }
        }
      }
    }
    this.explore.form_data.page_index = 1;
    this.search_filter = {
      filter_operator: 'and',
      filters: filters,
    };
    this.explore.form_data = { ...this.explore.form_data, search_filter: this.search_filter };
    let param = {
      form_data: this.explore.form_data,
    };
    if (this.isOnDateFilter) {
      param.form_data.since = this.sinceDate;
      param.form_data.until = this.untilDate;

      if (this.isFilter && this.extraFilter.length > 0) {
        for (var i = 0; i < this.extraFilter.length; i++) {
          if (this.extraFilter[i].col === '__from') {
            param.form_data.since = '';
            this.extraFilter[i].val = this.sinceDate;
          } else if (this.extraFilter[i].col === '__to') {
            param.form_data.until = '';
            this.extraFilter[i].val = this.untilDate;
          }
        }
      }
    }
    if (this.isSortTable) param.form_data['page_sort'] = [this.sortObj];
    if (this.searchTableValue != '') param.form_data['search_filter'] = this.search_filter;
    param = this.setFilter(param);
    param = setInitialDate(
      param,
      this.explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.isOnDateFilter,
      this.explore,
      this.sinceDate,
      this.untilDate
    );
    param.form_data = JSON.stringify(param.form_data);
    let exploreJsonResult = await this._apicall.loadPostData(exploreJsonurl, param);
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.noData = this.exploreJson ? false : true;
    this.ngOnInit();
  }

  yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    chosenDate.set({ date: 1 });
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    let result = year_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    if (this.sinceDate != null && this.untilDate != null) {
      this.OnDatePickerFilter();
    }
  }

  monthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    let result = month_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    if (this.sinceDate != null && this.untilDate != null) {
      this.OnDatePickerFilter();
    }
  }

  datePickerHandler(chosenDate: Moment, type) {
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    let result = date_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    if (this.sinceDate != null && this.untilDate != null) {
      this.OnDatePickerFilter();
    }
  }

  async OnDatePickerFilter() {
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.isOnDateFilter = true;
    let exploreJsonUrl = 'api/chart/explore_json/';
    this.explore.form_data.since = this.sinceDate;
    this.explore.form_data.until = this.untilDate;

    if (this.isFilter && this.extraFilter.length > 0) {
      for (var i = 0; i < this.extraFilter.length; i++) {
        if (this.extraFilter[i].col === '__from') {
          this.explore.form_data.since = '';
          this.extraFilter[i].val = this.sinceDate;
        } else if (this.extraFilter[i].col === '__to') {
          this.explore.form_data.until = '';
          this.extraFilter[i].val = this.untilDate;
        }
      }
    }
    let param = {
      form_data: this.explore.form_data,
    };
    if (this.isSortTable) param.form_data['page_sort'] = [this.sortObj];
    if (this.searchTableValue != '') param.form_data['search_filter'] = this.search_filter;
    param = this.setFilter(param);
    param = setInitialDate(
      param,
      this.explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.isOnDateFilter,
      this.explore,
      this.sinceDate,
      this.untilDate
    );
    param.form_data = JSON.stringify(param.form_data);
    let exploreJsonResult = await this._apicall.loadPostData(exploreJsonUrl, param);
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.noData = this.exploreJson ? false : true;
    this.ngOnInit();
  }

  onRefresh(id) {
    if (this.sinceDate && this.untilDate) {
      this.isOnDateFilter = false;
      this.sinceDate = null;
      this.untilDate = null;
      if (this.exploreJson) {
        this.exploreJson.form_data.since = '';
        this.exploreJson.form_data.until = '';
      }
      this.noData = false;
    }
    if (this.searchTableValue && this.searchTableValue !== '') {
      if (
        this.exploreJson &&
        this.exploreJson.form_data.search_filter.filter_operator &&
        this.exploreJson.form_data.search_filter.filters
      ) {
        this.exploreJson.form_data.search_filter.filter_operator = '';
        this.exploreJson.form_data.search_filter.filters = [];
      }
      this.noData = false;
      this.searchTableValue = '';
    }
    if (this.sort) this.sort.direction = '';
    this.exploreJson = undefined;
    if (this.isFilter) {
    }
    this.isFilter = false;
    this.isSortTable = false;
    this.loaderService.setSpesifikID([id]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  onDownload(id) {
    if (this.exploreJson) this.explore.form_data = this.exploreJson.form_data;
    if (this.isFilter) {
      this.explore.form_data.extra_filters = this.extraFilter;
    }
    this.download.emit({ id: id, url: this.url, data: this.explore });
  }

  onDelete() {
    this.delete.emit(this.index);
  }

  viewDetailChart(e) {
    this.searchResultJumpTo.emit(e);
  }

  onToggleFilter() {
    let cardId = this.cardID;

    $('#' + cardId + ' .containerList').toggleClass('d-none');
    $('#' + cardId + ' .demo-chart').toggleClass('h-85');
    this.cdr.detectChanges();
  }

  onFullscreen(cardId) {
    this.isFullscreen = true;
    on_full_screen_id('myDiv-' + cardId);
  }

  onClickOverlay() {
    let card = document.getElementById('myDiv-' + this.cardID);
    let hiddenPopUp = document.getElementsByClassName('cdk-overlay-container');

    if (document.fullscreenElement) {
      for (let i = 0; i < hiddenPopUp.length; i++) {
        card.appendChild(hiddenPopUp[i]);
      }
    }
  }

  async onChangePage(event) {
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    let exploreJsonUrl = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + this.myChartID + '%7D';
    this.explore = {
      ...this.explore,
      form_data: {
        ...this.explore.form_data,
        page_index: event.pageIndex + 1,
        page_size: event.pageSize || this.explore.form_data.page_size,
      },
    };

    // this.explore.form_data.page_index = event.pageIndex + 1;
    // this.explore.form_data.page_size = event.pageSize || this.explore.form_data.page_size;
    let param = {
      form_data: this.explore.form_data,
    };

    if (this.isOnDateFilter) {
      param.form_data.since = this.sinceDate;
      param.form_data.until = this.untilDate;

      if (this.isFilter && this.extraFilter.length > 0) {
        for (var i = 0; i < this.extraFilter.length; i++) {
          if (this.extraFilter[i].col === '__from') {
            param.form_data.since = '';
            this.extraFilter[i].val = this.sinceDate;
          } else if (this.extraFilter[i].col === '__to') {
            param.form_data.until = '';
            this.extraFilter[i].val = this.untilDate;
          }
        }
      }
    }

    if (this.isSortTable) param.form_data['page_sort'] = [this.sortObj];
    if (this.searchTableValue != '') param.form_data['search_filter'] = this.search_filter;

    param = this.setFilter(param);
    param = setInitialDate(
      param,
      this.explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.isOnDateFilter,
      this.explore,
      this.sinceDate,
      this.untilDate
    );
    param.form_data = JSON.stringify(param.form_data);
    let exploreJsonResult = await this._apicall.loadPostData(exploreJsonUrl, param);
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.records = this.exploreJson.data.records;
    this.ngOnInit();
  }

  async sortData(event) {
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.isSortTable = true;
    this.sortObj = {};
    if (event.direction === '') event.direction = 'asc';
    this.sort.direction = event.direction;
    this.explore.form_data.page_sort = [];
    let exploreJsonUrl = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + this.myChartID + '%7D';
    let colName =
      this.exploreJson.form_data.metrics.length > 0
        ? convert_verbose_to_metric(event.active, this.explore)
        : convert_metric_to_verbose(event.active, this.explore);
    this.sortObj = {
      column: colName,
      order: event.direction,
    };

    if (event.direction !== '') {
      this.explore.form_data.page_sort.push(this.sortObj);
    } else if (event.direction === '' && this.explore.form_data.table_filter_column !== '') {
      let sortOrder = this.explore.form_data.table_sort_desc === true ? 'desc' : 'asc';
      this.sortObj = {
        column: this.explore.form_data.table_filter_column,
        order: sortOrder,
      };
      this.explore.form_data.page_sort.push(this.sortObj);
    }
    let param = {
      form_data: this.explore.form_data,
    };
    if (this.isOnDateFilter) {
      param.form_data.since = this.sinceDate;
      param.form_data.until = this.untilDate;

      if (this.isFilter && this.extraFilter.length > 0) {
        for (var i = 0; i < this.extraFilter.length; i++) {
          if (this.extraFilter[i].col === '__from') {
            param.form_data.since = '';
            this.extraFilter[i].val = this.sinceDate;
          } else if (this.extraFilter[i].col === '__to') {
            param.form_data.until = '';
            this.extraFilter[i].val = this.untilDate;
          }
        }
      }
    }
    if (this.isSortTable) param.form_data['page_sort'] = [this.sortObj];
    if (this.searchTableValue != '') param.form_data['search_filter'] = this.search_filter;
    param = this.setFilter(param);
    param = setInitialDate(
      param,
      this.explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.isOnDateFilter,
      this.explore,
      this.sinceDate,
      this.untilDate
    );
    param.form_data = JSON.stringify(param.form_data);
    let exploreJsonResult = await this._apicall.loadPostData(exploreJsonUrl, param);
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.records = this.exploreJson.data.records;
    this.ngOnInit();
  }

  toggleColumn(index, colName, colClass) {
    let removeColIndex = this.displayedColumns.indexOf(colName);
    if (removeColIndex > -1) {
      this.displayedColumns.splice(removeColIndex, 1);
      $('#ToggleBtn-' + colClass).addClass('active');
    } else {
      this.displayedColumns.splice(index, 0, colName);
      this.displayedColumns.join();
      $('#ToggleBtn-' + colClass).removeClass('active');

      setTimeout(() => {
        this.reformatTableCell(this.explore);
      }, 100);
    }
  }

  viewToggle() {
    if (this.isViewToggle) {
      this.isViewToggle = false;
    } else {
      this.isViewToggle = true;
    }
  }

  onChartWidth(cls) {
    let card = document.getElementById(this.cardID);
    card.removeAttribute('class');
    card.className = cls;
    this.activeClass = cls;
    this.width.emit(get_position(cls));
  }

  onChartHeight(height) {
    let card = document.getElementById('myDiv-' + this.cardID);
    card.style.height = height + 'vh';
    this.height.emit(height);
    this.cdr.detectChanges();
  }

  reformatTableCell(exploreJson) {
    if (!exploreJson.form_data.table_grid_view) this.columnNumberList = [];
    let cardId = this.isView ? 'myDiv-' + this.cardID : 'cardChart';
    let card = $('#' + cardId);
    let fontSize = exploreJson.form_data.table_font_size || 10;
    let fontFamily = exploreJson.form_data.table_font_family || 'Roboto';

    if (!exploreJson.form_data.table_grid_view) {
      this.setTableFont(card, fontSize, fontFamily);
      this.resizeWidthColumn(card, exploreJson, fontSize, fontFamily);
      this.reformatDataCell(card, exploreJson);
    } else {
      let gridClass = card.find('.file');
      for (var i = 0; i < gridClass.length; i++) {
        gridClass[i].style.cssText =
          exploreJson.form_data.table_font_family !== ''
            ? 'font-size: ' + fontSize + 'px !important; font-family: ' + fontFamily
            : 'font-size: ' + fontSize + 'px !important;';
      }
    }
  }

  setTableFont(card, fontSize, fontFamily) {
    for (var i = 0; i < this.displayedColumns.length; i++) {
      let reformatColumnName = this.displayedColumns[i].replace(/[`~!\s@#$%^&*()|+\-=?;:'".,<>\{\}\[\]\\\/]/gi, '-');
      let cellClass = card.find('.mat-cell.mat-column-' + reformatColumnName);
      let cssText = 'font-size: ' + fontSize + 'px !important; font-family: ' + fontFamily + ' !important;';
      for (var j = 0; j < cellClass.length; j++) {
        cellClass[j].style.fontSize = fontSize + 'px';
        cellClass[j].style.cssText = cssText;
      }

      let cellHeaderClass = card.find('.mat-header-cell.mat-column-' + reformatColumnName);
      if (cellHeaderClass.length > 0) {
        cellHeaderClass[0].style.fontSize = fontSize + 'px';
        cellHeaderClass[0].style.cssText = cssText;
      }
    }
  }

  resizeWidthColumn(card, exploreJson, fontSize, fontFamily) {
    if (exploreJson.form_data.custom_width_column_arr && exploreJson.form_data.custom_width_column_arr.length > 0) {
      this.widthIsFormated = true;
      for (let i = 0; i < exploreJson.form_data.custom_width_column_arr.length; i++) {
        let column = exploreJson.form_data.custom_width_column_arr[i].column;
        let displayedColumn = this.displayedColumns.indexOf(column);
        if (displayedColumn > -1) {
          let width = exploreJson.form_data.custom_width_column_arr[i].width;
          let verboseCol = convert_metric_to_verbose(column, this.explore);
          let reformatColumnName = verboseCol.replace(/[`~!\s@#$%^&*()|+\-=?;:'".,<>\{\}\[\]\\\/]/gi, '-');
          let cellClass = card.find('.mat-cell.mat-column-' + reformatColumnName);
          let cssText =
            'word-wrap: break-word !important;' +
            ' white-space: break-spaces !important;' +
            ' flex:' +
            width +
            ' min-width: 30px !important;' +
            ' font-size: ' +
            fontSize +
            'px !important;' +
            ' font-family: ' +
            fontFamily +
            ' !important;';
          for (var j = 0; j < cellClass.length; j++) {
            cellClass[j].style.fontSize = fontSize + 'px';
            cellClass[j].style.cssText = cssText;
          }
          let cellHeaderClass = card.find('.mat-header-cell.mat-column-' + reformatColumnName);
          cellHeaderClass[0].style.cssText = cssText;
        }
      }
    }
  }

  reformatDataCell(card, exploreJson) {
    if (
      exploreJson.form_data.custom_column_format_arr &&
      exploreJson.form_data.custom_column_format_arr.length > 0 &&
      !this.numberisFormated
    ) {
      this.numberisFormated = true;
      for (let i = 0; i < exploreJson.form_data.custom_column_format_arr.length; i++) {
        let column = exploreJson.form_data.custom_column_format_arr[i].column;
        let format = exploreJson.form_data.custom_column_format_arr[i].format;
        let format_type = exploreJson.form_data.custom_column_format_arr[i].format_type;
        let verboseCol = convert_metric_to_verbose(column, this.explore);
        let reformatCol = verboseCol.replace(/[`~!\s@#$%^&*()|+\-=?;:'".,<>\{\}\[\]\\\/]/gi, '-');
        for (let j = 0; j < this.records.length; j++) {
          if (format_type && this.records[j][verboseCol] !== 'searchInput') {
            if (format_type === 'number') {
              let isNumber = isNaN(this.records[j][verboseCol]);
              let number = this.records[j][verboseCol];
              let formatedNumber = this.reformatNumber(number, format);
              let format_total_number_arr = [];
              let format_total_number;
              if (isNumber) format_total_number_arr = this.records[j][verboseCol].split('-');
              if (format_total_number_arr.length > 0)
                format_total_number = this.reformatNumber(Number(format_total_number_arr[1]), format);
              let formated_total_number = format_total_number_arr[0] + '-' + format_total_number;
              this.records[j][verboseCol] =
                !isNumber && format_total_number_arr ? formatedNumber : formated_total_number;

              let cellClass = card.find('.mat-cell.mat-column-' + reformatCol);
              cellClass.css('display', 'flex');
              cellClass.css('justify-content', 'flex-end');
            }
            if (format_type === 'date') {
              let date = this.records[j][column];
              let format_date = get_format_date(format);
              let formatedDate = moment(date).format(format_date);
              this.records[j][column] = String(formatedDate) != 'Invalid date' ? formatedDate : date;
            }
          }
        }
      }
    }
  }

  async rearrangeDataTable(columns, records) {
    let result = [];
    records.map(function (val) {
      let obj = {};
      let arr = Object.entries(val);
      columns.map(function (col) {
        for (let i of arr) {
          if (col == i[0]) return (obj[i[0]] = i[1]);
        }
      });

      result.push(obj);
    });
    return result;
  }

  reformatData(exploreJson) {
    let tf = exploreJson.form_data.number_format || ',';
    for (var i = 0; i < this.records.length; i++) {
      for (var prop in this.records[i]) {
        if (Object.prototype.hasOwnProperty.call(this.records[i], prop)) {
          if (!isNaN(this.records[i][prop]) && this.records[i][prop] !== '') {
            let num = this.reformatNumber(Number(this.records[i][prop]), tf);
            this.records[i][prop] = num;
          } else {
            let isUtc = this.parseDate(this.records[i][prop]);

            if (isUtc) {
              let formatedDate;

              if (exploreJson.form_data.table_timestamp_format !== '') {
                if (exploreJson.form_data.table_timestamp_format === 'smart_date') {
                  formatedDate = moment(this.records[i][prop]).format('MMM YYYY');
                } else {
                  let format = get_format_date(exploreJson.form_data.table_timestamp_format);
                  formatedDate = moment(this.records[i][prop]).format(format);
                }
              } else {
                formatedDate = moment(this.records[i][prop]).format('DD/MM/YYYY');
              }
              this.records[i][prop] = formatedDate;
            } else {
              this.records[i][prop] = this.records[i][prop];
            }
          }
        }
      }
      this.records[i] = this.records[i];
    }

    return this.records;
  }

  reformatNumber(num, numberFormat) {
    let locale = this.explore.form_data.format_number_id ? 'ID' : 'EN';
    let localeStr;
    if (locale === 'ID') localeStr = 'id-ID';
    else if (locale === 'EN') localeStr = 'en-US';
    let value = reformat_number(d3, num, numberFormat, locale, localeStr);
    return value;
  }

  parseDate(dateStr) {
    return validate_date(dateStr);
  }

  applyColumnStyling(colName, val) {
    const colStyes = this.explore.form_data.column_styles as ITableColStyle[];
    if (!colStyes) {
      return null;
    }

    const colStyle = colStyes.find((x) => x['column'] === colName);
    if (!colStyle) {
      return null;
    }
    const criterias = colStyle['criterias'];
    for (let i = 0; i < criterias.length; i++) {
      const { values, format, op } = criterias[i];
      const isNumeric = this.isNumber(values[0]);
      const comparo: number | string = isNumeric ? parseFloat(values[0]) : values[0];
      const comparo2: number | string = isNumeric ? parseFloat(values[1]) : values[1];
      switch (op) {
        case '<':
          if (isNumeric && val < comparo) return format;
          break;
        case '>':
          if (isNumeric && val > comparo) return format;
          break;
        case '<=':
          if (isNumeric && val <= comparo) return format;
          break;
        case '>=':
          if (isNumeric && val >= comparo) return format;
          break;
        case '==':
          if (val == comparo) return format;
          break;
        case '!=':
          if (val != comparo) return format;
          break;
        case 'between':
          if (isNumeric && val > comparo && val < comparo2) return format;
          break;
        case 'not between':
          if (isNumeric && (val < comparo || val > comparo2)) return format;
          break;
      }
    }
    return null;
  }

  isNumber(str: string): boolean {
    return /^-?[0-9]+(?:\.[0-9]+)?$/.test(str);
  }

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange() {
    if (window.innerHeight === screen.height) {
      this.isFullscreen = true;
    } else {
      let hiddenPopUp = document.getElementsByClassName('cdk-overlay-container');
      for (let i = 0; i < hiddenPopUp.length; i++) {
        $('body').append(hiddenPopUp[i]);
      }

      this.isFullscreen = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onResize() {}
}
