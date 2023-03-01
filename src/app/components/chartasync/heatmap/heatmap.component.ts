import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { ApiService, LayoutConfigService, LoaderService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
import * as _moment from 'moment';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import {
  on_full_screen_id,
  get_position,
  year_picker_handler,
  month_picker_handler,
  date_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  parseDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { setConfigChart } from './helperHeatmap';
// import { parseDate } from '../bubble/helperbubble.component';

const moment = _rollupMoment || _moment;
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
  selector: '[pq-heatmap-async]',
  templateUrl: './heatmap.component.html',
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
export class HeatmapComponent implements OnInit {
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
  mycharts: any;
  chartOption: EChartsOption;
  theme: string;
  echartsInstance: any;
  det: any;
  dragHandle = false;
  dragBounds = true;
  canDownload = false;
  canOverwrite = false;
  activeClass = '';
  meId$: any = [];
  noData = false;
  isFullscreen: boolean = false;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  colorPalette = [];
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {}
  findExploreJsonWhenUndefined = async () => {
    let config = {};
    let formdata = {
      form_data: {},
    };
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    this.url = exploreUrl;

    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
      formdata.form_data = this.fdata;
      this.formdata = formdata;
    } else {
      this.formdata = await helperGetExplorerChart(
        this.formdata,
        exploreJsonUrl,
        this.token,
        exploreUrl,
        this._apicall,
        this.fdata
      );
    }
    let param: any = {
      form_data: this.formdata.form_data,
    };

    param = this.setFilter(param);
    param = this.setInitialDate(param);

    param.form_data = JSON.stringify(param.form_data);
    let exploreJson = await helperGetExplorerChart(
      this.formdata,
      exploreJsonUrl,
      this.token,
      '',
      this._apicall,
      this.fdata,
      param
    );
    if (exploreJson) {
      this.explore = await helperGetExplorerChart(this.explore, '', this.token, exploreUrl, this._apicall, this.fdata);
      if (this.token) this.formdata = this.explore;

      config = await this.getConfigChart(exploreJson);
    } else {
      this.noData = true;
    }
    return config;
  };
  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    const config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    await this._apicall.get('/assets/data/color_palette.json').subscribe(async (result) => {
      for (var i = 0; i < result.length; i++) {
        this.colorPalette['palette' + (i + 1)] = result[i];
      }
      // for has chartId

      if (!this.exploreJson) {
        // set result configurasi dari exploreJson ke series chart
        this.data = await this.findExploreJsonWhenUndefined();
      } else {
        if (!this.isFilter) {
          this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
          this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
        }
        this.data = await this.getConfigChart(this.exploreJson);
      }

      //set initial chart blank
      if (this.isFilter) {
        this.formdata.form_data.initial_chart_blank = false;
      }

      let me = this;
      if (!me.noData) {
        var themes =
          this.formdata.form_data.color_scheme != 'bnbColors' ? this.formdata.form_data.color_scheme : 'palette1';
        let colors = [];
        if (this.data.series.length) {
          let array = this.data.series;
          for (let index = 0; index < array.length; index++) {
            colors.push(this.colorPalette[themes][Math.floor(Math.random() * this.colorPalette[themes].length)]);
          }
        }

        if (this.formdata) {
          this.canDownload = this.formdata.canDownload;
          this.canOverwrite = this.formdata.canOverwrite;
        }
        this.theme = themes ? themes : 'pallete6';
        if (skin == 'light') {
          this.theme = this.theme + 'L';
        }
        this.chartOption = this.data;

        if (this.formdata.form_data.random_color) {
          this.chartOption = {
            ...this.chartOption,
            color: colors.length > 0 ? colors : [],
          };
        }
      }
      if (this.formdata && this.formdata.form_data && this.formdata.form_data.is_hide_togle_filter) {
        this.onToggleFilter(this.myChartID);
      }
      this.det = setTimeout(function () {
        me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
        me.cdr.detectChanges();
      }, 100);
    });
  }

  setInitialDate(param) {
    if (
      param &&
      param.form_data.initial_date_filter &&
      param.form_data.initial_date_filter &&
      param.form_data.initial_date_filter &&
      !this.isDateFilter &&
      !this.isInitialDateFilter &&
      !this.noData
    ) {
      if (param.form_data.initial_date_filter === 'current_date') {
        let currentDate = new Date();
        if (param.form_data.filter_date_type === 'date') {
          this.sinceDate = moment(currentDate).startOf('day');
          this.untilDate = moment(currentDate).endOf('day');
        } else if (param.form_data.filter_date_type === 'month') {
          this.sinceDate = moment(currentDate).startOf('month');
          this.untilDate = moment(currentDate).endOf('month');
        } else if (param.form_data.filter_date_type === 'year') {
          this.sinceDate = moment(currentDate).startOf('year').startOf('month');
          this.untilDate = moment(currentDate).endOf('year').endOf('month');
        }
      } else {
        if (param.form_data.filter_date_type === 'date') {
          this.sinceDate = moment(param.latest_date).startOf('day');
          this.untilDate = moment(param.latest_date).endOf('day');
        } else if (param.form_data.filter_date_type === 'month') {
          this.sinceDate = moment(param.latest_date).startOf('month');
          this.untilDate = moment(param.latest_date).endOf('month');
        } else if (param.form_data.filter_date_type === 'year') {
          this.sinceDate = moment(param.latest_date).startOf('year').startOf('month');
          this.untilDate = moment(param.latest_date).endOf('year').endOf('month');
        }
      }
      this.formdata.form_data.since = moment(this.sinceDate).format('YYYY-MM-DDTHH:mm:ss');
      this.formdata.form_data.until = moment(this.untilDate).format('YYYY-MM-DDTHH:mm:ss');
    }
    return param;
  }

  setFilter(param) {
    // param = {
    //   form_data: JSON.stringify(
    //     this.isFilter
    //       ? Object.assign({}, this.fdata.form_data, {
    //           extra_filters: this.extraFilter,
    //         })
    //       : this.formdata.form_data
    //   ),
    // };

    if (this.isFilter && this.extraFilter.length > 0) {
      for (var i = 0; i < this.extraFilter.length; i++) {
        if (this.extraFilter[i].col === '__from') {
          this.sinceDate = this.extraFilter[i].val;
        } else if (this.extraFilter[i].col === '__to') {
          this.untilDate = this.extraFilter[i].val;
        } else {
          let filteredDate: any;
          let value = Array.isArray(this.extraFilter[i].val) ? this.extraFilter[i].val[0] : this.extraFilter[i].val;
          let isUtc = parseDate(value);
          if (isUtc) {
            filteredDate = moment(value).format('YYYY-MM-DD');
            this.sinceDate = moment(filteredDate).startOf('day');
            this.untilDate = moment(filteredDate).endOf('day');
          }
        }
      }
    }
    if (this.isFilter && (this.isDateFilter || this.isInitialDateFilter)) {
      this.formdata.form_data.since = '';
      this.formdata.form_data.until = '';
      // param = {
      //   form_data: JSON.stringify(
      //     this.isFilter
      //       ? Object.assign({}, this.fdata.form_data, {
      //           extra_filters: this.extraFilter,
      //         })
      //       : this.formdata.form_data
      //   ),
      // };
    }

    return param;
  }

  onChartInit(e: any) {
    this.echartsInstance = e;
  }

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
      this.formdata.form_data.extra_filters = this.extraFilter;
    }
    this.download.emit({ id: id, url: this.url, data: this.formdata });
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

  onFullscreen(cardId) {
    this.isFullscreen = true;
    on_full_screen_id('myDiv-' + cardId);
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  async getConfigChart(data) {
    let locale = data.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(this.formaterNumber[locale]);
    let config = {};
    let _this = this;
    if (!data) this.noData = true;
    else config = await setConfigChart(data, this.colorPalette, _this.formdata, d3);
    return config;
  }
  yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    chosenDate.set({ date: 1 });
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.untilDate;
    let result = year_picker_handler(moment, this.sinceDate, this.untilDate, this.formdata.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  yearMonthPickerHandler(normalizedYear: Moment, type) {}

  monthMonthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.untilDate;
    let result = month_picker_handler(moment, this.sinceDate, this.untilDate, this.formdata.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  datePickerHandler(chosenDate: Moment, type) {
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.sinceDate;
    let result = date_picker_handler(moment, this.sinceDate, this.untilDate, this.formdata.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    this.OnDatePickerFilter();
  }

  async OnDatePickerFilter() {
    if (this.sinceDate != null && this.untilDate != null) return;
    var url = `api/chart/explore_json/`;
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

    var param = {
      form_data: JSON.stringify(
        this.isFilter
          ? Object.assign({}, this.explore.form_data, {
              extra_filters: this.extraFilter,
            })
          : this.explore.form_data
      ),
    };
    let exploreJsonResult = await this._apicall.loadPostData(url, param); // ask
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.noData = this.exploreJson === undefined;
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
    if (window.innerHeight === screen.height) {
      this.isFullscreen = true;
    } else {
      this.isFullscreen = false;
    }
  }
}
