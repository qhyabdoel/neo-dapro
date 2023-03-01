import { Component, OnInit, Input, Output } from '@angular/core';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import moment from 'moment';

@Component({
    selector: 'pq-datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.scss']
})

export class DatepickerComponent implements OnInit {
    startDate: any;
    endDate: any;
    untilDateFC = new FormControl(moment());

    ngOnInit() {}

    yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
        this.endDate = chosenDate;
        datepicker.close();
    }

    datePickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type:string) {
        if (type === 'start') this.startDate = chosenDate;
        else if (type === 'end') this.endDate = chosenDate;
        datepicker.close();
    }
}
  