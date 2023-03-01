import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  AfterViewInit,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, JsonService, TranslationService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import * as introJs from 'intro.js/intro.js';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { GetChartDatasource, PostSharedChartData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';

import { ChartddetailasyncComponent } from '../chartdetailasync/chartdetailasync.component';

// ChartddetailasyncComponent ganti BasicChartComponent
import { BasicChartComponent } from 'src/app/components/chartasync/basic/basic.component';

import {
  customColorPalette,
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
  setInitialDate,
  getConfigChart, 
  loadChartData, 
  loadDatasetData, 
  loadExploreJson
} from 'src/app/libs/helpers/data-visualization-helper';

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
  selector: 'pq-datavisualization',
  templateUrl: './datavisualization.component.html',
  styleUrls: ['./datavisualization.component.scss']
})
export class DatavisualizationComponent implements OnInit, AfterViewInit {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;

  // pertahankan
  public datasourceTitle: string;
  public visualType: string;
  public stateloadDataset: boolean = false;
  public slice: any = {};
  public isLoadingContent: boolean = false;
  public isViewMessage: boolean = true;
  public slice_id: string;
  public messages: any;
  public errors: boolean = false;
  public component: any = [];
  public componentRef: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private translate: TranslateService,
    // new integration
    private store: Store<AppState>,
    // private viewContainerRef: ViewContainerRef
    private componentFactoryResolver: ViewContainerRef,
    private router: Router,
    private apiService: ApiService
  ) {}
  environtmentType: any;
  introJS = introJs();

  async getIntro(user?: any) {
    if (!user.isFirst.isDataVisualizationChart) return;
    user.isFirst = { ...user.isFirst, isDataVisualizationChart: false };
    localStorage.setItem('user', JSON.stringify(user));
    let intro: any = await this.jsonService.retIntro(this.translationService.getSelectedLanguage());
    this.introJS
      .setOptions({
        steps: intro.configurechart,
        skipLabel: 'Skip',
        showBullets: true,
        hintButtonLabel: 'OK',
        showProgress: false,
        hidePrev: true,
        exitOnOverlayClick: false,
        hideNext: false,
      })
      .start();
  }

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.environtmentType = environment.type;
    this.introJS.start();    
    this.route.queryParams.subscribe(async (params) => {
      this.isLoadingContent = true;
      
      // code for get explore for create chart on card
      const exploreObj = await loadExploreJson(params.slice_id, this.apiService);
      const sharedChartDataObj = {
        themes: exploreObj.explore.form_data.color_scheme,
        title: exploreObj.explore.slice.slice_name,
        hasActivity: true,
        index: null,
        myChartID: params.slice_id,
        data: null,
        typeChart: exploreObj.explore.form_data.viz_type,
        mapGeoJSON: null,
        url: null,
        explore: exploreObj.explore,
        exploreJson: exploreObj.exploreJson
      };
      
      this.store.dispatch(PostSharedChartData(sharedChartDataObj));
      this.isLoadingContent = false;
      this.cdRef.detectChanges();

      if (params.slice_id != undefined) {
        this.isViewMessage = false;
        this.slice_id = params.slice_id;
        this.slice = { slice_id: params.slice_id };
      }
    });
  }

  
  createChart() {
    // code for create viewcontainer ref
    const viewContainerRef = this.injectComp.viewContainerRef;
    viewContainerRef.createComponent(BasicChartComponent);
  }

  ngAfterViewInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.changeLang();
    });

    this.route.queryParams.subscribe((params) => {
      this.slice_id = params.slice_id;
    });
  }

  async changeLang() {
    this.messages = await this.jsonService.retMessage();
  }
  initial() {
    this.slice = {};
    this.cdRef.detectChanges();
  }

  async getSchema() {
    // this.store.dispatch(GetColorPallete());
  }

  async loadDataset() {
    this.isViewMessage = true;
    this.isLoadingContent = true;
    this.slice = {};
    this.getSchema();
    this.store.dispatch(GetChartDatasource());
  }
  removeChartFromContent() {
    let element = document.getElementById('workspace');
    var nodes = Array.from(element.getElementsByTagName('pq-chartdetailasync'));
    if (nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        this.removeComp();
      }
    }
    this.initial();
  }

  addCompChart(
    type,
    ID,
    title,
    url,
    data,
    themes?,
    geoMap?,
    exploreJson?,
    explore?,
    index?,
    palleteDefault?,
    columns?,
    records?,
    coloringPie?
  ) {
    // const viewContainerRef = this.injectComp.viewContainerRef;
    // viewContainerRef.clear();
    // const componentRef = viewContainerRef.createComponent(ChartContainerComponent);
    // let currentComponent = componentRef.instance;

    // share variable
    // currentComponent.themes = themes ? themes : palleteDefault;
    // currentComponent.title = title;
    // currentComponent.hasActivity = true;
    // currentComponent.index = index;
    // currentComponent.myChartID = ID;
    // currentComponent.data = data;
    // currentComponent.typeChart = type;
    // currentComponent.mapGeoJSON = geoMap;
    // currentComponent.url = url;
    // // currentComponent.columns = columns;
    // // currentComponent.records = records;
    // currentComponent.explore = explore;
    // currentComponent.exploreJson = exploreJson;
    // // currentComponent.autoResize = true;
    // // currentComponent.coloringPie = coloringPie || [];

    // currentComponent.openModal.subscribe((val) => this.onOpenModal(val));
    // currentComponent.delete.subscribe((val) => this.onChartDelete(val));
    // currentComponent.download.subscribe((val) => this.onChartDownload(val));
    // currentComponent.edit.subscribe(() => this.onChartEdit());
    // currentComponent.refresh.subscribe((val) => this.onChartRefresh());
    
    // this.component.push(componentRef);
    // delete node old
    // let element = document.getElementById('workspace');
    // var nodes = Array.from(element.getElementsByTagName('pq-chartcontainer'));

    // document.querySelectorAll('pq-chartcontainer').forEach(function (el, i) {
    //   el.className = ' ';
    //   el.classList.add('col-md-12');
    //   window.dispatchEvent(new Event('resize'));
    // });
    // this.isLoadingContent = false;
    // this.errors = false;
    // this.cdRef.detectChanges();
  }

  removeComp() {
    const viewContainerRef = this.injectComp.viewContainerRef;
    viewContainerRef.clear();
  }

  async loadDatasetTo(item) {
    this.messages = await this.jsonService.retMessage();
    if (item == undefined) return this.router.navigate(['/pds/newdatavisualization']);
    this.stateloadDataset = true;
    this.isViewMessage = false;
    localStorage.setItem('dataset', JSON.stringify([item]));
    this.removeChartFromContent();
    this.isLoadingContent = true;
    this.datasourceTitle = this.messages.CHART.U || 'Untitled';
    const [ds, dsType] = item.uid.split('__');
    const uri = `api/chart/explore/`;
    const url = `${uri}${dsType}/${ds}`;
    let explore = await loadDatasetData(url, this.apiService, this.messages, this.removeChartFromContent);
    let urlnext = '/api/chart/explore_json/';
    let formdata = {
      datasource: explore.form_data.datasource,
      viz_type: explore.form_data.viz_type || 'preview',
      groupby: explore.form_data.groupby || [],
      metrics: explore.form_data.metrics || [],
      include_time: explore.form_data.include_time || false,
      timeseries_limit_metric: explore.form_data.timeseries_limit_metric || null,
      table_filter_column: explore.form_data.table_filter_column || null,
      table_sort_desc: explore.form_data.table_sort_desc || false,
      table_font_size: explore.form_data.table_font_size || 10,
      table_font_family: explore.form_data.table_font_family || null,
      page_size: explore.form_data.page_size || 10,
      page_index: explore.form_data.page_index || 1,
      page_sort: explore.form_data.page_sort || [],
      order_desc: explore.form_data.order_desc || true,
      all_columns: explore.form_data.all_columns || [],
      order_by_cols: explore.form_data.order_by_cols || [],
      granularity_sqla: explore.form_data.granularity_sqla || null,
      time_grain_sqla: explore.form_data.time_grain_sqla || null,
      since: explore.form_data.since || null,
      until: explore.form_data.until || null,
      filters: explore.form_data.filters || [],
      datasource_name: explore.form_data.datasource_name,
      filter_date: explore.form_data.filter_date || null,
      filter_date_type: explore.form_data.filter_date_type || null,
    };
    let param = { form_data: JSON.stringify(formdata) };
    let exploreJson = await loadChartData(urlnext, param, this.messages, this.apiService);
    let isError = false;
    if (typeof exploreJson == 'string') {
      this.isLoadingContent = false;
      this.errors = true;
      isError = true;
      this.cdRef.detectChanges();
      return false;
    }
    this.visualType = explore.form_data.viz_type;

    let config = await getConfigChart(exploreJson, this.apiService);

    this.addCompChart(item.type, item.uid, item.query, url, config[0], 'palette1', config[1], exploreJson, explore);
    if (isError) {
      this.addCompChart(item.type, item.uid, item.query, url, config[0], 'palette1', config[1], exploreJson, explore);
    }
    this.cdRef.detectChanges();
  }
  onChartDelete(index: number) {}

  
  onOpenModal(fomdata) {}
  
  onChartDownload() {
    alert('download');
  }
  
  onChartEdit() {
    alert('edit');
  }

  onChartRefresh() { 
    this.isLoadingContent = true;
    setTimeout(() => { 
      this.isLoadingContent = false; 
      this.cdRef.detectChanges();
    }, 1000);
  }

  eventButtonData: any = [
    {type: 'refresh', icon: 'zmdi zmdi-refresh-alt'},
    {type: 'edit', icon: 'zmdi zmdi-edit'},
    {type: 'download', icon: 'zmdi zmdi-download'},
  ];

  handleEventButton(event:any) {
    switch(event.type) {
      case 'refresh': 
        this.onChartRefresh();
        break;
      case 'download': 
        this.onChartDownload();
        break;
      case 'edit': 
        this.onChartEdit();
    }
  }
}
