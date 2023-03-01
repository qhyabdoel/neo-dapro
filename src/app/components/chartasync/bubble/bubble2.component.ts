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
import { ApiService, LayoutConfigService, LoaderService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
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
  on_full_screen_id,
  year_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import * as collorPalleteFile from 'src/assets/data/color_palette.json';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  reformatNumber,
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
  selector: '[pq-bubble-async]',
  templateUrl: './bubble2.component.html',
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
export class Bubble2Component implements OnInit {
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

  //data type any
  mycharts: any;
  chartOption: any;
  echartsInstance: any;
  det: any;
  meId$: any = [];
  maxSize: any = 0;
  mappingExtraFilter: any;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  colorPaletteJsonFile: any = (collorPalleteFile as any).default;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  //data type boolean
  dragHandle: boolean = false;
  dragBounds: boolean = true;
  canDownload: boolean = false;
  canOverwrite: boolean = false;
  noData: boolean = false;
  isFullscreen: boolean = false;
  isOnDateFilter: boolean = false;
  //data type string
  activeClass: string = '';
  theme: string;
  filter_granularity_sqla: string;
  //data type array
  yVal = [];
  xVal = [];
  colorPalette: any = [];
  //data type object
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {}

  findExploreJsonWhenUndefined = async () => {
    let explore = null;
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
    explore = this.explore;

    if (this.explore) {
      this.canDownload = this.explore.canDownload;
      this.canOverwrite = this.explore.canOverwrite;
    }

    let payload = explore.form_data ? explore.form_data : this.explore.form_data;

    if (this.isOnDateFilter) {
      payload.since = this.sinceDate;
      payload.until = this.untilDate;

      if (this.isFilter && this.extraFilter.length > 0) {
        for (var i = 0; i < this.extraFilter.length; i++) {
          if (this.extraFilter[i].col === '__from') {
            payload.since = '';
            this.extraFilter[i].val = this.sinceDate;
          } else if (this.extraFilter[i].col === '__to') {
            payload.until = '';
            this.extraFilter[i].val = this.untilDate;
          }
        }
      }
    }

    let param = {
      form_data: payload,
    };
    param = this.setFilter(param, explore);
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
    //get explore json url data from service backend
    let exploreJson = await helperGetExplorerChart(
      this.explore,
      exploreJsonUrl,
      this.token,
      '',
      this._apicall,
      this.fdata,
      param
    );
    this.exploreJson = exploreJson;
    if (exploreJson) {
      this.data = await this.getConfigChart(exploreJson);
      this.noData = false;
    } else this.noData = true;
  };

  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    this.mappingExtraFilter = [];
    let config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    for (var i = 0; i < this.colorPaletteJsonFile.length; i++) {
      this.colorPalette['palette' + (i + 1)] = this.colorPaletteJsonFile[i];
    }

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      await this.findExploreJsonWhenUndefined();
    } else {
      let exploreJson = this.exploreJson;
      this.explore = this.formdata;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
      // set result configurasi dari exploreJson ke series chart
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
          if (
            this.explore.form_data.choose_pallete &&
            this.explore.form_data.choose_pallete == 'custom_pallete' &&
            this.explore.form_data.colorpickers &&
            this.explore.form_data.colorpickers.length > 0
          ) {
            for (let j = 0; j < this.explore.form_data.colorpickers.length; j++) {
              if (
                String(array[index].name).replace(' ', '').toLowerCase() ==
                String(this.explore.form_data.colorpickers[j].entity).replace(' ', '').toLowerCase()
              ) {
                colors.push(
                  this.explore.form_data.colorpickers[j].colorpicker
                    ? this.explore.form_data.colorpickers[j].colorpicker
                    : this.colorPalette[themes][Math.floor(Math.random() * this.colorPalette[themes].length)]
                );
                break;
              }
            }
          }
        }
      }
      this.theme = themes ? themes : 'palette1';
      if (skin == 'light') this.theme = this.theme + 'L';
      let modifySeries = this.data.series.map(function (key) {
        return {
          label: {
            fontSize: 10,
            color: 'auto',
          },
          name: key.name,
          data: key.data,
          type: 'scatter',
          symbol: 'circle',
          symbolSize: function (data) {
            let persentase = Math.round((Number(data[2]) / me.maxSize) * 100);
            let itungan = persentase < 1 ? 1 : persentase == 100 ? persentase : Number(persentase) + 15;
            let max_size = Number(me.explore.form_data.max_bubble_size);
            return (itungan * max_size) / 100;
          },
          emphasis: {
            label: {
              show: true,
              position: 'top',
              formatter: function (param) {
                return param.data[3];
              },
            },
          },
        };
      });
      this.data.xAxis = Object.assign({}, this.data.xAxis[0], {
        type: 'value',
        nameTextStyle: {},
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        axisLabel: {
          formatter: function (value) {
            if (me.explore.form_data.x_axis_format) {
              let formatedValue = reformatNumber(value, me.explore.form_data.x_axis_format, me.explore, d3);
              return formatedValue;
            }
            return value;
          },
        },
      });
      if (this.explore.form_data.x_log_scale) {
        this.data.xAxis = Object.assign({}, this.data.xAxis, {
          type: 'log',
          logBase: 10,
        });
      }
      this.data.yAxis = Object.assign({}, this.data.yAxis[0], {
        nameTextStyle: {},
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        axisLabel: {
          formatter: function (value) {
            if (me.explore.form_data.y_axis_format) {
              value = reformatNumber(value, me.explore.form_data.y_axis_format, me.explore, d3);
            }
            return value;
          },
        },
        scale: true,
      });
      if (this.explore.form_data.y_log_scale) {
        this.data.yAxis = Object.assign({}, this.data.yAxis, {
          type: 'log',
          yAxisIndex: 0,
          logBase: 10,
        });
      }

      let widthLegend = 400;
      let legenda = {
        show: this.explore.form_data.show_legend ? this.explore.form_data.show_legend : true,
        type: 'plain',
        orient: 'horizontal',

        width: widthLegend,
        data: this.data.legendData,
        textStyle: {
          fontSize: 10,
          color: '#8c8c8c',
        },
      };
      if (this.explore.form_data.legend_orient)
        legenda = {
          ...legenda,
          orient: this.explore.form_data.legend_orient == null ? 'horizontal' : this.explore.form_data.legend_orient,
        };
      if (this.explore.form_data.legend_type)
        legenda = Object.assign({}, legenda, { type: String(this.explore.form_data.legend_type) });
      if (this.explore.form_data.legend_width && this.explore.form_data.legend_width != null)
        legenda = {
          ...legenda,
          width:
            Number(this.explore.form_data.legend_width) > 0 ? Number(this.explore.form_data.legend_width) : widthLegend,
        };
      if (this.explore.form_data.legend_position) legenda[this.explore.form_data.legend_position] = 0;
      else legenda['top'] = 0;

      this.chartOption = {
        legend: legenda,
        color: colors.length == 0 ? this.colorPalette[themes] : colors,
        grid: {
          left: this.explore.form_data.left_margin == 'auto' ? '5%' : this.explore.form_data.left_margin,
          right: '5%',
          bottom: this.explore.form_data.bottom_margin == 'auto' ? '20%' : this.explore.form_data.bottom_margin,
          containLabel: true,
        },
        title: this.data.title,
        tooltip: {
          color: 'auto',
          trigger: 'item',
          renderMode: 'html',
          confine: true,
          extraCssText: 'z-index: 1000',
          axisPointer: {
            type: 'shadow',
          },
          textStyle: {
            fontSize: 12,
          },
          formatter: function (params) {
            let html = '';
            if (me.explore.form_data.y_axis_format) {
              let xValue = reformatNumber(params['data'][0], me.explore.form_data.y_axis_format, me.explore, d3);
              let sizeValue = reformatNumber(params['data'][1], me.explore.form_data.y_axis_format, me.explore, d3);
              let yValue = reformatNumber(params['data'][2], me.explore.form_data.y_axis_format, me.explore, d3);

              html += xValue + '<br>';
              html += sizeValue + '<br>';
              html += yValue + '<br>';
            } else {
              html +=
                me.explore.form_data.x + ' : ' + me.explore.form_data.y_axis_format == 'd'
                  ? reformatNumber(params['data'][0], '.3s', me.explore, d3)
                  : params['data'][0] + '<br>';
              html +=
                me.explore.form_data.size + ' : ' + me.explore.form_data.y_axis_format == 'd'
                  ? reformatNumber(params['data'][1], '.3s', me.explore, d3)
                  : params['data'][1] + '<br>';
              html +=
                me.explore.form_data.y + ' : ' + me.explore.form_data.y_axis_format == 'd'
                  ? reformatNumber(params['data'][2], '.3s', me.explore, d3)
                  : params['data'][2] + '<br>';
            }
            return html;
          },
        },
        xAxis: this.data.xAxis,
        yAxis: this.data.yAxis,
        series: modifySeries,
      };
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

  //Configuration chart function
  setFilter(param, explore) {
    if (this.isFilter) {
      param.form_data = Object.assign({}, explore.form_data, { extra_filters: this.extraFilter });
    }

    //check if there is a date in extra filter
    if (this.isFilter && this.extraFilter.length > 0) {
      let dateFilter = extract_date_filter(moment, this.extraFilter);
      this.sinceDate = this.isOnDateFilter ? this.sinceDate : dateFilter[0];
      this.untilDate = this.isOnDateFilter ? this.untilDate : dateFilter[1];
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
  //End configuration chart function

  onChartInit(e: any) {
    this.echartsInstance = e;
    this.echartsInstance.resize();
    let me = this;
    if (this.isTemplate) {
      this.echartsInstance.on('click', function (params) {
        me.onFilter(params);
      });
    }
  }

  onFilter(params) {
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    let mydata = {};
    let filterArr = [];
    let urlLinkTo = '/api/dashboard/view?link=';
    let array = this.mappingExtraFilter; //isinya [{key : "sum_e", value : "b"}]

    for (let index = 0; index < 1; index++) {
      const element = array[index];
      mydata[element.value] = [
        { filter: element.value, id: params.data[4 - index], metric: 2, text: params.data[4 - index] },
      ];
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
      this.isOnDateFilter = false;
      this.sinceDate = null;
      this.untilDate = null;
      if (this.exploreJson) {
        this.exploreJson.form_data.since = '';
        this.exploreJson.form_data.until = '';
        this.exploreJson = null;
      }
      this.noData = false;
    }

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
    if (data) {
      config = await this.setConfigChart(data, data.form_data.viz_type);
    } else {
      this.noData = true;
    }
    return config;
  }

  setConfigChart(data, typeChart) {
    let pointer = this;
    if (!data.data) data = pointer.explore;
    var tf = data.form_data.y_axis_format;
    var f = d3.format(tf ? (tf == ',f' ? ',' : tf) : ',');
    var total = 0;
    var series = [];
    var legendData = [];
    var seriesData = [];
    var xAxisData = [];
    var yAxisData = [];

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
          return f(value);
        },
      },
      show: true,
      position: 'left',
    };
    let scheme =
      data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme
        ? data.form_data.color_scheme
        : 'palette1';

    let colorPalette = this.colorPalette[scheme] || [];
    let seriesBubble = {
      name: '',
      data: [],
      type: 'scatter',
      symbol: 'circle',
      emphasis: {},
      itemStyle: {},
    };
    let bubbleValue = [];

    this.mappingExtraFilter.push({ key: data.form_data.series, value: data.form_data.series });
    this.mappingExtraFilter.push({ key: data.form_data.entity, value: data.form_data.entity });

    for (var i = 0; i < data.data.length; i++) {
      legendData.push(data.data[i].key);

      let me = data.data[i].values;
      seriesBubble = {
        name: data.data[i].key,
        data: [],
        type: 'scatter',
        symbol: 'circle',
        emphasis: {
          label: {
            show: true,
            position: 'top',
            formatter: function (param) {
              return param.data[3];
            },
          },
        },
        itemStyle: {
          color: function () {
            return colorPalette[Math.floor(Math.random() * colorPalette.length)];
          },
          borderColor: '#fff',
          borderType: 'solid',
        },
      };
      for (var j = 0; j < me.length; j++) {
        bubbleValue = [];
        let val = me[j][data.form_data.x];
        let val2 = me[j][data.form_data.y];
        let val3 = me[j][data.form_data.size];
        if (data.form_data.x_log_scale) {
          val = val > 0 ? Math.log10(val) : 0;
          val3 = val3 > 0 ? Math.log10(val3) : 0;
        }
        if (data.form_data.y_log_scale) {
          val2 = val2 > 0 ? Math.log10(val2) : 0;
        }

        if (this.maxSize < val3) {
          this.maxSize = val3;
        }
        bubbleValue.push(parseFloat(val));
        bubbleValue.push(parseFloat(val2));
        bubbleValue.push(parseFloat(val3));
        bubbleValue.push(me[j][data.form_data.entity] + '(' + me[j][data.form_data.series] + ')');
        bubbleValue.push(me[j][data.form_data.series]);
        seriesBubble.data.push(bubbleValue);

        pointer.xVal.push(parseFloat(val));
        pointer.yVal.push(parseFloat(val2));
      }

      if (data.form_data.x_log_scale) {
        xAxis = Object.assign({}, xAxis, {
          type: 'log',
          logBase: 10,
        });
      }
      if (
        data.form_data.choose_pallete &&
        data.form_data.choose_pallete == 'custom_pallete' &&
        data.form_data.colorpickers &&
        data.form_data.colorpickers.length > 0
      ) {
        for (let j = 0; j < data.form_data.colorpickers.length; j++) {
          if (
            String(data.data[i].key).replace(' ', '') == String(data.form_data.colorpickers[j].entity).replace(' ', '')
          ) {
            let itemGaul = {
              color: data.form_data.colorpickers[j].colorpicker
                ? data.form_data.colorpickers[j].colorpicker
                : '#808080',
              borderColor: '#fff',
              borderType: 'solid',
            };
            seriesBubble = { ...seriesBubble, itemStyle: itemGaul };
            break;
          }
        }
      }
      seriesData.push(seriesBubble);
    }
    let min = Math.min.apply(null, pointer.xVal);
    let max = Math.max.apply(null, pointer.xVal);
    xAxisData.push(
      Object.assign({}, xAxis, {
        min: min,
        max: max,
      })
    );
    let minus = Math.min.apply(null, pointer.yVal);
    let maxi = Math.max.apply(null, pointer.yVal);
    yAxisData.push(
      Object.assign({}, yAxis, {
        min: minus,
        max: maxi,
      })
    );
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
    this.isOnDateFilter = true;
    this.exploreJson = undefined;
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
    if (window.innerHeight === screen.height) this.isFullscreen = true;
    else this.isFullscreen = false;
  }
}
