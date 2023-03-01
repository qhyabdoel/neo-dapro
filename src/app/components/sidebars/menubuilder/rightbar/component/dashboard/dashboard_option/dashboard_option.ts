import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';
import { menuBuilderSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: 'dashboard_option',
  templateUrl: './dashboard_option.html',
})
export class DashboardOptionComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemto: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  constructor(private store: Store<AppState>) {
    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        this.parameter = res;
      }
    });
  }

  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  refreshDashboard = (event) => {
    let obj = {
      ...event,
      from: findTypeCheckByUrl(),
      action: 'dashboard',
    };
    this.itemto.emit(obj);
  };
}
