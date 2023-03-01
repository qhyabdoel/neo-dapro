import { FormControl } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService, LoaderService } from 'src/app/libs/services';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import {
  date_picker_handler,
  get_position,
  month_picker_handler,
  on_full_screen_id,
  year_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  reformatNumber,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { checkIsFilter, reformatDateLabel, setLabelValue } from './helperBigNumber';

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
  selector: '[pq-bignumber-async]',
  templateUrl: './bignumber2.component.html',
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
export class Bignumber2Component implements OnInit {
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
  @Input() autoResize: any;
  @Input() columns: any;
  @Input() records: any;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() isDrag;
  @Input() isView: boolean;
  @Input() formdata: any;
  @Input() data: any;
  @Input() themes: any;
  @Input() extraFilter: any;
  @Input() isFilter: boolean;
  @Input() sliceArr: any;
  @Input() isSearchResult: boolean;
  @Input() isDateFilter: boolean;
  @Input() isInitialDateFilter: boolean;
  @Input() searchResultOptions: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();
  @Output() height: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchResultJumpTo: EventEmitter<any> = new EventEmitter<any>();

  //data type any
  chartOption: any;
  chartOption2: any;
  echartsInstance: any;
  det: any;
  loader$: any;
  meId$: any = [];
  positionChart: any;
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  colorBorder: any = '';
  borderPosition: any = 'border';
  paramFilters: any;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  //data type string;
  sizeNumber: string;
  sizeText: string;
  theme: string;
  activeClass: string = '';
  dataValue: string = '';
  dataText: string = '';
  filter_granularity_sqla: string = '';
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
  constructor(private cdr: ChangeDetectorRef, private _apicall: ApiService, private loaderService: LoaderService) {}

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

    var param = {
      form_data: payload,
    };
    // fungsi untuk melakukan set filter ketika this.isFilter is true
    // jika false skip filter
    let resultCheckFilter = checkIsFilter(
      param,
      explore,
      this.isFilter,
      this.extraFilter,
      this.sinceDate,
      this.untilDate,
      this.isOnDateFilter,
      this.isDateFilter,
      this.isInitialDateFilter,
      this.filter_granularity_sqla
    );
    // set result from check filter
    // perubahan dibawah ini terjadi ketika didalan result check filter terjadi flag
    // jika tidak maka hasil akan default seperti yg ada dihalaman
    this.sinceDate = resultCheckFilter.sinceDate;
    this.untilDate = resultCheckFilter.untilDate;
    this.filter_granularity_sqla = resultCheckFilter.filter_granularity_sqla;
    param = resultCheckFilter.param;
    // end check result
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
      this.data = await this.getConfigChart(exploreJson);
      this.noData = false;
    } else this.noData = true;
  };
  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    this.meId$ = this.loaderService.getSpesifikID;
    // for has chartId
    var explore = {
      form_data: {},
    };
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
    if (this.isFilter) {
      this.explore.form_data.initial_chart_blank = false;
    }
    let me = this;
    let valueLabel = setLabelValue(this.noData, this.data, explore, this.untilDate);
    let titlesObject = valueLabel[0];
    let titlesObject2 = valueLabel[1];

    if (['top', 'bottom'].includes(this.explore.form_data.label_position)) this.positionChart = 'tb';
    if (['left', 'right'].includes(this.explore.form_data.label_position)) this.positionChart = 'lr';

    titlesObject.textStyle = Object.assign({}, titlesObject.textStyle, {
      color:
        this.explore.form_data.colorpickers && this.explore.form_data.colorpickers.length > 0
          ? this.explore.form_data.colorpickers[0].colorpicker
          : '#808080' || '#808080',
    });
    titlesObject2.textStyle = Object.assign({}, titlesObject2.textStyle, {
      color:
        this.explore.form_data.colorpickers && this.explore.form_data.colorpickers.length > 0
          ? this.explore.form_data.colorpickers[1].colorpicker
          : '#808080' || '#808080',
    });

    if (this.explore.form_data.show_border && ![undefined, ''].includes(this.explore.form_data.border_position)) {
      this.colorBorder =
        this.explore.form_data.colorpickers && this.explore.form_data.colorpickers.length > 0
          ? this.explore.form_data.colorpickers[1].colorpicker
          : '#808080' || '#808080';
      this.borderPosition = 'border-' + this.explore.form_data.border_position;
    }

    this.setValueLabelPosition(this.explore.form_data.label_position, titlesObject, titlesObject2);
    let card = document.getElementById(this.cardID);
    let cls = card.className;
    this.activeClass = cls;

    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter();
    }
    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
      me.cdr.detectChanges();
    }, 100);
  }

  //Configuration chart function

  setValueLabelPosition(labelPosition, titlesObject, titlesObject2) {
    // pengelompokan label position berdasarkan cara untuk set this.parameterFilter
    //-----------------------------------------------------------------------------
    // kelompok 1 hanya untuk  this.parameterFilter = this.chartOption
    const listCheckForParameterFilterChartOption = [undefined, 'right', 'bottom'];
    // kelompok 2 hanya untuk  this.parameterFilter = this.chartOption2
    const listCheckForParameterFilterChartOption2 = ['left', 'top'];
    // hanya untuk label position dengan type undefined, right, bottom
    if (listCheckForParameterFilterChartOption.includes(labelPosition)) {
      this.chartOption = {
        title: titlesObject,
        toolbox: {
          feature: {},
        },
      };
      this.chartOption2 = {
        title: titlesObject2,
        toolbox: {
          feature: {},
        },
      };
      this.paramFilters = this.chartOption;
      if (this.data.text && !labelPosition) this.positionChart = 'tb';
    }
    // hanya untuk label position dengan type left, top
    else if (listCheckForParameterFilterChartOption2.includes(labelPosition)) {
      this.chartOption = {
        title: titlesObject2,
        toolbox: {
          feature: {},
        },
      };
      this.chartOption2 = {
        title: titlesObject,
        toolbox: {
          feature: {},
        },
      };
      this.paramFilters = this.chartOption2;
    }
  }
  //End configuration chart function

  onFilter() {
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    let mydata = {};
    mydata[this.explore.form_data.filter_item] = [
      {
        filter: this.explore.form_data.filter_item,
        id: this.explore.form_data.filter_label,
        text: this.explore.form_data.filter_label,
      },
    ];
    let urlLinkTo = '/api/dashboard/view?link=';

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
        timecolumn: this.explore.form_data.granularity_sqla,
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

  async onChartInit(e: any) {
    this.echartsInstance = e;
    this.echartsInstance.resize();
  }

  setBorderStyles() {
    let styles = [];
    styles['padding'] = '0px !important';
    styles['margin'] = '0px !important';
    let me = this;
    if (
      me.explore &&
      me.explore.form_data &&
      me.explore.form_data.show_border &&
      ![undefined, ''].includes(me.explore.form_data.border_position)
    ) {
      me.colorBorder =
        me.explore.form_data.colorpickers && me.explore.form_data.colorpickers.length > 0
          ? me.explore.form_data.colorpickers[0].colorpicker
          : '#808080' || '#808080';
      me.borderPosition = 'border-' + me.explore.form_data.border_position;
      styles[me.borderPosition] = '5px solid ' + me.colorBorder;
    }
    return styles;
  }

  onRefresh(id) {
    if (this.sinceDate && this.untilDate) {
      this.isOnDateFilter = false;
      if (this.exploreJson) {
        this.exploreJson.form_data.since = '';
        this.exploreJson.form_data.until = '';
        this.exploreJson = null;
      }
      this.noData = false;
    }

    this.isFilter = false;
    this.loaderService.setSpesifikID([id]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.isInitialDateFilter = false;
    this.isDateFilter = false;
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
    let num = cls == 'col-md-12' ? 12 : Number(cls.substr(cls.length - 1, cls.length));
    let sizeNum = this.sizeNumber;
    let sizeT = this.sizeText;

    switch (num) {
      case 6:
        sizeNum = (Number(this.sizeNumber) / 1.5).toString();
        sizeT = (Number(this.sizeText) / 1.5).toString();
        break;
      case 4:
        sizeNum = (Number(this.sizeNumber) / 2.5).toString();
        sizeT = (Number(this.sizeText) / 2.5).toString();
        break;
      case 3:
        sizeNum = (Number(this.sizeNumber) / 3.5).toString();
        sizeT = (Number(this.sizeText) / 3.5).toString();
        break;
      case 2:
        sizeNum = (Number(this.sizeNumber) / 5).toString();
        sizeT = (Number(this.sizeText) / 4.5).toString();
        break;
      default:
        sizeNum = this.sizeNumber;
        sizeT = this.sizeText;
        break;
    }

    this.chartOption.title.textStyle.fontSize = sizeNum;
    this.chartOption2.title.textStyle.fontSize = sizeT;
    this.echartsInstance.setOption(this.chartOption, true);
    this.echartsInstance.setOption(this.chartOption2, true);
    this.width.emit(get_position(cls));
    this.cdr.detectChanges();
  }

  onDownload(id) {
    if (this.isDateFilter || this.isInitialDateFilter) {
      this.explore.form_data.since = this.sinceDate;
      (this.explore.form_data.until = this.untilDate),
        (this.explore.form_data.granularity_sql = this.filter_granularity_sqla);
    }
    this.download.emit({ id: id, url: this.url, data: this.explore });
  }

  onDelete() {
    this.delete.emit(this.index);
  }

  viewDetailChart(e) {
    this.searchResultJumpTo.emit(e);
  }

  onToggleFilter() {
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
    if (data) config = await this.setConfigChart(data);
    else this.noData = true;
    return config;
  }

  setConfigChart(data) {
    let pointer = this;
    if (!data.data) data = pointer.explore;
    let locale = data.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(this.formaterNumber[locale]);
    let value = reformatNumber(data.data.data[0][0], data.form_data.y_axis_format, pointer.explore, d3);
    let labelInitialDate =
      data.form_data.label_initial_date && this.untilDate ? reformatDateLabel(this.untilDate, this.explore) : '';
    return {
      value: value,
      text: data.data.subheader,
      textInitialDate: labelInitialDate,
      zoomSizeValue: Number(data.form_data.zoomsize) || 4,
      zoomSizeText: Number(data.form_data.subheaderfontsize) || 1,
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

  monthMonthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
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
  onResize() {
    if (this.echartsInstance) {
      this.echartsInstance.resize();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove() {
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
