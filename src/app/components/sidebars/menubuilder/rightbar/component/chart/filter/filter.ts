import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { static_cols } from 'src/app/libs/helpers/constant_datavisualization';
import { sharedChartDataSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from '@angular/common';
import { SetFormData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';

@Component({
  selector: 'filter_chart',
  templateUrl: './filter.html',
})
export class FilterComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  explore: any;
  list_filters: Array<any> = [];
  list_cols: Array<any> = static_cols;
  form_data: any;
  list_filters_form_data: Array<any> = [];
  constructor(
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          this.preparingData(result);
          this.changeDetector.detectChanges();
        }
      });
  }
  preparingData = (res) => {
    this.explore = res.explore;
    this.form_data = res.exploreJson.form_data;
  };
  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  onDelFilters(index) {
    let copyArr = [...this.form_data.filters];
    copyArr.splice(index, 1);
    this.form_data = {
      ...this.form_data,
      filters: copyArr,
    };
    this.store.dispatch(SetFormData({ item: this.form_data }));
  }

  onAddFilters() {
    let copyArr = [...this.form_data.filters];
    copyArr.push({
      col: '',
      op: 'in',
      val: [],
    });
    this.form_data = { ...this.form_data, filters: copyArr };
  }

  addTagFn(val) {
    return val;
  }

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }

  onChange = (event, name, index) => {
    let copyArr = [...this.form_data.filters];
    let obj = copyArr.find((_, i) => i === index);
    if (name === 'value_select') {
      obj = {
        ...obj,
        val: event,
      };
    } else {
      obj = {
        ...obj,
        [name]: event.target.value,
      };
    }

    copyArr = copyArr.map((data, i) => {
      if (i === index) {
        data = obj;
      }
      return data;
    });
    this.form_data = {
      ...this.form_data,
      filters: copyArr,
    };
    this.changeDetector.detectChanges();
    this.store.dispatch(SetFormData({ item: this.form_data }));
  };

  handleTitle = (label, index) => {
    return `${label} ${index + 1}`;
  };
}
