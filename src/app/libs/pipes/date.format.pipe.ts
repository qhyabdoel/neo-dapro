import { format } from 'timeago.js';
import { Pipe, PipeTransform } from '@angular/core';
import * as _moment from 'moment';

@Pipe({
  name: 'dateformat'
})
export class DateFormatPipe implements PipeTransform {
  //fieldName : datetime
  //format : "DD-MMM-YY" dsb
  transform(fieldName: any, myformat: any): any{
    if(myformat != null) {
      var date = new Date(fieldName);
      return _moment(date).format(myformat);
     } 
    return format(fieldName);
   }
}
