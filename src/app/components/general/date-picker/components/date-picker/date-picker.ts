import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD/MM/YYYY',
  },
};
@Component({
  selector: 'single-date-picker',
  templateUrl: 'date-picker.html',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SingleDatePickerComponent implements OnChanges {
  @Input() label;
  @Input() value;
  @Input() name;
  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();
  date: string;
  chosenDateHandler(event: MatDatepickerInputEvent<Date>) {
    this.date = moment(event.value).format();
    this.dateChange.emit({ type: this.name, value: event });
  }
  ngOnChanges() {
    this.date = moment(this.value).format();
  }
}
