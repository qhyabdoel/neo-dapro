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
  extract_date_filter,
  on_full_screen_id,
  get_position,
  year_picker_handler,
  month_picker_handler,
  date_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import * as collorPalleteFile from 'src/assets/data/color_palette.json';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  getUrl,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { setConfigChart } from './helperSunburst';

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
  selector: '[pq-sunburst-async]',
  templateUrl: './sunburst.component.html',
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
export class SunburstComponent implements OnInit {
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
  meId$: any;
  mappingExtraFilter: any;
  filter_granularity_sqla: string;
  noData = false;
  isFullscreen: boolean = false;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  colorPalette = [];
  colorPaletteJsonFile: any = (collorPalleteFile as any).default;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {}
  findExploreJsonWhenUndefined = async () => {
    let configChart = {};
    let explore = {
      form_data: {},
    };
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    this.url = exploreUrl;
    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
    }
    this.explore = await helperGetExplorerChart(this.explore, '', this.token, exploreUrl, this._apicall, this.fdata);
    this.explore = this.formdata ? this.formdata : this.explore;
    explore = this.explore;

    if (this.explore) {
      this.canDownload = this.explore.canDownload;
      this.canOverwrite = this.explore.canOverwrite;
    }

    let param = {
      form_data: explore.form_data ? explore.form_data : this.explore.form_data,
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
      configChart = await this.getConfigChart(exploreJson);
    } else {
      this.noData = true;
    }
    return configChart;
  };
  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    const config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    this.mappingExtraFilter = [];

    for (var i = 0; i < this.colorPaletteJsonFile.length; i++) {
      this.colorPalette['palette' + (i + 1)] = this.colorPaletteJsonFile[i];
    }

    // for has chartId

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      this.data = await this.findExploreJsonWhenUndefined();
    } else {
      let explore = await helperGetExplorerChart(
        this.explore,
        '',
        this.token,
        getUrl(this.exploreJson),
        this._apicall,
        this.fdata
      );
      this.explore = this.formdata ? this.formdata : this.explore ? this.explore : explore;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
      // set result configurasi dari exploreJson ke series chart
      this.data = await this.getConfigChart(this.exploreJson);
    }

    //set initial chart blank
    if (this.isFilter) {
      this.explore.form_data.initial_chart_blank = false;
    }

    let me = this;
    if (!me.noData) {
      var themes =
        this.explore.form_data.color_scheme != 'bnbColors' ? this.explore.form_data.color_scheme : 'palette1';
      let colors = [];
      if (this.data.series.length) {
        let array = this.data.series;
        for (let index = 0; index < array.length; index++) {
          colors.push(this.colorPalette[themes][Math.floor(Math.random() * this.colorPalette[themes].length)]);
        }
      }

      this.theme = themes ? themes : 'pallete6';
      if (skin == 'light') this.theme = this.theme + 'L';
      this.chartOption = this.data;

      if (this.explore.form_data.random_color) {
        this.chartOption = {
          ...this.chartOption,
          color: colors.length > 0 ? colors : [],
        };
      }
    }
    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter(this.myChartID);
    }
    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
      me.cdr.detectChanges();
    }, 100);
  }

  //Configuration chart functin
  setFilter(param, explore) {
    if (this.isFilter) param.form_data = Object.assign({}, explore.form_data, { extra_filters: this.extraFilter });

    //check if there is a date in extra filter
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

  setInitialDate(param, explore) {
    if (
      explore &&
      explore.form_data.initial_date_filter &&
      explore.form_data.initial_date_filter &&
      explore.form_data.initial_date_filter &&
      !this.isDateFilter &&
      !this.isInitialDateFilter
    ) {
      let initialDate =
        explore.form_data.initial_date_filter === 'current_date' ? moment(new Date()) : moment(explore.latest_date);
      let result;
      if (explore.form_data.filter_date_type === 'date')
        result = date_picker_handler(moment, undefined, initialDate, 'date_picker');
      else if (explore.form_data.filter_date_type === 'month')
        result = month_picker_handler(moment, undefined, initialDate, 'date_picker');
      else if (explore.form_data.filter_date_type === 'year')
        result = year_picker_handler(moment, undefined, initialDate, 'date_picker');
      param.form_data.since = this.explore.form_data.since = this.sinceDate = result[0];
      param.form_data.until = this.explore.form_data.until = this.untilDate = result[1];
      return param;
    }
    return param;
  }

  onChartInit(e: any) {
    this.echartsInstance = e;
    let me = this;
    if (this.isTemplate) {
      this.echartsInstance.on('click', function (params) {
        me.onFilter(params);
      });
    }
  }

  ngAfterViewInit() {
    if (this.echartsInstance) {
      this.echartsInstance.resize();
    }
  }

  onFilter(params) {
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    let mydata = {};
    let filterArr = [];
    let urlLinkTo = '/api/dashboard/view?link=';
    let array = this.mappingExtraFilter;

    let split = params.name.split(' - ');
    let splitIndex = 0;

    if (this.explore.form_data.groupby.length > 0) {
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        for (let i = 0; i < params.treePathInfo.length; i++) {
          if (params.treePathInfo[i].name == element.key) {
            mydata[element.value] = [
              { filter: element.key, id: split[splitIndex], metric: 2, text: split[splitIndex] },
            ];
          }
        }
      }
    }

    //Add another filter key from filterbox
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
          mydata[key] = filterArr;
        } else {
          selectedColumn = this.extraFilter[i].val;
          mydata[key] = [{ filter: selectedColumn, id: selectedColumn, metric: 2, text: selectedColumn }];
        }
      }
    }

    //Add another filter key from filter setting in chart
    if (this.explore.form_data.filters.length > 0) {
      for (let i = 0; i < this.explore.form_data.filters.length; i++) {
        let key = this.explore.form_data.filters[i].col;
        let selectedColumn;
        if (mydata[key] && mydata[key].length > 0) {
          selectedColumn = this.explore.form_data.filters[i].val;
          let filterObj = {
            filter: selectedColumn,
            id: selectedColumn,
            metric: 2,
            text: selectedColumn,
            op: this.explore.form_data.filters[i].op,
          };
          mydata[key].push(filterObj);
        } else {
          selectedColumn = this.explore.form_data.filters[i].val;
          mydata[key] = [
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
        data: mydata,
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
    let config = null;
    if (!data) {
      this.noData = true;
    } else {
      config = await setConfigChart(data, this.explore, this.colorPalette, d3);
      this.mappingExtraFilter = config.mappingExtraFilter;
    }
    return config;
  }

  yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    chosenDate.set({ date: 1 });
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.untilDate;
    let result = year_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  yearMonthPickerHandler(normalizedYear: Moment, type) {}

  monthMonthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.untilDate;
    let result = month_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  datePickerHandler(chosenDate: Moment, type) {
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.sinceDate;
    let result = date_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
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
    this.exploreJson = await helperGetExplorerChart(this.explore, '', this.token, url, this._apicall, this.fdata);
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
