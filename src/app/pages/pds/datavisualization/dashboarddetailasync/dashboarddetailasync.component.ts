import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  HostBinding,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import { InjectDirective } from 'src/app/libs/directives';
import { BasicChartComponent } from 'src/app/components/chartasync/basic/basic.component';
import { ApiService } from 'src/app/libs/services';
import { loadExploreJson } from 'src/app/libs/helpers/data-visualization-helper';
import { initial_form_data } from 'src/app/pages/pds/datavisualization/editor-visualization/helper.editor.visualization';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';

import {
  // PostSharedChartData,
  PostDashboardChartData,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';

import {
  // sharedChartDataSelector,
  sharedDashboardDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { static_floating_card_dashboard } from 'src/app/libs/helpers/constant_datavisualization';

declare var require: any;
require('echarts-wordcloud');
declare var GridStack: any;
@Component({
  selector: '[pq-chart-async]',
  templateUrl: './dashboarddetailasync.component.html',
  styleUrls: ['./dashboarddetailasync.component.scss'],
})
export class DashboarddetailasyncComponent implements OnInit, AfterViewInit {
  @HostBinding('id') id: string;
  @HostBinding('class') class: string;
  @HostBinding('style') styles: string; // = "height : 100%";// akan dihapus
  @Output() onEventButtonClick: EventEmitter<any> = new EventEmitter<any>();
  @Input() myChartID: string;
  @Input() typeChart: string;
  @Input() token: any; // akan dihapus
  @Input() data: any; // akan dihapus
  @Input() title: string;
  @Input() mapGeoJSON: any;
  @Input() index: number;
  @Input() columns: any; // akan dihapus
  @Input() records: any; // akan dihapus
  @Input() autoResize: any; // akan dihapus
  @Input() isDrag: any; // akan dihapus
  @Input() position: number; // akan dihapus
  @Input() isView: boolean; // akan dihapus
  @Input() url: any; // akan dihapus
  @Input() slug: any; // akan dihapus
  @Input() extra: any; // akan dihapus
  @Input() is_extra: boolean; // akan dihapus
  @Input() coloringPie: any; // akan dihapus
  @Input() listSliceArr: any;
  @Input() gridPos: any;
  @Input() isSearchResult: boolean; // akan dihapus
  @Input() searchResultOptions: any; // akan dihapus
  @Input() isDateFilter: boolean; // akan dihapus
  @Input() isInitialDateFilter: boolean; // akan dihapus
  @Input() row: number; // akan dihapus
  @Input() zoom: any; // akan dihapus
  @Input() center: any; // akan dihapus
  @Input() namemap: any; // akan dihapus
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  @Output() height: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchResultJumpTo: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;

  grid: any;
  isLoadingContent: boolean = false;
  sharedChartDataArr: Array<any> = [];
  listChartDashboard: Array<any> = [];
  isApply: boolean = false;
  isReload: boolean = false;
  isShowColumn: boolean = false;

  eventButtonData = static_floating_card_dashboard;

  constructor(private service: ApiService, private store: Store<AppState>, private changeDetector: ChangeDetectorRef) {
    this.store
      .select(sharedDashboardDataSelector)
      .pipe()
      .subscribe(async (result) => {
        if (result) {
          this.sharedChartDataArr = result.dashboardCharts;
        }
      });
  }

  ngOnInit() {
    let me = this;
    // this.row = this.row === 0 || this.row < 25 ? 75 : this.row;
    me.id = me.index + '_' + me.typeChart + '_' + me.myChartID;
    // this.isView = this.isView ? this.isView : false;
    this.grid = GridStack.init();
    this.getDataChart({ id: this.myChartID });
  }

  ngAfterViewInit() {
    if (this.gridPos) {
      let card = document.getElementById(this.id);

      let mode = this.gridPos.size_x == 0 && this.gridPos.size_y == 0 ? true : false;
      this.grid.addWidget(card, this.gridPos.size_x, this.gridPos.size_y, this.gridPos.col, this.gridPos.row, mode);
    } else {
      this.class = 'col-lg-4 col-md-6 col-sm-12';
    }
  }

  onRefresh(id) {
    this.refresh.emit({
      id: id,
      index: this.index,
      mapGeoJSON: this.mapGeoJSON,
    });
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  onWidth(e) {
    let me = this;
    this.width.emit({
      id: me.id,
      col: e,
      row: this.row ? this.row : 0,
      size_x: 0,
      size_y: 0,
      slice_id: this.myChartID,
    });
  }

  onHeight(e) {
    let me = this;
    this.height.emit({
      id: me.id,
      col: this.position,
      row: e,
      size_x: 0,
      size_y: 0,
      slice_id: this.myChartID,
      index: this.index,
    });
  }

  onDownload(e) {
    this.download.emit({ id: e.id, data: e.data });
  }

  onDelete() {
    this.delete.emit({ index: this.index, id: this.id });
  }

  onFilter(e) {
    this.filter.emit({
      id: e.id,
      data: e.data,
      filter: e.filter,
      url: this.url,
      slug: this.slug,
      isLinkTo: e.isLinkTo ? e.isLinkTo : false,
      isItemChart: e.isItemChart ? e.isItemChart : false,
      linkTo: e.linkTo ? e.linkTo : '',
      isFilter: e.isFilter,
      zoom: e.zoom,
      center: e.center,
      namemap: e.namemap,
    });
  }

  onSearchJumpTo(e) {
    this.searchResultJumpTo.emit({
      slug: e,
    });
  }

  getDataChart = async (params) => {
    // code for get explore for create chart on card
    const exploreObj = params ? await loadExploreJson(params, this.service) : null;
    const sharedChartDataObj = {
      themes: exploreObj && params.id ? exploreObj.explore.form_data.color_scheme : [],
      title: exploreObj && params.id ? exploreObj.explore.slice.slice_name : '',
      hasActivity: true,
      index: null,
      myChartID: params && params.id ? params.slice_id || params.id : '',
      data: null,
      typeChart: exploreObj ? exploreObj.explore.form_data.viz_type : 'preview',
      mapGeoJSON: null,
      url: null,
      explore: exploreObj
        ? { ...exploreObj.explore, form_data: initial_form_data(exploreObj.explore.form_data) }
        : {
            form_data: initial_form_data(null),
          },
      exploreJson: exploreObj
        ? exploreObj.exploreJson
          ? { ...exploreObj.exploreJson, form_data: initial_form_data(exploreObj.exploreJson.form_data) }
          : {
              form_data: initial_form_data(null),
            }
        : {
            form_data: initial_form_data(null),
          },
    };

    // copy array of chart dashboard
    this.sharedChartDataArr = Object.assign([], this.sharedChartDataArr);
    // insert object to array
    this.sharedChartDataArr.push(sharedChartDataObj);
    // remove duplicate array and sort array base on this.listSliceArr
    let reorderArray = this.handleRemoveDuplicateAndSortByListedChart();
    // set global chart dashboard to store
    this.store.dispatch(PostDashboardChartData({ dashboardCharts: reorderArray }));
    this.isLoadingContent = false;
    this.changeDetector.detectChanges();
  };

  handleRemoveDuplicateAndSortByListedChart = () => {
    // copy array
    let arr = this.sharedChartDataArr.filter(
      (value, index, self) => index === self.findIndex((t) => t.myChartID === value.myChartID)
    );
    // handle sorting array
    arr.sort(this.sortFunc);
    return arr;
  };

  sortFunc = (a, b) => {
    var sortingArr = this.listSliceArr;
    var index_a = sortingArr.indexOf(a.myChartID)
    if (index_a < 0) index_a = sortingArr.length;
    return index_a - sortingArr.indexOf(b.myChartID);
  };

  createChart(chartIndex?: number) {
    // code for create viewcontainer ref
    this.index = chartIndex;
    const viewContainerRef = this.injectComp.viewContainerRef;

    let componentRef = viewContainerRef.createComponent(BasicChartComponent);
    let currentComponent = componentRef.instance;

    if (chartIndex !== undefined) {
      currentComponent.chartIndex = chartIndex;
      currentComponent.id = this.id;
    }
  }

  handleEventButton(event: any) {
    this.onEventButtonClick.emit(event);
  }
}
