import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import * as _moment from 'moment';

@Pipe({
  name: 'typeofdata'
})
export class GetTypeDataPipe implements PipeTransform {
  //fieldName : datetime
  //format : "DD-MMM-YY" dsb
  transform(value: any): any{
    var isNumber = !(Number.isNaN(Number(value)));
    var utc = _moment(value, "YYYY-MM-DDTHH:mm:ssZ", true)
    var isUTC = utc.isValid();
    // console.log(isUTC);
    if(isNumber){
        return formatNumber(value,'id','0.0-0');
    }
    
    if(isUTC){
       return _moment(value).format('DD MMM YYYY');
    }
   }
}
