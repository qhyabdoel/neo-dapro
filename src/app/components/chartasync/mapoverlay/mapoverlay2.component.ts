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
import { LoaderService, ApiService, LayoutConfigService } from 'src/app/libs/services';
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
import echarts from 'echarts/types/dist/echarts';
import {
  getUrl,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { getPieSeriesMaps, setConfigChart } from './helperMapOverlay';

const moment = _rollupMoment || _moment;
declare var d3: any;
declare var turf: any;

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
  selector: '[pq-mapoverlay-async]',
  templateUrl: './mapoverlay2.component.html',
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
export class Mapoverlay2Component implements OnInit {
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
  @Input() coloringPie: any;
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
  echartsInstance: any;
  det: any;
  meId$: any;
  pieRadius: any;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  colorPaletteJsonFile: any = (collorPalleteFile as any).default;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  //echart properties
  chartOption: EChartsOption;
  //data type string
  theme: string;
  filter_granularity_sqla: string;
  activeClass: string = '';
  //data type boolean
  dragHandle: boolean = false;
  dragBounds: boolean = true;
  canDownload: boolean = false;
  canOverwrite: boolean = false;
  noData: boolean = false;
  isFullscreen: boolean = false;
  //data type array
  colorPalette = [];
  scatterDatas = [];
  dataMap = [];
  //data type number
  total: number = 0;
  //data type object
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {}

  findExploreWhenDefined = async () => {
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
  };
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
      config = await this.getConfigChart(exploreJson);
    } else {
      this.noData = true;
    }
    return config;
  };
  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    const configu = this.layoutConfigService.getConfig();
    let skin = objectPath.get(configu, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    // for has chartId
    for (var i = 0; i < this.colorPaletteJsonFile.length; i++) {
      this.colorPalette['palette' + (i + 1)] = this.colorPaletteJsonFile[i];
    }
    if (!this.exploreJson) {
      this.data = await this.findExploreJsonWhenUndefined();
    } else {
      await this.findExploreWhenDefined();
    }
    //set initial chart blank
    if (this.isFilter) this.explore.form_data.initial_chart_blank = false;

    let me = this;
    if (!me.noData) {
      let themes = this.explore.form_data.color_scheme
        ? this.explore.form_data.color_scheme != 'bnbColors'
          ? this.explore.form_data.color_scheme
          : 'palette1'
        : 'palette1';
      this.theme = themes ? themes : 'pallete6';
      if (skin == 'light') this.theme = this.theme + 'L';
      this.chartOption = this.data;
    }
    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter(this.myChartID);
    }
    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
      me.cdr.detectChanges();
    }, 100);
  }

  async ngAfterViewInit() {}

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

  //End configuration chart function

  async onChartInit(e: any) {
    this.echartsInstance = e;
    let ini = this;
    // begin tricky
    const configu = ini.layoutConfigService.getConfig();
    let skin = objectPath.get(configu, 'login.self.skin');
    ini.meId$ = ini.loaderService.getSpesifikID;

    await ini._apicall.get('/assets/data/color_palette.json').subscribe(async (result) => {
      for (var i = 0; i < result.length; i++) {
        ini.colorPalette['palette' + (i + 1)] = result[i];
      }
      if (!ini.exploreJson) {
        this.data = await this.findExploreJsonWhenUndefined();
      } else {
        await this.findExploreWhenDefined();
      }
      let me = this;
      if (!me.noData) {
        let themes = ini.explore.form_data.color_scheme
          ? ini.explore.form_data.color_scheme != 'bnbColors'
            ? ini.explore.form_data.color_scheme
            : 'palette1'
          : 'palette1';
        ini.theme = themes ? themes : 'pallete6';
        if (skin == 'light') ini.theme = ini.theme + 'L';
        ini.chartOption = me.data[0];
      }
    });
    // end tricky
    var pieInitialized;
    setTimeout(async function () {
      // zoom in out;
      let namemap = '';
      let defaultCenter = undefined;
      var title = ini.explore.form_data.select_country2;
      ini.echartsInstance.on('click', { seriesName: 'Peta ' + title + 'Maps' }, function (param) {
        if (param.data.name != namemap) {
          defaultCenter = defaultCenter == null ? ini.data.series[0].center : defaultCenter;
          ini.data.series[0].zoom = 6;
          namemap = param.data.name;
          let features = ini.mapGeoJSON.features.filter((x) => x.properties.NAME_1 == namemap)[0];
          var centroid2 = turf.centroid(features);
          let center = centroid2.geometry.coordinates;
          ini.data.series[0].center = center;
        } else {
          namemap = '';
          defaultCenter = undefined;
          ini.data.series[0].center = defaultCenter;
          ini.data.series[0].zoom = 1.25;
        }
        ini.echartsInstance.setOption(ini.data);
      });
      pieInitialized = true;
      let url = `assets/data/geojson/countries/${ini.explore.form_data.select_country2
        .toString()
        .toLowerCase()}.geojson.json`;
      ini.mapGeoJSON = await ini._apicall.loadGetData(url);
      if (!ini.explore.form_data.hide_overlay) {
        let datawi = getPieSeriesMaps(ini.scatterDatas, ini.echartsInstance, ini.total, ini.mapGeoJSON, turf);
        let series = datawi;
        ini.echartsInstance.setOption({
          color: ini.coloringPie,
          series: series,
        });
      }
    }, 2000);
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
    this.onChartInit(this.echartsInstance);
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
    this.onChartInit(this.echartsInstance);
    this.ngOnInit();
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
    let me = this;
    if (this.isTemplate) {
      clearInterval(me.det);
    }
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
    let url = `assets/data/geojson/countries/${data.form_data.select_country2.toString().toLowerCase()}.geojson.json`;

    this.mapGeoJSON = await this._apicall.loadGetData(url);
    let pointer = this;
    if (!data) this.noData = true;
    else {
      config = await setConfigChart(
        data,
        this.mapGeoJSON,
        pointer.explore,
        pointer.colorPalette,
        d3,
        pointer.coloringPie
      );
      echarts.registerMap(config.titel.text, config.mapGeoJson);
      this.scatterDatas = config.datamapPie;
      this.total = config.total;
    }
    return config;
  }

  onConvertPixelToPercentage(pixels = 100) {
    let screenWidth = window.screen.width;
    let percentage = (screenWidth - pixels) / screenWidth; // 0.92%
    return Number(percentage).toFixed(3).toString().concat('%');
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

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange() {
    this.isFullscreen = window.innerHeight === screen.height ? true : false;
  }
}
