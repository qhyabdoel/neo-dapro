import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Output,
  ElementRef,
  EventEmitter,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService, LayoutConfigService, LoaderService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
import { DomSanitizer, SafeHtml, SafeScript } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import {
  date_picker_handler,
  extract_date_filter,
  get_position,
  month_picker_handler,
  year_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  getUrl,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  parseDate,
  reformatNumber,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';

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

@Component({
  selector: '[pq-pivot-async]',
  templateUrl: './pivot2.component.html',
  styleUrls: ['./pivot.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class Pivot2Component implements OnInit {
  @Input() cardID: string;
  @Input() myChartID: string;
  @Input() title: string;
  @Input() isTemplate: string;
  @Input() rowPosition: number;
  @Input() fdata: any;
  @Input() token: any;
  @Input() url: string;
  @Input() slug: string;
  @Input() mapGeoJSON: any;
  @Input() index: number;
  @Input() themes: any;
  @Input() autoResize: any;
  @Input() columns: any;
  @Input() records: any;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() isDrag;
  @Input() isView: boolean;
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
  chartOption: any;
  sizeNumber: string;
  sizeText: string;
  theme: string;
  echartsInstance: any;
  det: any;
  dragHandle = false;
  dragBounds = true;
  canDownload = false;
  canOverwrite = false;
  filterList: any = [];
  dataFilter: any = [];
  activeClass = '';
  date_filter = false;
  instant_filtering = true;
  meId$: any = [];
  myHtml: SafeHtml;
  myScript: SafeScript;
  noData: boolean = false;
  isFullscreen: boolean = false;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  //isResultNotFound: boolean = false;
  filter_granularity_sqla: string;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  constructor(
    private elementRef: ElementRef,
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private _sanitizer: DomSanitizer,
    private loaderService: LoaderService
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

    let param = {
      form_data: explore.form_data,
    };
    param = this.setFilter(param, explore);
    param = setInitialDate(
      param,
      explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      null,
      this.explore,
      this.sinceDate,
      this.untilDate
    );
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
      this.data = exploreJson;
    } else {
      this.noData = true;
    }
  };
  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    const config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    let me = this;

    // for has chartId
    if (!this.exploreJson) {
      await this.findExploreJsonWhenUndefined();
    } else {
      let exploreUrl = getUrl(this.exploreJson);
      let exploreResult = await this._apicall.loadGetData(exploreUrl);
      let explore = exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
      this.explore = this.formdata ? this.formdata : this.explore ? this.explore : explore;
      this.data = this.exploreJson;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
    }

    //set initial chart blank
    if (this.isFilter) {
      this.explore.form_data.initial_chart_blank = false;
    }

    if (this.data) {
      this.noData = false;
      var themes =
        this.explore.form_data.color_scheme != 'bnbColors' ? this.explore.form_data.color_scheme : 'palette1';
      this.theme = themes ? themes : 'palette1';
      if (skin == 'light') this.theme = this.theme + 'L';
      this.myHtml = this._sanitizer.bypassSecurityTrustHtml(
        this.data.data.html.replace('dataframe table', 'dataframe')
      );
      setTimeout(function () {
        let locale = me.explore.form_data.format_number_id ? 'ID' : 'EN';
        d3.formatDefaultLocale(me.formaterNumber[locale]);
        me.reformatNumberTable(me.explore, me.data.data);
        $('.dataframe').DataTable({
          paging: false,
          order: [],
        });
        me.cdr.detectChanges();
      }, 500);
    } else {
      this.noData = true;
    }

    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter(this.myChartID);
    }
    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
      me.cdr.detectChanges();
    }, 100);

    this.isView = true;
  }

  //Configuration chart function
  setFilter(param, explore) {
    if (this.isFilter) param.form_data = Object.assign({}, explore.form_data, { extra_filters: this.extraFilter });

    if (this.isFilter && this.extraFilter.length > 0) {
      let dateFilter = extract_date_filter(moment, this.extraFilter);
      this.sinceDate = dateFilter[0];
      this.untilDate = dateFilter[1];
      this.filter_granularity_sqla = dateFilter[2];
      if (dateFilter[0] && dateFilter[1]) this.isDateFilter = true;
    }
    if (this.isFilter && (this.isDateFilter || this.isInitialDateFilter)) {
      this.explore.form_data.since = '';
      this.explore.form_data.until = '';
      param.form_data.since = '';
      param.form_data.until = '';
    }
    return param;
  }

  // setInitialDate(param, explore) {
  //   if (
  //     explore &&
  //     explore.form_data.initial_date_filter != null &&
  //     explore.form_data.initial_date_filter != '' &&
  //     explore.form_data.initial_date_filter &&
  //     !this.isDateFilter &&
  //     !this.isInitialDateFilter
  //   ) {
  //     let initialDate =
  //       explore.form_data.initial_date_filter === 'current_date' ? moment(new Date()) : moment(explore.latest_date);
  //     let result;
  //     if (explore.form_data.filter_date_type === 'date')
  //       result = date_picker_handler(moment, undefined, initialDate, 'date_picker');
  //     else if (explore.form_data.filter_date_type === 'month')
  //       result = month_picker_handler(moment, undefined, initialDate, 'date_picker');
  //     else if (explore.form_data.filter_date_type === 'year')
  //       result = year_picker_handler(moment, undefined, initialDate, 'date_picker');
  //     param.form_data.since = this.explore.form_data.since = this.sinceDate = result[0];
  //     param.form_data.until = this.explore.form_data.until = this.untilDate = result[1];
  //     return param;
  //   }
  //   return param;
  // }
  //End configuration chart function

  async reformatNumberTable(explore, data) {
    const container = $('.pivot-container');
    let localVar = this;
    // jQuery hack to format number
    container.find('table tbody tr').each(function () {
      $(this)
        .find('td')
        .each(function (i) {
          const tdText = $(this)[0].textContent;
          let isUtc = parseDate(tdText);
          if (!isUtc && !isNaN(tdText) && tdText !== '') {
            let num = reformatNumber(tdText, explore.form_data.number_format, localVar.explore, d3);
            $(this)[0].innerHtml = num;
            $(this)[0].textContent = num;
            $(this).css('text-align', 'right');
          } else if (isUtc && tdText !== '') {
            let formatedDate = moment(tdText).format('DD/MM/YYYY');
            $(this)[0].innerHtml = formatedDate;
            $(this)[0].textContent = formatedDate;
          }
        });
      $(this)
        .find('th')
        .each(function (i) {
          const tdText = $(this)[0].textContent;
          let isUtc = parseDate(tdText);
          if (!isUtc && !isNaN(tdText) && tdText !== '') {
            let num = reformatNumber(tdText, explore.form_data.number_format, localVar.explore, d3);
            $(this)[0].innerHtml = num;
            $(this)[0].textContent = num;
          } else if (isUtc && tdText !== '') {
            let formatedDate = moment(tdText).format('DD/MM/YYYY');
            $(this)[0].innerHtml = formatedDate;
            $(this)[0].textContent = formatedDate;
          }
        });
    });

    // reformat all di head & body
    container.find('table thead tr').each(function () {
      $(this)
        .find('th')
        .each(function (i) {
          const tdText = $(this)[0].textContent;
          if (!isNaN(tdText) && tdText !== '') {
            let num = reformatNumber(tdText, explore.form_data.number_format, localVar.explore, d3);
            $(this)[0].innerHtml = num;
            $(this)[0].textContent = num;
          }
        });
    });
  }
  addFilter(e) {}

  clearFilter() {}

  removeFilter(e) {}

  onRefresh(id) {
    if (this.sinceDate && this.untilDate) {
      this.sinceDate = null;
      this.untilDate = null;
      if (this.exploreJson) {
        this.exploreJson.form_data.since = '';
        this.exploreJson.form_data.until = '';
        this.exploreJson = null;
      }
      this.noData = false;
    }
    this.loaderService.setSpesifikID([id]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  onChartWidth(cls) {
    let card = document.getElementById(this.cardID);
    card.removeAttribute('class');
    card.className = cls;
    this.activeClass = cls;
    this.width.emit(get_position(cls));
    this.cdr.detectChanges();
  }

  onChartHeight(height) {
    let card = document.getElementById('myDiv-' + this.cardID);
    card.style.height = height + 'vh';
    this.height.emit(height);
    this.cdr.detectChanges();
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

  onToggleFilter(id) {
    let cardId = this.cardID;

    $('#' + cardId + ' .containerList').toggleClass('d-none');
    $('#' + cardId + ' .demo-chart').toggleClass('h-85');
    this.cdr.detectChanges();
  }

  onFullscreen() {
    let card = document.getElementById('myDiv-' + this.cardID);
    if (card.requestFullscreen) {
      card.requestFullscreen();
    }
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
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
    var url = `api/chart/explore_json/`;
    this.explore.form_data.since = this.sinceDate;
    this.explore.form_data.until = this.untilDate;
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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.echartsInstance) {
      this.echartsInstance.resize();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this.cdr.detectChanges();
  }

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange() {
    this.isFullscreen = window.innerHeight === screen.height ? true : false;
  }
}
