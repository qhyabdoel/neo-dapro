import {
  Component,
  OnInit,
  Input,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { LayoutConfigService, LoaderService, ApiService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import cloudLayout from 'd3-cloud';
import _ from 'lodash';
import {
  gen_random_number,
  on_full_screen_id,
  validate_date,
  get_position,
  year_picker_handler,
  month_picker_handler,
  date_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
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
  selector: '[pq-d3-cloud-async]',
  templateUrl: './d3-cloud.component.html',
  styleUrls: ['./d3-cloud.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class D3CloudComponent implements OnInit {
  // check width
  @ViewChild('wordCloud')
  divWordCloud: ElementRef;
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
  theme: string;
  echartsInstance: any;
  det: any;
  dragHandle = false;
  dragBounds = true;
  canDownload = false;
  canOverwrite = false;

  colorPalette = {};
  activeClass = '';
  meId$: any = [];
  noData = false;

  isFullscreen: boolean = false;
  sinceDate: any;
  untilDate: any;
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  mappingExtraFilter: any;
  filter_granularity_sqla: string;
  random: number;

  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {
    this.random = gen_random_number(1, 100);
  }

  findExploreJsonWhenUndefined = async () => {
    let exploreJson: any;
    let formdata = {
      form_data: {},
    };
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);

    if (!this.token) {
      formdata = await helperGetExplorerChart(this.formdata, '', this.token, exploreUrl, this._apicall, this.fdata);
      this.formdata = formdata;
    } else {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
      formdata.form_data = this.fdata;
      this.formdata = formdata;
    }
    this.url = exploreUrl;

    var param = {
      form_data: JSON.stringify(
        this.isFilter
          ? Object.assign({}, formdata.form_data, {
              extra_filters: this.extraFilter,
            })
          : formdata.form_data
      ),
    };
    param = this.setFilter(param);
    param = this.setInitialDate(param);

    exploreJson = await helperGetExplorerChart(
      this.formdata,
      exploreJsonUrl,
      this.token,
      '',
      this._apicall,
      this.fdata,
      param
    );

    if (exploreJson) {
      this.explore = await helperGetExplorerChart(this.formdata, '', this.token, exploreUrl, this._apicall, this.fdata);
      if (this.token) this.formdata = this.explore;
    } else {
      this.noData = true;
    }
    return exploreJson;
  };
  async ngOnInit() {
    const config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    await this._apicall.get('/assets/data/color_palette.json').subscribe(async (result) => {
      for (var i = 0; i < result.length; i++) {
        this.colorPalette['palette' + (i + 1)] = result[i];
      }
      // for has chartId
      this.mappingExtraFilter = [];
      let exploreJson: any;

      if (!this.exploreJson) {
        // set result configurasi dari exploreJson ke series chart
        exploreJson = await this.findExploreJsonWhenUndefined();
      } else {
        exploreJson = this.exploreJson;
        if (!this.isFilter) {
          this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
          this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
        }
      }

      //set initial chart blank
      if (this.isFilter) {
        this.formdata.form_data.initial_chart_blank = false;
      }

      let me = this;
      if (!me.noData) {
        // new d3-cloud
        let exploreJsonD3Wordcloud = !this.exploreJson ? exploreJson : this.exploreJson;
        await this.d3WordCloud(`wordCloud-${String(this.random)}`, exploreJsonD3Wordcloud);

        let themes = this.formdata.form_data.color_scheme
          ? this.formdata.form_data.color_scheme != 'bnbColors'
            ? this.formdata.form_data.color_scheme
            : 'palette1'
          : 'palette1';

        if (this.formdata) {
          this.canDownload = this.formdata.canDownload;
          this.canOverwrite = this.formdata.canOverwrite;
        }
        this.theme = themes ? themes : 'palette1';
        let theme = themes ? themes : 'palette1';
        if (skin == 'light') {
          this.theme = this.theme + 'L';
        }
        this.chartOption = this.data;
      }
      if (this.formdata && this.formdata.form_data && this.formdata.form_data.is_hide_togle_filter) {
        this.onToggleFilter(this.myChartID);
      }

      this.det = setTimeout(function () {
        me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
        me.cdr.detectChanges();
      }, 500);
    });
  }

  setInitialDate = (param) => {
    //initial date filter
    if (
      param &&
      param.form_data.initial_date_filter != null &&
      param.form_data.initial_date_filter != '' &&
      param.form_data.initial_date_filter &&
      !this.isDateFilter &&
      !this.isInitialDateFilter
    ) {
      if (param.form_data.initial_date_filter === 'current_date') {
        console.log('initial date from current date');
        let currentDate = new Date();
        if (param.form_data.filter_date_type === 'date') {
          this.sinceDate = moment(currentDate).startOf('day');
          this.untilDate = moment(currentDate).endOf('day');
        } else if (param.form_data.filter_date_type === 'month') {
          this.sinceDate = moment(currentDate).startOf('month');
          this.untilDate = moment(currentDate).endOf('month');
        } else if (param.form_data.filter_date_type === 'year') {
          this.sinceDate = moment(currentDate).startOf('year').startOf('month');
          this.untilDate = moment(currentDate).endOf('year').endOf('month');
        }
      } else {
        console.log('initial date from latest date');
        if (param.form_data.filter_date_type === 'date') {
          this.sinceDate = moment(param.latest_date).startOf('day');
          this.untilDate = moment(param.latest_date).endOf('day');
        } else if (param.form_data.filter_date_type === 'month') {
          this.sinceDate = moment(param.latest_date).startOf('month');
          this.untilDate = moment(param.latest_date).endOf('month');
        } else if (param.form_data.filter_date_type === 'year') {
          this.sinceDate = moment(param.latest_date).startOf('year').startOf('month');
          this.untilDate = moment(param.latest_date).endOf('year').endOf('month');
        }
      }
      this.formdata.form_data.since = moment(this.sinceDate).format('YYYY-MM-DDTHH:mm:ss');
      this.formdata.form_data.until = moment(this.untilDate).format('YYYY-MM-DDTHH:mm:ss');

      param = {
        form_data: JSON.stringify(
          this.isFilter
            ? Object.assign({}, this.formdata.form_data, {
                extra_filters: this.extraFilter,
              })
            : this.formdata.form_data
        ),
      };
    }
    return param;
  };
  setFilter = (param) => {
    //check if there is a date in extra filter
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
          let isUtc = this.parseDate(value);
          if (isUtc) {
            filteredDate = moment(value).format('YYYY-MM-DD');
            this.sinceDate = moment(filteredDate).startOf('day');
            this.untilDate = moment(filteredDate).endOf('day');
          }
        }
      }
    }
    if (this.isFilter && (this.isDateFilter || this.isInitialDateFilter)) {
      this.formdata.form_data.since = '';
      this.formdata.form_data.until = '';
    }

    return param;
  };

  onChartInit(e: any) {
    this.echartsInstance = e;
    this.echartsInstance.resize();
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

    this.ngOnInit();
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  parseDate(dateStr) {
    return validate_date(dateStr);
  }

  async d3WordCloud(selector, exploreJsonD3Wordcloud) {
    let w = this.divWordCloud.nativeElement.offsetWidth;
    let h = this.divWordCloud.nativeElement.offsetHeight;

    let words = exploreJsonD3Wordcloud.data;
    const fd = exploreJsonD3Wordcloud.form_data;
    let _this = this;
    for (var i = 0; i < words.length; i++) {
      let groupby = { key: words[i].text, value: fd.series };
      this.mappingExtraFilter.push(groupby);
    }
    var data = _.map(words, (d) => ({
      size: d.size > 0 ? d.size : 1,
      size2: d.size > 0 ? d.size : 1,
      text: d.text,
    }));
    const fontFamily = fd.font_family || 'Impact';
    const spiralArch = fd.spiral || 'rectangular';
    const rotation = fd.rotation;
    let fRotation;
    if (rotation === 'square') {
      fRotation = () => ~~(Math.random() * 2 * 90);
    } else if (rotation === 'flat') {
      fRotation = () => 0;
    } else {
      fRotation = () => ~~(Math.random() * 2) * 30;
    }
    const size = [w, h];

    // calculate ration between layout-size : window-size
    // set min value as scale factor
    const scaleFactor = _.minBy([w / window.innerWidth, h / window.innerHeight]);
    var maxVal = _.maxBy(data, (d: any) => d.size).size;
    var minVal = _.minBy(data, (d: any) => d.size).size;
    let theme = exploreJsonD3Wordcloud.form_data.color_scheme
      ? exploreJsonD3Wordcloud.form_data.color_scheme != 'bnbColors'
        ? exploreJsonD3Wordcloud.form_data.color_scheme
        : 'palette1'
      : 'palette1';
    let colorPalette = _this.colorPalette[theme];

    // function to scale font
    var scaleLog = d3
      .scaleLog()
      .domain([minVal, maxVal])
      .range([1, 100 * scaleFactor]);
    var scalePow = d3.scalePow().domain([0, 1]).range([minVal, maxVal]).exponent(5);
    var scaleLinear = d3.scaleLinear().range([10, 100]);
    // new tooltip render
    var chart = d3.select(`.${selector}`).append('svg');
    var focus = chart.append('g');
    const draw = (words) => {
      d3.select(`.${selector}`).selectAll('*').remove();
      //
      chart = d3.select(`.${selector}`).append('svg').attr('width', layout.size()[0]).attr('height', layout.size()[1]);
      // chart.append("g")
      focus = chart.append('g').attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`);

      focus
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', (d) => d.size + 'px')
        .style('-webkit-touch-callout', 'none')
        .style('-webkit-user-select', 'none')
        .style('-khtml-user-select', 'none')
        .style('-moz-user-select', 'none')
        .style('-ms-user-select', 'none')
        .style('user-select', 'none')
        .style('cursor', 'default')
        .style('font-family', 'Impact')
        .style('fill', (d) => colorPalette[Math.floor(Math.random() * colorPalette.length)])
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => {
          return `translate(${d.x}, ${d.y}) rotate(${d.rotate})`;
        })
        .text((d) => d.text)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', handleDblclick)
        .on('dblclick', handleDblclick);
    };

    const handleDblclick = (d) => {
      d = Object.assign({}, d, { name: d.text, seriesName: d.text });
      _this.onFilter(d);
    };
    const handleMouseOver = (d) => {
      var group = focus.append('g').attr('id', 'tooltips-titles');
      var base = d.y - d.size;
      var opt = data.filter((x) => x.size == d.size && x.text == d.text) || [
        {
          text: '',
          size: 0,
          size2: 0,
        },
      ];
      group
        .selectAll('text')
        .data(opt)
        .enter()
        .append('text')

        .style('z-index', '9999')
        .style('margin', '15px')
        .style('fill', '#ffffff')
        .style('font-size', '10px')
        .attr('x', d.x)
        .attr('y', function (title, i) {
          return base - i * 14;
        })
        .attr('text-anchor', 'middle')
        .text(function (d) {
          return d.text + ' : ' + d.size2;
        });

      var bbox = group.node().getBBox();
      var bboxPadding = 7;

      // place a white background to see text more clearly
      var rect = group
        .insert('rect', ':first-child')
        .attr('x', bbox.x - 6)
        .attr('y', bbox.y - 3)
        .attr('width', bbox.width + bboxPadding + 7)
        .attr('height', bbox.height + bboxPadding)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'rgba(50, 50, 50, 0.7)')
        .attr('class', 'label-background-strong');
    };

    const handleMouseOut = (d) => {
      d3.select('#tooltips-titles').remove();
    };
    const layout = cloudLayout()
      .size([w, h])
      .padding(fd.distance || 0)
      .words(data)
      .font(fontFamily)
      .rotate(fRotation)
      .spiral(spiralArch)
      .fontSize((d) => {
        if (fd.scale == 'linear') {
          return scaleLinear(d.size / maxVal);
        } else if (fd.scale == 'akarN') {
          return scalePow(d.size / maxVal);
        } else if (fd.scale == 'N') {
          return d.size / maxVal;
        } else {
          return scaleLog(d.size);
        }
      })
      .on('end', draw);

    layout.start();
    this.cdr.detectChanges();
  }
  onFilter(params) {
    if (!this.formdata.form_data.chart_on_click) {
      return;
    }
    let mydata = {};
    let filterArr = [];
    let urlLinkTo = '/api/dashboard/view?link=';
    let array = this.mappingExtraFilter;
    this.mappingExtraFilter; //isinya [{key : "sum_e", value : "b"}]
    let split = params.name.split(' - ');
    let splitIndex = 0;

    if (this.formdata.form_data.series.length > 1) {
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (params.seriesName == element.key) {
          mydata[element.value] = [
            { filter: params.seriesName, id: split[splitIndex], metric: 2, text: split[splitIndex] },
          ];
        }
      }
    } else {
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (params.seriesName == element.key)
          mydata[element.value] = [{ filter: params.seriesName, id: params.name, metric: 2, text: params.name }];
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
    if (this.formdata.form_data.filters.length > 0) {
      for (let i = 0; i < this.formdata.form_data.filters.length; i++) {
        let key = this.formdata.form_data.filters[i].col;
        let selectedColumn;
        if (mydata[key] && mydata[key].length > 0) {
          selectedColumn = this.formdata.form_data.filters[i].val;
          let filterObj = {
            filter: selectedColumn,
            id: selectedColumn,
            metric: 2,
            text: selectedColumn,
            op: this.formdata.form_data.filters[i].op,
          };
          mydata[key].push(filterObj);
        } else {
          selectedColumn = this.formdata.form_data.filters[i].val;
          mydata[key] = [
            {
              filter: selectedColumn,
              id: selectedColumn,
              metric: 2,
              text: selectedColumn,
              op: this.formdata.form_data.filters[i].op,
            },
          ];
        }
      }
    }

    let param = {
      id: this.myChartID,
      data: this.formdata,
      filter: {
        data: mydata,
        since: this.sinceDate,
        until: this.untilDate,
        timecolumn: this.isDateFilter ? this.filter_granularity_sqla : this.formdata.form_data.granularity_sqla,
      },
      url: '/api/chart/explore/?form_data=%7B%22slice_id%22%3A143%7D',
      slug: this.slug,
      isLinkTo: this.formdata.form_data.chart_on_click,
      linkTo: urlLinkTo + this.formdata.form_data.link_to,
      isFilter: true,
      isItemChart: true,
    };
    console.log(param);
    this.filter.emit(param);
  }

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

    this.exploreJson = await helperGetExplorerChart(
      this.formdata,
      url,
      this.token,
      '',
      this._apicall,
      this.fdata,
      param
    );
    this.noData = this.exploreJson === undefined;
    this.ngOnInit();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.ngOnInit();
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
