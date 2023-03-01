import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  staticfontFamilyList,
  static_display_view_table_chart_options,
  static_y_axis_format,
} from 'src/app/libs/helpers/constant_datavisualization';
import { formDataChartSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { static_custom_display, static_custom_display_for_table } from '../helperChartOptions';

@Component({
  selector: 'custom_display',
  templateUrl: './custom_display.html',
})
export class CustomDisplayComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  list_y_axis_format: Array<any> = static_y_axis_format;
  listField: Array<any> = [];
  fontFamilyList: Array<any>;
  static_display_view_table: Array<any> = [];
  listFieldForTable: Array<any> = [];
  form_data: any;
  visualType: string;
  tableType: string;
  constructor(private store: Store<AppState>) {
    this.store.select(formDataChartSelector).subscribe((res) => {
      if (res) {
        this.form_data = res;
        this.visualType = res.viz_type;
        if (this.visualType === 'table' && this.static_display_view_table.length === 0) {
          this.static_display_view_table = static_display_view_table_chart_options(this.form_data);
        }
        this.tableType = res.display_view_table;
        this.updatePage();
      }
    });
  }

  ngOnInit() {
    this.intialPage();
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };
  
  intialPage = () => {
    this.fontFamilyList = staticfontFamilyList;
  };

  updatePage = () => {
    this.listField = static_custom_display(this.form_data);
    if (this.visualType === 'table') {
      this.static_display_view_table = static_display_view_table_chart_options(this.form_data);
      this.listFieldForTable = static_custom_display_for_table(this.form_data);
    }
  }
  
  setBorderPosition(value) {
    this.onChange.emit({ name: 'border_position', value: value, type: 'input' });
  }
}
