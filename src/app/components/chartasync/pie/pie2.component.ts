import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Output,
  AfterViewInit,
  HostListener,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService, LayoutConfigService, LoaderService } from 'src/app/libs/services';
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
import { setConfigChart } from './helperPie';

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
  selector: '[pq-pie-async]',
  templateUrl: './pie2.component.html',
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
export class Pie2Component implements OnInit, AfterViewInit {
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
  //data type number
  persen: number;
  //data type object
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  //data type array
  colorPalette: any = [];
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
      explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.isOnDateFilter,
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
      config = await this.getConfigChart(exploreJson);
      this.noData = false;
    } else {
      this.noData = true;
    }

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
      this.data = await this.findExploreJsonWhenUndefined();
    } else {
      let exploreJson = this.exploreJson;
      this.explore = this.formdata;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
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
      this.theme = themes ? themes : 'palette1';
      if (skin == 'light') this.theme = this.theme + 'L';
      let ini = this;
      let widthLegend = 400;
      let legends = {
        show: this.explore ? this.explore.form_data.show_legend : true,
        type: 'plain',
        orient: 'horizontal',

        width: widthLegend,
        data: this.data.legendData,
        textStyle: {
          fontSize: 10,
          color: '#808080',
        },
        pageIconColor: '#808080',
        pageTextStyle: {
          color: '#808080',
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
      this.chartOption = {
        color: colors.length == 0 ? this.colorPalette[themes] : colors,
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        label: {
          fontSize: 10,
          color: 'auto',
        },
        title: {
          text: this.data.title,
          subtext: this.data.subtitle,
          left: this.data.lefttitle,
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow',
          },
          textStyle: {
            fontSize: 10,
          },
          formatter: function (params, ticket, callback) {
            // mapping new tooltips
            let key = params['data'].key;
            let name = params['name'];
            let toltip = '';
            if (params['data'].tooltips && params['data'].tooltips.length > 0) {
              for (let row of params['data'].tooltips) {
                if (row != null && row != '') toltip += row + '<br>';
              }
              key = toltip;
              name = toltip;
            }
            let value = Number(params['data']['value_original']);
            let locale = me.explore.form_data.format_number_id ? 'ID' : 'EN';
            d3.formatDefaultLocale(me.formaterNumber[locale]);
            if (me.explore.form_data.y_axis_format) {
              value = reformatNumber(
                params['data']['value_original'],
                me.explore.form_data.y_axis_format,
                this.explore,
                d3
              );
            }

            var customTooltip = '';

            let total = me.data.total;
            let persen: number = (parseFloat(params['data']['value_original']) * 100) / total || 0;
            if (
              !me.explore.form_data.pie_label_type ||
              me.explore.form_data.pie_label_type == 'key' ||
              me.explore.form_data.pie_label_type == 'value'
            ) {
              customTooltip += '<span> ' + key + '</span>';
              customTooltip += '<br>' + params.marker + ' ' + value;
            } else if (me.explore.form_data.pie_label_type == 'percent') {
              customTooltip += '<span> ' + key + '</span>';
              customTooltip += '<br>' + params.marker + ' ' + parseFloat(persen.toString()).toFixed(2) + '%';
            } else if (me.explore.form_data.pie_label_type == 'percent_around') {
              customTooltip += '<span> ' + key + '</span>';
              customTooltip += '<br>' + params.marker + ' ' + Math.round(Number(params['percent'])) + '%';
            } else {
              customTooltip += '<br>' + params['marker'] + '<span> ' + name + ' </span>';
            }
            return customTooltip;
          },
        },
        toolbox: {
          feature: {},
        },
        legend: legends,
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
    if (this.isFilter) param.form_data = Object.assign({}, explore.form_data, { extra_filters: this.extraFilter });

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
    let split = params.data.key.split(' - ');

    for (let i = 0; i < split.length; i++) {
      let selectedMap = this.mappingExtraFilter.filter((x) => x.key == split[i])[0];
      if (selectedMap) {
        mydata[selectedMap.value] = [{ filter: split[i], id: split[i], metric: 2, text: split[i] }];
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
    let me = this;
    if (data)
      config = await setConfigChart(
        data,
        data.form_data.viz_type,
        me.explore,
        this.mappingExtraFilter,
        this.explore,
        d3
      );
    else this.noData = true;

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

  getThemes() {
    if (this.theme.substr(this.theme.length - 1, 1) == 'L') return 'bg-light';
    else return 'bg-dark';
  }
}
