import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  static_legend_heatmap,
  static_legend_orient,
  static_legend_type,
} from 'src/app/libs/helpers/constant_datavisualization';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: 'chart_legend',
  templateUrl: './chart_legend.html',
})
export class ChartLegendComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  list_legend_type: Array<any> = static_legend_type;
  list_legend_heatmap: Array<any> = static_legend_heatmap;
  list_legend_orient: Array<any> = static_legend_orient;
  constructor() {}

  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };

  setPosition(value) {
    this.onChange.emit({ name: 'legend_position', value: value, type: 'input' });
  }
}
