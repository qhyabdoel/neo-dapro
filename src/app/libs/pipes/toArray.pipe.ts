import { Pipe, PipeTransform } from '@angular/core';
import * as _moment from 'moment';

@Pipe({
  name: 'toArray'
})
export class ToArrayPipe implements PipeTransform {
  transform(value: any): any{
    console.log(value, Object.keys(value));
    return Object.keys(value);
   }
}
