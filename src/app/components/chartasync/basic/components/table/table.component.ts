import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { parseDate } from 'src/app/libs/helpers/data-visualization-helper';
import { convert_metric_to_verbose } from 'src/app/libs/helpers/utility';
import { SetFormData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { AppState } from 'src/app/libs/store/states';
import { getColumnColor } from '../../helper/helperTable';
import { handleSearchFilter } from './helperChartTable';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';

@Component({
  selector: 'table-component',
  templateUrl: './table.component.html',
})
export class ChartTableComponent {
  @Input() myChartID: string;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() chartOption: any;
  @Input() since: any;
  @Input() until: any;
  @Input() tableColumnsList: any;
  @Input() dataSource: any;
  @Input() viewColumnTable: any;
  @Input() displayedColumns: any;
  @Input() searchMultiCols: any;
  @Input() displayGrid: any;
  @Input() pagelength: any;
  @Input() myHtml: any;
  // @Input() searchTableValue: any;
  @Input() realRecords: any;
  @Output() handleGenerate: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleSetData: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleChangePage: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleFilterGeneralChart: EventEmitter<any> = new EventEmitter<any>();
  
  isSortTable: any;
  sortObj: any;
  pageIndex: any;
  searchTableValue: any;
  typePage = findTypeCheckByUrl();
  filterObj: any;

  constructor(private store: Store<AppState>) {}
  applyFilter = async (event, type) => {
    this.searchTableValue = event.target.value.trim();
    let filters = [];
    let columnDateList = [];
    for (const [key, value] of Object.entries(this.exploreJson.data.records[0])) {
      let isColUtc = parseDate(value);
      if (isColUtc) columnDateList.push(key);
    }
    if (type === 'search_box') {
      for (var i = 0; i < this.displayedColumns.length; i++) {
        filters = handleSearchFilter(
          type,
          filters,
          columnDateList,
          this.searchTableValue,
          this.displayedColumns,
          this.explore,
          0,
          i
        );
      }
    } else {
      for (const [key, value] of Object.entries(this.searchMultiCols)) {
        filters = handleSearchFilter(type, filters, columnDateList, value, this.displayedColumns, this.explore, key);
      }
    }

    let form_data = {
      ...this.exploreJson.form_data,
      page_index: 1,
      search_filter: {
        filter_operator: type === 'search_box' ? 'or' : 'and',
        filters: filters,
      },
    };
    this.handleGenerate.emit(form_data);
  };

  setState = (event) => {
    this.handleSetData.emit(event);
  };

  handleToggleTableColumn(index, colName, colClass) {
    let removeColIndex = this.displayedColumns.indexOf(colName);
    let copyArr = [...this.displayedColumns];
    if (removeColIndex > -1) {
      copyArr.splice(removeColIndex, 1);
      $('#ToggleBtn-' + colClass).addClass('active');
    } else {
      copyArr.splice(index, 0, colName);
      copyArr.join();
      $('#ToggleBtn-' + colClass).removeClass('active');
    }
    this.displayedColumns = copyArr;
  }

  async sortData(event: any) {
    this.isSortTable = true;
    this.sortObj = { column: event.active, order: event.direction };

    if (event.direction === '' && this.explore.form_data.table_filter_column !== '') {
      this.sortObj = {
        column: this.explore.form_data.table_filter_column,
        order: this.explore.form_data.table_sort_desc ? 'desc' : 'asc',
      };
    }

    let form_data = {
      ...this.exploreJson.form_data,
      page_index: this.pageIndex,
      page_sort: [this.sortObj],
    };
    this.store.dispatch(SetFormData({ item: form_data }));
    this.handleGenerate.emit(form_data);
  }

  setColumnName(val: string) {
    return convert_metric_to_verbose(val, this.explore);
  }

  mergeStyle = (cellStyle: any, column: string, rowIndex: number) => {
    const columnStyles = this.exploreJson.form_data.column_styles;
    const row = this.realRecords[rowIndex];
    const color = getColumnColor(row, column, columnStyles);

    return color ? { ...cellStyle, color } : cellStyle;
  };

  // onChangePage=(event)=>{
  //   this.handleChangePage.emit(event);
  // }

  async onChangePage(event: any) {
    this.pageIndex = event.pageIndex + 1;

    let form_data = {
      ...this.exploreJson.form_data,
      page_size: event.pageSize,
      page_index: this.pageIndex,
      page_sort: [this.sortObj],
    };
    this.store.dispatch(SetFormData({ item: form_data }));
    this.handleGenerate.emit(form_data);
  }

  handleFilterByClick(row:any, col:any) {
    let extraFilter = [];

    const findExtraFilterObj = this.filterObj?.col 
      ? this.exploreJson.form_data.extra_filters.find(
          obj => obj.coll === this.filterObj.obj && obj.val === this.filterObj.val
        ) 
      : false;

    if (!findExtraFilterObj) {
      if (this.exploreJson.form_data.chart_on_click) {
        let specificColumn:any;
  
        if (
          this.exploreJson.form_data.chart_on_click_specific_col && 
          this.exploreJson.form_data.chart_on_click_col
        ) {
          specificColumn = this.exploreJson.form_data.chart_on_click_col;
        } else {
          specificColumn = col;
        }
        
        const extraFilterObj = {
          col: specificColumn,
          op: '==',
          val: row[specificColumn],
        };

        extraFilter.push(extraFilterObj);

        this.filterObj = extraFilterObj;
      }
    } else {
      this.filterObj = false;
    }

    this.handleFilterGeneralChart.emit(extraFilter);
  }
}
