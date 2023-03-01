//Angular
import { FormControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
//moment
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
//echart
import { EChartsOption } from 'echarts';
//service
import { ApiService, LoaderService, LayoutConfigService } from 'src/app/libs/services';
import {
  date_picker_handler,
  extract_date_filter,
  month_picker_handler,
  on_full_screen_id,
  year_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import objectPath from 'object-path';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { setConfigChart } from './helperBoxPlot';

declare var d3: any;
const moment = _rollupMoment || _moment;
@Component({
  selector: '[pq-boxplot-async]',
  templateUrl: './boxplot2.component.html',
})
export class BoxplotComponent implements OnInit {
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
  echartsInstance: any;
  det: any;
  loader$: any;
  meId$: any = [];
  mappingExtraFilter: any;
  sinceDate: any;
  untilDate: any;
  formaterNumber: any;
  //data type string
  theme: string;
  activeClass: string = '';
  filter_granularity_sqla: string;
  // data type boolean
  dragHandle: boolean = false;
  dragBounds: boolean = true;
  canDownload: boolean = false;
  canOverwrite: boolean = false;
  noData: boolean = false;
  isOnDateFilter: boolean = false;
  isFullscreen: boolean = false;
  //data type number
  minValue: Number;
  maxValue: Number;
  //data type array
  colorPalette = [];
  //echart properties
  chartOption: EChartsOption;
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
      let tempData = await this._apicall.loadGetData('/assets/data/dummy/boxplot.json');
      exploreJson.data = tempData;
      this.data = await this.getConfigChart(exploreJson);
      this.noData = false;
    } else this.noData = true;
  };
  async ngOnInit() {
    let formatNumberID = await this._apicall.loadGetData('/assets/data/formatNumberID.json');
    let color_palette = await this._apicall.loadGetData('/assets/data/color_palette.json');
    this.formaterNumber = formatNumberID;
    const config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    this.mappingExtraFilter = [];
    for (var i = 0; i < color_palette.length; i++) {
      this.colorPalette['palette' + (i + 1)] = color_palette[i];
    }

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      await this.findExploreJsonWhenUndefined();
    } else {
      this.noData = false;
      this.explore = this.formdata;
      let tempData = await this._apicall.loadGetData('/assets/data/dummy/boxplot.json');
      let exploreJson = this.exploreJson;
      exploreJson.data = tempData;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
      // set result configurasi dari exploreJson ke series chart
      this.data = await this.getConfigChart(exploreJson);
    }

    if (!this.noData) {
      let themes = this.explore.form_data.color_scheme
        ? this.explore.form_data.color_scheme != 'bnbColors'
          ? this.explore.form_data.color_scheme
          : 'palette1'
        : 'palette1';
      let colors = [];
      if (this.explore.form_data.random_color) {
        let array = this.data.series;
        for (let index = 0; index < array.length; index++) {
          colors.push(this.colorPalette[themes][Math.floor(Math.random() * this.colorPalette[themes].length)]);
        }
      }
      this.theme = themes ? themes : 'palette1';
      if (skin == 'light') this.theme = this.theme + 'L';
      this.chartOption = this.data;
    }

    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter(this.myChartID);
    }

    let me = this;
    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
      me.cdr.detectChanges();
    }, 100);
  }

  //Configuration chart function
  setFilter(param, explore) {
    if (this.isFilter) param.form_data = Object.assign({}, explore.form_data, { extra_filters: this.extraFilter });

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

  async getConfigChart(exploreJson) {
    let locale = exploreJson.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(this.formaterNumber[locale]);
    let config = await setConfigChart(exploreJson, this.colorPalette, this.minValue, this.maxValue, d3);
    this.minValue = config.minValue;
    this.maxValue = config.maxValue;
    return config;
  }

  //End configuration chart function

  //Filter function
  onChartInit(e: any) {
    let me = this;
    this.echartsInstance = e;
    this.echartsInstance.resize();
    if (this.isTemplate) {
      this.echartsInstance.on('click', function (params) {
        me.onFilter(params);
      });
    }
  }

  onFilter(param) {
    this.filter.emit(param);
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
  //End filter function

  //Button action function
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
  //End button action function

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange() {
    this.isFullscreen = window.innerHeight == screen.height ? true : false;
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
