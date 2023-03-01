import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { ApiService, LayoutConfigService, LoaderService } from 'src/app/libs/services';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import {
  on_full_screen_id,
  year_picker_handler,
  month_picker_handler,
  date_picker_handler,
  on_click_overlay,
  convert_metric_to_verbose,
  remapping_color_key,
  get_position,
} from 'src/app/libs/helpers/utility';
import * as collorPalleteFile from 'src/assets/data/color_palette.json';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import {
  customColorPalette,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  setInitialDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { checkIsFilter, modifyDataToChartPresentation } from './helperBarChart';

declare var d3: any;
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

@Component({
  selector: '[pq-bar-async]',
  templateUrl: './bar2.component.html',
  styleUrls: ['./bar2.component.scss'],
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
export class Bar2Component implements OnInit {
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
  colorPalette = [];
  activeClass = '';
  loader$: any;
  meId$: any = [];
  noData: boolean = false;
  mappingExtraFilter: any;
  isFullscreen: boolean = false;
  legendList: any = [];
  isSortLegend: boolean = false;
  isSortLegendValue: boolean = false;
  sortLegend: any = [];
  sortByLegendValue: any = '';
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  filter_granularity_sqla: string;
  isSetDefaultSeries: boolean = false;
  isOnDateFilter: boolean = false;
  colorPaletteJsonFile: any = (collorPalleteFile as any).default;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
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
    if (this.formdata) {
      this.explore.form_data = this.formdata.form_data;
    }
    explore = this.explore;
    this.canDownload = this.explore.canDownload;
    this.canOverwrite = this.explore.canOverwrite;

    let payload = null;

    if (explore.form_data) {
      payload = explore.form_data;
    } else {
      payload = this.explore.form_data;
    }
    let param = {
      form_data: payload,
    };
    if (this.isSortLegend) payload = Object.assign({}, explore.form_data, { page_sort: this.sortLegend });
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
      this.filter_granularity_sqla,
      this.explore
    );
    // set result from check filter
    // perubahan dibawah ini terjadi ketika didalan result check filter terjadi flag
    // jika tidak maka hasil akan default seperti yg ada dihalaman
    this.sinceDate = resultCheckFilter.sinceDate;
    this.untilDate = resultCheckFilter.untilDate;
    this.filter_granularity_sqla = resultCheckFilter.filter_granularity_sqla;
    this.explore = resultCheckFilter.exploreArgs;
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
    // helper untuk memanggil result dari url exploreUrl atau exploreJsonUrl
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
      this.data = await this.configurationChart(exploreJson);
      this.noData = false;
    } else {
      this.noData = true;
    }
  };
  // initial page ketika halaman pertama di render
  setInitialPage = async () => {
    this.mappingExtraFilter = [];

    this.colorPalette = customColorPalette(this.colorPalette, this.colorPaletteJsonFile);

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      await this.findExploreJsonWhenUndefined();
    } else {
      this.noData = false;
      this.explore = this.formdata;
      let exploreJson = this.exploreJson;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
      // set result configurasi dari exploreJson ke series chart
      this.data = await this.configurationChart(exploreJson);
    }

    //set initial chart blank
    if (this.isFilter) {
      this.explore.form_data.initial_chart_blank = false;
    }

    if (
      this.isView &&
      !this.isSetDefaultSeries &&
      this.explore.form_data.set_default_series &&
      this.explore.form_data.set_default_series
    ) {
      this.isSetDefaultSeries = !this.isSetDefaultSeries;
      let legendValue =
        this.explore.form_data.set_default_series && this.explore.form_data.set_default_series
          ? this.explore.form_data.set_default_series
          : '';
      if (this.explore.form_data.columns.length == 0) {
        this.sortByLegendValue = convert_metric_to_verbose(legendValue, this.explore);
      } else {
        this.sortByLegendValue = this.data.legend.data[0];
      }
      this.isSortLegendValue = true;
      this.sortingUseLegend(this.myChartID);
    } else {
      this.chartOption = this.data;
    }

    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter(this.myChartID);
    }
  };

  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    this.meId$ = this.loaderService.getSpesifikID;
    this.setInitialPage();
    let me = this;
    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(me.myChartID);
      me.cdr.detectChanges();
    }, 100);
  }

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

  onFilter(params) {
    if (!this.explore.form_data.chart_on_click) {
      return;
    }
    this.isSetDefaultSeries = true;
    let mydata = {};
    let filterArr = [];
    let arrFilterId = [];
    let urlLinkTo = '/api/dashboard/view?link=';
    let array = this.mappingExtraFilter;
    this.mappingExtraFilter; //isinya [{key : "sum_e", value : "b"}]
    let splitname = params.name.split(' - ');
    let splitseriesname = params.seriesName.split(' - ');
    if (splitname.length > 0) {
      for (let i = 0; i < splitname.length; i++) {
        arrFilterId.push(splitname[i]);
      }
    }
    if (splitseriesname.length > 0 && this.explore.form_data.columns.length > 0) {
      for (let i = 1; i < splitseriesname.length; i++) {
        arrFilterId.push(splitseriesname[i]);
      }
    }
    let splitIndex = 0;
    if (this.explore.form_data.groupby.length > 1) {
      if (this.explore.form_data.is_first_axis_label) {
        let findKey = array.filter((x) => x.key === params.seriesName)[0];
        const element = findKey;
        if (params.seriesName == element.key)
          mydata[element.value] = [{ filter: params.seriesName, id: params.name, metric: 2, text: params.name }];
        if (this.explore.form_data.style_tooltips === 'item') {
          for (let i = 1; i < arrFilterId.length; i++) {
            let val = this.explore.form_data.columns[i - 1];
            mydata[val] = [{ filter: params.seriesName, id: arrFilterId[i], metric: 2, text: arrFilterId[i] }];
          }
        }
      } else if (!this.explore.form_data.is_first_axis_label) {
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          if (params.seriesName == element.key) {
            mydata[element.value] = [
              { filter: params.seriesName, id: arrFilterId[splitIndex], metric: 2, text: arrFilterId[splitIndex] },
            ];
            splitIndex++;
          }
        }
      }
    } else {
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (params.seriesName == element.key) {
          mydata[element.value] = [
            { filter: params.seriesName, id: arrFilterId[splitIndex], metric: 2, text: arrFilterId[splitIndex] },
          ];
          splitIndex++;
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

  sortingUseLegend(id, type?) {
    if ((type == 'checkbox' || type == null) && this.sortByLegendValue == '') return;
    this.isSortLegend = true;
    this.sortLegend = [
      // array of page sorter, case sensitive
      {
        column: this.sortByLegendValue,
        order: this.isSortLegendValue ? 'desc' : 'asc',
      },
    ];
    this.exploreJson = undefined;
    this.ngOnInit();
  }

  onRefresh(id) {
    this.isDateFilter = false;
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

    if (this.isFilter) {
    }
    this.isFilter = false;
    this.exploreJson = undefined;
    this.loaderService.setSpesifikID([id]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  // for dashboard editor
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

  // for dashboard editor

  onDownload(id) {
    if (this.isFilter) {
      this.explore.form_data.extra_filters = this.extraFilter;
    }
    this.download.emit({ id: id, url: this.url, data: this.explore });
  }

  onDelete() {
    this.delete.emit(this.index);
    // this.delete.emit({ elementId: this.cardID, chartId: id });
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

  async configurationChart(data) {
    let locale = data.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(this.formaterNumber[locale]);
    data = remapping_color_key(data);
    let me = this;
    // modify data from exploreJson to series chart untuk presentation
    // didalam fungsi modifyDataToChartPresentation itu juga melakukan perubahan pada local varible
    // local varialbe yang mengalami perubahan mappingExtraFilter, legendList, theme
    let resultmodifyDataToChartPresentation = await modifyDataToChartPresentation(
      data,
      data.form_data.viz_type,
      me.explore,
      this.mappingExtraFilter,
      this.data,
      this.colorPalette,
      me.colorPalette,
      d3
    );
    this.mappingExtraFilter = resultmodifyDataToChartPresentation.mappingExtraFilter;
    this.legendList = resultmodifyDataToChartPresentation.legendList;
    this.theme = resultmodifyDataToChartPresentation.theme;
    return resultmodifyDataToChartPresentation;
  }

  onFullscreen(cardId) {
    this.isFullscreen = true;
    on_full_screen_id('myDiv-' + cardId);
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    chosenDate.set({ date: 1 });
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    let result = year_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  yearMonthPickerHandler(normalizedYear: Moment, type) {}

  monthMonthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    let result = month_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  datePickerHandler(chosenDate: Moment, type) {
    if (type === 'since') this.sinceDate = chosenDate;
    else if (type === 'until') this.untilDate = chosenDate;
    let result = date_picker_handler(moment, this.sinceDate, this.untilDate, this.explore.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    this.OnDatePickerFilter();
  }

  async OnDatePickerFilter() {
    this.isOnDateFilter = true;
    this.exploreJson = undefined;
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
