import { HttpErrorResponse } from '@angular/common/http';
// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
// Material
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { throwError } from 'rxjs';
import { format } from 'timeago.js';
import * as _moment from 'moment';

//NGRX
import { Store } from '@ngrx/store';

// CRUD
import { ApiService, TranslationService } from 'src/app/libs/services';
import { search_regex_three } from 'src/app/libs/helpers/utility';
import { AppState } from 'src/app/libs/store/states';
import {
  GetApplicationList,
  GetChartList,
  GetDashboardList,
  PostDashboardChartData,
  PostSharedChartData,
  SetExtraFilter,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  applicationListSelector,
  chartListSelector,
  dashboardListSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { list_option_object, staticLoadingArray } from './helperlist';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';
import { initial_form_data } from 'src/app/pages/pds/datavisualization/editor-visualization/helper.editor.visualization';
@Component({
  selector: '[content-card-list]',
  templateUrl: './list.component.html',
})
export class ContentCardListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  options: any;

  generalSearch;

  selection = new SelectionModel<any>(true, []);

  masterData: any = [];
  topbarOption: any;
  array: any;
  dataSource: any = [];

  pageEvent: PageEvent;
  pageIndex: number;
  pageSize: number = 12;
  length: number = 100;
  currentPage: number = 0;
  totalSize: number = -1;
  type: any;
  loading: boolean = true;
  loadingList: any = staticLoadingArray(8);
  constructor(
    private _apicall: ApiService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private translationService: TranslationService,
    private store: Store<AppState>
  ) {
    this.store
      .select(dashboardListSelector)
      .pipe()
      .subscribe((result) => {
        this.setState(result);
        this.cdRef.detectChanges();
      });
    this.store
      .select(applicationListSelector)
      .pipe()
      .subscribe((result) => {
        this.setState(result);
        this.cdRef.detectChanges();
      });
    this.store
      .select(chartListSelector)
      .pipe()
      .subscribe((result) => {
        this.setState(result);
        this.cdRef.detectChanges();
      });
  }

  async initial() {
    this.masterData = [];
    this.dataSource = [];
    this.totalSize = -1;
    this.loading = true;
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.options = list_option_object(findTypeCheckByUrl(), this.translationService);
    this.setData();
    this.handleResetObjectChart();
  }

  setData = async () => {
    this.topbarOption = {
      isButtonCreate: this.options.isButtonCreate,
      buttonCreateName: this.options.buttonCreateName,
      routeButtonCreate: this.options.routeButtonCreate,
      isButtonRefresh: this.options.isButtonRefresh,
      isButtonTabs: this.options.isButtonTabs || false,
      buttonTabs: this.options.buttonTabs,
    };
    if (!this.options.isRandomImageBackground) {
      let val = await this._apicall.getApi(this.options.getImagesUrl);
      this.options.arrayImageBackground = val.result[0][this.options.getImagesFieldFromUrl];
    }
  };

  iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.array != null ? this.array.slice(start, end) : 0;
    this.dataSource = part;
  }

  handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
    return { pageIndex: e.pageIndex, previousPageIndex: e.previousPageIndex, pageSize: e.pageSize, length: e.length };
  }

  // simplify function set response from api to state component
  setState(result) {
    this.loading = false;
    // copy result
    let response = result.response ? result.response : [];
    // sort array by date change [REMOVE] because response from api always latest modify
    // set result to temporary data
    this.masterData = result.response ? result.response : [];
    this.dataSource = new MatTableDataSource<Element>(response);
    this.dataSource.paginator = this.paginator;
    this.array = response;
    this.totalSize = this.array == null ? 0 : this.array.length;
    this.iterator();
    this.cdRef.detectChanges();
  }

  getDataSources() {
    // set condition by type
    switch (this.options.type) {
      case 'dashboard':
        // call api for dashboard list
        this.store.dispatch(GetDashboardList());

        break;
      case 'application':
        // call api for application list
        this.store.dispatch(GetApplicationList());

        break;

      default:
        this.store.dispatch(GetChartList());

        break;
    }
  }

  getBackground(i) {
    let bgList = this.options.arrayBackgroundClass;
    let bg = bgList[i] == null ? bgList[i - 8] : bgList[i];
    return bg;
  }

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    }
    //yang lama
    // return new ErrorObservable(error.error);
    //yang baru refactor
    return throwError(() => new Error(error.error));
  }

  reload() {
    // set new state empty
    this.masterData = [];
    this.dataSource = [];
    this.generalSearch = '';
    this.totalSize = -1;
    this.loading = true;
    // calling api source by type
    this.getDataSources();
  }

  search() {
    // bind spesifik data from array or object
    this.dataSource = search_regex_three(this.masterData, this.generalSearch, this.options.searchField);
    this.dataSource.paginator = this.paginator;
    this.array = this.dataSource;
    this.totalSize = this.array.length;
    this.iterator();
  }

  getBodyTitle(row) {
    return row[this.options.searchField];
  }

  getQueryParam(item) {
    if (this.options.type == 'chart') {
      return { slice_id: item[this.options.linkField] };
    } else {
      return { link: item[this.options.linkField] };
    }
  }

  getRandomImage(x) {
    let images = this.options.arrayImageBackground;
    let i = x % 4;
    return images[i];
  }

  getImageByValue(row) {
    let result = this.options.arrayImageBackground.filter((v) => v['value'] == row[this.options.imageCompareField])[0];
    var imgUrl = result == null ? '-' : result[this.options.imageValueField];
    return imgUrl;
  }

  getTypeLabel(row) {
    var result = this.options.arrayImageBackground.filter(
      (v) => v['value'] == row[this.options.labelTypeCompareField]
    )[0];
    var label = result == null ? '-' : result[this.options.labelValueField];
    return label;
  }

  getTotalItems(row) {
    let total = 0;
    if (this.options.leng == 'len')
      total = row[this.options.fieldTotalItems] !== null ? row[this.options.fieldTotalItems].length : 0;
    else total = row[this.options.fieldTotalItems] != null ? row[this.options.fieldTotalItems] : 0;
    return total;
  }

  getUpdatedDate(row) {
    return this.formatDateByLang(row[this.options.fieldUpdatedDate]);
  }

  formatDateByLang(val) {
    if (this.translationService.getSelectedLanguage() == 'en') {
      return format(val);
    } else {
      return format(val)
        .replace(/seconds|second/gi, 'detik')
        .replace(/minutes|minute/gi, 'menit')
        .replace(/hours|hour/gi, 'jam')
        .replace(/days|day/gi, 'hari')
        .replace(/weeks|week/gi, 'minggu')
        .replace(/months|month/gi, 'bulan')
        .replace(/years|year/gi, 'tahun')
        .replace(/ago/gi, 'lalu');
    }
  }
  ngOnInit() {
    this.initial();
    this.getDataSources();
    this.cdRef.detectChanges();
  }

  handleResetObjectChart = () => {
    const sharedChartDataObj = {
      themes: [],
      title: 'Untitled',
      hasActivity: true,
      index: null,
      myChartID: '',
      data: null,
      typeChart: 'preview',
      mapGeoJSON: null,
      url: null,
      explore: {
        form_data: initial_form_data(null),
      },
      exploreJson: {
        form_data: initial_form_data(null),
      },
    };
    this.store.dispatch(PostSharedChartData(sharedChartDataObj));
    this.store.dispatch(PostDashboardChartData({ dashboardCharts: [] }));
    this.store.dispatch(SetExtraFilter({ extraFilter: [] }));
  };
}
