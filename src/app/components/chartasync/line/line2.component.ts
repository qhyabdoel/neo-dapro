import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  HostListener,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import * as objectPath from 'object-path';
import * as _moment from 'moment';
import { LoaderService, ApiService, LayoutConfigService } from 'src/app/libs/services';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import {
  date_picker_handler,
  extract_date_filter,
  get_position,
  month_picker_handler,
  on_full_screen_id,
  validate_date,
  year_picker_handler,
  on_click_overlay,
  remapping_color_key,
} from 'src/app/libs/helpers/utility';
import * as collorPalleteFile from 'src/assets/data/color_palette.json';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import { helpergetConfigChart } from './helper.line.component';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  reformatNumber,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';

const moment = _rollupMoment || _moment;

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

declare var d3: any;

@Component({
  selector: '[pq-line-async]',
  templateUrl: './line2.component.html',
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
export class Line2Component implements OnInit {
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
  chartOption: any;
  echartsInstance: any;
  det: any;
  meId$: any = [];
  mappingExtraFilter: any;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  colorPaletteJsonFile: any = (collorPalleteFile as any).default;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  //data type string
  theme: string;
  activeClass: string = '';
  filter_granularity_sqla: string;
  //data type boolean
  dragHandle: boolean = false;
  dragBounds: boolean = true;
  canDownload: boolean = false;
  canOverwrite: boolean = false;
  noData: boolean = false;
  isFullscreen: boolean = false;
  isOnDateFilter: boolean = false;
  //data type object
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  //data type array
  originalDate: any = [];
  colorPalette: any = [];
  //data type any
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {}
  findExploreJsonWhenUndefined = async () => {
    let config = {};
    let explore = {
      form_data: {},
    };
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
    }
    this.url = exploreUrl;
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
      explore,
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
      config = await this.getConfigChart(exploreJson);
      this.noData = false;
    } else this.noData = true;

    return config;
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
      this.data = await this.findExploreJsonWhenUndefined();
    } else {
      this.explore = this.formdata;
      let exploreJson = this.exploreJson;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
      // set result configurasi dari exploreJson ke series chart
      this.data = await this.getConfigChart(exploreJson);
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
      if (this.explore.form_data.random_color) {
        let array = this.data.series;
        for (let index = 0; index < array.length; index++) {
          colors.push(this.colorPalette[themes][Math.floor(Math.random() * this.colorPalette[themes].length)]);
        }
      }
      var themes = this.explore.form_data.color_scheme;
      let show_legend = this.explore.form_data.show_legend;
      let legendData = this.data.legendData;
      if (!show_legend) legendData = [];
      this.theme = themes ? (themes != 'bnbColors' ? themes : 'palette1') : 'palette1';
      if (skin == 'light') this.theme = this.theme + 'L';
      let yAxis = [{ type: 'value' }];
      let ini = this;
      let widthLegend = 400;
      let legends = {
        show: ini.explore ? ini.explore.form_data.show_legend : true,
        type: 'plain',
        orient: 'horizontal',
        width: widthLegend,
        data: ini.data.legendData,
        textStyle: {
          fontSize: 10,
          color: '#8c8c8c',
        },
      };
      if (ini.explore.form_data.legend_orient)
        legends = {
          ...legends,
          orient: ini.explore.form_data.legend_orient == null ? 'horizontal' : ini.explore.form_data.legend_orient,
        };
      if (ini.explore.form_data.legend_type)
        legends = Object.assign({}, legends, { type: String(ini.explore.form_data.legend_type) });
      if (ini.explore.form_data.legend_position) legends[ini.explore.form_data.legend_position] = 0;
      if (ini.explore.form_data.legend_width && ini.explore.form_data.legend_width != null)
        legends = {
          ...legends,
          width:
            Number(ini.explore.form_data.legend_width) > 0 ? Number(ini.explore.form_data.legend_width) : widthLegend,
        };
      if (ini.explore.form_data.show_brush && ini.explore.form_data.legend_position == 'bottom')
        legends = Object.assign({}, legends, { bottom: 50 });
      let coloring = [];
      if (
        ini.explore.form_data.choose_pallete &&
        ini.explore.form_data.choose_pallete == 'custom_pallete' &&
        ini.explore.form_data.colorpickers &&
        ini.explore.form_data.colorpickers.length > 0
      ) {
        this.exploreJson = remapping_color_key(this.exploreJson);
        // ini.explore.form_data.colorpickers = this.exploreJson.form_data.colorpickers;
        ini.explore = {
          ...ini.explore,
          form_data: {
            ...ini.explore.form_data,
            colorpickers: this.exploreJson.form_data.colorpickers,
          },
        };
        let array = ini.data.series;
        for (let index = 0; index < array.length; index++) {
          for (let j = 0; j < ini.explore.form_data.colorpickers.length; j++) {
            if (
              String(array[index].name).replace(' ', '').toLowerCase() ==
              String(ini.explore.form_data.colorpickers[j].entity).replace(' ', '').toLowerCase()
            ) {
              coloring.push(
                ini.explore.form_data.colorpickers[j].colorpicker
                  ? ini.explore.form_data.colorpickers[j].colorpicker
                  : ini.colorPalette[themes][Math.floor(Math.random() * ini.colorPalette[themes].length)]
              );
              break;
            }
          }
          this.chartOption = {
            color: coloring,
            grid: {
              left:
                this.explore.form_data.left_margin == 'auto'
                  ? '5%'
                  : this.explore.form_data.left_margin
                  ? this.explore.form_data.left_margin
                  : '5%',
              right: '5%',
              bottom:
                this.explore.form_data.bottom_margin == 'auto'
                  ? '20%'
                  : this.explore.form_data.bottom_margin
                  ? this.explore.form_data.bottom_margin
                  : '20%',
              containLabel: true,
            },
            title: {
              text: this.data.title,
            },
            tooltip: {
              trigger: me.explore.form_data.style_tooltips || 'item', //"axis",
              renderMode: 'html',
              confine: true,
              extraCssText: 'z-index: 1000',
              formatter: function (params) {
                // console.log('params', params);
                let par;
                if (me.explore.form_data.style_tooltips == 'axis') {
                  // for tooltip trigger axis
                  var customTooltip =
                    '<table ><tr><td style="font-size:10px" colspan="3"><span> ' +
                    params[0]['name'] +
                    ' </span></td></tr>';
                  Object.keys(params).map(function (key) {
                    par = reformatNumber(params[key]['value'], me.explore.form_data.y_axis_format, this.explore, d3);
                    if (params[key]['value'] > 0)
                      customTooltip +=
                        '<tr><td style="font-size:10px">' +
                        params[key]['marker'] +
                        '<span> ' +
                        params[key]['seriesName'] +
                        '</span></td><td style="font-size:10px">&nbsp;:&nbsp;</td><td style="font-size:10px" align="right">' +
                        par +
                        '</td></tr>';
                  });
                } else {
                  // for tooltip trigger item
                  var customTooltip = '<table >';
                  par = reformatNumber(params.value, me.explore.form_data.y_axis_format, this.explore, d3);
                  customTooltip +=
                    '<tr><td style="font-size:10px">' +
                    params.marker +
                    '<span> ' +
                    params.name +
                    '</span></td><td style="font-size:10px">&nbsp;:&nbsp;</td><td style="font-size:10px" align="right">' +
                    par +
                    '</td></tr>';
                }
                customTooltip += '</table>';
                return customTooltip;
              },
            },
            legend: legends,
            toolbox: {
              feature: {},
            },
            dataZoom: this.explore.form_data.show_brush ? this.data.dataZoom : [],
            xAxis: this.data.xAxis,
            yAxis: this.data.yAxis,
            series: this.data.series,
          };
        }
      } else {
        coloring = colors.length == 0 ? ini.colorPalette[themes] : colors || [];
      }
      this.chartOption = {
        color: coloring,
        grid: {
          left:
            this.explore.form_data.left_margin == 'auto'
              ? '5%'
              : this.explore.form_data.left_margin
              ? this.explore.form_data.left_margin
              : '5%',
          right: '5%',
          bottom:
            this.explore.form_data.bottom_margin == 'auto'
              ? '20%'
              : this.explore.form_data.bottom_margin
              ? this.explore.form_data.bottom_margin
              : '20%',
          containLabel: true,
        },
        title: {
          text: this.data.title,
        },
        tooltip: {
          trigger: me.explore.form_data.style_tooltips || 'item', //"axis",
          renderMode: 'html',
          confine: true,
          extraCssText: 'z-index: 1000',
          formatter: function (params) {
            let par;
            if (me.explore.form_data.style_tooltips == 'axis') {
              // for tooltip trigger axis
              var customTooltip =
                '<table ><tr><td style="font-size:10px" colspan="3"><span> ' + params[0]['name'] + ' </span></td></tr>';
              Object.keys(params).map(function (key) {
                par = reformatNumber(params[key]['value'], me.explore.form_data.y_axis_format, this.explore, d3);
                if (params[key]['value'] > 0)
                  customTooltip +=
                    '<tr><td style="font-size:10px">' +
                    params[key]['marker'] +
                    '<span> ' +
                    params[key]['seriesName'] +
                    '</span></td><td style="font-size:10px">&nbsp;:&nbsp;</td><td style="font-size:10px" align="right">' +
                    par +
                    '</td></tr>';
              });
            } else {
              // for tooltip trigger item
              var customTooltip = '<table >';
              par = reformatNumber(params.value, me.explore.form_data.y_axis_format, me.explore, d3);
              customTooltip +=
                '<tr><td style="font-size:10px">' +
                params.marker +
                '<span> ' +
                params.name +
                '</span></td><td style="font-size:10px">&nbsp;:&nbsp;</td><td style="font-size:10px" align="right">' +
                par +
                '</td></tr>';
            }
            customTooltip += '</table>';
            return customTooltip;
          },
        },
        legend: legends,
        toolbox: {
          feature: {},
        },
        dataZoom: this.explore.form_data.show_brush ? this.data.dataZoom : [],
        xAxis: this.data.xAxis,
        yAxis: this.data.yAxis,
        series: this.data.series,
      };
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

  ngAfterViewInit() {
    if (this.echartsInstance) {
      this.echartsInstance.resize();
    }
  }

  onFilter(params) {
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    let _name: any;
    let mydata = {};
    let filterArr = [];
    let urlLinkTo = '/api/dashboard/view?link=';
    let array = this.mappingExtraFilter; //isinya [{key : "sum_e", value : "b"}]
    var arr_text =
      this.explore.form_data.x_axis_format === 'smart_date'
        ? this.originalDate[params.dataIndex].toString().split('/')
        : params.name.split('/');
    if (arr_text.length == 1) arr_text = params.name.split('-');
    var new_text = arr_text[1] + '/' + arr_text[0] + '/' + arr_text[2]; // m/d/Y
    let isUtc = new Date(new_text);
    _name = new_text;

    if (String(isUtc) != 'Invalid Date') _name = moment(new_text);
    if (this.explore.form_data.time_grain_sqla === 'month') {
      let result = month_picker_handler(moment, undefined, _name, 'date_picker');
      this.sinceDate = result[0];
      this.untilDate = result[1];
    } else if (this.explore.form_data.time_grain_sqla === 'year') {
      let result = year_picker_handler(moment, undefined, _name, 'date_picker');
      this.sinceDate = result[0];
      this.untilDate = result[1];
    } else {
      _name = moment(_name).format('YYYY-MM-DD');
      mydata[this.explore.form_data.granularity_sqla] = [
        { filter: this.explore.form_data.granularity_sqla, id: _name, metric: 2, text: _name },
      ];
    }

    if (this.explore.form_data.style_tooltips === 'item') {
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (params.seriesName == element.key && element.value)
          mydata[element.value] = [
            { filter: element.value, id: params.seriesName, metric: 2, text: params.seriesName },
          ];
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
      this.isOnDateFilter = false;
      this.sinceDate = null;
      this.untilDate = null;
      if (this.exploreJson) {
        this.exploreJson.form_data.since = '';
        this.exploreJson.form_data.until = '';
      }
      this.noData = false;
    }
    this.exploreJson = undefined;
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
    let cardId = this.cardID;

    $('#' + cardId + ' .containerList').toggleClass('d-none');
    $('#' + cardId + ' .demo-chart').toggleClass('h-85');
    this.cdr.detectChanges();
  }

  parseDate(dateStr) {
    return validate_date(dateStr);
  }

  async getConfigChart(data) {
    let item = await helpergetConfigChart(
      data,
      d3,
      this.formaterNumber,
      this.explore,
      this.originalDate,
      this.mappingExtraFilter
    );

    this.originalDate = (await item).originalDate;
    this.mappingExtraFilter = (await item).mappingExtraFilter;

    return item;
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

  onFullscreen(cardId) {
    this.isFullscreen = true;
    on_full_screen_id('myDiv-' + cardId);
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange() {
    if (window.innerHeight === screen.height) this.isFullscreen = true;
    else this.isFullscreen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.echartsInstance) this.echartsInstance.resize();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this.cdr.detectChanges();
  }
}
