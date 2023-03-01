import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Component, OnInit, ComponentFactoryResolver, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, TranslationService, JsonService, HeaderConfigService, LoaderService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import { DashboarddetailasyncComponent } from 'src/app/pages/pds/datavisualization/dashboarddetailasync/dashboarddetailasync.component';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { copy_url, getColOldConfig, on_full_screen } from 'src/app/libs/helpers/utility';
import { helperGenerateExploreUrl, loadChartData } from 'src/app/libs/helpers/data-visualization-helper';
import { setIsExtraFilterStatus } from '../pdsshare/dashboardviewShare/helperdashboardviewshare';
declare var GridStack: any;

@Component({
  selector: 'pq-dashboardview',
  templateUrl: './dashboardview.component.html',
  styleUrls: ['./dashboardview.component.scss'],
})
export class DashboardviewComponent implements OnInit {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  id;
  slug;
  slugId;

  formdata: any;
  geomap: any;
  grid: any;
  gridPos: any;
  sliceId: any;
  center: any;
  zoom: any;
  namemap: any;
  data: any;

  forLoop: any = [];
  columns: any = [];
  records: any = [];
  component: any = [];
  coloringPie: any = [];
  datasources: any = [];
  validate_messages = [];
  listSliceArr: any = [];
  colorPalette: any = [];
  scatterDatas: any = [];
  extra_filters: any = [];

  is_extra: boolean = false;
  isShared: boolean = false;
  isDateFilter: boolean = false;
  isLoadingContent: boolean = false;
  isInitialDateFilter: boolean = false;

  loadUrl: string;
  dashboardTitle: string;
  datasourceFilter: string;
  originFilterDatasource: string;
  shareUrl: string = '';
  palleteDefault: string = 'palette6';
  messages: any;

  total: number = 0;
  index: number = 0;

  constructor(
    private route: Router,
    private _apicall: ApiService,
    private cdRef: ChangeDetectorRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private headerConfigService: HeaderConfigService,
    private loaderService: LoaderService,
    private httpFile: HttpClient,
    private location: Location,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {
    this.loadUrl = this.route.url.replace('pds', 'api');
    let split = this.loadUrl.split('?');
    this.slugId = split[1].split('=')[1];
    this.isShared = split[0].length > 20 ? true : false;
    this.headerConfigService.setHeader(!this.isShared);
  }

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.isLoadingContent = true;
    let data = await this.loadData(this.loadUrl);
    this.data = data;
    this.dashboardTitle = data.dashboard_data ? data.dashboard_data.dashboard_title : '';
    this.id = data.dashboard_data ? data.dashboard_data.id : 0;
    // mapping datasources
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
    let result = await this._apicall.postApi('api/dashboard/getshareurl', { id: this.id });
    let sharedUrl = result.status ? (result.result.response ? result.result.response : result.result) : result.result;
    let token = sharedUrl.split('token=');
    this.shareUrl = token[1];
    this.forLoop = data.dashboard_data.slices;
    let url = 'api/dashboard/getshareurl';
    this.slug = data.dashboard_data.id;
    var options = { float: true, staticGrid: true, disableDrag: true, disableResize: true };
    this.grid = GridStack.init(options);
    this.initial(url, this.slug);
  }

  initial(url, slug) {
    let forLoop = this.forLoop;
    const _forLoop = async (_loop) => {
      this.listSliceArr = [];
      for (let index = 0; index < _loop.length; index++) {
        let element = _loop[index];
        this.listSliceArr.push(element.slice_id);
      }
      this.loaderService.setSpesifikID(this.listSliceArr);
      for (let index = 0; index < _loop.length; index++) {
        let element = _loop[index];
        let col = 12;
        let row = 7;
        let size_x = 0;
        let size_y = 0;
        let indexCharts = index;
        if (this.data.dashboard_data.position_json != null) {
          let arr = this.data.dashboard_data.position_json.filter((x) => x.slice_id == element.slice_id);
          if (arr[0].id) {
            col = arr.length > 0 ? arr[0].col : 12;
            row = arr.length > 0 ? arr[0].row : 7;
            size_x = arr.length > 0 ? arr[0].size_x : 0;
            size_y = arr.length > 0 ? arr[0].size_y : 0;
            indexCharts = Number(arr[0].index);
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
        let ini = this;
        this.sliceId = element.slice_id;
        this.datasourceFilter = element.datasource;
        if (vizType === 'filter_box' && !this.isDateFilter) {
          await this.checkInitialFilter(element);
        }

        if (element.form_data['initial_chart_blank']) {
          this.is_extra = this.isDateFilter;
        }

        if (vizType != 'country_map2') {
          await this.addCompChart(
            vizType,
            element.slice_id,
            element.slice_name,
            {},
            url,
            slug,
            element.datasource
            //indexCharts
            //this.data.dashboard_data.position_json[index].index
          );
        } else {
          setTimeout(async function () {
            await ini.renderOverlay(vizType, element.slice_id, element.slice_name);
          }, 1000);
        }
      }
    };
    _forLoop(forLoop);
  }

  async renderOverlay(vizType, slice_id?, slice_name?) {
    let ini = this;
    await ini._apicall.get('/assets/data/color_palette.json').subscribe(async (res) => {
      for (var i = 0; i < res.length; i++) {
        ini.colorPalette['palette' + (i + 1)] = res[i];
      }
      // get data
      let uri = helperGenerateExploreUrl(slice_id);
      var formdata = await loadChartData(uri, {}, this.messages, this._apicall);

      let exploreJson = await loadChartData(uri, {}, this.messages, this._apicall);
      let url = `assets/data/geojson/countries/${formdata.form_data.select_country2
        .toString()
        .toLowerCase()}.geojson.json`;
      let jsonFile = await ini._apicall.loadGetData(url);
      this.formdata = exploreJson;
      this.geomap = jsonFile;
      await ini.addCompChart(vizType, slice_id, slice_name, {}, url);
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
    this.initial(url, this.slug);
  }

  async loadData(url) {
    let result = await this._apicall.getApi(url);
    let value = result.status ? (result.result.response ? result.result.response : result.result) : result.result;
    this.dashboardTitle = value.dashboard_data.dashboard_title;
    var res = value.dashboard_data.share_url;
    this.shareUrl = res.split('token=')[1];
    return value;
  }

  addCompChart(type, ID, title, data?, url?, slug?, datasource?, index?) {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(DashboarddetailasyncComponent);
    const viewContainerRef = this.injectComp.viewContainerRef;
    const componentRef = viewContainerRef.createComponent(componentFactory);
    let currentComponent = componentRef.instance;
    currentComponent.index = this.index;
    currentComponent.myChartID = ID;
    currentComponent.data = data;
    currentComponent.title = title;
    currentComponent.typeChart = type;
    currentComponent.data = this.formdata;
    currentComponent.mapGeoJSON = this.geomap;
    currentComponent.isDrag = true;
    currentComponent.autoResize = true;
    currentComponent.isView = true;
    currentComponent.url = url;
    currentComponent.slug = slug;
    currentComponent.extra = this.extra_filters;
    currentComponent.is_extra = this.is_extra
      ? setIsExtraFilterStatus(
          datasource,
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
    currentComponent.zoom = this.zoom;
    currentComponent.center = this.center;
    currentComponent.namemap = this.namemap;
    currentComponent.isDateFilter = this.isDateFilter;
    currentComponent.isInitialDateFilter = this.isInitialDateFilter;
    currentComponent.refresh.subscribe((val) => this.onChartRefresh(val));
    currentComponent.filter.subscribe((val) => this.onChartFilter(val));
    currentComponent.download.subscribe((val) => this.onChartDownload(val));
    this.component.push(componentRef);
    this.isLoadingContent = false;
    this.cdRef.detectChanges();
  }

  async checkInitialFilter(datasource) {
    this.is_extra = true;
    let url = helperGenerateExploreUrl(datasource.slice_id);
    let explore = await loadChartData(url, {}, this.messages, this._apicall);
    let since, until;
    if (explore && explore.form_data.initial_date_filter != '' && explore.form_data.initial_date_filter) {
      if (explore.form_data.initial_date_filter === 'current_date') {
        // Initial Date Filter: Current Date
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
      } else if (explore.form_data.initial_date_filter === 'latest_date') {
        // Initial Date Filter: Latest Date
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
      } else {
        // Initial Date Filter: Default
        since = undefined;
        until = undefined;
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
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(DashboarddetailasyncComponent);
    const viewContainerRef = this.injectComp.viewContainerRef;
    const componentRef = viewContainerRef.remove();
  }

  getStyle(type) {
    let style = {};
    if (this.isShared) {
      switch (type) {
        case 'content':
          style = { top: '10px' };
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

  copyUrl(skin) {
    let val = location.origin + '/#/pdsshare/dashboard/view/shared?token=' + this.shareUrl + '&theme=' + skin;
    copy_url(val);
    this._apicall.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_DSC);
  }

  mailto() {
    let subject = this.dashboardTitle;
    let body = location.origin + '/#/pdsshare/dashboard/view/shared?token=' + this.shareUrl;
    location.href = 'mailto:?subject=' + subject + '&body=' + body;
  }

  async onChartRefresh(e) {}

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
    this.originFilterDatasource = item.data.datasource_id;
    for (const [key, value] of Object.entries(item.filter.data)) {
      // let arr = [], arr2="";
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
            if (String(isUtc) != 'Invalid Date') {
              arr.push(moment(new_text).format('YYYY-MM-DD'));
            } else arr.push(val.text);
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
    if (item.isLinkTo && item.linkTo.replace(/null/gi, '') != '/api/dashboard/view?link=') {
      this.dashboardTitle = ' ';
      let split = item.linkTo.split('?');
      this.slugId = split[1].split('=')[1];
      this.loadUrl = item.linkTo;
      this.location.go(item.linkTo);
      this.ngOnInit();
    } else {
      let url = 'api/dashboard/getshareurl';
      await this.initial(url, this.slug);
    }
  }

  async onChartDownload(item) {
    let urlnext = `${helperGenerateExploreUrl(item.id)}&csv=true`;
    let param = { form_data: JSON.stringify(item.data.form_data) };
    this._apicall.post(urlnext, param).subscribe((resp: any) => {
      FileSaver.saveAs(resp, item.data.slice.slice_name + '_' + item.data.slice.datasource + `.csv`);
    });
  }

  onDashboardEdit() {
    this.route.navigate(['/pds/dashboardeditor'], {
      queryParams: { link: this.slugId, id: this.id },
    });
  }

  onFullScreen() {
    on_full_screen();
  }

  public openMenu: boolean;

  handleOpenMenu = () => {
    this.openMenu = !this.openMenu;
  };
}
