import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { JsonService, TranslationService } from 'src/app/libs/services';
import {
  staticfilterDateList,
  staticfilterDateTypeList,
  staticinitialFilterDateList,
  static_time_grain_sqla,
} from 'src/app/libs/helpers/constant_datavisualization';
import {
  formDataChartSelector,
  sharedChartDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from '@angular/common';
import { SetFormData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';

@Component({
  selector: 'time_chart',
  templateUrl: './time.html',
})
export class TimeComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  visualType: string;
  explore: any;
  exploreJson: any;
  list_time_grain_sqla;
  messages: any;
  form_data: any;

  filterDateList: any = [];
  filterDateTypeList: any = [];
  initialDateFilterList: Array<any> = [];

  constructor(
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private translationService: TranslationService,
    private jsonService: JsonService,
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
    this.store.select(formDataChartSelector).subscribe((res) => {
      if (res) {
        this.form_data = res;
        this.visualType = res.viz_type;
      }
    });
  }
  preparingData = async (res) => {
    this.explore = await res.explore;
    this.exploreJson = await res.exploreJson;
    this.form_data = await res.exploreJson.form_data;
    this.visualType = res.typeChart;
  };

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.list_time_grain_sqla = static_time_grain_sqla(this.messages);
    this.filterDateList = staticfilterDateList(this.messages);
    this.filterDateTypeList = staticfilterDateTypeList(this.messages);
    this.initialDateFilterList = staticinitialFilterDateList;
    this.form_data = this.form_data;
    this.explore = this.explore;
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  setPicker(event: MatDatepickerInputEvent<Date>, type) {
    switch (type) {
      case 'since':
        this.form_data = { ...this.form_data, since: moment(event.value).format() };
        break;
      case 'until':
        this.form_data = { ...this.form_data, until: moment(event.value).format() };
        break;
    }
    this.store.dispatch(SetFormData({ item: this.form_data }));
  }

  handleDatePicker(event) {
    switch (event.type) {
      case 'since':
        this.form_data = { ...this.form_data, since: moment(event.value.value).format() };
        break;
      case 'until':
        this.form_data = { ...this.form_data, until: moment(event.value.value).format() };
        break;
    }
    this.store.dispatch(SetFormData({ item: this.form_data }));
  }

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
  onChange = (event) => {
    const { type, value, name } = event;
    switch (type) {
      case 'select':
      case 'select_specific_object':
        if (
          value.target.value === 'current_date' ||
          value.target.value === 'custom_date' ||
          value.target.value === 'latest_date' ||
          value.target.value === ''
        ) {
          this.form_data = {
            ...this.form_data,
            [name]: value.target.value,
            since: null,
            until: null,
          };
        } else {
          this.form_data = {
            ...this.form_data,
            [name]: value.target.value,
          };
        }

        break;
      default:
        break;
    }
    this.store.dispatch(SetFormData({ item: this.form_data }));
  };
}
