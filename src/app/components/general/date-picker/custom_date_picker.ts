import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;
@Component({
  selector: 'custom_date_picker_component',
  templateUrl: './custom_date_picker.html',
})
export class CustomDatePickerComponent implements OnInit {
  @Input() filter_date;
  @Input() date_type;
  @Output() setState: EventEmitter<any> = new EventEmitter<any>();
  /**
   * have 2 type
   * single or dynamic date picker
   */
  @Input() type;
  @Input() title;
  @Input() name;
  @Input() value1;
  @Input() value2;
  format_date: string;
  date = new FormControl(new Date());
  ngOnInit() {
    this.date = new FormControl(new Date(this.value1));
    this.initialLoadForm();
  }

  initialLoadForm = () => {
    switch (this.date_type) {
      case 'year':
        this.format_date = 'yyyy';
        return 'multi-year';

      case 'month':
        this.format_date = 'MM/yyyy';
        return 'year';
      case 'date':
        this.format_date = 'dd/MM/yyyy';
        return 'month';

      default:
        break;
    }
  };

  addEvent(event, type) {
    this.setState.emit({ type: type, value: moment(event.value).format(this.format_date), name: this.name });
  }

  handleLabel = (date_type, type) => {
    switch (type) {
      case 'since':
        return `${this.filter_date === 'date_picker' ? 'End' : 'Start'} ${
          date_type[0].toUpperCase() + date_type.slice(1)
        }`;
        break;
      case 'until':
        return `End ${date_type[0].toUpperCase() + date_type.slice(1)}`;
        break;
    }
  };
  handlePicker = (event) => {
    this.setState.emit({
      type: event.type,
      value: moment(event.value.value).format(),
      name: this.name,
    });
  };
}
