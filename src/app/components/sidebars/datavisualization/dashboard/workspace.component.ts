import { ChangeDetectorRef, Component, Input, OnInit, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { InjectDirective } from 'src/app/libs/directives';
import {
  findTypeCheckByUrl,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetData,
  helperPostData,
} from 'src/app/libs/helpers/data-visualization-helper';
import { getColOldConfig } from 'src/app/libs/helpers/utility';
import { ApiService, DataVisualizationService, JsonService } from 'src/app/libs/services';
import {
  chartListSelector,
  deleteChartDashboardSelector,
  insertChartDashboardSelector,
  menuBuilderSelector,
  sharedDashboardDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { DashboarddetailasyncComponent } from 'src/app/pages/pds/datavisualization/dashboarddetailasync/dashboarddetailasync.component';
import {
  initialOptionGridStack,
  initialOptionGridStackOnViewOnly,
  setConfigMapOverlay,
} from 'src/app/pages/pds/datavisualization/dashboardeditor/helperDashboardEditor';
import * as echarts from 'echarts';
import {
  SetMenuBuilderDetail,
  PostDashboardChartData,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { datasetItemSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
declare var GridStack: any;
declare var d3: any;
@Component({
  selector: 'workspace_dashboard',
  templateUrl: './workspace.component.html',
})
export class WorkspaceDashboardsComponent implements OnInit, OnChanges {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;

  @Output() onEventButtonClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() setSelectedItem: EventEmitter<any> = new EventEmitter<any>();
  
  @Input() formData;
  @Input() loadingFromParent;
  @Input() menu: any;
  @Input() selectedMenu: any;
  

  charts: Array<any> = [];
  isLoadingContent: boolean = false;
  grid: any;
  component: Array<any> = [];
  chartList: Array<any> = [];
  parameter: any;
  listSliceArr: Array<any> = [];
  gridPos: any;
  index: number = 0;
  colorPalette: Array<any> = [];
  // formdata: any;
  geomap: any;
  scatterDatas = [];
  coloringPie: any = [];
  messages: any;
  typePage: string = '';
  isNewDashboard: boolean = false;
  isSharePage: boolean = false;
  idRender: number;
  dashboardCharts: Array<any> = [];
  traversedMenu: Array<any> = [];

  constructor(
    private dataVisualziationService: DataVisualizationService,
    private jsonService: JsonService,
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private service: ApiService,
    private activedRoute: ActivatedRoute,
    private route: Router,
    private activeRoute: ActivatedRoute
  ) {
    this.store.select(chartListSelector).subscribe((res) => {
      if (res) {
        this.chartList = res.response;
      }
    });

    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        if (res.slug && ['app_preview'].includes(this.typePage)) {
          this.preparingData(res);
        }

        if (['dashboard', 'dashboardview'].includes(this.typePage)) {
          this.preparingData(res);
        }
      }
    });

    this.store
      .select(insertChartDashboardSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.loadChartToComponent(result);
          // this.changeDetector.detectChanges();
        }
      });
    this.store
      .select(deleteChartDashboardSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.onChartDeleteInSelect(result);
          this.changeDetector.detectChanges();
        }
      });

    this.store
      .select(sharedDashboardDataSelector)
      .pipe()
      .subscribe((result) => {
        this.dashboardCharts = result.dashboardCharts;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isLoadingContent = this.loadingFromParent;

    if (changes.selectedMenu && changes.selectedMenu.currentValue || changes.menu && changes.menu.currentValue) {      
      this.traversedMenu = [];

      if (this.selectedMenu && this.menu) {
        const menuTraversal = function(menu: Array<any>, traversedMenu, selectedMenu) {
          let i = 0;
          let found = false;
          while (i < menu.length && !found) {
            const menuItem = menu[i];
  
            traversedMenu.push(menuItem);
  
            if (menuItem.menu_id === selectedMenu.menu_id) {
              found = true;
            }
  
            if (!found && menuItem.children && menuItem.children.length > 0) {
              menuTraversal(menuItem.children, traversedMenu, selectedMenu);
            }
  
            i++;
          }
        };
  
        let i = 0;
        let found = false;
        while (i < this.menu.length) {
          const menuItem = this.menu[i];
  
          this.traversedMenu.push(menuItem);
  
          if (menuItem.menu_id === this.selectedMenu.menu_id) found = true;
  
          if (!found && menuItem.children && menuItem.children.length > 0) {
            menuTraversal(menuItem.children, this.traversedMenu, this.selectedMenu);
          }  
  
          i++;
        }  
      }
      
      // console.log('this.traversedMenu', this.traversedMenu)
    }
  }

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    this.typePage = findTypeCheckByUrl();
    this.initialDragDrop();
    this.activedRoute.queryParams.subscribe(async (params) => {
      this.removeWidgetGridStack();
      if ('link' in params || 'token' in params) {
        this.isNewDashboard = false;
        this.isSharePage = this.route.url.includes('pdsshare');
        //set initial id and slug when dashboard have a id
        if (this.isSharePage) {
          this.getChartToSetDashboard(`pdsshare`);
        } else {
          if (this.typePage === 'app_preview') {
            this.isSharePage = true;
            if (this.parameter && this.idRender !== this.parameter.slug) {
              this.getChartToSetDashboard(`/api/dashboard/view?link=${this.parameter.slug}`, this.parameter);
            }
          }

          if (['dashboard'].includes(this.typePage)) {
            if (!this.parameter) {
              this.parameter = {
                ...this.parameter,
                charts: this.dashboardCharts,
                dashboard_title: '',
                slug: params.link,
              };
            }
            this.getChartToSetDashboard(`/api/dashboard/view?link=${params.link}`);
          }

          if (['dashboardview'].includes(this.typePage)) {
            this.getChartToSetDashboard(`/api/dashboard/view?link=${params.link}`);
          }
        }
      } else {
        this.clearDashboardSharedCharts();
        this.isNewDashboard = true;
        this.store.dispatch(
          SetMenuBuilderDetail({
            item: { ...this.parameter, dashboard_title: 'Untitled', slug: '', id: null },
          })
        );

        this.parameter = { ...this.parameter, charts: [], dashboard_title: 'Untitled', slug: '' };
      }
    });

    // this.store.select(datasetItemSelector).subscribe((item) => console.log('chart', item));

    this.changeDetector.detectChanges();
  }

  clearDashboardSharedCharts() {
    this.store.dispatch(PostDashboardChartData({ dashboardCharts: [] }));
  }

  initialDragDrop() {
    let me = this;
    this.grid = GridStack.init(
      this.typePage === 'dashboardview' || this.typePage === 'app_preview'
        ? initialOptionGridStackOnViewOnly
        : initialOptionGridStack
    );
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
        if (me.parameter.position_json && me.parameter.position_json.length > 0) {
          me.parameter['position_json'].forEach(function (e) {
            if (e.id == item.el.id) {
              isExixts = true;
            }
          });
        }
        if (!isExixts) {
          me.parameter = {
            ...me.parameter,
            position_json: me.parameter.position_json.concat([
              {
                col: 2,
                row: 2,
                size_x: item.x,
                size_y: item.y,
                slice_id: sliceId,
                id: item.el.id,
                index: i,
              },
            ]),
          };
        }
        window.dispatchEvent(new Event('resize'));
        me.changeDetector.detectChanges();
      });
    }

    function change(type, items) {
      items.forEach(function (item) {
        me.parameter['position_json'].forEach(function (e) {
          if (e.id == item.el.id) {
            e.col = item.width;
            e.row = item.height;
            e.size_x = item.x;
            e.size_y = item.y;
            window.dispatchEvent(new Event('resize'));
            me.changeDetector.detectChanges();
          }
        });
      });
    }
  }

  addCompChart(type, ID, title, url?) {
    if (this.isNewDashboard) {
      this.parameter = { ...this.parameter, charts: this.dashboardCharts };
      this.index = this.dashboardCharts.length;
    }

    let viewContainerRef = null;
    let componentRef = null;
    if (!this.injectComp) {
      this.isLoadingContent = false;
      return;
    }
    viewContainerRef = this.injectComp.viewContainerRef;
    componentRef = viewContainerRef.createComponent(DashboarddetailasyncComponent);

    let currentComponent = componentRef.instance;
    currentComponent.index = this.index;
    currentComponent.myChartID = ID;
    currentComponent.title = title;
    currentComponent.typeChart = type;
    currentComponent.data = this.formData; // akan dihapus
    currentComponent.mapGeoJSON = this.geomap;
    currentComponent.isDrag = true; // akan dihapus
    currentComponent.autoResize = true; // akan dihapus
    currentComponent.url = url; // akan dihapus
    currentComponent.slug = this.parameter.slug; // akan dihapus
    currentComponent.coloringPie = this.coloringPie; // akan dihapus
    currentComponent.listSliceArr = this.listSliceArr;
    currentComponent.grid = this.grid;
    currentComponent.gridPos = this.gridPos;

    currentComponent.onEventButtonClick.subscribe((val) => this.onEventButtonClick.emit(val));
    currentComponent.delete.subscribe((val) => this.onChartDelete(val)); // akan dihapus
    currentComponent.edit.subscribe((val) => this.onChartEdit(val)); // akan dihapus
    this.component.push(componentRef);
    this.isLoadingContent = false;
    this.changeDetector.detectChanges();
  }

  removeWidgetGridStack = () => {
    this.grid = GridStack.init(initialOptionGridStack);
    if (this.grid) {
      this.grid.removeAll();
    }
  };

  preparingData = async (item) => {
    // set parameter edit for re-create object
    if (!this.parameter && this.route.url.includes('app_preview') && item.slug) {
      this.removeWidgetGridStack();
      this.getChartToSetDashboard(`/api/dashboard/view?link=${item.slug}`, item);
    }
    this.parameter = item;

    if (item.charts && item.charts.length === 0) {
      this.removeWidgetGridStack();
    }
  };
  async getChartToSetDashboard(url, item?) {
    let getDashboardData = null;
    this.isLoadingContent = true;
    if (url == '') return;
    // get dashboard data using url
    if (this.route.url.includes('pdsshare')) {
      getDashboardData = await helperGetData(
        `api/dashboard/view/shared?token=${this.activeRoute.snapshot.queryParams.token}`,
        this.service
      );
    } else {
      if (this.route.url.includes('app_preview')) {
        // getDashboardData = item;
        this.idRender = item ? item.slug : '';
      }
      getDashboardData = await helperGetData(url, this.service);
    }
    let dashboard_id = getDashboardData.dashboard_data ? getDashboardData.dashboard_data.id : 0;
    let loopComponentChart = getDashboardData.dashboard_data.slices;
    let position_json = getDashboardData.dashboard_data.position_json;
    // check if getDashboardData is empty
    // break the function
    if (!getDashboardData.dashboard_data) return;

    // get token for share dashboard
    if (dashboard_id && dashboard_id > 0) {
      this.parameter = {
        ...this.parameter,
        id: this.parameter && this.parameter.id ? this.parameter.id : dashboard_id,
        position_json: position_json,
        dashboard_title:
          this.parameter && this.parameter.dashboard_title
            ? this.parameter.dashboard_title
            : getDashboardData.dashboard_data.dashboard_title,
      };
    }
    // looping for generate grid position
    const _forLoop = async (_loop) => {
      this.charts = [];
      let items = [];
      this.listSliceArr = [];
      for (let index = 0; index < _loop.length; index++) {
        let element = _loop[index];
        this.listSliceArr.push(element.slice_id);

        items.push(this.chartList.find((x) => x.id == element.slice_id));
        let col = 12;
        let row = 7;
        let size_x = 0;
        let size_y = 0;
        if (position_json) {
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
        if (element.form_data.viz_type != 'country_map2') {
          await pointer.addCompChart(element.form_data.viz_type, element.form_data.slice_id, element.slice_name, url);
        } else {
          setTimeout(async function () {
            await pointer.renderOverlay(
              element.form_data.viz_type,
              element.form_data.slice_id,
              element.slice_name,
              url
            );
          }, 1000);
        }
      }
      this.charts = items;
    };
    // looping recursive
    _forLoop(loopComponentChart);
    this.store.dispatch(SetMenuBuilderDetail({ item: this.parameter }));
    this.changeDetector.detectChanges();
  }

  refreshAllChart() {
    this.dataVisualziationService.refrechAllChart();
  }

  async renderOverlay(vizType, slice_id?, slice_name?, url?) {
    let pointer = this;
    await pointer.service.get('/assets/data/color_palette.json').subscribe(async (res) => {
      for (var i = 0; i < res.length; i++) {
        pointer.colorPalette['palette' + (i + 1)] = res[i];
      }
      // get data
      // generate explore url
      let exploreUrl = helperGenerateExploreUrl(slice_id);
      // generate explore json url
      let exploreJsonUrl = helperGenerateExploreJsonUrl(slice_id);
      // get explore url
      let resultExplore = await helperPostData(exploreUrl, {}, pointer.service);

      // get explore json url
      let resultExploreJson = await helperPostData(
        exploreJsonUrl,
        {
          form_data: JSON.stringify(resultExplore.result.form_data),
        },
        pointer.service
      );

      let jsonFile = await this.service.getApi(
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
      echarts.registerMap(configMapOverlay.title.text, configMapOverlay.mapGeoJson);
      this.formData = resultExploreJson;
      this.geomap = jsonFile;
      await pointer.addCompChart(vizType, slice_id, slice_name, url);
    });
  }

  async loadChartToComponent(item) {
    this.isLoadingContent = true;
    // position by default
    this.gridPos = {
      size_x: 0,
      size_y: 0,
      col: 6,
      row: 5,
    };

    if (this.route.url.includes('app_preview')) {
      this.grid = GridStack.init(initialOptionGridStack);
      if (this.grid && this.grid.engine.nodes.length === 0) {
        this.index = 0;
      } else {
        this.index = this.index + 1;
      }
      // position only specific chart on app preview
      this.gridPos = {
        size_x: item.position_json.size_x,
        size_y: item.position_json.size_y,
        col: item.position_json.col,
        row: item.position_json.row,
      };
    }

    if (!this.route.url.includes('app_preview')) {
      this.index = this.index + 1;
    }
    if (!this.route.url.includes('pdsshare')) {
      if (item.viz_type !== 'country_map2') {
        await this.addCompChart(item.viz_type, item.id, item.name);
      } else {
        await this.renderOverlay(item.viz_type, item.id, item.name);
      }
      if (!this.route.url.includes('app_preview')) {
        this.scrollContentToId(`${this.index}_${item.viz_type}_${item.id}`);
      }

      if (!this.route.url.includes('app_preview')) {
        this.parameter = { ...this.parameter, charts: [...this.parameter.charts.concat([item])] };
      }
      this.store.dispatch(SetMenuBuilderDetail({ item: { ...this.parameter } }));
    }

    this.changeDetector.detectChanges();
  }

  scrollContentToId(id) {
    let element = document.getElementById(id);
    if (element) {
      document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  _setSelectedItem(menuItem) {
    this.setSelectedItem.emit(menuItem);
  }

  async onChartDeleteInSelect(item) {
    let componentRef = this.component.filter((x) => x.instance.myChartID === item.value.id)[0];
    this.onChartDelete({ index: componentRef.instance.index, id: componentRef.instance.id });
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
    let position_json = this.parameter.position_json.reduce(
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
    let dashboardCharts = [...this.parameter.charts.filter((obj) => (obj.id || obj.myChartID) !== componentInstance.myChartID)];
    this.parameter = {
      ...this.parameter,
      charts: dashboardCharts,
      position_json,
    };
    // remove view container on workspace by index id
    this.injectComp.viewContainerRef.remove(eventFromChart.index);
    // resize or fit the workspace
    window.dispatchEvent(new Event('resize'));

    this.store.dispatch(SetMenuBuilderDetail({ item: this.parameter }));
    this.index--;

    if (this.isNewDashboard) {
      this.store.dispatch(PostDashboardChartData({ dashboardCharts }));
    }

    this.changeDetector.detectChanges();
  }

  async onChartEdit(id) {
    this.route.navigate(['/pds/newdatavisualization'], {
      queryParams: { slice_id: id },
    });
  }
}
