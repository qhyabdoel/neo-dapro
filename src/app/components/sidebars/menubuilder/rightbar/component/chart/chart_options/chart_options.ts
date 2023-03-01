import { Component, OnInit, Output, EventEmitter, Input, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  formDataChartSelector,
  sharedChartDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'chart_options',
  templateUrl: './chart_options.html',
})
export class ChartOptionsComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleChangeFormData: EventEmitter<any> = new EventEmitter<any>();
  @Output() runQuery: EventEmitter<any> = new EventEmitter<any>();
  form_data: any;
  visualType: string;
  parameter: any = null;
  exploreJson: any;
  explore: any;
  constructor(private store: Store<AppState>, @Inject(DOCUMENT) private document: Document) {
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          // this.sharedData = result;
          this.visualType = result.typeChart;
          this.explore = result.explore;
          this.exploreJson = result.exploreJson;
          this.form_data = result.exploreJson.form_data;
          // this.initFormData();
          // this.changeDetector.detectChanges();
        }
      });
    this.store.select(formDataChartSelector).subscribe((res) => {
      if (res) {
        this.form_data = res;
        this.visualType = res.viz_type;
      }
    });
  }

  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  onChange = (event) => {
    this.handleChangeFormData.emit(event);
  };
  applyQuery = () => {
    this.runQuery.emit();
  };

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
