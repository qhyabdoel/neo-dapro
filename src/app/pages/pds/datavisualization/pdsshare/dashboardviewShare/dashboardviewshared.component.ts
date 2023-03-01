import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as echarts from 'echarts';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import { InjectDirective } from 'src/app/libs/directives';
import { LayoutConfigModel } from 'src/app/libs/models';
import { HeaderConfigService, LoaderService, LayoutConfigService, JsonService } from 'src/app/libs/services';
import { ApiService } from 'src/app/libs/services';
import { DashboarddetailasyncComponent } from '../../dashboarddetailasync/dashboarddetailasync.component';
import { copy_url, on_full_screen } from 'src/app/libs/helpers/utility';
import { helperGetData, setUrlApplicationLogin } from 'src/app/libs/helpers/data-visualization-helper';
import { setConfigMapOverlay, setIsExtraFilterStatus } from './helperdashboardviewshare';

declare var d3: any;
declare var GridStack: any;

@Component({
  selector: '[pq-dashboardview-share]',
  templateUrl: './dashboardviewshare.component.html',
})
export class DashboardViewShareComponent implements OnInit, AfterViewInit {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  @Input() queryParams: string = '';
  @Input() breadcrumb: any;
  @Input() paramsFromApp: any;
  @Input() extraFilter: any;
  @Input() isSearchResult: boolean;
  @Input() isHideSubtopbar: boolean;
  @Input() dataSearchResult: boolean;
  @Input() isDateFilter: boolean;
  @Output() itemDashboard: EventEmitter<any> = new EventEmitter<any>();
  @Output() linkToFilter: EventEmitter<any> = new EventEmitter<any>();

  slugId;
  slug;

  formdata: any;
  geomap: any;
  data: any;
  grid: any;
  gridPos: any;
  sliceId: any;
  center: any;
  zoom: any;
  namemap: any;
  messages: any;

  forLoop: any = [];
  columns: any = [];
  records: any = [];
  scatterDatas = [];
  extra_filters = [];
  datasources: any = [];
  component: any = [];
  coloringPie: any = [];
  listSliceArr: any = [];
  colorPalette: any = [];
  validate_messages: any = [];

  is_extra: boolean = false;
  isShared: boolean = false;
  isLoadingContent: boolean = false;
  isInitialDateFilter: boolean = false;

  apiUrl: string;
  dashboardTitle: string;
  datasourceFilter: string;
  originFilterDatasource: string;
  shareToken: string = '';
  palleteDefault: string = 'palette6';

  total: number = 0;
  index: number = 0;
  position: number = 1;

  model: LayoutConfigModel;
  skin: string = '';
  constructor(
    private route: Router,
    private activeRoute: ActivatedRoute,
    private _apicall: ApiService,
    private cdRef: ChangeDetectorRef,
    private headerConfigService: HeaderConfigService,
    private loaderService: LoaderService,
    private location: Location,
    private httpFile: HttpClient,
    private layoutConfigService: LayoutConfigService,
    private jsonService: JsonService
  ) {
    this.headerConfigService.setHeader(!this.isShared);
  }

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    let data = null;
    if (this.queryParams) {
      this.isShared = true;
      this.extra_filters = this.extraFilter ? this.extraFilter : [];
      data = await helperGetData(`api/dashboard/view/shared?${this.queryParams}`, this._apicall);
    } else if (this.route.url.includes('pdsshare')) {
      this.isShared = this.activeRoute.snapshot.queryParams.token;
      this.shareToken = this.activeRoute.snapshot.queryParams.token;
      this.skin = this.activeRoute.snapshot.queryParams.theme;
      this.slugId = this.activeRoute.snapshot.queryParams.link;
      data = await helperGetData(
        `api/dashboard/view/shared?token=${this.activeRoute.snapshot.queryParams.token}`,
        this._apicall
      );
    } else {
      return console.log('Undefined query params');
    }
    this.model = this.layoutConfigService.getConfig();
    this.isLoadingContent = true;
    if (data) {
      this.slugId = data.dashboard_data.slug;
      this.dashboardTitle = data.dashboard_data.dashboard_title;
      if (this.skin && this.skin) this.changeSkin();
      if (this.isSearchResult) {
        data = this.dataSearchResult;
      }

      if (data.datasources && data.datasources != null) {
        for (const [key, value] of Object.entries(data.datasources)) {
          // reformat key value
          const [ds, dsType] = key.split('__');
          this.datasources.push({
            key: ds,
            value: value,
          });
        }
      }
      this.data = data;
      this.dashboardTitle = data.dashboard_data.dashboard_title;
      this.forLoop = data.dashboard_data.slices;
      var options = { float: true, staticGrid: true, disableDrag: true, disableResize: true };
      this.grid = GridStack.init(options);
      this.initial();
    }
  }

  ngAfterViewInit() {
    // $('[data-toggle="tooltip"]').tooltip({
    //   trigger: 'hover',
    // });
  }
  changeSkin(): void {
    this.model.login.self.skin = this.skin;
    this.layoutConfigService.setConfig(this.model, true);
    document.body.className = '';
    document.body.className =
      this.skin == 'dark'
        ? 'theme-light-pqs theme-pds ng-tns-0-0 theme-dark theme-cyan kt-header--fixed kt-header-mobile--fixed kt-subheader--fixed kt-subheader--enabled kt-subheader--solid kt-aside--enabled kt-aside--fixed kt-aside--minimize kt-header-base-dark kt-header-menu-dark kt-brand-dark kt-aside-dark kt-page--loaded'
        : 'theme-light-pqs theme-pds ng-tns-0-0 kt-header--fixed kt-header-mobile--fixed kt-subheader--fixed kt-subheader--enabled kt-subheader--solid kt-aside--enabled kt-aside--fixed kt-aside--minimize kt-header-base-dark kt-header-menu-dark kt-brand-dark kt-aside-dark kt-page--loaded';
  }
  initial(url?, slug?, isFilter?) {
    let forLoop = this.forLoop;
    const _forLoop = async (_loop) => {
      this.listSliceArr = [];
      for (let index = 0; index < _loop.length; index++) {
        let element = _loop[index];
        this.listSliceArr.push(element.slice_id);
      }
      this.loaderService.setSpesifikID(this.listSliceArr);
      let searchResultOptions = {};
      for (let index = 0; index < _loop.length; index++) {
        let element = _loop[index];
        if (this.queryParams) {
          searchResultOptions = {
            dashboard_title: element.dashboard_title,
            slug: element.slug,
            dashboard_id: element.dashboard_id,
          };
        }
        let col = 12;
        let row = 7;
        let size_x = 0;
        let size_y = 0;
        if (this.data.dashboard_data.position_json != null) {
          let arr = this.data.dashboard_data.position_json.filter((x) => x.slice_id == element.slice_id);
          if (arr[0].id) {
            col = arr.length > 0 ? arr[0].col : 12;
            row = arr.length > 0 ? arr[0].row : 7;
            size_x = arr.length > 0 ? arr[0].size_x : 0;
            size_y = arr.length > 0 ? arr[0].size_y : 0;
          } else {
            // for exsisting dashboard
            col = arr.length > 0 ? getColOldConfig(arr[0].col) : 12;
            row = 6;
            size_x = 0;
            size_y = 0;
          }

          this.gridPos = {
            size_x: size_x,
            size_y: size_y,
            col: col,
            row: row,
          };
        }

        let vizType = element.form_data.viz_type;
        if (element.form_data.viz_type2) vizType = element.form_data.viz_type2;
        let ini = this;
        this.datasourceFilter = element.datasource;
        if (vizType === 'filter_box' && !this.isDateFilter) {
          await this.checkInitialFilter(element);
        }
        if (vizType != 'country_map2') {
          await this.addCompChart(
            vizType,
            element.slice_id,
            element.slice_name,
            element.form_data,
            url,
            element.datasource,
            this.isSearchResult,
            searchResultOptions
          );
        } else {
          setTimeout(async function () {
            await ini.renderOverlay(vizType, element.slice_id, element.slice_name, col, element);
          }, 1000);
        }
      }
    };
    //call _forLoop
    _forLoop(forLoop);
    function getColOldConfig(col) {
      let colResult = 12;
      switch (col) {
        case 1:
          colResult = 12;
          break;
        case 2:
          colResult = 6;
          break;
        case 3:
          colResult = 4;
          break;
        case 4:
          colResult = 3;
          break;
        case 6:
          colResult = 2;
          break;
        default:
          colResult = col;
          break;
      }
      return colResult;
    }
  }

  async renderOverlay(vizType, slice_id?, slice_name?, col?, formdata?) {
    let ini = this;
    await ini._apicall.get('/assets/data/color_palette.json').subscribe(async (res) => {
      for (var i = 0; i < res.length; i++) {
        ini.colorPalette['palette' + (i + 1)] = res[i];
      }
      // get data
      let urlnext = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + slice_id + '%7D';
      if (ini.shareToken && ini.shareToken.length != 0) urlnext += '&token=' + ini.shareToken;

      var param = {
        form_data: JSON.stringify(formdata.form_data),
      };
      let result = await ini._apicall.postApi(urlnext, param);
      let exploreJson = result.status ? (result.result.response ? result.result.response : result.result) : result;
      let url = `assets/data/geojson/countries/${formdata.form_data.select_country2
        .toString()
        .toLowerCase()}.geojson.json`;
      let jsonFile = await ini._apicall.getApi(url);
      let config = await setConfigMapOverlay(exploreJson, jsonFile.result, ini.colorPalette, d3);
      echarts.registerMap(config.title.text, config.mapGeoJson);
      ini.coloringPie = config.coloringPie;
      ini.total = config.total;
      ini.scatterDatas = config.datamapPie;
      this.formdata = exploreJson;
      this.geomap = jsonFile;
      await ini.addCompChart(vizType, slice_id, slice_name, formdata.form_data, {}, col);
    });
  }

  reload() {
    let element = document.getElementById('rowDashboard');
    var nodes = Array.from(element.getElementsByClassName('grid-stack-item'));
    for (var i = 0; i < nodes.length; i++) {
      this.grid.removeWidget(nodes[i]);
      this.removeComp();
    }

    let url = 'api/dashboard/getshareurl';
    this.extra_filters = [];
    this.isDateFilter = false;
    this.isInitialDateFilter = false;
    this.zoom = 1.25;
    this.center = undefined;
    this.initial(url, this.slug, false);
  }

  addCompChart(type, ID, title, data?, geoMap?, datasource?, isSearchResult?, searchResultOptions?) {
    const viewContainerRef = this.injectComp.viewContainerRef;
    const componentRef = viewContainerRef.createComponent(DashboarddetailasyncComponent);
    if (this.extraFilter && this.extraFilter.length > 0) this.is_extra = true;
    let currentComponent = componentRef.instance;
    currentComponent.index = ++this.index;
    currentComponent.myChartID = ID;
    currentComponent.data = data;
    currentComponent.token = this.shareToken;
    currentComponent.title = title;
    currentComponent.typeChart = type;
    currentComponent.mapGeoJSON = geoMap;
    currentComponent.isDrag = true;
    currentComponent.autoResize = true;
    currentComponent.isView = true;
    currentComponent.url = this.apiUrl;
    currentComponent.slug = this.slug ? this.slug : undefined;
    currentComponent.extra = this.extra_filters;
    currentComponent.isDateFilter = this.isDateFilter;
    currentComponent.isInitialDateFilter = this.isInitialDateFilter;
    currentComponent.is_extra = this.is_extra
      ? setIsExtraFilterStatus(
          this.datasources,
          this.datasourceFilter,
          this.extra_filters,
          this.isDateFilter,
          this.isInitialDateFilter
        )
      : false;
    currentComponent.coloringPie = this.coloringPie;
    currentComponent.listSliceArr = this.listSliceArr;
    currentComponent.grid = this.grid;
    currentComponent.gridPos = this.gridPos;
    currentComponent.isSearchResult = isSearchResult;
    currentComponent.searchResultOptions = searchResultOptions;
    currentComponent.zoom = this.zoom;
    currentComponent.center = this.center;
    currentComponent.namemap = this.namemap;
    currentComponent.refresh.subscribe((val) => this.onChartRefresh(val));
    currentComponent.filter.subscribe((val) => this.onChartFilter(val));
    currentComponent.download.subscribe((val) => this.onChartDownload(val));
    currentComponent.searchResultJumpTo.subscribe((val) => this.toDashboardFromSearchApp(val));
    this.component.push(componentRef);
    this.isLoadingContent = false;
    this.cdRef.detectChanges();
  }

  async checkInitialFilter(datasource) {
    this.is_extra = true;
    let url = '/api/chart/explore/?form_data=%7B%22slice_id%22%3A' + datasource.slice_id + '%7D';
    if (this.shareToken) {
      url += '&token=' + this.shareToken;
    }
    let result = await this._apicall.postApi(url, {});
    let explore = result ? (result.result.response ? result.result.response : result.result) : result;
    let since, until;
    if (explore && explore.form_data.initial_date_filter && explore.form_data.initial_date_filter) {
      if (explore.form_data.initial_date_filter === 'current_date') {
        let currentDate = new Date();
        if (explore.form_data.filter_date_type === 'date') {
          since = moment(currentDate).startOf('day');
          until = moment(currentDate).endOf('day');
        } else if (explore.form_data.filter_date_type === 'month') {
          since = moment(currentDate).startOf('month');
          until = moment(currentDate).endOf('month');
        } else if (explore.form_data.filter_date_type === 'year') {
          since = moment(currentDate).startOf('year').startOf('month');
          until = moment(currentDate).endOf('year').endOf('month');
        }
      } else {
        if (explore.form_data.filter_date_type === 'date') {
          since = moment(explore.latest_date).startOf('day');
          until = moment(explore.latest_date).endOf('day');
        } else if (explore.form_data.filter_date_type === 'month') {
          since = moment(explore.latest_date).startOf('month');
          until = moment(explore.latest_date).endOf('month');
        } else if (explore.form_data.filter_date_type === 'year') {
          since = moment(explore.latest_date).startOf('year').startOf('month');
          until = moment(explore.latest_date).endOf('year').endOf('month');
        }
      }
    }

    if (since && until && explore.form_data.granularity_sqla) {
      this.extra_filters.push({
        col: '__from',
        op: 'in',
        val: since,
      });
      this.extra_filters.push({
        col: '__to',
        op: 'in',
        val: until,
      });
      this.extra_filters.push({
        col: '__time_col',
        op: 'in',
        val: explore.form_data.granularity_sqla,
      });
      this.isInitialDateFilter = true;
    }
  }

  removeComp() {
    const viewContainerRef = this.injectComp.viewContainerRef;
    const componentRef = viewContainerRef.remove();
  }

  getQueryParam() {
    let b = { token: this.shareToken };
    return b;
  }

  getStyle(type) {
    let style = {};
    if (this.isShared && this.queryParams == '') {
      switch (type) {
        case 'content':
          break;
        case 'subheader':
          style = { top: 0 };
          break;
        default:
          break;
      }
    }
    return style;
  }

  copyUrl() {
    let skin = this.skin.split('=')[1];
    let val = location.origin + '/#/pdsshare/dashboard/view/shared?token=' + this.shareToken + '&theme=' + skin;
    if (this.queryParams || this.queryParams) {
      val = `${location.origin}${setUrlApplicationLogin(this.paramsFromApp)}`;
    }
    copy_url(val);
    this._apicall.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_DSC);
  }

  mailto() {
    let subject = this.dashboardTitle;
    let body = location.origin + '/#/pdsshare/dashboard/view/shared?token=' + this.shareToken;
    location.href = 'mailto:?subject=' + subject + '&body=' + body;
  }

  async onChartRefresh(item) {}

  async onChartFilter(item) {
    this.isDateFilter = false;
    let element = document.getElementById('rowDashboard');
    var nodes = Array.from(element.getElementsByClassName('grid-stack-item'));
    for (var i = 0; i < nodes.length; i++) {
      this.grid.removeWidget(nodes[i]);
      this.removeComp();
    }
    this.extra_filters = [];
    this.is_extra = true;
    this.datasourceFilter = item.data.form_data.datasource; //item.data.datasource_id;
    this.originFilterDatasource = item.data.form_data.datasource;
    for (const [key, value] of Object.entries(item.filter.data)) {
      let arr = [],
        arr2 = [];
      if (Array.isArray(value) && value.length > 0) {
        for (const [k, val] of Object.entries(value)) {
          var arr_text = val.text.toString().split('/');
          if (arr_text.length == 1) arr_text = val.text.toString().split('-');
          var new_text = arr_text[1] + '/' + arr_text[0] + '/' + arr_text[2]; // m/d/Y
          let isUtc = new Date(new_text);
          if (item.isItemChart) {
            if (String(isUtc) != 'Invalid Date') {
              arr2.push(moment(new_text).format('YYYY-MM-DD'));
              this.isDateFilter = true;
            } else {
              arr2.push(val.text);
            }
          } else {
            if (String(isUtc) != 'Invalid Date') arr.push(moment(new_text).format('YYYY-MM-DD'));
            else arr.push(val.text);
          }
        }
        if (key === item.filter.regexColumn) {
          this.extra_filters.push({
            col: key,
            op: 'regex',
            val: arr[0],
          });
        } else {
          if (item.isItemChart) {
            let operator = item.filter.data[key][0].op;
            if (arr2.length > 1) {
              this.extra_filters.push({
                col: key,
                op: operator ? operator : 'in',
                val: arr2,
              });
            } else {
              this.extra_filters.push({
                col: key,
                op: operator ? operator : '==',
                val: arr2[0],
              });
            }
          } else {
            this.extra_filters.push({
              col: key,
              op: 'in',
              val: arr,
            });
          }
        }
      }
    }

    //for filter date
    if (item.filter.since && item.filter.until && item.filter.timecolumn) {
      if (item.filter.since) {
        let fromCol = this.extra_filters.filter((x) => x.col === '__from')[0];
        if (!fromCol) {
          this.extra_filters.push({
            col: '__from',
            op: 'in',
            val: item.filter.since,
          });
        }
      }

      if (item.filter.until) {
        let toCol = this.extra_filters.filter((x) => x.col === '__to')[0];
        if (!toCol) {
          this.extra_filters.push({
            col: '__to',
            op: 'in',
            val: item.filter.until,
          });
        }
      }

      if (item.filter.timecolumn) {
        let timeCol = this.extra_filters.filter((x) => x.col === '__time_col')[0];

        if (!timeCol) {
          this.extra_filters.push({
            col: '__time_col',
            op: 'in',
            val: item.filter.timecolumn,
          });
        }
      }
      this.isDateFilter = true;
    }
    this.zoom = item.zoom ? item.zoom : 1.25;
    this.center = item.center ? item.center : undefined;
    this.namemap = item.namemap ? item.namemap : '';
    if (item.isLinkTo && item.linkTo != '/api/dashboard/view?link=') {
      this.dashboardTitle = ' ';
      let split = item.linkTo.split('?');

      if (split[1] != 'link=null') this.slugId = split[1].split('=')[1];

      if (this.queryParams) {
        this.linkToFilter.emit({
          extra_filters: this.extra_filters,
          slug: this.slugId,
          isDateFilter: this.isDateFilter,
        });
      } else {
        this.location.go(item.linkTo);
        this.ngOnInit();
      }
    } else {
      let url = 'api/dashboard/getshareurl';
      await this.initial(url, this.slug, item.isFilter);
    }
  }

  async onChartDownload(item) {
    let urlnext = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + item.id + '%7D&csv=true';
    let param = { form_data: JSON.stringify(item.data.form_data) };
    this._apicall.post(urlnext, param).subscribe((resp: any) => {
      FileSaver.saveAs(resp, item.data.slice.slice_name + '_' + item.data.slice.datasource + `.csv`);
    });
  }

  onDashboardEdit() {
    this.route.navigate(['/pds/dashboardeditor'], {
      queryParams: { link: this.slugId },
    });
  }

  //breadcrumb app
  toDashboardFromApp(item) {
    this.itemDashboard.emit(item);
  }

  //global search app
  toDashboardFromSearchApp(e) {
    this.linkToFilter.emit({
      extra_filters: [],
      slug: e.slug,
    });
  }

  onFullscreen() {
    on_full_screen();
  }
}
