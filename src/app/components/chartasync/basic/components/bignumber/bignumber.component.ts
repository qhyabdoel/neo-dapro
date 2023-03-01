import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'big-number-component',
  templateUrl: './bignumber.component.html',
})
export class ChartBigNumberComponent {
  filter: string;
  constructor() {}
  @Input() myChartID: string;
  @Input() explore: any;
  @Input() chartOption: any;
  @Input() filterCheckboxList: any;
  @Input() exploreJson: any;
  @Output() handleFilterGeneralChart: EventEmitter<any> = new EventEmitter<any>();

  handleFilter = () => {
    if (this.exploreJson.form_data.chart_on_click) {
      let extraFilter = [];
      if (this.filter !== this.exploreJson.form_data.filter_item) {
        this.filter = this.exploreJson.form_data.filter_item;
        extraFilter.push({
          col: this.exploreJson.form_data.filter_item,
          op: 'in',
          val: [this.exploreJson.form_data.filter_label],
        });
      } else {
        this.filter = '';
      }
      this.handleFilterGeneralChart.emit(extraFilter);
    }
  };
}
