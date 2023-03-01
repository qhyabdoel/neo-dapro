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
import { ApiService, LayoutConfigService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
import * as _moment from 'moment';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import {
  date_picker_handler,
  extract_date_filter,
  get_format_date,
  get_position,
  month_picker_handler,
  on_full_screen_id,
  reformat_number,
  validate_date,
  year_picker_handler,
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
  selector: '[pq-scatter-async]',
  templateUrl: './scatter2.component.html',
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
export class Scatter2Component implements OnInit {
  @Input() cardID: string;
  @Input() myChartID: string;
  @Input() data: any;
  @Input() themes: any;
  @Input() title: string;
  @Input() isTemplate: string;
  @Input() rowPosition: number;
  @Input() url: string;
  @Input() slug: string;
  @Input() mapGeoJSON: any;
  @Input() index: number;
  @Input() autoResize: any;
  @Input() columns: any;
  @Input() records: any;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() isDrag;
  @Input() isView: boolean;
  @Input() formdata: any;
  @Input() token: any;
  @Input() fdata: any;
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
  meId$: any;
  dragHandle = false;
  dragBounds = true;
  canDownload = false;
  canOverwrite = false;
  activeClass: string = '';
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
    private _apicall: ApiService
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
    if (exploreJson !== undefined) {
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

    for (var i = 0; i < this.colorPaletteJsonFile.length; i++) {
      this.colorPalette['palette' + (i + 1)] = this.colorPaletteJsonFile[i];
    }
    // for has chartId

    if (this.exploreJson == undefined) {
      // set result configurasi dari exploreJson ke series chart
      this.data = await this.findExploreJsonWhenUndefined();
    } else {
      let exploreUrl = getUrl(this.exploreJson);
      let exploreResult = await this._apicall.loadGetData(exploreUrl);
      let explore = exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
      this.explore = this.formdata ? this.formdata : this.explore ? this.explore : explore;
      let exploreJson = this.exploreJson;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
      this.data = await this.getConfigChart(exploreJson);
    }

    //set initial chart blank
    if (this.isFilter) this.explore.form_data.initial_chart_blank = false;

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

      this.theme = this.themes ? this.themes : 'palette1';
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
      me.cdr.detectChanges();
    }, 100);
  }

  //Configuration chart function
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

  // setInitialDate(param, explore) {
  //   if (
  //     explore !== undefined &&
  //     explore.form_data.initial_date_filter != null &&
  //     explore.form_data.initial_date_filter != '' &&
  //     explore.form_data.initial_date_filter !== undefined &&
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

  onChartInit(e: any) {
    this.echartsInstance = e;
    this.echartsInstance.resize();
  }

  onRefresh(id) {
    if (this.sinceDate !== undefined && this.untilDate != undefined) {
      this.sinceDate = null;
      this.untilDate = null;
      if (this.exploreJson !== undefined) {
        this.exploreJson.form_data.since = '';
        this.exploreJson.form_data.until = '';
        this.exploreJson = null;
      }
      this.noData = false;
    }
    this.refresh.emit({
      id: id,
      index: this.index ? this.index : 0,
      url: this.url ? this.url : '',
      mapGeoJSON: this.mapGeoJSON ? this.mapGeoJSON : null,
    });
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

  //parse date
  parseDate(dateStr) {
    return validate_date(dateStr);
  }

  reformatNumber(num, numberFormat) {
    let locale = this.explore.form_data.format_number_id ? 'ID' : 'EN';
    let localeStr;
    if (locale === 'ID') localeStr = 'id-ID';
    else if (locale === 'EN') localeStr = 'en-US';
    let value = reformat_number(d3, num, numberFormat, locale, localeStr);
    return value;
  }

  setConfigChart(data, typeChart) {
    let pointer = this;
    if (data.data == undefined) data = pointer.explore;
    var tf = data.form_data.y_axis_format;
    var f = d3.format(tf ? (tf == ',f' ? ',' : tf) : ',');
    var total = 0;
    var series = [];
    var legendData = [];
    var seriesData = [];
    var xAxisData = [];
    var yAxisData = [];
    var itemStyle = {
      // style by default
      normal: {},
      // highlighted style when mouse hovered
      emphasis: {
        opacity: 0.7,
      },
    };
    var dataZoom = [];
    var xAxis = {
      type: 'category',
      data: [],
      name: data.form_data.x_axis_label ? data.form_data.x_axis_label : '',
      nameLocation: 'center',
      nameGap: 35,
      show: true,
      position: 'bottom',
    };
    var yAxis = {
      type: 'value',
      data: [],
      name: data.form_data.y_axis_label ? data.form_data.y_axis_label : '',
      nameLocation: 'center',
      nameGap: 35,
      axisLabel: {
        formatter: function (value) {
          value = pointer.reformatNumber(value, data.form_data.y_axis_format);
          return value;
        },
      },
      show: true,
      position: 'left',
    };
    let scheme =
      data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
        ? data.form_data.color_scheme
        : 'palette1';

    let colorPalette = this.colorPalette[scheme] || [];

    // mapping data only dots
    var yFormat = d3.format(data.form_data.y_axis_format);

    legendData = data.data.dots[0].key;

    var me = data.data.dots[0].values;
    let seriesBubble = {
      name: data.data.dots[0].key,
      data: [],
      type: 'scatter',
      symbol: 'circle',
      symbolSize: 10,
      emphasis: {
        label: {
          show: true,
          position: 'left',
          fontSize: 16,
        },
      },
      itemStyle: {
        color: function () {
          return colorPalette[Math.floor(Math.random() * colorPalette.length)];
        },
      },
    };
    for (var j = 0; j < me.length; j++) {
      let bubbleValue = [];
      let val = '';
      if (data.form_data.x_axis_format == 'smart_date') {
        xAxis.data.push(moment(me[j].x).format('MMM YYYY'));
        val = moment(me[j].x).format('MMM YYYY');
      } else {
        let formatdate = get_format_date(data.form_data.x_axis_format);
        xAxis.data.push(moment(me[j].x).format(formatdate));
        val = moment(me[j].x).format(formatdate);
      }

      let val2 =
        yFormat != undefined
          ? data.form_data.y_axis_format == '.3s'
            ? pointer.reformatNumber(me[j].y, data.form_data.y_axis_format)
            : yFormat(me[j].y).replace('m', '').replace('M', '')
          : String(me[j].y).replace('m', '').replace('M', '');

      if (data.form_data.y_log_scale) {
        val2 = val2 > 0 ? Math.log10(val2) : 0;
      }
      bubbleValue.push(val);
      bubbleValue.push(parseFloat(val2));
      seriesBubble.data.push(bubbleValue);
    }

    if (data.form_data.x_log_scale) {
      xAxis = Object.assign({}, xAxis, {
        type: 'log',
        logBase: 10,
      });
    }
    xAxisData.push(xAxis);
    yAxisData.push(yAxis);
    seriesData.push(seriesBubble);
    series = seriesData;

    return {
      showLegend: data.form_data.show_legend ? data.form_data.show_legend : true,
      showControls: data.form_data.show_controls ? data.form_data.show_controls : true,
      legendData: legendData,
      dataZoom: dataZoom,
      title: '',
      subtitle: '',
      lefttitle: 'center',
      legendorient: 'horizontal',
      xAxis: xAxisData,
      yAxis: yAxisData,
      contrastColor: '#eee',
      series: series,
      total: total,
      typeChart: typeChart,
    };
  }

  async getConfigChart(data) {
    let locale = data.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(this.formaterNumber[locale]);
    let config = {};
    if (data == undefined) {
      this.noData = true;
    } else {
      config = await this.setConfigChart(data, data.form_data.viz_type);
    }
    return config;
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
    let exploreJson = await this._apicall.loadPostData(url, param);
    this.exploreJson = exploreJson ? (exploreJson.response ? exploreJson.response : exploreJson) : exploreJson;
    this.noData = this.exploreJson ? false : true;
    this.ngOnInit();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.echartsInstance) this.echartsInstance.resize();
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
