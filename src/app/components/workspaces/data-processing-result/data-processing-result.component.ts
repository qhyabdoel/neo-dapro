import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { data } from 'jquery';
import { BehaviorSubject, combineLatest, skipWhile, Subscription, take, withLatestFrom } from 'rxjs';
import { DataTableService, LoaderService } from 'src/app/libs/services';
import { ApiService } from 'src/app/libs/services';
import {
  SetActiveTable,
  SetIsQueryRequestTriggeredSubscribed,
  SetIsResultExpanded,
  SetMetadata,
  SetQueryResult,
  UpdateMetadata,
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import {
  activeTableSelector,
  isQueryRequestTriggeredSelector,
  isResultExpandedSelector,
  metadatasSelector,
  queryResultSelector,
} from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { AppState } from 'src/app/libs/store/states';
import { QueryMetadata } from 'src/app/pages/pds/dataprocessing/metadata';

@Component({
  selector: 'data-processing-result',
  templateUrl: 'data-processing-result.component.html',
  styleUrls: ['data-processing-result.component.scss'],
})
export class DataProcessingResultComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input() param: any;
  @Input() url: any;

  private allTables: any = [];

  private hasResult: boolean = false;
  private metadatas: MetadataDatasetWrapper[] = null;
  private queryMetadata: QueryMetadata;

  public columnIds: any = [];
  public colLength: number;
  public columns: any;

  public dataSource: MatTableDataSource<any>;
  public defPageSize = 25;
  public disableResult: boolean = true;
  public displayedColumns: any = [];

  public folderIcon = 'icon_only';

  public isMetadataExpanded: boolean = false;
  public isResultExpanded: boolean = false;
  public isUserLoadedQuery: boolean = false;

  public loading$: any;
  public loadingDataSource$: any;

  public multipleMetadata: {
    [key: string]: {
      [key: string]: {
        groupable: boolean;
        filterable: boolean;
        datetime: boolean;
        aggregate: boolean;
        indexable: boolean;
        fast_index: boolean;
      };
    };
  } = {};

  public pageIndex$: any;
  public pageLength$ = new BehaviorSubject<number>(0);
  public querySession: QueryParams;
  public queryResult: QueryResult;

  public source: any = [];

  public tableActive: string = '';
  public tableId$: any;
  public tableIndex: number = 0;
  public tableResult: { id: string; columns: any[]; rowtotal: number }[] = [];

  public innerHeight: string;
  public innerRotate: number;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private datatableService: DataTableService,
    private loaderService: LoaderService,
    private store: Store<AppState>
  ) {
    this.queryMetadata = new QueryMetadata(this.store, this.apiService);
  }

  ngOnInit() {
    combineLatest([this.store.select(activeTableSelector), this.store.select(queryResultSelector)]).subscribe(
      ([activeTable, queryResult]) => {
        // console.log('Triggered!')
        this.queryResult = queryResult;
        this.tableResult = [];
        if (activeTable && queryResult && queryResult.datasets && queryResult.datasets[activeTable] && queryResult.quid.rowtotal > 0) {
          // console.log('has result!', activeTable, queryResult.datasets)
          this.hasResult = true;

          const allTables = [];
          for (let dataset in queryResult.datasets) {
            const columns = queryResult.datasets[dataset].columns;
            const rows = queryResult.datasets[dataset].rows;
            allTables.push({
              id: dataset,
              columns,
              rows: rows,
              rowtotal: queryResult.total[dataset],
            });
          }

          this.allTables = allTables;
          this.tableResult = allTables;
          this.queryMetadata.reset();

          // 1. set default active table
          this.tableActive = activeTable;

          // 2. arrange list of displayed column for default table
          this.displayedColumns = queryResult.datasets[activeTable].columns.map((x, i) => ({
            id: x + '_' + i,
            name: x,
          }));

          // 3. arrange list of column's ID
          this.columnIds = this.displayedColumns.map((c) => c.id);

          // 4. attach row data to datasource
          this.dataSource = new MatTableDataSource();
          this.dataSource.data = queryResult.datasets[activeTable].rows;
          this.dataSource.sort = this.sort;

          // 5. setup pagination
          this.datatableService.setPageLength(queryResult.total[activeTable]);
          this.pageLength$.next(queryResult.total[activeTable]);
          this.pageIndex$ = 0;

          this.disableResult = false;

          this.cdr.detectChanges();
        } else {
          this.hasResult = false;
        }
      }
    );

    this.store.select(metadatasSelector).subscribe((metadatas) => {
      if (metadatas) {
        this.metadatas = metadatas;

        this.multipleMetadata = {};

        metadatas.forEach((datasetMetadata) => {
          if (!this.multipleMetadata[datasetMetadata.dataset]) {
            this.multipleMetadata[datasetMetadata.dataset] = {};
          }

          datasetMetadata.columns.forEach((metadataColumn) => {
            // console.log('metadataColumn', metadataColumn);
            const tmpMetadata = {
              groupable: false,
              filterable: false,
              datetime: false,
              aggregate: false,
              indexable: false,
              fast_index: false,
            };

            if (metadataColumn.metadata.groupby) {
              tmpMetadata.groupable = true;
            }

            if (metadataColumn.metadata.filterable) {
              tmpMetadata.filterable = true;
            }

            if (metadataColumn.metadata.is_dttm) {
              tmpMetadata.datetime = true;
            }

            if (
              (metadataColumn.metadata.avg ||
                metadataColumn.metadata.min ||
                metadataColumn.metadata.max ||
                metadataColumn.metadata.sum) &&
              !metadataColumn.metadata.is_dttm
            ) {
              tmpMetadata.aggregate = true;
            }

            if (metadataColumn.metadata.indexable) {
              tmpMetadata.indexable = true;
            }

            if (metadataColumn.metadata.fast_index) {
              tmpMetadata.fast_index = true;
            }

            this.multipleMetadata[datasetMetadata.dataset][metadataColumn.columnName] = tmpMetadata;
          });
        });
      }
    });

    combineLatest([
      this.store
        .select(isQueryRequestTriggeredSelector)
        .pipe(skipWhile((isQueryRequestTriggered) => !isQueryRequestTriggered)),
      this.store.select(queryResultSelector).pipe(skipWhile((queryResult) => !queryResult)),
    ]).subscribe(([isQueryRequestTriggered, queryResult]) => {
      if (isQueryRequestTriggered) {
        // console.log('isQueryRequestTriggered', isQueryRequestTriggered);
        // console.log('queryResult', queryResult);
        if (queryResult && queryResult.quid.rowtotal > 0) {
          this.isResultExpanded = true;
          // console.log('this.isResultExpanded', this.isResultExpanded)
        }

        // console.log('SetIsQueryRequestTriggeredSubscribed DP-RESULT-1');
        this.store.dispatch(SetIsQueryRequestTriggeredSubscribed({ id: 'DP-RESULT-1' }));
      }
    });

    combineLatest([
      this.store.select(isResultExpandedSelector).pipe(skipWhile((isResultExpanded) => !isResultExpanded)),
      this.store.select(queryResultSelector).pipe(skipWhile((queryResult) => !queryResult)),
    ]).subscribe(([isResultExpanded, queryResult]) => {
      if (isResultExpanded) {
        if (queryResult && queryResult.quid.rowtotal > 0) {
          this.isResultExpanded = true;
          this.store.dispatch(SetIsResultExpanded({ isResultExpanded: false }));
        }
      }
    });
  }

  ngOnDestroy() {}

  checkLength(obj) {
    return Object.keys(obj).length > 0;
  }

  fiilColumns(col) {
    let rslt = col;
    let type = typeof col;
    if (type == 'object') rslt = JSON.stringify(col);
    return rslt;
  }

  metadataOnChange($event, metadataElement, dataset, columnName: string) {
    const isChecked = $event.checked;

    if (this.metadatas) {
      const filteredMetadatas = this.metadatas.filter((metadata) => metadata.dataset === dataset);
      if (filteredMetadatas && filteredMetadatas.length > 0) {
        const filteredColumns = filteredMetadatas[0].columns.filter((column) => column.columnName === columnName);
        if (filteredColumns && filteredColumns.length > 0) {
          const metadata = { ...filteredColumns[0].metadata };

          if (metadataElement === 'groupable') {
            metadata.groupby = isChecked;
          }

          if (metadataElement === 'filterable') {
            metadata.filterable = isChecked;
          }

          if (metadataElement === 'datetime') {
            metadata.is_dttm = isChecked;
          }

          if (metadataElement === 'aggregate') {
            metadata.avg = isChecked;
            metadata.min = isChecked;
            metadata.max = isChecked;
            metadata.sum = isChecked;
          }

          if (metadataElement === 'indexable') {
            metadata.indexable = isChecked;
          }

          if (metadataElement === 'fast_index') {
            metadata.fast_index = isChecked;
          }

          this.store.dispatch(UpdateMetadata({ dataset, columnName, metadata }));
        }
      }
    } else {
      const metadata = {
        groupby: false,
        filterable: false,
        is_dttm: false,
        avg: false,
        min: false,
        max: false,
        sum: false,
        indexable: false,
        fast_index: false,
      };

      if (metadataElement === 'groupable') {
        metadata.groupby = isChecked;
      }

      if (metadataElement === 'filterable') {
        metadata.filterable = isChecked;
      }

      if (metadataElement === 'datetime') {
        metadata.is_dttm = isChecked;
      }

      if (metadataElement === 'aggregate') {
        metadata.avg = isChecked;
        metadata.min = isChecked;
        metadata.max = isChecked;
        metadata.sum = isChecked;
      }

      if (metadataElement === 'indexable') {
        metadata.indexable = isChecked;
      }

      if (metadataElement === 'fast_index') {
        metadata.fast_index = isChecked;
      }

      this.store.dispatch(SetMetadata({ dataset, columnName, metadata }));
    }
  }

  async onPageChange($event) {
    this.pageIndex$ = $event.pageIndex;
    await this.fetchTableData();
  }

  async fetchTableData() {
    const result: ApiResult = await new Promise((resolve, reject) => {
      this.apiService
        .post('/api/dataset/view', {
          source: this.tableActive,
          quid: this.queryResult.quid.quid,
          size: this.defPageSize,
          skip: this.pageIndex$ * this.defPageSize,
        })
        .subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err),
        });
    });

    if (result && result.status === 'success') {
      this.store.dispatch(SetQueryResult({ queryResult: result.response }));
    }
  }

  parseDate(dateStr) {
    if (isNaN(dateStr)) {
      //Checked for numeric
      var dt = new Date(dateStr);
      if (dateStr && dateStr.length) {
        if (dateStr.length < 9) {
          return false;
        }
      } else {
        return false;
      }

      if (Array.isArray(dateStr)) {
        return false;
      }

      let arr_date = dateStr.split('/');
      if (arr_date.length === 1) {
        arr_date = dateStr.split('-');
        if (arr_date.length <= 1) return false;
      }
      let new_text = arr_date[1] + '/' + arr_date[2] + '/' + arr_date[0];
      let new_text2 = arr_date[0] + '/' + arr_date[1] + '/' + arr_date[2]; //sebelumnya mm/dd/yyyy
      let isDate = new Date(new_text); //m/d/Y
      let isDate2 = new Date(new_text2);
      if (String(isDate) != 'Invalid Date' || String(isDate2) != 'Invalid Date') {
        return true;
      }

      if (dateStr.length > 0) {
        if (dateStr.substring(0, 1) == "'" || dateStr.substring(0, 1) == '"') {
          return false;
        } else if (dateStr.substring(13, 14) === ':' && dateStr.substring(16, 17) === ':') {
          return true;
        } else if (dateStr.substring(10, 11) === 'T' && dateStr.substring(19, 20) === 'Z') {
          return true;
        } else {
          return false;
        }
      }

      if (isNaN(dt.getTime())) {
        //Checked for date
        return false; //Return string if not date.
      } else {
        return true; //Return date **Can do further operations here.
      }
    } else {
      return false; //Return string as it is number
    }
  }

  async showTable(table) {
    this.store.dispatch(SetActiveTable({ activeTable: table.id }));
    this.pageIndex$ = 0;
    await this.fetchTableData();
    this.cdr.detectChanges();
  }

  toggleMetadata() {
    this.isMetadataExpanded = !this.isMetadataExpanded;
  }

  toggleResult() {
    if (this.hasResult || (!this.hasResult && this.isResultExpanded)) {
      this.isResultExpanded = !this.isResultExpanded;
    }
  }

  resizeAccordionResult() {
    if (this.innerHeight == '50vh') {
      this.innerHeight = 'calc(100vh - 125px)';
      this.innerRotate = 0;
    } else {
      this.innerHeight = '50vh';
      this.innerRotate = 180;
    }
  }
}
