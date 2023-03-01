import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { LayoutConfigService, LoaderService, ApiService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
import * as _moment from 'moment';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import _ from 'lodash';
import {
  mergedArr,
  on_full_screen_id,
  get_position,
  year_picker_handler,
  month_picker_handler,
  date_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import { KeyValue } from '@angular/common';
import { static_row_limit } from 'src/app/libs/helpers/constant_datavisualization';
import {
  getRandomInt,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  parseDate,
} from 'src/app/libs/helpers/data-visualization-helper';
import { distinctArrayObject } from './helperforce.component';

const moment = _rollupMoment || _moment;
declare let d3: any;
declare let $: any;

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
  selector: '[pq-d3-directed-force-async]',
  templateUrl: './d3-directed-force.component.html',
  styleUrls: ['./d3-directed-force.component.scss'],
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
export class D3DirectedForceComponent implements OnInit {
  // check width
  @ViewChild('directedForce')
  divDirectedForce: ElementRef;
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
  activeClass = '';
  meId$: any = [];
  colorPalette = [];
  noData = false;
  isFullscreen: boolean = false;
  sinceDate: any;
  untilDate: any;
  sinceDateFC = new FormControl(moment());
  untilDateFC = new FormControl(moment());
  mappingExtraFilter: any;
  filter_granularity_sqla: string;

  row_limit: number;
  show_row_limit: boolean;
  update_row_limit: boolean = false;
  list_row_limit: Array<any>;

  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };

  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService
  ) {}

  findExploreJsonWhenUndefined = async () => {
    let exploreJson = null;
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    let formdata = {
      form_data: {},
    };

    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
      formdata.form_data = this.fdata;
      this.formdata = formdata;
    } else {
      let result = await helperGetExplorerChart(this.formdata, '', this.token, exploreUrl, this._apicall, this.fdata);
      this.formdata = result;
    }

    let param = {
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
      if (!exploreJson) this.noData = true;
    } else {
      this.noData = true;
    }
  };

  async ngOnInit() {
    this.list_row_limit = static_row_limit;

    const layoutConfig = this.layoutConfigService.getConfig();
    let skin = objectPath.get(layoutConfig, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    // for has chartId
    this.mappingExtraFilter = [];
    await this._apicall.get('/assets/data/color_palette.json').subscribe(async (result) => {
      for (let i = 0; i < result.length; i++) {
        this.colorPalette['palette' + (i + 1)] = result[i];
      }

      let exploreJson: any;
      if (!this.exploreJson) {
        // set result configurasi dari exploreJson ke series chart
        await this.findExploreJsonWhenUndefined();
      } else {
        if (!this.isFilter) {
          this.sinceDate = this.exploreJson.form_data.since ? moment(this.exploreJson.form_data.since) : '';
          this.untilDate = this.exploreJson.form_data.until ? moment(this.exploreJson.form_data.until) : '';
        }
      }
      this.data = {};
      //set initial chart blank
      if (this.isFilter) {
        this.formdata.form_data.initial_chart_blank = false;
      }

      let me = this;
      if (!me.noData) {
        let themes = this.formdata.form_data.color_scheme
          ? this.formdata.form_data.color_scheme != 'bnbColors'
            ? this.formdata.form_data.color_scheme
            : 'palette1'
          : 'palette1';

        if (this.formdata) {
          this;
          this.canDownload = this.formdata.canDownload;
          this.canOverwrite = this.formdata.canOverwrite;
        }
        this.theme = themes ? themes : 'palette1';
        if (skin == 'light') {
          this.theme = this.theme + 'L';
        }
        this.chartOption = this.data;
      }

      let exploreJsond3DirectedForce = !this.exploreJson ? exploreJson : this.exploreJson;

      if (this.update_row_limit) {
        exploreJsond3DirectedForce.form_data.row_limit = this.row_limit;
        exploreJsond3DirectedForce.rowcount =
          exploreJsond3DirectedForce.rowcount < this.row_limit
            ? exploreJsond3DirectedForce.rowcount
            : this.row_limit - 1;
        exploreJsond3DirectedForce.data = exploreJsond3DirectedForce.data.slice(0, this.row_limit - 1);
      } else {
        this.row_limit = exploreJsond3DirectedForce.form_data.row_limit;
        this.show_row_limit = exploreJsond3DirectedForce.form_data.show_row_limit;
      }

      await this.d3DirectedForce(exploreJsond3DirectedForce);

      if (this.formdata && this.formdata.form_data && this.formdata.form_data.is_hide_togle_filter) {
        this.onToggleFilter(this.myChartID);
      }
      this.det = setTimeout(function () {
        me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
        me.cdr.detectChanges();
      }, 100);
    });
  }

  setInitialDate(exploreJson) {
    if (
      exploreJson &&
      exploreJson.form_data.initial_date_filter != null &&
      exploreJson.form_data.initial_date_filter != '' &&
      exploreJson.form_data.initial_date_filter &&
      !this.isDateFilter &&
      !this.isInitialDateFilter &&
      !this.noData
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
      this.formdata.form_data.since = moment(this.sinceDate).format('YYYY-MM-DDTHH:mm:ss');
      this.formdata.form_data.until = moment(this.untilDate).format('YYYY-MM-DDTHH:mm:ss');
    }
    return exploreJson;
  }

  setFilter(param) {
    if (this.isFilter && this.extraFilter.length > 0) {
      for (let i = 0; i < this.extraFilter.length; i++) {
        if (this.extraFilter[i].col === '__from') {
          this.sinceDate = this.extraFilter[i].val;
        } else if (this.extraFilter[i].col === '__to') {
          this.untilDate = this.extraFilter[i].val;
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
      this.formdata.form_data.since = '';
      this.formdata.form_data.until = '';
    }

    return param;
  }

  onChartInit(e: any) {
    this.echartsInstance = e;
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
    this.cdr.detectChanges();
  }

  async d3DirectedForce(exploreJsond3DirectedForce) {
    let widthOffSetDiv = this.divDirectedForce.nativeElement.offsetWidth;
    let heightOffSetDiv = this.divDirectedForce.nativeElement.offsetHeight;

    let elem = d3.select(`#directedForce-${this.myChartID}`).selectAll('*');
    if (elem) elem.remove();
    const div = d3.select(`#directedForce-${this.myChartID}`);
    let data = exploreJsond3DirectedForce.data;
    let fd = exploreJsond3DirectedForce.form_data;
    let loop = data.length / 130;
    let _this = this;
    let categories = [];
    let source = [];
    let group = [];
    let cat = [];
    let value = [];
    let percentage = [];
    let adjlist = [];
    let theme = exploreJsond3DirectedForce.form_data.color_scheme
      ? exploreJsond3DirectedForce.form_data.color_scheme != 'bnbColors'
        ? exploreJsond3DirectedForce.form_data.color_scheme
        : 'palette1'
      : 'palette1';
    let colorPalette = _this.colorPalette[theme];

    //reformat date
    for (let i = 0; i < data.length; i++) {
      let values = data[i];

      for (let prop in values) {
        if (Object.prototype.hasOwnProperty.call(values, prop)) {
          if (typeof values[prop] === 'string') {
            let isUTC = parseDate(values[prop]);
            if (isUTC) {
              let formatedDate = moment(values[prop]).format('DD/MM/YYYY');
              values[prop] = formatedDate;
            } else {
              values[prop] = values[prop];
            }
          } else {
            values[prop] = values[prop];
          }
        }
      }
    }

    //distinc data from source
    for (let i = 0; i < data.length; i++) {
      if (source.includes(data[i].source)) {
      } else {
        source.push(data[i].source);
        value.push(data[i].value);
        group.push(data[i].target);
      }
    }
    cat = source;
    //distinc data from target
    for (let i = 0; i < data.length; i++) {
      if (source.includes(data[i].target)) {
      } else {
        source.push(data[i].target);
      }
    }
    //add categories
    for (let i = 0; i < cat.length; i++) {
      categories[i] = {
        name: cat[i],
      };
    }
    //convert value to percentage
    let min = Math.min.apply(null, value);
    let max = Math.max.apply(null, value);
    for (let i = 0; i < value.length; i++) {
      let percentageValue = ((value[i] - min) * 30) / (max - min);
      if (percentageValue === 0) {
        percentageValue = 1;
      }
      percentage.push(percentageValue);
    }

    let nodes_tmp = await distinctArrayObject(data, d3, fd);
    let count_group = 1;
    for (let i = 0; i < nodes_tmp.length; i++) {
      if (nodes_tmp[i].group > 1) ++count_group;
      for (let z = 0; z < fd.groupby.length; z++) {
        let groupby = {};
        const el = fd.groupby[z];
        groupby = { key: nodes_tmp[i].id, value: fd.groupby[z] };
        this.mappingExtraFilter.push(groupby);
      }
    }

    let scaleLog = d3.scaleLog().domain([min, max]).range([5, 20]);
    let graph = {
      nodes: nodes_tmp, // formatan FE
      links: data, // backend
    };
    let label = {
      nodes: [],
      links: [],
    };
    graph.nodes.forEach((d, i) => {
      label.nodes.push({ node: d });
      label.nodes.push({ node: d });
      label.links.push({
        source: i * 2,
        target: i * 2 + 1,
      });
    });

    const ticked = () => {
      node.call(updateNode);
      link.call(updateLink);
      labelLayout.alphaTarget(0.3).restart();
      labelNode.each(function (d, i) {
        if (i % 2 == 0) {
          d.x = d.node.x;
          d.y = d.node.y;
        } else {
          let b = this.getBBox();
          let diffX = d.x - d.node.x;
          let diffY = d.y - d.node.y;
          let dist = Math.sqrt(diffX * diffX + diffY * diffY);
          let shiftX = (b.width * (diffX - dist)) / (dist * 2);
          shiftX = Math.max(-b.width, Math.min(0, shiftX));
          let shiftY = 16;
          this.setAttribute('transform', 'translate(' + shiftX + ',' + shiftY + ')');
        }
      });
      labelNode.call(updateNode);
    };
    const fixna = (x) => {
      if (isFinite(x)) return x;
      return 0;
    };

    const focus = (d) => {
      let index = d3.select(d3.event.target).datum().index;
      node.style('opacity', function (o) {
        return neigh(index, o.index) ? 1 : 0.1;
      });
      labelNode.attr('display', function (o) {
        return neigh(index, o.node.index) ? 'block' : 'none';
      });
      link.style('opacity', function (o) {
        return o.source.index == index || o.target.index == index ? 1 : 0.1;
      });
    };
    const unfocus = (d) => {
      labelNode.attr('display', 'block');
      node.style('opacity', 1);
      link.style('opacity', 1);
    };
    const nodeDblclick = (d) => {
      div.classed('fixed', (d.fixed = false));
      node.classed('fixed', (d.fixed = false));
      d = Object.assign({}, d, { name: d.id, seriesName: d.id });
      _this.onFilter(d);
    };
    const updateLink = (link) => {
      link
        .attr('x1', function (d) {
          return fixna(d.source.x);
        })
        .attr('y1', function (d) {
          return fixna(d.source.y);
        })
        .attr('x2', function (d) {
          return fixna(d.target.x);
        })
        .attr('y2', function (d) {
          return fixna(d.target.y);
        });
    };
    const updateNode = (node) => {
      node.attr('transform', function (d) {
        return 'translate(' + fixna(d.x) + ',' + fixna(d.y) + ')';
      });
    };
    const dragstarted = (d) => {
      d3.event.sourceEvent.stopPropagation();
      if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };
    const dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };
    const dragended = (d) => {
      if (!d3.event.active) graphLayout.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };
    let labelLayout = d3
      .forceSimulation(label.nodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('link', d3.forceLink(label.links).distance(0).strength(2));

    let graphLayout = d3
      .forceSimulation(graph.nodes)
      .force('charge', d3.forceManyBody().strength(-3000))
      .force('center', d3.forceCenter(widthOffSetDiv / 2, heightOffSetDiv / 2))
      .force('x', d3.forceX(widthOffSetDiv / 2).strength(1))
      .force('y', d3.forceY(heightOffSetDiv / 2).strength(1))
      .force(
        'link',
        d3
          .forceLink(graph.links)
          .id(function (d) {
            return d.id;
          })
          .distance(50)
          .strength(1)
      )
      .on('tick', ticked);

    graph.links.forEach(function (d) {
      adjlist[d.source.index + '-' + d.target.index] = true;
      adjlist[d.target.index + '-' + d.source.index] = true;
    });

    const neigh = (a, b) => {
      return a == b || adjlist[a + '-' + b];
    };
    let svg = div.attr('width', widthOffSetDiv).attr('height', heightOffSetDiv);

    let container = svg.append('g');

    let zoom = d3.zoom().on('zoom', function () {
      container.attr('transform', d3.event.transform);
    });
    if (Number(data.length > 130)) zoom.scaleBy(svg, 1 / (loop * 1.3));
    svg.call(zoom);

    let link = container
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('stroke', '#888888')
      .attr('stroke-width', '1px')
      .attr('fill', '#888888');
    let i = -1;
    let node = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graph.nodes)
      .enter()
      .append('circle')
      .attr('stroke', '#fff')
      .attr('r', function (d) {
        let nameid = !d.name ? d.id : d.name;
        let value = graph.links.filter((x) => x.group == nameid)[0];
        if (!value) value = 5;
        let val = value == 5 ? value : scaleLog(value.value);
        return val;
      })
      .attr('fill', function (d) {
        if (
          fd.choose_pallete &&
          fd.choose_pallete == 'custom_pallete' &&
          fd.colorpickers &&
          fd.colorpickers.length > 0 &&
          fd.group
        ) {
          let f = true;
          for (let j = 0; j < fd.colorpickers.length; j++) {
            let isUtc = parseDate(fd.colorpickers[j].entity);
            let entity = String(fd.colorpickers[j].entity);
            let nameid = !d.name ? d.id : d.name;
            let d_name = String(!d.source ? nameid : d.source.name);
            if (isUtc) {
              entity = moment(fd.colorpickers[j].entity).format('YYYY-MM-DD');
              let arr_text = String(d_name).split('/');
              if (arr_text.length == 1) arr_text = String(d_name).split('-');
              let new_text = arr_text[1] + '/' + arr_text[0] + '/' + arr_text[2];
              d_name = moment(new Date(new_text)).format('YYYY-MM-DD');
            }
            if (d_name == 'Invalid date') d_name = String(!d.source ? d.name : d.source.name).substr(0, 10);
            if (String(d_name).replace(' ', '').toLowerCase() == String(entity).replace(' ', '').toLowerCase()) {
              f = false;
              return fd.colorpickers[j].colorpicker ? fd.colorpickers[j].colorpicker : '#808080';
            }
          }
          if (f) return '#808080';
        } else {
          ++i;
          if (fd.random_color) return colorPalette[getRandomInt(0, colorPalette.length)];
          else {
            return mergedArr(colorPalette, graph.nodes.length)[i];
          }
        }
      });

    d3.select('#zoom-in').on('click', function () {
      zoom.scaleBy(svg.transition().duration(750), 1.3);
    });

    d3.select('#zoom-out').on('click', function () {
      zoom.scaleBy(svg, 1 / 1.3);
    });
    node
      .append('title')
      .attr('class', 'd3-tip')
      .html((d) => {
        return `<span>${d.id} : ${d.fvalue}</span>`;
      });
    node.on('mouseover', focus).on('mouseout', unfocus);

    node.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));
    i = -1;
    let labelNode = container
      .append('g')
      .attr('class', 'labelNodes')
      .selectAll('text')
      .data(label.nodes)
      .enter()
      .append('text')
      .attr('dx', function (d) {
        return 5;
      })
      .text(function (d, i) {
        return i % 2 == 0 ? '' : d.node.id;
      })

      .style('fill', function (d) {
        if (
          fd.choose_pallete &&
          fd.choose_pallete == 'custom_pallete' &&
          fd.colorpickers &&
          fd.colorpickers.length > 0 &&
          fd.group
        ) {
          let f = true;
          for (let j = 0; j < fd.colorpickers.length; j++) {
            let isUtc = parseDate(fd.colorpickers[j].entity);
            let entity = String(fd.colorpickers[j].entity);
            let dnode = d.node ? d.node.id : d.id;
            let nameid = !d.name ? dnode : d.name;
            let d_name = String(!d.source ? nameid : d.source.name);
            if (isUtc) {
              entity = moment(fd.colorpickers[j].entity).format('YYYY-MM-DD');
              let arr_text = String(d_name).split('/');
              if (arr_text.length == 1) arr_text = String(d_name).split('-');
              let new_text = arr_text[1] + '/' + arr_text[0] + '/' + arr_text[2]; // m/d/Y
              d_name = moment(new Date(new_text)).format('YYYY-MM-DD');
            }
            if (d_name == 'Invalid date') d_name = String(!d.source ? d.name : d.source.name).substr(0, 10);
            if (String(d_name).replace(' ', '').toLowerCase() == String(entity).replace(' ', '').toLowerCase()) {
              f = false;
              return fd.colorpickers[j].colorpicker ? fd.colorpickers[j].colorpicker : '#808080';
            }
          }
          if (f) return '#808080';
        } else {
          ++i;
          if (fd.random_color) return colorPalette[getRandomInt(0, colorPalette.length)];
          else {
            return mergedArr(colorPalette, label.nodes.length)[i];
          }
        }
      })
      .style('font-family', 'Arial')
      .style('font-size', 12)
      .style('pointer-events', 'none'); // to prevent mouseover/drag capture

    node.on('mouseover', focus).on('mouseout', unfocus);
    node.on('dblclick', nodeDblclick);

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
    let split = params.name.split(' - ');
    let splitIndex = 0;

    if (this.formdata.form_data.groupby.length > 1) {
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
    this.filter.emit(param);
  }

  onFullscreen(cardId) {
    this.isFullscreen = true;
    on_full_screen_id('myDiv-' + cardId);
    this.loaderService.setSpesifikID([this.myChartID]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
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
    let url = `api/chart/explore_json/`;
    this.explore.form_data.since = this.sinceDate;
    this.explore.form_data.until = this.untilDate;

    if (this.isFilter && this.extraFilter.length > 0) {
      for (let i = 0; i < this.extraFilter.length; i++) {
        if (this.extraFilter[i].col === '__from') {
          this.explore.form_data.since = '';
          this.extraFilter[i].val = this.sinceDate;
        } else if (this.extraFilter[i].col === '__to') {
          this.explore.form_data.until = '';
          this.extraFilter[i].val = this.untilDate;
        }
      }
    }

    let param = {
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
    this.noData = !this.exploreJson;
    this.ngOnInit();
  }

  @HostListener('change', ['$event.target.value'])
  onRowLimitChange(row_limit) {
    this.update_row_limit = true;
    this.row_limit = row_limit;
    this.onRefresh(this.myChartID);
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
