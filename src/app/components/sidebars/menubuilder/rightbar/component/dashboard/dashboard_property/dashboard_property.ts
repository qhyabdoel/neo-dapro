import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/libs/services';
import {
  DeleteChartDashboard,
  GetDashboardList,
  SetInsertChartDashboard,
  SetMenuBuilderDetail,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { chartListSelector, menuBuilderSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { setWorkspaceData } from 'src/app/pages/pds/datavisualization/editor-visualization/helper.editor.visualization';

@Component({
  selector: 'dashboard_property',
  templateUrl: './dashboard_property.html',
})
export class DashboardPropertyComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();

  parameter: any = null;
  chartList: Array<any> = [];
  chartSelected: Array<any> = [];
  constructor(
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private service: ApiService,
    private route: Router
  ) {
    this.store
      .select(chartListSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.chartList = result.response;
          this.changeDetector.detectChanges();
        }
      });
    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        this.preparingData(res);
        this.changeDetector.detectChanges();
      }
    });
  }

  preparingData = (res) => {
    this.parameter = res;
    this.chartSelected = res.charts;
    this.changeDetector.detectChanges();
  };
  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  delete = async () => {
    let url = '/api/dashboard/delete?id=' + this.parameter.id;
    await this.service.getApi(url, true);
    this.emptyVariable();
    this.route.navigate(['/pds/dashboardeditor'], {
      queryParams: {},
    });
    this.store.dispatch(SetMenuBuilderDetail({ item: setWorkspaceData(null) }));
    this.store.dispatch(GetDashboardList());
  };
  emptyVariable = () => {
    this.chartSelected = [];
  };

  onChartDeleteInSelect = (item) => {
    const chartID = item.value.id || item.value.myChartID;
    this.store.dispatch(DeleteChartDashboard({ item: { value: { id: chartID } } }));
  };
  loadChartTo = (item) => {
    this.store.dispatch(SetInsertChartDashboard({ item }));
  };
  buttonNew = () => {
    this.route.navigate(['/pds/dashboardeditor']);
    this.store.dispatch(SetMenuBuilderDetail({ item: setWorkspaceData(null) }));
  };
}
