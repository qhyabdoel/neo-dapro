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
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { DomSanitizer } from '@angular/platform-browser';
import { LayoutConfigService, LoaderService, ApiService } from 'src/app/libs/services';
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
  validate_date,
  year_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import * as collorPalleteFile from 'src/assets/data/color_palette.json';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  getUrl,
  // getUrl,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { helpergetConfigChart, reformatTooltips } from './helper-country-map.component';

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
  selector: '[pq-countrymap-async]',
  templateUrl: './countrymap2.component.html',
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
export class Countrymap2Component implements OnInit {
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
  @Input() namemap: any;
  @Input() zoom: any;
  @Input() center: any;
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
  pieInitialized: any;
  meId$: any = [];
  scatterData: any;
  mappingExtraFilter: any;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  colorPaletteJsonFile: any = (collorPalleteFile as any).default;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  //echart prop
  chartOption: EChartsOption;
  //data type string
  theme: string;
  activeClass: string = '';
  mapThemes: string = '';
  filter_granularity_sqla: string;
  //data type boolean
  dragHandle: boolean = false;
  dragBounds: boolean = true;
  canDownload: boolean = false;
  canOverwrite: boolean = false;
  noData: boolean = false;
  isFullscreen: boolean = false;
  //data type array
  cellSize = [80, 80];
  colorPalette = [];
  //data type number
  pieRadius = 40;
  counter = 40;
  //data type object
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  // modal Ref
  modalReference: NgbModalRef;
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService,
    private _sanitizer: DomSanitizer
  ) {}

  findExploreJsonWhenUndefined = async () => {
    let explore = null;
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    this.url = exploreUrl;

    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
      this.explore = await helperGetExplorerChart(
        this.explore,
        exploreJsonUrl,
        this.token,
        exploreUrl,
        this._apicall,
        this.fdata
      );
    } else {
      this.explore = await helperGetExplorerChart(
        this.explore,
        exploreJsonUrl,
        this.token,
        exploreUrl,
        this._apicall,
        this.fdata
      );
      this.explore = this.formdata ? this.formdata : this.explore;
    }
    explore = this.explore;

    if (this.explore) {
      this.canDownload = this.explore.canDownload;
      this.canOverwrite = this.explore.canOverwrite;
    }

    let payload = explore.form_data ? explore.form_data : this.explore.form_data;
    let param = {
      form_data: payload,
    };
    param = this.setFilter(param, explore);
    param = setInitialDate(
      param,
      explore,
      this.isDateFilter,
      this.isInitialDateFilter,
      false,
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
      this.data = await this.getConfigChart(exploreJson);
    } else {
      this.noData = true;
    }
  };
  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    this.mappingExtraFilter = [];
    this.autoResize = true;
    const configu = this.layoutConfigService.getConfig();
    let skin = objectPath.get(configu, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    // for has chartId
    var explore = {
      form_data: {},
    };
    for (var i = 0; i < this.colorPaletteJsonFile.length; i++) {
      this.colorPalette['palette' + (i + 1)] = this.colorPaletteJsonFile[i];
    }

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      await this.findExploreJsonWhenUndefined();
    } else {
      let exploreUrl = getUrl(this.exploreJson);
      this.explore = await helperGetExplorerChart(this.explore, '', this.token, exploreUrl, this._apicall, this.fdata);
      this.explore = this.formdata ? this.formdata : this.explore ? this.explore : explore;
      let exploreJson = this.exploreJson;
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
      let themes = this.explore.form_data.color_scheme
        ? this.explore.form_data.color_scheme != 'bnbColors'
          ? this.explore.form_data.color_scheme
          : 'palette1'
        : 'palette1';
      this.mapThemes = themes;
      if (this.isTemplate) this.det = me.cdr.detectChanges();
      this.theme = themes ? themes : 'pallete5';
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

  openModal() {
    this.modalReference.componentInstance.explore = this.explore;
  }

  async onChartInit(e: any) {
    this.echartsInstance = e;
    this.echartsInstance.resize();
    let _this = this;
    let namemap = this.namemap;
    let metric = 0;
    let value = 0;
    let defaultCenter = undefined;
    setTimeout(async function () {
      _this.echartsInstance.on('click', { seriesName: 'Peta indonesia' }, function (param) {
        console.log('onclick', param, _this);
        if (param.data && param.data.is_point_tooltip) {
          _this.explore.form_data.point_comparations =
            _this.explore.form_data.point_comparations && Array.isArray(_this.explore.form_data.point_comparations)
              ? _this.explore.form_data.point_comparations
              : [];
          if (_this.explore.form_data.point_comparations.length == 0) {
            _this.explore.form_data.point_comparations.push({
              no: 1,
              marker: _this._sanitizer.bypassSecurityTrustHtml(param.marker),
              name: param.data.name,
              tooltips: reformatTooltips(param, param.data.exploreJson, d3, this.explore, 'point'),
            });
          } else if (_this.explore.form_data.point_comparations.length == 1) {
            if (param.data.name != _this.explore.form_data.point_comparations[0].name) {
              _this.explore.form_data.point_comparations[0].no = 1;
              _this.explore.form_data.point_comparations.push({
                no: 2,
                marker: _this._sanitizer.bypassSecurityTrustHtml(param.marker),
                name: param.data.name,
                tooltips: reformatTooltips(param, param.data.exploreJson, d3, this.explore, 'point'),
              });
            }
          } else {
            if (param.data.name != _this.explore.form_data.point_comparations[1].name) {
              _this.explore.form_data.point_comparations[0] = {
                no: 1,
                marker: _this.explore.form_data.point_comparations[1].marker,
                name: _this.explore.form_data.point_comparations[1].name,
                tooltips: _this.explore.form_data.point_comparations[1].tooltips,
              };
              _this.explore.form_data.point_comparations[1] = {
                no: 2,
                marker: _this._sanitizer.bypassSecurityTrustHtml(param.marker),
                name: param.data.name,
                tooltips: reformatTooltips(param, param.data.exploreJson, d3, this.explore, 'point'),
              };
            }
          }
          _this.openModal();
        } else {
          if (param.data && param.data.name != namemap) {
            defaultCenter = defaultCenter == null ? _this.data.series[0].center : defaultCenter;
            _this.zoom = 6;
            _this.data.series[0].zoom = 6;
            namemap = param.data.name;
            _this.namemap = param.data.name;
            metric = param.data.value;
            value = param.value;
            let features = _this.mapGeoJSON.features.filter((x) => {
              if (x.properties.name == namemap) return x;
            })[0];
            var centroid2 = turf.centroid(features);
            let center = centroid2.geometry.coordinates;
            _this.center = center;
            _this.data.series[0].center = center;
          } else {
            namemap = '';
            _this.namemap = '';
            defaultCenter = undefined;
            _this.data.series[0].center = defaultCenter;
            _this.data.series[0].zoom = 1.25;
            _this.zoom = 1.25;
            _this.center = defaultCenter;
          }
          _this.onFilter(param);
          _this.echartsInstance.setOption(_this.data);
        }
      });
    }, 1000);
  }
  savePointTooltips() {}

  onFilter(params) {
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    let mydata = {};
    let filterArr = [];
    let urlLinkTo = '/api/dashboard/view?link=';
    let array = this.mappingExtraFilter;
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (params.name == element.key)
        mydata[element.value] = [{ filter: params.seriesName, id: params.name, metric: 2, text: params.name }];
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
        data: this.namemap == '' ? {} : mydata,
        since: this.sinceDate,
        until: this.untilDate,
        timecolumn: this.isDateFilter ? this.filter_granularity_sqla : this.explore.form_data.granularity_sqla,
      },
      url: '/api/chart/explore/?form_data=%7B%22slice_id%22%3A143%7D',
      slug: this.slug,
      isLinkTo: this.explore.form_data.chart_on_click,
      linkTo: urlLinkTo + this.explore.form_data.link_to,
      zoom: this.zoom,
      center: this.center,
      namemap: this.namemap,
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
    this.explore.form_data = this.data.form_data;
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

  async getConfigChart(data) {
    let config = {};
    if (!data) {
      this.noData = true;
    } else {
      let configChart = await helpergetConfigChart(
        data,
        d3,
        this.formaterNumber,
        this.explore,
        this.colorPalette,
        this.mappingExtraFilter,
        this._apicall,
        this.zoom,
        this.center
      );
      config = configChart.chart;
      this.mapGeoJSON = configChart.mapGeoJSON;
      echarts.registerMap('ID', configChart.mapGeoJSON);
      this.mappingExtraFilter = configChart.mappingExtraFilter;
    }
    return config;
  }

  onFullscreen(cardId) {
    this.isFullscreen = true;
    on_full_screen_id('myDiv-' + cardId);
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  parseDate(dateStr) {
    return validate_date(dateStr);
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
    let exploreJsonResult = await this._apicall.loadPostData(url, param);
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.noData = this.exploreJson ? false : true;
    this.ngOnInit();
  }

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange() {
    this.isFullscreen = window.innerHeight === screen.height ? true : false;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.echartsInstance) this.echartsInstance.resize();
  }
}
