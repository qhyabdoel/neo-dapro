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
import { ApiService, LayoutConfigService, LoaderService } from 'src/app/libs/services';
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
  date_picker_handler,
  get_format_date,
  get_position,
  month_picker_handler,
  on_full_screen_id,
  reformat_number,
  sort_array_object,
  validate_date,
  year_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  reformatNumber,
} from 'src/app/libs/helpers/data-visualization-helper';
import {
  addFooterColumn,
  addHeaderColumn,
  reformatDataTable,
  setBaseColumnDate,
  setFilter,
  setInitianDate,
  sortNumber,
} from './helperTableComparison';

const moment = _rollupMoment || _moment;
declare var $: any;
declare var d3: any;

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

class Person {
  id: number;
  firstName: string;
  lastName: string;
}

//OnChanges
@Component({
  selector: '[pq-tablecomparison-async]',
  templateUrl: './tablecomparison2.component.html',
  styleUrls: ['./tablecomparison2.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class TableComparison2Component implements OnInit, AfterViewInit, OnDestroy {
  @Input() cardID: string;
  @Input() myChartID: string;
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
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();
  @Output() height: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchResultJumpTo: EventEmitter<any> = new EventEmitter<any>();
  @Input() isView: boolean;
  @ViewChild('dtTableElement', { static: false }) dtTableElement: ElementRef;
  @ViewChild(DataTableDirective, { static: false }) component: DataTableDirective;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dtElement: DataTableDirective;

  //data type array
  pagelength: any = [];
  pageLength$: any;
  displayedColumns = [];
  displayedColumnsHeader: any = [];
  displayedColumnsFooter: any = [];
  columnIds = [];
  mydata: any[] = [];
  persons: Person[];
  formatedColumn: any = [];
  untilDateComparison: any = [];
  formaterNumber: any;
  columnNumberList: any = [];
  base_column_filters: any = [];
  //data type object
  dataSource: MatTableDataSource<any>;
  noData: boolean = false;
  dtOptions: any = {};
  chkDtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  untilDateFCComparison = new FormControl(moment());
  //data type any
  det: any;
  latestDate: any;
  sinceDate: any;
  untilDate: any;
  newrecords: any;
  meId$: any;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  //data type boolean
  dragHandle: boolean = false;
  dragBounds: boolean = true;
  canDownload: boolean = false;
  canOverwrite: boolean = false;
  isPreview: boolean = false;
  IsmodelShow: boolean = false;
  include_search: boolean = false;
  isFullscreen: boolean = false;
  isFilterDetail: boolean = false;
  isViewToggle: boolean = false;
  isLatestDate: boolean = false;
  isOnDateFilter: boolean = false;
  //data type string
  skin: string = 'light';
  filter_granularity_sqla: string;
  activeClass: string = '';
  constructor(
    private _apicall: ApiService,
    private loaderService: LoaderService,
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef
  ) {}
  findExploreJsonWhenUndefined = async () => {
    var explore = {
      form_data: {},
    };
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    this.url = exploreUrl;
    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
    }
    this.explore = await helperGetExplorerChart(
      this.explore,
      exploreJsonUrl,
      this.token,
      exploreUrl,
      this._apicall,
      this.fdata
    );
    this.explore.form_data = this.fdata ? this.fdata : this.explore.form_data;

    explore = this.explore;

    if (this.explore) {
      this.canDownload = this.explore.canDownload;
      this.canOverwrite = this.explore.canOverwrite;
    }
    let payload = explore.form_data ? explore.form_data : this.explore.form_data;
    let param = {
      form_data: payload,
    };
    param = setFilter(param, explore, this.isFilter, this.extraFilter);
    param = setInitianDate(param, explore);
    param.form_data = JSON.stringify(param.form_data);
    let exploreJson = await helperGetExplorerChart(
      this.explore,
      exploreJsonUrl,
      this.token,
      '',
      this._apicall,
      this.fdata,
      param
    );
    if (exploreJson) {
      let rfData = await reformatDataTable(exploreJson);
      exploreJson = { ...exploreJson, data: rfData[0] };
      this.records = exploreJson.data.records;
      this.columns = exploreJson.data.columns;
      this.include_search = true;
      this.setConfigChart(exploreJson);
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
    this.isLatestDate = false;

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      await this.findExploreJsonWhenUndefined();
    } else {
      this.include_search = true;
      if (!this.formdata) {
        let exploreUrl = helperGenerateExploreUrl(this.myChartID);

        this.explore = await helperGetExplorerChart(
          this.explore,
          '',
          this.token,
          exploreUrl,
          this._apicall,
          this.fdata
        );
      } else {
        this.explore = this.formdata;
      }
      let rfData = await reformatDataTable(this.exploreJson);
      this.exploreJson = { ...this.exploreJson, data: rfData[0] };
      this.records = this.exploreJson.data.records;
      this.columns = this.exploreJson.data.columns;
      this.sinceDate = this.explore.form_data.since;
      this.untilDate = this.explore.form_data.until;

      //for filter date
      if (this.sinceDate && this.untilDate) {
        this.records = this.exploreJson.data.records;
      }
      this.setConfigChart(this.exploreJson);
    }

    const self = this;
    this.det = setTimeout(function () {
      self.meId$ = self.loaderService.spliceSpesifikID(self.myChartID);
      self.cdr.detectChanges();
    }, 100);
  }

  ngAfterViewInit(): void {
    // this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  //Configuration chart function
  setConfigChart(exploreJson) {
    const self = this;
    this.dataSource = undefined;
    this.dataSource = new MatTableDataSource();
    this.pagelength = exploreJson.data.row_total;
    if (exploreJson.latest_date != '0001-01-01T00:00:00Z') this.isLatestDate = true;
    this.latestDate = moment(exploreJson.latest_date).format('YYYY-MM-DDTHH:mm:ss');
    let colFooter = [],
      colHeader = [];
    this.mapValue(exploreJson);
    this.addToggleColumn();
    colHeader = addHeaderColumn(exploreJson, this.columns);
    colFooter = addFooterColumn(exploreJson, this.columns, this.explore, d3);
    this.displayedColumnsHeader = colHeader;
    this.displayedColumnsFooter = colFooter;
    this.displayedColumns = this.columns;
    this.dataSource.data = this.records;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter();
    }
    setTimeout(function () {
      self.reformatTableCell(exploreJson);
    }, 100);
    this.cdr.detectChanges();
  }
  //map value
  mapValue(exploreJson) {
    for (let i = 0; i < exploreJson.form_data.base_columns.length; i++) {
      let latest_date = moment(exploreJson.latest_date).format('YYYY-MM-DDTHH:mm:ss');
      this.untilDateComparison[i] = this.isOnDateFilter ? this.untilDateComparison[i] : latest_date;
      this.base_column_filters[i] = exploreJson.form_data.base_columns[i].filters;
    }
  }
  //add toggle column
  addToggleColumn() {
    this.formatedColumn = [];
    for (var i = 0; i < this.columns.length; i++) {
      this.formatedColumn.push(this.columns[i]);
    }
  }

  //End configuration chart function

  //Filter function
  onFilter(key, selectedColumn) {
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    let mydata = {};
    let urlLinkTo = '/api/dashboard/view?link=';
    mydata[key] = [{ filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn }];
    let param = {
      id: this.myChartID,
      data: this.explore,
      filter: {
        data: mydata,
      },
      url: '/api/chart/explore/?form_data=%7B%22slice_id%22%3A143%7D',
      slug: this.slug,
      isLinkTo: this.explore.form_data.chart_on_click,
      linkTo: urlLinkTo + this.explore.form_data.link_to,
      isFilter: true,
    };
    this.screenChange();
    this.cdr.detectChanges();

    this.filter.emit(param);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  //End filter function

  onRefresh(id) {
    this.isOnDateFilter = false;
    if (this.sinceDate && this.untilDate) {
      this.sinceDate = null;
      this.untilDate = null;
      if (this.exploreJson) {
        this.exploreJson.form_data.since = '';
        this.exploreJson.form_data.until = '';
        this.exploreJson = null;
      }
    }
    this.exploreJson = null;
    if (this.isFilter) {
    }
    this.isFilter = false;
    this.loaderService.setSpesifikID([id]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  onDownload(id) {
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
      // console.log(hiddenPopUp);
      for (let i = 0; i < hiddenPopUp.length; i++) {
        card.appendChild(hiddenPopUp[i]);
      }
    }
  }

  reformatTableCell(exploreJson) {
    let locale = exploreJson.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(this.formaterNumber[locale]);
    if (!exploreJson.form_data.table_grid_view) this.columnNumberList = [];
    let colNumberList = [];
    let cardId = this.isView ? 'myDiv-' + this.cardID : 'cardChart';
    let card = $('#' + cardId);
    for (let i = 0; i < this.columns.length; i++) {
      let isNumber = isNaN(this.records[0][this.columns[i]]);
      if (!isNumber && this.records[0][this.columns[i]] !== '') colNumberList.push(this.columns[i]);
    }

    if (exploreJson.form_data.custom_column_format_arr && exploreJson.form_data.custom_column_format_arr.length > 0) {
      for (let i = 0; i < exploreJson.form_data.custom_column_format_arr.length; i++) {
        let column = exploreJson.form_data.custom_column_format_arr[i].column;
        let format = exploreJson.form_data.custom_column_format_arr[i].format;
        let format_type = exploreJson.form_data.custom_column_format_arr[i].format_type;
        let reformatCol = column.replace(/[`~!\s@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '-');
        for (let j = 0; j < this.records.length; j++) {
          if (format_type) {
            if (format_type === 'number') {
              let number = this.records[j][column];
              let formatedNumber = reformatNumber(number, format, this.explore, d3);
              this.records[j][column] = formatedNumber;

              let cellClass = card.find('.mat-cell.mat-column-' + reformatCol);
              cellClass.css('display', 'flex');
              cellClass.css('justify-content', 'flex-end');
            } else if (format_type === 'date') {
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

  toggleColumn(index, colName) {
    let removeColIndex = this.displayedColumns.indexOf(colName);
    if (removeColIndex > -1) {
      this.displayedColumns.splice(removeColIndex, 1);
      $('#ToggleBtn-' + colName).addClass('active');
    } else {
      this.displayedColumns.splice(index, 0, colName);
      this.displayedColumns.join();
      $('#ToggleBtn-' + colName).removeClass('active');
    }
  }

  viewToggle() {
    if (this.isViewToggle) this.isViewToggle = false;
    else this.isViewToggle = true;
  }

  yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type, opt?, index?) {
    chosenDate.set({ date: 1 });
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    else this.untilDateComparison[index] = chosenDate;

    let result = year_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    this.untilDateComparison[index] = this.untilDateComparison[index]
      ? moment(this.untilDateComparison[index]).format('YYYY-MM-DDTHH:mm:ss')
      : null;
    datepicker.close();

    if (this.sinceDate != null && this.untilDate != null) this.OnDatePickerFilter();
    if (type == 'until_comparison') this.OnDatePickerFilter(type, opt, index, 'year');
  }

  monthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type, opt?, index?) {
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    else this.untilDateComparison[index] = chosenDate;

    let result = month_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    this.untilDateComparison[index] = this.untilDateComparison[index]
      ? moment(this.untilDateComparison[index]).format('YYYY-MM-DDTHH:mm:ss')
      : null;
    datepicker.close();

    if (this.sinceDate != null && this.untilDate != null) this.OnDatePickerFilter();
    if (type == 'until_comparison') this.OnDatePickerFilter(type, opt, index, 'month');
  }

  datePickerHandler(chosenDate: Moment, type, opt?, index?) {
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    else this.untilDateComparison[index] = chosenDate;

    let result = date_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    this.untilDateComparison[index] = this.untilDateComparison[index]
      ? moment(this.untilDateComparison[index]).format('YYYY-MM-DDTHH:mm:ss')
      : null;

    if (this.sinceDate != null && this.untilDate != null) this.OnDatePickerFilter();
    if (type == 'until_comparison') this.OnDatePickerFilter(type, opt, index, 'date');
  }

  onChangeFilterComparison(latest_date, column_filter?, opt?, index?) {
    this.base_column_filters[index] = [];
    this.base_column_filters[index] = setBaseColumnDate(latest_date, column_filter, opt);
    for (let i = 0; i < this.explore.form_data.base_columns.length; i++) {
      this.explore.form_data.base_columns[i].filters = this.base_column_filters[i];
    }
  }

  async OnDatePickerFilter(type?, column?, index?, filter_date_type?) {
    this.isOnDateFilter = true;
    var url = `api/chart/explore_json/`;
    if (type != 'until_comparison') {
      this.explore.form_data.since = moment(this.sinceDate).format('YYYY-MM-DDTHH:mm:ss');
      this.explore.form_data.until = moment(this.untilDate).format('YYYY-MM-DDTHH:mm:ss');
    } else {
      // filter by base column filter date
      this.onChangeFilterComparison(this.untilDateComparison[index], column, filter_date_type, index);
    }
    var param = {
      form_data: JSON.stringify(
        this.isFilter
          ? Object.assign({}, this.explore.form_data, {
              extra_filters: this.extraFilter,
            })
          : this.explore.form_data
      ),
    };
    let exploreJson = await this._apicall.loadPostData(url, param);
    this.exploreJson = exploreJson ? (exploreJson.response ? exploreJson.response : exploreJson) : exploreJson;
    this.noData = this.exploreJson ? false : true;
    this.ngOnInit();
  }

  sortData(event) {
    if (event.direction === '') event.direction = 'asc';
    let locale = this.explore.form_data.format_number_id ? 'ID' : 'EN';
    let colNumber = this.explore.form_data.custom_column_format_arr.filter((x) => x.column === event.active)[0];
    let sortingValueArr = [];
    if (colNumber) {
      if (colNumber.format === '.3s') {
        sortingValueArr = sortNumber(this.records, event, locale, this.records);
      } else {
        for (let i = 0; i < this.records.length; i++) {
          let splitKey = colNumber.format === '$,.2f' ? (locale === 'ID' ? 'Rp' : '$') : '%';
          let num_arr = this.records[i][event.active].split(splitKey);
          let splited_num =
            colNumber.format === '$,.2f' ? num_arr[1] : colNumber.format === ',.2%' ? num_arr[0] : num_arr[0];
          let num = locale === 'ID' ? splited_num.replace(/\./g, '') : splited_num.replace(/,/g, '');
          num = num.replace(/,/g, '.');
          this.records[i][event.active] = Number(num);
        }
        this.records = sort_array_object(this.records, event.active, event.direction);
      }
    } else {
      this.records = sort_array_object(this.records, event.active, event.direction);
    }

    if (colNumber) {
      if (colNumber.format !== '.3s') {
        for (let i = 0; i < this.records.length; i++) {
          let num;
          if (colNumber.format === ',.2%') {
            num =
              locale === 'ID'
                ? this.records[i][event.active].toString().replace(/\./g, ',')
                : this.records[i][event.active].toString();
            let num_arr_decimal = locale === 'ID' ? num.split(',') : num.split('.');
            if (num_arr_decimal.length < 2) num = locale === 'ID' ? num + ',00' : num + '.00';
            this.records[i][event.active] = num + '%';
          } else {
            num = this.records[i][event.active];
            this.records[i][event.active] = reformatNumber(num, colNumber.format, this.explore, d3);
          }
        }
      } else {
        this.records = sortingValueArr;
      }
    }
    this.dataSource = undefined;
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.records;
    this.dataSource.paginator = this.paginator;
    this.pagelength = this.records.length;
    this.cdr.detectChanges();
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
      // console.log(hiddenPopUp);
      for (let i = 0; i < hiddenPopUp.length; i++) {
        $('body').append(hiddenPopUp[i]);
      }

      this.isFullscreen = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onResize() {}
}
