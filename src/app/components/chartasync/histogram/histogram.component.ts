import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { ApiService, LayoutConfigService, LoaderService } from 'src/app/libs/services';
import { FormControl } from '@angular/forms';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import {
  date_picker_handler,
  get_position,
  month_picker_handler,
  on_click_overlay,
  on_full_screen_id,
  year_picker_handler,
} from 'src/app/libs/helpers/utility';
import _ from 'lodash';
import * as collorPalleteFile from 'src/assets/data/color_palette.json';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import { MatDatepicker } from '@angular/material/datepicker';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  loadPostExploreJsonResult,
  parseDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { getConfigChartHistogram, setConfigChartHistogram } from './helper.histogram';

declare var d3: any;
const moment = _rollupMoment || _moment;

@Component({
  selector: '[pq-histogram]',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit {
  // check width
  @ViewChild('histogram')
  divHistogram: ElementRef;

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
  isSortLegendValue: boolean = true;
  sortLegend: any = [];
  sortByLegendValue: any = '';
  formaterNumber: any;
  sinceDate: any;
  untilDate: any;
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  filter_granularity_sqla: string;
  isSetDefaultSeries: boolean = false;
  colorPaletteJsonFile: any = (collorPalleteFile as any).default;
  formatNumberIdJsonFile: any = (formatNumberIdFile as any).default;
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {}
  margin = { top: 50, right: 50, bottom: 70, left: 50 };

  async ngOnInit() {
    this.formaterNumber = this.formatNumberIdJsonFile;
    let config = this.layoutConfigService.getConfig();
    this.meId$ = this.loaderService.getSpesifikID;
    this.mappingExtraFilter = [];
    var explore = {
      form_data: {},
    };

    for (var i = 0; i < this.colorPaletteJsonFile.length; i++) {
      this.colorPalette['palette' + (i + 1)] = this.colorPaletteJsonFile[i];
    }

    var exploreJson: any;
    if (this.exploreJson == undefined) {
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

      if (this.isSortLegend) payload = Object.assign({}, explore.form_data, { page_sort: this.sortLegend });

      var param = {
        form_data: JSON.stringify(payload),
      };
      param = this.setDateFilter(param, explore);
      exploreJson = await this.setInitialDate(
        exploreJsonUrl,
        param,
        //get explore json url data from service backend
        await loadPostExploreJsonResult(exploreJsonUrl, param, this._apicall)
      );
      config = await this.getConfigChart(exploreJson);
      this.noData = exploreJson === undefined;
    } else {
      this.noData = false;
      this.explore = this.exploreJson;
      exploreJson = this.exploreJson;
      if (!this.isFilter) {
        this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
        this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
      }
      config = await this.getConfigChart(exploreJson);
    }

    this.data = config[0];

    //set initial chart blank
    if (this.isFilter) {
      this.explore.form_data.initial_chart_blank = false;
    }

    let me = this;
    if (!me.noData) {
      let themes = this.explore.form_data.color_scheme
        ? this.explore.form_data.color_scheme != 'bnbColors'
          ? this.explore.form_data.color_scheme
          : 'palette1'
        : 'palette1';

      if (this.explore) {
        this.canDownload = this.explore.canDownload;
        this.canOverwrite = this.explore.canOverwrite;
      }
      this.theme = themes ? themes : 'palette1';
      this.chartOption = this.data;
    }
    if (this.explore && this.explore.form_data && this.explore.form_data.is_hide_togle_filter) {
      this.onToggleFilter(this.myChartID);
    }

    let colorPicker =
      this.explore.form_data.colorpickers.length > 0
        ? this.explore.form_data.colorpickers[0].colorpicker
        : [
            {
              entity: 'Value',
              colorpicker: '#117A8B',
            },
            {
              entity: 'Label Name',
              colorpicker: '#117A8B',
            },
          ];

    let colorLabel =
      this.explore.form_data.colorpickers.length > 0 ? this.explore.form_data.colorpickers[1].colorpicker : '#808080';

    let exploreJsonHistogram = this.exploreJson == undefined ? exploreJson : this.exploreJson;
    await this.d3Histogram('histogram', exploreJsonHistogram, colorPicker, colorLabel);

    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
      me.cdr.detectChanges();
    }, 100);
  }

  // Tambahan fungsi yang ga ada di existing

  yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    chosenDate.set({ date: 1 });
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.untilDate;
    let result = year_picker_handler(moment, this.sinceDate, this.untilDate, this.formdata.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  yearMonthPickerHandler(normalizedYear: Moment, type) {}

  monthMonthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.untilDate;
    let result = month_picker_handler(moment, this.sinceDate, this.untilDate, this.formdata.form_data.filter_date);
    this.sinceDate = result[0];
    this.untilDate = result[1];
    datepicker.close();
    this.OnDatePickerFilter();
  }

  datePickerHandler(chosenDate: Moment, type) {
    this.sinceDate = type === 'since' ? chosenDate : this.sinceDate;
    this.untilDate = type === 'until' ? chosenDate : this.sinceDate;
    let result = date_picker_handler(moment, this.sinceDate, this.untilDate, this.formdata.form_data.filter_date);
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
    let exploreJsonResult = await this._apicall.loadPostData(url, param); // ask
    this.exploreJson = exploreJsonResult
      ? exploreJsonResult.response
        ? exploreJsonResult.response
        : exploreJsonResult
      : exploreJsonResult;
    this.noData = this.exploreJson === undefined;
    this.ngOnInit();
  }

  onFullscreen(cardId) {
    this.isFullscreen = true;
    on_full_screen_id('myDiv-' + cardId);
  }

  viewDetailChart(e) {
    this.searchResultJumpTo.emit(e);
  }
  // Tambahan fungsi yang ga ada di existing
  onChartInit(e: any) {
    this.echartsInstance = e;
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
      this.formdata.form_data.extra_filters = this.extraFilter;
    }
    this.download.emit({ id: id, url: this.url, data: this.formdata });
  }

  onDelete() {
    this.delete.emit(this.index);
  }

  async setInitialDate(url, param, exploreJson) {
    if (
      exploreJson !== undefined &&
      !this.isDateFilter &&
      !this.isInitialDateFilter &&
      exploreJson.form_data.initial_date_filter != null &&
      exploreJson.form_data.initial_date_filter != '' &&
      exploreJson.form_data.initial_date_filter !== undefined
    ) {
      if (exploreJson.form_data.initial_date_filter === 'current_date') {
        let currentDate = new Date();
        if (exploreJson.form_data.filter_date_type === 'date') {
          this.sinceDate = moment(currentDate).startOf('day');
          this.untilDate = moment(currentDate).endOf('day');
        } else if (exploreJson.form_data.filter_date_type === 'month') {
          this.sinceDate = moment(currentDate).startOf('month');
          this.untilDate = moment(currentDate).endOf('month');
        } else if (exploreJson.form_data.filter_date_type === 'year') {
          this.sinceDate = moment(currentDate).startOf('year').startOf('month');
          this.untilDate = moment(currentDate).endOf('year').endOf('month');
        }
      } else {
        if (exploreJson.form_data.filter_date_type === 'date') {
          this.sinceDate = moment(exploreJson.latest_date).startOf('day');
          this.untilDate = moment(exploreJson.latest_date).endOf('day');
        } else if (exploreJson.form_data.filter_date_type === 'month') {
          this.sinceDate = moment(exploreJson.latest_date).startOf('month');
          this.untilDate = moment(exploreJson.latest_date).endOf('month');
        } else if (exploreJson.form_data.filter_date_type === 'year') {
          this.sinceDate = moment(exploreJson.latest_date).startOf('year').startOf('month');
          this.untilDate = moment(exploreJson.latest_date).endOf('year').endOf('month');
        }
      }
      exploreJson.form_data.since = this.sinceDate;
      exploreJson.form_data.until = this.untilDate;
      param = {
        form_data: JSON.stringify(exploreJson.form_data),
      };
      exploreJson = await helperGetExplorerChart(this.explore, url, this.token, '', this._apicall, this.fdata, param);
    }
    return exploreJson;
  }

  setDateFilter(param, formdata) {
    if (this.isFilter) param = Object.assign({}, this.explore.form_data, { extra_filters: this.extraFilter });

    if (this.isFilter && this.extraFilter.length > 0) {
      for (var i = 0; i < this.extraFilter.length; i++) {
        if (this.extraFilter[i].col === '__from') {
          this.sinceDate = this.extraFilter[i].val;
        } else if (this.extraFilter[i].col === '__to') {
          this.untilDate = this.extraFilter[i].val;
        } else if (this.extraFilter[i].col === '__time_col') {
          this.filter_granularity_sqla = this.extraFilter[i].val;
        } else {
          let filteredDate: any;
          let value = Array.isArray(this.extraFilter[i].val) ? this.extraFilter[i].val[0] : this.extraFilter[i].val;
          let isUtc = parseDate(value);
          if (isUtc) {
            filteredDate = moment(value).format('YYYY-MM-DD');
            this.sinceDate = moment(filteredDate).startOf('day');
            this.untilDate = moment(filteredDate).endOf('day');
          }
        }
      }
    }

    if (this.isFilter && (this.isDateFilter || this.isInitialDateFilter)) {
      this.explore.form_data.since = '';
      this.explore.form_data.until = '';
      param = {
        form_data: JSON.stringify(
          this.isFilter
            ? Object.assign({}, formdata.form_data, {
                extra_filters: this.extraFilter,
              })
            : formdata.form_data
        ),
      };
    }
    return param;
  }

  async d3Histogram(selector, exploreJsonD3Histogram, colorPicker, colorLabel) {
    let theme = exploreJsonD3Histogram.form_data.color_scheme
      ? exploreJsonD3Histogram.form_data.color_scheme != 'bnbColors'
        ? exploreJsonD3Histogram.form_data.color_scheme
        : 'palette1'
      : 'palette1';
    let colorPalette = this.colorPalette[theme];

    let widthOffSetDiv = this.divHistogram.nativeElement.offsetWidth - this.margin.left - this.margin.right;
    let heightOffSetDiv = this.divHistogram.nativeElement.offsetHeight - this.margin.top - this.margin.bottom;

    var elem = d3.select(`.${selector}`).selectAll('*');
    if (elem) elem.remove();
    let datahistogram = exploreJsonD3Histogram;

    const data = exploreJsonD3Histogram.data.values;
    var maxVal = _.maxBy(data, (d: any) => d.value).value;
    var minVal = _.minBy(data, (d: any) => d.value).value;

    var svg = d3
      .select(`.${selector}`)
      .append('svg')
      .attr('width', widthOffSetDiv + this.margin.left + this.margin.right)
      .attr('height', heightOffSetDiv + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    let range = widthOffSetDiv;
    if (
      datahistogram &&
      datahistogram.form_data &&
      datahistogram.form_data.range != null &&
      datahistogram.form_data.range != ''
    ) {
      if (parseInt(datahistogram.form_data.range) > 0) {
        range = parseInt(datahistogram.form_data.range);
      }
    }

    let domain = maxVal;
    if (
      datahistogram &&
      datahistogram.form_data &&
      datahistogram.form_data.domain != '' &&
      datahistogram.form_data.domain != null
    ) {
      if (parseInt(datahistogram.form_data.domain) > 0) {
        domain = parseInt(datahistogram.form_data.domain);
      }
    }

    var x = d3
      .scaleLinear()
      .domain([minVal, domain]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, range]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + heightOffSetDiv + ')')
      .call(d3.axisBottom(x));

    var histogram = d3
      .histogram()
      .value(function (d) {
        return d.value;
      }) // I need to give the vector of value
      .domain(x.domain()); // then the domain of the graphic

    var bins = histogram(data);

    // Y axis: scale and draw:
    var y = d3.scaleLinear().range([heightOffSetDiv, 0]);
    y.domain([
      0,
      d3.max(bins, function (d) {
        return d.length;
      }),
    ]); // d3.hist has to be called before the Y axis obviously
    svg.append('g').call(d3.axisLeft(y));

    //tooltip
    var tooltip = d3
      .select(`.${selector}`)
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .style('background-color', 'black')
      .style('color', 'white')
      .style('border-radius', '5px')
      .style('padding', '10px');

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var showTooltip = function (d) {
      tooltip.transition().duration(100).style('opacity', 1);
      tooltip.html('Range: ' + d.x0 + ' - ' + d.x1) +
        ' = ' +
        d.length
          .style('cursor', 'pointer')
          .style('left', `${d3.event.layerX}px`)
          .style('top', `${d3.event.layerY - 28}px`);
    };
    var moveTooltip = function (d) {
      tooltip
        .style('cursor', 'pointer')
        .style('left', `${d3.event.layerX}px`)
        .style('top', `${d3.event.layerY - 28}px`);
    };
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var hideTooltip = function (d) {
      tooltip.transition().duration(100).style('opacity', 0);
    };
    //akhir tooltip

    svg
      .selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', 1)
      .attr('transform', function (d) {
        return 'translate(' + x(d.x0) + ',' + y(d.length) + ')';
      })
      .attr('width', function (d) {
        return x(d.x1) - x(d.x0) - 1;
      })
      .attr('height', function (d) {
        return heightOffSetDiv - y(d.length);
      })
      .style('fill', (d) =>
        colorPicker != null ? colorPicker : colorPalette[Math.floor(Math.random() * colorPalette.length)]
      )
      .on(
        'mouseover',
        datahistogram && datahistogram.form_data && datahistogram.form_data.chart_tooltip ? showTooltip : function () {}
      )
      .on(
        'mousemove',
        datahistogram && datahistogram.form_data && datahistogram.form_data.chart_tooltip ? moveTooltip : function () {}
      )
      .on(
        'mouseleave',
        datahistogram && datahistogram.form_data && datahistogram.form_data.chart_tooltip ? hideTooltip : function () {}
      );

    if (
      datahistogram &&
      datahistogram.form_data &&
      datahistogram.form_data.y_axis_label != '' &&
      datahistogram.form_data.y_axis_label != null
    ) {
      svg
        .append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'end')
        .attr('x', widthOffSetDiv / 2)
        .attr('y', heightOffSetDiv + 40)
        .style('fill', 'grey')
        .text(datahistogram.form_data.y_axis_label);
    }

    if (
      datahistogram &&
      datahistogram.form_data &&
      datahistogram.form_data.x_axis_label != '' &&
      datahistogram.form_data.x_axis_label != null
    ) {
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - this.margin.left)
        .attr('x', 0 - heightOffSetDiv / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', 'grey')
        .text(datahistogram.form_data.x_axis_label);
    }

    svg
      .selectAll('text.bar')
      .data(bins)
      .enter()
      .append('text')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return (x(d.x1) + x(d.x0)) / 2;
      })
      .attr('y', function (d) {
        return y(d.length) - 10;
      })
      .attr('text-anchor', 'middle')
      .style('fill', colorLabel)
      .text(function (d) {
        if (d.length > 0) return d.length;
      });
  }

  onToggleFilter(id) {
    let cardId = this.cardID;

    $('#' + cardId + ' .containerList').toggleClass('d-none');
    $('#' + cardId + ' .histogram').toggleClass('h-85');
    this.cdr.detectChanges();
  }

  async loadChartData(url, param) {
    let result = await this._apicall.loadPostData(url, param);
    let value = result ? (result.response ? result.response : result) : result;
    return value;
  }

  getConfigChart = (data) => {
    if (data == undefined) this.noData = true;
    else return getConfigChartHistogram(data, this.explore, this.colorPalette);
  };

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.onRefresh(this.myChartID);
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
