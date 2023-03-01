import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { static_active_tabs_sort } from '../helperChartOptions';
import { static_dist_bar_sorter } from 'src/app/libs/helpers/constant_datavisualization';
@Component({
  selector: 'chart_sort',
  templateUrl: './chart_sort.html',
})
export class ChartSortComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  toggleSort: Array<any> = static_active_tabs_sort;
  active = false;

  list_dist_bar_sorter: Array<any> = static_dist_bar_sorter;
  constructor() {}

  ngOnInit() {
    this.active = this.form_data.order_desc;
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };
  handleActiveTab = (event) => {
    this.active = event;
  };
}
