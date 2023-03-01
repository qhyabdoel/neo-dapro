import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { static_y_axis_format } from 'src/app/libs/helpers/constant_datavisualization';

@Component({
  selector: 'dual_axis',
  templateUrl: './dual_axis.html',
})
export class DualAxisComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  list_y_axis_format: Array<any> = static_y_axis_format;
  constructor() {}

  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };

  onInputChange = (event, name) => {
    this.handleChange({ name: name, value: event, type: 'input' });
  };
}
