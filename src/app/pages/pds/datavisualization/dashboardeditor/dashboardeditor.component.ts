import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, LayoutUtilsService, TranslationService, JsonService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import { DashboarddetailasyncComponent } from 'src/app/pages/pds/datavisualization/dashboarddetailasync/dashboarddetailasync.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as echarts from 'echarts';
import {
  getColOldConfig,
  checked_unchecked_list,
  checked_unchecked_all,
  search_regex_two,
  search_regex,
  copy_url,
} from 'src/app/libs/helpers/utility';
import * as introJs from 'intro.js/intro.js';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetData,
  helperPostData,
} from 'src/app/libs/helpers/data-visualization-helper';
import {
  collectingChartByDashboardId,
  initialOptionGridStack,
  initialParameterCreate,
  initialParameterEdit,
  setConfigMapOverlay,
  remapingChartPosition,
} from './helperDashboardEditor';
import { data } from 'jquery';
import * as FileSaver from 'file-saver';

declare var d3: any;
declare var GridStack: any;

@Component({
  selector: 'pq-dashboardeditor',
  templateUrl: './dashboardeditor.component.html',
  styleUrls: ['./dashboardeditor.component.scss'],
})
export class DashboardeditorComponent implements OnInit {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  dialogRef;
  formdata: any;
  geomap: any;
  grid: any;
  gridPos: any;
  masterDataDashboard: any;
  masterDataChart: any;

  mydata: any = {};
  user: any = JSON.parse(localStorage.getItem('user'));
  paramCreate: ParamCreateashboard;
  paramEdit: ParamEditDashboard;

  charts: any = [];
  component: any = [];
  columns: any = [];
  records: any = [];
  extra_filters = [];
  scatterDatas = [];
  coloringPie: any = [];
  listSliceArr: any = [];
  colorPalette: any = [];
  chartList: any = [];
  dashboardList: any = [];
  visualizationTypeList: [];
  validate_messages: any = [];
  selectedDashboardListforDelete: any = [];
  selectedChartListforDelete: any = [];

  is_extra: boolean = false;
  isCheckedAllDashboards: boolean = false;
  isCheckedAllCharts: boolean = false;
  isLoadingCharts: boolean = false;
  isLoadingDashboards: boolean = false;
  isLoadingContent: boolean = false;
  isLeftToggle: boolean = false;
  isRightToggle: boolean = false;

  slug: string;
  url: string;
  dashboardTitle: string;
  searchDashboardText: string;
  searchChartText: string;
  shareUrl: string = '';
  loadUrl: string = '';
  palleteDefault: string = 'palette6';
  messages: any;

  total: number = 0;
  index: number = 0;
  position: number = 1;
  rowPosition: number = 75;

  public activeColapse: any = {
    dashboardProperty: false,
    dashboardOptions: false,
  };
  public activeId: any = 0;
  public selectedOptionId: any = 0;
  public selectedTypeOption: string = '';

  // initial active tab default
  public activeTab: string = 'tabChart';

  constructor(
    private cdRef: ChangeDetectorRef,
    private _apicall: ApiService,
    private router: Router,
    private layoutUtilsService: LayoutUtilsService,
    private activedRoute: ActivatedRoute,
    private route: Router,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {
    let split = this.router.url.split('?');
    if (split.length > 1) {
      this.loadUrl = this.router.url.replace('pds', 'api').replace('dashboardeditor', 'dashboard/view');
    }
  }

  introJS = introJs();
  async getIntro(user?: any) {
    if (!user.isFirst.isDataVisualizationDashboard) return;
    user.isFirst = { ...user.isFirst, isDataVisualizationDashboard: false };
    localStorage.setItem('user', JSON.stringify(user));
    let intro: any = await this.jsonService.retIntro(this.translationService.getSelectedLanguage());
    this.introJS
      .setOptions({
        steps: intro.configuredashboard,
        skipLabel: 'Skip',
        showBullets: true,
        // tooltipPosition: 'left',
        hintButtonLabel: 'OK',
        showProgress: false,
        hidePrev: true,
        hideNext: false,
      })
      .start();
  }

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.initial();
    let val = await this._apicall.getApi(
      '/assets/data/datavisualization/visual_type_' + this.translationService.getSelectedLanguage() + '.json'
    );
    this.messages = await this.jsonService.retMessage();
    this.visualizationTypeList = val.result[0].visual_type_chart_list.slice();
    await this.loadChart();
    await this.loadDashboard();
    if (this.loadUrl != '') {
      this.isLoadingContent = true;
      this.getChartToSetDashboard(this.loadUrl);
    }

    this.activedRoute.queryParams.subscribe((params) => {
      if ('id' in params) {
        //set initial id and slug when dashboard have a id
        this.paramEdit.id = parseInt(params['id']);
        this.paramEdit.slug = params['link'];
        this.activeTab = 'tabDashboard';
      }
    });
    let user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    if (user != null && user.hasOwnProperty('isFirst')) this.getIntro(user);
  }

  initial() {
    this.index = 0;
    this.mydata = {};
    this.component = [];
    this.charts = [];
    this.selectedDashboardListforDelete = [];
    this.selectedChartListforDelete = [];
    this.isLoadingCharts = false;
    this.isLoadingDashboards = false;
    this.dashboardTitle = '';
    this.paramEdit = initialParameterEdit;

    this.paramCreate = initialParameterCreate;
    this.initialDragDrop();
    this.cdRef.detectChanges();
  }

  initialDragDrop() {
    let me = this;
    this.grid = GridStack.init(initialOptionGridStack);
    this.grid.column(12);
    this.grid.on('added', (e, items) => {
      added('added ', items);
    });
    this.grid.on('change', function (e, items) {
      change('change ', items);
    });

    function added(type, items) {
      let isExixts = false;
      items.forEach(function (item) {
        isExixts = false;
        let split = item.el.id.split('_');
        let i = split[0];
        let sliceId = split[split.length - 1];
        if (me.paramEdit['position_json'].length > 0) {
          me.paramEdit['position_json'].forEach(function (e) {
            if (e.id == item.el.id) {
              isExixts = true;
            }
          });
        }
        if (!isExixts) {
          me.paramEdit['position_json'].push({
            col: item.width,
            row: item.height,
            size_x: item.x,
            size_y: item.y,
            slice_id: sliceId,
            id: item.el.id,
            index: i,
          });
        }
      });
    }

    function change(type, items) {
      items.forEach(function (item) {
        me.paramEdit['position_json'].forEach(function (e) {
          if (e.id == item.el.id) {
            e.col = item.width;
            e.row = item.height;
            e.size_x = item.x;
            e.size_y = item.y;
            window.dispatchEvent(new Event('resize'));
            me.cdRef.detectChanges();
          }
        });
      });
    }
  }

  async loadChart() {
    this.isLoadingCharts = true;
    this.masterDataChart = [];
    this.chartList = [];
    let url = '/api/chart/list';
    let result = await this._apicall.getApi(url);
    if (result.status) {
      this.masterDataChart =
        result.result.response == null ? null : result.result.response ? result.result.response : result.result;
      this.chartList =
        result.result.response == null ? null : result.result.response ? result.result.response : result.result;
      if (this.chartList.length > 0) {
        this.chartList[0] = {
          ...this.chartList[0],
          isChecked: false,
        };
      }
    }
    this.isLoadingCharts = this.chartList.length >= 0 ? false : true;
    this.cdRef.detectChanges();
  }

  async getView() {
    this.messages = await this.jsonService.retMessage();
    if (this.paramEdit.slug != '') {
      this.route.navigate(['/pds/dashboard/view'], {
        queryParams: { link: this.paramEdit.slug },
      });
    } else {
      this._apicall.openModal(this.messages.DASHBOARD.W, this.messages.DASHBOARD.MSG_PSDF);
    }
  }

  async loadDashboard() {
    this.isLoadingDashboards = true;
    this.masterDataDashboard = [];
    this.dashboardList = [];
    let url = '/api/dashboard/list';
    let result = await this._apicall.getApi(url);
    if (result.status) {
      let dashboardList =
        result.result.response == null ? null : result.result.response ? result.result.response : result.result;
      if (dashboardList == null) {
        this.dashboardList = [];
      } else {
        this.masterDataDashboard = dashboardList;
        this.dashboardList = dashboardList;
        this.dashboardList[0] = { ...this.dashboardList[0], isChecked: false };
      }
    }
    this.isLoadingDashboards = this.dashboardList.length >= 0 ? false : true;
    this.cdRef.detectChanges();
  }

  loadChartToWorkspace = (item, isSelect?) => {
    this.loadChartToComponent(item, isSelect);
    let elementId = `${this.index}_${item.viz_type}_${item.id}`;
    // inisiate this as a variable
    // important because if using this only is undefined
    let pointer = this;

    // must set timeout because element available after render is ready
    // inisiate 100ms is enough for waiting element ready
    setTimeout(async () => {
      await pointer.scrollContentToId(elementId);
    }, 100);
  };

  async loadChartToComponent(item, isSelect?) {
    if (this.charts.some((x) => x.id === item.id)) {
      this._apicall.openModal(this.messages.DASHBOARD.F, this.messages.DASHBOARD.MSG_CAECAC);
      return;
    }
    let res = { col: 6, row: 5 };
    if (!isSelect) {
      this.charts = [...this.charts, item];
    }
    this.isLoadingContent = true;
    this.gridPos = {
      size_x: 0,
      size_y: 0,
      col: res.col,
      row: res.row,
    };
    this.position = res.col;
    this.rowPosition = res.row;
    let vizType = item.viz_type;
    let id = this.index + 1 + '_' + vizType + '_' + item.id;
    if (vizType !== 'country_map2') {
      await this.addCompChart(vizType, item.id, item.name);
    } else {
      await this.renderOverlay(vizType, item.id, item.name);
    }
    this.index++;
    this.cdRef.detectChanges();
    this.scrollContentToId(id);
  }

  scrollContentToId(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async loadDashboardToWorkspace(item) {
    this.router.navigate(['/pds/dashboardeditor'], {
      queryParams: { link: item.slug, id: item.id },
    });
    // first remove all widget in workspace
    this.removeWidgetGridStack();
    // set default this.chart empty
    this.charts = [];
    item.charts.map((id) => {
      // find chart detail on chartlist by item dashboard
      let chartDetail = this.chartList.find((obj) => obj.id === id);
      this.charts.push(chartDetail);
    });

    // set parameter edit for re-create object
    this.paramEdit = {
      id: item.id,
      charts: item.chart,
      dashboard_title: item.dashboard_title,
      position_json: [],
      css: item.css,
      slug: item.slug,
      default_filters: item.default_filters,
      duplicate_slices: item.duplicate_slices,
    };

    // remove selected id on open dialog option
    this.selectedOptionId = 0;
    this.isLoadingContent = true;
    this.url = '/api/dashboard/view?link=' + item.slug;
    this.slug = item.slug;
    this.getChartToSetDashboard(this.url);
  }

  async getChartToSetDashboard(url) {
    if (url == '') return;
    // get dashboard data using url
    let getDashboardData = await helperGetData(url, this._apicall);
    let dashboard_id = getDashboardData.dashboard_data != undefined ? getDashboardData.dashboard_data.id : 0;
    let loopComponentChart = getDashboardData.dashboard_data.slices;
    let position_json = getDashboardData.dashboard_data.position_json;
    // set title dashboard
    this.dashboardTitle = getDashboardData.dashboard_data.dashboard_title;

    // check if getDashboardData is empty
    // break the function
    if (getDashboardData.dashboard_data == null) return;

    // get token for share dashboard
    if (dashboard_id != undefined && dashboard_id > 0) {
      let result = await this._apicall.postApi('api/dashboard/getshareurl', { id: dashboard_id });
      let token = result.result['response'] ? result.result['response'].split('token=') : result.result.split('token=');
      this.shareUrl = token[1];
      this.paramEdit.position_json = position_json;
    }
    // looping for generate grid position
    const _forLoop = async (_loop) => {
      this.charts = [];
      let items = [];
      this.listSliceArr = [];
      for (let index = 0; index < _loop.length; index++) {
        let element = _loop[index];
        this.listSliceArr.push(element.slice_id);
        let visualType = element.form_data.viz_type;
        items.push(this.chartList.filter((x) => x.id == element.slice_id)[0]);
        let col = 12;
        let row = 7;
        let size_x = 0;
        let size_y = 0;
        if (position_json != null) {
          let arr = position_json.filter((x) => x.slice_id == element.slice_id);
          if (arr[0].id) {
            col = arr.length > 0 ? arr[0].col : 12;
            row = arr.length > 0 ? arr[0].row : 7;
            size_x = arr.length > 0 ? arr[0].size_x : 0;
            size_y = arr.length > 0 ? arr[0].size_y : 0;
          } else {
            // for exsisting dashboard
            col = arr.length > 0 ? getColOldConfig(arr[0].col) : 12;
            row = 5;
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
        let pointer = this;
        this.index = index;
        if (visualType != 'country_map2') {
          await pointer.addCompChart(visualType, element.form_data.slice_id, element.slice_name, url);
        } else {
          setTimeout(async function () {
            await pointer.renderOverlay(visualType, element.form_data.slice_id, element.slice_name, url);
          }, 1000);
        }
      }
      this.charts = items;
    };
    // looping recursive
    _forLoop(loopComponentChart);
    this.cdRef.detectChanges();
  }

  async renderOverlay(vizType, slice_id?, slice_name?, url?) {
    let pointer = this;
    await pointer._apicall.get('/assets/data/color_palette.json').subscribe(async (res) => {
      for (var i = 0; i < res.length; i++) {
        pointer.colorPalette['palette' + (i + 1)] = res[i];
      }
      // get data
      // generate explore url
      let exploreUrl = helperGenerateExploreUrl(slice_id);
      // generate explore json url
      let exploreJsonUrl = helperGenerateExploreJsonUrl(slice_id);
      // get explore url
      let resultExplore = await helperPostData(exploreUrl, {}, pointer._apicall);

      // get explore json url
      let resultExploreJson = await helperPostData(
        exploreJsonUrl,
        {
          form_data: JSON.stringify(resultExplore.result.form_data),
        },
        pointer._apicall
      );

      let jsonFile = await this._apicall.getApi(
        `assets/data/geojson/countries/${resultExplore.result.form_data.select_country2
          .toString()
          .toLowerCase()}.geojson.json`
      );

      // set config map overlay
      // generate series data for presentation map
      let configMapOverlay = await setConfigMapOverlay(
        resultExploreJson.result,
        jsonFile.result,
        pointer.colorPalette,
        d3
      );
      pointer.scatterDatas = configMapOverlay.scatterData;
      pointer.coloringPie = configMapOverlay.coloringPie;
      pointer.total = configMapOverlay.total;
      echarts.registerMap(configMapOverlay.title.text, configMapOverlay.mapGeoJson);
      this.formdata = resultExploreJson;
      this.geomap = jsonFile;
      await pointer.addCompChart(vizType, slice_id, slice_name, url);
    });
  }

  buttonNew() {
    // set message dialog
    const dialogRef = this.layoutUtilsService.saveElement(
      'Do you want to save changes?',
      'Your work has changed, select one of the actions below to continue',
      'Dashboard is saving ...'
    );

    // action after close alert dialog
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      if (res === true || res == 'load') {
        if (res === true) {
          await this.buttonSave();
        }
        this.removeDashboardFromContent();
        this.router.navigate(['/pds/dashboardeditor']);
        return;
      }
    });
  }

  async buttonSave() {
    let pointer = this;
    pointer.messages = await pointer.jsonService.retMessage();
    // modify chart only id in array
    let chart = pointer.charts.map((obj) => {
      return obj.id;
    });
    // check if chart is empty break the function
    if (chart.length == 0) return;
    // intial grid to get existing chart n workspaces
    let grid = await GridStack.init();

    // remaping chart position yang berada di workspace sekarang
    // tujuan nya agar position chart selalu mengikuti yang ada di workspace
    let remaping = remapingChartPosition(grid.engine.nodes, pointer.paramEdit);
    pointer.isLoadingContent = true;
    remaping.charts = chart;
    remaping.dashboard_title = pointer.dashboardTitle == '' ? 'Untitled' : pointer.dashboardTitle;
    if (remaping.id == null) {
      // start create dashboard
      let paramCreate = {
        dashboard: {},
        addMode: true,
        dashboard_title: pointer.paramEdit.dashboard_title,
        slug: '',
        charts: chart,
      };
      // hit end point create to get id dashboard
      let resultCreateDashboard = await helperPostData('/api/dashboard/create', paramCreate, pointer._apicall);
      // set id from resultCreateDashboard
      remaping.id = resultCreateDashboard.id;
      // set slug from resultCreateDashboard
      remaping.slug = resultCreateDashboard.slug;
      // hit end point edit to get set position grid dashboard
      let resultEditDashboard = await helperPostData('/api/dashboard/save', remaping, pointer._apicall);
      remaping.id = resultEditDashboard.id;
      remaping.slug = resultEditDashboard.slug;
      let resultShareUrlDashboard = await helperPostData(
        'api/dashboard/getshareurl',
        { id: resultEditDashboard.id },
        pointer._apicall
      );
      let token = resultShareUrlDashboard.split('token=');
      pointer.shareUrl = token[1];
      pointer.isLoadingContent = false;
      pointer._apicall.openModal(pointer.messages.DASHBOARD.S, pointer.messages.DASHBOARD.MSG_ASP);
      return;
    } else {
      // remaping chart position yang berada di workspace sekarang
      // tujuan nya agar position chart selalu mengikuti yang ada di workspace
      await helperPostData('/api/dashboard/save', remaping, pointer._apicall);
    }

    pointer.isLoadingContent = false;
    pointer._apicall.openModal(pointer.messages.DASHBOARD.S, pointer.messages.DASHBOARD.MSG_ASP);
  }

  addCompChart(type, ID, title, url?, other?, reference?, component?) {
    let viewContainerRef = null;
    let componentRef = null;
    if (other) {
      viewContainerRef = reference.viewContainerRef;
    } else {
      viewContainerRef = this.injectComp.viewContainerRef;
    }
    componentRef = viewContainerRef.createComponent(DashboarddetailasyncComponent);

    let currentComponent = componentRef.instance;
    currentComponent.index = this.index;
    currentComponent.myChartID = ID;
    currentComponent.title = title;
    currentComponent.typeChart = type;
    currentComponent.data = this.formdata;
    currentComponent.mapGeoJSON = this.geomap;
    currentComponent.isDrag = true;
    currentComponent.autoResize = true;
    currentComponent.url = url;
    currentComponent.slug = this.slug;
    currentComponent.extra = this.extra_filters;
    currentComponent.is_extra = this.is_extra;
    currentComponent.coloringPie = this.coloringPie;
    currentComponent.listSliceArr = this.listSliceArr;
    currentComponent.grid = this.grid;
    currentComponent.gridPos = this.gridPos;
    currentComponent.delete.subscribe((val) => this.onChartDelete(val));
    currentComponent.download.subscribe((val) => this.onChartDownload(val));
    currentComponent.edit.subscribe((val) => this.onChartEdit(val));
    currentComponent.refresh.subscribe((val) => this.onChartRefresh(val));
    currentComponent.width.subscribe((val) => this.onChartWidth(val));
    currentComponent.height.subscribe((val) => this.onChartHeight(val));
    currentComponent.filter.subscribe((val) => this.onChartFilter(val));
    if (other) {
      let copy = component.push(componentRef);
      this.component = copy;
    } else {
      this.component.push(componentRef);
    }

    this.isLoadingContent = false;
    this.cdRef.detectChanges();
  }

  removeWidgetGridStack = () => {
    this.grid = GridStack.init();
    this.grid.removeAll();
  };

  removeDashboardFromContent(other?, reference?) {
    let element = document.getElementById('rowDashboard');
    var nodes = Array.from(element.getElementsByClassName('grid-stack-item'));
    this.grid = GridStack.init();
    if (nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        this.grid.removeWidget(nodes[i]);
        if (other) {
          const viewContainerRef = reference.viewContainerRef;
          viewContainerRef.clear();
        } else {
          const viewContainerRef = this.injectComp.viewContainerRef;
          viewContainerRef.clear();
        }
      }
    }
    let pointer = this;
    pointer.initial();
  }

  async copyUrl() {
    this.messages = await this.jsonService.retMessage();
    // set data share url with token
    let shareUrl = location.origin + '/pdsshare/dashboard/view/shared?token=' + this.shareUrl;
    copy_url(shareUrl);
    this._apicall.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_DSC);
  }

  async delete(type, item) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.DASHBOARD.C,
      this.messages.DASHBOARD.MSG_DN + ' ' + type + '?',
      type + this.messages.DASHBOARD.DN
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      if (type == 'dashboard') {
        let url = '/api/dashboard/delete?id=' + item.id;
        await this._apicall.getApi(url, true);
        this.initial();
        this.removeDashboardFromContent();
        this.loadDashboard();
      }
      if (type == 'chart') {
        let url = '/api/chart/delete';
        let param = { id: item.id };
        await this._apicall.postApi(url, param, true);
        this.initial();
        this.removeDashboardFromContent();
        this.loadChart();
      }
      // remove selected id on open dialog option
      this.selectedOptionId = 0;
    });
  }

  async multipleDelete(type) {
    this.messages = await this.jsonService.retMessage();
    let me = this;
    let len = type == 'dashboard' ? this.selectedDashboardListforDelete.length : this.selectedChartListforDelete.length;
    let word =
      len > 1 ? (type == 'dashboard' ? ' dashboards' : ' charts') : type == 'dashboard' ? ' dashboard' : ' chart';
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.DASHBOARD.C,
      this.messages.DASHBOARD.MSG_DN + len + this.messages.DASHBOARD.SELECTED + word + ' ?',
      this.messages.DASHBOARD.D + len + word + '... '
    );

    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      if (type == 'dashboard') {
        for (var i = 0; i < len; i++) {
          let url = '/api/dashboard/delete?id=' + this.selectedDashboardListforDelete[i].id;
          await this._apicall.getApi(url, len == i);
        }
        this.selectedDashboardListforDelete = [];
        this.initial();
        this.removeDashboardFromContent();
        this.loadDashboard();
      }

      if (type == 'chart') {
        let url = '/api/chart/delete';
        let selectedChart = this.selectedChartListforDelete;
        let rest = await Object.keys(this.selectedChartListforDelete).map(async function (n) {
          let param = { id: selectedChart[n].id };
          return await me._apicall.postApi(url, param);
        });

        if (rest) {
          me._apicall.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_PC);
          this.selectedChartListforDelete = [];
          this.initial();
          this.loadChart();
        } else {
          me._apicall.openModal(this.messages.DASHBOARD.F, this.messages.DASHBOARD.MSG_PF);
        }
      }
    });
  }

  checkedList(id, isChecked, type) {
    if (type === 'dashboard') {
      this.selectedDashboardListforDelete = checked_unchecked_list(
        isChecked,
        this.dashboardList,
        this.selectedDashboardListforDelete,
        id,
        'id'
      );
      if (
        this.selectedDashboardListforDelete.length != 0 &&
        this.selectedDashboardListforDelete.length == this.dashboardList.length
      )
        this.isCheckedAllDashboards = true;
    } else {
      this.selectedChartListforDelete = checked_unchecked_list(
        isChecked,
        this.chartList,
        this.selectedChartListforDelete,
        id,
        'id'
      );
      if (
        this.selectedChartListforDelete.length != 0 &&
        this.selectedChartListforDelete.length == this.chartList.length
      )
        this.isCheckedAllCharts = true;
    }
  }

  checkUncheckAll(type) {
    if (type === 'dashboard') {
      let result = checked_unchecked_all(this.isCheckedAllDashboards, this.dashboardList);
      this.dashboardList = result[0];
      this.selectedDashboardListforDelete = result[1];
      this.isCheckedAllDashboards = !this.isCheckedAllDashboards;
    } else {
      let result = checked_unchecked_all(this.isCheckedAllCharts, this.chartList);
      this.chartList = result[0];
      this.selectedChartListforDelete = result[1];
      this.isCheckedAllCharts = !this.isCheckedAllCharts;
    }
  }

  async onChartDelete(eventFromChart: any) {
    // get component referensi html div id
    let componentRef = this.component.filter((obj) => obj.instance.index == eventFromChart.index)[0];
    // get component instance
    let componentInstance = componentRef.instance;
    let node = document.getElementById(eventFromChart.id);
    // remove object grid
    this.grid.removeWidget(node);
    // remove configurasi chart pada workspace
    // delete item by id chart
    this.paramEdit.position_json = this.paramEdit.position_json.reduce(
      (previous, current) => (
        Number(current.id.split('_').reverse()[0]) !== Number(eventFromChart.id.split('_').reverse()[0]) &&
          previous.push(current),
        previous
      ),
      []
    );
    // remove component instans
    this.component = this.component.filter((obj) => obj.instance.index !== eventFromChart.index);
    // remove chart from list of charts
    this.charts = this.charts.filter((obj) => obj.id !== componentInstance.myChartID);
    // remove view container on workspace by index id
    this.injectComp.viewContainerRef.remove(eventFromChart.index);
    // resize or fit the workspace
    window.dispatchEvent(new Event('resize'));
    this.cdRef.detectChanges();
  }

  async onChartDeleteInSelect(item) {
    let componentRef = this.component.filter((x) => x.instance.myChartID === item.value.id)[0];
    let vcrIndex: number = this.injectComp.viewContainerRef.indexOf(componentRef);
    this.injectComp.viewContainerRef.remove(vcrIndex);
    this.component = this.component.filter((x) => x.instance.index !== item.index);
    this.charts = this.charts.filter((x) => x.id !== item.value.id);
    window.dispatchEvent(new Event('resize'));
    this.cdRef.detectChanges();
  }

  async onChartDownload(item) {
    let urlnext = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + item.id + '%7D&csv=true';
    let param = { form_data: JSON.stringify(item.data.form_data) };
    this._apicall.post(urlnext, param).subscribe((resp: any) => {
      FileSaver.saveAs(resp, item.data.slice.slice_name + '_' + item.data.slice.datasource + `.csv`);
    });
  }

  async onChartEdit(id) {
    this.router.navigate(['/pds/newdatavisualization'], {
      queryParams: { slice_id: id },
    });
  }

  async onChartRefresh(item) {
    // khusus overlay load ulang
  }

  async onChartWidth(val) {
    let tes = {
      col: val.col,
      row: val.row,
      size_x: val.size_x,
      size_y: val.size_y,
      slice_id: val.slice_id,
      index: Number(val.index),
    };
    if (this.paramEdit.position_json == null) {
      this.paramEdit.position_json = [];
      this.paramEdit.position_json.push(tes);
    } else {
      let fil = this.paramEdit.position_json.filter((x) => x.index == Number(val.index));
      if (fil.length > 0) {
        this.paramEdit.position_json.filter((x) => x.index == Number(val.index))[0].col = val.col;
      } else {
        this.paramEdit.position_json.push(tes);
      }
    }
  }

  async onChartHeight(val) {
    let param = {
      col: val.col,
      row: val.row,
      size_x: val.size_x,
      size_y: val.size_y,
      slice_id: val.slice_id,
      index: Number(val.index),
    };
    if (this.paramEdit.position_json == null) {
      this.paramEdit.position_json = [];
      this.paramEdit.position_json.push(param);
    } else {
      let fil = this.paramEdit.position_json.filter((x) => x.index == Number(val.index));
      if (fil.length > 0) {
        this.paramEdit.position_json.filter((x) => x.index == Number(val.index))[0].row = val.row;
      } else {
        this.paramEdit.position_json.push(param);
      }
    }
  }

  async onChartFilter(item) {}

  async refreshDashboard(item) {
    if (item.id == undefined) return;
    this.isLoadingContent = true;
    let element = document.getElementById('rowDashboard');
    var nodes = Array.from(element.getElementsByClassName('grid-stack-item'));
    this.grid = GridStack.init();
    if (nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        this.grid.removeWidget(nodes[i]);
        const viewContainerRef = this.injectComp.viewContainerRef;
        viewContainerRef.clear();
      }
    }
    let url = this.loadUrl;
    if (url == '' || url == undefined) {
      url = this.url != '' ? this.url : '/api/dashboard/view?link=' + item.slug;
      if (this.url == undefined) url = '/api/dashboard/view?link=' + item.slug;
    }
    this.getChartToSetDashboard(url);
  }

  handleShowAndHideSidebar(type) {
    if (type == 'left') this.isLeftToggle = !this.isLeftToggle;
    if (type == 'right') this.isRightToggle = !this.isRightToggle;
    this.layoutUtilsService.addRemoveBodyClass(type, this.isLeftToggle, this.isRightToggle);
  }

  getChartNameById(dashboardId) {
    return collectingChartByDashboardId(dashboardId, this.chartList, this.visualizationTypeList);
  }

  searchChart() {
    this.chartList = search_regex_two(this.masterDataChart, this.searchChartText.toLowerCase(), 'name', 'viz_type');
  }

  searchDashboard() {
    this.dashboardList = search_regex(
      this.masterDataDashboard,
      this.searchDashboardText.toLowerCase(),
      'dashboard_title'
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  // handle tab active chart list and dashboard list
  // have 2 identity tabChart and tabDashboard
  tabOnClick(tab: string) {
    this.activeTab = tab;
  }

  // collapse accordion on click have 2 options
  // dashboard property and dashboard options
  // default dashboardProperty is open
  collapseOnClick(collapseType: string) {
    this.activeColapse = { ...this.activeColapse, [collapseType]: !this.activeColapse[collapseType] };
  }

  collapseDashboardAccordion = (id) => {
    this.activeId = this.activeId !== id ? id : 0;
  };
  handleSelectOption = (type, id) => {
    this.selectedTypeOption = type;
    this.selectedOptionId = this.selectedOptionId !== id ? id : 0;
  };
}
