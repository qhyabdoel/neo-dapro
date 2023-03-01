import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  static_gauge_label_type,
  static_label_position_pie_chart_options,
  static_pie_label_type,
} from 'src/app/libs/helpers/constant_datavisualization';
import { sharedChartDataSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { static_chart_label_bar } from '../helperChartOptions';

@Component({
  selector: 'chart_label',
  templateUrl: './chart_label.html',
})
export class ChartLabelComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  looping_input_label: Array<any> = [];
  list_label_type: Array<any> = [];
  list_pie_label_position: Array<any> = [];
  constructor(private store: Store<AppState>) {
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          this.visualType = result.typeChart;
          this.intialPage();
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
    switch (this.visualType) {
      case 'gauge':
        this.list_label_type = static_gauge_label_type;
        break;
      case 'pie':
      case 'sunburst':
        this.list_pie_label_position =
          !this.list_pie_label_position || this.list_pie_label_position.length === 0
            ? static_label_position_pie_chart_options(this.form_data)
            : this.list_pie_label_position;
        this.list_label_type = static_pie_label_type;
        break;

      default:
        this.looping_input_label = static_chart_label_bar(this.form_data);
        break;
    }
  };
  setPosition(name, value) {
    this.onChange.emit({ name: name, value: value, type: 'input' });
  }
}
