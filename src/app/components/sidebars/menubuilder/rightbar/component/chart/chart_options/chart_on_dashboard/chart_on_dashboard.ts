import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { GetDashboardList } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { dashboardListSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: 'chart_on_dashboard',
  templateUrl: './chart_on_dashboard.html',
})
export class ChartOnDashboardComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Input() explore;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  dashboardList: Array<any> = [];
  parameter: any = null;
  constructor(private store: Store<AppState>) {
    this.store
      .select(dashboardListSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.dashboardList = result.response;
        }
      });
  }

  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
    this.store.dispatch(GetDashboardList());
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };

  handleSelect = (name, event, type) => {
    switch (name) {
      case 'link_to':
        this.onChange.emit({ name, value: event.slug, type });
        break;
      case 'filter_item':
        this.onChange.emit({ name, value: event.value.value, type });
        break;
      case 'chart_on_click_col':
        this.onChange.emit({ name, value: event, type });
        break;
      default:
        break;
    }
  };
}
